import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  const mountedRef = useRef(true);
  const syncTokenRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const resetAuthState = useCallback(() => {
    if (!mountedRef.current) return;
    setProfile(null);
    setMemberships([]);
    setActiveOrgId(null);
    localStorage.removeItem('activeOrgId');
  }, []);

  const bootstrap = useCallback(async (userId: string) => {
    const [{ data: prof }, { data: uo }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('user_orgs').select('org_id, role').eq('user_id', userId).eq('is_active', true),
    ]);
    const membershipsData = (uo || []) as Membership[];
    const stored = localStorage.getItem('activeOrgId');
    const initial = stored && membershipsData.some(m => m.org_id === stored) ? stored : membershipsData[0]?.org_id || null;
    return {
      profile: prof || null,
      memberships: membershipsData,
      activeOrgId: initial ?? null,
    };
  }, []);

  useEffect(() => {
    async function syncSession(nextSession: any | null) {
      if (!mountedRef.current) return;
      const token = ++syncTokenRef.current;
      setLoading(true);
      setSession(nextSession);
      try {
        if (nextSession?.user) {
          const data = await bootstrap(nextSession.user.id);
          if (!mountedRef.current || syncTokenRef.current !== token) return;
          setProfile(data.profile);
          setMemberships(data.memberships);
          setActiveOrgId(data.activeOrgId);
        } else {
          if (!mountedRef.current || syncTokenRef.current !== token) return;
          resetAuthState();
        }
      } finally {
        if (mountedRef.current && syncTokenRef.current === token) {
          setLoading(false);
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, newSession) => {
      syncSession(newSession);
    });
    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [bootstrap, resetAuthState]);

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


