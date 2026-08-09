import React from "react";
import { Routes, Route } from "react-router";
import LoginRoleSelection from "./pages/LoginRoleSelection";
import StaffLogin from "./pages/StaffLogin";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoleSelection />} />
      <Route path="/login" element={<StaffLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;