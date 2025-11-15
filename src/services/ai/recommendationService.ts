import { supabase } from '../../lib/supabase';

// Types
export interface AccessRecommendation {
  id: string;
  type: RecommendationType;
  resourceType: 'role' | 'entitlement' | 'application' | 'group';
  resourceId: string;
  resourceName: string;
  confidence: number; // 0-1
  reason: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type RecommendationType =
  | 'peer_based'      // Based on similar users
  | 'role_based'      // Based on job role/title
  | 'department_based' // Based on department
  | 'pattern_based'   // Based on usage patterns
  | 'birthright'      // Standard access for role
  | 'temporary';      // Time-limited access suggestion

interface PeerGroup {
  userId: string;
  name: string;
  department: string;
  jobTitle: string;
  commonAccess: string[];
  similarity: number;
}

interface AccessPattern {
  resourceId: string;
  resourceName: string;
  usageFrequency: number;
  userCount: number;
  averageUsagePerUser: number;
}

/**
 * AI-Powered Access Recommendation Service
 * Uses intelligent algorithms to suggest optimal access based on peer groups and patterns
 */
export class RecommendationService {
  
  /**
   * Get comprehensive access recommendations for a user
   */
  static async getRecommendationsForUser(userId: string): Promise<AccessRecommendation[]> {
    const recommendations: AccessRecommendation[] = [];

    try {
      const [peerBased, roleBased, departmentBased, birthrightAccess] = await Promise.all([
        this.getPeerBasedRecommendations(userId),
        this.getRoleBasedRecommendations(userId),
        this.getDepartmentBasedRecommendations(userId),
        this.getBirthrightAccessRecommendations(userId)
      ]);

      recommendations.push(...peerBased);
      recommendations.push(...roleBased);
      recommendations.push(...departmentBased);
      recommendations.push(...birthrightAccess);

      // Remove duplicates (same resource recommended by multiple methods)
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations);

      // Sort by confidence and priority
      return uniqueRecommendations.sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence - a.confidence;
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on peer group analysis
   * Find users with similar roles/departments and suggest their access
   */
  private static async getPeerBasedRecommendations(userId: string): Promise<AccessRecommendation[]> {
    // Get target user details
    const { data: user } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        department,
        job_title,
        role_assignments!inner(
          role:roles(id, name)
        )
      `)
      .eq('id', userId)
      .single();

    if (!user) return [];

    // Find peer group (same department AND similar job title)
    const { data: peers } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        department,
        job_title,
        role_assignments!inner(
          role:roles(id, name)
        )
      `)
      .eq('department', user.department)
      .ilike('job_title', `%${this.getJobTitleCore(user.job_title)}%`)
      .neq('id', userId)
      .limit(50);

    if (!peers || peers.length < 3) {
      // Need at least 3 peers for meaningful recommendations
      return [];
    }

    // Get current user's access
    const userRoleIds = new Set(
      user.role_assignments?.map((ra: any) => ra.role.id) || []
    );

    // Calculate access frequency among peers
    const accessFrequency = new Map<string, { 
      count: number; 
      name: string; 
      peerIds: string[] 
    }>();

    peers.forEach(peer => {
      peer.role_assignments?.forEach((ra: any) => {
        const roleId = ra.role.id;
        const current = accessFrequency.get(roleId) || { 
          count: 0, 
          name: ra.role.name,
          peerIds: []
        };
        current.count++;
        current.peerIds.push(peer.id);
        accessFrequency.set(roleId, current);
      });
    });

    // Generate recommendations for access user doesn't have
    const recommendations: AccessRecommendation[] = [];
    const threshold = Math.max(peers.length * 0.5, 3); // At least 50% of peers or 3 users

    accessFrequency.forEach((freq, roleId) => {
      if (!userRoleIds.has(roleId) && freq.count >= threshold) {
        const percentage = (freq.count / peers.length) * 100;
        const confidence = Math.min(percentage / 100, 0.95); // Cap at 95%

        recommendations.push({
          id: `peer-${roleId}`,
          type: 'peer_based',
          resourceType: 'role',
          resourceId: roleId,
          resourceName: freq.name,
          confidence,
          reason: `${Math.round(percentage)}% of similar users (${freq.count}/${peers.length}) in ${user.department} have this role`,
          priority: confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low',
          metadata: {
            peerCount: peers.length,
            usersWithAccess: freq.count,
            percentage: Math.round(percentage),
            department: user.department,
            jobTitle: user.job_title
          },
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  /**
   * Get recommendations based on job role/title
   */
  private static async getRoleBasedRecommendations(userId: string): Promise<AccessRecommendation[]> {
    const { data: user } = await supabase
      .from('users')
      .select(`
        id,
        job_title,
        department,
        role_assignments!inner(
          role:roles(id, name)
        )
      `)
      .eq('id', userId)
      .single();

    if (!user || !user.job_title) return [];

    // Define role-based access patterns (this could be stored in DB)
    const rolePatterns: Record<string, { roles: string[]; reason: string }> = {
      'software engineer': {
        roles: ['Developer', 'Code Repository Access', 'CI/CD Access'],
        reason: 'Standard access for Software Engineers'
      },
      'manager': {
        roles: ['Team Manager', 'Report Viewer', 'Approval Authority'],
        reason: 'Standard managerial access'
      },
      'finance': {
        roles: ['Financial Systems Read', 'Accounting Software'],
        reason: 'Standard access for Finance team members'
      },
      'hr': {
        roles: ['HR Systems', 'Employee Data Access'],
        reason: 'Standard access for HR team members'
      },
      'data analyst': {
        roles: ['BI Tools', 'Database Read Access', 'Analytics Platform'],
        reason: 'Standard access for Data Analysts'
      },
      'sales': {
        roles: ['CRM Access', 'Sales Tools'],
        reason: 'Standard access for Sales team members'
      }
    };

    const recommendations: AccessRecommendation[] = [];
    const jobTitleLower = user.job_title.toLowerCase();
    const currentRoles = new Set(user.role_assignments?.map((ra: any) => ra.role.name) || []);

    // Check if user's job title matches any patterns
    for (const [pattern, config] of Object.entries(rolePatterns)) {
      if (jobTitleLower.includes(pattern)) {
        // Find roles that match the pattern and user doesn't have
        const { data: suggestedRoles } = await supabase
          .from('roles')
          .select('id, name')
          .in('name', config.roles)
          .eq('organization_id', user.organization_id);

        suggestedRoles?.forEach(role => {
          if (!currentRoles.has(role.name)) {
            recommendations.push({
              id: `role-${role.id}`,
              type: 'role_based',
              resourceType: 'role',
              resourceId: role.id,
              resourceName: role.name,
              confidence: 0.85,
              reason: config.reason,
              priority: 'high',
              metadata: {
                jobTitle: user.job_title,
                pattern
              },
              createdAt: new Date()
            });
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Get recommendations based on department-wide patterns
   */
  private static async getDepartmentBasedRecommendations(userId: string): Promise<AccessRecommendation[]> {
    const { data: user } = await supabase
      .from('users')
      .select(`
        id,
        department,
        role_assignments!inner(
          role:roles(id, name)
        )
      `)
      .eq('id', userId)
      .single();

    if (!user || !user.department) return [];

    // Get all users in same department
    const { data: departmentUsers } = await supabase
      .from('users')
      .select(`
        id,
        role_assignments!inner(
          role:roles(id, name)
        )
      `)
      .eq('department', user.department)
      .neq('id', userId);

    if (!departmentUsers || departmentUsers.length < 5) return [];

    // Calculate department-wide access patterns
    const currentRoles = new Set(user.role_assignments?.map((ra: any) => ra.role.id) || []);
    const departmentAccessFrequency = new Map<string, { count: number; name: string }>();

    departmentUsers.forEach(deptUser => {
      deptUser.role_assignments?.forEach((ra: any) => {
        const current = departmentAccessFrequency.get(ra.role.id) || {
          count: 0,
          name: ra.role.name
        };
        current.count++;
        departmentAccessFrequency.set(ra.role.id, current);
      });
    });

    const recommendations: AccessRecommendation[] = [];
    const threshold = departmentUsers.length * 0.7; // 70% of department

    departmentAccessFrequency.forEach((freq, roleId) => {
      if (!currentRoles.has(roleId) && freq.count >= threshold) {
        const percentage = (freq.count / departmentUsers.length) * 100;

        recommendations.push({
          id: `dept-${roleId}`,
          type: 'department_based',
          resourceType: 'role',
          resourceId: roleId,
          resourceName: freq.name,
          confidence: Math.min(percentage / 100, 0.9),
          reason: `${Math.round(percentage)}% of ${user.department} department (${freq.count}/${departmentUsers.length} users) have this access`,
          priority: 'medium',
          metadata: {
            department: user.department,
            departmentSize: departmentUsers.length,
            usersWithAccess: freq.count
          },
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  /**
   * Get birthright access recommendations
   * Standard access that should be automatically granted based on role
   */
  private static async getBirthrightAccessRecommendations(userId: string): Promise<AccessRecommendation[]> {
    const { data: user } = await supabase
      .from('users')
      .select(`
        id,
        job_title,
        department,
        role_assignments(role:roles(id, name))
      `)
      .eq('id', userId)
      .single();

    if (!user) return [];

    const recommendations: AccessRecommendation[] = [];
    const currentRoles = new Set(user.role_assignments?.map((ra: any) => ra.role.id) || []);

    // Define birthright access rules
    const birthrightRules = [
      {
        condition: () => true, // All users
        roles: ['Employee Self Service', 'Company Directory'],
        reason: 'Standard access for all employees'
      },
      {
        condition: () => user.job_title?.toLowerCase().includes('manager'),
        roles: ['Manager Dashboard', 'Team Reports'],
        reason: 'Standard access for all managers'
      },
      {
        condition: () => user.department?.toLowerCase() === 'engineering',
        roles: ['Development Tools', 'Code Repository'],
        reason: 'Standard access for Engineering department'
      },
      {
        condition: () => user.department?.toLowerCase() === 'finance',
        roles: ['Financial Reports Viewer'],
        reason: 'Standard access for Finance department'
      }
    ];

    for (const rule of birthrightRules) {
      if (rule.condition()) {
        // Find matching roles
        const { data: matchingRoles } = await supabase
          .from('roles')
          .select('id, name')
          .in('name', rule.roles);

        matchingRoles?.forEach(role => {
          if (!currentRoles.has(role.id)) {
            recommendations.push({
              id: `birthright-${role.id}`,
              type: 'birthright',
              resourceType: 'role',
              resourceId: role.id,
              resourceName: role.name,
              confidence: 1.0, // Birthright access is 100% confidence
              reason: rule.reason,
              priority: 'high',
              metadata: {
                rule: 'birthright_access',
                autoProvision: true
              },
              createdAt: new Date()
            });
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Get recommendations for a new hire
   */
  static async getNewHireRecommendations(
    department: string,
    jobTitle: string,
    managerId?: string
  ): Promise<AccessRecommendation[]> {
    const recommendations: AccessRecommendation[] = [];

    // Get access patterns for similar employees
    const { data: similarUsers } = await supabase
      .from('users')
      .select(`
        id,
        role_assignments!inner(
          role:roles(id, name)
        )
      `)
      .eq('department', department)
      .ilike('job_title', `%${this.getJobTitleCore(jobTitle)}%`)
      .limit(20);

    if (!similarUsers || similarUsers.length === 0) return recommendations;

    // Calculate access frequency
    const accessFrequency = new Map<string, { count: number; name: string }>();

    similarUsers.forEach(user => {
      user.role_assignments?.forEach((ra: any) => {
        const current = accessFrequency.get(ra.role.id) || {
          count: 0,
          name: ra.role.name
        };
        current.count++;
        accessFrequency.set(ra.role.id, current);
      });
    });

    // Recommend access that 60%+ of similar users have
    const threshold = similarUsers.length * 0.6;

    accessFrequency.forEach((freq, roleId) => {
      if (freq.count >= threshold) {
        const percentage = (freq.count / similarUsers.length) * 100;

        recommendations.push({
          id: `newhire-${roleId}`,
          type: 'peer_based',
          resourceType: 'role',
          resourceId: roleId,
          resourceName: freq.name,
          confidence: Math.min(percentage / 100, 0.95),
          reason: `${Math.round(percentage)}% of similar employees (${freq.count}/${similarUsers.length}) have this access`,
          priority: 'high',
          metadata: {
            isNewHire: true,
            department,
            jobTitle,
            similarUserCount: similarUsers.length
          },
          createdAt: new Date()
        });
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get recommendations for approval automation
   * Identify low-risk requests that can be auto-approved
   */
  static async getAutoApprovalRecommendations(orgId: string): Promise<{
    resourceId: string;
    resourceName: string;
    approvalRate: number;
    averageApprovalTime: number;
    recommendAutoApprove: boolean;
    reason: string;
  }[]> {
    // Analyze past 90 days of requests
    const { data: requests } = await supabase
      .from('access_requests')
      .select('resource_id, resource_name, status, submitted_at, approved_at')
      .eq('organization_id', orgId)
      .gte('submitted_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['APPROVED', 'REJECTED']);

    if (!requests || requests.length === 0) return [];

    // Group by resource
    const resourceStats = new Map<string, {
      total: number;
      approved: number;
      avgApprovalTime: number;
      name: string;
    }>();

    requests.forEach(req => {
      const key = req.resource_id;
      const current = resourceStats.get(key) || {
        total: 0,
        approved: 0,
        avgApprovalTime: 0,
        name: req.resource_name
      };

      current.total++;
      if (req.status === 'APPROVED') {
        current.approved++;
        if (req.approved_at && req.submitted_at) {
          const approvalTime = new Date(req.approved_at).getTime() - 
                               new Date(req.submitted_at).getTime();
          current.avgApprovalTime += approvalTime / (1000 * 60 * 60); // hours
        }
      }

      resourceStats.set(key, current);
    });

    // Generate recommendations
    const recommendations: any[] = [];

    resourceStats.forEach((stats, resourceId) => {
      if (stats.total < 10) return; // Need at least 10 requests for pattern

      const approvalRate = stats.approved / stats.total;
      const avgTime = stats.avgApprovalTime / stats.approved;

      // Recommend auto-approval if >95% approval rate and consistent
      const recommendAutoApprove = approvalRate >= 0.95 && stats.total >= 20;

      recommendations.push({
        resourceId,
        resourceName: stats.name,
        approvalRate: Math.round(approvalRate * 100),
        averageApprovalTime: Math.round(avgTime * 10) / 10,
        recommendAutoApprove,
        reason: recommendAutoApprove
          ? `${Math.round(approvalRate * 100)}% approval rate over ${stats.total} requests suggests this is low-risk and can be auto-approved`
          : `${Math.round(approvalRate * 100)}% approval rate - needs human review`
      });
    });

    return recommendations.sort((a, b) => b.approvalRate - a.approvalRate);
  }

  /**
   * Get smart suggestions for access request form
   * As user types, suggest relevant access they might need
   */
  static async getSmartSuggestions(
    userId: string,
    searchTerm: string,
    limit: number = 5
  ): Promise<AccessRecommendation[]> {
    const { data: user } = await supabase
      .from('users')
      .select('department, job_title')
      .eq('id', userId)
      .single();

    if (!user) return [];

    // Search for roles matching the term
    const { data: matchingRoles } = await supabase
      .from('roles')
      .select('id, name, description')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .limit(limit);

    if (!matchingRoles) return [];

    // Get peer recommendations to boost relevance
    const peerRecommendations = await this.getPeerBasedRecommendations(userId);
    const peerRoleIds = new Set(peerRecommendations.map(r => r.resourceId));

    // Build suggestions with relevance scoring
    return matchingRoles.map(role => {
      const isPeerRecommended = peerRoleIds.has(role.id);
      const confidence = isPeerRecommended ? 0.9 : 0.6;

      return {
        id: `suggest-${role.id}`,
        type: isPeerRecommended ? 'peer_based' : 'pattern_based',
        resourceType: 'role' as const,
        resourceId: role.id,
        resourceName: role.name,
        confidence,
        reason: isPeerRecommended
          ? 'Commonly used by similar users in your department'
          : 'Matches your search',
        priority: isPeerRecommended ? 'high' : 'medium',
        metadata: {
          description: role.description,
          searchTerm
        },
        createdAt: new Date()
      };
    });
  }

  // Helper methods
  private static deduplicateRecommendations(recommendations: AccessRecommendation[]): AccessRecommendation[] {
    const seen = new Map<string, AccessRecommendation>();

    recommendations.forEach(rec => {
      const existing = seen.get(rec.resourceId);
      if (!existing || rec.confidence > existing.confidence) {
        seen.set(rec.resourceId, rec);
      }
    });

    return Array.from(seen.values());
  }

  private static getJobTitleCore(jobTitle: string | null): string {
    if (!jobTitle) return '';
    
    // Extract core job function, removing levels like "Senior", "Junior", "Lead"
    const cleanTitle = jobTitle
      .toLowerCase()
      .replace(/\b(senior|junior|lead|principal|staff|associate)\b/g, '')
      .trim();
    
    return cleanTitle;
  }
}
