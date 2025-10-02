import React from 'react';

interface ProgressDonutProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressDonut({ value, max, size = 'md', showLabel = true, className = '' }: ProgressDonutProps) {
  const percentage = Math.round((value / max) * 100) || 0;
  
  const sizes = {
    sm: { container: 40, stroke: 4, text: 'text-xs' },
    md: { container: 56, stroke: 5, text: 'text-sm' },
    lg: { container: 80, stroke: 6, text: 'text-base' }
  };
  
  const config = sizes[size];
  const radius = (config.container - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 80) return 'var(--success)';
    if (percentage >= 50) return 'var(--warning)';
    return 'var(--muted)';
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg width={config.container} height={config.container} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={config.container / 2}
          cy={config.container / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={config.stroke}
        />
        {/* Progress circle */}
        <circle
          cx={config.container / 2}
          cy={config.container / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 300ms ease' }}
        />
      </svg>
      {showLabel && (
        <div className={`absolute ${config.text}`} style={{ fontWeight: 'var(--font-weight-semibold)' }}>
          {percentage}%
        </div>
      )}
    </div>
  );
}
