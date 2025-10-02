import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export interface AISuggestion {
  id: string;
  title: string;
  rationale: string;
  confidence: number;
  impact?: string;
}

interface AIActionSuggestionProps {
  suggestion: AISuggestion;
  onApply: (id: string, applied: boolean) => void;
  isApplied?: boolean;
}

export function AIActionSuggestion({ suggestion, onApply, isApplied = false }: AIActionSuggestionProps) {
  const [applied, setApplied] = useState(isApplied);

  const handleToggle = (checked: boolean) => {
    setApplied(checked);
    onApply(suggestion.id, checked);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'var(--success)';
    if (confidence >= 75) return 'var(--info)';
    if (confidence >= 60) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div 
      className="rounded-lg border p-4 transition-all duration-150"
      style={{
        borderColor: applied ? 'var(--primary)' : 'var(--border)',
        backgroundColor: applied ? 'var(--info-bg)' : 'var(--surface)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-md mt-0.5"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '4px'
                }}
              >
                {suggestion.title}
              </h4>
              <p 
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted-foreground)',
                  lineHeight: 'var(--line-height-normal)'
                }}
              >
                {suggestion.rationale}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={applied}
                onCheckedChange={handleToggle}
                aria-label={`Apply suggestion: ${suggestion.title}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  Confidence
                </span>
                <span 
                  style={{ 
                    fontSize: 'var(--text-xs)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    color: getConfidenceColor(suggestion.confidence)
                  }}
                >
                  {suggestion.confidence}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${suggestion.confidence}%`,
                    backgroundColor: getConfidenceColor(suggestion.confidence)
                  }}
                />
              </div>
            </div>

            {applied && (
              <Badge
                className="gap-1.5"
                style={{
                  backgroundColor: 'var(--success-bg)',
                  borderColor: 'var(--success-border)',
                  color: 'var(--success)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Applied
              </Badge>
            )}
          </div>

          {suggestion.impact && applied && (
            <div 
              className="mt-3 pt-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                <strong style={{ color: 'var(--text)' }}>Impact:</strong> {suggestion.impact}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}