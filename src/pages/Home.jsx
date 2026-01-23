// ========================================
// src/pages/Home.jsx - WITH CALENDAR ALERTS
// ========================================
import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, Wrench, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Home.css";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [equipment, setEquipment] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [production, setProduction] = useState([]);
  const [stats, setStats] = useState({ totalEquipment: 0, activeTasks: 0, totalProduction: 0 });
  const [equipmentChart, setEquipmentChart] = useState([]);
  const [taskChart, setTaskChart] = useState([]);
  const [productionChart, setProductionChart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Color mapping for equipment statuses
  const EQUIPMENT_COLORS = {
    Active: "#3b82f6",
    Inactive: "#ef4444",
    Maintenance: "#f59e0b",
    Running: "#10b981"
  };

  const TASK_COLORS = ['#667eea', '#f093fb', '#4facfe'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [equipRes, tasksRes, prodRes] = await Promise.all([
        api.get("/equipment"),
        api.get("/tasks"),
        api.get("/production")
      ]);

      const equipmentData = equipRes.data || [];
      const tasksData = tasksRes.data || [];
      const productionData = prodRes.data || [];

      setEquipment(equipmentData);
      setTasks(tasksData);
      setProduction(productionData);

      setStats({
        totalEquipment: equipmentData.length,
        activeTasks: tasksData.filter(t => t.status === "In Progress").length,
        totalProduction: productionData.reduce((sum, p) => sum + (p.production_count || 0), 0)
      });

      const equipmentStatus = {
        Active: equipmentData.filter(e => e.status === "Active").length,
        Inactive: equipmentData.filter(e => e.status === "Inactive").length,
        Maintenance: equipmentData.filter(e => e.status === "Maintenance").length,
        Running: equipmentData.filter(e => e.status === "Running").length
      };
      setEquipmentChart(Object.entries(equipmentStatus).map(([key, value]) => ({ name: key, value })));

      const taskStatus = {
        Pending: tasksData.filter(t => t.status === "Pending").length,
        "In Progress": tasksData.filter(t => t.status === "In Progress").length,
        Completed: tasksData.filter(t => t.status === "Completed").length
      };
      setTaskChart(Object.entries(taskStatus).map(([key, value]) => ({ name: key, value })));

      const productionByEquipment = {};
      productionData.forEach(p => {
        const eqId = p.equipment_id;
        const eqName = equipmentData.find(eq => eq.id === eqId)?.name || `Equipment ${eqId}`;
        productionByEquipment[eqName] = (productionByEquipment[eqName] || 0) + p.production_count;
      });
      
      const prodChart = Object.entries(productionByEquipment).slice(0, 7).map(([eqName, count]) => ({
        equipment: eqName,
        production: count
      }));
      setProductionChart(prodChart.length > 0 ? prodChart : [{ equipment: "No Data", production: 0 }]);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ===== NEW: GET ALERT FOR A SPECIFIC DATE =====
  const getAlertForDate = (day) => {
    if (!day) return null;

    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];

    // Find tasks for this date
    const tasksOnDate = tasks.filter(task => {
      const taskDate = new Date(task.task_date).toISOString().split('T')[0];
      return taskDate === dateStr && task.status !== 'Completed';
    });

    if (tasksOnDate.length === 0) return null;

    // Count alerts by type
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    checkDate.setHours(0, 0, 0, 0);
    const daysUntilDue = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return { type: 'red', count: tasksOnDate.length, icon: '⚠️' };
    } else if (daysUntilDue === 0) {
      return { type: 'orange', count: tasksOnDate.length, icon: '🟠' };
    } else if (daysUntilDue <= 3) {
      return { type: 'orange', count: tasksOnDate.length, icon: '📅' };
    }
    return null;
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = [];
  
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth(currentDate); i++) days.push(i);

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="header-title">Factory Equipment Monitoring System</h1>
        <p className="header-time">Current Time: {currentDate.toLocaleString()}</p>
      </div>

      {/* STATS CARDS */}
      <div className="stats-cards">
        <div className="stat-card stat-card-1">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Total Equipment</p>
            <p className="stat-value">{stats.totalEquipment}</p>
          </div>
        </div>
        <div className="stat-card stat-card-2">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <p className="stat-label">Active Tasks</p>
            <p className="stat-value">{stats.activeTasks}</p>
          </div>
        </div>
        <div className="stat-card stat-card-3">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <p className="stat-label">Total Production</p>
            <p className="stat-value">{stats.totalProduction}</p>
          </div>
        </div>
      </div>

      <div className="nav-cards">
        <Link to="equipment" className="nav-card nav-card-1">
          <div className="card-icon">
            <Wrench size={40} />
          </div>
          <div className="card-text">Equipment</div>
        </Link>
        <Link to="maintenance-schedules" className="nav-card nav-card-2">
          <div className="card-icon">
            <Calendar size={40} />
          </div>
          <div className="card-text">Maintenance Schedules</div>
        </Link>
        <Link to="maintenance-task" className="nav-card nav-card-3">
          <div className="card-icon">
            <Clock size={40} />
          </div>
          <div className="card-text">Maintenance Tasks</div>
        </Link>
        <Link to="production-logs" className="nav-card nav-card-4">
          <div className="card-icon">
            <AlertCircle size={40} />
          </div>
          <div className="card-text">Production Logs</div>
        </Link>
      </div>

      <div className="charts-section">
        {/* Enhanced Equipment Status Chart */}
        <div className="chart-box chart-box-1">
          <h2>Equipment Status Distribution</h2>
          {equipmentChart.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={equipmentChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {equipmentChart.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={EQUIPMENT_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Equipment Status Summary Cards */}
              <div className="status-summary">
                {equipmentChart.map((item) => (
                  <div key={item.name} className="status-item">
                    <div
                      className="status-color"
                      style={{ backgroundColor: EQUIPMENT_COLORS[item.name] }}
                    ></div>
                    <div className="status-info">
                      <p className="status-name">{item.name}</p>
                      <p className="status-count">{item.value} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="no-data">No equipment data</p>
          )}
        </div>

        {/* Task Status Chart */}
        <div className="chart-box chart-box-2">
          <h2>Task Status Overview</h2>
          {taskChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #667eea" }} />
                <Legend />
                <Bar dataKey="value" fill="#0a2bbc" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No task data</p>
          )}
        </div>

        {/* Production Chart */}
        <div className="chart-box chart-box-3">
          <h2>Production by Equipment</h2>
          {productionChart.length > 0 && productionChart[0].production > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="equipment" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #667eea" }} />
                <Legend />
                <Line type="monotone" dataKey="production" stroke="#10b981" strokeWidth={2} name="Units Produced" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="no-data">No production data</p>
          )}
        </div>
      </div>

      <div className="calendar-alerts">
        <div className="calendar-box calendar-box-1">
          <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {days.map((day, idx) => {
              const alert = getAlertForDate(day);
              const isToday = day === currentDate.getDate();
              
              return (
                <div 
                  key={idx} 
                  className={`calendar-day ${isToday ? 'today' : ''} ${!day ? 'empty' : ''}`}
                  style={{
                    position: 'relative',
                    backgroundColor: alert ? (alert.type === 'red' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)') : '',
                    borderLeft: alert ? `3px solid ${alert.type === 'red' ? '#ef4444' : '#f59e0b'}` : ''
                  }}
                >
                  <span>{day}</span>
                  {alert && (
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: alert.type === 'red' ? '#ef4444' : '#f59e0b',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      title: `${alert.count} task(s)`
                    }}>
                      {alert.count}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Calendar Legend */}
          <div style={{ marginTop: '15px', fontSize: '12px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
              <span>Overdue Tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
              <span>Upcoming Tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
              <span>Today</span>
            </div>
          </div>
        </div>

        <div className="alerts-box alerts-box-1">
          <h2>System Summary</h2>
          <div className="alerts-list">
            <div className="alert alert-info">
              <p className="alert-title">📊 Total Equipment</p>
              <p className="alert-message">{stats.totalEquipment} equipment registered</p>
            </div>
            <div className="alert alert-warning">
              <p className="alert-title">⚙️ Pending Tasks</p>
              <p className="alert-message">{tasks.filter(t => t.status === "Pending").length} tasks pending</p>
            </div>
            <div className="alert alert-success">
              <p className="alert-title">✅ Production Today</p>
              <p className="alert-message">{stats.totalProduction} units produced</p>
            </div>
            <div className="alert alert-danger">
              <p className="alert-title">⚠️ Overdue Tasks</p>
              <p className="alert-message">
                {tasks.filter(t => {
                  const taskDate = new Date(t.task_date);
                  const today = new Date();
                  return t.status !== 'Completed' && taskDate < today;
                }).length} task(s) overdue
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}