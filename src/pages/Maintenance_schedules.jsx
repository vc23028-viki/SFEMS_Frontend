// src/pages/Maintenance_schedules.jsx


import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./maintenance_schedules.css";


export default function MaintenanceSchedules() {
  const { isAdmin, isOperator } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ 
    equipment_id: "", 
    schedule_date: "",
    task_description: ""
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, equipmentRes] = await Promise.all([
        api.get("/schedules"),
        api.get("/equipment")
      ]);
      setSchedules(schedulesRes.data);
      setEquipment(equipmentRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSchedule.equipment_id || !newSchedule.schedule_date || !newSchedule.task_description) {
      alert("Please fill in all fields");
      return;
    }

    if (!isAdmin && !isOperator) {
      alert("Only admins and operators can add schedules");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/schedules", { 
        equipment_id: parseInt(newSchedule.equipment_id),
        schedule_date: newSchedule.schedule_date,
        task_description: newSchedule.task_description,
        status: "Scheduled"
      });
      
      // Refresh schedules list
      await fetchData();
      setNewSchedule({ equipment_id: "", schedule_date: "", task_description: "" });
      alert("Schedule created successfully!");
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert(err.response?.data?.error || "Failed to create schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Only admins can delete schedules");
      return;
    }

    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await api.delete(`/schedules/${id}`);
        setSchedules(schedules.filter(s => s.id !== id));
        alert("Schedule deleted successfully!");
      } catch (err) {
        console.error("Error deleting schedule:", err);
        alert(err.response?.data?.error || "Failed to delete schedule");
      }
    }
  };

  const handleUpdate = async (id, updated) => {
    try {
      await api.put(`/schedules/${id}`, updated);
      setSchedules(schedules.map(s => s.id === id ? { ...s, ...updated } : s));
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert("Failed to update schedule");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="schedules-container">
      <Link to="/" className="back-btn">← Back to Home</Link>
      <h1>Maintenance Schedules</h1>

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
          <p>Please add equipment first before creating schedules.</p>
          <Link to="equipment" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            Go to Equipment Management →
          </Link>
        </div>
      ) : (
        <>
          {(isAdmin || isOperator) && (
            <div className="add-form">
              <h2>Schedule Maintenance</h2>
              <div className="form-group">
                <select
                  value={newSchedule.equipment_id}
                  onChange={(e) => setNewSchedule({ ...newSchedule, equipment_id: e.target.value })}
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
                  type="date"
                  value={newSchedule.schedule_date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, schedule_date: e.target.value })}
                  disabled={submitting}
                />
                <input
                  type="text"
                  placeholder="Task description"
                  value={newSchedule.task_description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, task_description: e.target.value })}
                  disabled={submitting}
                />
                <button onClick={handleAdd} disabled={submitting} className="btn btn-primary">
                  {submitting ? "Creating..." : "Add Schedule"}
                </button>
              </div>
            </div>
          )}

          <div className="schedules-list">
            <h2>Schedules List ({schedules.length})</h2>
            {schedules.length === 0 ? (
              <p style={{ color: "white", opacity: 0.7, textAlign: "center", padding: "20px" }}>
                No schedules found. Create a new schedule above.
              </p>
            ) : (
              schedules.map(schedule => (
                <div key={schedule.id} className="schedule-card">
                  <div>
                    <p className="schedule-name">{schedule.equipment_name || schedule.equipment}</p>
                    <p className="schedule-meta">
                      Task: {schedule.task_description}
                    </p>
                    <p className="schedule-meta">
                      Date: {new Date(schedule.schedule_date).toLocaleDateString()} | Status: {schedule.status}
                    </p>
                  </div>
                  <div className="card-actions">
                    {(isAdmin || isOperator) && (
                      <>
                        <select
                          value={schedule.status}
                          onChange={(e) => handleUpdate(schedule.id, { status: e.target.value })}
                          className="status-select"
                        >
                          <option>Scheduled</option>
                          <option>Pending</option>
                          <option>Completed</option>
                        </select>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {!isAdmin && !isOperator && (
            <div className="view-only-message">
              <p>📖 You have view-only access. Only admins and operators can create/edit schedules.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}