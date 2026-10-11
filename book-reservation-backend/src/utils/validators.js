const { DEFAULT_LOAN_DAYS, MAX_LOAN_DAYS, MAX_COPIES } = require('../config/rules');

const STATUSES = ['Reserved', 'Issued', 'Returned', 'Cancelled'];

function toInt(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number(value.trim());
  return null;
}

function toPositiveInt(value) {
  const n = toInt(value);
  return n !== null && n > 0 ? n : null;
}

// "978-0-13-235088-4" -> "9780132350884"
const normaliseIsbn = (value) => String(value).replace(/[\s-]/g, '').toUpperCase();
const isValidIsbn = (isbn) => /^\d{13}$/.test(isbn) || /^\d{9}[\dX]$/.test(isbn);

/**
 * Book validation. partial=false -> create (everything required); partial=true -> update
 * (only the fields sent are checked). available_copies can never be set by a client:
 * it is changed only by reservations, so the counts cannot drift.
 */
function validateBook(body = {}, { partial = false } = {}) {
  const errors = [];
  const value = {};
  const has = (key) => body[key] !== undefined;
  const add = (field, message) => errors.push({ field, message });

  if (has('available_copies')) {
    add('available_copies', 'available_copies is managed automatically by reservations and cannot be set directly.');
  }

  if (!partial || has('title')) {
    const title = typeof body.title === 'string' ? body.title.trim() : null;
    if (!title || title.length > 200) add('title', 'title is required (1 to 200 characters).');
    else value.title = title;
  }

  if (!partial || has('author')) {
    const author = typeof body.author === 'string' ? body.author.trim() : null;
    if (!author || author.length > 150) add('author', 'author is required (1 to 150 characters).');
    else value.author = author;
  }

  if (!partial || has('isbn')) {
    const isbn = typeof body.isbn === 'string' ? normaliseIsbn(body.isbn) : null;
    if (!isbn || !isValidIsbn(isbn)) add('isbn', 'isbn must be a 10 or 13 digit ISBN (hyphens allowed).');
    else value.isbn = isbn;
  }

  if (has('category')) {
    if (body.category === null || body.category === '') {
      value.category = null;
    } else if (typeof body.category === 'string' && body.category.trim().length <= 80) {
      value.category = body.category.trim();
    } else {
      add('category', 'category must be text of at most 80 characters.');
    }
  } else if (!partial) {
    value.category = null;
  }

  if (!partial || has('total_copies')) {
    const copies = toInt(body.total_copies);
    const min = partial ? 0 : 1;
    if (copies === null || copies < min || copies > MAX_COPIES) {
      add('total_copies', `total_copies must be a whole number from ${min} to ${MAX_COPIES}.`);
    } else {
      value.total_copies = copies;
    }
  }

  if (partial && errors.length === 0 && Object.keys(value).length === 0) {
    add('body', 'Provide at least one field to update: title, author, isbn, category, total_copies.');
  }

  return { errors, value: errors.length ? null : value };
}

function validateReservationInput(body = {}) {
  const errors = [];
  const book_id = toPositiveInt(body.book_id);
  const member_id = toPositiveInt(body.member_id);
  if (!book_id) errors.push({ field: 'book_id', message: 'book_id must be a positive whole number.' });
  if (!member_id) errors.push({ field: 'member_id', message: 'member_id must be a positive whole number.' });
  return { errors, value: errors.length ? null : { book_id, member_id } };
}

function validateLoanDays(body = {}) {
  if (body.loan_days === undefined) return { errors: [], value: { loan_days: DEFAULT_LOAN_DAYS } };
  const days = toInt(body.loan_days);
  if (days === null || days < 1 || days > MAX_LOAN_DAYS) {
    return { errors: [{ field: 'loan_days', message: `loan_days must be a whole number from 1 to ${MAX_LOAN_DAYS}.` }], value: null };
  }
  return { errors: [], value: { loan_days: days } };
}

function parsePagination(query = {}) {
  const errors = [];
  let page = 1;
  let limit = 20;
  if (query.page !== undefined) {
    page = toPositiveInt(query.page);
    if (!page) errors.push({ field: 'page', message: 'page must be a positive whole number.' });
  }
  if (query.limit !== undefined) {
    limit = toPositiveInt(query.limit);
    if (!limit || limit > 100) errors.push({ field: 'limit', message: 'limit must be a whole number from 1 to 100.' });
  }
  return { errors, value: { page, limit } };
}

module.exports = {
  STATUSES, toInt, toPositiveInt, normaliseIsbn, isValidIsbn,
  validateBook, validateReservationInput, validateLoanDays, parsePagination,
};
