// Guard component - redirects to login if no user is logged in
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, children }) {
  // If there's no user, send them back to the login page
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
