const test = require('node:test');
const assert = require('node:assert');
const AppError = require('../src/utils/AppError');
const errorHandler = require('../src/middleware/errorHandler');
const mw = require('../src/middleware/validation');

const res = () => ({ headersSent: false, code: null, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });
const handle = (err) => { const r = res(); errorHandler(err, {}, r, () => {}); return r; };

test('AppError keeps status, message and field details', () => {
  const r = handle(new AppError(409, 'No copies', [{ field: 'x', message: 'y' }]));
  assert.strictEqual(r.code, 409);
  assert.deepStrictEqual(r.body, { success: false, message: 'No copies', errors: [{ field: 'x', message: 'y' }] });
});

test('database errors map to useful statuses', () => {
  assert.strictEqual(handle({ type: 'entity.parse.failed' }).code, 400);
  assert.strictEqual(handle({ code: 'ER_DUP_ENTRY' }).code, 409);
  assert.strictEqual(handle({ code: 'ER_NO_REFERENCED_ROW_2' }).code, 400);
  assert.strictEqual(handle({ code: 'ER_CHECK_CONSTRAINT_VIOLATED' }).code, 409);
  assert.strictEqual(handle({ code: 'ER_LOCK_DEADLOCK' }).code, 503);
  assert.strictEqual(handle({ code: 'ECONNREFUSED' }).code, 503);
});

test('unknown errors become a safe 500 without leaking details', () => {
  const orig = console.error;
  console.error = () => {};
  const r = handle(new Error('password=secret'));
  console.error = orig;
  assert.strictEqual(r.code, 500);
  assert.ok(!JSON.stringify(r.body).includes('secret'));
});

test('validation middleware: id, create, update, reservation, issue', () => {
  const run = (fn, req) => { let out; fn(req, {}, (e) => (out = e)); return out; };

  assert.strictEqual(run(mw.validateIdParam, { params: { id: 'abc' } }).statusCode, 400);
  const idReq = { params: { id: '4' } };
  assert.strictEqual(run(mw.validateIdParam, idReq), undefined);
  assert.strictEqual(idReq.params.id, 4);

  assert.strictEqual(run(mw.validateBookCreate, { body: {} }).statusCode, 400);
  assert.strictEqual(run(mw.validateBookUpdate, { body: {} }).statusCode, 400);
  assert.strictEqual(run(mw.validateReservation, { body: { book_id: 1 } }).statusCode, 400);

  const issueReq = { body: undefined };
  assert.strictEqual(run(mw.validateIssue, issueReq), undefined);
  assert.strictEqual(issueReq.issueInput.loan_days, 14);
});
