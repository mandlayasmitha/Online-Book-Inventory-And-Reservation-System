
import React, { useEffect, useState } from "react";

const API = "http://localhost:5001/api/admin";

function Inventory({ token }) {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    try {
      const response = await fetch(`${API}/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load inventory");
      }

      setInventory(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load inventory.");
    }
  };

  useEffect(() => {
    if (token) {
      loadInventory();
    }
  }, [token]);

  return (
    <section>
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Monitor total, available and reserved stock.</p>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Book</th>
              <th>Total Stock</th>
              <th>Available</th>
              <th>Reserved</th>
            </tr>
          </thead>

          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.total}</td>
                <td>{item.available}</td>
                <td>{item.reserved}</td>
              </tr>
            ))}

            {inventory.length === 0 && !error && (
              <tr>
                <td colSpan="4" className="empty">
                  No inventory data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Inventory;
