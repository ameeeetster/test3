/**
 * Test Data Page
 * 
 * Temporary page to create test data in the database.
 * Remove this page after initial setup.
 */

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Plus } from 'lucide-react';

export function TestDataPage() {
  const [loading, setLoading] = useState(false);
  const [createdOrg, setCreatedOrg] = useState<any>(null);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [createdApp, setCreatedApp] = useState<any>(null);

  const createOrganization = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: 'Acme Corporation',
          slug: 'acme-corp',
          description: 'Sample organization for testing',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedOrg(data);
      toast.success('✅ Organization created!');
      return data;
    } catch (error: any) {
      toast.error(`Failed to create organization: ${error.message}`);
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!createdOrg) {
      toast.error('Create an organization first!');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          organization_id: createdOrg.id,
          email: 'john.doe@acme.com',
          username: 'jdoe',
          display_name: 'John Doe',
          first_name: 'John',
          last_name: 'Doe',
          employment_type: 'PERMANENT',
          employment_status: 'ACTIVE',
          status: 'active',
          job_title: 'Senior Engineer',
          mfa_enabled: false,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedUser(data);
      toast.success('✅ User created!');
    } catch (error: any) {
      toast.error(`Failed to create user: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async () => {
    if (!createdOrg) {
      toast.error('Create an organization first!');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          organization_id: createdOrg.id,
          name: 'Salesforce',
          slug: 'salesforce',
          description: 'CRM Application',
          app_type: 'saas',
          category: 'Sales',
          is_active: true,
          supports_provisioning: true,
          supports_sso: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedApp(data);
      toast.success('✅ Application created!');
    } catch (error: any) {
      toast.error(`Failed to create application: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createAllTestData = async () => {
    setLoading(true);
    
    // Create organization
    const org = await createOrganization();
    if (!org) {
      setLoading(false);
      return;
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create user
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          organization_id: org.id,
          email: 'john.doe@acme.com',
          username: 'jdoe',
          display_name: 'John Doe',
          first_name: 'John',
          last_name: 'Doe',
          employment_type: 'PERMANENT',
          employment_status: 'ACTIVE',
          status: 'active',
          job_title: 'Senior Engineer',
          mfa_enabled: false,
        })
        .select()
        .single();

      if (userError) throw userError;
      setCreatedUser(userData);
    } catch (error: any) {
      console.error('User creation error:', error);
    }

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create application
    try {
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .insert({
          organization_id: org.id,
          name: 'Salesforce',
          slug: 'salesforce',
          description: 'CRM Application',
          app_type: 'saas',
          category: 'Sales',
          is_active: true,
          supports_provisioning: true,
          supports_sso: true,
        })
        .select()
        .single();

      if (appError) throw appError;
      setCreatedApp(appData);
    } catch (error: any) {
      console.error('Application creation error:', error);
    }

    setLoading(false);
    toast.success('✅ All test data created!');
  };

  const clearAll = () => {
    setCreatedOrg(null);
    setCreatedUser(null);
    setCreatedApp(null);
    toast.info('Cleared. Ready to create new data.');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Create Test Data</h1>
            <p className="text-muted-foreground">
              Use this page to quickly create test data in your Supabase database.
            </p>
          </div>

          <div className="border-t pt-6">
            <div className="mb-4">
              <Button
                onClick={createAllTestData}
                disabled={loading || !!createdOrg}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create All Test Data (Organization, User, Application)
                  </>
                )}
              </Button>
            </div>

            {(createdOrg || createdUser || createdApp) && (
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Clear & Start Over
              </Button>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Individual Creation</h2>

            {/* Organization */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">1. Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    {createdOrg ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Created: {createdOrg.name} ({createdOrg.id})
                      </span>
                    ) : (
                      'Create the parent organization first'
                    )}
                  </p>
                </div>
                <Button
                  onClick={createOrganization}
                  disabled={loading || !!createdOrg}
                  size="sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </div>

            {/* User */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">2. User</h3>
                  <p className="text-sm text-muted-foreground">
                    {createdUser ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Created: {createdUser.display_name} ({createdUser.email})
                      </span>
                    ) : (
                      'Create a test user'
                    )}
                  </p>
                </div>
                <Button
                  onClick={createUser}
                  disabled={loading || !createdOrg || !!createdUser}
                  size="sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </div>

            {/* Application */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">3. Application</h3>
                  <p className="text-sm text-muted-foreground">
                    {createdApp ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Created: {createdApp.name}
                      </span>
                    ) : (
                      'Create a test application'
                    )}
                  </p>
                </div>
                <Button
                  onClick={createApplication}
                  disabled={loading || !createdOrg || !!createdApp}
                  size="sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </Button>
              </div>
            </div>
          </div>

          {(createdOrg && createdUser && createdApp) && (
            <div className="border-t pt-6">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  ✅ Test Data Created Successfully!
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                  Your database now has sample data. Go to the test connection page to verify:
                </p>
                <Button
                  onClick={() => window.location.href = '/test-connection'}
                  variant="outline"
                >
                  Go to Connection Test
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-medium mb-2">Next Steps</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Create the test data above</li>
              <li>2. Go to <code>/test-connection</code> to verify</li>
              <li>3. Check the Supabase dashboard to see the data</li>
              <li>4. Start integrating real data in your pages</li>
              <li>5. Remove this test page when done</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

