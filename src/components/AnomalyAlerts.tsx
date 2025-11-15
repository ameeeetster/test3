import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AnomalyDetectionService, 
  Anomaly 
} from '../services/ai/anomalyDetectionService';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Activity,
  Shield,
  X,
  Check
} from 'lucide-react';

interface AnomalyAlertsProps {
  userId?: string;
  organizationId?: string;
  limit?: number;
  onReview?: (anomalyId: string, isFalsePositive: boolean) => void;
}

/**
 * AI-Powered Anomaly Alerts Component
 * Displays detected security anomalies with review actions
 */
export function AnomalyAlerts({ 
  userId, 
  organizationId, 
  limit = 10,
  onReview 
}: AnomalyAlertsProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnomalies();
  }, [userId, organizationId]);

  const loadAnomalies = async () => {
    setLoading(true);
    try {
      let detectedAnomalies: Anomaly[];
      
      if (userId) {
        detectedAnomalies = await AnomalyDetectionService.detectUserAnomalies(userId);
      } else if (organizationId) {
        detectedAnomalies = await AnomalyDetectionService.getUnreviewedAnomalies(organizationId, limit);
      } else {
        return;
      }
      
      setAnomalies(detectedAnomalies.slice(0, limit));
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (anomalyId: string | undefined, isFalsePositive: boolean) => {
    if (!anomalyId) return;
    
    try {
      await AnomalyDetectionService.markAsReviewed(anomalyId, isFalsePositive);
      setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
      
      if (onReview) {
        onReview(anomalyId, isFalsePositive);
      }
    } catch (error) {
      console.error('Error reviewing anomaly:', error);
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'impossible_travel':
      case 'new_location':
      case 'concurrent_sessions':
        return MapPin;
      case 'unusual_time':
        return Clock;
      case 'excessive_requests':
      case 'rapid_permission_changes':
        return Activity;
      case 'failed_logins':
        return Shield;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'var(--danger-bg)',
          border: 'var(--danger-border)',
          text: 'var(--danger)'
        };
      case 'high':
        return {
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
          text: 'var(--warning)'
        };
      case 'medium':
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          text: '#F59E0B'
        };
      case 'low':
        return {
          bg: '#DBEAFE',
          border: '#60A5FA',
          text: '#2563EB'
        };
      default:
        return {
          bg: 'var(--muted)',
          border: 'var(--border)',
          text: 'var(--text)'
        };
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (anomalies.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <Shield className="w-12 h-12 text-green-500 mb-3" />
          <h3 className="font-semibold text-lg mb-1">No Anomalies Detected</h3>
          <p className="text-sm text-muted-foreground">
            All user activity appears normal
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Security Anomalies ({anomalies.length})</h3>
        <Button variant="outline" size="sm" onClick={loadAnomalies}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {anomalies.map((anomaly, index) => {
          const Icon = getAnomalyIcon(anomaly.type);
          const colors = getSeverityColor(anomaly.severity);

          return (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: colors.text }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{anomaly.title}</h4>
                        <Badge 
                          className="text-xs px-2 py-0"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {anomaly.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Detected {new Date(anomaly.detectedAt).toLocaleString()}
                        </span>
                        <span className="capitalize">
                          Type: {anomaly.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleReview(anomaly.id, false)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Confirm Threat
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => handleReview(anomaly.id, true)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    False Positive
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
