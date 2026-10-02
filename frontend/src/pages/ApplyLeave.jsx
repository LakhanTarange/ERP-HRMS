import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiPost } from "../services/api";

function ApplyLeave() {
  const navigate = useNavigate();

  const employeeId = localStorage.getItem("employeeId");

  const [formData, setFormData] = useState({
    leaveType: "CASUAL",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Calculate leave days automatically from start and end date
  useEffect(() => {
    if (!formData.startDate || !formData.endDate) {
      setFormData((prev) => ({
        ...prev,
        numberOfDays: "",
      }));
      return;
    }

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);

    if (end < start) {
      setFormData((prev) => ({
        ...prev,
        numberOfDays: "",
      }));
      return;
    }

    const difference = end.getTime() - start.getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;

    setFormData((prev) => ({
      ...prev,
      numberOfDays: days,
    }));
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!employeeId) {
      setError("Employee profile is not linked with this account.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Please select start date and end date.");
      return;
    }

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);

    if (end < start) {
      setError("End date cannot be before start date.");
      return;
    }

    if (!formData.numberOfDays || Number(formData.numberOfDays) <= 0) {
      setError("Invalid number of leave days.");
      return;
    }

    setSaving(true);

    try {
      /*
       * IMPORTANT:
       * Do NOT send status here.
       *
       * Backend will decide the workflow:
       *
       * Employee
       *    ↓
       * Manager
       *    ↓
       * HR
       *    ↓
       * Approved
       *
       * Depending on the employee's approval configuration.
       */
      const response = await apiPost("/leaves", {
        employeeId: Number(employeeId),
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfDays: Number(formData.numberOfDays),
        reason: formData.reason.trim(),
      });

      const status = response?.status || "";

      let message = "Leave application submitted successfully.";

      if (status === "PENDING_MANAGER") {
        message = "Leave submitted. It is now waiting for Manager approval.";
      } else if (status === "PENDING_HR") {
        message = "Leave submitted. It is now waiting for HR approval.";
      } else if (status === "APPROVED") {
        message = "Leave submitted and automatically approved.";
      }

      setSuccess(message);

      setTimeout(() => {
        navigate("/my/leaves");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to apply leave.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="module-view-header">
        <h1>Apply Leave</h1>
      </div>

      <div className="table-container">
        <form
          onSubmit={handleSubmit}
          className="modal-form"
          style={{
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {/* Leave Type */}
          <div className="form-group">
            <label>Leave Type</label>

            <select
              value={formData.leaveType}
              onChange={(e) =>
                handleChange("leaveType", e.target.value)
              }
              required
            >
              <option value="CASUAL">Casual</option>
              <option value="SICK">Sick</option>
              <option value="EARNED">Earned</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label>Start Date</label>

            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                handleChange("startDate", e.target.value)
              }
              required
            />
          </div>

          {/* End Date */}
          <div className="form-group">
            <label>End Date</label>

            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                handleChange("endDate", e.target.value)
              }
              min={formData.startDate || undefined}
              required
            />
          </div>

          {/* Number of Days */}
          <div className="form-group">
            <label>Number of Days</label>

            <input
              type="number"
              value={formData.numberOfDays}
              readOnly
              min="1"
              step="1"
              placeholder="Automatically calculated"
            />

            <small
              style={{
                display: "block",
                marginTop: "5px",
                opacity: 0.7,
              }}
            >
              Number of days is calculated automatically.
            </small>
          </div>

          {/* Reason */}
          <div className="form-group">
            <label>Reason</label>

            <textarea
              value={formData.reason}
              onChange={(e) =>
                handleChange("reason", e.target.value)
              }
              rows="4"
              placeholder="Enter reason for leave"
            />
          </div>

          {/* Workflow Information */}
          <div
            style={{
              padding: "12px 14px",
              marginBottom: "15px",
              borderRadius: "8px",
              background: "#f5f7fa",
              border: "1px solid #e1e5ea",
              fontSize: "14px",
            }}
          >
            <strong>Approval Workflow</strong>

            <p
              style={{
                margin: "7px 0 0",
                lineHeight: "1.6",
              }}
            >
              Your leave will automatically be sent to the configured
              Manager and/or HR according to your employee profile.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p
              className="error"
              style={{
                marginBottom: "15px",
              }}
            >
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p
              style={{
                color: "green",
                marginBottom: "15px",
                fontWeight: "600",
              }}
            >
              {success}
            </p>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/my/leaves")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
            >
              {saving ? "Submitting..." : "Submit Leave"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default ApplyLeave;