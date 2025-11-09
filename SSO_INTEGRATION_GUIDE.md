# SSO Integration Guide: Ping, Okta, Active Directory

This guide explains how to integrate your IAM/IGA application with external identity providers (IdPs) like Ping Identity, Okta, and Active Directory for Single Sign-On (SSO).

## Overview

Supabase Auth supports multiple SSO methods:
1. **SAML 2.0** - For enterprise IdPs (Ping, Okta, AD FS, etc.)
2. **OIDC (OpenID Connect)** - Modern standard (Okta, Azure AD, etc.)
3. **OAuth 2.0** - For specific providers (Google, Azure AD, etc.)

## Architecture

```
User → Your App → Supabase Auth → External IdP (Ping/Okta/AD)
                ↓
         Session Created
                ↓
         User Profile Synced
```

## Option 1: SAML 2.0 Integration (Recommended for Enterprise)

### Step 1: Configure SAML in Supabase Dashboard

1. Go to **Authentication → Providers → SAML** in your Supabase Dashboard
2. Enable SAML provider
3. Configure the following:

**For Ping Identity:**
- **Entity ID**: `https://your-supabase-project.supabase.co/auth/v1/saml/metadata`
- **SSO URL**: Your Ping SSO endpoint (e.g., `https://your-tenant.pingone.com/sso`)
- **X.509 Certificate**: Download from Ping Identity admin console

**For Okta:**
- **Entity ID**: `https://your-supabase-project.supabase.co/auth/v1/saml/metadata`
- **SSO URL**: From Okta app settings (e.g., `https://your-tenant.okta.com/app/saml/sso`)
- **X.509 Certificate**: From Okta app settings

**For Active Directory (AD FS):**
- **Entity ID**: `https://your-supabase-project.supabase.co/auth/v1/saml/metadata`
- **SSO URL**: Your AD FS endpoint (e.g., `https://adfs.yourdomain.com/adfs/ls`)
- **X.509 Certificate**: From AD FS certificate store

### Step 2: Configure Your Identity Provider

#### Ping Identity Configuration:
1. In PingOne/PingFederate, create a new SAML application
2. Set **ACS URL** to: `https://your-supabase-project.supabase.co/auth/v1/callback`
3. Set **Entity ID** to: `https://your-supabase-project.supabase.co/auth/v1/saml/metadata`
4. Configure attribute mapping:
   - `email` → User's email
   - `name` → User's full name
   - `given_name` → First name
   - `family_name` → Last name

#### Okta Configuration:
1. In Okta Admin Console, create a new SAML 2.0 application
2. Set **Single Sign-On URL** to: `https://your-supabase-project.supabase.co/auth/v1/callback`
3. Set **Audience URI** to: `https://your-supabase-project.supabase.co/auth/v1/saml/metadata`
4. Configure attribute statements:
   - `email` → `user.email`
   - `name` → `user.displayName`
   - `firstName` → `user.firstName`
   - `lastName` → `user.lastName`

#### Active Directory (AD FS) Configuration:
1. In AD FS Management Console, create a new Relying Party Trust
2. Set **Identifier** to: `https://your-supabase-project.supabase.co/auth/v1/saml/metadata`
3. Set **Endpoint URL** to: `https://your-supabase-project.supabase.co/auth/v1/callback`
4. Configure claim rules:
   - E-Mail Address → `email`
   - Display Name → `name`
   - Given Name → `given_name`
   - Surname → `family_name`

### Step 3: Update Your Auth Page

Update `src/pages/AuthPage.tsx` to add SSO login button:

```typescript
// Add SAML SSO login
async function handleSSOLogin() {
  const { data, error } = await supabase.auth.signInWithSSO({
    provider: 'saml',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    setError(error.message);
  }
  // User will be redirected to IdP for authentication
}

// In your JSX, add SSO button:
<Button onClick={handleSSOLogin} variant="outline">
  Sign in with SSO
</Button>
```

## Option 2: OIDC Integration (Okta, Azure AD)

### Step 1: Configure OIDC in Supabase

1. Go to **Authentication → Providers → OpenID Connect** in Supabase Dashboard
2. Enable OIDC provider
3. Get configuration from your IdP:

**For Okta:**
- **Issuer URL**: `https://your-tenant.okta.com/oauth2/default`
- **Client ID**: From Okta app
- **Client Secret**: From Okta app

**For Azure AD:**
- **Issuer URL**: `https://login.microsoftonline.com/{tenant-id}/v2.0`
- **Client ID**: From Azure AD app registration
- **Client Secret**: From Azure AD app registration

### Step 2: Update Auth Page for OIDC

```typescript
async function handleOIDCLogin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'oidc',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'openid email profile'
    }
  });
  
  if (error) {
    setError(error.message);
  }
}
```

## Option 3: Azure AD Direct Integration

Supabase has built-in Azure AD support:

```typescript
async function handleAzureADLogin() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email openid profile'
    }
  });
}
```

## Step 4: Handle SSO Callback

Create `src/pages/AuthCallbackPage.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth/SAML callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // User is authenticated, sync profile
        syncUserProfile(session.user);
        navigate('/');
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  async function syncUserProfile(user: any) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create profile from SSO attributes
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        first_name: user.user_metadata?.given_name || '',
        last_name: user.user_metadata?.family_name || '',
        // Map other attributes from IdP
      });
    } else {
      // Update existing profile with latest IdP data
      await supabase
        .from('profiles')
        .update({
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || existingProfile.full_name,
          // Update other fields
        })
        .eq('id', user.id);
    }
  }

  return <div>Completing sign in...</div>;
}
```

## Step 5: Update Routes

Add the callback route in your router:

```typescript
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

## Step 6: Auto-Provision Users from IdP

Create an edge function to sync users from your IdP:

`supabase/functions/sync-idp-users/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // This would be called periodically or via webhook from your IdP
  // to sync user data
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Fetch users from your IdP API (Ping/Okta/AD)
  // Then sync to Supabase profiles table
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Testing SSO Integration

1. **Test SAML Flow:**
   ```bash
   # Use browser dev tools to monitor network requests
   # Check for SAML assertions and attribute mapping
   ```

2. **Verify User Attributes:**
   ```typescript
   // After SSO login, check user metadata
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User metadata:', user.user_metadata);
   ```

## Security Considerations

1. **Certificate Management**: Rotate SAML certificates regularly
2. **Attribute Mapping**: Only map necessary attributes
3. **Session Management**: Configure session timeout appropriately
4. **Audit Logging**: Log all SSO authentication attempts

## Troubleshooting

### Common Issues:

1. **"Invalid SAML response"**
   - Check certificate validity
   - Verify ACS URL matches exactly
   - Check clock synchronization

2. **"User not found"**
   - Ensure auto-provisioning is enabled
   - Check attribute mapping

3. **"Redirect loop"**
   - Verify callback URL configuration
   - Check CORS settings

## Next Steps

1. Configure your IdP (Ping/Okta/AD) with Supabase SAML settings
2. Update `AuthPage.tsx` to include SSO login button
3. Create `AuthCallbackPage.tsx` for handling callbacks
4. Test the integration in a development environment
5. Enable SSO for production users

## Additional Resources

- [Supabase SAML Documentation](https://supabase.com/docs/guides/auth/sso/auth-sso-saml)
- [Supabase OIDC Documentation](https://supabase.com/docs/guides/auth/sso/auth-sso-oidc)
- [Ping Identity SAML Guide](https://docs.pingidentity.com/)
- [Okta SAML Guide](https://developer.okta.com/docs/guides/saml-application-setup/overview/)

