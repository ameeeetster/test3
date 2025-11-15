import React from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-lg border',
        'p-10',
        className,
      )}
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="mb-4 opacity-70">{icon}</div>
      <h3
        className="mb-2"
        style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
      >
        {title}
      </h3>
      {description && (
        <p className="mb-6" style={{ color: 'var(--muted-foreground)', maxWidth: 520 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}


