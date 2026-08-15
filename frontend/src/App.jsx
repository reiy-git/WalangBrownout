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
      {/* Landing view forces selection of access level */}
      <Route path="/" element={<LoginRoleSelection />} />
      
      {/* Staff Login Route */}
      <Route path="/login" element={<StaffLogin />} />
      
      {/* Manager Login Route (using your teammate's incoming file) */}
      <Route path="/manager-login" element={<LoginPage onLogin={handleLogin} />} />
      
      {/* Manager Dashboard view */}
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
    </Routes>
  );
}