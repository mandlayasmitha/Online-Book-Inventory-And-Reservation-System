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


// =========================
// BOOKS COLLECTION
// =========================

db.books.insertMany([
    {
        _id: ObjectId("6abfb4415cfe52a9bd979afd"),
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        isbn: "9780061122415",
        quantity: 5,
        available_quantity: 5
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979afe"),
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        category: "Biography",
        isbn: "9788173711466",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979aff"),
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        isbn: "9780132350884",
        quantity: 4,
        available_quantity: 4
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b00"),
        title: "Introduction to Algorithms",
        author: "Thomas H. Cormen",
        category: "Computer Science",
        isbn: "9780262033848",
        quantity: 2,
        available_quantity: 2
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b01"),
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self Help",
        isbn: "9780735211292",
        quantity: 5,
        available_quantity: 5
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b02"),
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        category: "Finance",
        isbn: "9781612680194",
        quantity: 4,
        available_quantity: 4
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b03"),
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "Finance",
        isbn: "9780857197689",
        quantity: 5,
        available_quantity: 5
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b04"),
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        category: "Fantasy",
        isbn: "9780590353427",
        quantity: 4,
        available_quantity: 4
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b05"),
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        category: "Fantasy",
        isbn: "9780547928227",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b06"),
        title: "1984",
        author: "George Orwell",
        category: "Dystopian",
        isbn: "9780451524935",
        quantity: 4,
        available_quantity: 4
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b07"),
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        isbn: "9780061120084",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b08"),
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Romance",
        isbn: "9780141439518",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b09"),
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Classic",
        isbn: "9780743273565",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b10"),
        title: "Deep Work",
        author: "Cal Newport",
        category: "Productivity",
        isbn: "9781455586691",
        quantity: 4,
        available_quantity: 4
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b11"),
        title: "Python Crash Course",
        author: "Eric Matthes",
        category: "Programming",
        isbn: "9781593279288",
        quantity: 4,
        available_quantity: 4
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b12"),
        title: "Java: The Complete Reference",
        author: "Herbert Schildt",
        category: "Programming",
        isbn: "9781260440232",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b13"),
        title: "Computer Networks",
        author: "Andrew S. Tanenbaum",
        category: "Computer Science",
        isbn: "9780132126953",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b14"),
        title: "Database System Concepts",
        author: "Abraham Silberschatz",
        category: "Database",
        isbn: "9780078022159",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b15"),
        title: "Operating System Concepts",
        author: "Abraham Silberschatz",
        category: "Operating Systems",
        isbn: "9781119800361",
        quantity: 3,
        available_quantity: 3
    },
    {
        _id: ObjectId("6abfb4415cfe52a9bd979b16"),
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell",
        category: "Artificial Intelligence",
        isbn: "9780134610993",
        quantity: 3,
        available_quantity: 3
    }
]);


// =========================
// RESERVATIONS COLLECTION
// =========================

db.reservations.insertMany([
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b0b"),
        user_id: ObjectId("6abfb35e5cfe52a9bd979af1"),
        book_id: ObjectId("6abfb4415cfe52a9bd979afd"),
        reservation_date: "2026-10-02",
        status: "Reserved"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b0c"),
        user_id: ObjectId("6abfb38c5cfe52a9bd979af3"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b01"),
        reservation_date: "2026-10-03",
        status: "Reserved"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b0d"),
        user_id: ObjectId("6abfb35e5cfe52a9bd979af1"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b03"),
        reservation_date: "2026-10-04",
        status: "Completed"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b0e"),
        user_id: ObjectId("6abfb38c5cfe52a9bd979af3"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b05"),
        reservation_date: "2026-10-04",
        status: "Reserved"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b0f"),
        user_id: ObjectId("6abfb35e5cfe52a9bd979af1"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b06"),
        reservation_date: "2026-10-05",
        status: "Reserved"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b10"),
        user_id: ObjectId("6abfb38c5cfe52a9bd979af3"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b07"),
        reservation_date: "2026-10-05",
        status: "Completed"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b11"),
        user_id: ObjectId("6abfb35e5cfe52a9bd979af1"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b11"),
        reservation_date: "2026-10-06",
        status: "Reserved"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b12"),
        user_id: ObjectId("6abfb38c5cfe52a9bd979af3"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b13"),
        reservation_date: "2026-10-06",
        status: "Cancelled"
    },
    {
        _id: ObjectId("6abfb62b5cfe52a9bd979b13"),
        user_id: ObjectId("6abfb35e5cfe52a9bd979af1"),
        book_id: ObjectId("6abfb4415cfe52a9bd979b16"),
        reservation_date: "2026-10-07",
        status: "Reserved"
    }
]);

print("Online Book Inventory database setup completed.");
print("Collections: users, books, reservations");
