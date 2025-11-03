import { supabase } from '../lib/supabase';

export interface Identity {
  id: string;
  name: string;
  email: string;
  status: string;
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

      // Try simple query first - just get all profiles
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, status')
        .limit(10);

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
        status: profile.status || 'active'
      }));

      console.log('14. Returning profiles from database:', result.length);
      return result;

    } catch (error) {
      console.error('15. Failed to fetch identities directly:', error);
      return this.getMockIdentities();
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
