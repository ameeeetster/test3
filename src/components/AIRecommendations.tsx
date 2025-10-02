import React, { useState } from 'react';
import { TrendingUp, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  type: 'scope' | 'duration' | 'alternative';
}

interface AIRecommendationsProps {
  recommendations: Recommendation[];
  onApply: (recommendationId: string) => void;
  appliedIds?: string[];
}

export const AIRecommendations = React.memo(function AIRecommendations({ recommendations, onApply, appliedIds = [] }: AIRecommendationsProps) {
  const [applied, setApplied] = useState<Set<string>>(new Set(appliedIds));

  const handleToggle = (id: string, checked: boolean) => {
    const newApplied = new Set(applied);
    if (checked) {
      newApplied.add(id);
      onApply(id);
    } else {
      newApplied.delete(id);
    }
    setApplied(newApplied);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'var(--success)';
    if (confidence >= 70) return 'var(--primary)';
    return 'var(--warning)';
  };

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const isApplied = applied.has(rec.id);
        return (
          <div
            key={rec.id}
            className="p-3 rounded-md transition-all duration-150"
            style={{
              backgroundColor: isApplied ? 'var(--success-bg)' : 'var(--bg)',
              border: `1px solid ${isApplied ? 'var(--success-border)' : 'var(--border)'}`
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}>
                    {rec.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 h-5 gap-1"
                    style={{
                      borderColor: getConfidenceColor(rec.confidence),
                      color: getConfidenceColor(rec.confidence),
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {rec.confidence}%
                  </Badge>
                </div>
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--line-height-relaxed)'
                }}>
                  {rec.description}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isApplied && (
                  <Check className="w-4 h-4" style={{ color: 'var(--success)' }} />
                )}
                <Switch
                  checked={isApplied}
                  onCheckedChange={(checked) => handleToggle(rec.id, checked)}
                  aria-label={`Apply recommendation: ${rec.title}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});