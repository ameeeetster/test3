import React from 'react';
import { CheckCircle2, XCircle, Circle, PauseCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface StatusChipProps {
  status: 'Active' | 'Inactive' | 'Disabled' | 'Pending';
  size?: 'sm' | 'md';
}

export const StatusChip = React.memo(function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          icon: CheckCircle2,
          color: 'var(--success)',
          bgColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          label: 'Active'
        };
      case 'inactive':
        return {
          icon: Circle,
          color: 'var(--muted-foreground)',
          bgColor: 'var(--surface)',
          borderColor: 'var(--border)',
          label: 'Inactive'
        };
      case 'disabled':
        return {
          icon: XCircle,
          color: 'var(--danger)',
          bgColor: 'var(--danger-bg)',
          borderColor: 'var(--danger-border)',
          label: 'Disabled'
        };
      case 'pending':
        return {
          icon: PauseCircle,
          color: 'var(--warning)',
          bgColor: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)',
          label: 'Pending'
        };
      default:
        return {
          icon: Circle,
          color: 'var(--muted-foreground)',
          bgColor: 'var(--surface)',
          borderColor: 'var(--border)',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const fontSize = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)';

  return (
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
});