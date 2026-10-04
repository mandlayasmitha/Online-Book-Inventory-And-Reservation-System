import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin";

const emptyForm = {
  title: "",
  author: "",
  category: "",
  quantity: "",
};

function BookManagement() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadBooks = async () => {
    const response = await fetch(`${API}/books`);
    const data = await response.json();
    setBooks(data);
  };

  useEffect(() => {
    loadBooks();
  }, []);

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

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
      }),
    });

    const data = await response.json();
    alert(data.message);

    setForm(emptyForm);
    setEditingId(null);
    loadBooks();
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

    const response = await fetch(`${API}/books/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();
    alert(data.message);
    loadBooks();
  };

  return (
    <section>
      <div className="page-header">
        <h1>Book Management</h1>
        <p>Add, edit, view and delete books.</p>
      </div>

      <form className="form-grid" onSubmit={submitBook}>
        <input
          name="title"
          placeholder="Book title"
          value={form.title}
          onChange={handleChange}
        />
        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        />
        <input
          name="quantity"
          type="number"
          min="0"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
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
                  <button className="small" onClick={() => startEdit(book)}>
                    Edit
                  </button>
                  <button
                    className="small danger"
                    onClick={() => deleteBook(book._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {books.length === 0 && (
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
