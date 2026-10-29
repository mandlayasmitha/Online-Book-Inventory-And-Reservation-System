
import React, { useEffect, useState } from "react";

const API = "http://localhost:5001/api/admin";

function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users");
      }

      setUsers(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load users.");
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const changeStatus = async (id, status) => {
    try {
      const response = await fetch(`${API}/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user status");
      }

      alert(data.message || "User status updated.");
      await loadUsers();
    } catch (err) {
      alert(err.message || "Unable to update user status.");
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>User Management</h1>
        <p>View users and manage their active status.</p>
      </div>

      {error && <p role="alert">{error}</p>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button
                    className="small"
                    type="button"
                    onClick={() =>
                      changeStatus(
                        user._id,
                        user.status === "Active" ? "Inactive" : "Active"
                      )
                    }
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && !error && (
              <tr>
                <td colSpan="5" className="empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UserManagement;
