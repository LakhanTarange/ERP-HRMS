import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function MyLeaves() {
  const navigate = useNavigate();

  const employeeId = localStorage.getItem("employeeId");

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaves = async () => {
    if (!employeeId) {
      setError("Employee profile is not linked with this account.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiGet(`/leaves/employee/${employeeId}`);

      const sortedLeaves = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const dateA = new Date(a.startDate || "1900-01-01");
            const dateB = new Date(b.startDate || "1900-01-01");
            return dateB - dateA;
          })
        : [];

      setLeaves(sortedLeaves);
    } catch (err) {
      setError(err.message || "Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [employeeId]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING_MANAGER":
        return "Pending Manager";

      case "PENDING_HR":
        return "Pending HR";

      case "APPROVED":
        return "Approved";

      case "MANAGER_REJECTED":
        return "Manager Rejected";

      case "HR_REJECTED":
        return "HR Rejected";

      default:
        return status || "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-approved";

      case "PENDING_MANAGER":
      case "PENDING_HR":
        return "status-pending";

      case "MANAGER_REJECTED":
      case "HR_REJECTED":
        return "status-rejected";

      default:
        return "";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(`${date}T00:00:00`);

    if (Number.isNaN(d.getTime())) {
      return date;
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    const d = new Date(dateTime);

    if (Number.isNaN(d.getTime())) {
      return dateTime;
    }

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const leaveTypeLabel = (leaveType) => {
    switch (leaveType) {
      case "CASUAL":
        return "Casual";

      case "SICK":
        return "Sick";

      case "EARNED":
        return "Earned";

      case "UNPAID":
        return "Unpaid";

      default:
        return leaveType || "-";
    }
  };

  return (
    <Layout>
      <div
        className="module-view-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>My Leaves</h1>
          <p
            style={{
              marginTop: "5px",
              opacity: 0.7,
            }}
          >
            View your leave applications and approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/apply-leave")}
        >
          Apply Leave
        </button>
      </div>

      <div className="table-container">
        {loading && (
          <div
            style={{
              padding: "30px",
              textAlign: "center",
            }}
          >
            Loading leaves...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: "20px",
              color: "red",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && leaves.length === 0 && (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <h3>No Leave Applications</h3>

            <p style={{ opacity: 0.7 }}>
              You have not submitted any leave application yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/apply-leave")}
              style={{ marginTop: "10px" }}
            >
              Apply Your First Leave
            </button>
          </div>
        )}

        {!loading && !error && leaves.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Manager Approval</th>
                  <th>HR Approval</th>
                  <th>Rejection Reason</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <strong>
                        {leaveTypeLabel(leave.leaveType)}
                      </strong>
                    </td>

                    <td>{formatDate(leave.startDate)}</td>

                    <td>{formatDate(leave.endDate)}</td>

                    <td>
                      {leave.numberOfDays ?? "-"}
                    </td>

                    <td
                      style={{
                        minWidth: "180px",
                        maxWidth: "250px",
                      }}
                    >
                      {leave.reason || "-"}
                    </td>

                    <td>
                      <span
                        className={getStatusClass(leave.status)}
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getStatusLabel(leave.status)}
                      </span>
                    </td>

                    <td
                      style={{
                        minWidth: "180px",
                      }}
                    >
                      {leave.managerApprovedBy ? (
                        <div>
                          <strong>Approved</strong>

                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.7,
                              marginTop: "3px",
                            }}
                          >
                            By: {leave.managerApprovedBy}
                          </div>

                          {leave.managerApprovedAt && (
                            <div
                              style={{
                                fontSize: "12px",
                                opacity: 0.7,
                              }}
                            >
                              {formatDateTime(
                                leave.managerApprovedAt
                              )}
                            </div>
                          )}
                        </div>
                      ) : leave.status === "PENDING_MANAGER" ? (
                        <span>Waiting for Manager</span>
                      ) : leave.status === "MANAGER_REJECTED" ? (
                        <span>Rejected</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    <td
                      style={{
                        minWidth: "180px",
                      }}
                    >
                      {leave.hrApprovedBy ? (
                        <div>
                          <strong>Approved</strong>

                          <div
                            style={{
                              fontSize: "12px",
                              opacity: 0.7,
                              marginTop: "3px",
                            }}
                          >
                            By: {leave.hrApprovedBy}
                          </div>

                          {leave.hrApprovedAt && (
                            <div
                              style={{
                                fontSize: "12px",
                                opacity: 0.7,
                              }}
                            >
                              {formatDateTime(
                                leave.hrApprovedAt
                              )}
                            </div>
                          )}
                        </div>
                      ) : leave.status === "PENDING_HR" ? (
                        <span>Waiting for HR</span>
                      ) : leave.status === "HR_REJECTED" ? (
                        <span>Rejected</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    <td
                      style={{
                        minWidth: "200px",
                        maxWidth: "300px",
                      }}
                    >
                      {leave.rejectionReason ? (
                        <span>
                          {leave.rejectionReason}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyLeaves;