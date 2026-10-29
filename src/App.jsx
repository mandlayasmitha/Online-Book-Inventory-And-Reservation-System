
import AdminPanel from "./admin/AdminPanel";
import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:5001/api";

const initialBooks = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", isbn: "9780061122415", quantity: 5 },
  { id: 2, title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", isbn: "9788173711466", quantity: 3 },
  { id: 3, title: "Clean Code", author: "Robert C. Martin", category: "Programming", isbn: "9780132350884", quantity: 4 },
  { id: 4, title: "Introduction to Algorithms", author: "Thomas H. Cormen", category: "Computer Science", isbn: "9780262033848", quantity: 2 },
  { id: 5, title: "Atomic Habits", author: "James Clear", category: "Self Help", isbn: "9780735211292", quantity: 5 },
  { id: 6, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", category: "Finance", isbn: "9780446691264", quantity: 4 },
  { id: 7, title: "The Psychology of Money", author: "Morgan Housel", category: "Finance", isbn: "9780857197689", quantity: 5 },
  { id: 8, title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "Fantasy", isbn: "9780590353427", quantity: 3 },
  { id: 9, title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", isbn: "9780547928227", quantity: 4 },
  { id: 10, title: "1984", author: "George Orwell", category: "Fiction", isbn: "9780451524935", quantity: 3 },
  { id: 11, title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", isbn: "9780061120084", quantity: 4 },
  { id: 12, title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction", isbn: "9780141439518", quantity: 3 },
  { id: 13, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "9780743273565", quantity: 3 },
  { id: 14, title: "Deep Work", author: "Cal Newport", category: "Productivity", isbn: "9781455586691", quantity: 5 },
  { id: 15, title: "Python Crash Course", author: "Eric Matthes", category: "Programming", isbn: "9781593279288", quantity: 4 },
  { id: 16, title: "Java: The Complete Reference", author: "Herbert Schildt", category: "Programming", isbn: "9781260440232", quantity: 4 },
  { id: 17, title: "Computer Networks", author: "Andrew S. Tanenbaum", category: "Computer Science", isbn: "9780132126953", quantity: 3 },
  { id: 18, title: "Database System Concepts", author: "Abraham Silberschatz", category: "Database", isbn: "9780078022159", quantity: 3 },
  { id: 19, title: "Operating System Concepts", author: "Abraham Silberschatz", category: "Computer Science", isbn: "9781119456339", quantity: 3 },
  { id: 20, title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", category: "Artificial Intelligence", isbn: "9780134610993", quantity: 2 },
];

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");

  const [reservations, setReservations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("booknestReservations")) || [];
    } catch {
      return [];
    }
  });

  const [issueDate, setIssueDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "booknestReservations",
      JSON.stringify(reservations)
    );
  }, [reservations]);

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function reserveBook(book) {
    if (!issueDate || !returnDate) {
      setMessage("Please select both issue and return dates.");
      return;
    }

    if (returnDate < issueDate) {
      setMessage("Return date must be after the issue date.");
      return;
    }

    if (book.quantity <= 0) {
      setMessage("Sorry, this book is not available.");
      return;
    }

    const alreadyReserved = reservations.some(
      (reservation) =>
        reservation.bookId === book.id &&
        reservation.status === "Reserved"
    );

    if (alreadyReserved) {
      setMessage("You have already reserved this book.");
      return;
    }

    try {
      const response = await fetch(`${API}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: localStorage.getItem("userName") || "Guest User",
          bookTitle: book.title,
          reservationDate: issueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reservation failed.");
      }

      const newReservation = {
        id: data.reservation?._id || Date.now(),
        bookId: book.id,
        title: book.title,
        author: book.author,
        issueDate,
        returnDate,
        status: "Reserved",
      };

      setReservations((previous) => [...previous, newReservation]);

      setBooks((previous) =>
        previous.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );

      setMessage(`${book.title} reserved successfully!`);
    } catch (error) {
      setMessage(error.message || "Unable to reserve book.");
    }
  }

  function cancelReservation(reservation) {
    if (reservation.status !== "Reserved") return;

    setReservations((previous) =>
      previous.map((item) =>
        item.id === reservation.id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );

    setBooks((previous) =>
      previous.map((book) =>
        book.id === reservation.bookId
          ? { ...book, quantity: book.quantity + 1 }
          : book
      )
    );

    setMessage(`${reservation.title} reservation cancelled.`);
  }

  const filteredReservations = reservations.filter(
    (reservation) =>
      statusFilter === "All" || reservation.status === statusFilter
  );

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span className="book-logo">📚</span>
          <span>BookNest</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#books">Books</a>
          <a href="#reservations">My Reservations</a>
          <button onClick={() => setShowAdmin(true)}>Admin</button>
        </div>
      </nav>

      <section className="hero" id="home">
        <h1>Find Your Next Favourite Book</h1>
        <p>Explore books, discover stories, and reserve your next read.</p>
        <a className="hero-button" href="#books">
          Explore Books
        </a>
      </section>

      <main>
        <section className="books-section" id="books">
          <h2>Explore Our Books</h2>
          <p>Choose your favourite book from our collection.</p>

          <input
            className="search-input"
            type="text"
            placeholder="Search by title, author, or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="date-picker">
            <label>
              Issue Date
              <input
                type="date"
                value={issueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => setIssueDate(event.target.value)}
              />
            </label>

            <label>
              Return Date
              <input
                type="date"
                value={returnDate}
                min={issueDate || new Date().toISOString().split("T")[0]}
                onChange={(event) => setReturnDate(event.target.value)}
              />
            </label>
          </div>

          {message && (
            <p className="success-message" role="status">
              {message}
            </p>
          )}

          <div className="book-grid">
            {filteredBooks.map((book) => (
              <article className="book-card" key={book.id}>
                <img
                  className="book-cover"
                  src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}
                  alt={`Cover of ${book.title}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "https://placehold.co/150x220/eef4fb/23395d?text=Book+Cover";
                  }}
                />

                <h3>{book.title}</h3>
                <p>
                  <strong>Author:</strong> {book.author}
                </p>
                <p>
                  <strong>Category:</strong> {book.category}
                </p>
                <p className="availability">
                  Available: {book.quantity}
                </p>

                <button
                  className="reserve-btn"
                  onClick={() => reserveBook(book)}
                  disabled={book.quantity <= 0}
                >
                  {book.quantity > 0 ? "Reserve Book" : "Not Available"}
                </button>
              </article>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <p className="no-results">No books found.</p>
          )}
        </section>

        <section className="reservation-section" id="reservations">
          <h2>My Reservations</h2>
          <p>View and manage your reserved books.</p>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Reservations</option>
            <option value="Reserved">Reserved</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {filteredReservations.length === 0 ? (
            <p>No reservations to display.</p>
          ) : (
            filteredReservations.map((reservation) => (
              <div className="reservation-item" key={reservation.id}>
                <div>
                  <h3>{reservation.title}</h3>
                  <p>Author: {reservation.author}</p>
                  <p>Issue date: {reservation.issueDate}</p>
                  <p>Return date: {reservation.returnDate}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        reservation.status === "Reserved"
                          ? "pending"
                          : "cancelled"
                      }
                    >
                      {reservation.status}
                    </span>
                  </p>
                </div>

                {reservation.status === "Reserved" && (
                  <button
                    className="cancel-btn"
                    onClick={() => cancelReservation(reservation)}
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            ))
          )}
        </section>
      </main>

      <footer>
        <p>
          © 2026 BookNest | Online Book Inventory & Reservation System
        </p>
      </footer>
    </div>
  );
}

export default App;
