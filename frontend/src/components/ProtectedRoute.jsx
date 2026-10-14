import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Route guard checking token existence and allowed role permissions
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem("auth_token");
  const userRole = (localStorage.getItem("user_role") || "").toLowerCase();

  // Redirect unauthenticated requests to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Redirect unauthorized role requests
  if (allowedRoles.length > 0 && !allowedRoles.some((r) => r.toLowerCase() === userRole)) {
    return <Navigate to={userRole === "staff" ? "/dashboard" : "/manager-dashboard"} replace />;
  }

  // Render nested child route or children
  return children ? children : <Outlet />;
}
