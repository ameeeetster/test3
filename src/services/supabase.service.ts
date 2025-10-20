/**
 * Supabase Service
 * 
 * Helper functions for common database operations
 */

import { supabase } from '../lib/supabase';
import type { User, Organization, Application, Role, Entitlement } from '../types/database';

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export async function getOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getOrganizationById(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// USERS (IDENTITIES)
// ============================================================================

export async function getUsers(filters?: {
  status?: string;
  department_id?: string;
  employment_status?: string;
}) {
  let query = supabase
    .from('users')
    .select('*')
    .is('deleted_at', null);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.department_id) {
    query = query.eq('department_id', filters.department_id);
  }
  if (filters?.employment_status) {
    query = query.eq('employment_status', filters.employment_status);
  }

  const { data, error } = await query.order('display_name');
  
  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createUser(user: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUser(id: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// APPLICATIONS
// ============================================================================

export async function getApplications(organizationId?: string) {
  let query = supabase
    .from('applications')
    .select('*')
    .eq('is_active', true);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data;
}

export async function getApplicationById(id: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// ROLES
// ============================================================================

export async function getRoles(organizationId?: string) {
  let query = supabase
    .from('roles')
    .select('*')
    .eq('is_active', true);

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data;
}

export async function getRoleById(id: string) {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// ENTITLEMENTS
// ============================================================================

export async function getEntitlements(applicationId?: string) {
  let query = supabase
    .from('entitlements')
    .select('*')
    .eq('is_active', true);

  if (applicationId) {
    query = query.eq('application_id', applicationId);
  }

  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data;
}

export async function getEntitlementById(id: string) {
  const { data, error } = await supabase
    .from('entitlements')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================================================
// USER ROLES (Many-to-Many)
// ============================================================================

export async function getUserRoles(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      roles (*)
    `)
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function assignRoleToUser(userId: string, roleId: string, grantedBy?: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId,
      granted_by: grantedBy,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', roleId);
  
  if (error) throw error;
}

// ============================================================================
// ACCESS REQUESTS
// ============================================================================

export async function getAccessRequests(filters?: {
  status?: string;
  requester_id?: string;
  organizationId?: string;
}) {
  let query = supabase
    .from('access_requests')
    .select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.requester_id) {
    query = query.eq('requester_id', filters.requester_id);
  }
  if (filters?.organizationId) {
    query = query.eq('organization_id', filters.organizationId);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// JML REQUESTS
// ============================================================================

export async function getJmlRequests(filters?: {
  jml_type?: string;
  status?: string;
  identity_id?: string;
  organizationId?: string;
}) {
  let query = supabase
    .from('jml_requests')
    .select('*');

  if (filters?.jml_type) {
    query = query.eq('jml_type', filters.jml_type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.identity_id) {
    query = query.eq('identity_id', filters.identity_id);
  }
  if (filters?.organizationId) {
    query = query.eq('organization_id', filters.organizationId);
  }

  const { data, error } = await query.order('submitted_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// CERTIFICATIONS
// ============================================================================

export async function getCertificationCampaigns(organizationId?: string) {
  let query = supabase
    .from('certification_campaigns')
    .select('*');

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// AUDIT EVENTS
// ============================================================================

export async function getAuditEvents(filters?: {
  actor_id?: string;
  action?: string;
  organizationId?: string;
  limit?: number;
}) {
  let query = supabase
    .from('audit_events')
    .select('*');

  if (filters?.actor_id) {
    query = query.eq('actor_id', filters.actor_id);
  }
  if (filters?.action) {
    query = query.eq('action', filters.action);
  }
  if (filters?.organizationId) {
    query = query.eq('organization_id', filters.organizationId);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.order('occurred_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// ============================================================================
// STATISTICS (Dashboard)
// ============================================================================

export async function getDashboardStats(organizationId?: string) {
  // Get user count
  let userQuery = supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('deleted_at', null);

  if (organizationId) {
    userQuery = userQuery.eq('organization_id', organizationId);
  }

  const { count: userCount } = await userQuery;

  // Get application count
  let appQuery = supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (organizationId) {
    appQuery = appQuery.eq('organization_id', organizationId);
  }

  const { count: appCount } = await appQuery;

  // Get pending access requests
  let requestQuery = supabase
    .from('access_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Pending');

  if (organizationId) {
    requestQuery = requestQuery.eq('organization_id', organizationId);
  }

  const { count: pendingRequests } = await requestQuery;

  // Get pending JML requests
  let jmlQuery = supabase
    .from('jml_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['DRAFT', 'PENDING_APPROVAL']);

  if (organizationId) {
    jmlQuery = jmlQuery.eq('organization_id', organizationId);
  }

  const { count: pendingJml } = await jmlQuery;

  return {
    totalUsers: userCount || 0,
    totalApplications: appCount || 0,
    pendingAccessRequests: pendingRequests || 0,
    pendingJmlRequests: pendingJml || 0,
  };
}

