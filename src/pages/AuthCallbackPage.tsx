import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // Get the session from the OAuth/SAML callback
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error('No session found. Authentication may have failed.');
      }

      // Sync user profile if needed
      await syncUserProfile(session.user);

      setStatus('success');
      
      // Redirect to home after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('Auth callback error:', err);
      setError(err.message || 'Authentication failed');
      setStatus('error');
      
      // Redirect to login after error
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  }

  async function syncUserProfile(user: any) {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile from SSO user data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
            first_name: user.user_metadata?.given_name || user.user_metadata?.first_name,
            last_name: user.user_metadata?.family_name || user.user_metadata?.last_name,
            mfa_enabled: false,
            status: 'active',
            risk_level: 'low',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } else {
        // Update profile with latest SSO data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || existingProfile.full_name,
            first_name: user.user_metadata?.given_name || user.user_metadata?.first_name || existingProfile.first_name,
            last_name: user.user_metadata?.family_name || user.user_metadata?.last_name || existingProfile.last_name,
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        }
      }
    } catch (err) {
      console.error('Error syncing profile:', err);
      // Don't throw - profile sync failure shouldn't block login
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 16,
      padding: '24px'
    }}>
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--primary)' }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
            Completing authentication...
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
            Please wait while we sign you in.
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--success)' }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)' }}>
            Authentication Successful
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
            Redirecting to dashboard...
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-12 h-12" style={{ color: 'var(--destructive)' }} />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--destructive)' }}>
            Authentication Failed
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: 400 }}>
            {error || 'An error occurred during authentication'}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '12px 16px',
            borderRadius: 8,
            backgroundColor: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            color: 'var(--warning)',
            fontSize: 12
          }}>
            <AlertCircle className="w-4 h-4" />
            <span>Redirecting to login page...</span>
          </div>
        </>
      )}
    </div>
  );
}

