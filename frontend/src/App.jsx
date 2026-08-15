import React from "react";
import { Routes, Route } from "react-router";
import LoginRoleSelection from "./pages/LoginRoleSelection";
import StaffLogin from "./pages/StaffLogin";
import ManagerDashboard from './pages/ManagerDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoleSelection />} />
      <Route path="/login" element={<StaffLogin />} />
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
    </Routes>
  );
}

export default App;