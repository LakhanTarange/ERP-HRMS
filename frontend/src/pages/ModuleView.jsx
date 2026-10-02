import { useEffect, useMemo, useState } from "react";
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
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const [search, setSearch] = useState("");

  const moduleInfo = MODULES.find(
    (m) => m.path === `/${moduleKey}`
  );

  useEffect(() => {

    setSearch("");

    loadData();

    if (
      moduleKey === "employees" ||
      moduleKey === "attendance"
    ) {
      loadLookups();
    }

    // eslint-disable-next-line
  }, [moduleKey]);

  const loadData = async () => {

    setLoading(true);
    setError("");

    try {

      const result =
        await apiGet(`/${moduleKey}`);

      if (Array.isArray(result)) {

        setData(result);

      } else {

        setData([]);
      }

    } catch (err) {

      setError(
        err.message ||
        "Failed to load data"
      );

    } finally {

      setLoading(false);
    }
  };

  const loadLookups = async () => {

    try {

      const requests = [
        apiGet("/departments"),
        apiGet("/designations"),
      ];

      if (moduleKey === "attendance") {
        requests.push(
          apiGet("/employees")
        );
      }

      const results =
        await Promise.all(requests);

      setDepartments(
        Array.isArray(results[0])
          ? results[0]
          : []
      );

      setDesignations(
        Array.isArray(results[1])
          ? results[1]
          : []
      );

      if (moduleKey === "attendance") {

        setEmployees(
          Array.isArray(results[2])
            ? results[2]
            : []
        );
      }

    } catch (err) {

      console.error(
        "Failed to load lookup data:",
        err
      );
    }
  };

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this record?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await apiDelete(
        `/${moduleKey}/${id}`
      );

      await loadData();

      alert(
        "Record deleted successfully"
      );

    } catch (err) {

      alert(
        err.message ||
        "Failed to delete record"
      );
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

    if (
      id === null ||
      id === undefined
    ) {
      return "";
    }

    const department =
      departments.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    return department
      ? department.name
      : id;
  };

  const getDesigName = (id) => {

    if (
      id === null ||
      id === undefined
    ) {
      return "";
    }

    const designation =
      designations.find(
        (item) =>
          Number(item.id) ===
          Number(id)
      );

    return designation
      ? designation.name
      : id;
  };

  const getEmployee = (id) => {

    if (
      id === null ||
      id === undefined
    ) {
      return null;
    }

    return employees.find(
      (item) =>
        Number(item.id) ===
        Number(id)
    );
  };

  const getEmployeeName = (id) => {

    const employee =
      getEmployee(id);

    if (!employee) {
      return id || "";
    }

    return `${employee.firstName || ""} ${
      employee.lastName || ""
    }`.trim();
  };

  const getEmployeeCode = (id) => {

    const employee =
      getEmployee(id);

    return employee?.employeeCode || "";
  };

  const formatDate = (value) => {

    if (!value) {
      return "";
    }

    const parts =
      String(value).split("-");

    if (parts.length === 3) {

      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return value;
  };

  const formatTime = (value) => {

    if (!value) {
      return "";
    }

    const text =
      String(value);

    return text.length >= 5
      ? text.substring(0, 5)
      : text;
  };

  const formatHours = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return Number(value)
      .toFixed(2);
  };

  const getStatusClass = (status) => {

    const normalized =
      String(status || "")
        .toUpperCase();

    if (normalized === "PRESENT") {
      return "attendance-present";
    }

    if (normalized === "HALF_DAY") {
      return "attendance-half-day";
    }

    if (normalized === "ABSENT") {
      return "attendance-absent";
    }

    if (normalized === "LEAVE") {
      return "attendance-leave";
    }

    if (normalized === "WEEK_OFF") {
      return "attendance-week-off";
    }

    if (normalized === "HOLIDAY") {
      return "attendance-holiday";
    }

    return "";
  };

  const columns = useMemo(() => {

    if (data.length === 0) {
      return [];
    }

    return Object.keys(data[0]);

  }, [data]);

  const filteredData = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return data;
    }

    return data.filter((row) =>
      Object.values(row).some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
      )
    );

  }, [data, search]);

  /*
   * ============================================================
   * NORMAL MODULE DISPLAY
   * ============================================================
   */

  const displayValue = (
    column,
    row
  ) => {

    if (
      moduleKey === "employees" &&
      column === "departmentId"
    ) {
      return getDeptName(
        row[column]
      );
    }

    if (
      moduleKey === "employees" &&
      column === "designationId"
    ) {
      return getDesigName(
        row[column]
      );
    }

    if (
      moduleKey === "employees" &&
      column === "status"
    ) {
      return row[column] ||
        "ACTIVE";
    }

    return String(
      row[column] ?? ""
    );
  };

  /*
   * ============================================================
   * ATTENDANCE TABLE
   * ============================================================
   */

  const renderAttendanceTable = () => {

    return (
      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>

              <th>EMPLOYEE</th>
              <th>DATE</th>
              <th>PUNCH IN</th>
              <th>PUNCH OUT</th>
              <th>SHIFT</th>
              <th>SHIFT CODE</th>
              <th>WORKING HOURS</th>
              <th>OVERTIME</th>
              <th>STATUS</th>
              <th>ACTIONS</th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map(
              (row) => {

                return (
                  <tr key={row.id}>

                    <td>

                      <div
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {getEmployeeName(
                          row.employeeId
                        )}
                      </div>

                      {getEmployeeCode(
                        row.employeeId
                      ) && (
                        <div
                          style={{
                            fontSize: "12px",
                            opacity: 0.65,
                            marginTop: "3px",
                          }}
                        >
                          {getEmployeeCode(
                            row.employeeId
                          )}
                        </div>
                      )}

                    </td>

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
                      {row.shiftName || "-"}
                    </td>

                    <td>
                      <strong>
                        {row.shiftCode || "-"}
                      </strong>
                    </td>

                    <td>
                      {formatHours(
                        row.workingHours
                      )}
                    </td>

                    <td>
                      {formatHours(
                        row.overtimeHours
                      )}
                    </td>

                    <td>

                      <span
                        className={
                          getStatusClass(
                            row.status
                          )
                        }
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "4px 9px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "12px",
                          fontWeight:
                            600,
                        }}
                      >
                        {row.status ||
                          "-"}
                      </span>

                    </td>

                    <td
                      style={{
                        display:
                          "flex",
                        gap: "8px",
                      }}
                    >

                      <button
                        className="edit-btn"
                        onClick={() =>
                          openEditModal(
                            row
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            row.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>
    );
  };

  /*
   * ============================================================
   * NORMAL MODULE TABLE
   * ============================================================
   */

  const renderNormalTable = () => {

    return (
      <div className="table-container">

        <table className="data-table">

          <thead>

            <tr>

              {columns.map(
                (column) => (
                  <th key={column}>
                    {columnLabel(
                      column
                    )}
                  </th>
                )
              )}

              <th>ACTIONS</th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map(
              (row) => (

                <tr key={row.id}>

                  {columns.map(
                    (column) => (

                      <td key={column}>

                        {moduleKey ===
                          "employees" &&
                        column ===
                          "firstName" ? (

                          <span
                            className="employee-link"
                            onClick={() =>
                              navigate(
                                `/employees/${row.id}`
                              )
                            }
                          >
                            {displayValue(
                              column,
                              row
                            )}
                          </span>

                        ) : (

                          displayValue(
                            column,
                            row
                          )

                        )}

                      </td>

                    )
                  )}

                  <td
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                    }}
                  >

                    <button
                      className="edit-btn"
                      onClick={() =>
                        openEditModal(
                          row
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(
                          row.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>
    );
  };

  const columnLabel = (
    column
  ) => {

    const labels = {

      employeeCode:
        "EMPLOYEE CODE",

      firstName:
        "FIRST NAME",

      lastName:
        "LAST NAME",

      email:
        "EMAIL",

      phone:
        "PHONE",

      dateOfBirth:
        "DATE OF BIRTH",

      gender:
        "GENDER",

      dateOfJoining:
        "DATE OF JOINING",

      departmentId:
        "DEPARTMENT",

      designationId:
        "DESIGNATION",

      address:
        "ADDRESS",

      status:
        "STATUS",

      attendanceDate:
        "ATTENDANCE DATE",

      checkIn:
        "PUNCH IN",

      checkOut:
        "PUNCH OUT",

      workingHours:
        "WORKING HOURS",

      shiftName:
        "SHIFT",

      shiftCode:
        "SHIFT CODE",

      overtimeHours:
        "OVERTIME",

      remarks:
        "REMARKS",

    };

    return (
      labels[column] ||
      column
        .replace(
          /([A-Z])/g,
          " $1"
        )
        .replace(
          /^./,
          (str) =>
            str.toUpperCase()
        )
    );
  };

  return (
    <Layout>

      <div
        className="module-view-header"
      >

        <h1>
          {moduleInfo
            ? moduleInfo.label
            : moduleKey}
        </h1>

        <div
          style={{
            display:
              "flex",
            gap: "10px",
            alignItems:
              "center",
          }}
        >

          {data.length > 0 && (

            <input
              type="text"
              className="search-input"
              placeholder={`Search ${
                moduleInfo?.label ||
                moduleKey
              }...`}
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          )}

          <button
            className="add-btn"
            onClick={
              openAddModal
            }
          >
            + Add New
          </button>

        </div>

      </div>

      {loading && (
        <p className="status-msg">
          Loading...
        </p>
      )}

      {error && (
        <p className="status-msg error">
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        data.length === 0 && (

          <div className="empty-state">
            No records found yet.
          </div>

        )}

      {!loading &&
        !error &&
        data.length > 0 &&
        filteredData.length === 0 && (

          <div className="empty-state">
            No matching records found.
          </div>

        )}

      {!loading &&
        !error &&
        filteredData.length > 0 && (

          moduleKey === "attendance"
            ? renderAttendanceTable()
            : renderNormalTable()

        )}

      {showModal && (

        <AddRecordModal
          moduleKey={moduleKey}
          editData={editRecord}
          onClose={() =>
            setShowModal(false)
          }
          onSuccess={async () => {

            await loadData();

            if (
              moduleKey === "employees" ||
              moduleKey === "attendance"
            ) {
              await loadLookups();
            }

          }}
        />

      )}

    </Layout>
  );
}

export default ModuleView;