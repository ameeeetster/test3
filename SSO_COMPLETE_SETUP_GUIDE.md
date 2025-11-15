# Complete SSO Setup Guide

This guide provides step-by-step instructions for setting up Single Sign-On (SSO) with your IAM/IGA application using the UI-based configuration.

## Overview

The SSO implementation allows you to:
- Configure SAML 2.0, OIDC, and OAuth providers entirely from the UI
- Store provider configurations in the database
- Get step-by-step instructions for completing setup in Supabase Dashboard
- Test connections and manage multiple providers

## Prerequisites

1. **Database Migration**: Run the migration to create the `sso_providers` table:
   ```sql
   -- Run this in Supabase SQL Editor
   -- File: supabase/migrations/0038_create_sso_providers_table.sql
   ```

2. **Edge Function**: Deploy the `configure-sso-provider` edge function:
   ```bash
   supabase functions deploy configure-sso-provider
   ```

3. **Environment Variables**: Ensure these are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY` (for edge function)

## Quick Start

### Step 1: Access SSO Configuration

1. Navigate to **Settings** → **Identity & Access Management** tab
2. Scroll to the **SSO Providers** section
3. Click **"Add Provider"**

### Step 2: Choose Provider Type

Select from:
- **SAML** - For Ping Identity, Okta SAML, AD FS
- **OIDC** - For Okta OIDC, Azure AD OIDC
- **OAuth** - For Azure AD, Google Workspace

### Step 3: Configure Provider

Fill in the required fields in the wizard:

#### For SAML:
- **Provider Name**: Display name (e.g., "Production SSO")
- **SAML Entity ID**: From your IdP
- **SAML SSO URL**: Single Sign-On URL from your IdP
- **X.509 Certificate**: Paste the certificate from your IdP

#### For OIDC/OAuth:
- **Provider Name**: Display name
- **Issuer URL**: OAuth 2.0 authorization server URL
- **Client ID**: From your IdP application
- **Client Secret**: From your IdP application

### Step 4: Configure Claims Mapping

Map provider claims to user attributes:
- `email` → User email
- `name` → Full name
- `given_name` → First name
- `family_name` → Last name

### Step 5: Set Policies

- **Just-In-Time Provisioning**: Automatically create users on first sign-in
- **Default Role**: Role assigned to new users
- **Domain Allowlist**: Restrict sign-ins to specific email domains

### Step 6: Save and Complete Setup

1. Click **"Save Provider"**
2. The configuration is saved to the database
3. **Important**: You'll see instructions to complete setup in Supabase Dashboard

## Completing Setup in Supabase Dashboard

After saving the provider configuration in the UI, you need to complete the setup in Supabase Dashboard:

### For SAML:

1. Go to **Authentication** → **Providers** → **SAML**
2. Enable SAML provider
3. Enter the values from your saved configuration:
   - Entity ID
   - SSO URL
   - X.509 Certificate
4. Save

### For OIDC:

1. Go to **Authentication** → **Providers** → **OpenID Connect**
2. Enable OIDC provider
3. Enter:
   - Issuer URL
   - Client ID
   - Client Secret
   - Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Scopes: `openid email profile`
4. Save

### For OAuth (Azure AD, Google, etc.):

1. Go to **Authentication** → **Providers** → **[Your Provider]**
2. Enable the provider
3. Enter Client ID and Client Secret
4. Set Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Save

## Configuring Your Identity Provider

### For Ping Identity (SAML):

1. In PingOne/PingFederate, create a new SAML application
2. Set **ACS URL** to: `https://your-project.supabase.co/auth/v1/callback`
3. Set **Entity ID** to: `https://your-project.supabase.co/auth/v1/saml/metadata`
4. Configure attribute mapping:
   - `email` → `mail`
   - `name` → `displayName`
   - `given_name` → `givenName`
   - `family_name` → `sn`
5. Export X.509 certificate and paste into Supabase

### For Okta (SAML):

1. In Okta Admin Console, create a new SAML 2.0 application
2. Set **Single Sign-On URL** to: `https://your-project.supabase.co/auth/v1/callback`
3. Set **Audience URI** to: `https://your-project.supabase.co/auth/v1/saml/metadata`
4. Configure attribute statements:
   - `email` → `user.email`
   - `name` → `user.displayName`
   - `firstName` → `user.firstName`
   - `lastName` → `user.lastName`
5. Copy certificate from Okta app settings

### For Okta (OIDC):

1. In Okta Admin Console, create a new OIDC application
2. Set **Redirect URI** to: `https://your-project.supabase.co/auth/v1/callback`
3. Note the **Client ID** and **Client Secret**
4. Set **Issuer URL** to: `https://your-tenant.okta.com/oauth2/default`

### For Azure AD:

1. In Azure Portal, go to **Azure Active Directory** → **App registrations**
2. Create a new registration or use existing
3. Add **Redirect URI**: `https://your-project.supabase.co/auth/v1/callback`
4. Note the **Application (client) ID** and create a **Client secret**
5. For OIDC, use Issuer URL: `https://login.microsoftonline.com/{tenant-id}/v2.0`

### For Active Directory (AD FS):

