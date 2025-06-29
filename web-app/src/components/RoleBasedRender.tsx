import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface RoleBasedRenderProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

const RoleBasedRender: React.FC<RoleBasedRenderProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedRender; 