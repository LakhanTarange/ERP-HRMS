import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function MyPayroll() {
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
      const all = await apiGet("/payroll");
      setData(all.filter((p) => String(p.employeeId) === String(employeeId)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="module-view-header">
        <h1>My Payslips</h1>
      </div>

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">No payslip records found.</div>
      )}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Gross</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.month}</td>
                  <td>₹{row.basicSalary ?? "—"}</td>
                  <td>₹{row.allowances ?? "—"}</td>
                  <td>₹{row.deductions ?? "—"}</td>
                  <td>₹{row.grossSalary ?? "—"}</td>
                  <td>₹{row.netSalary ?? "—"}</td>
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

export default MyPayroll;