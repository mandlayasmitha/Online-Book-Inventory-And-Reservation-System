-- Sample data. Running this again RESETS all three tables.
USE library_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reservations;
TRUNCATE TABLE books;
TRUNCATE TABLE members;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO members (name, email) VALUES
('Ravi Kumar',   'ravi@library.test'),     -- 1
('Sneha Reddy',  'sneha@library.test'),    -- 2
('Arjun Menon',  'arjun@library.test'),    -- 3
('Priya Iyer',   'priya@library.test'),    -- 4
('Kiran Rao',    'kiran@library.test'),    -- 5
('Divya Nair',   'divya@library.test');    -- 6

-- available_copies already reflects the sample reservations below
INSERT INTO books (isbn, title, author, category, total_copies, available_copies) VALUES
('9780132350884', 'Clean Code',                           'Robert C. Martin',  'Software Engineering', 3, 1),  -- 1: 1 issued + 1 reserved
('9780135957059', 'The Pragmatic Programmer',             'Hunt and Thomas',   'Software Engineering', 2, 2),  -- 2: returned earlier
('9781449373320', 'Designing Data-Intensive Applications','Martin Kleppmann',  'Databases',            1, 0),  -- 3: 1 reserved, none left
('9780262033848', 'Introduction to Algorithms',           'Cormen et al.',     'Algorithms',           2, 2),  -- 4: a cancelled reservation
('9780078022159', 'Database System Concepts',             'Silberschatz et al.','Databases',           4, 4),  -- 5
('9781118063330', 'Operating System Concepts',            'Silberschatz et al.','Operating Systems',   3, 3),  -- 6
('9780132126953', 'Computer Networks',                    'Andrew Tanenbaum',  'Networking',           2, 2),  -- 7
('9781593279288', 'Python Crash Course',                  'Eric Matthes',      'Programming',          5, 5);  -- 8

INSERT INTO reservations (book_id, member_id, status, reserved_at, issued_at, due_date, returned_at, cancelled_at) VALUES
(1, 1, 'Issued',    DATE_SUB(NOW(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY),  NULL, NULL),  -- overdue
(1, 2, 'Reserved',  DATE_SUB(NOW(), INTERVAL 1 DAY),  NULL, NULL, NULL, NULL),
(2, 3, 'Returned',  DATE_SUB(NOW(), INTERVAL 31 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), NULL),
(3, 4, 'Reserved',  DATE_SUB(NOW(), INTERVAL 2 DAY),  NULL, NULL, NULL, NULL),
(4, 1, 'Cancelled', DATE_SUB(NOW(), INTERVAL 6 DAY),  NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY));
