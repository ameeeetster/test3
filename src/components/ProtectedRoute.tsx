import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

export function ProtectedRoute({ children, requiredRole, requiredPermission }: {
  children: React.ReactNode;
  requiredRole?: 'org_admin' | 'member';
  requiredPermission?: string; // placeholder for future permission checks
}) {
  const { loading, session, isEmailVerified } = useAuth();

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!session) return <Navigate to="/auth" replace />;
  if (!isEmailVerified) return <Navigate to="/auth?verify=email" replace />;

  // Role/permission checks will consult membership and role assignments once loaded
  return <>{children}</>;
}


