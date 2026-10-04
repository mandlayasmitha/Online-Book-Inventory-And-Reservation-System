import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin";

function ReservationManagement() {
  const [reservations, setReservations] = useState([]);

  const loadReservations = async () => {
    const response = await fetch(`${API}/reservations`);
    const data = await response.json();
    setReservations(data);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const updateStatus = async (id, status) => {
    const response = await fetch(`${API}/reservations/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    alert(data.message);
    loadReservations();
  };

  return (
    <section>
      <div className="page-header">
        <h1>Reservation Management</h1>
        <p>View reservations and update their status.</p>
      </div>

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
                  {new Date(reservation.reservationDate).toLocaleDateString()}
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

            {reservations.length === 0 && (
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
