// src/pages/Production_logs.jsx

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./production_logs.css";

export default function ProductionLogs() {
  const { isAdmin, isOperator } = useAuth();
  const [logs, setLogs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [newLog, setNewLog] = useState({
    equipment_id: "",
    production_count: "",
    produced_at: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both logs and equipment
      const [logsRes, equipmentRes] = await Promise.all([
        api.get("/production"),
        api.get("/equipment")
      ]);
      setLogs(logsRes.data);
      setEquipment(equipmentRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.equipment_id || !newLog.production_count) {
      alert("Please fill in all fields");
      return;
    }

    if (!isAdmin && !isOperator) {
      alert("Only admins and operators can add production logs");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/production", {
        equipment_id: parseInt(newLog.equipment_id),
        production_count: parseInt(newLog.production_count),
        produced_at: newLog.produced_at
      });

      // Refresh logs
      await fetchData();
      setNewLog({
        equipment_id: "",
        production_count: "",
        produced_at: new Date().toISOString().split('T')[0]
      });
      alert("Production log added successfully!");
    } catch (err) {
      console.error("Error adding log:", err);
      alert(err.response?.data?.error || "Failed to add production log");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLog = async (id, updatedData) => {
    try {
      const currentLog = logs.find(l => l.id === id);
      if (!currentLog) {
        alert("Log not found");
        return;
      }

      // Merge updated fields with existing data
      const completeData = {
        equipment_id: currentLog.equipment_id,
        production_count: updatedData.production_count || currentLog.production_count,
        produced_at: currentLog.produced_at,
        ...updatedData
      };

      await api.put(`/production/${id}`, completeData);
      setLogs(logs.map(log => log.id === id ? { ...log, ...updatedData } : log));
      setEditingId(null);
      alert("Production log updated successfully!");
    } catch (err) {
      console.error("Error updating log:", err);
      alert(err.response?.data?.message || "Failed to update production log");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="production-container">
      <Link to="/" className="back-btn">← Back to Home</Link>
      <h1>Production Logs</h1>

      {/* Check if equipment exists */}
      {equipment.length === 0 ? (
        <div style={{ 
          background: "rgba(239, 68, 68, 0.2)", 
          border: "1px solid rgba(239, 68, 68, 0.5)",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
          color: "#fca5a5",
          textAlign: "center"
        }}>
          <p>⚠️ <strong>No equipment found!</strong></p>
          <p>Please add equipment first before recording production logs.</p>
          <Link to="equipment" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            Go to Equipment Management →
          </Link>
        </div>
      ) : (
        <>
          {/* ADMIN & OPERATOR - Add Production Log Form */}
          {(isAdmin || isOperator) && (
            <div className="add-form">
              <h2>Record Production</h2>
              <div className="form-group">
                <select
                  value={newLog.equipment_id}
                  onChange={(e) => setNewLog({ ...newLog, equipment_id: e.target.value })}
                  disabled={submitting}
                >
                  <option value="">Select Equipment</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.machine_type})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Production Count (units)"
                  value={newLog.production_count}
                  onChange={(e) => setNewLog({ ...newLog, production_count: e.target.value })}
                  disabled={submitting}
                  min="0"
                />
                <input
                  type="date"
                  value={newLog.produced_at}
                  onChange={(e) => setNewLog({ ...newLog, produced_at: e.target.value })}
                  disabled={submitting}
                />
                <button 
                  onClick={handleAddLog} 
                  disabled={submitting} 
                  className="btn btn-primary"
                >
                  {submitting ? "Adding..." : "Add Log"}
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTION LOGS LIST */}
          <div className="logs-list">
            <h2>Production Logs ({logs.length})</h2>
            {logs.length === 0 ? (
              <p style={{ color: "white", opacity: 0.7, textAlign: "center", padding: "20px" }}>
                No production logs found. Record production above.
              </p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="log-card">
                  <div>
                    <p className="log-name">
                      {equipment.find(eq => eq.id === log.equipment_id)?.name || "Unknown Equipment"}
                    </p>
                    <p className="log-meta">
                      Production: <strong>{log.production_count} units</strong>
                    </p>
                    <p className="log-meta" style={{ fontSize: "12px", opacity: 0.6 }}>
                      Date: {log.produced_at ? new Date(log.produced_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="card-actions">
                    {(isAdmin || isOperator) && !editingId && (
                      <button
                        onClick={() => setEditingId(log.id)}
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                    )}
                    {editingId === log.id && (
                      <>
                        <input
                          type="number"
                          defaultValue={log.production_count}
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            if (newVal || newVal === 0) {
                              handleUpdateLog(log.id, { production_count: newVal });
                            }
                          }}
                          className="production-input"
                          placeholder="Production"
                          min="0"
                        />
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-secondary"
                        >
                          Done
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* VIEW ONLY MESSAGE */}
          {!isAdmin && !isOperator && logs.length > 0 && (
            <div className="view-only-message">
              <p>You have view-only access. Only admins and operators can record production logs.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}