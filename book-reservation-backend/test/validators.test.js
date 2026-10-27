const test = require('node:test');
const assert = require('node:assert');
const v = require('../src/utils/validators');

const goodBook = { title: ' Clean Code ', author: 'Robert C. Martin', isbn: '978-0-13-235088-4', category: 'Software', total_copies: '3' };

test('create: valid book is cleaned (ISBN normalised, numbers converted)', () => {
  const { errors, value } = v.validateBook(goodBook);
  assert.strictEqual(errors.length, 0);
  assert.deepStrictEqual(value, {
    title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Software', total_copies: 3,
  });
});

test('create: every required field is reported', () => {
  const { errors } = v.validateBook({});
  assert.deepStrictEqual(errors.map((e) => e.field).sort(), ['author', 'isbn', 'title', 'total_copies']);
});

test('create: total_copies must be 1 or more; ISBN must have 10 or 13 digits', () => {
  assert.strictEqual(v.validateBook({ ...goodBook, total_copies: 0 }).errors[0].field, 'total_copies');
  assert.strictEqual(v.validateBook({ ...goodBook, total_copies: 1.5 }).errors[0].field, 'total_copies');
  assert.strictEqual(v.validateBook({ ...goodBook, isbn: '12345' }).errors[0].field, 'isbn');
  assert.strictEqual(v.validateBook({ ...goodBook, isbn: '080442957X' }).errors.length, 0);
});

test('available_copies can never be set by a client', () => {
  const { errors } = v.validateBook({ ...goodBook, available_copies: 99 });
  assert.ok(errors.some((e) => e.field === 'available_copies'));
  assert.ok(v.validateBook({ available_copies: 1 }, { partial: true }).errors.some((e) => e.field === 'available_copies'));
});

test('update: only sent fields are checked; empty body is rejected', () => {
  const ok = v.validateBook({ title: 'New title' }, { partial: true });
  assert.strictEqual(ok.errors.length, 0);
  assert.deepStrictEqual(ok.value, { title: 'New title' });

  assert.strictEqual(v.validateBook({}, { partial: true }).errors[0].field, 'body');
  assert.strictEqual(v.validateBook({ total_copies: 0 }, { partial: true }).errors.length, 0); // 0 allowed on update
  assert.strictEqual(v.validateBook({ total_copies: -1 }, { partial: true }).errors.length, 1);
});

test('update: category can be cleared with null', () => {
  const { value } = v.validateBook({ category: null }, { partial: true });
  assert.deepStrictEqual(value, { category: null });
});

test('reservation input', () => {
  assert.deepStrictEqual(v.validateReservationInput({ book_id: '2', member_id: 5 }).value, { book_id: 2, member_id: 5 });
  assert.strictEqual(v.validateReservationInput({ book_id: 'x' }).errors.length, 2);
  assert.strictEqual(v.validateReservationInput({ book_id: 0, member_id: 1 }).errors.length, 1);
});

test('loan_days: default, valid, invalid', () => {
  assert.strictEqual(v.validateLoanDays({}).value.loan_days, 14);
  assert.strictEqual(v.validateLoanDays({ loan_days: 7 }).value.loan_days, 7);
  assert.strictEqual(v.validateLoanDays({ loan_days: 0 }).errors.length, 1);
  assert.strictEqual(v.validateLoanDays({ loan_days: 90 }).errors.length, 1);
  assert.strictEqual(v.validateLoanDays({ loan_days: 'abc' }).errors.length, 1);
});

test('pagination', () => {
  assert.deepStrictEqual(v.parsePagination({}).value, { page: 1, limit: 20 });
  assert.deepStrictEqual(v.parsePagination({ page: '3', limit: '50' }).value, { page: 3, limit: 50 });
  assert.strictEqual(v.parsePagination({ limit: '500' }).errors.length, 1);
  assert.strictEqual(v.parsePagination({ page: '0' }).errors.length, 1);
});
