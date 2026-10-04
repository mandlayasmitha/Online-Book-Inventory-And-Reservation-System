import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin";

function AdminDashboard() {
  const [data, setData] = useState({
    totalBooks: 0,
    totalQuantity: 0,
    availableQuantity: 0,
    reservedQuantity: 0,
    totalUsers: 0,
    totalReservations: 0,
    pendingReservations: 0,
  });

  const loadDashboard = async () => {
    const response = await fetch(`${API}/dashboard`);
    const result = await response.json();
    setData(result);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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
