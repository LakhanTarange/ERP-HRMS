import { useEffect, useState } from "react";

import Layout from "../components/Layout";

import { apiGet, apiPost, apiDelete } from "../services/api";

function MyProfile() {
  const employeeId = localStorage.getItem("employeeId");
  const role = String(localStorage.getItem("role") || "").toUpperCase();

  const isHrOrAdmin =
    role === "HR_ADMIN" || role === "SUPER_ADMIN";

  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [designation, setDesignation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LEAVE APPROVAL CONFIGURATION
  // =========================================================

  const [employees, setEmployees] = useState([]);
  const [approvalConfigs, setApprovalConfigs] = useState([]);

  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState("");
  const [configError, setConfigError] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [config, setConfig] = useState({
    employeeId: "",
    managerEmployeeId: "",
    managerApprovalRequired: false,
    hrEmployeeId: "",
    hrApprovalRequired: true,
    active: true,
  });

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();

    // eslint-disable-next-line
  }, []);

  // =========================================================
  // LOAD HR CONFIGURATION
  // =========================================================

  useEffect(() => {
    if (isHrOrAdmin) {
      loadApprovalConfiguration();
    }

    // eslint-disable-next-line
  }, [isHrOrAdmin]);

  const loadProfile = async () => {
    if (!employeeId) {
      setError(
        "No employee linked to this account. Contact HR."
      );
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

      setDepartment(
        deps.find(
          (d) => Number(d.id) === Number(emp.departmentId)
        ) || null
      );

      setDesignation(
        desigs.find(
          (d) => Number(d.id) === Number(emp.designationId)
        ) || null
      );
    } catch (err) {
      setError(
        err.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD APPROVAL CONFIGURATION
  // =========================================================

  const loadApprovalConfiguration = async () => {
    setConfigLoading(true);
    setConfigError("");
    setConfigMessage("");

    try {
      const [employeeResult, configResult] =
        await Promise.all([
          apiGet("/employees"),
          apiGet("/leaves/approval-config"),
        ]);

      setEmployees(
        Array.isArray(employeeResult)
          ? employeeResult
          : []
      );

      setApprovalConfigs(
        Array.isArray(configResult)
          ? configResult
          : []
      );
    } catch (err) {
      setConfigError(
        err.message ||
          "Failed to load leave approval configuration"
      );
    } finally {
      setConfigLoading(false);
    }
  };

  // =========================================================
  // EMPLOYEE SELECT
  // =========================================================

  const handleEmployeeSelect = (value) => {
    setSelectedEmployeeId(value);

    setConfigMessage("");
    setConfigError("");

    if (!value) {
      setConfig({
        employeeId: "",
        managerEmployeeId: "",
        managerApprovalRequired: false,
        hrEmployeeId: "",
        hrApprovalRequired: true,
        active: true,
      });

      return;
    }

    const existing = approvalConfigs.find(
      (item) =>
        Number(item.employeeId) === Number(value)
    );

    if (existing) {
      setConfig({
        employeeId: existing.employeeId,
        managerEmployeeId:
          existing.managerEmployeeId || "",
        managerApprovalRequired:
          Boolean(existing.managerApprovalRequired),
        hrEmployeeId:
          existing.hrEmployeeId || "",
        hrApprovalRequired:
          Boolean(existing.hrApprovalRequired),
        active:
          existing.active !== false,
      });
    } else {
      setConfig({
        employeeId: Number(value),
        managerEmployeeId: "",
        managerApprovalRequired: false,
        hrEmployeeId: employeeId
          ? Number(employeeId)
          : "",
        hrApprovalRequired: true,
        active: true,
      });
    }
  };

  // =========================================================
  // CONFIG FIELD CHANGE
  // =========================================================

  const handleConfigChange = (field, value) => {
    setConfig((previous) => ({
      ...previous,
      [field]: value,
    }));

    setConfigMessage("");
    setConfigError("");
  };

  // =========================================================
  // SAVE CONFIGURATION
  // =========================================================

  const saveConfiguration = async (event) => {
    event.preventDefault();

    setConfigSaving(true);
    setConfigMessage("");
    setConfigError("");

    try {
      if (!config.employeeId) {
        throw new Error(
          "Please select an employee"
        );
      }

      if (
        config.managerApprovalRequired &&
        !config.managerEmployeeId
      ) {
        throw new Error(
          "Please select a manager because Manager Approval is enabled"
        );
      }

      if (
        config.hrApprovalRequired &&
        !config.hrEmployeeId
      ) {
        throw new Error(
          "Please select an HR approver because HR Approval is enabled"
        );
      }

      if (
        config.managerApprovalRequired &&
        Number(config.employeeId) ===
          Number(config.managerEmployeeId)
      ) {
        throw new Error(
          "Employee cannot be their own manager"
        );
      }

      if (
        config.hrApprovalRequired &&
        Number(config.employeeId) ===
          Number(config.hrEmployeeId)
      ) {
        throw new Error(
          "Employee cannot be their own HR approver"
        );
      }

      const payload = {
        employeeId: Number(config.employeeId),

        managerEmployeeId:
          config.managerEmployeeId
            ? Number(config.managerEmployeeId)
            : null,

        managerApprovalRequired:
          Boolean(config.managerApprovalRequired),

        hrEmployeeId:
          config.hrEmployeeId
            ? Number(config.hrEmployeeId)
            : null,

        hrApprovalRequired:
          Boolean(config.hrApprovalRequired),

        active: Boolean(config.active),
      };

      await apiPost(
        "/leaves/approval-config",
        payload
      );

      setConfigMessage(
        "Leave approval configuration saved successfully."
      );

      await loadApprovalConfiguration();
    } catch (err) {
      setConfigError(
        err.message ||
          "Failed to save configuration"
      );
    } finally {
      setConfigSaving(false);
    }
  };

  // =========================================================
  // DELETE CONFIGURATION
  // =========================================================

  const deleteConfiguration = async () => {
    if (!config.employeeId) {
      return;
    }

    const employeeName =
      getEmployeeName(config.employeeId);

    const confirmed = window.confirm(
      `Delete leave approval configuration for ${employeeName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiDelete(
        `/leaves/approval-config/${config.employeeId}`
      );

      setConfigMessage(
        "Leave approval configuration deleted successfully."
      );

      setSelectedEmployeeId("");

      setConfig({
        employeeId: "",
        managerEmployeeId: "",
        managerApprovalRequired: false,
        hrEmployeeId: "",
        hrApprovalRequired: true,
        active: true,
      });

      await loadApprovalConfiguration();
    } catch (err) {
      setConfigError(
        err.message ||
          "Failed to delete configuration"
      );
    }
  };

  // =========================================================
  // EMPLOYEE HELPERS
  // =========================================================

  const getEmployee = (id) => {
    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {
      return null;
    }

    return employees.find(
      (item) =>
        Number(item.id) === Number(id)
    );
  };

  const getEmployeeName = (id) => {
    const emp = getEmployee(id);

    if (!emp) {
      return id || "";
    }

    return `${emp.firstName || ""} ${
      emp.lastName || ""
    }`.trim();
  };

  const getEmployeeDisplayName = (emp) => {
    if (!emp) {
      return "";
    }

    const name = `${emp.firstName || ""} ${
      emp.lastName || ""
    }`.trim();

    if (emp.employeeCode) {
      return `${name} (${emp.employeeCode})`;
    }

    return name;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Layout>
        <p className="status-msg">
          Loading...
        </p>
      </Layout>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !employee) {
    return (
      <Layout>
        <p className="status-msg error">
          {error || "Profile not found"}
        </p>
      </Layout>
    );
  }

  const initials =
    `${employee.firstName?.[0] || ""}${
      employee.lastName?.[0] || ""
    }`.toUpperCase();

  // =========================================================
  // UI
  // =========================================================

  return (
    <Layout>
      <div className="module-view-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-container">

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="profile-card">

          <div className="profile-avatar">
            {initials || "?"}
          </div>

          <h2>
            {employee.firstName}{" "}
            {employee.lastName}
          </h2>

          <p className="profile-role">
            {designation
              ? designation.name
              : "—"}
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
                {employee.employeeCode}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Email
              </span>

              <span className="info-value">
                {employee.email}
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
                {department
                  ? department.name
                  : "—"}
              </span>
            </div>

            <div className="profile-info-row">
              <span className="info-label">
                Designation
              </span>

              <span className="info-value">
                {designation
                  ? designation.name
                  : "—"}
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
        </div>

        {/* =================================================
            HR LEAVE APPROVAL CONFIGURATION
        ================================================= */}

        {isHrOrAdmin && (
          <div
            className="profile-card"
            style={{
              marginTop: "24px",
              width: "100%",
              maxWidth: "900px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Leave Approval Configuration
                </h2>

                <p
                  style={{
                    marginTop: "6px",
                    opacity: 0.7,
                  }}
                >
                  Configure who approves each employee's leave.
                </p>
              </div>
            </div>

            {configLoading && (
              <p className="status-msg">
                Loading approval configuration...
              </p>
            )}

            {configError && (
              <p className="status-msg error">
                {configError}
              </p>
            )}

            {configMessage && (
              <p
                className="status-msg"
                style={{
                  marginBottom: "15px",
                }}
              >
                {configMessage}
              </p>
            )}

            {!configLoading && (
              <form onSubmit={saveConfiguration}>

                {/* EMPLOYEE */}

                <div
                  style={{
                    marginBottom: "18px",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: "7px",
                    }}
                  >
                    Employee
                  </label>

                  <select
                    value={selectedEmployeeId}
                    onChange={(e) =>
                      handleEmployeeSelect(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "11px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((emp) => (
                      <option
                        key={emp.id}
                        value={emp.id}
                      >
                        {getEmployeeDisplayName(emp)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MANAGER APPROVAL */}

                <div
                  style={{
                    border: "1px solid #e1e1e1",
                    borderRadius: "8px",
                    padding: "18px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong>
                        Manager Approval
                      </strong>

                      <div
                        style={{
                          fontSize: "13px",
                          opacity: 0.7,
                          marginTop: "4px",
                        }}
                      >
                        Employee's leave must be approved by the assigned manager.
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          config.managerApprovalRequired
                        }
                        onChange={(e) =>
                          handleConfigChange(
                            "managerApprovalRequired",
                            e.target.checked
                          )
                        }
                      />

                      Required
                    </label>
                  </div>

                  {config.managerApprovalRequired && (
                    <div
                      style={{
                        marginTop: "15px",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "7px",
                        }}
                      >
                        Assigned Manager
                      </label>

                      <select
                        value={
                          config.managerEmployeeId
                        }
                        onChange={(e) =>
                          handleConfigChange(
                            "managerEmployeeId",
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "11px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="">
                          Select Manager
                        </option>

                        {employees
                          .filter(
                            (emp) =>
                              Number(emp.id) !==
                              Number(
                                config.employeeId
                              )
                          )
                          .map((emp) => (
                            <option
                              key={emp.id}
                              value={emp.id}
                            >
                              {getEmployeeDisplayName(
                                emp
                              )}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* HR APPROVAL */}

                <div
                  style={{
                    border: "1px solid #e1e1e1",
                    borderRadius: "8px",
                    padding: "18px",
                    marginBottom: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong>
                        HR Approval
                      </strong>

                      <div
                        style={{
                          fontSize: "13px",
                          opacity: 0.7,
                          marginTop: "4px",
                        }}
                      >
                        HR approval is the final approval stage when enabled.
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          config.hrApprovalRequired
                        }
                        onChange={(e) =>
                          handleConfigChange(
                            "hrApprovalRequired",
                            e.target.checked
                          )
                        }
                      />

                      Required
                    </label>
                  </div>

                  {config.hrApprovalRequired && (
                    <div
                      style={{
                        marginTop: "15px",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "7px",
                        }}
                      >
                        HR Approver
                      </label>

                      <select
                        value={
                          config.hrEmployeeId
                        }
                        onChange={(e) =>
                          handleConfigChange(
                            "hrEmployeeId",
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "11px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="">
                          Select HR Approver
                        </option>

                        {employees
                          .filter(
                            (emp) =>
                              Number(emp.id) !==
                              Number(
                                config.employeeId
                              )
                          )
                          .map((emp) => (
                            <option
                              key={emp.id}
                              value={emp.id}
                            >
                              {getEmployeeDisplayName(
                                emp
                              )}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* ACTIVE */}

                <div
                  style={{
                    marginBottom: "20px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={config.active}
                      onChange={(e) =>
                        handleConfigChange(
                          "active",
                          e.target.checked
                        )
                      }
                    />

                    Configuration Active
                  </label>
                </div>

                {/* FLOW PREVIEW */}

                {config.employeeId && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <strong>
                      Approval Flow
                    </strong>

                    <div
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {config.managerApprovalRequired
                        ? "Employee → Manager"
                        : "Employee"}

                      {config.hrApprovalRequired
                        ? " → HR → Approved"
                        : " → Approved"}
                    </div>

                    {config.managerApprovalRequired &&
                      config.managerEmployeeId && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "13px",
                          }}
                        >
                          Manager:{" "}
                          <strong>
                            {getEmployeeName(
                              config.managerEmployeeId
                            )}
                          </strong>
                        </div>
                      )}

                    {config.hrApprovalRequired &&
                      config.hrEmployeeId && (
                        <div
                          style={{
                            marginTop: "5px",
                            fontSize: "13px",
                          }}
                        >
                          HR:{" "}
                          <strong>
                            {getEmployeeName(
                              config.hrEmployeeId
                            )}
                          </strong>
                        </div>
                      )}
                  </div>
                )}

                {/* BUTTONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    className="add-btn"
                    disabled={configSaving}
                  >
                    {configSaving
                      ? "Saving..."
                      : "Save Configuration"}
                  </button>

                  {config.employeeId &&
                    approvalConfigs.some(
                      (item) =>
                        Number(item.employeeId) ===
                        Number(
                          config.employeeId
                        )
                    ) && (
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={
                          deleteConfiguration
                        }
                      >
                        Delete Configuration
                      </button>
                    )}
                </div>

              </form>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyProfile;