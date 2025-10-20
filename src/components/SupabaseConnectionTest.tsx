/**
 * Supabase Connection Test Component
 * 
 * This component tests the connection to Supabase and displays the results.
 * Add this temporarily to your app to verify everything is working.
 */

import React, { useState, useEffect } from 'react';
import { testSupabaseConnection } from '../lib/supabase';
import { getDashboardStats } from '../services/supabase.service';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const testConnection = async () => {
    setStatus('testing');
    setError(null);
    setStats(null);

    try {
      // Test basic connection
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        throw new Error('Connection test failed');
      }

      // Try to fetch some stats
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
      
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Supabase connection test failed:', err);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Supabase Connection Test</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={status === 'testing'}
          >
            {status === 'testing' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>

        <div className="border-t pt-4">
          {status === 'idle' && (
            <div className="text-muted-foreground">
              Click "Test Connection" to verify Supabase setup
            </div>
          )}

          {status === 'testing' && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Testing connection to Supabase...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">✅ Connection successful!</span>
              </div>

              {stats && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Database Statistics:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Users</div>
                      <div className="text-2xl font-semibold">{stats.totalUsers}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Applications</div>
                      <div className="text-2xl font-semibold">{stats.totalApplications}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pending Requests</div>
                      <div className="text-2xl font-semibold">{stats.pendingAccessRequests}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pending JML</div>
                      <div className="text-2xl font-semibold">{stats.pendingJmlRequests}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>✅ Environment variables loaded correctly</p>
                <p>✅ Supabase client initialized</p>
                <p>✅ Database connection established</p>
                <p>✅ Tables are accessible</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">❌ Connection failed</span>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-red-900 dark:text-red-100">Error Details:</h3>
                <p className="text-sm text-red-800 dark:text-red-200 font-mono">{error}</p>
              </div>

              <div className="text-sm space-y-2">
                <p className="font-medium">Troubleshooting checklist:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Verify <code>.env.local</code> file exists in project root</li>
                  <li>Check VITE_SUPABASE_URL is correct (no trailing slash)</li>
                  <li>Check VITE_SUPABASE_ANON_KEY is correct</li>
                  <li>Restart the dev server after updating .env.local</li>
                  <li>Verify RLS is disabled for development</li>
                  <li>Check Supabase project is running</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

