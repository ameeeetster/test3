import React from 'react';
import { Badge } from './ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

export type IntegrationStatus = 'connected' | 'warning' | 'disconnected' | 'syncing';

interface StatusBadgeProps {
  status: IntegrationStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, showIcon = true, size = 'md', className = '' }: StatusBadgeProps) {
  const config = {
    connected: {
      label: 'Connected',
      icon: CheckCircle2,
      bg: 'var(--success-bg)',
      border: 'var(--success-border)',
      text: 'var(--success)',
    },
    warning: {
      label: 'Warning',
      icon: AlertTriangle,
      bg: 'var(--warning-bg)',
      border: 'var(--warning-border)',
      text: 'var(--warning)',
    },
    disconnected: {
      label: 'Disconnected',
      icon: XCircle,
      bg: 'var(--danger-bg)',
      border: 'var(--danger-border)',
      text: 'var(--danger)',
    },
    syncing: {
      label: 'Syncing',
      icon: Loader2,
      bg: 'var(--info-bg)',
      border: 'var(--info-border)',
      text: 'var(--info)',
    },
  };

  const { label, icon: Icon, bg, border, text } = config[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 ${size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'} ${className}`}
      style={{
        backgroundColor: bg,
        borderColor: border,
        color: text,
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      {showIcon && (
        <Icon
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${status === 'syncing' ? 'animate-spin' : ''}`}
          style={{ color: text }}
        />
      )}
      <span>{label}</span>
    </Badge>
  );
}
