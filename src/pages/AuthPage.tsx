import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // IAM-related media gallery
  const iamMedia = [
    { type: 'video', src: 'https://assets.mixkit.co/videos/preview/mixkit-cybersecurity-lock-in-a-digital-environment-28162-large.mp4', alt: 'Cybersecurity Lock' },
    { type: 'video', src: 'https://assets.mixkit.co/videos/preview/mixkit-digital-security-fingerprint-scan-1941-large.mp4', alt: 'Biometric Authentication' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1600&auto=format&fit=crop&q=80', alt: 'Data Security Network' },
    { type: 'video', src: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-blue-network-of-lines-floating-23321-large.mp4', alt: 'Network Security' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&auto=format&fit=crop&q=80', alt: 'Authentication Systems' },
    { type: 'video', src: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-data-lines-flowing-26610-large.mp4', alt: 'Data Flow Security' },
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % iamMedia.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [iamMedia.length]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/');
    });
  }, [navigate]);

  async function ensureUser(emailAddr: string, authUserId: string) {
    const { data: ex } = await supabase.from('users').select('id').eq('email', emailAddr).maybeSingle();
    let uid = ex?.id;
    if (!uid) {
      const { data: created } = await supabase
        .from('users')
        .insert({ email: emailAddr, auth_user_id: authUserId, employment_status: 'ACTIVE', status: 'active', mfa_enabled: false })
        .select('id')
        .single();
      uid = created?.id;
    }
    if (emailAddr.toLowerCase() === 'admin@acme.com' && uid) {
      await supabase.from('user_platform_roles').upsert({ user_id: uid, role: 'administrator' }, { onConflict: 'user_id,role' });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session?.user) await ensureUser(email, data.session.user.id);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* LEFT PANEL - Dynamic IAM Media Gallery */}
      <div style={{ flex: '1 1 55%', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
        {/* Rotating media slides */}
        {iamMedia.map((media, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: currentSlide === index ? 1 : 0,
            }}
          >
            {media.type === 'video' ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              >
                <source src={media.src} type="video/mp4" />
              </video>
            ) : (
              <img
                src={media.src}
                alt={media.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        ))}

        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(67,56,202,0.75) 0%, rgba(79,70,229,0.65) 50%, rgba(99,102,241,0.7) 100%)',
          zIndex: 2,
        }} />

        {/* Content overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white' }}>
          <div>
            <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>IAM Platform</h1>
            <p style={{ fontSize: 16, opacity: 0.95, maxWidth: 560, lineHeight: 1.6 }}>
              Empower your enterprise with centralized identity management, automated provisioning,
              and comprehensive governance — all in one secure platform.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, opacity: 0.75 }}>© {new Date().getFullYear()} IAM Platform. All rights reserved.</div>
            {/* Slide indicators */}
            <div style={{ display: 'flex', gap: 8 }}>
              {iamMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: currentSlide === index ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    background: currentSlide === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Login Form */}
      <div style={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <div style={{ width: '100%', maxWidth: 520, padding: '32px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}>
              ID
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>IAM Platform</div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome Back!</h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Sign in with your enterprise account to continue.</p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
              <Input id="email" type="email" placeholder="you@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Password</label>
              <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                <span>Remember me</span>
              </label>
              <a href="#" style={{ color: '#4f46e5', textDecoration: 'none' }}>Forgot Password?</a>
            </div>

            {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}

            <Button type="submit" disabled={loading} className="w-full" style={{ height: 48, borderRadius: 12, fontWeight: 700 }}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>

            <div style={{ fontSize: 14, textAlign: 'center', color: '#64748b' }}>
              Don't have an account yet? <a href="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>Sign Up</a>
            </div>

            <div style={{ fontSize: 12, textAlign: 'center', color: '#94a3b8' }}>
              Tip: use <code style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>admin@acme.com</code> to auto-assign Administrator role.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
