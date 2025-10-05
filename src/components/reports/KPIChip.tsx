import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPIChipProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  active?: boolean;
  onClick?: () => void;
}

export function KPIChip({ label, value, trend, trendValue, active, onClick }: KPIChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1 p-4 rounded-xl border transition-all ${
        onClick ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
      } ${
        active
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-background hover:border-primary/50'
      }`}
    >
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {trend && trendValue && (
          <div className="flex items-center gap-0.5">
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-danger" />
            )}
            <span className={`text-xs ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
