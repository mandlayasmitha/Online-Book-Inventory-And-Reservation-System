# Database Collections

## 1. Users

Stores user and administrator information.

Fields:
- _id
- name
- email
- password
- role

## 2. Books

Stores book and inventory information.

Fields:
- _id
- title
- author
- category
- isbn
- quantity
- available_quantity

## 3. Reservations

Stores book reservation information.

Fields:
- _id
- user_id
- book_id
- reservation_date
- status

## Relationships

A user can make multiple reservations.

A book can have multiple reservations over time.

The reservations collection connects users and books using:
- user_id
- book_id