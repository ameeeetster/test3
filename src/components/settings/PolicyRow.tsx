import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CreditCard as Edit, TriangleAlert as AlertTriangle } from 'lucide-react';

interface PolicyRowProps {
  label: string;
  value: string | React.ReactNode;
  description?: string;
  warning?: string;
  onEdit: () => void;
}

export function PolicyRow({ label, value, description, warning, onEdit }: PolicyRowProps) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors group">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium">{label}</h4>
          {warning && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              {warning}
            </Badge>
          )}
        </div>
        <div className="text-sm text-foreground font-medium mb-1">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="w-4 h-4" />
        <span className="sr-only">Edit {label}</span>
      </Button>
    </div>
  );
}
