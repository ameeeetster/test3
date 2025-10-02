import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'end-user' | 'approver' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

interface UserContextType {
  user: User;
  setUserRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'view:dashboard'
  | 'view:my-requests'
  | 'create:request'
  | 'view:approvals'
  | 'approve:requests'
  | 'view:all-requests'
  | 'view:identities'
  | 'manage:identities'
  | 'view:roles'
  | 'manage:roles'
  | 'view:reviews'
  | 'manage:reviews'
  | 'view:risk'
  | 'manage:risk'
  | 'view:reports'
  | 'view:integrations'
  | 'manage:integrations'
  | 'view:settings'
  | 'manage:settings';

// Role-based permissions matrix
const rolePermissions: Record<UserRole, Permission[]> = {
  'end-user': [
    'view:dashboard',
    'view:my-requests',
    'create:request',
  ],
  'approver': [
    'view:dashboard',
    'view:my-requests',
    'create:request',
    'view:approvals',
    'approve:requests',
    'view:identities',
    'view:reports',
  ],
  'administrator': [
    'view:dashboard',
    'view:my-requests',
    'create:request',
    'view:approvals',
    'approve:requests',
    'view:all-requests',
    'view:identities',
    'manage:identities',
    'view:roles',
    'manage:roles',
    'view:reviews',
    'manage:reviews',
    'view:risk',
    'manage:risk',
    'view:reports',
    'view:integrations',
    'manage:integrations',
    'view:settings',
    'manage:settings',
  ],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>({
    id: 'user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'administrator',
    department: 'IT Operations',
  });

  const setUserRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  };

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[user.role].includes(permission);
  };

  return (
    <UserContext.Provider value={{ user, setUserRole, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Utility functions for role checking
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    'end-user': 'End User',
    'approver': 'Approver',
    'administrator': 'Administrator',
  };
  return labels[role];
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    'end-user': 'Can view and request access for themselves',
    'approver': 'Can approve requests and view team information',
    'administrator': 'Full access to manage the entire platform',
  };
  return descriptions[role];
}