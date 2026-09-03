import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function MyProfile() {
  const employeeId = localStorage.getItem("employeeId");
  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [designation, setDesignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, []);

  const loadProfile = async () => {
    if (!employeeId) {
      setError("No employee linked to this account. Contact HR.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const emp = await apiGet(`/employees/${employeeId}`);
      setEmployee(emp);

      const [deps, desigs] = await Promise.all([
        apiGet("/departments").catch(() => []),
        apiGet("/designations").catch(() => []),
      ]);
      setDepartment(deps.find((d) => d.id === emp.departmentId) || null);
      setDesignation(desigs.find((d) => d.id === emp.designationId) || null);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
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
        <p className="status-msg error">{error || "Profile not found"}</p>
      </Layout>
    );
  }

  const initials = `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`;

  return (
    <Layout>
      <div className="module-view-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">{initials || "?"}</div>
          <h2>{employee.firstName} {employee.lastName}</h2>
          <p className="profile-role">{designation ? designation.name : "—"}</p>
          <span className={`profile-status ${employee.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>
            {employee.status}
          </span>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="info-label">Employee Code</span>
              <span className="info-value">{employee.employeeCode}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{employee.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{employee.phone || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Gender</span>
              <span className="info-value">{employee.gender || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{employee.dateOfBirth || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Date of Joining</span>
              <span className="info-value">{employee.dateOfJoining || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Department</span>
              <span className="info-value">{department ? department.name : "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Designation</span>
              <span className="info-value">{designation ? designation.name : "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Address</span>
              <span className="info-value">{employee.address || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default MyProfile;