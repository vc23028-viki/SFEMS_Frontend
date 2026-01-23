// src/pages/Login.jsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./login.css";
import UMPSALogo from '../assets/vgdynamic-logo.png';

export default function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Registration state
  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) return false;
    try {
      const res = await api.post("/auth/check-username", { username });
      return !res.data.exists;
    } catch (err) {
      console.error("Error checking username:", err);
      return false;
    }
  };

  // Check email availability
  const checkEmailAvailability = async (userEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) return false;
    try {
      const res = await api.post("/auth/check-email", { email: userEmail });
      return !res.data.exists;
    } catch (err) {
      console.error("Error checking email:", err);
      return false;
    }
  };

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role
      });

      const userData = {
        id: res.data.id || email,
        email: email,
        role: res.data.role || role,
        token: res.data.token || "demo-token"
      };

      login(userData);
      setSuccess("Login successful! Redirecting...");
      
      // Save to sessionStorage
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userRole", userData.role);
      
      setTimeout(() => {
        onLoginSuccess?.();
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    // Validation
    if (!regUsername || !regEmail || !regPassword || !regConfirmPassword) {
      setRegError("Please fill in all fields");
      return;
    }

    if (regUsername.length < 3) {
      setRegError("Username must be at least 3 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError("Please enter a valid email");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    setRegLoading(true);

    try {
      // Check availability
      const usernameAvailable = await checkUsernameAvailability(regUsername);
      const emailAvailable = await checkEmailAvailability(regEmail);

      if (!usernameAvailable) {
        setRegError("Username already taken");
        setRegLoading(false);
        return;
      }

      if (!emailAvailable) {
        setRegError("Email already registered");
        setRegLoading(false);
        return;
      }

      // Register user
      const res = await api.post("/auth/register", {
        username: regUsername,
        email: regEmail,
        password: regPassword,
        role: "user" // Always register as user
      });

      setRegSuccess("Registration successful! Please sign in with your credentials.");
      
      // Clear registration form
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      // Switch back to login form after 2 seconds
      setTimeout(() => {
        setShowRegister(false);
        setEmail(regEmail);
        setPassword("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setRegError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="vgdynamic-logo">
            <img src={UMPSALogo} alt="UMPSA Logo" style={{ width: '100px', height: 'auto', objectFit: 'contain' }} />
          </div>

          <h1 className="login-title">
            {showRegister ? "Create Account" : "Welcome To F.E.M.S"}
          </h1>
          <p className="login-subtitle">
            {showRegister ? "Register to access F.E.M.S" : "Sign in to your account"}
          </p>
        </div>

        {!showRegister ? (
          // LOGIN FORM
          <>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    className="form-input password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="user">👤 User</option>
                  <option value="operator">👷 Operator</option>
                  <option value="admin">👨‍💼 Admin</option>
                </select>
              </div>

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading-text">
                    <span className="spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {!success && (
              <div className="login-footer">
                <strong>New user?</strong>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#667eea",
                    marginLeft: "5px",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "inherit"
                  }}
                >
                  Register here
                </button>
              </div>
            )}
          </>
        ) : (
          // REGISTRATION FORM
          <>
            {regError && <div className="error-message">{regError}</div>}
            {regSuccess && <div className="success-message">{regSuccess}</div>}

            <form className="login-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Choose a username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  disabled={regLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  disabled={regLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    className="form-input password-input"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={regLoading}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    disabled={regLoading}
                  >
                    {showRegPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="form-input"
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  disabled={regLoading}
                  required
                />
              </div>

              <button
                className="login-button"
                type="submit"
                disabled={regLoading}
              >
                {regLoading ? (
                  <span className="loading-text">
                    <span className="spinner"></span>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="login-footer">
              Already have an account?
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  marginLeft: "5px",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "inherit"
                }}
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}