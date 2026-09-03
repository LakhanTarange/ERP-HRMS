import { useState } from "react";
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
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await apiPost("/leaves", {
        employeeId: Number(employeeId),
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfDays: formData.numberOfDays ? Number(formData.numberOfDays) : null,
        reason: formData.reason,
        status: "PENDING",
      });
      navigate("/my/leaves");
    } catch (err) {
      setError(err.message || "Failed to apply leave");
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
        <form onSubmit={handleSubmit} className="modal-form" style={{ maxWidth: "500px" }}>
          <div className="form-group">
            <label>Leave Type</label>
            <select
              value={formData.leaveType}
              onChange={(e) => handleChange("leaveType", e.target.value)}
            >
              <option value="CASUAL">Casual</option>
              <option value="SICK">Sick</option>
              <option value="EARNED">Earned</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Number of Days</label>
            <input
              type="number"
              value={formData.numberOfDays}
              onChange={(e) => handleChange("numberOfDays", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={() => navigate("/my/leaves")}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default ApplyLeave;