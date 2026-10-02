import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPostRaw } from "../services/api";

function LeaveApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const role = localStorage.getItem("role") || "";

  const isManager =
    role === "MANAGER" ||
    role === "ROLE_MANAGER";

  const isHR =
    role === "HR_ADMIN" ||
    role === "ROLE_HR_ADMIN" ||
    role === "HR" ||
    role === "ROLE_HR";

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      let data = [];

      if (isManager) {
        data = await apiGet("/leaves/my-manager-pending");
      } else if (isHR) {
        data = await apiGet("/leaves/status/PENDING_HR");
      } else {
        setError("You are not authorized to approve leaves.");
        return;
      }

      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load pending leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const approveLeave = async (leaveId) => {
    try {
      setProcessingId(leaveId);
      setMessage("");
      setError("");

      if (isManager) {
        await apiPostRaw(`/leaves/${leaveId}/manager-approve`, {});
        setMessage("Leave approved by Manager.");
      } else if (isHR) {
        await apiPostRaw(`/leaves/${leaveId}/hr-approve`, {});
        setMessage("Leave approved by HR.");
      }

      await loadLeaves();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to approve leave.");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectLeave = async (leaveId) => {
    const reason = window.prompt("Enter rejection reason:");

    if (reason === null) {
      return;
    }

    try {
      setProcessingId(leaveId);
      setMessage("");
      setError("");

      if (isManager) {
        await apiPostRaw(`/leaves/${leaveId}/manager-reject`, {
          reason,
        });
        setMessage("Leave rejected by Manager.");
      } else if (isHR) {
        await apiPostRaw(`/leaves/${leaveId}/hr-reject`, {
          reason,
        });
        setMessage("Leave rejected by HR.");
      }

      await loadLeaves();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to reject leave.");
    } finally {
      setProcessingId(null);
    }
  };

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
        return status || "-";
    }
  };

  if (!isManager && !isHR) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Leave Approvals</h2>
          <p style={styles.error}>
            You are not authorized to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Leave Approvals</h1>
          <p style={styles.subtitle}>
            {isManager
              ? "Review leaves assigned to you as Manager."
              : "Review leaves waiting for HR approval."}
          </p>
        </div>

        <button style={styles.refreshButton} onClick={loadLeaves}>
          Refresh
        </button>
      </div>

      {message && <div style={styles.success}>{message}</div>}

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.card}>
          <p>Loading pending leaves...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div style={styles.card}>
          <div style={styles.empty}>
            <h3>No Pending Leaves</h3>
            <p>
              There are currently no leave requests waiting for your approval.
            </p>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Employee ID</th>
                  <th style={styles.th}>Leave Type</th>
                  <th style={styles.th}>Start Date</th>
                  <th style={styles.th}>End Date</th>
                  <th style={styles.th}>Days</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => {
                  const isProcessing = processingId === leave.id;

                  return (
                    <tr key={leave.id}>
                      <td style={styles.td}>{leave.id}</td>

                      <td style={styles.td}>
                        {leave.employeeId}
                      </td>

                      <td style={styles.td}>
                        {leave.leaveType || "-"}
                      </td>

                      <td style={styles.td}>
                        {leave.startDate || "-"}
                      </td>

                      <td style={styles.td}>
                        {leave.endDate || "-"}
                      </td>

                      <td style={styles.td}>
                        {leave.numberOfDays ?? "-"}
                      </td>

                      <td style={styles.td}>
                        {leave.reason || "-"}
                      </td>

                      <td style={styles.td}>
                        <span style={styles.status}>
                          {getStatusLabel(leave.status)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.approveButton}
                            disabled={isProcessing}
                            onClick={() => approveLeave(leave.id)}
                          >
                            {isProcessing ? "Processing..." : "Approve"}
                          </button>

                          <button
                            style={styles.rejectButton}
                            disabled={isProcessing}
                            onClick={() => rejectLeave(leave.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    minHeight: "100vh",
    background: "#f5f7fb",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: "6px",
    color: "#667085",
  },

  refreshButton: {
    border: "none",
    borderRadius: "8px",
    padding: "10px 18px",
    cursor: "pointer",
    background: "#344054",
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f2f4f7",
    borderBottom: "1px solid #ddd",
    whiteSpace: "nowrap",
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
    fontSize: "14px",
  },

  status: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "6px",
    background: "#fff4cc",
    fontSize: "12px",
    fontWeight: "600",
  },

  actions: {
    display: "flex",
    gap: "8px",
  },

  approveButton: {
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    background: "#12b76a",
    color: "#fff",
    fontWeight: "600",
  },

  rejectButton: {
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    background: "#d92d20",
    color: "#fff",
    fontWeight: "600",
  },

  success: {
    marginBottom: "16px",
    padding: "12px 16px",
    borderRadius: "8px",
    background: "#ecfdf3",
    color: "#027a48",
  },

  error: {
    marginBottom: "16px",
    padding: "12px 16px",
    borderRadius: "8px",
    background: "#fef3f2",
    color: "#b42318",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
    color: "#667085",
  },
};

export default LeaveApprovals;