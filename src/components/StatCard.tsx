import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './ui/card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'flat';
  sparklineData?: number[];
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  iconColor,
  trend,
  sparklineData 
}: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'var(--success)';
      case 'negative':
        return 'var(--danger)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <span style={{ fontSize: '10px' }}>▲</span>;
      case 'down':
        return <span style={{ fontSize: '10px' }}>▼</span>;
      case 'flat':
        return <span style={{ fontSize: '10px' }}>−</span>;
    }
  };

  // Transform sparkline data for chart - use useMemo to prevent re-computation
  const chartData = React.useMemo(() => 
    sparklineData?.map((value, index) => ({ value, index })) || [], 
    [sparklineData]
  );

  return (
    <Card 
      className="group p-5 transition-all duration-150 cursor-pointer"
      style={{ 
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header: Title + Icon */}
      <div className="flex items-start justify-between mb-3">
        <p style={{ 
          fontSize: 'var(--text-sm)',
          color: 'var(--muted-foreground)',
          fontWeight: 'var(--font-weight-medium)',
          letterSpacing: '-0.005em'
        }}>
          {title}
        </p>
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: iconColor ? `${iconColor}10` : 'color-mix(in srgb, var(--primary) 8%, transparent)',
            opacity: 0.8
          }}
        >
          <Icon 
            className="w-[18px] h-[18px]" 
            style={{ color: iconColor || 'var(--primary)' }}
            strokeWidth={2}
          />
        </div>
      </div>
      
      {/* Value */}
      <h3 
        className="tracking-tight"
        style={{ 
          fontSize: '32px',
          lineHeight: '1.2',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text)',
          marginBottom: '8px'
        }}
      >
        {value}
      </h3>
      
      {/* Delta chip */}
      {change && (
        <div className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 mb-3" style={{ 
          fontSize: '11px',
          color: getChangeColor(),
          backgroundColor: changeType === 'positive' 
            ? 'var(--success-bg)' 
            : changeType === 'negative' 
            ? 'var(--danger-bg)' 
            : 'var(--accent)',
          fontWeight: 'var(--font-weight-semibold)'
        }}>
          {getTrendIcon()}
          <span>{change}</span>
        </div>
      )}
      
      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ height: '32px', marginTop: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={iconColor || 'var(--primary)'} 
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}