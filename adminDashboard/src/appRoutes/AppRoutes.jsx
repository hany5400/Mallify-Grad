import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import MallAdminRegisterPage from '../pages/MallAdminRegisterPage';
import StoreAdminRegisterPage from '../pages/StoreAdminRegisterPage';
import ActivatePage from '../pages/ActivatePage';
import PendingPage from '../pages/PendingPage';
import SystemAdminDashboard from '../pages/SystemAdminDashboard';
import MallAdminDashboard from '../pages/MallAdminDashboard';
import StoreAdminDashboard from '../pages/StoreAdminDashboard';

// Helper to determine role
const getUserRole = (user) => {
  if (!user) return null;
  return user.role || (user.admin_type === 'system' ? 'system_admin' : (user.admin_type === 'mall' ? 'mall_admin' : (user.admin_type === 'store' ? 'store_admin' : 'user')));
};

// Route guard for authenticated users
function RequireAuth({ children, allowedRoles, token, user }) {
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = getUserRole(user);

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to home which handles correct routing for their role
    return <Navigate to="/" replace />;
  }

  return children;
}

// Route guard for public auth routes (guest only)
function RequireGuest({ children, token, user }) {
  if (token) {
    const role = getUserRole(user);
    if (role === 'system_admin') return <Navigate to="/system-admin" replace />;
    if (role === 'mall_admin') return <Navigate to="/mall-admin" replace />;
    if (role === 'store_admin') return <Navigate to="/store-admin" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes({ token, user, onLoginSuccess, onLogout }) {
  const role = getUserRole(user);

  return (
    <Routes>
      {/* Root Path routing */}
      <Route 
        path="/" 
        element={
          token ? (
            role === 'system_admin' ? (
              <Navigate to="/system-admin" replace />
            ) : role === 'mall_admin' ? (
              <Navigate to="/mall-admin" replace />
            ) : role === 'store_admin' ? (
              <Navigate to="/store-admin" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Guest only routes */}
      <Route 
        path="/login" 
        element={
          <RequireGuest token={token} user={user}>
            <LoginPage onLoginSuccess={onLoginSuccess} />
          </RequireGuest>
        } 
      />
      <Route 
        path="/register-mall" 
        element={
          <RequireGuest token={token} user={user}>
            <MallAdminRegisterPage />
          </RequireGuest>
        } 
      />
      <Route 
        path="/register-store" 
        element={
          <RequireGuest token={token} user={user}>
            <StoreAdminRegisterPage />
          </RequireGuest>
        } 
      />
      <Route 
        path="/activate" 
        element={
          <RequireGuest token={token} user={user}>
            <ActivatePage />
          </RequireGuest>
        } 
      />
      <Route 
        path="/pending" 
        element={
          <RequireGuest token={token} user={user}>
            <PendingPage />
          </RequireGuest>
        } 
      />

      {/* Authenticated Admin routes */}
      <Route 
        path="/system-admin" 
        element={
          <RequireAuth allowedRoles={['system_admin']} token={token} user={user}>
            <SystemAdminDashboard user={user} onLogout={onLogout} />
          </RequireAuth>
        } 
      />
      <Route 
        path="/mall-admin" 
        element={
          <RequireAuth allowedRoles={['mall_admin']} token={token} user={user}>
            <MallAdminDashboard user={user} onLogout={onLogout} />
          </RequireAuth>
        } 
      />
      <Route 
        path="/store-admin" 
        element={
          <RequireAuth allowedRoles={['store_admin']} token={token} user={user}>
            <StoreAdminDashboard user={user} onLogout={onLogout} />
          </RequireAuth>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
