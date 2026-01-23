// src/pages/ResetPassword.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError("Invalid reset link. Please request a new password reset.");
        setIsValidating(false);
        return;
      }

      try {
        // Validate the token before allowing password reset
        await api.post("/auth/validate-reset-token", {
          email,
          token
        });
        setIsValidating(false);
      } catch (err) {
        console.error(err);
        setError("Reset link is invalid or has expired. Please request a new one.");
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword.length > 50) {
      setError("Password must be less than 50 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check for password strength
    if (!/(?=.*[a-z])/.test(newPassword)) {
      setError("Password must contain lowercase letters");
      return;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setError("Password must contain uppercase letters");
      return;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      setError("Password must contain numbers");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        token,
        newPassword
      });

      setSuccess(res.data.message || "Password reset successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-title">Validating Reset Link</h1>
          </div>
          <p style={{ textAlign: "center", color: "#666" }}>
            Please wait while we validate your reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path 
                d="M20 5L35 12v16c0 8-15 12-15 12s-15-4-15-12V12l15-7z" 
                fill="url(#grad)" 
                stroke="none"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                  <stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">Reset Your Password</h1>
          <p className="login-subtitle">Create a strong new password for your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!success && !error && (
          <form className="login-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-input-wrapper">
                <input
                  className="form-input password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <p style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                Must be 6+ characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {error && (
          <a href="/login" style={{ display: "block", textAlign: "center", marginTop: "15px", color: "#667eea" }}>
            Back to Login - Request New Reset Link
          </a>
        )}

        <div className="login-footer">
          Your password will be reset securely for all roles
        </div>
      </div>
    </div>
  );
}