import React from 'react';
import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150 group"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text)'
      }}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 rounded hover:bg-border/50 transition-colors p-0.5"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
      </button>
    </div>
  );
}