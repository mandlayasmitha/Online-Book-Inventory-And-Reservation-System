
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

  const books = [
    {
      id: 1,
      title: "The Alchemist",
      author: "Paulo Coelho",
      category: "Fiction",
      image: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg"
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self Help",
      image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg"
    },
    {
      id: 3,
      title: "Harry Potter",
      author: "J.K. Rowling",
      category: "Fantasy",
      image: "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg"
    },
    {
      id: 4,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: "Classic",
      image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg"
    },
    {
      id: 5,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      category: "Finance",
      image: "https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg"
    },
    {
      id: 6,
      title: "Ikigai",
      author: "Hector Garcia",
      category: "Self Help",
      image: "https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg"
    }
  ];

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReservations = reserved.filter((book) =>
    statusFilter === "All" || book.status === statusFilter
  );

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
      { ...book, reservationDate, status: "Pending" }
    ]);

    setMessage(book.title + " reserved successfully!");
  }

  function cancelReservation(id) {
    setReserved(reserved.filter((book) => book.id !== id));
    setMessage("Reservation cancelled successfully!");
  }

  return (
    <div className="app">

      <nav className="navbar">
        <h2>📚 BookNest</h2>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#books">Books</a>
          <a href="#reservations">My Reservations</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <h1>Discover Your Next Favourite Book</h1>
        <p>Explore, discover and reserve books from our library.</p>

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
            onChange={(e) => setReservationDate(e.target.value)}
          />
        </div>

        <div className="book-grid">
          {filteredBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <img src={book.image} alt={book.title} />
              <h3>{book.title}</h3>
              <p>{book.author}</p>
              <span>{book.category}</span>

              <button onClick={() => reserveBook(book)}>
                Reserve Now
              </button>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && <p>No books found.</p>}
      </section>

      <section className="reservation-section" id="reservations">
        <h2>My Reservations ({reserved.length})</h2>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <div className="status-filter">
          <label htmlFor="status">Filter by Status: </label>

          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Reservations</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        {filteredReservations.length === 0 ? (
          <p>No reservations found for this status.</p>
        ) : (
          filteredReservations.map((book) => (
            <div className="reservation-item" key={book.id}>
              <div>
                <strong>{book.title}</strong>
                <p>Reservation Date: {book.reservationDate}</p>
              </div>

              <span className="pending">{book.status}</span>

              <button
                className="cancel-btn"
                onClick={() => cancelReservation(book.id)}
              >
                Cancel
              </button>
            </div>
          ))
        )}
      </section>

      <footer>
        <p>© 2026 BookNest | Online Book Inventory & Reservation System</p>
      </footer>

    </div>
  );
}

export default App;