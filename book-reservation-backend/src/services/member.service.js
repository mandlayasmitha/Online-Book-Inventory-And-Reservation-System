const pool = require('../config/db');

// Read-only list so a client can pick a member. Full member management belongs to the users module.
async function listMembers() {
  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.email, m.is_active,
            (SELECT COUNT(*) FROM reservations r
              WHERE r.member_id = m.id AND r.status IN ('Reserved', 'Issued')) AS active_reservations
       FROM members m
      ORDER BY m.name`
  );
  return rows.map((r) => ({ ...r, is_active: Boolean(r.is_active), active_reservations: Number(r.active_reservations) }));
}

module.exports = { listMembers };
