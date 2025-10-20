import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type Membership = { org_id: string; role: 'org_admin' | 'member' };

interface AuthState {
  session: any | null;
  profile: any | null;
  memberships: Membership[];
  activeOrgId: string | null;
  isEmailVerified: boolean;
  loading: boolean;
  setActiveOrg: (orgId: string) => Promise<void>;
  signOutEverywhere: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await bootstrap(data.session.user.id);
      }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function bootstrap(userId: string) {
    const [{ data: prof }, { data: uo }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_orgs').select('org_id, role').eq('user_id', userId).eq('is_active', true),
    ]);
    setProfile(prof || null);
    setMemberships((uo || []) as Membership[]);
    const stored = localStorage.getItem('activeOrgId');
    const initial = stored && (uo || []).some(m => m.org_id === stored) ? stored : (uo && uo[0]?.org_id) || null;
    setActiveOrgId(initial);
  }

  async function setActiveOrg(orgId: string) {
    setActiveOrgId(orgId);
    localStorage.setItem('activeOrgId', orgId);
    // Optionally refresh session to include claim via Edge/JWT enrich hook
  }

  async function signOutEverywhere() {
    await supabase.auth.signOut({ scope: 'global' });
  }

  const isEmailVerified = Boolean(session?.user?.email_confirmed_at);

  const value: AuthState = useMemo(() => ({
    session,
    profile,
    memberships,
    activeOrgId,
    isEmailVerified,
    loading,
    setActiveOrg,
    signOutEverywhere,
  }), [session, profile, memberships, activeOrgId, isEmailVerified, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


