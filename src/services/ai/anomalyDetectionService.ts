import { supabase } from '../../lib/supabase';

// Types
export interface Anomaly {
  id?: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  userId?: string;
  metadata?: Record<string, any>;
  reviewed?: boolean;
  falsePositive?: boolean;
}

export type AnomalyType =
  | 'impossible_travel'
  | 'unusual_time'
  | 'new_location'
  | 'excessive_requests'
  | 'failed_logins'
  | 'unusual_permissions'
  | 'rapid_permission_changes'
  | 'dormant_reactivation'
  | 'concurrent_sessions'
  | 'suspicious_pattern';

interface LoginActivity {
  id: string;
  userId: string;
  timestamp: Date;
  location?: {
    city?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

interface UserBehaviorProfile {
  userId: string;
  typicalLoginHours: number[]; // Array of hours (0-23)
  typicalLoginDays: number[]; // Array of days (0-6)
  commonLocations: string[];
  averageRequestsPerWeek: number;
  lastActivityDate: Date;
}

/**
 * AI-Powered Anomaly Detection Service
 * Uses intelligent pattern recognition to detect suspicious activities
 */
export class AnomalyDetectionService {
  
  /**
   * Detect all anomalies for a specific user
   */
  static async detectUserAnomalies(userId: string): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    try {
      // Run all detection checks in parallel
      const [
        impossibleTravel,
        unusualTime,
        newLocation,
        excessiveRequests,
        failedLogins,
        rapidChanges,
        dormantReactivation,
        concurrentSessions
      ] = await Promise.all([
        this.checkImpossibleTravel(userId),
        this.checkUnusualLoginTime(userId),
        this.checkNewLocation(userId),
        this.checkExcessiveRequests(userId),
        this.checkFailedLogins(userId),
        this.checkRapidPermissionChanges(userId),
        this.checkDormantReactivation(userId),
        this.checkConcurrentSessions(userId)
      ]);

      // Collect all detected anomalies
      if (impossibleTravel) anomalies.push(impossibleTravel);
      if (unusualTime) anomalies.push(unusualTime);
      if (newLocation) anomalies.push(newLocation);
      if (excessiveRequests) anomalies.push(excessiveRequests);
      if (failedLogins) anomalies.push(failedLogins);
      if (rapidChanges) anomalies.push(rapidChanges);
      if (dormantReactivation) anomalies.push(dormantReactivation);
      if (concurrentSessions) anomalies.push(concurrentSessions);

      // Store anomalies in database for tracking
      if (anomalies.length > 0) {
        await this.storeAnomalies(userId, anomalies);
      }

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  }

  /**
   * Detect anomalies across entire organization
   */
  static async detectOrganizationAnomalies(orgId: string): Promise<Map<string, Anomaly[]>> {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', orgId);

    if (!users) return new Map();

    const results = new Map<string, Anomaly[]>();
    
    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const promises = batch.map(user => this.detectUserAnomalies(user.id));
      const anomalyArrays = await Promise.all(promises);
      
      batch.forEach((user, index) => {
        if (anomalyArrays[index].length > 0) {
          results.set(user.id, anomalyArrays[index]);
        }
      });
    }

    return results;
  }

  /**
   * Check for impossible travel (login from distant locations in short time)
   */
  private static async checkImpossibleTravel(userId: string): Promise<Anomaly | null> {
    // Get recent login attempts from audit logs
    const { data: logins } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('action', 'login')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('timestamp', { ascending: false })
      .limit(10);

    if (!logins || logins.length < 2) return null;

    // Check consecutive logins for impossible travel
    for (let i = 1; i < logins.length; i++) {
      const prev = logins[i - 1];
      const curr = logins[i];

      const prevLocation = prev.metadata?.location;
      const currLocation = curr.metadata?.location;

      if (!prevLocation || !currLocation) continue;

      // Calculate distance if we have coordinates
      if (prevLocation.lat && currLocation.lat) {
        const distance = this.calculateDistance(
          prevLocation.lat,
          prevLocation.lon,
          currLocation.lat,
          currLocation.lon
        );

        const timeDiff = (new Date(prev.timestamp).getTime() - 
                         new Date(curr.timestamp).getTime()) / (1000 * 60 * 60); // hours

        // If traveled >500 miles in <4 hours (human travel impossible)
        if (distance > 500 && timeDiff < 4 && timeDiff > 0) {
          return {
            type: 'impossible_travel',
            severity: 'high',
            title: 'Impossible Travel Detected',
            description: `User logged in from ${prevLocation.city || 'Unknown'}, ${prevLocation.country || 'Unknown'} and ${currLocation.city || 'Unknown'}, ${currLocation.country || 'Unknown'} (${Math.round(distance)} miles apart) within ${Math.round(timeDiff * 60)} minutes`,
            detectedAt: new Date(),
            userId,
            metadata: {
              distance,
              timeDiff,
              locations: [prevLocation, currLocation],
              timestamps: [prev.timestamp, curr.timestamp]
            }
          };
        }
      }
    }

    return null;
  }

  /**
   * Check for unusual login times based on user's historical pattern
   */
  private static async checkUnusualLoginTime(userId: string): Promise<Anomaly | null> {
    // Get recent logins (last 7 days)
    const { data: recentLogins } = await supabase
      .from('audit_logs')
      .select('timestamp, metadata')
      .eq('user_id', userId)
      .eq('action', 'login')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (!recentLogins || recentLogins.length === 0) return null;

    // Count off-hours logins (before 6 AM or after 10 PM)
    const offHoursLogins = recentLogins.filter(login => {
      const hour = new Date(login.timestamp).getHours();
      return hour < 6 || hour > 22;
    });

    // If 3+ off-hours logins in a week
    if (offHoursLogins.length >= 3) {
      const hours = offHoursLogins.map(l => 
        new Date(l.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      );

      return {
        type: 'unusual_time',
        severity: 'medium',
        title: 'Unusual Login Times Detected',
        description: `${offHoursLogins.length} logins detected during off-hours (outside 6 AM - 10 PM) in the past 7 days. Times: ${hours.slice(0, 3).join(', ')}`,
        detectedAt: new Date(),
        userId,
        metadata: {
          offHoursCount: offHoursLogins.length,
          times: hours
        }
      };
    }

    return null;
  }

  /**
   * Check for logins from new/unusual locations
   */
  private static async checkNewLocation(userId: string): Promise<Anomaly | null> {
    // Get historical locations (last 90 days)
    const { data: historicalLogins } = await supabase
      .from('audit_logs')
      .select('metadata')
      .eq('user_id', userId)
      .eq('action', 'login')
      .gte('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .not('metadata->location', 'is', null);

    // Get today's logins
    const { data: todayLogins } = await supabase
      .from('audit_logs')
      .select('timestamp, metadata')
      .eq('user_id', userId)
      .eq('action', 'login')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('metadata->location', 'is', null);

    if (!historicalLogins || !todayLogins || todayLogins.length === 0) return null;

    // Build set of known countries
    const knownCountries = new Set(
      historicalLogins
        .map(l => l.metadata?.location?.country)
        .filter(Boolean)
    );

    // Check if today's login is from new country
    const newCountryLogin = todayLogins.find(login => {
      const country = login.metadata?.location?.country;
      return country && !knownCountries.has(country);
    });

    if (newCountryLogin) {
      const location = newCountryLogin.metadata.location;
      return {
        type: 'new_location',
        severity: 'medium',
        title: 'Login from New Location',
        description: `User logged in from ${location.city || 'Unknown'}, ${location.country || 'Unknown'} - a location not seen in the past 90 days`,
        detectedAt: new Date(),
        userId,
        metadata: {
          newLocation: location,
          timestamp: newCountryLogin.timestamp
        }
      };
    }

    return null;
  }

  /**
   * Check for excessive access requests
   */
  private static async checkExcessiveRequests(userId: string): Promise<Anomaly | null> {
    // Get requests from last 7 days
    const { data: recentRequests } = await supabase
      .from('access_requests')
      .select('id, submitted_at, resource_name')
      .or(`requester_id.eq.${userId},for_user_id.eq.${userId}`)
      .gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!recentRequests) return null;

    // Normal baseline: 1-3 requests per week
    const requestCount = recentRequests.length;
    
    if (requestCount > 10) {
      return {
        type: 'excessive_requests',
        severity: requestCount > 20 ? 'high' : 'medium',
        title: 'Unusual Request Volume',
        description: `${requestCount} access requests submitted in the past 7 days (typical range: 1-3 per week)`,
        detectedAt: new Date(),
        userId,
        metadata: {
          requestCount,
          threshold: 10,
          recentRequests: recentRequests.slice(0, 5).map(r => r.resource_name)
        }
      };
    }

    return null;
  }

  /**
   * Check for excessive failed login attempts
   */
  private static async checkFailedLogins(userId: string): Promise<Anomaly | null> {
    // Get failed logins from last 24 hours
    const { data: failedLogins } = await supabase
      .from('audit_logs')
      .select('timestamp, metadata')
      .eq('user_id', userId)
      .eq('action', 'login_failed')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (!failedLogins || failedLogins.length < 5) return null;

    return {
      type: 'failed_logins',
      severity: failedLogins.length > 10 ? 'high' : 'medium',
      title: 'Multiple Failed Login Attempts',
      description: `${failedLogins.length} failed login attempts detected in the past 24 hours. Possible credential stuffing or brute force attack.`,
      detectedAt: new Date(),
      userId,
      metadata: {
        failedCount: failedLogins.length,
        ipAddresses: [...new Set(failedLogins.map(l => l.metadata?.ipAddress).filter(Boolean))],
        timeRange: '24 hours'
      }
    };
  }

  /**
   * Check for rapid permission/role changes
   */
  private static async checkRapidPermissionChanges(userId: string): Promise<Anomaly | null> {
    // Get role assignments from last 24 hours
    const { data: recentChanges } = await supabase
      .from('audit_logs')
      .select('timestamp, action, metadata')
      .eq('user_id', userId)
      .in('action', ['role_assigned', 'role_removed', 'permission_granted', 'permission_revoked'])
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!recentChanges || recentChanges.length < 5) return null;

    return {
      type: 'rapid_permission_changes',
      severity: 'high',
      title: 'Rapid Permission Changes Detected',
      description: `${recentChanges.length} permission or role changes in the past 24 hours. This may indicate unauthorized access or compromised credentials.`,
      detectedAt: new Date(),
      userId,
      metadata: {
        changeCount: recentChanges.length,
        changes: recentChanges.map(c => ({ action: c.action, timestamp: c.timestamp }))
      }
    };
  }

  /**
   * Check for dormant account suddenly becoming active
   */
  private static async checkDormantReactivation(userId: string): Promise<Anomaly | null> {
    const { data: user } = await supabase
      .from('users')
      .select('last_login_at')
      .eq('id', userId)
      .single();

    if (!user || !user.last_login_at) return null;

    const daysSinceLastLogin = Math.floor(
      (Date.now() - new Date(user.last_login_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // If account was dormant >90 days and just logged in today
    if (daysSinceLastLogin > 90) {
      const { data: todayLogin } = await supabase
        .from('audit_logs')
        .select('timestamp')
        .eq('user_id', userId)
        .eq('action', 'login')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (todayLogin) {
        return {
          type: 'dormant_reactivation',
          severity: 'medium',
          title: 'Dormant Account Reactivated',
          description: `Account was inactive for ${daysSinceLastLogin} days and suddenly became active. Verify this is legitimate activity.`,
          detectedAt: new Date(),
          userId,
          metadata: {
            daysDormant: daysSinceLastLogin,
            reactivationTime: todayLogin.timestamp
          }
        };
      }
    }

    return null;
  }

  /**
   * Check for concurrent sessions from different locations
   */
  private static async checkConcurrentSessions(userId: string): Promise<Anomaly | null> {
    // Get active sessions in last hour
    const { data: recentLogins } = await supabase
      .from('audit_logs')
      .select('timestamp, metadata')
      .eq('user_id', userId)
      .eq('action', 'login')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(5);

    if (!recentLogins || recentLogins.length < 2) return null;

    // Check if logins are from different countries within 15 minutes
    const locations = new Set<string>();
    let hasConcurrentSessions = false;

    for (let i = 1; i < recentLogins.length; i++) {
      const prev = recentLogins[i - 1];
      const curr = recentLogins[i];
      
      const prevCountry = prev.metadata?.location?.country;
      const currCountry = curr.metadata?.location?.country;
      
      if (prevCountry && currCountry && prevCountry !== currCountry) {
        const timeDiff = (new Date(prev.timestamp).getTime() - 
                         new Date(curr.timestamp).getTime()) / (1000 * 60); // minutes
        
        if (timeDiff < 15) {
          hasConcurrentSessions = true;
          locations.add(prevCountry);
          locations.add(currCountry);
        }
      }
    }

    if (hasConcurrentSessions) {
      return {
        type: 'concurrent_sessions',
        severity: 'high',
        title: 'Concurrent Sessions from Different Locations',
        description: `User has active sessions from multiple countries: ${Array.from(locations).join(', ')}. Possible account sharing or compromise.`,
        detectedAt: new Date(),
        userId,
        metadata: {
          locations: Array.from(locations),
          sessionCount: recentLogins.length
        }
      };
    }

    return null;
  }

  /**
   * Store detected anomalies in database
   */
  private static async storeAnomalies(userId: string, anomalies: Anomaly[]): Promise<void> {
    const records = anomalies.map(anomaly => ({
      user_id: userId,
      anomaly_type: anomaly.type,
      severity: anomaly.severity,
      title: anomaly.title,
      description: anomaly.description,
      metadata: anomaly.metadata,
      detected_at: anomaly.detectedAt.toISOString(),
      reviewed: false,
      false_positive: false
    }));

    await supabase
      .from('anomalies')
      .insert(records);
  }

  /**
   * Mark anomaly as reviewed
   */
  static async markAsReviewed(anomalyId: string, isFalsePositive: boolean = false): Promise<void> {
    await supabase
      .from('anomalies')
      .update({ 
        reviewed: true, 
        false_positive: isFalsePositive,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', anomalyId);
  }

  /**
   * Get unreviewed anomalies for organization
   */
  static async getUnreviewedAnomalies(orgId: string, limit: number = 50): Promise<Anomaly[]> {
    const { data } = await supabase
      .from('anomalies')
      .select(`
        *,
        user:users!inner(organization_id)
      `)
      .eq('user.organization_id', orgId)
      .eq('reviewed', false)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data.map(record => ({
      id: record.id,
      type: record.anomaly_type,
      severity: record.severity,
      title: record.title,
      description: record.description,
      detectedAt: new Date(record.detected_at),
      userId: record.user_id,
      metadata: record.metadata,
      reviewed: record.reviewed,
      falsePositive: record.false_positive
    }));
  }

  // Helper: Calculate distance between two coordinates (Haversine formula)
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
