import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = hours * 30 + minutes * 0.5;
  const minDeg = minutes * 6;
  const secDeg = seconds * 6;

  return (
    <div className="widget-card clock-widget">
      <h3>🕐 Current Time</h3>
      <div className="clock-face">
        <div className="clock-hand hour-hand" style={{ transform: `rotate(${hourDeg}deg)` }} />
        <div className="clock-hand min-hand" style={{ transform: `rotate(${minDeg}deg)` }} />
        <div className="clock-hand sec-hand" style={{ transform: `rotate(${secDeg}deg)` }} />
        <div className="clock-center" />
      </div>
      <p className="clock-digital">{time.toLocaleTimeString()}</p>
      <p className="clock-date">{time.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="widget-card calendar-widget">
      <h3>📅 {monthName}</h3>
      <div className="calendar-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="calendar-day-label">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`calendar-cell ${d === today.getDate() ? "calendar-today" : ""} ${!d ? "calendar-empty" : ""}`}
          >
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const username = localStorage.getItem("username") || "there";
  const role = localStorage.getItem("role") || "";

  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    leaves: 0,
    attendance: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [emp, dep, lea, att] = await Promise.all([
        apiGet("/employees").catch(() => []),
        apiGet("/departments").catch(() => []),
        apiGet("/leaves").catch(() => []),
        apiGet("/attendance").catch(() => []),
      ]);
      setStats({
        employees: emp.length,
        departments: dep.length,
        leaves: lea.filter((l) => l.status === "PENDING").length,
        attendance: att.length,
      });
    } catch (err) {
      // ignore
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <Layout>
      <div className="dashboard-banner">
        <div>
          <h1>{greeting()}, {username} 👋</h1>
          <p className="dashboard-role-badge">{role.replace("_", " ")}</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card" style={{ "--stat-color": "#667eea" }}>
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{stats.employees}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card" style={{ "--stat-color": "#10b981" }}>
          <div className="stat-icon">🏢</div>
          <div>
            <div className="stat-value">{stats.departments}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
        <div className="stat-card" style={{ "--stat-color": "#f59e0b" }}>
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-value">{stats.leaves}</div>
            <div className="stat-label">Pending Leaves</div>
          </div>
        </div>
        <div className="stat-card" style={{ "--stat-color": "#06b6d4" }}>
          <div className="stat-icon">🕒</div>
          <div>
            <div className="stat-value">{stats.attendance}</div>
            <div className="stat-label">Attendance Records</div>
          </div>
        </div>
      </div>

      <div className="widgets-row">
        <LiveClock />
        <MiniCalendar />
      </div>
    </Layout>
  );
}

export default Dashboard;