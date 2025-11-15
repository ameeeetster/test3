import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppShell } from './AppShell';

export function ProtectedLayout() {
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [isAuthed, setIsAuthed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const devBypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true' && localStorage.getItem('devAuthed') === '1';
    if (devBypass) {
      setIsAuthed(true);
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(Boolean(data.session));
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(Boolean(session));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAuthed) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}


