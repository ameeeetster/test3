import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  requestId: string;
}

export function RejectionDialog({ open, onOpenChange, onConfirm, requestId }: RejectionDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        maxWidth: '500px',
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
            Reject Request {requestId}
          </DialogTitle>
          <DialogDescription style={{ fontSize: '13px' }}>
            Please provide a reason for rejecting this access request
          </DialogDescription>
        </DialogHeader>

        <div style={{ marginBottom: '20px' }}>
          <Label htmlFor="rejection-reason" style={{ 
            fontSize: '13px', 
            fontWeight: '600',
            color: 'var(--text)',
            marginBottom: '8px',
            display: 'block'
          }}>
            Rejection Reason *
          </Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this request is being rejected..."
            rows={4}
            style={{
              backgroundColor: 'var(--input-background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
          <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
            This reason will be sent to the requestor and recorded in the audit log.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{
              height: '40px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            style={{
              height: '40px',
              backgroundColor: 'var(--danger)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 120ms var(--ease-out)'
            }}
            className="hover:opacity-90"
          >
            Confirm Rejection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}