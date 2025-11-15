/**
 * AI-Powered Recommendation Engine
 * 
 * Generates intelligent access recommendations using peer group analysis,
 * role-based patterns, and historical data. No ML models required - uses
 * collaborative filtering and statistical analysis.
 * 
 * Recommendation Types:
 * - peer_based: Based on similar users (same dept/role)
 * - role_based: Based on role requirements
 * - historical: Based on user's past access patterns
 * - risk_optimized: Lowest risk option for required access
 * - compliance: To meet compliance requirements
 */

import { supabase } from '../../lib/supabase';

export type RecommendationType = 
  | 'peer_based'
  | 'role_based'
  | 'historical'
  | 'risk_optimized'
  | 'compliance'
  | 'birthright';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Recommendation {
  id?: string;
  type: RecommendationType;
  userId?: string;
  resourceType: 'role' | 'entitlement' | 'application' | 'permission';
  resourceId: string;
  resourceName: string;
  title: string;
  description: string;
  reason: string;
  confidence: number; // 0-1, how confident we are
  priority: RecommendationPriority;
  estimatedRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  supportingData?: {
    peerCount?: number;
    peerPercentage?: number;
    historicalUsage?: number;
    complianceRequirement?: string;
    riskFactors?: string[];
  };
  actionable: boolean;
  autoApprovable?: boolean; // Can this be auto-approved?
  createdAt: Date;
}

export interface PeerGroup {
  users: string[];
  commonAttributes: {
    department?: string;
    jobTitle?: string;
    location?: string;
    seniorityLevel?: string;
  };
  averageAccess: Array<{
    resourceId: string;
    resourceName: string;
    percentage: number;
  }>;
}

export class RecommendationEngine {
  
  /**
   * Get comprehensive access recommendations for a user
   * Returns recommendations from all analysis methods
   */
  static async getAccessRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Get user details
      const { data: user } = await supabase
        .from('users')
        .select(`
          *,
          role_assignments(
            role:roles(id, name)
          )
        `)
        .eq('id', userId)
        .single();

      if (!user) return recommendations;

      // Run all recommendation engines in parallel
      const [
        peerRecommendations,
        roleRecommendations,
        birthrightRecommendations,
        complianceRecommendations
      ] = await Promise.all([
        this.getPeerBasedRecommendations(userId, user),
        this.getRoleBasedRecommendations(userId, user),
        this.getBirthrightRecommendations(userId, user),
        this.getComplianceRecommendations(userId, user)
      ]);

      recommendations.push(
        ...peerRecommendations,
        ...roleRecommendations,
        ...birthrightRecommendations,
        ...complianceRecommendations
      );

