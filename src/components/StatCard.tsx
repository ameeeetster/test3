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
      className="group p-6 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
      style={{ 
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Enhanced Header: Title + Icon */}
      <div className="flex items-start justify-between mb-4">
        <p style={{ 
          fontSize: 'var(--text-sm)',
          color: 'var(--muted-foreground)',
          fontWeight: 'var(--font-weight-medium)',
          letterSpacing: '-0.005em',
          lineHeight: 'var(--line-height-snug)'
        }}>
          {title}
        </p>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
          style={{ 
            backgroundColor: iconColor ? `${iconColor}15` : 'color-mix(in srgb, var(--primary) 12%, transparent)',
            border: `1px solid ${iconColor ? `${iconColor}20` : 'color-mix(in srgb, var(--primary) 15%, transparent)'}`
          }}
        >
          <Icon 
            className="w-[20px] h-[20px]" 
            style={{ color: iconColor || 'var(--primary)' }}
            strokeWidth={2.5}
          />
        </div>
      </div>
      
      {/* Enhanced Value */}
      <h3 
        className="tracking-tight mb-3"
        style={{ 
          fontSize: '36px',
          lineHeight: '1.1',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--text)',
          background: 'linear-gradient(135deg, var(--text) 0%, var(--text-secondary) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {value}
      </h3>
      
      {/* Enhanced Delta chip */}
      {change && (
        <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 mb-4" style={{ 
          fontSize: '12px',
          color: getChangeColor(),
          backgroundColor: changeType === 'positive' 
            ? 'var(--success-bg)' 
            : changeType === 'negative' 
            ? 'var(--danger-bg)' 
            : 'var(--accent)',
          fontWeight: 'var(--font-weight-semibold)',
          border: `1px solid ${changeType === 'positive' 
            ? 'var(--success-border)' 
            : changeType === 'negative' 
            ? 'var(--danger-border)' 
            : 'var(--border)'}`
        }}>
          {getTrendIcon()}
          <span>{change}</span>
        </div>
      )}
      
      {/* Enhanced Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ height: '40px', marginTop: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={iconColor || 'var(--primary)'} 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                strokeDasharray="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}