# UI-Based SSO Configuration Guide

## Yes, You Can Configure Everything from Your UI! 🎉

You're absolutely right - you already have the UI components (`AuthenticationTab` and `ProviderWizard`). Here's how to make them fully functional so you can configure SSO providers entirely from your application UI.

## What You Already Have

✅ **AuthenticationTab** - Shows list of SSO providers  
✅ **ProviderWizard** - Multi-step wizard for configuring providers  
✅ **UI for SAML, OIDC, OAuth providers**

## What Needs to Be Connected

The UI exists but needs to be connected to:
1. **SSO Service** - To save/load provider configurations
2. **Edge Functions** - To configure Supabase Auth providers
3. **Database Table** - To store provider configurations

## Implementation Steps

### Step 1: Create Database Table for SSO Providers

Create migration: `supabase/migrations/0038_create_sso_providers_table.sql`

```sql
-- Create table to store SSO provider configurations
CREATE TABLE IF NOT EXISTS public.sso_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('saml', 'oidc', 'oauth')),
  enabled boolean DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.sso_providers ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view
CREATE POLICY sso_providers_select ON public.sso_providers
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Only admins can insert/update/delete
CREATE POLICY sso_providers_modify ON public.sso_providers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_platform_roles
      WHERE user_id = auth.uid() AND role = 'administrator'
    )
  );

-- Create index
CREATE INDEX idx_sso_providers_type ON public.sso_providers(type);
CREATE INDEX idx_sso_providers_enabled ON public.sso_providers(enabled);
```

### Step 2: Update ProviderWizard to Use SSO Service

Update `src/components/settings/ProviderWizard.tsx`:

```typescript
import { SSOService, type SSOProviderConfig } from '../../services/ssoService';
import { toast } from 'sonner';

// In the component, update handleSave:
const handleSave = async () => {
  try {
    const config: SSOProviderConfig = {
      name: connectionData.name,
      type: provider.toLowerCase() as 'saml' | 'oidc' | 'oauth',
      enabled: true,
      redirectUri: connectionData.redirectUri,
      // SAML config
      samlEntityId: connectionData.issuer,
      samlSSOUrl: connectionData.ssoUrl,
      samlCertificate: connectionData.certificate,
      // OIDC config
      oidcIssuerUrl: connectionData.issuer,
      oidcClientId: connectionData.clientId,
      oidcClientSecret: connectionData.clientSecret,
      // Attribute mapping
      attributeMapping: {
        email: claimsData.email,
        name: claimsData.name,
        given_name: claimsData.firstName,
        family_name: claimsData.lastName,
      },
      // Policies
      jitProvisioning: policiesData.jitProvisioning,
      defaultRole: policiesData.defaultRole,
      allowedDomains: policiesData.allowedDomains,
    };

    let provider;
    if (config.type === 'saml') {
      provider = await SSOService.configureSAMLProvider(config);
    } else if (config.type === 'oidc') {
      provider = await SSOService.configureOIDCProvider(config);
    }

    toast.success('SSO provider configured successfully!');
    
    // Show metadata URLs for IdP configuration
    const metadataUrls = SSOService.getMetadataUrls();
    toast.info('Configure your IdP with these URLs:', {
      description: `Entity ID: ${metadataUrls.entityId}\nACS URL: ${metadataUrls.acsUrl}`,
      duration: 10000,
    });

    onOpenChange(false);
  } catch (error: any) {
    toast.error('Failed to configure provider', {
      description: error.message,
    });
  }
};
```

### Step 3: Update AuthenticationTab to Load Real Providers

Update `src/pages/settings/AuthenticationTab.tsx`:

```typescript
import { SSOService } from '../../services/ssoService';
import { useEffect } from 'react';

// Replace the mock providers state:
const [providers, setProviders] = useState<SSOProvider[]>([]);
const [loading, setLoading] = useState(true);

// Load providers on mount
useEffect(() => {
  loadProviders();
}, []);

const loadProviders = async () => {
  try {
    setLoading(true);
    const loadedProviders = await SSOService.getProviders();
    setProviders(loadedProviders);
  } catch (error) {
    console.error('Failed to load providers:', error);
    toast.error('Failed to load SSO providers');
  } finally {
    setLoading(false);
  }
};

// Update handleTestEmail to use real test function:
const handleTestEmail = async () => {
  if (!testEmailInput) {
    toast.error('Please enter an email address');
    return;
  }
  
  // Test with the first configured provider
  const configuredProvider = providers.find(p => p.status === 'configured');
  if (!configuredProvider) {
    toast.error('No configured provider found');
    return;
  }

  const result = await SSOService.testProvider(configuredProvider.id, testEmailInput);
  if (result.success) {
    toast.success('Test successful', { description: result.message });
  } else {
    toast.error('Test failed', { description: result.message });
  }
};
```

## Important Note About IdP Configuration

**You still need to configure your IdP (Ping/Okta/AD) in their admin consoles**, but:

1. **Your UI provides the metadata URLs** - The `SSOService.getMetadataUrls()` function gives you:
   - Entity ID
   - ACS URL (Assertion Consumer Service)
   - Metadata URL

2. **Copy these URLs** - When configuring in Ping/Okta/AD, use these URLs

3. **Get IdP certificate** - You'll need to download the certificate from your IdP and paste it into your UI

## Complete Flow

1. **Admin opens Settings → Authentication**
2. **Clicks "Add Provider"** → Selects SAML/Okta/Ping
3. **Fills in wizard:**
   - Connection details (SSO URL, Certificate)
   - Attribute mapping
   - Policies
4. **Clicks "Save"** → Configuration saved to database
5. **UI shows metadata URLs** → Admin copies these
6. **Admin goes to Ping/Okta/AD admin console:**
   - Creates SAML application
   - Pastes metadata URLs from step 5
   - Downloads certificate
   - Pastes certificate back into your UI
7. **Test connection** → Everything works!

## What About Supabase Dashboard?

**You don't need to use Supabase Dashboard** if you:
- Store provider configs in your database
- Use edge functions to apply configurations
- Handle SSO authentication through Supabase Auth API

However, Supabase's Management API for Auth providers is limited. For full programmatic control, you may need to:
- Use Supabase CLI programmatically, OR
- Store configs and provide a "Apply Configuration" button that opens Supabase Dashboard (one-time setup)

## Alternative: Hybrid Approach

1. **Configure in your UI** → Store in database
2. **Show "Apply to Supabase" button** → Opens Supabase Dashboard with pre-filled values
3. **One-time setup** → After that, everything works from your UI

This gives you the best of both worlds - UI-based management with Supabase's native SSO support.

