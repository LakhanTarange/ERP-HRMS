const BASE_URL = "https://erp-hrms.up.railway.app/api";
function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch " + path);
  return res.json();
}

export async function apiPost(path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}
export async function apiPostRaw(path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Request failed");
  return text;
}

export async function apiPut(path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete");
  return res.text();
}

export const MODULES = [
  { key: "employees", label: "Employees", path: "/employees" },
  { key: "departments", label: "Departments", path: "/departments" },
  { key: "designations", label: "Designations", path: "/designations" },
  { key: "attendance", label: "Attendance", path: "/attendance" },
  { key: "leaves", label: "Leaves", path: "/leaves" },
  { key: "payroll", label: "Payroll", path: "/payroll" },
  { key: "expenses", label: "Expenses", path: "/expenses" },
  { key: "candidates", label: "Candidates", path: "/candidates" },
  { key: "interviews", label: "Interviews", path: "/interviews" },
  { key: "job-positions", label: "Job Positions", path: "/job-positions" },
  { key: "performance-reviews", label: "Performance Reviews", path: "/performance-reviews" },
  { key: "employee-documents", label: "Employee Documents", path: "/employee-documents" },
];