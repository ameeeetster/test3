import React from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterChipBarProps {
  filters: FilterChip[];
  onRemoveFilter: (id: string) => void;
  onClearAll: () => void;
  onSaveView?: () => void;
}

export function FilterChipBar({ filters, onRemoveFilter, onClearAll, onSaveView }: FilterChipBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-border mb-6">
      <div className="flex items-center gap-2 flex-wrap flex-1">
        <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
        {filters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="gap-2 pr-1 pl-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm">{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.id)}
              className="hover:bg-slate-300 dark:hover:bg-slate-600 rounded p-0.5 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {onSaveView && (
          <Button variant="ghost" size="sm" onClick={onSaveView}>
            <Save className="w-4 h-4 mr-2" />
            Save view
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          Clear all
        </Button>
      </div>
    </div>
  );
}