import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusOverrideRequest {
  user_id: string;
  status: 'disabled' | 'active_override';
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      );
    }

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
      .rpc('is_org_admin');

    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }

    // Parse request body
    const body: StatusOverrideRequest = await req.json();
    
    // Validate request
    if (!body.user_id || !body.status || !body.reason) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: user_id, status, reason' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!['disabled', 'active_override'].includes(body.status)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid status. Must be "disabled" or "active_override"' 
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
      .eq('org_id', userOrg.org_id)
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

    // Create status override
    const { error: overrideError } = await supabase
      .rpc('create_status_override', {
        p_user_id: body.user_id,
        p_org_id: userOrg.org_id,
        p_status: body.status,
        p_reason: body.reason
      });

    if (overrideError) {
      console.error('Failed to create status override:', overrideError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create status override',
          details: overrideError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Get updated user info for response
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, status')
      .eq('id', body.user_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Status override created successfully',
        user: userProfile,
        override: {
          status: body.status,
          reason: body.reason,
          set_at: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Status override failed:', error);
    
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
