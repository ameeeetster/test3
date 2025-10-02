import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ConflictChip } from './ConflictChip';
import { Button } from './ui/button';

interface SoDConflict {
  id: string;
  conflictingAccess: string;
  reason: string;
  policy: string;
  policyLink?: string;
}

interface ConflictsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: SoDConflict[];
  requestId: string;
}

export function ConflictsModal({ open, onOpenChange, conflicts, requestId }: ConflictsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        maxWidth: '600px',
        padding: '24px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <DialogHeader style={{ marginBottom: '20px' }}>
          <DialogTitle style={{ 
            color: 'var(--text)', 
            fontSize: '20px', 
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            Segregation of Duties Conflicts
          </DialogTitle>
          <DialogDescription style={{ fontSize: '13px' }}>
            Request {requestId} has {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''} that require review
          </DialogDescription>
        </DialogHeader>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {conflicts.map((conflict) => (
            <ConflictChip
              key={conflict.id}
              conflictingAccess={conflict.conflictingAccess}
              reason={conflict.reason}
              policy={conflict.policy}
              policyLink={conflict.policyLink}
            />
          ))}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'var(--accent)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--text)', fontWeight: '600' }}>Note:</strong> Conflicts must be acknowledged and documented before approval. Contact your compliance team if you have questions about these policies.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}