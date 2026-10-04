import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin";

function UserManagement() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const response = await fetch(`${API}/users`);
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeStatus = async (id, status) => {
    const response = await fetch(`${API}/users/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    alert(data.message);
    loadUsers();
  };

  return (
    <section>
      <div className="page-header">
        <h1>User Management</h1>
        <p>View users and manage their active status.</p>
      </div>

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
                    onClick={() =>
                      changeStatus(
                        user._id,
                        user.status === "Active" ? "Inactive" : "Active",
                      )
                    }
                  >
                    {user.status === "Active" ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
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
