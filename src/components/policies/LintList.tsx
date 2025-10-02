import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';

interface LintResult {
  roleName: string;
  status: 'pass' | 'warn' | 'fail';
  issues: string[];
}

interface LintListProps {
  results: LintResult[];
  onViewRole?: (roleName: string) => void;
}

export function LintList({ results, onViewRole }: LintListProps) {
  const statusConfig = {
    pass: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10', label: 'Pass' },
    warn: { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', label: 'Warning' },
    fail: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Fail' }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-muted-foreground">Pass</span>
          </div>
          <div className="text-2xl font-semibold">{passCount}</div>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-medium text-muted-foreground">Warning</span>
          </div>
          <div className="text-2xl font-semibold">{warnCount}</div>
        </div>
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-muted-foreground">Fail</span>
          </div>
          <div className="text-2xl font-semibold">{failCount}</div>
        </div>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => {
          const config = statusConfig[result.status];
          const Icon = config.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <div className={`p-2 rounded ${config.bg} flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium">{result.roleName}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {config.label}
                  </Badge>
                </div>
                {result.issues.length > 0 && (
                  <ul className="space-y-1">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {onViewRole && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewRole(result.roleName)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
