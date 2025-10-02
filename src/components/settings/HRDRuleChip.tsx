import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, ArrowRight } from 'lucide-react';

interface HRDRuleChipProps {
  pattern: string;
  provider: string;
  onRemove: () => void;
}

export function HRDRuleChip({ pattern, provider, onRemove }: HRDRuleChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-accent/50 text-sm">
      <code className="font-mono text-xs">{pattern}</code>
      <ArrowRight className="w-3 h-3 text-muted-foreground" />
      <span className="font-medium">{provider}</span>
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 rounded hover:bg-background transition-colors"
        aria-label="Remove rule"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}
