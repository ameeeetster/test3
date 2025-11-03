import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/');
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (signUpError) throw signUpError;
      setSuccessMsg('Check your email to verify your address and complete registration.');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 520, padding: '32px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}>
              ID
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>IAM Platform</div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create your account</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Sign up to get started. Email verification is required.</p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
              <Input id="email" type="email" placeholder="you@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Password</label>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}
            {successMsg && <div style={{ color: '#16a34a', fontSize: 14 }}>{successMsg}</div>}

            <Button type="submit" disabled={loading} className="w-full" style={{ height: 48, borderRadius: 12, fontWeight: 700 }}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>

            <div style={{ fontSize: 14, textAlign: 'center', color: '#64748b' }}>
              Already have an account? <a href="/auth" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign In</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


