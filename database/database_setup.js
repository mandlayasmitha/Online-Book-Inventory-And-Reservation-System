use("online_book_inventory");

// Create collections if they do not already exist

if (!db.getCollectionNames().includes("users")) {
    db.createCollection("users");
}

if (!db.getCollectionNames().includes("books")) {
    db.createCollection("books");
}

if (!db.getCollectionNames().includes("reservations")) {
    db.createCollection("reservations");
}

// Insert sample books
db.books.insertMany([
    {
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        isbn: "9780061122415",
        quantity: 5,
        available_quantity: 5
    },
    {
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        category: "Biography",
        isbn: "9788173711466",
        quantity: 3,
        available_quantity: 3
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        isbn: "9780132350884",
        quantity: 4,
        available_quantity: 4
    },
    {
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Computer Science",
        isbn: "9780262033848",
        quantity: 2,
        available_quantity: 2
    }
]);

print("Online Book Inventory database is ready!");
print("Collections: users, books, reservations");