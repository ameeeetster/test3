import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface AISuggestionCardProps {
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  reasoning?: string;
  onApply?: () => void;
  applied?: boolean;
}

export function AISuggestionCard({
  title,
  description,
  confidence,
  impact,
  reasoning,
  onApply,
  applied = false
}: AISuggestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getImpactColor = () => {
    switch (impact) {
      case 'high': return 'var(--primary)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--muted-foreground)';
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 80) return 'var(--success)';
    if (confidence >= 60) return 'var(--warning)';
    return 'var(--muted-foreground)';
  };

  return (
    <div 
      className="p-4 rounded-lg border transition-all"
      style={{
        borderColor: applied ? 'var(--success)' : 'var(--border)',
        backgroundColor: applied ? 'var(--success-bg)' : 'var(--surface)'
      }}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
          }}
        >
          {applied ? (
            <Check className="w-5 h-5" style={{ color: 'white' }} />
          ) : (
            <Sparkles className="w-5 h-5" style={{ color: 'white' }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h4 style={{
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}>
                {title}
              </h4>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}>
                {description}
              </p>
            </div>

            {!applied && onApply && (
              <Button onClick={onApply} size="sm">
                Apply
              </Button>
            )}
            {applied && (
              <Badge variant="outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                Applied
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                Confidence
              </span>
              <div className="flex items-center gap-1.5">
                <div 
                  className="h-1.5 rounded-full"
                  style={{
                    width: '60px',
                    backgroundColor: 'var(--border)'
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${confidence}%`,
                      backgroundColor: getConfidenceColor()
                    }}
                  />
                </div>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: getConfidenceColor()
                }}>
                  {confidence}%
                </span>
              </div>
            </div>

            <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />

            <div className="flex items-center gap-2">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                Impact
              </span>
              <Badge 
                variant="outline"
                style={{
                  borderColor: getImpactColor(),
                  color: getImpactColor()
                }}
              >
                {impact.charAt(0).toUpperCase() + impact.slice(1)}
              </Badge>
            </div>
          </div>

          {reasoning && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 h-auto p-0">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span style={{ fontSize: 'var(--text-sm)' }}>
                    {isOpen ? 'Hide' : 'Explain why'}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div 
                  className="p-3 rounded-md"
                  style={{
                    backgroundColor: 'var(--accent)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {reasoning}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
