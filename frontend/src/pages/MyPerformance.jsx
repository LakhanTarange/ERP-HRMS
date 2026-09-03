import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function MyPerformance() {
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
      const all = await apiGet("/performance-reviews");
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
        <h1>My Performance Reviews</h1>
      </div>

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">No performance reviews found.</div>
      )}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.reviewPeriod}</td>
                  <td>{row.reviewer}</td>
                  <td>{row.rating ?? "—"}</td>
                  <td>{row.comments || "—"}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default MyPerformance;