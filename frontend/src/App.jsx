import React, { useState } from "react";
import AdminDashboard from "./admin/AdminDashboard";
import BookManagement from "./admin/BookManagement";
import Inventory from "./admin/Inventory";
import UserManagement from "./admin/UserManagement";
import ReservationManagement from "./admin/ReservationManagement";
import "./admin/Admin.css";

function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    if (page === "dashboard") return <AdminDashboard />;
    if (page === "books") return <BookManagement />;
    if (page === "inventory") return <Inventory />;
    if (page === "users") return <UserManagement />;
    if (page === "reservations") return <ReservationManagement />;
    return <AdminDashboard />;
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Book Admin</h2>

        <button
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "books" ? "active" : ""}
          onClick={() => setPage("books")}
        >
          Books
        </button>

        <button
          className={page === "inventory" ? "active" : ""}
          onClick={() => setPage("inventory")}
        >
          Inventory
        </button>

        <button
          className={page === "users" ? "active" : ""}
          onClick={() => setPage("users")}
        >
          Users
        </button>

        <button
          className={page === "reservations" ? "active" : ""}
          onClick={() => setPage("reservations")}
        >
          Reservations
        </button>
      </aside>

      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
