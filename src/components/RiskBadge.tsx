import React, { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { RiskScoringService, RiskScore } from '../services/ai/riskScoringService';
import { AlertTriangle, Shield, Info } from 'lucide-react';

interface RiskBadgeProps {
  userId?: string;
  requestId?: string;
  score?: number;
  level?: 'Low' | 'Medium' | 'High' | 'Critical';
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * AI-Powered Risk Badge Component
 * Displays risk score with color coding and optional detailed breakdown
 */
export function RiskBadge({ 
  userId, 
  requestId, 
  score, 
  level, 
  showDetails = false,
  size = 'md'
}: RiskBadgeProps) {
  const [riskData, setRiskData] = useState<RiskScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If score and level are provided directly, use them
    if (score !== undefined && level) {
      setRiskData({
        score,
        level,
        factors: [],
        calculatedAt: new Date()
      });
      return;
    }

    // Otherwise, calculate risk score
    const calculateRisk = async () => {
      setLoading(true);
      try {
        let risk: RiskScore;
        if (userId) {
          risk = await RiskScoringService.calculateUserRiskScore(userId);
        } else if (requestId) {
          risk = await RiskScoringService.calculateRequestRiskScore(requestId);
        } else {
          return;
        }
        setRiskData(risk);
      } catch (error) {
        console.error('Error calculating risk score:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateRisk();
  }, [userId, requestId, score, level]);

  if (loading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Calculating...
      </Badge>
    );
  }

  if (!riskData) {
    return null;
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical':
        return {
          bg: 'var(--danger-bg)',
          border: 'var(--danger-border)',
          text: 'var(--danger)',
          icon: AlertTriangle
        };
      case 'High':
        return {
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
          text: 'var(--warning)',
          icon: AlertTriangle
        };
      case 'Medium':
        return {
          bg: '#FEF3C7',
          border: '#FCD34D',
          text: '#F59E0B',
          icon: Info
        };
      case 'Low':
        return {
          bg: 'var(--success-bg)',
          border: 'var(--success-border)',
          text: 'var(--success)',
          icon: Shield
        };
      default:
        return {
          bg: 'var(--muted)',
          border: 'var(--border)',
          text: 'var(--text)',
          icon: Info
        };
    }
  };

  const colors = getRiskColor(riskData.level);
  const Icon = colors.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  if (!showDetails) {
    return (
      <Badge 
        className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sizeClasses[size]}`}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`
        }}
      >
        <Icon className="w-3 h-3" />
        {riskData.level} Risk
        <span className="ml-1 opacity-75">({riskData.score})</span>
      </Badge>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: colors.text }} />
          <h4 className="font-semibold text-base">Risk Assessment</h4>
        </div>
        <Badge 
          className="px-3 py-1 font-bold text-base"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`
          }}
        >
          {riskData.score}/100
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Risk Level:</span>
          <span className="font-semibold" style={{ color: colors.text }}>
            {riskData.level}
          </span>
        </div>

        {riskData.factors.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Risk Factors:</span>
            <ul className="space-y-1 text-sm">
              {riskData.factors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {riskData.recommendations && riskData.recommendations.length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            <span className="text-sm font-medium text-muted-foreground">Recommendations:</span>
            <ul className="space-y-1 text-sm">
              {riskData.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2">
          Calculated {new Date(riskData.calculatedAt).toLocaleString()}
        </div>
      </div>
    </Card>
  );
}
