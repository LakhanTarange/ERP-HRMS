import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiPost } from "../services/api";

function ApplyExpense() {
  const navigate = useNavigate();
  const employeeId = localStorage.getItem("employeeId");

  const [formData, setFormData] = useState({
    expenseType: "",
    amount: "",
    expenseDate: "",
    description: "",
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
      await apiPost("/expenses", {
        employeeId: Number(employeeId),
        expenseType: formData.expenseType,
        amount: formData.amount ? Number(formData.amount) : null,
        expenseDate: formData.expenseDate,
        description: formData.description,
        status: "PENDING",
        paymentStatus: "UNPAID",
      });
      navigate("/my/expenses");
    } catch (err) {
      setError(err.message || "Failed to apply expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="module-view-header">
        <h1>Apply Expense</h1>
      </div>

      <div className="table-container">
        <form onSubmit={handleSubmit} className="modal-form" style={{ maxWidth: "500px" }}>
          <div className="form-group">
            <label>Expense Type</label>
            <input
              type="text"
              value={formData.expenseType}
              onChange={(e) => handleChange("expenseType", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Expense Date</label>
            <input
              type="date"
              value={formData.expenseDate}
              onChange={(e) => handleChange("expenseDate", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="back-btn" onClick={() => navigate("/my/expenses")}>
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

export default ApplyExpense;