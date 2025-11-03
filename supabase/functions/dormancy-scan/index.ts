import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrgSettings {
  org_id: string;
  dormant_days: number;
}

interface UserStatus {
  user_id: string;
  org_id: string;
  last_login_at: string | null;
  current_status: string;
  has_override: boolean;
  override_status: string | null;
}

interface StatusChange {
  user_id: string;
  org_id: string;
  old_status: string;
  new_status: string;
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting dormancy scan...');

    // Get all organization settings
    const { data: orgSettings, error: orgError } = await supabase
      .from('org_settings')
      .select('org_id, dormant_days');

    if (orgError) {
      throw new Error(`Failed to fetch org settings: ${orgError.message}`);
    }

    console.log(`Found ${orgSettings.length} organizations to scan`);

    const statusChanges: StatusChange[] = [];

    // Process each organization
    for (const org of orgSettings as OrgSettings[]) {
      console.log(`Processing org ${org.org_id} with ${org.dormant_days} day threshold`);

      // Get users in this org with their login status
      const { data: users, error: usersError } = await supabase
        .rpc('get_users_with_login_status', { 
          p_org_id: org.org_id,
          p_dormant_days: org.dormant_days 
        });

      if (usersError) {
        console.error(`Failed to get users for org ${org.org_id}:`, usersError);
        continue;
      }

      console.log(`Found ${users.length} users in org ${org.org_id}`);

      // Process each user
      for (const user of users as UserStatus[]) {
        const newStatus = determineUserStatus(user, org.dormant_days);
        
        if (newStatus !== user.current_status) {
          statusChanges.push({
            user_id: user.user_id,
            org_id: user.org_id,
            old_status: user.current_status,
            new_status: newStatus,
            reason: getStatusChangeReason(user, newStatus, org.dormant_days)
          });

          // Update user status
          const { error: updateError } = await supabase
            .rpc('update_user_status', {
              p_user_id: user.user_id,
              p_org_id: user.org_id,
              p_new_status: newStatus,
              p_reason: 'dormancy_scan'
            });

          if (updateError) {
            console.error(`Failed to update status for user ${user.user_id}:`, updateError);
          } else {
            console.log(`Updated user ${user.user_id} from ${user.current_status} to ${newStatus}`);
          }
        }
      }
    }

    // Log summary
    console.log(`Dormancy scan completed. ${statusChanges.length} status changes processed.`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dormancy scan completed successfully',
        processed_orgs: orgSettings.length,
        status_changes: statusChanges.length,
        changes: statusChanges
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Dormancy scan failed:', error);
    
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

function determineUserStatus(user: UserStatus, dormantDays: number): string {
  // Check for manual overrides first
  if (user.has_override) {
    return user.override_status === 'disabled' ? 'disabled' : 'active';
  }

  // If no login data, mark as inactive
  if (!user.last_login_at) {
    return 'inactive';
  }

  // Calculate days since last login
  const lastLogin = new Date(user.last_login_at);
  const now = new Date();
  const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  // Determine status based on dormancy threshold
  if (daysSinceLogin > dormantDays) {
    return 'dormant';
  } else {
    return 'active';
  }
}

function getStatusChangeReason(user: UserStatus, newStatus: string, dormantDays: number): string {
  if (user.has_override) {
    return `Manual override: ${user.override_status}`;
  }

  if (!user.last_login_at) {
    return 'No login history';
  }

  const lastLogin = new Date(user.last_login_at);
  const now = new Date();
  const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  switch (newStatus) {
    case 'dormant':
      return `No login for ${daysSinceLogin} days (threshold: ${dormantDays})`;
    case 'active':
      return `Recent login within ${dormantDays} day threshold`;
    case 'inactive':
      return 'No login history available';
    default:
      return 'Status updated by dormancy scan';
  }
}
