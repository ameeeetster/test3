import { supabase } from '../lib/supabase';

export interface Identity {
  id: string;
  name: string;
  email: string;
  status: string;
  // Phase 1: Quick wins
  first_name?: string;
  last_name?: string;
  phone?: string;
  department?: string;
  manager_id?: string;
  job_title?: string;
  risk_level?: string;
  username?: string;
  account_expiration?: string;
  notes?: string;
  mfa_enabled?: boolean;
  account_created?: string;
  // Phase 3: Extended attributes
  employee_id?: string;
  location?: string;
  office_address?: string;
  cost_center?: string;
  employment_type?: string;
  division?: string;
  business_unit?: string;
  start_date?: string;
  end_date?: string;
  mobile_phone?: string;
  timezone?: string;
  preferred_language?: string;
  password_last_changed?: string;
  failed_login_attempts?: number;
  account_locked?: boolean;
  account_locked_until?: string;
  data_classification?: string;
  compliance_certifications?: string[];
  privacy_consent_status?: string;
  audit_trail_enabled?: boolean;
  onboarding_status?: string;
  offboarding_status?: string;
  risk_score?: number;
  require_password_change?: boolean;
}

export interface CreateIdentityInput {
  email: string;
  password: string;
  full_name: string;
  org_id?: string;
  role?: 'org_admin' | 'member';
  // Personal Information
  first_name?: string;
  last_name?: string;
  phone?: string;
  mobile_phone?: string;
  // Organizational Information
  department?: string;
  division?: string;
  business_unit?: string;
  manager_id?: string;
  job_title?: string;
  location?: string;
  office_address?: string;
  cost_center?: string;
  employee_id?: string;
  // Employment
  employment_type?: string;
  start_date?: string;
  end_date?: string;
  // Access Control
  status?: string;
  risk_level?: string;
  initial_roles?: string[];
  // Account Settings
  username?: string;
  account_expiration?: string;
  timezone?: string;
  preferred_language?: string;
  require_password_change?: boolean;
  send_welcome_email?: boolean;
  // Compliance
  data_classification?: string;
  privacy_consent_status?: string;
  // Additional
  notes?: string;
}

export class IdentityService {
  /**
   * Fetch all identities for the current organization
   */
  static async getIdentities(): Promise<Identity[]> {
    try {
      console.log('1. Attempting Edge Function for identities...');
      const { data, error } = await supabase.functions.invoke('identities', {
        body: {
          action: 'get_identities',
          page: 1,
          pageSize: 100
        }
      });

      if (error) {
        console.error('2. Edge Function error:', error);
        throw error;
      }

      console.log('3. Edge Function response:', data);
      
      if (data?.data && data.data.length > 0) {
        console.log('4. Returning Edge Function data');
        return data.data;
      }
      
      console.log('5. Edge Function returned empty, trying direct DB...');
      throw new Error('Edge Function returned empty data');

    } catch (error) {
      console.error('6. Caught error, trying fallback:', error);
      
      // Always try direct database approach on any error
      try {
        return await this.getIdentitiesDirect();
      } catch (dbError) {
        console.error('7. Direct DB also failed, using mock data');
        return this.getMockIdentities();
      }
    }
  }

