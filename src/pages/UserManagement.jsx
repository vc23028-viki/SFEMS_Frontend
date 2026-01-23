// src/pages/UserManagement.jsx

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./user-management.css";

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ 
    username: "",  // ✅ ADDED
    email: "", 
    password: "", 
    role: "operator" 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all users on page load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h1>❌ Access Denied</h1>
        <p>Only admins can access user management</p>
        <Link to="/" className="back-btn">← Back to Home</Link>
      </div>
    );
  }

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Please fill in all fields");
      return;
    }

    if (newUser.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/register", newUser);
      setUsers([...users, res.data.user]);
      setNewUser({ username: "", email: "", password: "", role: "operator" });
      alert("User registered successfully!");
    } catch (err) {
      console.error("Error registering user:", err);
      alert(err.response?.data?.message || "Failed to register user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u.id !== id));
        alert("User deleted successfully!");
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(err.response?.data?.message || "Failed to delete user");
      }
    }
  };

  return (
    <div className="user-management-container">
      <Link to="/" className="back-btn">← Back to Home</Link>
      <h1>User Management</h1>

      <div className="add-user-form">
        <h2>Register New User</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            disabled={submitting}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            disabled={submitting}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            disabled={submitting}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            disabled={submitting}
          >
            <option value="admin">👨‍💼 Admin</option>
            <option value="operator">👷 Operator</option>
            <option value="user">👤 User</option>
          </select>
          <button 
            onClick={handleAddUser} 
            disabled={submitting} 
            className="btn btn-primary"
          >
            {submitting ? "Registering..." : "Register User"}
          </button>
        </div>
      </div>

      <div className="users-list">
        <h2>All Users ({users.length})</h2>
        
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <p style={{ color: "white", opacity: 0.7, textAlign: "center", padding: "20px" }}>
            No users found. Register a new user above.
          </p>
        ) : (
          users.map(user => (
            <div key={user.id} className="user-card">
              <div>
                <p className="user-email">{user.email}</p>
                <p className="user-role">
                  Username: <strong>{user.username}</strong>
                </p>
                <p className="user-role">
                  Role: <span className={`role-badge role-${user.role}`}>
                    {user.role?.toUpperCase()}
                  </span>
                </p>
                <p className="user-date">
                  Registered: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <button 
                onClick={() => handleDeleteUser(user.id)} 
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}