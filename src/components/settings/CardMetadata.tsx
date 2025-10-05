import React from 'react';
import { History } from 'lucide-react';
import { Button } from '../ui/button';

interface CardMetadataProps {
  user: string;
  timestamp: string;
  onViewAudit?: () => void;
}

export function CardMetadata({ user, timestamp, onViewAudit }: CardMetadataProps) {
  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <span>Last changed by {user}</span>
        <span>•</span>
        <span>{timestamp}</span>
      </div>
      {onViewAudit && (
        <Button variant="ghost" size="sm" onClick={onViewAudit} className="h-auto p-0 text-xs hover:text-foreground">
          <History className="w-3 h-3 mr-1" />
          View History
        </Button>
      )}
    </div>
  );
}
