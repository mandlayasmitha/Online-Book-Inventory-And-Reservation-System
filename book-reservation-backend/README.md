# Module 4 — Book Inventory & Reservation Transactions (Backend)

Express + MySQL REST API. Handles book records, reservations, cancellations, issue/return dates,
transaction errors, and keeps availability counts consistent when many reservations arrive at once.

## What the module covers

| Responsibility | Where it is done |
|---|---|
| Add, view, update book records | `POST/GET/PUT /api/books` — `services/book.service.js` |
| Process reservations and cancellations | `POST /api/reservations`, `POST /api/reservations/:id/cancel` |
| Track issue and return dates | `issue` sets `issued_at` + `due_date`; `return` sets `returned_at`; overdue days are calculated |
| Handle reservation transactions and errors | `utils/transaction.js` (commit / rollback / retry) + `middleware/errorHandler.js` |
| Prevent inconsistent availability | see "How availability stays consistent" below |

## Reservation lifecycle

```
            issue                 return
Reserved ----------> Issued ------------> Returned
    |
    | cancel
    v
Cancelled
```

A copy is **held from the moment it is reserved** until it is cancelled or returned:

```
available_copies = total_copies - (reservations that are Reserved or Issued)
```

| Action | Reservation | `available_copies` |
|---|---|---|
| Reserve | new row, `Reserved` | −1 |
| Cancel (only while `Reserved`) | `Cancelled`, `cancelled_at` set | +1 |
| Issue (only while `Reserved`) | `Issued`, `issued_at` + `due_date` set | unchanged (already held) |
| Return (only while `Issued`) | `Returned`, `returned_at` set | +1 |

## How availability stays consistent

Every change to `available_copies` runs in one transaction. Several layers protect it:

1. **Row locks.** `SELECT ... FOR UPDATE` on the member and book (and reservation) rows makes requests for the same book wait their turn. Locks are always taken in the same order (member → book → reservation) to avoid deadlocks.
2. **Guarded updates.** The decrement is `UPDATE books SET available_copies = available_copies - 1 WHERE id = ? AND available_copies > 0`. If no row changes, nobody gets the copy and the API answers `409`. The increment is guarded with `available_copies < total_copies`.
3. **State checks on the locked row.** Cancel, issue and return re-read the reservation status after locking, so a double-click or two staff members acting together can't release a copy twice.
4. **Unique index.** `reservations.active_pair` is unique while a reservation is active, so one member can't hold the same book twice even if two requests race.
5. **CHECK constraint.** `available_copies <= total_copies` plus `UNSIGNED` columns make impossible counts fail in the database itself.
6. **Rollback.** Any error rolls the whole transaction back, so a reservation row is never saved without its matching count change (or the reverse).
7. **Deadlock retry.** If MySQL aborts a transaction (deadlock / lock timeout), it is retried automatically up to 2 times.

Clients can never set `available_copies` directly (the API rejects it). When `total_copies` is edited, `available_copies` is recalculated under the same lock, and the edit is refused if it would go below the copies currently in use.

## API

All responses: `{ "success": true, ... }` or `{ "success": false, "message": "...", "errors": [{ "field", "message" }] }`.

### Books

| Method | URL | Notes |
|---|---|---|
| POST | `/api/books` | `title`, `author`, `isbn` (10/13 digits), `total_copies` (1–1000), optional `category` |
| GET | `/api/books` | `?search=` (title/author/ISBN), `?category=`, `?available=true`, `?page=`, `?limit=` |
| GET | `/api/books/:id` | includes `reserved_count` and `issued_count` |
| PUT | `/api/books/:id` | send only the fields to change; `available_copies` is not accepted |

### Reservations

| Method | URL | Notes |
|---|---|---|
| POST | `/api/reservations` | `{ "book_id": 2, "member_id": 1 }` — holds one copy |
| GET | `/api/reservations` | `?status=`, `?member_id=`, `?book_id=`, `?overdue=true` |
| GET | `/api/reservations/:id` | includes `due_date`, `is_overdue`, `days_overdue` |
| POST | `/api/reservations/:id/cancel` | only while `Reserved` |
| POST | `/api/reservations/:id/issue` | optional `{ "loan_days": 14 }` (1–60); sets `issued_at` and `due_date` |
| POST | `/api/reservations/:id/return` | sets `returned_at`; message says if it was late |

