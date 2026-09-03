import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AddRecordModal from "../components/AddRecordModal";
import { apiGet, apiDelete, MODULES } from "../services/api";

function ModuleView() {
  const { moduleKey } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const moduleInfo = MODULES.find((m) => m.path === `/${moduleKey}`);

  useEffect(() => {
    loadData();
    if (moduleKey === "employees") {
      loadLookups();
    }
    // eslint-disable-next-line
  }, [moduleKey]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiGet(`/${moduleKey}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    try {
      const [deps, desigs] = await Promise.all([
        apiGet("/departments"),
        apiGet("/designations"),
      ]);
      setDepartments(deps);
      setDesignations(desigs);
    } catch (err) {
      // ignore lookup failures, table still works with IDs
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await apiDelete(`/${moduleKey}/${id}`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openAddModal = () => {
    setEditRecord(null);
    setShowModal(true);
  };

  const openEditModal = (row) => {
    setEditRecord(row);
    setShowModal(true);
  };

  const getDeptName = (id) => {
    const d = departments.find((x) => x.id === id);
    return d ? d.name : id;
  };

  const getDesigName = (id) => {
    const d = designations.find((x) => x.id === id);
    return d ? d.name : id;
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const displayValue = (col, row) => {
    if (moduleKey === "employees" && col === "departmentId") {
      return getDeptName(row[col]);
    }
    if (moduleKey === "employees" && col === "designationId") {
      return getDesigName(row[col]);
    }
    return String(row[col] ?? "");
  };

  const columnLabel = (col) => {
    if (moduleKey === "employees" && col === "departmentId") return "DEPARTMENT";
    if (moduleKey === "employees" && col === "designationId") return "DESIGNATION";
    return col;
  };

  return (
    <Layout>
      <div className="module-view-header">
        <h1>{moduleInfo ? moduleInfo.label : moduleKey}</h1>
        <button className="add-btn" onClick={openAddModal}>
          + Add New
        </button>
      </div>

      {loading && <p className="status-msg">Loading...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && data.length === 0 && (
        <div className="empty-state">No records found yet.</div>
      )}

      {!loading && data.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{columnLabel(col)}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col}>
                      {moduleKey === "employees" && col === "firstName" ? (
                        <span
                          className="employee-link"
                          onClick={() => navigate(`/employees/${row.id}`)}
                        >
                          {displayValue(col, row)}
                        </span>
                      ) : (
                        displayValue(col, row)
                      )}
                    </td>
                  ))}
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="edit-btn"
                      onClick={() => openEditModal(row)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddRecordModal
          moduleKey={moduleKey}
          editData={editRecord}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            loadData();
            if (moduleKey === "employees") loadLookups();
          }}
        />
      )}
    </Layout>
  );
}

export default ModuleView;