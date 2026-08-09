import React from "react";
import { Routes, Route } from "react-router";
import LoginRoleSelection from "./pages/LoginRoleSelection";
import StaffLogin from "./pages/StaffLogin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoleSelection />} />
      <Route path="/login" element={<StaffLogin />} />
    </Routes>
  );
}

export default App;