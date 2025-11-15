import { supabase } from '../../lib/supabase';

// Types
export interface RiskScore {
  score: number; // 0-100
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: string[];
  calculatedAt: Date;
  recommendations?: string[];
}

export interface RiskFactor {
  name: string;
  points: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface UserRiskData {
  id: string;
  adminRoles: number;
  hasPrivilegedAccess: boolean;
  sodViolations: number;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  department?: string;
  jobTitle?: string;
  totalRoles: number;
  totalEntitlements: number;
}

interface RequestRiskData {
  id: string;
  resourceType: string;
  resourceName: string;
  requesterRiskScore?: number;
  submittedAt: Date;
  priority?: string;
  sodConflictsCount: number;
  businessJustification?: string;
  forUserId?: string;
}

/**
 * AI-Powered Risk Scoring Service
 * Uses intelligent rule-based algorithms to calculate risk scores
 */
export class RiskScoringService {
  
  /**
   * Calculate comprehensive risk score for a user
   * Analyzes multiple risk factors including roles, access, behavior, and compliance
   */
  static async calculateUserRiskScore(userId: string): Promise<RiskScore> {
    try {
      // Fetch user data with related information
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          department,
          job_title,
          last_login_at,
          failed_login_attempts,
          role_assignments!inner(
            role:roles(
              id,
              name,
              is_admin
            ),
            expires_at
          )
        `)
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('Error fetching user for risk scoring:', error);
        return this.getDefaultRiskScore();
      }

      // Get SoD violations count
      const { count: sodCount } = await supabase
        .from('policy_violations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('violation_type', 'sod');

      // Get access requests history
      const { data: requests } = await supabase
        .from('access_requests')
        .select('id, status, created_at')
        .or(`requester_id.eq.${userId},for_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(100);

      // Build risk data
      const riskData: UserRiskData = {
        id: userId,
        adminRoles: user.role_assignments?.filter((ra: any) => 
          ra.role?.is_admin && (!ra.expires_at || new Date(ra.expires_at) > new Date())
        ).length || 0,
        hasPrivilegedAccess: user.role_assignments?.some((ra: any) => 
          ra.role?.name?.toLowerCase().includes('admin') || 
          ra.role?.name?.toLowerCase().includes('privileged')
        ) || false,
        sodViolations: sodCount || 0,
        lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : null,
        failedLoginAttempts: user.failed_login_attempts || 0,
        department: user.department,
        jobTitle: user.job_title,
        totalRoles: user.role_assignments?.length || 0,
        totalEntitlements: 0 // TODO: Add when entitlements table is ready
      };

      return this.computeUserRiskScore(riskData);
    } catch (error) {
      console.error('Error in calculateUserRiskScore:', error);
      return this.getDefaultRiskScore();
    }
  }

  /**
   * Calculate risk score for an access request
   * Evaluates the risk of granting the requested access
   */
  static async calculateRequestRiskScore(requestId: string): Promise<RiskScore> {
    try {
      // Fetch request data
      const { data: request, error } = await supabase
        .from('access_requests')
        .select(`
          id,
          resource_type,
          resource_name,
          requester_id,
          for_user_id,
          submitted_at,
          priority,
          sod_conflicts_count,
          business_justification
        `)
        .eq('id', requestId)
        .single();

      if (error || !request) {
        console.error('Error fetching request for risk scoring:', error);
        return this.getDefaultRiskScore();
      }

      // Get requester's risk score
      let requesterRiskScore = 0;
      if (request.requester_id) {
        const requesterRisk = await this.calculateUserRiskScore(request.requester_id);
        requesterRiskScore = requesterRisk.score;
      }

      const requestData: RequestRiskData = {
        id: request.id,
        resourceType: request.resource_type,
        resourceName: request.resource_name,
        requesterRiskScore,
        submittedAt: new Date(request.submitted_at),
        priority: request.priority,
        sodConflictsCount: request.sod_conflicts_count || 0,
        businessJustification: request.business_justification,
        forUserId: request.for_user_id
      };

      return this.computeRequestRiskScore(requestData);
    } catch (error) {
      console.error('Error in calculateRequestRiskScore:', error);
      return this.getDefaultRiskScore();
    }
  }