  /**
   * Fallback: Get identities directly from database
   */
  private static async getIdentitiesDirect(): Promise<Identity[]> {
    console.log('8. Attempting direct database query for identities...');
    
    try {
      // Get current user and org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('9. User not authenticated');
        return this.getMockIdentities();
      }
      console.log('10. User authenticated:', user.id);

      // Try simple query first - get all profiles with all fields
      // Note: RLS policies should allow users to see profiles in their organization
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, status, first_name, last_name, phone, department, manager_id, job_title, risk_level, username, account_expiration, notes, mfa_enabled, created_at, employee_id, location, office_address, cost_center, employment_type, division, business_unit, start_date, end_date, mobile_phone, timezone, preferred_language, password_last_changed, failed_login_attempts, account_locked, account_locked_until, data_classification, compliance_certifications, privacy_consent_status, audit_trail_enabled, onboarding_status, offboarding_status, risk_score, require_password_change')
        .order('created_at', { ascending: false })
        .limit(100);

      console.log('11. Simple profiles query result:', { count: allProfiles?.length, error: allProfilesError });

      if (allProfilesError) {
        console.error('12. Database error:', allProfilesError);
        return this.getMockIdentities();
      }

      if (!allProfiles || allProfiles.length === 0) {
        console.log('13. No profiles found in database, using mock data');
        return this.getMockIdentities();
      }

      const result = allProfiles.map(profile => ({
        id: profile.id,
        name: profile.full_name || profile.email,
        email: profile.email,
        status: profile.status || 'active',
        // Phase 1: Quick wins
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        department: profile.department,
        manager_id: profile.manager_id,
        job_title: profile.job_title,
        risk_level: profile.risk_level,
        username: profile.username,
        account_expiration: profile.account_expiration,
        notes: profile.notes,
        mfa_enabled: profile.mfa_enabled || false,
        account_created: profile.created_at,
        // Phase 3: Extended attributes
        employee_id: profile.employee_id,
        location: profile.location,
        office_address: profile.office_address,
        cost_center: profile.cost_center,
        employment_type: profile.employment_type,
        division: profile.division,
        business_unit: profile.business_unit,
        start_date: profile.start_date,
        end_date: profile.end_date,
        mobile_phone: profile.mobile_phone,
        timezone: profile.timezone,
        preferred_language: profile.preferred_language,
        password_last_changed: profile.password_last_changed,
        failed_login_attempts: profile.failed_login_attempts || 0,
        account_locked: profile.account_locked || false,
        account_locked_until: profile.account_locked_until,
        data_classification: profile.data_classification,
        compliance_certifications: profile.compliance_certifications || [],
        privacy_consent_status: profile.privacy_consent_status,
        audit_trail_enabled: profile.audit_trail_enabled !== false,
        onboarding_status: profile.onboarding_status,
        offboarding_status: profile.offboarding_status,
        risk_score: profile.risk_score || 0,
        require_password_change: profile.require_password_change || false
      }));

      console.log('14. Returning profiles from database:', result.length);
      return result;

    } catch (error) {
      console.error('15. Failed to fetch identities directly:', error);
      return this.getMockIdentities();
    }
  }

  /**
   * Create a new identity (user) in the database
   */
  static async create(input: CreateIdentityInput): Promise<Identity> {
    console.log('📝 Creating new identity:', { email: input.email, full_name: input.full_name });

    try {
      // Get current session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication required to create users');
      }

      // Get current user's organization if not provided (but don't create one - let edge function handle it)
      let orgId = input.org_id;
      if (!orgId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: memberships, error: membershipError } = await supabase
            .from('user_orgs')
            .select('org_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .limit(1);
          
          if (memberships && memberships.length > 0) {
            orgId = memberships[0].org_id;
            console.log('✅ Found existing organization:', orgId);
          } else {
            // User has no organization - let the edge function handle org creation
            // The edge function uses service role and can bypass RLS
            console.log('⚠️ User has no organization, edge function will create one if needed');
          }
        }
      }

      // Call edge function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: input.email,
          password: input.password,
          full_name: input.full_name,
          org_id: orgId,
          role: input.role || 'member',
          // Personal Information
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          mobile_phone: input.mobile_phone,
          // Organizational Information
          department: input.department,
          division: input.division,
          business_unit: input.business_unit,
          manager_id: input.manager_id,
          job_title: input.job_title,
          location: input.location,
          office_address: input.office_address,
          cost_center: input.cost_center,
          employee_id: input.employee_id,
          // Employment
          employment_type: input.employment_type,
          start_date: input.start_date,
          end_date: input.end_date,
          // Access Control
          status: input.status || 'active',
          risk_level: input.risk_level || 'low',
          initial_roles: input.initial_roles || [],
          // Account Settings
          username: input.username,
          account_expiration: input.account_expiration,
          timezone: input.timezone,
          preferred_language: input.preferred_language,
          require_password_change: input.require_password_change || false,
          send_welcome_email: input.send_welcome_email || false,
          // Compliance
          data_classification: input.data_classification,
          privacy_consent_status: input.privacy_consent_status,
          // Additional
          notes: input.notes,
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      if (!data?.success || !data?.user) {
        throw new Error(data?.error || 'Failed to create user');
      }

      console.log('✅ Identity created successfully:', {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.full_name
      });

      // Return the created identity
      return {
        id: data.user.id,
        name: data.user.full_name || input.email,
        email: data.user.email,
        status: 'active'
      };

    } catch (error) {
      console.error('❌ Error creating identity:', error);
      throw error instanceof Error ? error : new Error('Failed to create identity');
    }
  }

  /**
   * Mock identities for fallback when API is not available
   */
  private static getMockIdentities(): Identity[] {
    console.log('Using mock identities as fallback');
    return [
      { id: 'mock-1', name: 'John Doe', email: 'john.doe@company.com', status: 'active' },
      { id: 'mock-2', name: 'Jane Smith', email: 'jane.smith@company.com', status: 'active' },
      { id: 'mock-3', name: 'Mike Johnson', email: 'mike.johnson@company.com', status: 'active' },
      { id: 'mock-4', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', status: 'active' },
      { id: 'mock-5', name: 'David Brown', email: 'david.brown@company.com', status: 'active' },
      { id: 'mock-6', name: 'Emily Davis', email: 'emily.davis@company.com', status: 'active' },
      { id: 'mock-7', name: 'Robert Miller', email: 'robert.miller@company.com', status: 'active' },
      { id: 'mock-8', name: 'Lisa Garcia', email: 'lisa.garcia@company.com', status: 'active' }
    ];
  }
}
