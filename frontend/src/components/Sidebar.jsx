import { useNavigate, useLocation } from "react-router-dom";
import { MODULES } from "../services/api";

const ADMIN_ICONS = {
  employees: "👤",
  departments: "🏢",
  designations: "🎖️",
  attendance: "🕒",
  leaves: "📅",
  payroll: "💰",
  expenses: "🧾",
  candidates: "📋",
  interviews: "🎤",
  "job-positions": "💼",
  "performance-reviews": "📈",
  "employee-documents": "📁",
};

const EMPLOYEE_MENU = [
  {
    group: "Self Service",
    icon: "🏠",
    items: [{ label: "My Profile", path: "/my/profile" }],
  },
  {
    group: "Time",
    icon: "🕒",
    items: [{ label: "My Attendance", path: "/my/attendance" }],
  },
  {
    group: "Leave",
    icon: "📅",
    items: [
      { label: "My Leaves", path: "/my/leaves" },
      { label: "Apply Leave", path: "/my/leaves/apply" },
    ],
  },
  {
    group: "Claims",
    icon: "🧾",
    items: [
      { label: "My Expenses", path: "/my/expenses" },
      { label: "Apply Expense", path: "/my/expenses/apply" },
    ],
  },
  {
    group: "Payroll",
    icon: "💰",
    items: [{ label: "My Payslips", path: "/my/payroll" }],
  },
  {
    group: "Performance",
    icon: "📈",
    items: [{ label: "My Reviews", path: "/my/performance" }],
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") || "";

  const isAdmin = [
    "SUPER_ADMIN",
    "HR_ADMIN",
    "MANAGER",
    "ACCOUNTANT",
  ].includes(role);

  const isManager =
    role === "MANAGER" ||
    role === "ROLE_MANAGER";

  const isHR =
    role === "HR_ADMIN" ||
    role === "ROLE_HR_ADMIN" ||
    role === "HR" ||
    role === "ROLE_HR";

  const canApproveLeaves = isManager || isHR;

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (isAdmin) {
    return (
      <div className="sidebar">
        <div className="sidebar-title">ERP-HRMS</div>

        <div
          className={`sidebar-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
          onClick={() => navigate("/dashboard")}
        >
          <span className="sidebar-icon">🏠</span>
          Dashboard
        </div>

        <div className="sidebar-divider" />

        {MODULES.map((mod) => (
          <div
            key={mod.key}
            className={`sidebar-item ${
              location.pathname === `/modules${mod.path}` ? "active" : ""
            }`}
            onClick={() => navigate(`/modules${mod.path}`)}
          >
            <span className="sidebar-icon">
              {ADMIN_ICONS[mod.key] || "📦"}
            </span>

            {mod.label}
          </div>
        ))}

        {/* Leave Approval Menu */}
        {canApproveLeaves && (
          <>
            <div className="sidebar-divider" />

            <div
              className={`sidebar-item ${
                location.pathname === "/leave-approvals" ? "active" : ""
              }`}
              onClick={() => navigate("/leave-approvals")}
            >
              <span className="sidebar-icon">✅</span>
              Leave Approvals
            </div>
          </>
        )}

        <div className="sidebar-divider" />

        <div className="sidebar-item logout-item" onClick={logout}>
          <span className="sidebar-icon">🚪</span>
          Logout
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-title">ERP-HRMS</div>

      <div
        className={`sidebar-item ${
          location.pathname === "/dashboard" ? "active" : ""
        }`}
        onClick={() => navigate("/dashboard")}
      >
        <span className="sidebar-icon">🏠</span>
        Dashboard
      </div>

      <div className="sidebar-divider" />

      {EMPLOYEE_MENU.map((section) => (
        <div key={section.group}>
          <div className="sidebar-group-label">
            <span className="sidebar-icon">{section.icon}</span>
            {section.group}
          </div>

          {section.items.map((item) => (
            <div
              key={item.path}
              className={`sidebar-item sidebar-subitem ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
      ))}

      <div className="sidebar-divider" />

      <div className="sidebar-item logout-item" onClick={logout}>
        <span className="sidebar-icon">🚪</span>
        Logout
      </div>
    </div>
  );
}

export default Sidebar;