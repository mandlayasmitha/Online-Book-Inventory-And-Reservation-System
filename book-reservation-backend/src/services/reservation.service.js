const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { withTransaction } = require('../utils/transaction');
const { MAX_ACTIVE_PER_MEMBER } = require('../config/rules');

/*
 * HOW AVAILABILITY STAYS CONSISTENT
 *   available_copies = total_copies - (Reserved + Issued)
 *
 * Every change to that number happens inside ONE transaction that
 *   1. locks the rows involved (member -> book -> reservation, always in this order),
 *   2. re-checks the rules on the locked, up-to-date rows,
 *   3. changes available_copies with a guarded UPDATE (WHERE available_copies > 0 / < total_copies),
 *   4. writes the reservation change,
 * and commits all of it together or none of it. See README for the full explanation.
 */

const SELECT_RESERVATION = `
  SELECT r.id, r.status, r.reserved_at, r.issued_at, r.due_date, r.returned_at, r.cancelled_at,
         (r.status = 'Issued' AND r.due_date < CURDATE()) AS is_overdue,
         CASE
           WHEN r.status = 'Issued'   AND r.due_date < CURDATE() THEN DATEDIFF(CURDATE(), r.due_date)
           WHEN r.status = 'Returned' THEN GREATEST(DATEDIFF(DATE(r.returned_at), r.due_date), 0)
           ELSE 0
         END AS days_overdue,
         b.id AS book_id, b.title AS book_title, b.author AS book_author, b.isbn,
         m.id AS member_id, m.name AS member_name, m.email AS member_email
    FROM reservations r
    JOIN books   b ON b.id = r.book_id
    JOIN members m ON m.id = r.member_id`;

function present(row) {
  if (!row) return null;
  return { ...row, is_overdue: Boolean(row.is_overdue), days_overdue: Number(row.days_overdue) };
}

async function getReservationById(id) {
  const [rows] = await pool.query(`${SELECT_RESERVATION} WHERE r.id = ?`, [id]);
  return present(rows[0]);
}

async function listReservations({ status, member_id, book_id, overdueOnly }) {
  const where = [];
  const params = [];
  if (status) { where.push('r.status = ?'); params.push(status); }
  if (member_id) { where.push('r.member_id = ?'); params.push(member_id); }
  if (book_id) { where.push('r.book_id = ?'); params.push(book_id); }
  if (overdueOnly) where.push("r.status = 'Issued' AND r.due_date < CURDATE()");

  const [rows] = await pool.query(
    `${SELECT_RESERVATION} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY r.id DESC`,
    params
  );
  return rows.map(present);
}

// ---------- shared helpers ----------

// Lock the book, then the reservation (book first, always), and return the fresh reservation row.
async function lockReservation(conn, id) {
  const [pre] = await conn.query('SELECT book_id FROM reservations WHERE id = ?', [id]);
  if (!pre[0]) throw new AppError(404, 'Reservation not found.');
  const bookId = pre[0].book_id; // never changes, so a slightly old read is fine

  await conn.query('SELECT id FROM books WHERE id = ? FOR UPDATE', [bookId]);
  const [rows] = await conn.query('SELECT * FROM reservations WHERE id = ? FOR UPDATE', [id]);
  return { reservation: rows[0], bookId };
}

// A copy comes back to the shelf. Guarded so the count can never exceed total_copies.
async function releaseCopy(conn, bookId) {
  const [result] = await conn.query(
    'UPDATE books SET available_copies = available_copies + 1 WHERE id = ? AND available_copies < total_copies',
    [bookId]
  );
  if (result.affectedRows !== 1) {
    throw new AppError(500, 'Inventory counts for this book are inconsistent. The change was not saved; please contact an administrator.');
  }
}

function wrongState(action, status, hint = '') {
  return new AppError(409, `Cannot ${action} a reservation that is ${status.toLowerCase()}.${hint}`);
}

// ---------- operations ----------

