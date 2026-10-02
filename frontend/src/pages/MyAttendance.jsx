import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiGet, apiPost } from "../services/api";

function MyAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await apiGet("/attendance/my");

      setData(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (err) {
      setError(
        err.message ||
        "Failed to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTodayRecord = () => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    return data.find(
      (row) =>
        row.attendanceDate === today
    );
  };

  const todayRecord =
    getTodayRecord();

  const isPunchedIn =
    todayRecord &&
    todayRecord.checkIn &&
    !todayRecord.checkOut;

  const isPunchedOut =
    todayRecord &&
    todayRecord.checkIn &&
    todayRecord.checkOut;

  const handlePunchIn = async () => {
    if (punching) {
      return;
    }

    setPunching(true);
    setError("");
    setMessage("");

    try {
      await apiPost(
        "/attendance/punch-in",
        {}
      );

      setMessage(
        "Punch In successful."
      );

      await loadData();

    } catch (err) {
      setError(
        err.message ||
        "Punch In failed"
      );
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOut = async () => {
    if (punching) {
      return;
    }

    setPunching(true);
    setError("");
    setMessage("");

    try {
      await apiPost(
        "/attendance/punch-out",
        {}
      );

      setMessage(
        "Punch Out successful."
      );

      await loadData();

    } catch (err) {
      setError(
        err.message ||
        "Punch Out failed"
      );
    } finally {
      setPunching(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parts =
      date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    return time.substring(
      0,
      5
    );
  };

  const getPunchButton = () => {
    if (loading) {
      return null;
    }

    if (isPunchedIn) {
      return (
        <button
          type="button"
          onClick={handlePunchOut}
          disabled={punching}
          className="primary-btn"
        >
          {punching
            ? "Processing..."
            : "Punch Out"}
        </button>
      );
    }

    if (isPunchedOut) {
      return (
        <button
          type="button"
          disabled
          className="primary-btn"
        >
          Attendance Completed
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handlePunchIn}
        disabled={punching}
        className="primary-btn"
      >
        {punching
          ? "Processing..."
          : "Punch In"}
      </button>
    );
  };

  return (
    <Layout>
      <div
        className="module-view-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>My Attendance</h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#666",
              fontSize: "14px",
            }}
          >
            Punch In and Punch Out using
            the current server time.
          </p>
        </div>

        <div>
          {getPunchButton()}
        </div>
      </div>

      {message && (
        <p
          className="status-msg"
          style={{
            marginTop: "15px",
          }}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          className="status-msg error"
          style={{
            marginTop: "15px",
          }}
        >
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        todayRecord && (
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              padding: "18px",
              borderRadius: "10px",
              background: "#f7f7f7",
              border: "1px solid #e5e5e5",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              Today's Attendance
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "12px",
              }}
            >
              <div>
                <strong>Punch In</strong>
                <br />
                {formatTime(
                  todayRecord.checkIn
                )}
              </div>

              <div>
                <strong>Punch Out</strong>
                <br />
                {formatTime(
                  todayRecord.checkOut
                )}
              </div>

              <div>
                <strong>Shift</strong>
                <br />
                {todayRecord.shiftName ||
                  "—"}
              </div>

              <div>
                <strong>Status</strong>
                <br />
                {todayRecord.status ||
                  "—"}
              </div>

              <div>
                <strong>Working Hours</strong>
                <br />
                {todayRecord.workingHours ??
                  "—"}
              </div>

              <div>
                <strong>Overtime</strong>
                <br />
                {todayRecord.overtimeHours ??
                  "0"}
              </div>
            </div>
          </div>
        )}

      {loading && (
        <p className="status-msg">
          Loading attendance...
        </p>
      )}

      {!loading &&
        !error &&
        data.length === 0 && (
          <div className="empty-state">
            No attendance records found.
          </div>
        )}

      {!loading &&
        !error &&
        data.length > 0 && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Shift</th>
                  <th>Shift Code</th>
                  <th>Status</th>
                  <th>Working Hours</th>
                  <th>Overtime</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {formatDate(
                        row.attendanceDate
                      )}
                    </td>

                    <td>
                      {formatTime(
                        row.checkIn
                      )}
                    </td>

                    <td>
                      {formatTime(
                        row.checkOut
                      )}
                    </td>

                    <td>
                      {row.shiftName ||
                        "—"}
                    </td>

                    <td>
                      {row.shiftCode ||
                        "—"}
                    </td>

                    <td>
                      {row.status ||
                        "—"}
                    </td>

                    <td>
                      {row.workingHours ??
                        "—"}
                    </td>

                    <td>
                      {row.overtimeHours ??
                        "0"}
                    </td>

                    <td>
                      {row.remarks ||
                        "—"}
                    </td>
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