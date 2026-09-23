// Main App component - defines all the routes (pages) of the application
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerInventoryList from './pages/ManagerInventoryList'; 
import ManagerReorderManagement from './pages/ManagerReorderManagement';
import ManagerReports from './pages/ManagerReports';
import ManagerUserManagement from './pages/ManagerUserManagement';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Render the router - each Route maps a URL path to a page component
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/manager-login" element={<LoginPage />} />
      
      <Route element={<DashboardLayout />}>
        {/* Staff & Manager Shared */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'admin', 'administrator', 'staff']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory-list" element={<ManagerInventoryList />} />
        </Route>

        {/* Manager Only */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'admin', 'administrator']} />}>
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/reorder-points" element={<ManagerReorderManagement />} />
          <Route path="/reports" element={<ManagerReports />} />
          <Route path="/users" element={<ManagerUserManagement />} />
        </Route>
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
