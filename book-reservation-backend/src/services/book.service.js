const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { withTransaction } = require('../utils/transaction');
const { escapeLike } = require('../utils/sql');

const duplicateIsbn = () =>
  new AppError(409, 'A book with this ISBN already exists.', [
    { field: 'isbn', message: 'This ISBN is already in the inventory.' },
  ]);

async function listBooks({ search, category, availableOnly, page, limit }) {
  const where = [];
  const params = [];

  if (search) {
    const like = `%${escapeLike(search)}%`;
    where.push('(title LIKE ? OR author LIKE ? OR isbn LIKE ?)');
    params.push(like, like, like);
  }
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (availableOnly) where.push('available_copies > 0');

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM books ${clause}`, params);
  const [rows] = await pool.query(
    `SELECT id, isbn, title, author, category, total_copies, available_copies, created_at, updated_at
       FROM books ${clause}
      ORDER BY title
      LIMIT ? OFFSET ?`,
    [...params, limit, (page - 1) * limit]
  );

  return { total: Number(countRows[0].total), rows };
}

// Single book, plus how many copies are currently reserved / issued
async function getBookById(id) {
  const [rows] = await pool.query(
    `SELECT b.id, b.isbn, b.title, b.author, b.category, b.total_copies, b.available_copies,
            b.created_at, b.updated_at,
            (SELECT COUNT(*) FROM reservations r WHERE r.book_id = b.id AND r.status = 'Reserved') AS reserved_count,
            (SELECT COUNT(*) FROM reservations r WHERE r.book_id = b.id AND r.status = 'Issued')   AS issued_count
       FROM books b
      WHERE b.id = ?`,
    [id]
  );
  if (!rows[0]) return null;
  return { ...rows[0], reserved_count: Number(rows[0].reserved_count), issued_count: Number(rows[0].issued_count) };
}

async function createBook(input) {
  try {
    const [result] = await pool.query(
      `INSERT INTO books (isbn, title, author, category, total_copies, available_copies)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.isbn, input.title, input.author, input.category, input.total_copies, input.total_copies]
    );
    return await getBookById(result.insertId);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw duplicateIsbn();
    throw err;
  }
}

/**
 * Update a book. If total_copies changes, available_copies is recalculated from the number of
 * copies that are in use, inside a transaction with the book row locked, so it can't clash with
 * a reservation being processed at the same time.
 */
async function updateBook(id, changes) {
  try {
    await withTransaction(async (conn) => {
      const [rows] = await conn.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [id]);
      const book = rows[0];
      if (!book) throw new AppError(404, 'Book not found.');

      const next = {
        isbn: changes.isbn ?? book.isbn,
        title: changes.title ?? book.title,
        author: changes.author ?? book.author,
        category: changes.category !== undefined ? changes.category : book.category,
        total_copies: changes.total_copies ?? book.total_copies,
      };

      const inUse = book.total_copies - book.available_copies; // reserved + issued
      if (next.total_copies < inUse) {
        throw new AppError(
          409,
          `${inUse} ${inUse === 1 ? 'copy is' : 'copies are'} currently reserved or issued, so total_copies cannot be lower than ${inUse}.`,
          [{ field: 'total_copies', message: `Minimum allowed right now is ${inUse}.` }]
        );
      }
      const available = next.total_copies - inUse;

      await conn.query(
        `UPDATE books
            SET isbn = ?, title = ?, author = ?, category = ?, total_copies = ?, available_copies = ?
          WHERE id = ?`,
        [next.isbn, next.title, next.author, next.category, next.total_copies, available, id]
      );
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw duplicateIsbn();
    throw err;
  }
  return getBookById(id);
}

module.exports = { listBooks, getBookById, createBook, updateBook };
