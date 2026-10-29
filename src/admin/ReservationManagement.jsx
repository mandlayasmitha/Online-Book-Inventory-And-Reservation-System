
import React, { useEffect, useState } from "react";

const API = "http://localhost:5001/api/admin";

function ReservationManagement({ token }) {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    try {
      const response = await fetch(`${API}/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reservations");
      }

      setReservations(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load reservations.");
    }
  };

  useEffect(() => {
    if (token) {
      loadReservations();
    }
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${API}/reservations/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update reservation");
      }

      alert(data.message || "Reservation status updated.");
      await loadReservations();
    } catch (err) {
      alert(err.message || "Unable to update reservation.");
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Reservation Management</h1>
        <p>View reservations and update their status.</p>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Book</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation.userName}</td>
                <td>{reservation.bookTitle}</td>
                <td>
                  {new Date(
                    reservation.reservationDate
                  ).toLocaleDateString()}
                </td>
                <td>{reservation.status}</td>
                <td>
                  <select
                    value={reservation.status}
                    onChange={(event) =>
                      updateStatus(reservation._id, event.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}

            {reservations.length === 0 && !error && (
              <tr>
                <td colSpan="5" className="empty">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ReservationManagement;
