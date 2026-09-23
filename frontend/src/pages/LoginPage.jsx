import React from "react";
import AuthCard from "../components/common/AuthCard";

// Unified login page component delegating to AuthCard
export default function LoginPage({ onLogin }) {
  return (
    <AuthCard onSuccess={onLogin} />
  );
}
