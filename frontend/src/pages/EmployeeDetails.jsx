import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiGet, apiPostRaw } from "../services/api";

function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [designation, setDesignation] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const emp = await apiGet(`/employees/${id}`);
      setEmployee(emp);

      const [deps, desigs, att, lea, pay] = await Promise.all([
        apiGet("/departments").catch(() => []),
        apiGet("/designations").catch(() => []),
        apiGet("/attendance").catch(() => []),
        apiGet("/leaves").catch(() => []),
        apiGet("/payroll").catch(() => []),
      ]);

      setDepartment(
        deps.find((d) => d.id === emp.departmentId) || null
      );

      setDesignation(
        desigs.find((d) => d.id === emp.designationId) || null
      );

      setAttendance(
        att.filter((a) => a.employeeId === emp.id)
      );

      setLeaves(
        lea.filter((l) => l.employeeId === emp.id)
      );

      setPayroll(
        pay.filter((p) => p.employeeId === emp.id)
      );
    } catch (err) {
      setError(err.message || "Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLogin = async () => {
    setLoginMsg("");

    if (!loginUsername || !loginPassword) {
      setLoginMsg("Username and password are required.");
      return;
    }

    try {
      const result = await apiPostRaw(`/employees/${id}/create-login`, {
        username: loginUsername,
        password: loginPassword,
      });

      setLoginMsg(
        typeof result === "string"
          ? result
          : result?.message || "Login created successfully."
      );

      setLoginUsername("");
      setLoginPassword("");
    } catch (err) {
      setLoginMsg(err.message || "Failed to create login.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="status-msg">Loading...</p>
      </Layout>
    );
  }

  if (error || !employee) {
    return (
      <Layout>
        <p className="status-msg error">
          {error || "Employee not found"}
        </p>
      </Layout>
    );
  }

  const initials = `${employee.firstName?.[0] || ""}${
    employee.lastName?.[0] || ""
  }`;

  return (
    <Layout>
      <div className="module-view-header">
        <h1>Employee Details</h1>

        <button
          className="back-btn"
          onClick={() => navigate("/modules/employees")}
        >
          ← Back to Employees
        </button>
      </div>

      <div className="profile-container">

        {/* LEFT SIDE - EMPLOYEE PROFILE */}
        <div className="profile-card">

          <div className="profile-avatar">
            {initials || "?"}
          </div>

          <h2>
            {employee.firstName} {employee.lastName}
          </h2>

          <p className="profile-role">
            {designation ? designation.name : "—"}
          </p>

          <span
            className={`profile-status ${
              employee.status === "ACTIVE"
                ? "status-active"
                : "status-inactive"
            }`}
          >
            {employee.status}
          </span>

          <div className="profile-info-list">

            <div className="profile-info-row">
              <span className="info-label">
                Employee Code
              </span>
              <span className="info-value">
                {employee.employeeCode || "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Email
              </span>
              <span className="info-value">
                {employee.email || "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Phone
              </span>
              <span className="info-value">
                {employee.phone || "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Gender
              </span>
              <span className="info-value">
                {employee.gender || "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Date of Birth
              </span>
              <span className="info-value">
                {employee.dateOfBirth || "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Date of Joining
              </span>
              <span className="info-value">
                {employee.dateOfJoining || "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Department
              </span>
              <span className="info-value">
                {department ? department.name : "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Designation
              </span>
              <span className="info-value">
                {designation ? designation.name : "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Address
              </span>
              <span className="info-value">
                {employee.address || "—"}
              </span>
            </div>

          </div>

          {/* CREATE LOGIN */}
          {employee.status === "ACTIVE" && (
            <div className="create-login-section">

              {!showLoginForm ? (
                <button
                  className="add-btn"
                  onClick={() => {
                    setShowLoginForm(true);
                    setLoginMsg("");
                  }}
                >
                  + Create Login
                </button>
              ) : (
                <div className="login-form-inline">

                  <input
                    type="text"
                    placeholder="Username"
                    value={loginUsername}
                    onChange={(e) =>
                      setLoginUsername(e.target.value)
                    }
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) =>
                      setLoginPassword(e.target.value)
                    }
                  />

                  <button
                    className="add-btn"
                    onClick={handleCreateLogin}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => {
                      setShowLoginForm(false);
                      setLoginMsg("");
                    }}
                  >
                    Cancel
                  </button>

                  {loginMsg && (
                    <p className="login-msg">
                      {loginMsg}
                    </p>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT SIDE - WIDGETS */}
        <div className="profile-side">

          {/* RECENT ATTENDANCE */}
          <div className="widget-card">

            <h3>🕒 Recent Attendance</h3>

            {attendance.length === 0 ? (
              <p className="empty-state-small">
                No attendance records
              </p>
            ) : (
              <table className="mini-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.slice(0, 5).map((a) => (
                    <tr key={a.id}>

                      <td>
                        {a.attendanceDate || "—"}
                      </td>

                      <td>
                        {a.status || "—"}
                      </td>

                      <td>
                        {a.workingHours ?? "—"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>

          {/* LEAVE HISTORY */}
          <div className="widget-card">

            <h3>📅 Leave History</h3>

            {leaves.length === 0 ? (
              <p className="empty-state-small">
                No leave records
              </p>
            ) : (
              <table className="mini-table">

                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id}>

                      <td>
                        {l.leaveType || "—"}
                      </td>

                      <td>
                        {l.startDate || "—"} →{" "}
                        {l.endDate || "—"}
                      </td>

                      <td>
                        {l.status || "—"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>

          {/* PAYROLL HISTORY */}
          <div className="widget-card">

            <h3>💰 Payroll History</h3>

            {payroll.length === 0 ? (
              <p className="empty-state-small">
                No payroll records
              </p>
            ) : (
              <table className="mini-table">

                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payroll.map((p) => (
                    <tr key={p.id}>

                      <td>
                        {p.month || "—"}
                      </td>

                      <td>
                        ₹{p.netSalary ?? "—"}
                      </td>

                      <td>
                        {p.paymentStatus || "—"}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default EmployeeDetails;