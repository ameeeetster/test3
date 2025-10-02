import React from 'react';

interface SpecItem {
  label: string;
  value: string | React.ReactNode;
}

interface SpecGridProps {
  items: SpecItem[];
  columns?: 1 | 2;
}

export function SpecGrid({ items, columns = 2 }: SpecGridProps) {
  return (
    <div 
      className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
    >
      {items.map((item, index) => (
        <div key={index}>
          <div 
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '6px',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            {item.label}
          </div>
          <div 
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text)',
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}