import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface AISuggestion {
  type: 'insight' | 'recommendation' | 'alert' | 'approval';
  title: string;
  description: string;
  action?: string;
}

interface AIPanelProps {
  suggestions: AISuggestion[];
}

export function AIPanel({ suggestions }: AIPanelProps) {
  const getIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'insight':
        return TrendingUp;
      case 'recommendation':
        return Sparkles;
      case 'alert':
        return AlertCircle;
      case 'approval':
        return CheckCircle2;
    }
  };

  const getIconColor = (type: AISuggestion['type']) => {
    switch (type) {
      case 'insight':
        return 'var(--info)';
      case 'recommendation':
        return 'var(--primary)';
      case 'alert':
        return 'var(--danger)';
      case 'approval':
        return 'var(--success)';
    }
  };

  const getSeverity = (type: AISuggestion['type']) => {
    switch (type) {
      case 'alert':
        return 'Critical';
      case 'recommendation':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  // Group suggestions by severity
  const criticalSuggestions = suggestions.filter(s => s.type === 'alert');
  const warningSuggestions = suggestions.filter(s => s.type === 'recommendation');
  const tipsSuggestions = suggestions.filter(s => s.type === 'insight' || s.type === 'approval');

  return (
    <Card className="p-5 h-full flex flex-col" style={{ 
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
          }}>
            <Sparkles className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ 
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
              letterSpacing: '-0.01em'
            }}>
              AI Insights
            </h3>
          </div>
        </div>
      </div>

      {/* Quick action */}
      {(criticalSuggestions.length > 0 || warningSuggestions.length > 0) && (
        <Button 
          variant="outline" 
          size="sm"
          className="w-full mb-4 h-8 text-xs font-semibold"
          style={{ 
            borderColor: 'var(--primary)',
            color: 'var(--primary)'
          }}
        >
          Apply all safe fixes
        </Button>
      )}

      <div className="flex-1 overflow-auto space-y-4">
        {/* Critical Section */}
        {criticalSuggestions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Critical
            </h4>
            <div className="space-y-2">
              {criticalSuggestions.map((suggestion, index) => {
                const Icon = getIcon(suggestion.type);
                return (
                  <div 
                    key={`critical-${index}`}
                    className="group p-3 rounded-lg transition-all duration-150 cursor-pointer"
                    style={{ 
                      backgroundColor: 'var(--danger-bg-subtle)',
                      border: '1px solid var(--danger-border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--danger-bg-subtle)';
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <h5 style={{ 
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text)',
                          marginBottom: '2px',
                          lineHeight: 'var(--line-height-snug)'
                        }}>
                          {suggestion.title}
                        </h5>
                        <p style={{ 
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                          lineHeight: 'var(--line-height-normal)',
                          marginBottom: suggestion.action ? '6px' : '0'
                        }}>
                          {suggestion.description}
                        </p>
                        {suggestion.action && (
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="h-auto p-0 hover:underline text-xs"
                            style={{ color: 'var(--danger)', fontWeight: 'var(--font-weight-medium)' }}
                          >
                            {suggestion.action} →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning Section */}
        {warningSuggestions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Recommendations
            </h4>
            <div className="space-y-2">
              {warningSuggestions.map((suggestion, index) => {
                const Icon = getIcon(suggestion.type);
                return (
                  <div 
                    key={`warning-${index}`}
                    className="group p-3 rounded-lg transition-all duration-150 cursor-pointer"
                    style={{ 
                      backgroundColor: 'var(--accent)',
                      border: '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)';
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <h5 style={{ 
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text)',
                          marginBottom: '2px',
                          lineHeight: 'var(--line-height-snug)'
                        }}>
                          {suggestion.title}
                        </h5>
                        <p style={{ 
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                          lineHeight: 'var(--line-height-normal)',
                          marginBottom: suggestion.action ? '6px' : '0'
                        }}>
                          {suggestion.description}
                        </p>
                        {suggestion.action && (
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="h-auto p-0 hover:underline text-xs"
                            style={{ color: 'var(--primary)', fontWeight: 'var(--font-weight-medium)' }}
                          >
                            {suggestion.action} →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips Section */}
        {tipsSuggestions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Tips
            </h4>
            <div className="space-y-2">
              {tipsSuggestions.map((suggestion, index) => {
                const Icon = getIcon(suggestion.type);
                return (
                  <div 
                    key={`tips-${index}`}
                    className="group p-3 rounded-lg transition-all duration-150 cursor-pointer"
                    style={{ 
                      backgroundColor: 'var(--accent)',
                      border: '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)';
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: getIconColor(suggestion.type) }} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <h5 style={{ 
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text)',
                          marginBottom: '2px',
                          lineHeight: 'var(--line-height-snug)'
                        }}>
                          {suggestion.title}
                        </h5>
                        <p style={{ 
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                          lineHeight: 'var(--line-height-normal)'
                        }}>
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full h-8 text-xs font-medium justify-center"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Why flagged? Learn more →
        </Button>
      </div>
    </Card>
  );
}