  /**
   * Core risk computation logic for users
   */
  private static computeUserRiskScore(data: UserRiskData): RiskScore {
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // FACTOR 1: Admin Roles (0-30 points)
    if (data.adminRoles > 0) {
      const points = Math.min(data.adminRoles * 10, 30);
      score += points;
      factors.push(`${data.adminRoles} admin role${data.adminRoles > 1 ? 's' : ''} (+${points} points)`);
      
      if (data.adminRoles >= 3) {
        recommendations.push('Review necessity of multiple admin roles');
      }
    }

    // FACTOR 2: Privileged Access (0-25 points)
    if (data.hasPrivilegedAccess) {
      const points = 25;
      score += points;
      factors.push(`Has privileged system access (+${points} points)`);
      recommendations.push('Ensure privileged access is regularly reviewed');
    }

    // FACTOR 3: SoD Violations (0-20 points)
    if (data.sodViolations > 0) {
      const points = Math.min(data.sodViolations * 10, 20);
      score += points;
      factors.push(`${data.sodViolations} SoD violation${data.sodViolations > 1 ? 's' : ''} (+${points} points)`);
      recommendations.push('Remediate segregation of duties conflicts immediately');
    }

    // FACTOR 4: Account Dormancy (0-15 points)
    const daysSinceLogin = this.daysSince(data.lastLoginAt);
    if (daysSinceLogin > 90) {
      const points = 15;
      score += points;
      factors.push(`Inactive for ${daysSinceLogin} days (+${points} points)`);
      recommendations.push('Review account - consider disabling dormant access');
    } else if (daysSinceLogin > 60) {
      const points = 8;
      score += points;
      factors.push(`Low activity - ${daysSinceLogin} days since last login (+${points} points)`);
    }

    // FACTOR 5: Failed Login Attempts (0-10 points)
    if (data.failedLoginAttempts > 0) {
      const points = Math.min(data.failedLoginAttempts * 2, 10);
      score += points;
      factors.push(`${data.failedLoginAttempts} failed login attempt${data.failedLoginAttempts > 1 ? 's' : ''} (+${points} points)`);
      
      if (data.failedLoginAttempts >= 5) {
        recommendations.push('Investigate potential account compromise');
      }
    }

    // FACTOR 6: Role Accumulation (0-10 points)
    if (data.totalRoles > 5) {
      const points = Math.min((data.totalRoles - 5) * 2, 10);
      score += points;
      factors.push(`${data.totalRoles} total roles - potential over-provisioning (+${points} points)`);
      recommendations.push('Review all role assignments for least privilege');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine risk level
    const level = this.getRiskLevel(score);

    // Add default recommendation if none exist
    if (recommendations.length === 0 && score > 25) {
      recommendations.push('Continue monitoring user activity');
    }

    return {
      score: Math.round(score),
      level,
      factors,
      calculatedAt: new Date(),
      recommendations
    };
  }

  /**
   * Core risk computation logic for access requests
   */
  private static computeRequestRiskScore(data: RequestRiskData): RiskScore {
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // FACTOR 1: Resource Type Risk (0-30 points)
    const resourceRiskMap: Record<string, { points: number; description: string }> = {
      'admin_role': { points: 30, description: 'Administrative role with elevated privileges' },
      'privileged_account': { points: 28, description: 'Privileged system account' },
      'financial_system': { points: 25, description: 'Access to financial systems' },
      'production_system': { points: 22, description: 'Production environment access' },
      'database_admin': { points: 26, description: 'Database administrative access' },
      'security_system': { points: 24, description: 'Security system access' },
      'hr_system': { points: 20, description: 'HR system with PII data' },
      'standard_application': { points: 8, description: 'Standard business application' },
      'read_only': { points: 5, description: 'Read-only access' }
    };

    const resourceRisk = resourceRiskMap[data.resourceType] || 
                         resourceRiskMap['standard_application'];
    score += resourceRisk.points;
    factors.push(`${resourceRisk.description} (+${resourceRisk.points} points)`);

    // FACTOR 2: Requester Risk Score (0-30 points)
    if (data.requesterRiskScore) {
      const points = Math.round(data.requesterRiskScore * 0.3);
      score += points;
      factors.push(`Requester risk score: ${data.requesterRiskScore}/100 (+${points} points)`);
      
      if (data.requesterRiskScore >= 75) {
        recommendations.push('High-risk user requesting access - require additional approval');
      }
    }

    // FACTOR 3: Off-Hours Request (0-15 points)
    const requestHour = data.submittedAt.getHours();
    const requestDay = data.submittedAt.getDay();
    
    // Weekend request
    if (requestDay === 0 || requestDay === 6) {
      const points = 12;
      score += points;
      factors.push(`Weekend request (+${points} points)`);
      recommendations.push('Verify legitimacy of weekend access request');
    }
    // Off-hours weekday (before 6 AM or after 10 PM)
    else if (requestHour < 6 || requestHour > 22) {
      const points = 10;
      score += points;
      factors.push(`Off-hours request (${requestHour}:00) (+${points} points)`);
    }

    // FACTOR 4: SoD Conflicts (0-20 points)
    if (data.sodConflictsCount > 0) {
      const points = Math.min(data.sodConflictsCount * 10, 20);
      score += points;
      factors.push(`${data.sodConflictsCount} SoD conflict${data.sodConflictsCount > 1 ? 's' : ''} detected (+${points} points)`);
      recommendations.push('CRITICAL: Granting this access creates segregation of duties violations');
    }

    // FACTOR 5: Priority/Urgency (0-5 points)
    if (data.priority === 'High' || data.priority === 'Critical') {
      const points = 5;
      score += points;
      factors.push(`High priority request (+${points} points)`);
      recommendations.push('Expedited request - verify urgency is justified');
    }

    // FACTOR 6: Lack of Business Justification (0-10 points)
    if (!data.businessJustification || data.businessJustification.length < 20) {
      const points = 10;
      score += points;
      factors.push(`Insufficient business justification (+${points} points)`);
      recommendations.push('Request additional business justification from requester');
    }

    // Cap at 100
    score = Math.min(score, 100);

    // Determine risk level
    const level = this.getRiskLevel(score);

    // Add approval recommendations based on risk
    if (score >= 75) {
      recommendations.push('Require executive or security team approval');
    } else if (score >= 50) {
      recommendations.push('Require manager + secondary approver');
    }

    return {
      score: Math.round(score),
      level,
      factors,
      calculatedAt: new Date(),
      recommendations
    };
  }

  /**
   * Batch calculate risk scores for multiple users
   */
  static async calculateBatchUserRiskScores(userIds: string[]): Promise<Map<string, RiskScore>> {
    const results = new Map<string, RiskScore>();
    
    // Process in parallel but limit concurrency
    const batchSize = 10;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const promises = batch.map(id => this.calculateUserRiskScore(id));
      const scores = await Promise.all(promises);
      
      batch.forEach((id, index) => {
        results.set(id, scores[index]);
      });
    }
    
    return results;
  }

