// src/pages/Maintenance_Task.jsx - WITH ALERTS

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./maintenance_task.css";

export default function MaintenanceTask() {
  const { isAdmin, isOperator } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [newTask, setNewTask] = useState({ 
    equipment_id: "", 
    description: "", 
    task_date: new Date().toISOString().split('T')[0],
    status: "Pending" 
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both tasks and equipment
      const [tasksRes, equipmentRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/equipment")
      ]);
      setTasks(tasksRes.data);
      setEquipment(equipmentRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ALERT LOGIC - Determine alert type based on task date and status
  const getAlertInfo = (task) => {
    if (task.status === "Completed") {
      return {
        type: "blue",
        color: "#3b82f6",
        bgColor: "rgba(59, 130, 246, 0.15)",
        borderColor: "#3b82f6",
        icon: "✓",
        message: "Task completed successfully"
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.task_date);
    taskDate.setHours(0, 0, 0, 0);
    
    const daysUntilDue = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      // OVERDUE - Red Alert
      return {
        type: "red",
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.15)",
        borderColor: "#ef4444",
        icon: "⚠️",
        message: `OVERDUE by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''}! Complete immediately!`
      };
    } else if (daysUntilDue === 0) {
      // DUE TODAY - Orange Alert
      return {
        type: "orange",
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.15)",
        borderColor: "#f59e0b",
        icon: "🟠",
        message: "Due today - Start immediately!"
      };
    } else if (daysUntilDue <= 3) {
      // DUE VERY SOON - Orange Alert
      return {
        type: "orange",
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.15)",
        borderColor: "#f59e0b",
        icon: "🟠",
        message: `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} - Prepare to start`
      };
    } else if (daysUntilDue <= 7) {
      // DUE WITHIN A WEEK - Light Orange
      return {
        type: "orange",
        color: "#fbbf24",
        bgColor: "rgba(251, 191, 36, 0.1)",
        borderColor: "#fbbf24",
        icon: "📅",
        message: `Due in ${daysUntilDue} days - Coming up`
      };
    } else {
      // ON SCHEDULE - Green
      return {
        type: "green",
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "#10b981",
        icon: "✅",
        message: "On schedule"
      };
    }
  };

  const handleAdd = async () => {
    if (!newTask.equipment_id || !newTask.description || !newTask.task_date) {
      alert("Please fill in all fields");
      return;
    }

    if (!isAdmin && !isOperator) {
      alert("Only admins and operators can add tasks");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/tasks", newTask);
      setTasks([...tasks, res.data]);
      setNewTask({ 
        equipment_id: "", 
        description: "", 
        task_date: new Date().toISOString().split('T')[0],
        status: "Pending" 
      });
      alert("Task created successfully!");
    } catch (err) {
      console.error("Error creating task:", err);
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert("Only admins can delete tasks");
      return;
    }

    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${id}`);
        setTasks(tasks.filter(t => t.id !== id));
        alert("Task deleted successfully!");
      } catch (err) {
        console.error("Error deleting task:", err);
        alert(err.response?.data?.message || "Failed to delete task");
      }
    }
  };

  const handleUpdate = async (id, updated) => {
    try {
      // Find the current task to get all existing data
      const currentTask = tasks.find(t => t.id === id);
      if (!currentTask) {
        alert("Task not found");
        return;
      }

      // Merge updated fields with existing data
      const updatedTask = {
        equipment_id: currentTask.equipment_id,
        description: currentTask.description,
        task_date: currentTask.task_date,
        status: updated.status || currentTask.status,
        ...updated
      };

      await api.put(`/tasks/${id}`, updatedTask);
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updated } : t));
    } catch (err) {
      console.error("Error updating task:", err);
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="tasks-container">
      <Link to="/" className="back-btn">← Back to Home</Link>
      <h1>Maintenance Tasks</h1>

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
          <p>Please add equipment first before creating tasks.</p>
          <Link to="equipment" style={{ color: "#3b82f6", textDecoration: "underline" }}>
            Go to Equipment Management →
          </Link>
        </div>
      ) : (
        <>
          {/* ADMIN & OPERATOR - Add Task Form */}
          {(isAdmin || isOperator) && (
            <div className="add-form">
              <h2>Create New Task</h2>
              <div className="form-group">
                <select
                  value={newTask.equipment_id}
                  onChange={(e) => setNewTask({ ...newTask, equipment_id: e.target.value })}
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
                  type="text"
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  disabled={submitting}
                />
                <input
                  type="date"
                  value={newTask.task_date}
                  onChange={(e) => setNewTask({ ...newTask, task_date: e.target.value })}
                  disabled={submitting}
                />
                <button onClick={handleAdd} disabled={submitting} className="btn btn-primary">
                  {submitting ? "Creating..." : "Add Task"}
                </button>
              </div>
            </div>
          )}

          {/* TASKS LIST WITH ALERTS */}
          <div className="tasks-list">
            <h2>Tasks List ({tasks.length})</h2>
            {tasks.length === 0 ? (
              <p style={{ color: "white", opacity: 0.7, textAlign: "center", padding: "20px" }}>
                No tasks found. Create a new task above.
              </p>
            ) : (
              tasks.map(task => {
                const alert = getAlertInfo(task);
                
                return (
                  <div 
                    key={task.id} 
                    className="task-card"
                    style={{
                      backgroundColor: alert.bgColor,
                      borderLeft: `4px solid ${alert.color}`,
                      borderRadius: "8px"
                    }}
                  >
                    <div>
                      <p className="task-name">{task.description}</p>
                      <p className="task-meta">
                        Equipment: {equipment.find(eq => eq.id === task.equipment_id)?.name || "Unknown"} | Status: {task.status}
                      </p>
                      <p className="task-meta" style={{ fontSize: "12px", opacity: 0.6 }}>
                        Date: {task.task_date ? new Date(task.task_date).toLocaleDateString() : "N/A"}
                      </p>
                      
                      {/* ALERT MESSAGE */}
                      <div style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        borderRadius: "4px",
                        borderLeft: `3px solid ${alert.color}`,
                        fontSize: "13px",
                        fontWeight: "500",
                        color: alert.color
                      }}>
                        {alert.icon} {alert.message}
                      </div>
                    </div>
                    <div className="card-actions">
                      {(isAdmin || isOperator) && (
                        <>
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdate(task.id, { status: e.target.value })}
                            className="status-select"
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="btn btn-danger"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* VIEW ONLY MESSAGE */}
          {!isAdmin && !isOperator && (
            <div className="view-only-message">
              <p>You have view-only access. Only admins and operators can create/edit tasks.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}