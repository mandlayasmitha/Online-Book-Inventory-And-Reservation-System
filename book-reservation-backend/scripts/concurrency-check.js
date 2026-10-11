/*
 * Proves that simultaneous reservations cannot over-book a book.
 * Needs the API running (npm start) with the seed data loaded. Node 18+.
 *
 *   npm run concurrency-check
 *
 * It creates its own test books, fires requests at the same instant, and checks the results.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  ->  ${detail}`}`);
  if (!ok) failures++;
}

const newIsbn = (n) => `978${String(Date.now() + n).slice(-10)}`;

async function makeBook(title, copies, n) {
  const res = await call('POST', '/books', { title, author: 'Concurrency Test', isbn: newIsbn(n), total_copies: copies });
  if (res.status !== 201) throw new Error(`Could not create test book: ${JSON.stringify(res.json)}`);
  return res.json.data;
}

const available = async (bookId) => (await call('GET', `/books/${bookId}`)).json.data.available_copies;

async function main() {
  const health = await call('GET', '/health').catch(() => null);
  if (!health || health.status !== 200) throw new Error(`API not reachable at ${BASE}. Start it with: npm start`);

  // Test 1: 1 copy, 5 different members all reserve at once -> exactly one wins
  const single = await makeBook('Concurrency test: one copy', 1, 1);
  const results = await Promise.all([1, 2, 3, 4, 5].map((member_id) => call('POST', '/reservations', { book_id: single.id, member_id })));
  const winners = results.filter((r) => r.status === 201);
  const rejected = results.filter((r) => r.status === 409);
  check('1 copy, 5 simultaneous requests: exactly one succeeds', winners.length === 1, `${winners.length} succeeded`);
  check('the other 4 are refused with 409', rejected.length === 4, results.map((r) => r.status).join(','));
  check('available_copies is 0 (never negative)', (await available(single.id)) === 0);

  if (winners[0]) {
    await call('POST', `/reservations/${winners[0].json.data.id}/cancel`);
    check('after cancelling, available_copies is back to 1', (await available(single.id)) === 1);
  }

  // Test 2: one member sends the same reservation 4 times at once -> only one is created
  const many = await makeBook('Concurrency test: five copies', 5, 2);
  const same = await Promise.all([1, 2, 3, 4].map(() => call('POST', '/reservations', { book_id: many.id, member_id: 6 })));
  const created = same.filter((r) => r.status === 201);
  check('same member, 4 simultaneous requests: only one reservation is created', created.length === 1, same.map((r) => r.status).join(','));
  check('only one copy is held (available_copies = 4)', (await available(many.id)) === 4);

  // Test 3: cancel clicked 4 times at once -> the copy is released exactly once
  if (created[0]) {
    const id = created[0].json.data.id;
    const cancels = await Promise.all([1, 2, 3, 4].map(() => call('POST', `/reservations/${id}/cancel`)));
    check('cancelled 4 times at once: only one succeeds', cancels.filter((r) => r.status === 200).length === 1, cancels.map((r) => r.status).join(','));
    check('copy released exactly once (available_copies = 5)', (await available(many.id)) === 5);
  }

  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
