// Main App component - defines all the routes (pages) of the application
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const ManagerInventoryList = lazy(() => import('./pages/ManagerInventoryList'));
const ManagerReorderManagement = lazy(() => import('./pages/ManagerReorderManagement'));
const ManagerReports = lazy(() => import('./pages/ManagerReports'));
const ManagerUserManagement = lazy(() => import('./pages/ManagerUserManagement'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Render the router - each Route maps a URL path to a page component
export default function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#4c1d95]" role="status">Loading page…</div>}>
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
    </Suspense>
  );
}
