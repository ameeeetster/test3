# Manual Setup Instructions (No CLI Required)

This guide shows you how to run the database migration and deploy the edge function using only the Supabase Dashboard.

## Step 1: Run the Database Migration

### Using Supabase Dashboard SQL Editor

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Copy and Paste the Migration SQL**
   - Copy the entire contents of `supabase/migrations/0038_create_sso_providers_table.sql`
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
   - You should see "Success. No rows returned"

5. **Verify the Table was Created**
   - Go to **"Table Editor"** in the left sidebar
   - Look for `sso_providers` table
   - You should see it with columns: `id`, `name`, `type`, `enabled`, `config`, etc.

**The SQL to copy is below:**

```sql
-- Create SSO Providers table for storing SSO configuration
-- Migration: 0038_create_sso_providers_table.sql

CREATE TABLE IF NOT EXISTS public.sso_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('saml', 'oidc', 'oauth')),
  enabled boolean DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_tested_at timestamptz,
  test_status text CHECK (test_status IN ('success', 'failed', 'pending')),
  sign_in_count int DEFAULT 0,
  last_sign_in_at timestamptz
);

-- Enable RLS
ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all SSO providers
CREATE POLICY sso_providers_select ON public.sso_providers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can modify (admins should be checked in application layer)
CREATE POLICY sso_providers_modify ON public.sso_providers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sso_providers_type ON public.sso_providers(type);
CREATE INDEX IF NOT EXISTS idx_sso_providers_enabled ON public.sso_providers(enabled);
CREATE INDEX IF NOT EXISTS idx_sso_providers_created_at ON public.sso_providers(created_at DESC);

-- Add helpful comments
COMMENT ON TABLE public.sso_providers IS 'Stores SSO provider configurations (SAML, OIDC, OAuth)';
COMMENT ON COLUMN public.sso_providers.name IS 'Display name for the SSO provider';
COMMENT ON COLUMN public.sso_providers.type IS 'Provider type: saml, oidc, or oauth';
COMMENT ON COLUMN public.sso_providers.enabled IS 'Whether this provider is currently enabled';
COMMENT ON COLUMN public.sso_providers.config IS 'JSON configuration containing provider-specific settings';
COMMENT ON COLUMN public.sso_providers.last_tested_at IS 'Timestamp of last connection test';
COMMENT ON COLUMN public.sso_providers.test_status IS 'Status of last test: success, failed, or pending';
COMMENT ON COLUMN public.sso_providers.sign_in_count IS 'Total number of sign-ins using this provider';
COMMENT ON COLUMN public.sso_providers.last_sign_in_at IS 'Timestamp of most recent sign-in using this provider';
```

---

## Step 2: Deploy the Edge Function

### Using Supabase Dashboard

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to Edge Functions**
   - Click **"Edge Functions"** in the left sidebar
   - Click **"Create a new function"** (or **"New Function"**)

3. **Create the Function**
   - **Function name**: `configure-sso-provider`
   - Click **"Create function"**

4. **Copy the Function Code**
   - Delete any default code in the editor
   - Copy the entire contents of `supabase/functions/configure-sso-provider/index.ts`
   - Paste it into the editor

5. **Deploy the Function**
   - Click **"Deploy"** button (usually at the top right)
   - Wait for deployment to complete (you'll see a success message)

6. **Verify the Function**
   - You should see `configure-sso-provider` in your functions list
   - Status should show as "Active" or "Deployed"

**The function code to copy is in the file: `supabase/functions/configure-sso-provider/index.ts`**

**Quick copy-paste version:**

```typescript
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
```

---

## Verification Steps

### Verify Migration:
1. Go to **Table Editor** → Look for `sso_providers` table
2. Check that it has all the columns listed above
3. Try querying it: `SELECT * FROM sso_providers LIMIT 1;` (should return empty result, not an error)

### Verify Edge Function:
1. Go to **Edge Functions** → Look for `configure-sso-provider`
2. Status should be "Active" or "Deployed"
3. You can test it by clicking "Invoke" (though it will fail without proper auth, that's expected)

---

## Troubleshooting

### Migration Issues:
- **"relation already exists"**: The table already exists, which is fine. The migration uses `IF NOT EXISTS`.
- **"permission denied"**: Make sure you're logged in as a project owner/admin.

### Edge Function Issues:
- **"Function not found"**: Make sure you created it with the exact name `configure-sso-provider`
- **"Deployment failed"**: Check the error message. Common issues:
  - Syntax errors in the code
  - Missing imports
  - Copy-paste errors (make sure you copied the entire file)

---

## Next Steps

After completing both steps:
1. ✅ Database migration is complete
2. ✅ Edge function is deployed
3. You can now use the SSO configuration UI in your application!

Go to **Settings → Identity & Access Management → SSO Providers** and click **"Add Provider"** to test it out.

