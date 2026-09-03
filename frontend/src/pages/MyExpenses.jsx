import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function MyExpenses() {
  const employeeId = localStorage.getItem("employeeId");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const all = await apiGet("/expenses");
      setData(all.filter((e) => String(e.employeeId) === String(employeeId)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="module-view-header">
        <h1>My Expenses</h1>
        <a href="/my/expenses/apply" className="add-btn" style={{ textDecoration: "none", display: "inline-block" }}>
          + Apply Expense
        </a>
      </div>

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">No expense records found.</div>
      )}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.expenseType}</td>
                  <td>₹{row.amount}</td>
                  <td>{row.expenseDate}</td>
                  <td>{row.description || "—"}</td>
                  <td>{row.status}</td>
                  <td>{row.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default MyExpenses;