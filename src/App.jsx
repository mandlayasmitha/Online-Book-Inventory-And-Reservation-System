import { useState } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const books = [
    {
      id: 1,
      title: "The Alchemist",
      author: "Paulo Coelho",
      category: "Fiction",
      available: 5,
      image: "https://covers.openlibrary.org/b/title/The%20Alchemist-M.jpg",
    },
    {
      id: 2,
      title: "Wings of Fire",
      author: "A. P. J. Abdul Kalam",
      category: "Biography",
      available: 3,
      image: "https://covers.openlibrary.org/b/title/Wings%20of%20Fire-M.jpg",
    },
    {
      id: 3,
      title: "Atomic Habits",
      author: "James Clear",
      category: "Self-Help",
      available: 4,
      image: "https://covers.openlibrary.org/b/title/Atomic%20Habits-M.jpg",
    },
    {
      id: 4,
      title: "Harry Potter",
      author: "J. K. Rowling",
      category: "Fantasy",
      available: 2,
      image: "https://covers.openlibrary.org/b/title/Harry%20Potter-M.jpg",
    },
    {
      id: 5,
      title: "Ikigai",
      author: "Hector Garcia",
      category: "Self-Help",
      available: 6,
      image: "https://covers.openlibrary.org/b/title/Ikigai-M.jpg",
    },
    {
      id: 6,
      title: "The Hobbit",
      author: "J. R. R. Tolkien",
      category: "Fantasy",
      available: 0,
      image: "https://covers.openlibrary.org/b/title/The%20Hobbit-M.jpg",
    },
    {
      id: 7,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      category: "Fiction",
      available: 4,
      image: "https://covers.openlibrary.org/b/title/Pride%20and%20Prejudice-M.jpg",
    },
    {
      id: 8,
      title: "Steve Jobs",
      author: "Walter Isaacson",
      category: "Biography",
      available: 2,
      image: "https://covers.openlibrary.org/b/title/Steve%20Jobs-M.jpg",
    },
    {
      id: 9,
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      category: "Self-Help",
      available: 7,
      image: "https://covers.openlibrary.org/b/title/Rich%20Dad%20Poor%20Dad-M.jpg",
    },
  ];

  const categories = ["All", "Fiction", "Biography", "Self-Help", "Fantasy"];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#home" className="logo">
          📚 BookNest
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#books">Books</a>
          <a href="#categories">Categories</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <p className="welcome">WELCOME TO BOOKNEST</p>
          <h1>Discover Your Next Favourite Book</h1>
          <p className="hero-description">
            Explore our library, discover new stories, and find the perfect
            book for your next reading adventure.
          </p>
          <a href="#books" className="hero-button">
            Explore Books →
          </a>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <span>📚</span>
          <h3>Wide Collection</h3>
          <p>Explore books across different categories.</p>
        </div>

        <div className="feature">
          <span>🔎</span>
          <h3>Easy Search</h3>
          <p>Find books by title or author.</p>
        </div>

        <div className="feature">
          <span>📖</span>
          <h3>Check Availability</h3>
          <p>See available copies before visiting.</p>
        </div>
      </section>

      <section className="books-section" id="books">
        <div className="section-heading">
          <p className="small-heading">YOUR NEXT READ AWAITS</p>
          <h2>Explore Our Books</h2>
          <p>Browse our collection and discover something wonderful.</p>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by book title or author..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="categories" id="categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="results-count">
          Showing {filteredBooks.length} books
        </p>

        <div className="book-grid">
          {filteredBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-image-container">
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-image"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="book-info">
                <span className="book-category">{book.category}</span>
                <h3>{book.title}</h3>
                <p className="book-author">by {book.author}</p>

                <div className="availability-row">
                  <span
                    className={
                      book.available > 0
                        ? "availability available"
                        : "availability unavailable"
                    }
                  >
                    {book.available > 0
                      ? "Available"
                      : "Currently Unavailable"}
                  </span>

                  <span className="book-stock">
                    {book.available} copies
                  </span>
                </div>

                <button
                  className="details-button"
                  onClick={() =>
                    alert(
                      `Book: ${book.title}\nAuthor: ${book.author}\nCategory: ${book.category}\nAvailable copies: ${book.available}`
                    )
                  }
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="no-results">
            <span>📚</span>
            <h3>No books found</h3>
            <p>Try another title, author, or category.</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <h2>📚 BookNest</h2>
        <p>Your next favourite story is waiting for you.</p>
        <p className="copyright">
          © 2026 BookNest Library. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;