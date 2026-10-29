
import React, { useEffect, useState } from "react";

const API = "http://localhost:5001/api/admin";

const emptyForm = {
  title: "",
  author: "",
  category: "",
  quantity: "",
};

function BookManagement({ token }) {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const loadBooks = async () => {
    try {
      const response = await fetch(`${API}/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load books");
      }

      setBooks(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load books.");
    }
  };

  useEffect(() => {
    if (token) {
      loadBooks();
    }
  }, [token]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const submitBook = async (event) => {
    event.preventDefault();

    if (!form.title || !form.author || !form.category || form.quantity === "") {
      alert("Please fill all fields.");
      return;
    }

    const url = editingId ? `${API}/books/${editingId}` : `${API}/books`;
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save book");
      }

      alert(data.message || "Book saved successfully.");
      setForm(emptyForm);
      setEditingId(null);
      await loadBooks();
    } catch (err) {
      alert(err.message || "Unable to save book.");
    }
  };

  const startEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      quantity: book.quantity,
    });
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      const response = await fetch(`${API}/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete book");
      }

      alert(data.message || "Book deleted successfully.");
      await loadBooks();
    } catch (err) {
      alert(err.message || "Unable to delete book.");
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Book Management</h1>
        <p>Add, edit, view and delete books.</p>
      </div>

      {error && <p role="alert">{error}</p>}

      <form className="form-grid" onSubmit={submitBook}>
        <input
          name="title"
          placeholder="Book title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />
        <input
          name="quantity"
          type="number"
          min="0"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />

        <button className="primary" type="submit">
          {editingId ? "Update Book" : "Add Book"}
        </button>

        {editingId && (
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Total</th>
              <th>Available</th>
              <th>Reserved</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.quantity}</td>
                <td>{book.availableQuantity}</td>
                <td>{book.quantity - book.availableQuantity}</td>
                <td>
                  <button
                    className="small"
                    type="button"
                    onClick={() => startEdit(book)}
                  >
                    Edit
                  </button>
                  <button
                    className="small danger"
                    type="button"
                    onClick={() => deleteBook(book._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {books.length === 0 && !error && (
              <tr>
                <td colSpan="7" className="empty">
                  No books found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default BookManagement;
