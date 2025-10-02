import React from 'react';

interface Tab {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedTabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedTabs({ tabs, value, onChange, className = '' }: SegmentedTabsProps) {
  return (
    <div 
      className={`inline-flex items-center gap-1 p-1 rounded-lg ${className}`}
      style={{ 
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)'
      }}
    >
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className="px-4 py-1.5 rounded-md transition-all duration-150 flex items-center gap-2"
            style={{
              backgroundColor: isActive ? 'var(--bg)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--muted-foreground)',
              fontWeight: isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
              fontSize: 'var(--text-sm)',
              boxShadow: isActive ? 'var(--shadow-xs)' : 'none'
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span 
                className="px-1.5 py-0.5 rounded text-[11px]"
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--surface)',
                  color: isActive ? 'white' : 'var(--muted-foreground)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}