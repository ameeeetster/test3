import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export interface AIInsight {
  id: string;
  type: 'unused-access' | 'sod-conflict' | 'dormant-account' | 'over-privileged' | 'anomaly';
  title: string;
  description: string;
  count?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AIInsightCardProps {
  insight: AIInsight;
  onReview: (id: string) => void;
  onApply?: (id: string) => void;
}

export function AIInsightCard({ insight, onReview, onApply }: AIInsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'unused-access':
        return Clock;
      case 'sod-conflict':
        return AlertCircle;
      case 'dormant-account':
        return Clock;
      case 'over-privileged':
        return Shield;
      case 'anomaly':
        return TrendingUp;
      default:
        return AlertCircle;
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'var(--danger-bg)',
          borderColor: 'var(--danger-border)',
          color: 'var(--danger)'
        };
      case 'high':
        return {
          bgColor: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)',
          color: 'var(--warning)'
        };
      case 'medium':
        return {
          bgColor: 'var(--info-bg)',
          borderColor: 'var(--info-border)',
          color: 'var(--info)'
        };
      case 'low':
        return {
          bgColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          color: 'var(--success)'
        };
      default:
        return {
          bgColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--muted-foreground)'
        };
    }
  };

  const Icon = getIcon();
  const severityConfig = getSeverityConfig(insight.severity);

  return (
    <div 
      className="rounded-lg border p-4 transition-all duration-150 hover:shadow-sm"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="p-2 rounded-md"
          style={{
            backgroundColor: severityConfig.bgColor,
            color: severityConfig.color
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}
            >
              {insight.title}
            </h4>
            {insight.count && (
              <Badge
                variant="outline"
                style={{
                  backgroundColor: severityConfig.bgColor,
                  borderColor: severityConfig.borderColor,
                  color: severityConfig.color,
                  fontSize: 'var(--text-xs)'
                }}
              >
                {insight.count}
              </Badge>
            )}
          </div>
          <p 
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              lineHeight: 'var(--line-height-normal)'
            }}
          >
            {insight.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReview(insight.id)}
          className="flex-1"
        >
          Review
        </Button>
        {onApply && (
          <Button
            size="sm"
            onClick={() => onApply(insight.id)}
            className="flex-1"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            Apply Fix
          </Button>
        )}
      </div>
    </div>
  );
}