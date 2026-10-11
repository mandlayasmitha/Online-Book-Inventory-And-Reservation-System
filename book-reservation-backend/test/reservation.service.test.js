// Tests the reservation business logic against a FAKE database connection.
// They check the order of operations, rollbacks and error codes. They cannot prove MySQL's
// locking works - use `npm run concurrency-check` against the real database for that.
const test = require('node:test');
const assert = require('node:assert');

const dbPath = require.resolve('../src/config/db');
const state = { handlers: [], calls: [], params: [], events: [] };
const norm = (sql) => sql.replace(/\s+/g, ' ').trim();

async function run(sql, params) {
  const q = norm(sql);
  state.calls.push(q);
  state.params.push(params);
  for (const h of state.handlers) {
    if (h.re.test(q)) return h.reply(params, q);
  }
  throw new Error(`Unhandled SQL in test: ${q}`);
}
const conn = {
  query: run,
  beginTransaction: async () => state.events.push('begin'),
  commit: async () => state.events.push('commit'),
  rollback: async () => state.events.push('rollback'),
  release: () => state.events.push('release'),
};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { query: run, getConnection: async () => conn } };

const service = require('../src/services/reservation.service');

const setup = (handlers) => Object.assign(state, { handlers, calls: [], params: [], events: [] });
const rows = (r) => () => [r];
const hit = (re) => state.calls.some((c) => re.test(c));
const idx = (re) => state.calls.findIndex((c) => re.test(c));

const FETCH = { re: /FROM reservations r JOIN books b/, reply: rows([{ id: 9, status: 'X', is_overdue: 0, days_overdue: '0', due_date: '2026-10-30' }]) };

function reserveHandlers(over = {}) {
  return [
    { re: /FROM members WHERE id = \? FOR UPDATE/, reply: over.member || rows([{ id: 1, name: 'Ravi', is_active: 1 }]) },
    { re: /FROM books WHERE id = \? FOR UPDATE/, reply: over.book || rows([{ id: 2, title: 'Clean Code' }]) },
    { re: /^SELECT id FROM reservations WHERE book_id/, reply: over.dup || rows([]) },
    { re: /^SELECT COUNT\(\*\) AS active/, reply: over.count || rows([{ active: 0 }]) },
    { re: /UPDATE books SET available_copies = available_copies - 1/, reply: over.hold || (() => [{ affectedRows: 1 }]) },
    { re: /^INSERT INTO reservations/, reply: over.insert || (() => [{ insertId: 9, affectedRows: 1 }]) },
    FETCH,
  ];
}

// ---------- reserve ----------
test('reserve: locks member then book, holds a copy, inserts, commits', async () => {
  setup(reserveHandlers());
  const result = await service.reserveBook({ book_id: 2, member_id: 1 });
  assert.strictEqual(result.id, 9);
  assert.deepStrictEqual(state.events, ['begin', 'commit', 'release']);
  assert.ok(idx(/FROM members .* FOR UPDATE/) < idx(/FROM books .* FOR UPDATE/), 'member locked before book');
  assert.ok(idx(/available_copies - 1/) < idx(/^INSERT INTO reservations/), 'copy held before insert');
});

