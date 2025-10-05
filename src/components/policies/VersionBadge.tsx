import React from 'react';
import { Badge } from '../ui/badge';
import { FileText, Eye, CircleCheck as CheckCircle2 } from 'lucide-react';

interface VersionBadgeProps {
  status: 'draft' | 'published';
  version?: string;
  className?: string;
}

export function VersionBadge({ status, version, className }: VersionBadgeProps) {
  if (status === 'draft') {
    return (
      <Badge variant="secondary" className={`gap-1.5 ${className}`}>
        <FileText className="w-3 h-3" />
        Draft
        {version && <span className="font-mono">v{version}</span>}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className={`gap-1.5 ${className}`}>
      <CheckCircle2 className="w-3 h-3" />
      Published
      {version && <span className="font-mono">v{version}</span>}
    </Badge>
  );
}
