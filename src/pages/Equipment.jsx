// ========================================
// src/pages/Equipment.jsx - With Role-Based Access (No Delete)
// ========================================
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./Equipment.css";

export default function Equipment() {
  const { isAdmin, isOperator } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [newEquip, setNewEquip] = useState({ 
    name: "", 
    machine_type: "", 
    status: "Active",
    capacity: 0
  });
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await api.get("/equipment");
      setEquipment(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!isAdmin) {
      alert("Only admins can add equipment");
      return;
    }

    if (!newEquip.name.trim() || !newEquip.machine_type.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      const res = await api.post("/equipment", newEquip);
      setEquipment([...equipment, res.data]);
      setNewEquip({ name: "", machine_type: "", status: "Active", capacity: 0 });
      alert("Equipment added successfully!");
    } catch (error) {
      console.error("Error adding equipment:", error);
      alert("Failed to add equipment: " + error.message);
    }
  };

  const handleEdit = async (id, updated) => {
    if (!isAdmin) {
      alert("Only admins can edit equipment");
      return;
    }

    try {
      await api.put(`/equipment/${id}`, updated);
      setEquipment(equipment.map(e => e.id === id ? { ...e, ...updated } : e));
      setEditId(null);
      alert("Equipment updated successfully!");
    } catch (error) {
      console.error("Error updating equipment:", error);
      alert("Failed to update equipment");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="equipment-container">
      <Link to="/" className="back-btn">← Back to Home</Link>
      <h1>Equipment Management</h1>

      {/* ADMIN ONLY - Add Equipment Form */}
      {isAdmin && (
        <div className="add-form">
          <h2>Add New Equipment (Admin Only)</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Equipment name"
              value={newEquip.name}
              onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Machine type (e.g., Drilling, Welding)"
              value={newEquip.machine_type}
              onChange={(e) => setNewEquip({ ...newEquip, machine_type: e.target.value })}
            />
            <input
              type="number"
              placeholder="Capacity"
              value={newEquip.capacity}
              onChange={(e) => setNewEquip({ ...newEquip, capacity: parseInt(e.target.value) || 0 })}
            />
            <select 
              value={newEquip.status} 
              onChange={(e) => setNewEquip({ ...newEquip, status: e.target.value })}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Maintenance</option>
              <option>Running</option>
            </select>
            <button onClick={handleAdd} className="btn btn-primary">Add Equipment</button>
          </div>
        </div>
      )}

      {/* EQUIPMENT LIST */}
      <div className="equipment-list">
        <h2>Equipment List</h2>
        {equipment.length === 0 ? (
          <p style={{ color: "white", opacity: 0.7 }}>No equipment found.</p>
        ) : (
          equipment.map(equip => (
            <div key={equip.id} className="equipment-card">
              {editId === equip.id && isAdmin ? (
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={equip.name}
                    onChange={(e) => {
                      const updated = { ...equip, name: e.target.value };
                      setEquipment(equipment.map(eq => eq.id === equip.id ? updated : eq));
                    }}
                    placeholder="Equipment name"
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <input
                    type="text"
                    value={equip.machine_type}
                    onChange={(e) => {
                      const updated = { ...equip, machine_type: e.target.value };
                      setEquipment(equipment.map(eq => eq.id === equip.id ? updated : eq));
                    }}
                    placeholder="Machine type"
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <input
                    type="number"
                    value={equip.capacity}
                    onChange={(e) => {
                      const updated = { ...equip, capacity: parseInt(e.target.value) || 0 };
                      setEquipment(equipment.map(eq => eq.id === equip.id ? updated : eq));
                    }}
                    placeholder="Capacity"
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <input
                    type="date"
                    value={equip.last_maintenance ? equip.last_maintenance.split('T')[0] : ''}
                    onChange={(e) => {
                      const updated = { ...equip, last_maintenance: e.target.value };
                      setEquipment(equipment.map(eq => eq.id === equip.id ? updated : eq));
                    }}
                    placeholder="Last Maintenance"
                    style={{ width: "100%", marginBottom: "10px" }}
                  />
                  <select
                    value={equip.status}
                    onChange={(e) => {
                      const updated = { ...equip, status: e.target.value };
                      setEquipment(equipment.map(eq => eq.id === equip.id ? updated : eq));
                    }}
                    style={{ width: "100%", marginBottom: "10px" }}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Maintenance</option>
                    <option>Running</option>
                  </select>
                </div>
              ) : (
                <div>
                  <p className="equipment-name">{equip.name}</p>
                  <p className="equipment-meta">
                    Type: {equip.machine_type} | Status: {equip.status} | Capacity: {equip.capacity}
                  </p>
                  <p className="equipment-meta" style={{ fontSize: "12px", opacity: 0.6 }}>
                    Last Maintenance: {new Date(equip.last_maintenance).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="card-actions">
                {isAdmin && (
                  <>
                    {editId === equip.id ? (
                      <>
                        <button 
                          onClick={() => handleEdit(equip.id, equip)}
                          className="btn btn-primary"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditId(null)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setEditId(equip.id)}
                          className="btn btn-secondary"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW ONLY MESSAGE FOR NON-ADMINS */}
      {!isAdmin && (
        <div className="view-only-message">
          <p>You have view-only access. Only admins can add and edit equipment.</p>
        </div>
      )}
    </div>
  );
}