import React from "react";
import { Routes, Route } from "react-router";
import LoginRoleSelection from "./pages/LoginRoleSelection";
import StaffLogin from "./pages/StaffLogin";
import LoginPage from "./pages/LoginPage";
import ManagerDashboard from "./pages/ManagerDashboard";

export default function App() {
  //ate marriyell login app.jsx
  const handleLogin = ({ username, password }) => {
    console.log(username, password);
  };

  return (
    <Routes>
      {/* Landing / Role Selection Page */}
      <Route path="/" element={<LoginRoleSelection />} />

      {/* Staff Login path */}
      <Route path="/login" element={<StaffLogin />} />

      {/* Manager Login path (LoginPage component) */}
      <Route path="/manager-login" element={<LoginPage onLogin={handleLogin} />} />

      {/* Manager Dashboard path */}
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
    </Routes>
  );
}