import React from 'react';
import { cn } from './ui/utils';

interface StickySubheaderProps {
  children: React.ReactNode;
  className?: string;
}

export function StickySubheader({ children, className }: StickySubheaderProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-20',
        'backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--surface)_80%,transparent)]',
        'border-b',
        className,
      )}
      style={{
        borderColor: 'var(--border)',
      }}
    >
      <div className="px-0 py-3">{children}</div>
    </div>
  );
}