1. In AD FS Management Console, create a new Relying Party Trust
2. Set **Identifier** to: `https://your-project.supabase.co/auth/v1/saml/metadata`
3. Set **Endpoint URL** to: `https://your-project.supabase.co/auth/v1/callback`
4. Configure claim rules:
   - E-Mail Address → `email`
   - Display Name → `name`
   - Given Name → `given_name`
   - Surname → `family_name`
5. Export certificate from AD FS certificate store

## Testing SSO

1. Go to **Settings** → **Identity & Access Management** → **SSO Providers**
2. Click on a configured provider
3. Go to the **Test** tab
4. Click **"Run Test Sign-In"**
5. You'll be redirected to your IdP for authentication
6. After successful authentication, you'll be redirected back to the application

## Using SSO in Your Application

### Adding SSO Login Buttons

Update `src/pages/AuthPage.tsx` to add SSO login buttons:

```typescript
import { supabase } from '../lib/supabase';

async function handleSSOLogin(provider: 'saml' | 'oidc' | 'azure') {
  try {
    if (provider === 'saml') {
      const { data, error } = await supabase.auth.signInWithSSO({
        provider: 'saml',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } else if (provider === 'azure') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } else if (provider === 'oidc') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid email profile'
        }
      });
      if (error) throw error;
    }
  } catch (err: any) {
    console.error('SSO login error:', err);
    toast.error(err.message || 'SSO authentication failed');
  }
}
```

### Handling Callbacks

The `AuthCallbackPage` component automatically handles SSO callbacks:
- Extracts session from callback
- Syncs user profile
- Redirects to home page

Route is already configured in `src/App.tsx`:
```typescript
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

## Managing Providers

### Viewing Providers

All configured providers appear in the **SSO Providers** section of Settings.

### Editing Providers

1. Click on a provider tile
2. Click **"Configure"**
3. Update settings in the wizard
4. Save changes

### Disabling Providers

1. Click on a provider tile
2. Click **"Disable"**
3. Confirm the action

**Note**: You cannot disable the last active provider.

### Testing Providers

1. Click on a provider tile
2. Click **"Test"**
3. Follow the test flow

### Rotating Secrets

1. Click on a provider tile
2. Click **"Rotate Secret"**
3. Generate a new secret
4. **Important**: Update the secret in your IdP immediately

## Troubleshooting

### "SSO providers table not found"

**Solution**: Run the migration:
```sql
-- Run supabase/migrations/0038_create_sso_providers_table.sql
```

### "Failed to configure provider"

**Possible causes**:
- Missing required fields
- Edge function not deployed
- Service role key not configured

**Solution**:
1. Check all required fields are filled
2. Deploy edge function: `supabase functions deploy configure-sso-provider`
3. Verify `VITE_SUPABASE_SERVICE_ROLE_KEY` is set

### "Invalid redirect URI"

**Solution**: Ensure the redirect URI in Supabase matches exactly with your IdP:
- Supabase: `https://your-project.supabase.co/auth/v1/callback`
- Your App: `https://your-app.com/auth/callback`
- IdP: Must include both URLs

### "Certificate error"

**Solution**:
- Verify certificate is valid and not expired
- Ensure certificate includes `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`
- Check for extra whitespace or line breaks

### "User not found after SSO login"

**Solution**:
- Enable Just-In-Time (JIT) provisioning in provider settings
- Check attribute mapping matches your IdP claims
- Verify email attribute is correctly mapped

### "Attribute mapping error"

**Solution**:
- Check claim names match between IdP and Supabase
- Verify attribute mapping in the Claims tab
- Test with a sample user to see actual claims

## Architecture

```
User → AuthPage (SSO Button)
  ↓
Supabase Auth → External IdP (Ping/Okta/AD)
  ↓
AuthCallbackPage → Session Created
  ↓
Profile Synced → User Logged In
```

## Database Schema

The `sso_providers` table stores:
- Provider configuration (SAML/OIDC/OAuth settings)
- Status and metadata
- Test results and sign-in statistics

## Security Considerations

1. **Service Role Key**: Never expose `VITE_SUPABASE_SERVICE_ROLE_KEY` in client-side code
2. **Certificates**: Store certificates securely
3. **Client Secrets**: Use environment variables for secrets
4. **Domain Allowlist**: Restrict sign-ins to trusted domains
5. **JIT Provisioning**: Review auto-created users regularly

## Next Steps

1. **Add SSO Login Buttons**: Update `AuthPage.tsx` with SSO login options
2. **Configure Multiple Providers**: Set up SAML, OIDC, and OAuth providers
3. **Set Up HRD Rules**: Configure Home Realm Discovery for email-based routing
4. **Test End-to-End**: Test the complete SSO flow
5. **Monitor Usage**: Review sign-in statistics in provider tiles

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase Auth documentation
3. Check your IdP's SSO documentation
4. Review the edge function logs in Supabase Dashboard

## Related Files

- `src/services/ssoService.ts` - SSO service layer
- `src/components/settings/ProviderWizard.tsx` - Provider configuration UI
- `src/pages/settings/AuthenticationTab.tsx` - SSO settings page
- `src/pages/AuthCallbackPage.tsx` - SSO callback handler
- `supabase/functions/configure-sso-provider/index.ts` - Edge function
- `supabase/migrations/0038_create_sso_providers_table.sql` - Database schema

