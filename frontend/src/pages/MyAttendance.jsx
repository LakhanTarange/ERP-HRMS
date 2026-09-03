import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet } from "../services/api";

function MyAttendance() {
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
      const all = await apiGet("/attendance");
      setData(all.filter((a) => String(a.employeeId) === String(employeeId)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="module-view-header">
        <h1>My Attendance</h1>
      </div>

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">No attendance records found.</div>
      )}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Working Hours</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.attendanceDate}</td>
                  <td>{row.checkIn || "—"}</td>
                  <td>{row.checkOut || "—"}</td>
                  <td>{row.status || "—"}</td>
                  <td>{row.workingHours ?? "—"}</td>
                  <td>{row.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

export default MyAttendance;