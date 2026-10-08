import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");

  const [reserved, setReserved] = useState(() => {
    const savedReservations = localStorage.getItem("booknestReservations");
    return savedReservations ? JSON.parse(savedReservations) : [];
  });

  const [reservationDate, setReservationDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    localStorage.setItem(
      "booknestReservations",
      JSON.stringify(reserved)
    );
  }, [reserved]);

  // 20 BOOKS
  const books = [
    {
      id: 1,
      title: "The Alchemist",
      author: "Paulo Coelho",
      category: "Fiction",
      isbn: "9780061122415",
      quantity: 5,
      available_quantity: 5,
      image:
        "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
    },
    {
      id: 2,
      title: "Wings of Fire",
      author: "A.P.J. Abdul Kalam",
      category: "Biography",
      isbn: "9788173711466",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9788173711466-L.jpg",
    },
    {
      id: 3,
      title: "Clean Code",
      author: "Robert C. Martin",
      category: "Programming",
      isbn: "9780132350884",
      quantity: 4,
      available_quantity: 4,
      image:
        "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    },
    {
      id: 4,
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      category: "Computer Science",
      isbn: "9780262033848",
      quantity: 2,
      available_quantity: 2,
      image:
        "https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg",
    },
    {
      id: 5,
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self Help",
      isbn: "9780735211292",
      quantity: 5,
      available_quantity: 5,
      image:
        "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    },
    {
      id: 6,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      category: "Finance",
      isbn: "9780446691264",
      quantity: 4,
      available_quantity: 4,
      image:
        "https://covers.openlibrary.org/b/isbn/9780446691264-L.jpg",
    },
    {
      id: 7,
      title: "The Psychology of Money",
      author: "Morgan Housel",
      category: "Finance",
      isbn: "9780857197689",
      quantity: 5,
      available_quantity: 5,
      image:
        "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    },
    {
      id: 8,
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      category: "Fantasy",
      isbn: "9780590353427",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg",
    },
    {
      id: 9,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      category: "Fantasy",
      isbn: "9780547928227",
      quantity: 4,
      available_quantity: 4,
      image:
        "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    },
    {
      id: 10,
      title: "1984",
      author: "George Orwell",
      category: "Fiction",
      isbn: "9780451524935",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    },
    {
      id: 11,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      category: "Fiction",
      isbn: "9780061120084",
      quantity: 4,
      available_quantity: 4,
      image:
        "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    },
    {
      id: 12,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      category: "Fiction",
      isbn: "9780141439518",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
    },
    {
      id: 13,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Fiction",
      isbn: "9780743273565",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    },
    {
      id: 14,
      title: "Deep Work",
      author: "Cal Newport",
      category: "Productivity",
      isbn: "9781455586691",
      quantity: 5,
      available_quantity: 5,
      image:
        "https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg",
    },
    {
      id: 15,
      title: "Python Crash Course",
      author: "Eric Matthes",
      category: "Programming",
      isbn: "9781593279288",
      quantity: 4,
      available_quantity: 4,
      image:
        "https://covers.openlibrary.org/b/isbn/9781593279288-L.jpg",
    },
    {
      id: 16,
      title: "Java: The Complete Reference",
      author: "Herbert Schildt",
      category: "Programming",
      isbn: "9781260440232",
      quantity: 4,
      available_quantity: 4,
      image:
        "https://covers.openlibrary.org/b/isbn/9781260440232-L.jpg",
    },
    {
      id: 17,
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum",
      category: "Computer Science",
      isbn: "9780132126953",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg",
    },
    {
      id: 18,
      title: "Database System Concepts",
      author: "Abraham Silberschatz",
      category: "Database",
      isbn: "9780078022159",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9780078022159-L.jpg",
    },
    {
      id: 19,
      title: "Operating System Concepts",
      author: "Abraham Silberschatz",
      category: "Computer Science",
      isbn: "9781119456339",
      quantity: 3,
      available_quantity: 3,
      image:
        "https://covers.openlibrary.org/b/isbn/9781119456339-L.jpg",
    },
    {
      id: 20,
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell",
      category: "Artificial Intelligence",
      isbn: "9780134610993",
      quantity: 2,
      available_quantity: 2,
      image:
        "https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg",
    },
  ];

  // SEARCH BOOKS
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  // FILTER RESERVATIONS
  const filteredReservations = reserved.filter(
    (book) =>
      statusFilter === "All" || book.status === statusFilter
  );

  // RESERVE BOOK
  function reserveBook(book) {
    if (!reservationDate) {
      setMessage("Please select a reservation date first.");
      return;
    }

    if (reserved.some((item) => item.id === book.id)) {
      setMessage("You have already reserved this book.");
      return;
    }

    setReserved([
      ...reserved,
      {
        ...book,
        reservationDate,
        status: "Pending",
      },
    ]);

    setMessage(book.title + " reserved successfully!");
  }

  // CANCEL RESERVATION
  function cancelReservation(id) {
    setReserved(
      reserved.filter((book) => book.id !== id)
    );

    setMessage("Reservation cancelled successfully!");
  }

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <h2>📚 BookNest</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#books">Books</a>
          <a href="#reservations">My Reservations</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <h1>Discover Your Next Favourite Book</h1>

        <p>
          Explore, discover and reserve books from our library.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search books by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              ✕ Clear
            </button>
          )}
        </div>
      </section>

      {/* BOOKS SECTION */}
      <section className="books-section" id="books">
        <h2>Available Books</h2>

        <div className="date-picker">
          <label htmlFor="reservation-date">
            Select Reservation Date:
          </label>

          <input
            id="reservation-date"
            type="date"
            min={today}
            value={reservationDate}
            onChange={(e) =>
              setReservationDate(e.target.value)
            }
          />
        </div>

        <div className="book-grid">
          {filteredBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <img
                src={book.image}
                alt={book.title}
              />

              <h3>{book.title}</h3>

              <p>{book.author}</p>

              <span>{book.category}</span>

              <p>
                Available: {book.available_quantity}
              </p>

              <button
                onClick={() => reserveBook(book)}
              >
                Reserve Now
              </button>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <p>No books found.</p>
        )}
      </section>

      {/* RESERVATION SECTION */}
      <section
        className="reservation-section"
        id="reservations"
      >
        <h2>
          My Reservations ({reserved.length})
        </h2>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <div className="status-filter">
          <label htmlFor="status">
            Filter by Status:{" "}
          </label>

          <select
            id="status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Reservations
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>
          </select>
        </div>

        {filteredReservations.length === 0 ? (
          <p>
            No reservations found for this status.
          </p>
        ) : (
          filteredReservations.map((book) => (
            <div
              className="reservation-item"
              key={book.id}
            >
              <div>
                <strong>{book.title}</strong>

                <p>
                  Reservation Date:{" "}
                  {book.reservationDate}
                </p>
              </div>

              <span className="pending">
                {book.status}
              </span>

              <button
                className="cancel-btn"
                onClick={() =>
                  cancelReservation(book.id)
                }
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </section>

      {/* FOOTER */}
      <footer>
        <p>
          © 2026 BookNest | Online Book Inventory &
          Reservation System
        </p>
      </footer>
    </div>
  );
}

export default App;
