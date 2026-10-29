import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import BookManagement from "./BookManagement";
import Inventory from "./Inventory";
import UserManagement from "./UserManagement";
import ReservationManagement from "./ReservationManagement";
import "./Admin.css";

const API = "http://localhost:5001/api";

function AdminPanel({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [page, setPage] = useState("dashboard");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      if (result.user?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      setToken(result.token);
      setPage("dashboard");
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="admin-login">
        <button type="button" onClick={onBack}>
          ← Back to BookNest
        </button>

        <h1>BookNest Admin Login</h1>
        <p>Sign in with an existing admin account.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  const pages = {
    dashboard: <AdminDashboard token={token} />,
    books: <BookManagement token={token} />,
    inventory: <Inventory token={token} />,
    users: <UserManagement token={token} />,
    reservations: <ReservationManagement token={token} />,
  };

  return (
    <div className="admin-panel">
      <header className="admin-nav">
        <h2>BookNest Admin</h2>

        <button type="button" onClick={onBack}>
          Back to Books
        </button>

        <button
          type="button"
          onClick={() => {
            setToken("");
            setPassword("");
            setEmail("");
            setPage("dashboard");
            setError("");
          }}
        >
          Logout
        </button>
      </header>

      <nav className="admin-menu">
        {Object.keys(pages).map((item) => (
          <button
            type="button"
            key={item}
            className={page === item ? "active" : ""}
            onClick={() => setPage(item)}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </nav>

      <main>{pages[page]}</main>
    </div>
  );
}

export default AdminPanel;