/** Reserve a copy: holds one copy for the member. */
async function reserveBook({ book_id, member_id }) {
  let reservationId;
  try {
    reservationId = await withTransaction(async (conn) => {
      const [members] = await conn.query('SELECT id, name, is_active FROM members WHERE id = ? FOR UPDATE', [member_id]);
      const member = members[0];
      if (!member) throw new AppError(404, 'Member not found.');
      if (!member.is_active) throw new AppError(403, 'This member account is inactive and cannot reserve books.');

      const [books] = await conn.query('SELECT id, title FROM books WHERE id = ? FOR UPDATE', [book_id]);
      const book = books[0];
      if (!book) throw new AppError(404, 'Book not found.');

      const [dup] = await conn.query(
        "SELECT id FROM reservations WHERE book_id = ? AND member_id = ? AND status IN ('Reserved', 'Issued')",
        [book_id, member_id]
      );
      if (dup.length) {
        throw new AppError(409, `${member.name} already has an active reservation for "${book.title}".`);
      }

      const [counts] = await conn.query(
        "SELECT COUNT(*) AS active FROM reservations WHERE member_id = ? AND status IN ('Reserved', 'Issued')",
        [member_id]
      );
      if (Number(counts[0].active) >= MAX_ACTIVE_PER_MEMBER) {
        throw new AppError(409, `A member can hold at most ${MAX_ACTIVE_PER_MEMBER} books at a time (reserved + issued).`);
      }

      // Atomic, guarded decrement: succeeds only if a copy is really left.
      const [hold] = await conn.query(
        'UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0',
        [book_id]
      );
      if (hold.affectedRows !== 1) {
        throw new AppError(409, `No copies of "${book.title}" are available right now.`);
      }

      const [inserted] = await conn.query(
        "INSERT INTO reservations (book_id, member_id, status) VALUES (?, ?, 'Reserved')",
        [book_id, member_id]
      );
      return inserted.insertId;
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'This member already has an active reservation for this book.');
    }
    throw err;
  }
  return getReservationById(reservationId);
}

/** Cancel a reservation that has not been issued yet. The copy goes back on the shelf. */
async function cancelReservation(id) {
  await withTransaction(async (conn) => {
    const { reservation, bookId } = await lockReservation(conn, id);
    if (reservation.status !== 'Reserved') {
      throw wrongState('cancel', reservation.status, reservation.status === 'Issued' ? ' Return the book instead.' : '');
    }
    await conn.query("UPDATE reservations SET status = 'Cancelled', cancelled_at = NOW() WHERE id = ?", [id]);
    await releaseCopy(conn, bookId);
  });
  return getReservationById(id);
}

/** Hand the reserved book to the member: records the issue date and due date. Availability does not change. */
async function issueReservation(id, loanDays) {
  await withTransaction(async (conn) => {
    const { reservation } = await lockReservation(conn, id);
    if (reservation.status !== 'Reserved') {
      throw wrongState('issue', reservation.status, reservation.status === 'Issued' ? ' It has already been issued.' : '');
    }
    await conn.query(
      "UPDATE reservations SET status = 'Issued', issued_at = NOW(), due_date = DATE_ADD(CURDATE(), INTERVAL ? DAY) WHERE id = ?",
      [loanDays, id]
    );
  });
  return getReservationById(id);
}

/** Member brings the book back: records the return date and puts the copy back on the shelf. */
async function returnReservation(id) {
  await withTransaction(async (conn) => {
    const { reservation, bookId } = await lockReservation(conn, id);
    if (reservation.status !== 'Issued') {
      throw wrongState('return', reservation.status, reservation.status === 'Reserved' ? ' Issue the book first.' : '');
    }
    await conn.query("UPDATE reservations SET status = 'Returned', returned_at = NOW() WHERE id = ?", [id]);
    await releaseCopy(conn, bookId);
  });
  return getReservationById(id);
}

module.exports = {
  getReservationById, listReservations,
  reserveBook, cancelReservation, issueReservation, returnReservation,
};
