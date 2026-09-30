import React from "react";
import AuthCard from "../components/common/AuthCard";

// Staff login page - only staff accounts can log in here
export default function StaffLogin({ onLogin }) {
  return (
    <AuthCard
      allowedRoles={["staff"]}
      redirectPath="/dashboard"
      unauthorizedMessage="This account is not authorized for staff login."
      onSuccess={onLogin}
    />
  );
}