      // Remove duplicates and sort by priority and confidence
      const uniqueRecommendations = this.deduplicateRecommendations(recommendations);
      return this.sortRecommendations(uniqueRecommendations);

    } catch (error) {
      console.error('Error getting access recommendations:', error);
      return [];
    }
  }

  /**
   * Peer-based recommendations using collaborative filtering
   * "Users similar to you have these permissions"
   */
  static async getPeerBasedRecommendations(
    userId: string, 
    user: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Find peer group (same department and similar role)
      const { data: peers } = await supabase
        .from('users')
        .select(`
          id,
          role_assignments(
            role:roles(id, name)
          )
        `)
        .eq('department', user.department)
        .eq('job_title', user.job_title)
        .neq('id', userId)
        .limit(50); // Limit to 50 peers for performance

      if (!peers || peers.length < 3) {
        // Need at least 3 peers for meaningful recommendations
        return recommendations;
      }

      // Get all role assignments from peers
      const peerRoleIds = new Map<string, { name: string; count: number }>();
      
      peers.forEach(peer => {
        peer.role_assignments?.forEach((ra: any) => {
          const roleId = ra.role.id;
          const current = peerRoleIds.get(roleId) || { name: ra.role.name, count: 0 };
          peerRoleIds.set(roleId, { name: current.name, count: current.count + 1 });
        });
      });

      // Get user's current roles
      const userRoleIds = new Set(
        user.role_assignments?.map((ra: any) => ra.role.id) || []
      );

      // Calculate recommendation threshold (60% of peers have it)
      const threshold = peers.length * 0.6;

      // Generate recommendations for roles user doesn't have
      peerRoleIds.forEach((roleData, roleId) => {
        if (!userRoleIds.has(roleId) && roleData.count >= threshold) {
          const percentage = (roleData.count / peers.length) * 100;
          const confidence = percentage / 100;

          recommendations.push({
            type: 'peer_based',
            userId,
            resourceType: 'role',
            resourceId: roleId,
            resourceName: roleData.name,
            title: `Recommended Role: ${roleData.name}`,
            description: `Based on peer analysis, this role is commonly assigned to similar users`,
            reason: `${Math.round(percentage)}% of peers in ${user.department} with title "${user.job_title}" have this role`,
            confidence,
            priority: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
            estimatedRisk: this.estimateRoleRisk(roleData.name),
            supportingData: {
              peerCount: roleData.count,
              peerPercentage: percentage
            },
            actionable: true,
            autoApprovable: percentage >= 90 && this.estimateRoleRisk(roleData.name) === 'Low',
            createdAt: new Date()
          });
        }
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting peer-based recommendations:', error);
      return [];
    }
  }

  /**
   * Role-based recommendations
   * "Your role typically requires these permissions"
   */
  static async getRoleBasedRecommendations(
    userId: string,
    user: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Get user's current roles
      const userRoles = user.role_assignments?.map((ra: any) => ra.role) || [];

      if (userRoles.length === 0) return recommendations;

      // For each role, check what permissions it should have
      for (const role of userRoles) {
        const { data: rolePermissions } = await supabase
          .from('role_permissions')
          .select(`
            permission:permissions(id, name, description)
          `)
          .eq('role_id', role.id);

        if (!rolePermissions) continue;

        // Get user's actual permissions
        const { data: userPermissions } = await supabase
          .from('role_assignments')
          .select(`
            role:roles(
              role_permissions(
                permission:permissions(id)
              )
            )
          `)
          .eq('user_id', userId);

        const userPermissionIds = new Set(
          userPermissions?.flatMap((ra: any) => 
            ra.role?.role_permissions?.map((rp: any) => rp.permission.id) || []
          ) || []
        );

        // Recommend missing permissions from assigned roles
        rolePermissions.forEach((rp: any) => {
          const perm = rp.permission;
          if (!userPermissionIds.has(perm.id)) {
            recommendations.push({
              type: 'role_based',
              userId,
              resourceType: 'permission',
              resourceId: perm.id,
              resourceName: perm.name,
              title: `Required Permission: ${perm.name}`,
              description: perm.description || 'Permission required for your assigned role',
              reason: `This permission is part of your "${role.name}" role but not currently active`,
              confidence: 0.95, // Very high confidence - it's part of assigned role
              priority: 'high',
              estimatedRisk: this.estimatePermissionRisk(perm.name),
              supportingData: {
                complianceRequirement: `Required by role: ${role.name}`
              },
              actionable: true,
              autoApprovable: true, // Should be auto-approved since role is assigned
              createdAt: new Date()
            });
          }
        });
      }

      return recommendations;

    } catch (error) {
      console.error('Error getting role-based recommendations:', error);
      return [];
    }
  }

  /**
   * Birthright access recommendations
   * "All employees in your department automatically get these"
   */
  static async getBirthrightRecommendations(
    userId: string,
    user: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Define birthright access rules (would be configurable in production)
      const birthrightRules = [
        {
          condition: (u: any) => u.department === 'Engineering',
          recommendations: [
            { name: 'GitHub Access', type: 'application' as const, confidence: 1.0 },
            { name: 'Jira Access', type: 'application' as const, confidence: 1.0 },
            { name: 'Confluence Access', type: 'application' as const, confidence: 1.0 }
          ]
        },
        {
          condition: (u: any) => u.department === 'Finance',
          recommendations: [
            { name: 'NetSuite Read Access', type: 'application' as const, confidence: 1.0 },
            { name: 'Expensify', type: 'application' as const, confidence: 1.0 }
          ]
        },
        {
          condition: (u: any) => u.department === 'Sales',
          recommendations: [
            { name: 'Salesforce', type: 'application' as const, confidence: 1.0 },
            { name: 'LinkedIn Sales Navigator', type: 'application' as const, confidence: 1.0 }
          ]
        },
        {
          condition: (u: any) => true, // All employees
          recommendations: [
            { name: 'Office 365', type: 'application' as const, confidence: 1.0 },
            { name: 'Slack', type: 'application' as const, confidence: 1.0 },
            { name: 'Google Workspace', type: 'application' as const, confidence: 1.0 }
          ]
        }
      ];

      // Check which birthright rules apply
      birthrightRules.forEach(rule => {
        if (rule.condition(user)) {
          rule.recommendations.forEach(rec => {
            recommendations.push({
              type: 'birthright',
              userId,
              resourceType: rec.type,
              resourceId: `birthright-${rec.name.toLowerCase().replace(/\s+/g, '-')}`,
              resourceName: rec.name,
              title: `Birthright Access: ${rec.name}`,
              description: `Standard access for all ${user.department || 'company'} employees`,
              reason: `Automatic provisioning for ${user.department || 'all'} department`,
              confidence: rec.confidence,
              priority: 'medium',
              estimatedRisk: 'Low',
              supportingData: {
                complianceRequirement: 'Birthright access policy'
              },
              actionable: true,
              autoApprovable: true, // Birthright access is auto-approved
              createdAt: new Date()
            });
          });
        }
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting birthright recommendations:', error);
      return [];
    }
  }

  /**
   * Compliance-based recommendations
   * "You need these to meet compliance requirements"
   */
  static async getComplianceRecommendations(
    userId: string,
    user: any
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Define compliance rules (would come from compliance policies table)
      const complianceRules = [
        {
          name: 'SOX Compliance - Segregation of Duties',
          condition: (u: any) => u.department === 'Finance',
          check: async (u: any) => {
            // Check if user has both AP and AR access (SoD violation)
            const { data: roles } = await supabase
              .from('role_assignments')
              .select('role:roles(name)')
              .eq('user_id', u.id);

            const roleNames = roles?.map((r: any) => r.role.name) || [];
            const hasAP = roleNames.some(n => n.includes('Accounts Payable'));
            const hasAR = roleNames.some(n => n.includes('Accounts Receivable'));

            if (hasAP && hasAR) {
              return {
                violation: true,
                recommendation: 'Remove either AP or AR access to maintain SOX compliance'
              };
            }
            return { violation: false };
          }
        },
        {
          name: 'Access Review Compliance',
          condition: (u: any) => true, // All users
          check: async (u: any) => {
            // Check if user's access was reviewed in last 90 days
            const { data: lastReview } = await supabase
              .from('review_items')
              .select('reviewed_at')
              .eq('user_id', u.id)
              .order('reviewed_at', { ascending: false })
              .limit(1)
              .single();

            if (!lastReview) {
              return {
                violation: true,
                recommendation: 'Access review required (no review in last 90 days)'
              };
            }

            const daysSinceReview = Math.floor(
              (Date.now() - new Date(lastReview.reviewed_at).getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceReview > 90) {
              return {
                violation: true,
                recommendation: `Access review overdue (last review: ${daysSinceReview} days ago)`
              };
            }

            return { violation: false };
          }
        }
      ];

      // Check compliance rules
      for (const rule of complianceRules) {
        if (rule.condition(user)) {
          const result = await rule.check(user);
          if (result.violation) {
            recommendations.push({
              type: 'compliance',
              userId,
              resourceType: 'permission',
              resourceId: `compliance-${rule.name.toLowerCase().replace(/\s+/g, '-')}`,
              resourceName: rule.name,
              title: `Compliance Action Required: ${rule.name}`,
              description: result.recommendation || 'Compliance action needed',
              reason: `Required to maintain ${rule.name}`,
              confidence: 1.0,
              priority: 'critical',
              estimatedRisk: 'High',
              supportingData: {
                complianceRequirement: rule.name
              },
              actionable: true,
              autoApprovable: false, // Compliance issues need manual review
              createdAt: new Date()
            });
          }
        }
      }

      return recommendations;

    } catch (error) {
      console.error('Error getting compliance recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations for approval decisions
   * "Similar requests were approved/rejected because..."
   */
  static async getApprovalRecommendations(requestId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Get request details
      const { data: request } = await supabase
        .from('access_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (!request) return recommendations;

      // Find similar historical requests
      const { data: similarRequests } = await supabase
        .from('access_requests')
        .select('status, business_justification')
        .eq('resource_type', request.resource_type)
        .in('status', ['APPROVED', 'REJECTED'])
        .limit(100);

      if (!similarRequests || similarRequests.length === 0) return recommendations;

      // Calculate approval rate
      const approvedCount = similarRequests.filter(r => r.status === 'APPROVED').length;
      const approvalRate = approvedCount / similarRequests.length;

      // Generate recommendation
      const suggestedAction = approvalRate >= 0.7 ? 'APPROVE' : 
                             approvalRate <= 0.3 ? 'REJECT' : 
                             'REVIEW';

      recommendations.push({
        type: 'historical',
        resourceType: 'permission',
        resourceId: requestId,
        resourceName: request.resource_name,
        title: `Approval Recommendation: ${suggestedAction}`,
        description: `Based on ${similarRequests.length} similar requests`,
        reason: `${Math.round(approvalRate * 100)}% of similar requests for "${request.resource_type}" were approved`,
        confidence: Math.abs(approvalRate - 0.5) * 2, // 0-1 scale, higher when clear pattern
        priority: approvalRate >= 0.7 || approvalRate <= 0.3 ? 'high' : 'medium',
        estimatedRisk: request.risk_level || 'Medium',
        supportingData: {
          historicalUsage: similarRequests.length,
          peerPercentage: approvalRate * 100
        },
        actionable: true,
        autoApprovable: approvalRate >= 0.95 && request.risk_level === 'Low',
        createdAt: new Date()
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting approval recommendations:', error);
      return [];
    }
  }

  /**
   * Bulk recommendations for onboarding
   * "New hire package for this role"
   */
  static async getOnboardingRecommendations(
    userId: string,
    department: string,
    jobTitle: string
  ): Promise<Recommendation[]> {
    try {
      // Create temporary user object
      const tempUser = { id: userId, department, job_title: jobTitle };

      // Get all recommendation types
      const [peerRecs, birthrightRecs] = await Promise.all([
        this.getPeerBasedRecommendations(userId, tempUser),
        this.getBirthrightRecommendations(userId, tempUser)
      ]);

      const allRecommendations = [...peerRecs, ...birthrightRecs];

      // Filter to high-confidence, low-risk recommendations for auto-provisioning
      const onboardingPackage = allRecommendations.filter(
        rec => rec.confidence >= 0.8 && 
               (rec.estimatedRisk === 'Low' || rec.estimatedRisk === 'Medium')
      );

      return this.sortRecommendations(onboardingPackage);

    } catch (error) {
      console.error('Error getting onboarding recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations for access optimization
   * "You haven't used these permissions in 90 days - consider removing"
   */
  static async getOptimizationRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      // Get user's current access
      const { data: userAccess } = await supabase
        .from('role_assignments')
        .select(`
          assigned_at,
          role:roles(id, name)
        `)
        .eq('user_id', userId);

      if (!userAccess) return recommendations;

      // Check usage in last 90 days (would need audit logs)
      const { data: recentActivity } = await supabase
        .from('audit_logs')
        .select('action, metadata')
        .eq('user_id', userId)
        .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Find unused roles (roles not used in activity logs)
      userAccess.forEach((access: any) => {
        const roleUsed = recentActivity?.some(
          activity => activity.metadata?.role_id === access.role.id
        );

        if (!roleUsed) {
          recommendations.push({
            type: 'risk_optimized',
            userId,
            resourceType: 'role',
            resourceId: access.role.id,
            resourceName: access.role.name,
            title: `Optimization: Remove Unused Access`,
            description: `Role "${access.role.name}" has not been used in 90 days`,
            reason: 'Reducing unused access improves security posture and reduces risk',
            confidence: 0.8,
            priority: 'low',
            estimatedRisk: 'Low', // Removing unused access is low risk
            supportingData: {
              historicalUsage: 0,
              riskFactors: ['Unused for 90+ days', 'Potential over-provisioning']
            },
            actionable: true,
            autoApprovable: false, // Manual review recommended
            createdAt: new Date()
          });
        }
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      return [];
    }
  }

  // Helper Methods

  private static deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Map<string, Recommendation>();
    
    recommendations.forEach(rec => {
      const key = `${rec.resourceType}-${rec.resourceId}`;
      const existing = seen.get(key);
      
      // Keep recommendation with higher confidence
      if (!existing || rec.confidence > existing.confidence) {
        seen.set(key, rec);
      }
    });

    return Array.from(seen.values());
  }

  private static sortRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return recommendations.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by confidence
      return b.confidence - a.confidence;
    });
  }

  private static estimateRoleRisk(roleName: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    const lowerName = roleName.toLowerCase();
    
    if (lowerName.includes('admin') || lowerName.includes('superuser') || lowerName.includes('root')) {
      return 'Critical';
    }
    if (lowerName.includes('manager') || lowerName.includes('supervisor') || lowerName.includes('lead')) {
      return 'High';
    }
    if (lowerName.includes('developer') || lowerName.includes('analyst')) {
      return 'Medium';
    }
    return 'Low';
  }

  private static estimatePermissionRisk(permissionName: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    const lowerName = permissionName.toLowerCase();
    
    if (lowerName.includes('delete') || lowerName.includes('admin') || lowerName.includes('security')) {
      return 'High';
    }
    if (lowerName.includes('edit') || lowerName.includes('modify') || lowerName.includes('update')) {
      return 'Medium';
    }
    return 'Low';
  }
}
