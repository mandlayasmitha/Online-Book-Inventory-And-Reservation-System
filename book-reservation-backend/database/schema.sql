CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Members are owned by the authentication / users module. This minimal table exists so
-- reservations have something to point at; replace it with the real one when merging.
CREATE TABLE IF NOT EXISTS members (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(120) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  is_active TINYINT(1)   NOT NULL DEFAULT 1
);

-- INVARIANT:  available_copies = total_copies - (reservations that are Reserved or Issued)
-- A copy is held from the moment it is reserved until it is cancelled or returned.
CREATE TABLE IF NOT EXISTS books (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  isbn             VARCHAR(13)  NOT NULL UNIQUE,
  title            VARCHAR(200) NOT NULL,
  author           VARCHAR(150) NOT NULL,
  category         VARCHAR(80)  DEFAULT NULL,
  total_copies     INT UNSIGNED NOT NULL,
  available_copies INT UNSIGNED NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- last line of defence: the database itself refuses impossible counts
  CONSTRAINT chk_books_available_within_total CHECK (available_copies <= total_copies),
  INDEX idx_books_category (category),
  INDEX idx_books_title (title)
);

-- Lifecycle:  Reserved -> Issued -> Returned      Reserved -> Cancelled
CREATE TABLE IF NOT EXISTS reservations (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  book_id      INT UNSIGNED NOT NULL,
  member_id    INT UNSIGNED NOT NULL,
  status       ENUM('Reserved','Issued','Returned','Cancelled') NOT NULL DEFAULT 'Reserved',
  reserved_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  issued_at    DATETIME DEFAULT NULL,
  due_date     DATE     DEFAULT NULL,
  returned_at  DATETIME DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  -- "book:member" while the reservation is active, NULL once it is finished.
  -- The UNIQUE index below therefore stops a member holding the same book twice,
  -- even if two requests slip past the application checks at the same instant.
  active_pair  VARCHAR(40) GENERATED ALWAYS AS
               (IF(status IN ('Reserved','Issued'), CONCAT(book_id, ':', member_id), NULL)) STORED,
  CONSTRAINT fk_res_book   FOREIGN KEY (book_id)   REFERENCES books(id),
  CONSTRAINT fk_res_member FOREIGN KEY (member_id) REFERENCES members(id),
  UNIQUE KEY uq_active_pair (active_pair),
  INDEX idx_res_book_status   (book_id, status),
  INDEX idx_res_member_status (member_id, status),
  INDEX idx_res_due (status, due_date)
);
