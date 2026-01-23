// ========================================
// src/pages/Navigation.jsx - Updated with User Management Link
// ========================================
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./navigation.css";

export default function Navigation({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⚙️</span>
          SFEMS
        </Link>
        
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        <ul className={`nav-menu ${isOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          </li>
          <li className="nav-item">
            <Link to="equipment" className="nav-link" onClick={() => setIsOpen(false)}>Equipment</Link>
          </li>
          <li className="nav-item">
            <Link to="maintenance-schedules" className="nav-link" onClick={() => setIsOpen(false)}>Schedules</Link>
          </li>
          <li className="nav-item">
            <Link to="maintenance-task" className="nav-link" onClick={() => setIsOpen(false)}>Tasks</Link>
          </li>
          <li className="nav-item">
            <Link to="production-logs" className="nav-link" onClick={() => setIsOpen(false)}>Production</Link>
          </li>
          
          {isAdmin && (
            <li className="nav-item">
              <Link to="user-management" className="nav-link admin-link" onClick={() => setIsOpen(false)}>
                Users
              </Link>
            </li>
          )}

          <li className="nav-item user-info">
            <span className="user-display">
              {user?.email} <span className={`role-badge role-${user?.role}`}>{user?.role?.toUpperCase()}</span>
            </span>
          </li>

          <li className="nav-item logout-item">
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}