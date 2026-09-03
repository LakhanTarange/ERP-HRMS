import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ModuleView from "./pages/ModuleView";
import EmployeeDetails from "./pages/EmployeeDetails";
import MyProfile from "./pages/MyProfile";
import MyAttendance from "./pages/MyAttendance";
import MyLeaves from "./pages/MyLeaves";
import ApplyLeave from "./pages/ApplyLeave";
import MyExpenses from "./pages/MyExpenses";
import ApplyExpense from "./pages/ApplyExpense";
import MyPayroll from "./pages/MyPayroll";
import MyPerformance from "./pages/MyPerformance";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/modules/:moduleKey"
          element={token ? <ModuleView /> : <Navigate to="/login" />}
        />

        <Route
          path="/employees/:id"
          element={token ? <EmployeeDetails /> : <Navigate to="/login" />}
        />

        <Route
          path="/my/profile"
          element={token ? <MyProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/attendance"
          element={token ? <MyAttendance /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/leaves"
          element={token ? <MyLeaves /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/leaves/apply"
          element={token ? <ApplyLeave /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/expenses"
          element={token ? <MyExpenses /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/expenses/apply"
          element={token ? <ApplyExpense /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/payroll"
          element={token ? <MyPayroll /> : <Navigate to="/login" />}
        />
        <Route
          path="/my/performance"
          element={token ? <MyPerformance /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;