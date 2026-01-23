// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Only restore user from sessionStorage (not localStorage)
    // sessionStorage clears when browser closes
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      // Save to sessionStorage only (NOT localStorage)
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      // Clear session when logging out
      sessionStorage.removeItem("user");
    }
  }, [user]);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isLoggedIn");
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasPermission = (permission) => {
    const role = user?.role;
    const permissions = {
      admin: ["view", "add", "edit", "delete", "register", "manage_users"],
      operator: ["view", "add", "edit"],
      user: ["view"]
    };
    return permissions[role]?.includes(permission) || false;
  };

  const isAdmin = user?.role === "admin";
  const isOperator = user?.role === "operator";
  const isUser = user?.role === "user";

  const value = {
    user,
    login,
    logout,
    hasRole,
    hasPermission,
    isAdmin,
    isOperator,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;