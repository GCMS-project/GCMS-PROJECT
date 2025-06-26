import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import PickupRequestPage from '../pages/PickupRequestPage';
import PickupsPage from '../pages/PickupsPage';
import UsersPage from '../pages/UsersPage';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRender from '../components/RoleBasedRender';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('AppRoutes rendering...', { isAuthenticated, loading });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />

      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Pickup routes */}
        <Route path="pickup-request" element={<PickupRequestPage />} />
        <Route path="pickups" element={<PickupsPage />} />
        
        {/* Admin-only routes */}
        <Route 
          path="users" 
          element={
            <RoleBasedRender allowedRoles={['admin']}>
              <UsersPage />
            </RoleBasedRender>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 