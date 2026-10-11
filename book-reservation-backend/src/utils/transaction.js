const pool = require('../config/db');

const RETRYABLE = ['ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'];

/**
 * Runs work(conn) inside a database transaction.
 *  - commit if work succeeds
 *  - rollback if it throws (so a half-finished reservation can never be saved)
 *  - always release the connection
 *  - if MySQL aborts the transaction because of a deadlock or lock timeout, try again
 *    (the work function is re-run from the start on a fresh transaction)
 */
async function withTransaction(work, { retries = 2 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await work(conn);
      await conn.commit();
      return result;
    } catch (err) {
      try {
        await conn.rollback();
      } catch (_) {
        /* connection already gone */
      }
      if (RETRYABLE.includes(err.code) && attempt < retries) continue;
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = { withTransaction };
