import { supabase } from '../lib/supabase';

export interface Permission {
  id: string;
  key: string;
  description: string;
  category?: string;
}

export interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  created_by_email?: string;
  permissions: string[];
  permission_descriptions: string[];
  permission_count: number;
  assigned_user_count: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateRoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
}

export class RBACService {
  /**
   * Fetch all available permissions for the current organization
   */
  static async getPermissions(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase.functions.invoke('role-management', {
        body: {
          action: 'get_permissions'
        }
      });

      if (error) {
        console.error('Error fetching permissions:', error);
        throw error;
      }

      return data?.permissions || [];
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      
      // If it's a 403 error, try direct database approach
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        console.log('Edge Function not available, using direct database approach for permissions');
        return await this.getPermissionsDirect();
      }
      
      // Fallback to mock permissions if API fails
      return this.getMockPermissions();
    }
  }

  /**
   * Fallback: Get permissions directly from database
   */
  private static async getPermissionsDirect(): Promise<Permission[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('id, key, description')
        .order('key');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to fetch permissions directly:', error);
      return this.getMockPermissions();
    }
  }

  /**
   * Fetch all roles for the current organization
   */
  static async getRoles(): Promise<Role[]> {
    try {
      console.log('📡 Fetching roles from database...');
      
      // Try to get roles directly from database - query all columns to see what we have
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });
      
      console.log('📊 Raw data from query:', data);

      if (error) {
        console.error('❌ Error fetching roles from database:', error);
        
        // Fallback: try Edge Function
        try {
          console.log('🔄 Trying Edge Function as fallback...');
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('role-management', {
            body: {
              action: 'get_roles'
            }
          });

          if (edgeError) {
            console.error('❌ Error fetching roles from Edge Function:', edgeError);
            return [];
          }

          console.log('✅ Edge Function returned:', edgeData?.roles || edgeData?.data || []);
          return edgeData?.roles || edgeData?.data || [];
        } catch (edgeErr) {
          console.error('❌ Failed to fetch roles from Edge Function:', edgeErr);
          return [];
        }
      }

      console.log('✅ Database query successful, found:', data?.length || 0, 'roles');
      console.log('📋 Roles:', data);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to fetch roles:', error);
      return [];
    }
  }

  /**
   * Create a new role with permissions
   */
  static async createRole(roleData: CreateRoleRequest): Promise<CreateRoleResponse> {
    try {
      const { data, error } = await supabase
        .rpc('handle_create_role', {
          p_name: roleData.name,
          p_description: roleData.description,
          p_permission_keys: roleData.permissions
        });

      if (error) {
        console.error('RPC error:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('permission denied') || error.message?.includes('Forbidden')) {
          throw new Error('You do not have permission to create roles. Please contact your administrator.');
        } else if (error.message?.includes('User is not authenticated')) {
          throw new Error('You must be logged in to create roles.');
        } else if (error.message?.includes('not found')) {
          throw new Error('Required database function not found. Please run database migrations.');
        } else {
          throw new Error(`Failed to create role: ${error.message}`);
        }
      }
      
      if (!data) {
        throw new Error('Role creation failed: No data returned from server.');
      }
      
      return {
        id: data,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        created_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  /**
   * Assign a role to a user
   */
  static async assignRole(userId: string, roleId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('role-management', {
        body: {
          action: 'assign_role',
          user_id: userId,
          role_id: roleId
        }
      });

      if (error) {
        console.error('Error assigning role:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  }

  /**
   * Remove a role assignment from a user
   */
  static async removeRoleAssignment(assignmentId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('role-management', {
        body: {
          action: 'remove_role_assignment',
          assignment_id: assignmentId
        }
      });

      if (error) {
        console.error('Error removing role assignment:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove role assignment:', error);
      throw error;
    }
  }

  /**
   * Mock permissions for fallback when API is not available
   */
  private static getMockPermissions(): Permission[] {
    return [
      { id: '1', key: 'invite_create', description: 'Create user invitations', category: 'User Management' },
      { id: '2', key: 'identity_view', description: 'View user identities', category: 'User Management' },
      { id: '3', key: 'identity_edit', description: 'Edit user identities', category: 'User Management' },
      { id: '4', key: 'identity_delete', description: 'Delete user identities', category: 'User Management' },
      { id: '5', key: 'audit_view', description: 'View audit logs', category: 'Audit & Compliance' },
      { id: '6', key: 'audit_export', description: 'Export audit logs', category: 'Audit & Compliance' },
      { id: '7', key: 'role_manage', description: 'Manage roles and permissions', category: 'Role Management' },
      { id: '8', key: 'role_assign', description: 'Assign roles to users', category: 'Role Management' },
      { id: '9', key: 'org_settings_edit', description: 'Edit organization settings', category: 'Organization' },
      { id: '10', key: 'org_settings_view', description: 'View organization settings', category: 'Organization' },
      { id: '11', key: 'certification_manage', description: 'Manage certifications', category: 'Certification' },
      { id: '12', key: 'certification_review', description: 'Review certifications', category: 'Certification' }
    ];
  }

  /**
   * Get permissions grouped by category
   */
  static async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getPermissions();
    const grouped: Record<string, Permission[]> = {};

    permissions.forEach(permission => {
      const category = permission.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });

    return grouped;
  }

  /**
   * Fetch permissions for a specific role
   */
  static async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      console.log('🔍 Fetching permissions for role:', roleId);
      
      // Query role_permissions to get permissions for this role
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions:permission_id (
            id,
            key,
            description
          )
        `)
        .eq('role_id', roleId);

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        return [];
      }

      // Extract permissions from the joined data
      const permissions: Permission[] = (data || [])
        .filter(rp => rp.permissions)
        .map(rp => ({
          id: rp.permissions.id,
          key: rp.permissions.key,
          description: rp.permissions.description || ''
        }));

      console.log('✅ Found permissions for role:', permissions);
      return permissions;
      
    } catch (error) {
      console.error('❌ Failed to fetch role permissions:', error);
      return [];
    }
  }
}
