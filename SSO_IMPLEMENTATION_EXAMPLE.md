# SSO Implementation Example

## Quick Implementation Guide

### 1. Add SSO Login Functions to AuthPage.tsx

Add these functions to your `src/pages/AuthPage.tsx`:

```typescript
// Add these imports at the top
import { Shield, LogIn } from 'lucide-react';

// Add SSO login handlers
async function handleSSOLogin(provider: 'saml' | 'azure' | 'okta') {
  setError(null);
  setLoading(true);
  
  try {
    let authOptions: any = {
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    };

    if (provider === 'saml') {
      // SAML SSO (for Ping, Okta SAML, AD FS)
      const { data, error } = await supabase.auth.signInWithSSO({
        provider: 'saml',
        ...authOptions
      });
      
      if (error) throw error;
      // User will be redirected to IdP
    } else if (provider === 'azure') {
      // Azure AD OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        ...authOptions
      });
      
      if (error) throw error;
    } else if (provider === 'okta') {
      // Okta OIDC (if configured as OIDC)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'oidc',
        options: {
          ...authOptions.options,
          queryParams: {
            provider: 'okta'
          }
        }
      });
      
      if (error) throw error;
    }
  } catch (err: any) {
    setError(err?.message || 'SSO authentication failed');
    setLoading(false);
  }
}
```

### 2. Add SSO Buttons to the Login Form

Add this section before the email/password form in your JSX:

```typescript
{/* SSO Login Options */}
<div style={{ marginBottom: 24 }}>
  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
    <Button
      type="button"
      variant="outline"
      onClick={() => handleSSOLogin('saml')}
      disabled={loading}
      className="flex-1"
      style={{ height: 44 }}
    >
      <Shield className="w-4 h-4 mr-2" />
      Sign in with SSO
    </Button>
    <Button
      type="button"
      variant="outline"
      onClick={() => handleSSOLogin('azure')}
      disabled={loading}
      className="flex-1"
      style={{ height: 44 }}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Azure AD
    </Button>
  </div>
  
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: 12, 
    marginTop: 16,
    marginBottom: 16 
  }}>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
    <span style={{ fontSize: 12, color: '#64748b' }}>OR</span>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
  </div>
</div>
```

### 3. Create Auth Callback Page

Create `src/pages/AuthCallbackPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  async function handleAuthCallback() {
    try {
      // Get the session from the OAuth/SAML callback
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        // Sync user profile from SSO attributes
        await syncUserProfile(session.user);
        navigate('/');
      } else {
        // No session, redirect to login
        navigate('/auth');
      }
    } catch (err: any) {
      console.error('Auth callback error:', err);
      setError(err?.message || 'Authentication failed');
      setTimeout(() => navigate('/auth'), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function syncUserProfile(user: any) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const userMetadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};

    if (!existingProfile) {
      // Create new profile from SSO attributes
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: userMetadata.full_name || userMetadata.name || user.email,
        first_name: userMetadata.given_name || userMetadata.first_name || '',
        last_name: userMetadata.family_name || userMetadata.last_name || '',
        // Map additional attributes from IdP
        department: userMetadata.department || appMetadata.department || null,
        job_title: userMetadata.job_title || appMetadata.job_title || null,
        // Employee ID from IdP if available
        employee_id: userMetadata.employee_id || appMetadata.employee_id || null,
      });
    } else {
      // Update existing profile with latest IdP data
      await supabase
        .from('profiles')
        .update({
          email: user.email,
          full_name: userMetadata.full_name || userMetadata.name || existingProfile.full_name,
          first_name: userMetadata.given_name || userMetadata.first_name || existingProfile.first_name,
          last_name: userMetadata.family_name || userMetadata.last_name || existingProfile.last_name,
          // Update other fields as needed
        })
        .eq('id', user.id);
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Completing sign in...</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>Please wait while we authenticate you.</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444' }}>Authentication Error</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>{error}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>Redirecting to login...</div>
      </div>
    );
  }

  return null;
}
```

### 4. Add Route for Callback

In your router configuration (likely `src/App.tsx` or similar):

```typescript
import AuthCallbackPage from './pages/AuthCallbackPage';

// Add this route:
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

## Configuration Steps

### For Ping Identity:

1. **In Supabase Dashboard:**
   - Go to Authentication → Providers → SAML
   - Enable SAML
   - Copy the **Entity ID** and **ACS URL**

2. **In PingOne/PingFederate:**
   - Create SAML Application
   - Set Entity ID: `https://your-project.supabase.co/auth/v1/saml/metadata`
   - Set ACS URL: `https://your-project.supabase.co/auth/v1/callback`
   - Configure attribute mapping:
     - `email` → `mail`
     - `name` → `displayName`
     - `given_name` → `givenName`
     - `family_name` → `sn`

3. **Download Certificate:**
   - Export X.509 certificate from Ping
   - Paste into Supabase SAML configuration

### For Okta:

1. **In Supabase Dashboard:**
   - Go to Authentication → Providers → SAML (or OIDC)
   - Enable provider
   - Copy Entity ID and ACS URL

2. **In Okta Admin Console:**
   - Create SAML 2.0 Application
   - Single Sign-On URL: `https://your-project.supabase.co/auth/v1/callback`
   - Audience URI: `https://your-project.supabase.co/auth/v1/saml/metadata`
   - Attribute Statements:
     - `email` → `user.email`
     - `name` → `user.displayName`
     - `firstName` → `user.firstName`
     - `lastName` → `user.lastName`

3. **Copy Certificate:**
   - From Okta app settings
   - Paste into Supabase

### For Active Directory (AD FS):

1. **In Supabase Dashboard:**
   - Enable SAML provider
   - Copy Entity ID and ACS URL

2. **In AD FS Management:**
   - Create Relying Party Trust
   - Identifier: `https://your-project.supabase.co/auth/v1/saml/metadata`
   - Endpoint URL: `https://your-project.supabase.co/auth/v1/callback`
   - Claim Rules:
     - E-Mail Address → `email`
     - Display Name → `name`
     - Given Name → `given_name`
     - Surname → `family_name`

## Testing

1. Click "Sign in with SSO" button
2. You should be redirected to your IdP login page
3. Enter credentials
4. You'll be redirected back to `/auth/callback`
5. Profile will be synced automatically
6. You'll be logged into the application

## Troubleshooting

- **"Invalid redirect URI"**: Check callback URL in Supabase and IdP match exactly
- **"Certificate error"**: Verify certificate is valid and not expired
- **"User not found"**: Ensure auto-provisioning is enabled in Supabase
- **"Attribute mapping error"**: Check attribute names match between IdP and Supabase

