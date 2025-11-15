// Configure SSO Provider Edge Function
// This allows configuring SSO providers from your UI without accessing Supabase Dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      userId = user?.id || null;
    }

    const body = await req.json();
    const { type, name, enabled, ...config } = body;

    // Validate required fields based on type
    if (type === 'saml') {
      if (!config.saml_entity_id || !config.saml_sso_url || !config.saml_certificate) {
        return new Response(
          JSON.stringify({ error: 'Missing required SAML configuration fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (type === 'oidc') {
      if (!config.oidc_issuer_url || !config.oidc_client_id || !config.oidc_client_secret) {
        return new Response(
          JSON.stringify({ error: 'Missing required OIDC configuration fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Store SSO provider configuration in database
    // Create a table to store SSO configs if it doesn't exist
    // For now, we'll use Supabase's Management API via REST calls
    
    // Note: Supabase doesn't expose a direct Management API for SSO configuration
    // You have two options:
    // 1. Use Supabase's REST API with service role (if available)
    // 2. Store configuration in your own database table and apply via Supabase Admin API
    
    // Store SSO provider configuration in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const { data, error } = await supabaseAdmin
      .from('sso_providers')
      .insert({
        name,
        type,
        enabled,
        config: config,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, create it first
      if (error.code === '42P01') {
        // Table doesn't exist - you'll need to create it via migration
        return new Response(
          JSON.stringify({ 
            error: 'SSO providers table not found',
            message: 'Please run the migration to create sso_providers table',
            migration: `
              CREATE TABLE IF NOT EXISTS public.sso_providers (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                name text NOT NULL,
                type text NOT NULL CHECK (type IN ('saml', 'oidc', 'oauth')),
                enabled boolean DEFAULT true,
                config jsonb NOT NULL DEFAULT '{}'::jsonb,
                created_at timestamptz DEFAULT now(),
                updated_at timestamptz DEFAULT now()
              );
            `
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    // Generate configuration instructions based on provider type
    const instructions = generateConfigurationInstructions(type, supabaseUrl, config);

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        message: 'SSO provider configuration saved successfully!',
        instructions: instructions,
        metadataUrls: type === 'saml' ? {
          entityId: `${supabaseUrl}/auth/v1/saml/metadata`,
          acsUrl: `${supabaseUrl}/auth/v1/callback`,
          metadataUrl: `${supabaseUrl}/auth/v1/saml/metadata`,
        } : type === 'oidc' ? {
          redirectUri: config.redirect_uri || `${supabaseUrl}/auth/v1/callback`,
          scopes: config.oauth_scopes || 'openid email profile',
        } : undefined,
        nextSteps: [
          '1. Complete the configuration in Supabase Dashboard (Authentication → Providers)',
          '2. Configure your Identity Provider with the URLs shown above',
          '3. Test the connection using the Test tab in the provider wizard',
        ]
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error configuring SSO provider:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateConfigurationInstructions(type: string, supabaseUrl: string, config: any): string {
  if (type === 'saml') {
    return `
## SAML Configuration Steps

### 1. Configure in Supabase Dashboard:
- Go to Authentication → Providers → SAML
- Enable SAML provider
- Enter Entity ID: ${config.saml_entity_id}
- Enter SSO URL: ${config.saml_sso_url}
- Paste X.509 Certificate

### 2. Configure Your Identity Provider:
- Entity ID (Audience URI): ${supabaseUrl}/auth/v1/saml/metadata
- ACS URL (Single Sign-On URL): ${supabaseUrl}/auth/v1/callback
- Configure attribute mapping:
  * email → ${config.attribute_mapping?.email || 'email'}
  * name → ${config.attribute_mapping?.name || 'name'}
  * given_name → ${config.attribute_mapping?.given_name || 'given_name'}
  * family_name → ${config.attribute_mapping?.family_name || 'family_name'}
`;
  } else if (type === 'oidc') {
    return `
## OIDC Configuration Steps

### 1. Configure in Supabase Dashboard:
- Go to Authentication → Providers → OpenID Connect
- Enable OIDC provider
- Enter Issuer URL: ${config.oidc_issuer_url}
- Enter Client ID: ${config.oidc_client_id}
- Enter Client Secret: ${config.oidc_client_secret}
- Set Redirect URI: ${config.redirect_uri || `${supabaseUrl}/auth/v1/callback`}
- Set Scopes: ${config.oauth_scopes || 'openid email profile'}

### 2. Configure Your Identity Provider:
- Redirect URI: ${config.redirect_uri || `${supabaseUrl}/auth/v1/callback`}
- Ensure the following scopes are available: openid, email, profile
`;
  } else {
    return `
## OAuth Configuration Steps

### 1. Configure in Supabase Dashboard:
- Go to Authentication → Providers → [Your Provider]
- Enable the provider
- Enter Client ID: ${config.oauth_client_id || config.oidc_client_id}
- Enter Client Secret: ${config.oauth_client_secret || config.oidc_client_secret}
- Set Redirect URI: ${config.redirect_uri || `${supabaseUrl}/auth/v1/callback`}

### 2. Configure Your Provider:
- Add Redirect URI: ${config.redirect_uri || `${supabaseUrl}/auth/v1/callback`}
`;
  }
}

