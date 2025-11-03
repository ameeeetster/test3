import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

interface AssignRoleRequest {
  user_id: string;
  role_id: string;
  expires_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated and get their org
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Get user's organization
    const { data: userOrg, error: orgError } = await supabase
      .from('user_orgs')
      .select('org_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (orgError || !userOrg) {
      return new Response(
        JSON.stringify({ error: 'User organization not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    // Verify user is org admin
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_org_admin', { user_id: user.id, org_id: userOrg.org_id });

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // Route handling
    if (req.method === 'GET' && path.endsWith('/roles')) {
      return handleGetRoles(supabase, userOrg.org_id);
    } else if (req.method === 'POST' && path.endsWith('/roles')) {
      return handleCreateRole(req, supabase, userOrg.org_id);
    } else if (req.method === 'GET' && path.endsWith('/permissions')) {
      return handleGetPermissions(supabase);
    } else if (req.method === 'POST' && path.endsWith('/role-assignments')) {
      return handleAssignRole(req, supabase, userOrg.org_id);
    } else if (req.method === 'DELETE' && path.includes('/role-assignments/')) {
      const assignmentId = path.split('/').pop();
      return handleRemoveRole(assignmentId!, supabase, userOrg.org_id);
    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      );
    }

  } catch (error) {
    console.error('Role management API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function handleGetRoles(supabase: any, orgId: string) {
  const { data: roles, error } = await supabase
    .from('v_role_details')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: roles
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleCreateRole(req: Request, supabase: any, orgId: string) {
  const body: CreateRoleRequest = await req.json();
  
  if (!body.name || !body.permissions || !Array.isArray(body.permissions)) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing required fields: name, permissions' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }

  // Create role using the SQL function
  const { data: roleId, error } = await supabase
    .rpc('create_role', {
      p_name: body.name,
      p_description: body.description || '',
      p_permission_keys: body.permissions
    });

  if (error) {
    throw new Error(`Failed to create role: ${error.message}`);
  }

  // Get the created role details
  const { data: role, error: roleError } = await supabase
    .from('v_role_details')
    .select('*')
    .eq('id', roleId)
    .single();

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Role created successfully',
      data: role
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    }
  );
}

async function handleGetPermissions(supabase: any) {
  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('*')
    .order('key');

  if (error) {
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: permissions
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function handleAssignRole(req: Request, supabase: any, orgId: string) {
  const body: AssignRoleRequest = await req.json();
  
  if (!body.user_id || !body.role_id) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing required fields: user_id, role_id' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }

  // Verify target user is in the same org
  const { data: targetUserOrg, error: targetOrgError } = await supabase
    .from('user_orgs')
    .select('org_id')
    .eq('user_id', body.user_id)
    .eq('org_id', orgId)
    .eq('is_active', true)
    .single();

  if (targetOrgError || !targetUserOrg) {
    return new Response(
      JSON.stringify({ error: 'Target user not found in your organization' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    );
  }

  // Assign role using the SQL function
  const { data: assignmentId, error } = await supabase
    .rpc('assign_role', {
      p_user_id: body.user_id,
      p_role_id: body.role_id,
      p_expires_at: body.expires_at || null
    });

  if (error) {
    throw new Error(`Failed to assign role: ${error.message}`);
  }

  // Get assignment details
  const { data: assignment, error: assignmentError } = await supabase
    .from('v_user_role_assignments')
    .select('*')
    .eq('assignment_id', assignmentId)
    .single();

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Role assigned successfully',
      data: assignment
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    }
  );
}

async function handleRemoveRole(assignmentId: string, supabase: any, orgId: string) {
  // Get assignment details first
  const { data: assignment, error: fetchError } = await supabase
    .from('role_assignments')
    .select('user_id, role_id')
    .eq('id', assignmentId)
    .eq('org_id', orgId)
    .single();

  if (fetchError || !assignment) {
    return new Response(
      JSON.stringify({ error: 'Role assignment not found' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404 
      }
    );
  }

  // Remove role using the SQL function
  const { error } = await supabase
    .rpc('remove_role', {
      p_user_id: assignment.user_id,
      p_role_id: assignment.role_id
    });

  if (error) {
    throw new Error(`Failed to remove role: ${error.message}`);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Role removed successfully'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
