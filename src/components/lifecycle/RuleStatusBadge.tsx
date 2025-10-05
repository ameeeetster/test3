import React from 'react';
import { Badge } from '../ui/badge';
import { FileText, TestTube, CircleCheck as CheckCircle2 } from 'lucide-react';

interface RuleStatusBadgeProps {
  status: 'draft' | 'test' | 'published';
  className?: string;
}

export function RuleStatusBadge({ status, className }: RuleStatusBadgeProps) {
  if (status === 'draft') {
    return (
      <Badge variant="secondary" className={`gap-1.5 ${className}`}>
        <FileText className="w-3 h-3" />
        Draft
      </Badge>
    );
  }

  if (status === 'test') {
    return (
      <Badge variant="secondary" className={`gap-1.5 ${className}`}>
        <TestTube className="w-3 h-3" />
        Testing
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={`gap-1.5 ${className}`}>
      <CheckCircle2 className="w-3 h-3" />
      Published
    </Badge>
  );
}
