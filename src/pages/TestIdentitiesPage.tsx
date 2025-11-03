import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface Identity {
  id: string;
  email: string;
  display_name: string;
  job_title: string;
  department: string;
  manager_name: string;
  risk_level: string;
  status: string;
  mfa_enabled: boolean;
  last_login_at: string;
  start_date: string;
}

export default function TestIdentitiesPage() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    // Get session info for debugging
    const getSessionInfo = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionInfo(session);
    };
    getSessionInfo();
  }, []);

  const fetchIdentities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Calling identities function...');
      const { data, error } = await supabase.functions.invoke('identities');
      console.log('Function response:', { data, error });

      if (error) {
        setError(`Function error: ${error.message}`);
        return;
      }

      if (data?.error) {
        setError(`API error: ${data.error}`);
        return;
      }

      setIdentities(data?.data || []);
    } catch (err) {
      console.error('Network error:', err);
      setError(`Network error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Identities Edge Function</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Session Info:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {sessionInfo ? JSON.stringify({
                user_id: sessionInfo.user?.id,
                email: sessionInfo.user?.email,
                org_id: sessionInfo.user?.user_metadata?.org_id,
                roles: sessionInfo.user?.user_metadata?.roles
              }, null, 2) : 'Loading...'}
            </pre>
          </div>

          <Button onClick={fetchIdentities} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Identities'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {identities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Identities ({identities.length}):</h3>
              <div className="space-y-2">
                {identities.map((identity) => (
                  <div key={identity.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{identity.display_name}</span>
                        <span className="text-gray-600 ml-2">({identity.email})</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={identity.risk_level === 'HIGH' ? 'destructive' : 'secondary'}>
                          {identity.risk_level}
                        </Badge>
                        <Badge variant={identity.status === 'active' ? 'default' : 'outline'}>
                          {identity.status}
                        </Badge>
                        {identity.mfa_enabled && (
                          <Badge variant="outline">MFA</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {identity.job_title} • {identity.department} • Manager: {identity.manager_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Started: {new Date(identity.start_date).toLocaleDateString()} • 
                      Last login: {identity.last_login_at ? new Date(identity.last_login_at).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
