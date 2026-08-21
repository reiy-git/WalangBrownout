import React from 'react';
import { Routes, Route } from 'react-router'; 
import LoginRoleSelection from './pages/LoginRoleSelection';
import LoginPage from './pages/LoginPage';
import StaffLogin from './pages/StaffLogin';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerInventoryList from './pages/ManagerInventoryList'; 
import ManagerInventoryAddProduct from './pages/ManagerInventoryAddProduct';
import ManagerProductDetails from './pages/ManagerProductDetails';
import ManagerEditProduct from './pages/ManagerEditProduct';
import ManagerReceiveProduct from './pages/ManagerReceiveProduct';
import ManagerDispatchProduct from './pages/ManagerDispatchProduct';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRoleSelection />} />
      <Route path="/login" element={<StaffLogin />} />
      <Route path="/manager-login" element={<LoginPage />} />
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      <Route path="/inventory-list" element={<ManagerInventoryList />} />
      <Route path="/manager-inventory-add-product" element={<ManagerInventoryAddProduct />} />
      <Route path="/product-details/:id" element={<ManagerProductDetails />} />
      <Route path="/edit-product/:id" element={<ManagerEditProduct />} />
      <Route path="/receive-product/:id" element={<ManagerReceiveProduct />} />
      <Route path="/dispatch-product/:id" element={<ManagerDispatchProduct />} />
    </Routes>
  );
}