test('reserve: no copies left -> 409, nothing inserted, rolled back', async () => {
  setup(reserveHandlers({ hold: () => [{ affectedRows: 0 }] }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 409 && /No copies/.test(e.message));
  assert.ok(!hit(/^INSERT INTO reservations/));
  assert.deepStrictEqual(state.events, ['begin', 'rollback', 'release']);
});

test('reserve: same member already holds the book -> 409 before touching availability', async () => {
  setup(reserveHandlers({ dup: rows([{ id: 3 }]) }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 409 && /already has an active/.test(e.message));
  assert.ok(!hit(/available_copies - 1/));
});

test('reserve: member at the limit -> 409', async () => {
  setup(reserveHandlers({ count: rows([{ active: 3 }]) }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 409 && /at most 3/.test(e.message));
  assert.ok(!hit(/available_copies - 1/));
});

test('reserve: unknown member / book -> 404, inactive member -> 403', async () => {
  setup(reserveHandlers({ member: rows([]) }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 404);
  setup(reserveHandlers({ book: rows([]) }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 404);
  setup(reserveHandlers({ member: rows([{ id: 1, name: 'R', is_active: 0 }]) }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 403);
});

test('reserve: unique-index violation (race) becomes a friendly 409 and rolls back', async () => {
  setup(reserveHandlers({ insert: () => { throw Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' }); } }));
  await assert.rejects(service.reserveBook({ book_id: 2, member_id: 1 }), (e) => e.statusCode === 409);
  assert.ok(state.events.includes('rollback'));
});

test('reserve: deadlock is retried on a fresh transaction and then succeeds', async () => {
  let first = true;
  setup(reserveHandlers({
    book: () => {
      if (first) { first = false; throw Object.assign(new Error('deadlock'), { code: 'ER_LOCK_DEADLOCK' }); }
      return [[{ id: 2, title: 'Clean Code' }]];
    },
  }));
  const result = await service.reserveBook({ book_id: 2, member_id: 1 });
  assert.strictEqual(result.id, 9);
  assert.deepStrictEqual(state.events, ['begin', 'rollback', 'release', 'begin', 'commit', 'release']);
});

// ---------- cancel / issue / return ----------
function lifecycleHandlers(status, over = {}) {
  return [
    { re: /^SELECT book_id FROM reservations WHERE id/, reply: over.pre || rows([{ book_id: 2 }]) },
    { re: /FROM books WHERE id = \? FOR UPDATE/, reply: rows([{ id: 2 }]) },
    { re: /^SELECT \* FROM reservations WHERE id = \? FOR UPDATE/, reply: rows([{ id: 5, book_id: 2, status }]) },
    { re: /^UPDATE reservations SET/, reply: () => [{ affectedRows: 1 }] },
    { re: /available_copies \+ 1/, reply: over.release || (() => [{ affectedRows: 1 }]) },
    FETCH,
  ];
}

test('cancel: Reserved -> Cancelled and the copy is released', async () => {
  setup(lifecycleHandlers('Reserved'));
  await service.cancelReservation(5);
  assert.ok(hit(/SET status = 'Cancelled'/));
  assert.ok(hit(/available_copies \+ 1/));
  assert.ok(idx(/FROM books .* FOR UPDATE/) < idx(/^SELECT \* FROM reservations .* FOR UPDATE/), 'book locked before reservation');
  assert.deepStrictEqual(state.events, ['begin', 'commit', 'release']);
});

test('cancel: an issued book cannot be cancelled (409, no availability change)', async () => {
  setup(lifecycleHandlers('Issued'));
  await assert.rejects(service.cancelReservation(5), (e) => e.statusCode === 409 && /Return the book/.test(e.message));
  assert.ok(!hit(/available_copies \+ 1/));
  assert.ok(state.events.includes('rollback'));
});

test('cancel: already cancelled -> 409 (a double click cannot release the copy twice)', async () => {
  setup(lifecycleHandlers('Cancelled'));
  await assert.rejects(service.cancelReservation(5), (e) => e.statusCode === 409);
  assert.ok(!hit(/available_copies \+ 1/));
});

test('cancel: unknown reservation -> 404', async () => {
  setup(lifecycleHandlers('Reserved', { pre: rows([]) }));
  await assert.rejects(service.cancelReservation(5), (e) => e.statusCode === 404);
});

test('cancel: if the guarded release fails the whole change is rolled back', async () => {
  setup(lifecycleHandlers('Reserved', { release: () => [{ affectedRows: 0 }] }));
  await assert.rejects(service.cancelReservation(5), (e) => e.statusCode === 500 && /inconsistent/.test(e.message));
  assert.ok(state.events.includes('rollback'));
  assert.ok(!state.events.includes('commit'));
});

test('issue: Reserved -> Issued with the loan period; availability is untouched', async () => {
  setup(lifecycleHandlers('Reserved'));
  await service.issueReservation(5, 21);
  const i = idx(/SET status = 'Issued'/);
  assert.ok(i >= 0);
  assert.deepStrictEqual(state.params[i], [21, 5]);
  assert.ok(!hit(/UPDATE books/));
});

test('issue: only a Reserved reservation can be issued', async () => {
  setup(lifecycleHandlers('Returned'));
  await assert.rejects(service.issueReservation(5, 14), (e) => e.statusCode === 409);
  setup(lifecycleHandlers('Issued'));
  await assert.rejects(service.issueReservation(5, 14), (e) => e.statusCode === 409 && /already been issued/.test(e.message));
});

test('return: Issued -> Returned and the copy is released', async () => {
  setup(lifecycleHandlers('Issued'));
  await service.returnReservation(5);
  assert.ok(hit(/SET status = 'Returned', returned_at = NOW\(\)/));
  assert.ok(hit(/available_copies \+ 1/));
});

test('return: a reservation that was never issued cannot be returned', async () => {
  setup(lifecycleHandlers('Reserved'));
  await assert.rejects(service.returnReservation(5), (e) => e.statusCode === 409 && /Issue the book first/.test(e.message));
  assert.ok(!hit(/available_copies \+ 1/));
});

// ---------- presentation ----------
test('getReservationById converts overdue fields', async () => {
  setup([{ re: /FROM reservations r JOIN books b/, reply: rows([{ id: 1, is_overdue: 1, days_overdue: '6' }]) }]);
  const r = await service.getReservationById(1);
  assert.strictEqual(r.is_overdue, true);
  assert.strictEqual(r.days_overdue, 6);
  setup([{ re: /FROM reservations r JOIN books b/, reply: rows([]) }]);
  assert.strictEqual(await service.getReservationById(1), null);
});
