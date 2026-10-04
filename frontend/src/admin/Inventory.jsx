import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin";

function Inventory() {
  const [inventory, setInventory] = useState([]);

  const loadInventory = async () => {
    const response = await fetch(`${API}/inventory`);
    const data = await response.json();
    setInventory(data);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return (
    <section>
      <div className="page-header">
        <h1>Inventory</h1>
        <p>Monitor total, available and reserved stock.</p>
      </div>

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

            {inventory.length === 0 && (
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
