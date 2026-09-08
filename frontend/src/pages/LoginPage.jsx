import React from "react";
import AuthCard from "../components/common/AuthCard";

// Manager login page component
export default function LoginPage({ onLogin }) {
  return (
    <AuthCard
      allowedRoles={["manager", "admin", "administrator"]}
      redirectPath="/manager-dashboard"
      unauthorizedMessage="This account is not authorized for manager login."
      onSuccess={onLogin}
    />
  );
}
