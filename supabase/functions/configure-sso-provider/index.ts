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
    
    // For now, we'll store it in a custom table and provide instructions
    const { data, error } = await supabaseAdmin
      .from('sso_providers')
      .insert({
        name,
        type,
        enabled,
        config: config,
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

    // TODO: Actually configure Supabase Auth provider
    // This requires Supabase Management API access
    // For production, you may need to:
    // 1. Use Supabase's Management API (requires API key)
    // 2. Or provide instructions to manually configure in Dashboard
    // 3. Or use Supabase CLI programmatically

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        message: 'SSO provider configuration saved. Please configure your IdP with the provided metadata URLs.',
        metadataUrls: {
          entityId: `${Deno.env.get('SUPABASE_URL')}/auth/v1/saml/metadata`,
          acsUrl: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback`,
          metadataUrl: `${Deno.env.get('SUPABASE_URL')}/auth/v1/saml/metadata`,
        }
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

