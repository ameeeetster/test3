import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-[12px] text-muted-foreground', className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={`${item.label}-${i}`} className="flex items-center">
            <a
              href={item.href || '#'}
              aria-current={isLast ? 'page' : undefined}
              className={cn(
                'hover:text-foreground transition-colors',
                isLast && 'text-foreground font-medium cursor-default pointer-events-none',
              )}
            >
              {item.label}
            </a>
            {!isLast && <ChevronRight className="w-3.5 h-3.5 mx-2 opacity-60" />}
          </div>
        );
      })}
    </nav>
  );
}


