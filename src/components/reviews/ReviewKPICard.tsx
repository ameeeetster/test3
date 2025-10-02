import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ReviewKPICardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    trend: 'up' | 'down';
  };
  sparkline?: number[];
  variant?: 'default' | 'warning' | 'danger' | 'success';
  onClick?: () => void;
}

export function ReviewKPICard({ title, value, delta, sparkline, variant = 'default', onClick }: ReviewKPICardProps) {
  const variantStyles = {
    default: 'border-border',
    warning: 'border-warning/20 bg-warning/5',
    danger: 'border-danger/20 bg-danger/5',
    success: 'border-success/20 bg-success/5',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border bg-white dark:bg-slate-900 p-5 transition-all text-left w-full ${
        onClick ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50' : 'hover:shadow-sm'
      } ${variantStyles[variant]}`}
      style={{ borderColor: variant === 'default' ? 'var(--border)' : undefined }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{title}</p>
          <p className="text-3xl" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            {value}
          </p>
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              {delta.trend === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-danger" />
              )}
              <span className={`text-xs ${delta.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                {Math.abs(delta.value)}%
              </span>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <div className="ml-4">
            <MiniSparkline data={sparkline} variant={variant} />
          </div>
        )}
      </div>
    </button>
  );
}

function MiniSparkline({ data, variant }: { data: number[]; variant: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 24 - ((value - min) / range) * 24;
    return `${x},${y}`;
  }).join(' ');

  const color = {
    default: 'var(--primary)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    success: 'var(--success)',
  }[variant];

  return (
    <svg width="60" height="24" className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
