import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [creatingLogin, setCreatingLogin] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      const employeeData = await apiGet(`/employees/${id}`);

      setEmployee(employeeData);

      const [departments, designations, attendanceData, leaveData, payrollData] =
        await Promise.all([
          apiGet("/departments").catch(() => []),
          apiGet("/designations").catch(() => []),
          apiGet("/attendance").catch(() => []),
          apiGet("/leaves").catch(() => []),
          apiGet("/payroll").catch(() => []),
        ]);

      setDepartment(
        departments.find(
          (item) => Number(item.id) === Number(employeeData.departmentId)
        ) || null
      );

      setDesignation(
        designations.find(
          (item) => Number(item.id) === Number(employeeData.designationId)
        ) || null
      );

      setAttendance(
        attendanceData.filter(
          (item) => Number(item.employeeId) === Number(employeeData.id)
        )
      );

      setLeaves(
        leaveData.filter(
          (item) => Number(item.employeeId) === Number(employeeData.id)
        )
      );

      setPayroll(
        payrollData.filter(
          (item) => Number(item.employeeId) === Number(employeeData.id)
        )
      );
    } catch (err) {
      setError(err.message || "Failed to load employee");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLogin = async (event) => {
    event.preventDefault();

    setLoginMsg("");

    const username = loginUsername.trim();
    const password = loginPassword;

    if (!username || !password) {
      setLoginMsg("Username and password are required.");
      return;
    }

    if (username.length < 3) {
      setLoginMsg("Username must contain at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setLoginMsg("Password must contain at least 6 characters.");
      return;
    }

    setCreatingLogin(true);

    try {
      const result = await apiPostRaw(`/employees/${id}/create-login`, {
        username,
        password,
      });

      setLoginMsg(
        typeof result === "string"
          ? result
          : result?.message || "Login created successfully."
      );

      setLoginUsername("");
      setLoginPassword("");
      setShowLoginForm(false);
    } catch (err) {
      setLoginMsg(err.message || "Failed to create login.");
    } finally {
      setCreatingLogin(false);
    }
  };

  const getInitials = () => {
    const first = employee?.firstName?.trim()?.[0] || "";
    const last = employee?.lastName?.trim()?.[0] || "";

    return `${first}${last}`.toUpperCase() || "?";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const value = new Date(`${date}T00:00:00`);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return `₹${number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusClass = (status) => {
    return String(status || "").toUpperCase() === "ACTIVE"
      ? "status-active"
      : "status-inactive";
  };

  if (loading) {
    return (
      <Layout>
        <div className="employee-details-page">
          <p className="status-msg">Loading employee details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !employee) {
    return (
      <Layout>
        <div className="employee-details-page">
          <div className="status-msg error">
            {error || "Employee not found"}
          </div>

          <button
            className="back-btn"
            onClick={() => navigate("/modules/employees")}
          >
            ← Back to Employees
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="employee-details-page">
        {/* HEADER */}
        <div className="module-view-header">
          <div>
            <h1>Employee Details</h1>
            <p className="page-subtitle">
              Complete employee profile and HR information
            </p>
          </div>

          <div className="employee-header-actions">
            <button
              className="edit-btn"
              onClick={() => navigate("/modules/employees")}
            >
              Edit Employee
            </button>

            <button
              className="back-btn"
              onClick={() => navigate("/modules/employees")}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* PROFILE TOP */}
        <div className="employee-profile-header">
          <div className="employee-profile-main">
            <div className="profile-avatar">{getInitials()}</div>

            <div>
              <h2>
                {employee.firstName} {employee.lastName || ""}
              </h2>

              <p className="profile-role">
                {designation?.name || "Designation not assigned"}
              </p>

              <p className="employee-code-text">
                Employee Code: <strong>{employee.employeeCode}</strong>
              </p>
            </div>
          </div>

          <span
            className={`profile-status ${getStatusClass(employee.status)}`}
          >
            {employee.status || "ACTIVE"}
          </span>
        </div>

        {/* MAIN GRID */}
        <div className="employee-details-grid">
          {/* BASIC INFORMATION */}
          <div className="details-card">
            <div className="details-card-header">
              <h3>Basic Information</h3>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span>First Name</span>
                <strong>{employee.firstName || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Last Name</span>
                <strong>{employee.lastName || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Gender</span>
                <strong>{employee.gender || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Date of Birth</span>
                <strong>{formatDate(employee.dateOfBirth)}</strong>
              </div>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="details-card">
            <div className="details-card-header">
              <h3>Contact Information</h3>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span>Email</span>
                <strong>{employee.email || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Phone</span>
                <strong>{employee.phone || "—"}</strong>
              </div>

              <div className="detail-item detail-item-full">
                <span>Address</span>
                <strong>{employee.address || "—"}</strong>
              </div>
            </div>
          </div>

          {/* EMPLOYMENT INFORMATION */}
          <div className="details-card">
            <div className="details-card-header">
              <h3>Employment Information</h3>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span>Employee Code</span>
                <strong>{employee.employeeCode || "—"}</strong>
              </div>

              <div className="detail-item">
                <span>Date of Joining</span>
                <strong>{formatDate(employee.dateOfJoining)}</strong>
              </div>

              <div className="detail-item">
                <span>Department</span>
                <strong>{department?.name || "Not assigned"}</strong>
              </div>

              <div className="detail-item">
                <span>Designation</span>
                <strong>{designation?.name || "Not assigned"}</strong>
              </div>

              <div className="detail-item">
                <span>Status</span>
                <strong>{employee.status || "ACTIVE"}</strong>
              </div>
            </div>
          </div>

          {/* LOGIN */}
          {employee.status === "ACTIVE" && (
            <div className="details-card">
              <div className="details-card-header">
                <h3>Employee Login</h3>
              </div>

              {!showLoginForm ? (
                <div className="login-create-box">
                  <p>
                    Create a system login for this employee so they can access
                    the HRMS employee portal.
                  </p>

                  <button
                    className="add-btn"
                    onClick={() => {
                      setShowLoginForm(true);
                      setLoginMsg("");
                    }}
                  >
                    + Create Login
                  </button>

                  {loginMsg && (
                    <p className="login-msg success-msg">{loginMsg}</p>
                  )}
                </div>
              ) : (
                <form
                  className="login-form-inline"
                  onSubmit={handleCreateLogin}
                >
                  <div className="form-group">
                    <label htmlFor="employee-login-username">
                      Username
                    </label>

                    <input
                      id="employee-login-username"
                      type="text"
                      placeholder="Enter username"
                      value={loginUsername}
                      onChange={(event) =>
                        setLoginUsername(event.target.value)
                      }
                      autoComplete="username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="employee-login-password">
                      Password
                    </label>

                    <input
                      id="employee-login-password"
                      type="password"
                      placeholder="Enter password"
                      value={loginPassword}
                      onChange={(event) =>
                        setLoginPassword(event.target.value)
                      }
                      autoComplete="new-password"
                    />
                  </div>

                  {loginMsg && <p className="login-msg">{loginMsg}</p>}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="back-btn"
                      disabled={creatingLogin}
                      onClick={() => {
                        setShowLoginForm(false);
                        setLoginMsg("");
                        setLoginUsername("");
                        setLoginPassword("");
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="add-btn"
                      disabled={creatingLogin}
                    >
                      {creatingLogin ? "Creating..." : "Create Login"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ATTENDANCE */}
        <div className="widget-card employee-history-card">
          <div className="history-header">
            <div>
              <h3>🕒 Attendance History</h3>
              <p>Recent attendance records for this employee</p>
            </div>

            <span className="record-count">
              {attendance.length} Records
            </span>
          </div>

          {attendance.length === 0 ? (
            <div className="empty-state-small">
              No attendance records found.
            </div>
          ) : (
            <div className="table-container">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td>
                        {formatDate(
                          item.attendanceDate || item.date
                        )}
                      </td>

                      <td>{item.status || "—"}</td>

                      <td>{item.checkIn || "—"}</td>

                      <td>{item.checkOut || "—"}</td>

                      <td>
                        {item.workingHours ??
                          item.hours ??
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LEAVE HISTORY */}
        <div className="widget-card employee-history-card">
          <div className="history-header">
            <div>
              <h3>📅 Leave History</h3>
              <p>Employee leave applications and status</p>
            </div>

            <span className="record-count">
              {leaves.length} Records
            </span>
          </div>

          {leaves.length === 0 ? (
            <div className="empty-state-small">
              No leave records found.
            </div>
          ) : (
            <div className="table-container">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {leaves.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td>{item.leaveType || "—"}</td>

                      <td>{formatDate(item.startDate)}</td>

                      <td>{formatDate(item.endDate)}</td>

                      <td>{item.status || "—"}</td>

                      <td>
                        {item.reason ||
                          item.description ||
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAYROLL HISTORY */}
        <div className="widget-card employee-history-card">
          <div className="history-header">
            <div>
              <h3>💰 Payroll History</h3>
              <p>Salary and payroll payment records</p>
            </div>

            <span className="record-count">
              {payroll.length} Records
            </span>
          </div>

          {payroll.length === 0 ? (
            <div className="empty-state-small">
              No payroll records found.
            </div>
          ) : (
            <div className="table-container">
              <table className="mini-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Gross Salary</th>
                    <th>Net Salary</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>

                <tbody>
                  {payroll.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.month ||
                          item.payrollMonth ||
                          "—"}
                      </td>

                      <td>
                        {formatCurrency(
                          item.basicSalary
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          item.grossSalary
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          item.netSalary
                        )}
                      </td>

                      <td>
                        {item.paymentStatus ||
                          item.status ||
                          "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default EmployeeDetails;