  /**
   * Get risk trend for a user over time
   */
  static async getUserRiskTrend(userId: string, days: number = 30): Promise<Array<{ date: Date; score: number }>> {
    // TODO: Implement historical risk tracking
    // For now, return current risk score
    const currentRisk = await this.calculateUserRiskScore(userId);
    return [
      {
        date: new Date(),
        score: currentRisk.score
      }
    ];
  }

  /**
   * Get organization-wide risk statistics
   */
  static async getOrganizationRiskStats(orgId: string): Promise<{
    averageRisk: number;
    highRiskCount: number;
    criticalRiskCount: number;
    totalUsers: number;
    riskDistribution: Record<string, number>;
  }> {
    // Fetch all users in organization
    const { data: users, error } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', orgId);

    if (error || !users) {
      return {
        averageRisk: 0,
        highRiskCount: 0,
        criticalRiskCount: 0,
        totalUsers: 0,
        riskDistribution: { Low: 0, Medium: 0, High: 0, Critical: 0 }
      };
    }

    // Calculate risk scores
    const userIds = users.map(u => u.id);
    const riskScores = await this.calculateBatchUserRiskScores(userIds);

    // Compute statistics
    let totalScore = 0;
    let highRiskCount = 0;
    let criticalRiskCount = 0;
    const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };

    riskScores.forEach(risk => {
      totalScore += risk.score;
      riskDistribution[risk.level]++;
      
      if (risk.level === 'High') highRiskCount++;
      if (risk.level === 'Critical') criticalRiskCount++;
    });

    return {
      averageRisk: Math.round(totalScore / riskScores.size),
      highRiskCount,
      criticalRiskCount,
      totalUsers: users.length,
      riskDistribution
    };
  }

  // Helper methods
  private static daysSince(date: Date | null): number {
    if (!date) return 999;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private static getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 25) return 'Medium';
    return 'Low';
  }

  private static getDefaultRiskScore(): RiskScore {
    return {
      score: 0,
      level: 'Low',
      factors: ['Unable to calculate risk score'],
      calculatedAt: new Date(),
      recommendations: []
    };
  }
}
