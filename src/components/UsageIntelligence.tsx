import React from 'react';
import { Users, Clock, HelpCircle, TrendingUp } from 'lucide-react';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface UsageIntelligenceProps {
  peerCoverage?: number;
  lastUsed?: string;
  usageData?: number[]; // 30 days of usage data for sparkline
}

export const UsageIntelligence = React.memo(function UsageIntelligence({ peerCoverage, lastUsed, usageData }: UsageIntelligenceProps) {
  // Simple sparkline SVG - memoized for performance
  const sparkline = React.useMemo(() => {
    if (!usageData || usageData.length === 0) return null;
    
    const max = Math.max(...usageData, 1);
    const points = usageData.map((value, index) => {
      const x = (index / (usageData.length - 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        viewBox="0 0 100 24"
        className="w-20 h-6"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }, [usageData]);

  return (
    <div className="space-y-4">
      {/* Peer Coverage */}
      {peerCoverage !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                Peer Coverage
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex" aria-label="What is peer coverage?">
                      <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Percentage of peers in the same department who have similar access
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--primary)'
            }}>
              {peerCoverage}%
            </span>
          </div>
          <Progress
            value={peerCoverage}
            className="h-2"
            style={{
              backgroundColor: 'var(--accent)'
            }}
          />
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted-foreground)'
          }}>
            {peerCoverage >= 80 ? 'High alignment with peer group' : peerCoverage >= 50 ? 'Moderate peer alignment' : 'Low peer alignment'}
          </p>
        </div>
      )}

      {/* Last Used */}
      {lastUsed && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
              Last Used
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex" aria-label="How is last used calculated?">
                    <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Based on authentication logs and system access records
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-3">
            {sparkline}
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text)'
            }}>
              {lastUsed}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});