### Helper (read-only)

`GET /api/members` — members and their active reservation counts. Member management belongs to the users/authentication module; the `members` table here is a minimal stand-in.

### Business rules (change in `.env`)

- A member can hold at most `MAX_ACTIVE_RESERVATIONS` (default 3) books (Reserved + Issued).
- A member can't hold the same book twice.
- `DEFAULT_LOAN_DAYS` (default 14) is used when `loan_days` is not sent.
- Inactive members can't reserve.

### Error codes

| Status | When |
|---|---|
| 400 | Validation failed (bad ISBN, missing field, bad id, malformed JSON, unknown foreign key) |
| 403 | Member account inactive |
| 404 | Book, member, reservation or route not found |
| 409 | No copies left, duplicate ISBN, duplicate reservation, member limit, wrong state (e.g. cancelling an issued book), copies below in-use count |
| 500 | Counts found inconsistent (change rolled back) or unexpected error (details hidden from the client) |
| 503 | Database unavailable, or busy after retries |

## Project structure

```
database/    schema.sql, seed.sql
scripts/     concurrency-check.js   (proves simultaneous reservations can't over-book)
src/
  server.js  app.js
  config/    db.js, rules.js
  routes/    books, reservations, members
  controllers/
  middleware/ validation, errorHandler, notFound
  services/  book, reservation, member   (all SQL and transactions)
  utils/     transaction.js, validators.js, AppError.js, ...
test/        unit tests (no database needed)
```

## Run it

Requirements: Node.js 18+ (20+ recommended), MySQL 8.0.16+.

```bash
# 1. database (from this folder)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# 2. open .env and set DB_PASSWORD

# 3. install and start
npm install
npm start            # http://localhost:5000/api
```

Check: open http://localhost:5000/api/books in a browser.

### Try the workflow (macOS / Linux / Windows Git Bash)

```bash
# add a book
curl -X POST http://localhost:5000/api/books -H "Content-Type: application/json" \
  -d '{"title":"Refactoring","author":"Martin Fowler","isbn":"978-0-13-475759-9","category":"Software Engineering","total_copies":2}'

# reserve it (use the new book's id) for member 5
curl -X POST http://localhost:5000/api/reservations -H "Content-Type: application/json" \
  -d '{"book_id":9,"member_id":5}'

# issue it for 7 days, then return it
curl -X POST http://localhost:5000/api/reservations/6/issue -H "Content-Type: application/json" -d '{"loan_days":7}'
curl -X POST http://localhost:5000/api/reservations/6/return

# see overdue loans (seed data has one)
curl "http://localhost:5000/api/reservations?overdue=true"

# error cases: reserving a book with no copies left (book 3), cancelling an issued book (reservation 1)
curl -X POST http://localhost:5000/api/reservations -H "Content-Type: application/json" -d '{"book_id":3,"member_id":5}'
curl -X POST http://localhost:5000/api/reservations/1/cancel
```

On Windows Command Prompt use Postman or Thunder Client instead (JSON quotes need escaping).

### Seed data

8 books, 6 members and 5 reservations covering every status. Book 3 has no copies left (good for the "no copies" error), reservation 1 is an overdue loan, reservation 2 is `Reserved` (can be issued or cancelled), and member 6 has nothing active.

## Tests

```bash
npm test                    # 30 unit tests, no database needed
npm run concurrency-check   # needs the API running; uses the real database
```

`npm test` uses a fake database connection to verify order of operations, rollbacks, error codes and retries.
`npm run concurrency-check` is the real proof for locking: it fires simultaneous requests and confirms that
5 members racing for 1 copy gives exactly one success, one member can't create duplicates, and a cancel clicked
4 times releases the copy once. It creates a few test books in your database (titles start with "Concurrency test").

## Not included (possible next steps)

- Automatic expiry of reservations that are never collected.
- Fines for overdue returns (the overdue days are already calculated).
- Authentication and role checks (staff vs member) — module for auth and integration.

## Git workflow

```bash
git checkout -b feature/module-4-inventory-reservations
git add .
git commit -m "Add book inventory and reservation transactions (module 4)"
git push -u origin feature/module-4-inventory-reservations
```
Open a Pull Request into `main`. `.env` is git-ignored; commit only `.env.example`.
