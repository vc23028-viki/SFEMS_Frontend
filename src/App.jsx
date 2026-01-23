import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import Navigation from "./pages/Navigation";
import Home from "./pages/Home";
import Equipment from "./pages/Equipment";
import MaintenanceSchedules from "./pages/Maintenance_schedules";
import MaintenanceTask from "./pages/Maintenance_Task";
import ProductionLogs from "./pages/Production_logs";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import "./App.css";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    if (isLoggedIn) {
      sessionStorage.setItem("isLoggedIn", "true");
    } else {
      sessionStorage.removeItem("isLoggedIn");
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.clear();
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <Navigation onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="maintenance-schedules" element={<MaintenanceSchedules />} />
        <Route path="maintenance-task" element={<MaintenanceTask />} />
        <Route path="production-logs" element={<ProductionLogs />} />
        <Route path="user-management" element={<UserManagement />} />
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;