import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Info } from 'lucide-react';

interface ApproveWithChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (changes: ApprovalChanges) => void;
  requestId: string;
  originalRequest: {
    resourceName: string;
    accessLevel?: string;
    duration?: string;
    businessJustification: string;
  };
}

export interface ApprovalChanges {
  modifiedAccessLevel?: string;
  modifiedDuration?: string;
  modifiedDurationDays?: number;
  comments: string;
  reasonForChanges: string;
}

export function ApproveWithChangesDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  requestId,
  originalRequest 
}: ApproveWithChangesDialogProps) {
  const [modifiedAccessLevel, setModifiedAccessLevel] = useState(originalRequest.accessLevel || '');
  const [modifiedDuration, setModifiedDuration] = useState(originalRequest.duration || '');
  const [comments, setComments] = useState('');
  const [reasonForChanges, setReasonForChanges] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setModifiedAccessLevel(originalRequest.accessLevel || '');
      setModifiedDuration(originalRequest.duration || '');
      setComments('');
      setReasonForChanges('');
    }
  }, [open, originalRequest]);

  const handleConfirm = () => {
    if (!reasonForChanges.trim()) {
      return; // Reason is required
    }

    // Calculate duration in days if date is provided
    let modifiedDurationDays: number | undefined;
    if (modifiedDuration) {
      const endDate = new Date(modifiedDuration);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      modifiedDurationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    onConfirm({
      modifiedAccessLevel: modifiedAccessLevel !== originalRequest.accessLevel ? modifiedAccessLevel : undefined,
      modifiedDuration: modifiedDuration !== originalRequest.duration ? modifiedDuration : undefined,
      modifiedDurationDays,
      comments: comments.trim(),
      reasonForChanges: reasonForChanges.trim(),
    });
    
    onOpenChange(false);
  };

  const hasChanges = 
    modifiedAccessLevel !== originalRequest.accessLevel ||
    modifiedDuration !== originalRequest.duration ||
    comments.trim().length > 0;

  const isValid = reasonForChanges.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        maxWidth: '600px',
        padding: '24px',
        boxShadow: 'var(--shadow-xl)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <DialogHeader style={{ marginBottom: '20px' }}>
          <DialogTitle style={{ 
            color: 'var(--text)', 
            fontSize: '20px', 
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            Approve Request {requestId} with Changes
          </DialogTitle>
          <DialogDescription style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
            Modify the request details before approving. All changes will be recorded and the requester will be notified.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Original Request Info */}
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--accent)',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
              <Info className="w-4 h-4" style={{ color: 'var(--muted-foreground)', marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                  Original Request
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Resource: <strong>{originalRequest.resourceName}</strong>
                </p>
                {originalRequest.accessLevel && (
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                    Access Level: <strong>{originalRequest.accessLevel}</strong>
                  </p>
                )}
                {originalRequest.duration && (
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                    Duration: <strong>{originalRequest.duration}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Modified Access Level */}
          <div>
            <Label htmlFor="modified-access-level" style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px',
              display: 'block'
            }}>
              Modified Access Level (Optional)
            </Label>
            <Input
              id="modified-access-level"
              value={modifiedAccessLevel}
              onChange={(e) => setModifiedAccessLevel(e.target.value)}
              placeholder={originalRequest.accessLevel || "Enter access level..."}
              style={{
                backgroundColor: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
              Leave empty to keep original access level
            </p>
          </div>

          {/* Modified Duration */}
          <div>
            <Label htmlFor="modified-duration" style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px',
              display: 'block'
            }}>
              Modified Duration (Optional)
            </Label>
            <Input
              id="modified-duration"
              type="date"
              value={modifiedDuration}
              onChange={(e) => setModifiedDuration(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{
                backgroundColor: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
              Leave empty to keep original duration or make permanent
            </p>
          </div>

          {/* Reason for Changes - Required */}
          <div>
            <Label htmlFor="reason-for-changes" style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px',
              display: 'block'
            }}>
              Reason for Changes *
            </Label>
            <Textarea
              id="reason-for-changes"
              value={reasonForChanges}
              onChange={(e) => setReasonForChanges(e.target.value)}
              placeholder="Explain why you're modifying this request (minimum 10 characters)..."
              rows={3}
              style={{
                backgroundColor: 'var(--input-background)',
                border: reasonForChanges.trim().length > 0 && reasonForChanges.trim().length < 10 
                  ? '1px solid var(--warning)' 
                  : '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
            {reasonForChanges.trim().length > 0 && reasonForChanges.trim().length < 10 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
                <p style={{ fontSize: '12px', color: 'var(--warning)' }}>
                  Please provide at least 10 characters explaining the reason for changes
                </p>
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
              This reason will be sent to the requester and recorded in the audit log.
            </p>
          </div>

          {/* Additional Comments - Optional */}
          <div>
            <Label htmlFor="comments" style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px',
              display: 'block'
            }}>
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any additional notes or instructions..."
              rows={3}
              style={{
                backgroundColor: 'var(--input-background)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
              These comments will be included in the approval notification
            </p>
          </div>

          {/* Warning if no changes */}
          {!hasChanges && reasonForChanges.trim().length >= 10 && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--warning-bg)',
              borderRadius: '8px',
              border: '1px solid var(--warning-border)',
              display: 'flex',
              alignItems: 'start',
              gap: '8px'
            }}>
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)', marginTop: '2px' }} />
              <p style={{ fontSize: '12px', color: 'var(--warning)' }}>
                You haven't made any changes to the request. Consider using "Approve as requested" instead.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{
              height: '44px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              paddingLeft: '20px',
              paddingRight: '20px'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
            style={{
              height: '44px',
              backgroundColor: isValid ? 'var(--success)' : 'var(--muted)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              paddingLeft: '24px',
              paddingRight: '24px',
              transition: 'all 120ms var(--ease-out)',
              cursor: isValid ? 'pointer' : 'not-allowed',
              opacity: isValid ? 1 : 0.6
            }}
            className={isValid ? "hover:opacity-90" : ""}
          >
            Approve with Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

