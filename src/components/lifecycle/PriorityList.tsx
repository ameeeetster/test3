import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { GripVertical, ChevronUp, ChevronDown, Eye } from 'lucide-react';

export interface LifecycleRule {
  id: string;
  name: string;
  description: string;
  priority: number;
  status: 'draft' | 'test' | 'published';
  conditions: number;
  actions: number;
  lastExecuted?: string;
  executionCount?: number;
  successRate?: number;
  avgExecutionTime?: string;
  requiresApproval?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface PriorityListProps {
  rules: LifecycleRule[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onView: (ruleId: string) => void;
}

export function PriorityList({ rules, onReorder, onView }: PriorityListProps) {
  const moveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < rules.length - 1) {
      onReorder(index, index + 1);
    }
  };

  const statusConfig = {
    draft: { variant: 'secondary' as const, label: 'Draft' },
    test: { variant: 'secondary' as const, label: 'Testing' },
    published: { variant: 'default' as const, label: 'Published' }
  };

  return (
    <div className="space-y-2">
      {rules.map((rule, index) => {
        const config = statusConfig[rule.status];
        return (
          <div
            key={rule.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors group"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-0.5 hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === rules.length - 1}
                className="p-0.5 hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="w-8 h-8 rounded flex items-center justify-center bg-accent font-medium text-sm flex-shrink-0">
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium truncate">{rule.name}</h4>
                <Badge variant={config.variant} className="text-xs flex-shrink-0">
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{rule.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {rule.conditions} condition{rule.conditions !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {rule.actions} action{rule.actions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(rule.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        );
      })}

      {rules.length === 0 && (
        <div className="p-8 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">No rules configured</p>
        </div>
      )}
    </div>
  );
}
