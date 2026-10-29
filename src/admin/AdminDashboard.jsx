
import React, { useEffect, useState } from "react";

const API = "http://localhost:5001/api/admin";

function AdminDashboard({ token }) {
  const [data, setData] = useState({
    totalBooks: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    totalUsers: 0,
    totalReservations: 0,
    pendingReservations: 0,
  });

  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load dashboard");
      }

      setData(result);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token]);

  const cards = [
    ["Total Book Titles", data.totalBooks],
    ["Total Stock", data.totalQuantity],
    ["Available Stock", data.availableQuantity],
    ["Reserved Stock", data.reservedQuantity],
    ["Total Users", data.totalUsers],
    ["Reservations", data.totalReservations],
    ["Pending Reservations", data.pendingReservations],
  ];

  return (
    <section>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage books, inventory, users and reservations.</p>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="cards">
        {cards.map(([label, value]) => (
          <div className="card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminDashboard;
