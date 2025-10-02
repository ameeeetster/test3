import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle, ExternalLink, Users } from 'lucide-react';
import { RiskChip } from './RiskChip';

interface SoDConflict {
  id: string;
  ruleName: string;
  ruleDescription: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  conflictingEntitlements: {
    name: string;
    app: string;
  }[];
  affectedUsers: number;
  policyLink?: string;
}

interface SoDConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: SoDConflict[];
  onSimulateFix?: (conflictId: string) => void;
}

export function SoDConflictModal({
  open,
  onOpenChange,
  conflicts,
  onSimulateFix
}: SoDConflictModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--warning)' }} />
            Segregation of Duties Conflicts
          </DialogTitle>
          <DialogDescription>
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected that violate your organization's SoD policies
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="flex flex-col gap-4 mt-4">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="p-4 rounded-lg border"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 style={{
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)'
                      }}>
                        {conflict.ruleName}
                      </h4>
                      <RiskChip risk={conflict.severity} size="sm" />
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)', 
                      color: 'var(--text-secondary)'
                    }}>
                      {conflict.ruleDescription}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <div style={{ 
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--muted-foreground)',
                      marginBottom: '8px'
                    }}>
                      Conflicting Entitlements
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {conflict.conflictingEntitlements.map((ent, idx) => (
                        <Badge key={idx} variant="outline">
                          {ent.name} ({ent.app})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {conflict.affectedUsers} user{conflict.affectedUsers !== 1 ? 's' : ''} affected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {conflict.policyLink && (
                        <Button variant="ghost" size="sm" className="gap-2">
                          View Policy
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      {onSimulateFix && (
                        <Button
                          onClick={() => onSimulateFix(conflict.id)}
                          variant="outline"
                          size="sm"
                        >
                          Simulate Fix
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Review All Conflicts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
