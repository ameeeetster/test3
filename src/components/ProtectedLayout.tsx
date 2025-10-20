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


