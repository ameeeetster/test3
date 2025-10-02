import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface RiskChipProps {
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  size?: 'sm' | 'md';
  withTooltip?: boolean;
  tooltipContent?: string;
}

export const RiskChip = React.memo(function RiskChip({ 
  risk, 
  size = 'md', 
  withTooltip = false,
  tooltipContent 
}: RiskChipProps) {
  const getRiskConfig = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'var(--danger)',
          bgColor: 'var(--danger-bg)',
          borderColor: 'var(--danger-border)',
          label: 'Critical',
          tooltip: 'Critical risk: Requires immediate attention and approval'
        };
      case 'high':
        return {
          icon: AlertCircle,
          color: 'var(--warning)',
          bgColor: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)',
          label: 'High',
          tooltip: 'High risk: Elevated privileges or sensitive access'
        };
      case 'medium':
        return {
          icon: Info,
          color: 'var(--info)',
          bgColor: 'var(--info-bg)',
          borderColor: 'var(--info-border)',
          label: 'Medium',
          tooltip: 'Medium risk: Standard review required'
        };
      case 'low':
        return {
          icon: ShieldCheck,
          color: 'var(--success)',
          bgColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          label: 'Low',
          tooltip: 'Low risk: Standard user access'
        };
      default:
        return {
          icon: Info,
          color: 'var(--muted-foreground)',
          bgColor: 'var(--surface)',
          borderColor: 'var(--border)',
          label: risk,
          tooltip: 'Risk level unknown'
        };
    }
  };

  const config = getRiskConfig(risk);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const fontSize = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)';

  const badge = (
    <Badge
      variant="outline"
      className="gap-1.5 font-medium"
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        color: config.color,
        fontSize
      }}
    >
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </Badge>
  );

  if (withTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex">
              {badge}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltipContent || config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
});