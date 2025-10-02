import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';

interface ApprovalSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'edit' | 'add-member' | 'duplicate' | 'delete';
  actionDetails: {
    title: string;
    description: string;
    impactSummary?: Array<{ label: string; value: string | number }>;
    warningMessage?: string;
  };
  onSubmit: (data: { justification: string; approver: string }) => void;
}

const mockApprovers = [
  { id: 'A-1', name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'IAM Manager' },
  { id: 'A-2', name: 'David Lee', email: 'david.l@company.com', role: 'Security Lead' },
  { id: 'A-3', name: 'Michael Chen', email: 'michael.c@company.com', role: 'Compliance Officer' }
];

export function ApprovalSubmissionDialog({
  open,
  onOpenChange,
  actionType,
  actionDetails,
  onSubmit
}: ApprovalSubmissionDialogProps) {
  const [justification, setJustification] = useState('');
  const [selectedApprover, setSelectedApprover] = useState(mockApprovers[0].id);

  const handleSubmit = () => {
    onSubmit({ justification, approver: selectedApprover });
    setJustification('');
    onOpenChange(false);
  };

  const getActionTypeLabel = () => {
    switch (actionType) {
      case 'edit':
        return 'Edit Role';
      case 'add-member':
        return 'Add Members';
      case 'duplicate':
        return 'Duplicate Role';
      case 'delete':
        return 'Delete Role';
      default:
        return 'Action';
    }
  };

  const getActionIcon = () => {
    if (actionType === 'delete') {
      return <AlertTriangle className="w-5 h-5" style={{ color: 'var(--danger)' }} />;
    }
    return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--primary)' }} />;
  };

  const selectedApproverData = mockApprovers.find(a => a.id === selectedApprover);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Submit for Approval</DialogTitle>
          <DialogDescription>
            This {getActionTypeLabel().toLowerCase()} requires approval. Provide justification and select an approver.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Action Summary */}
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="flex gap-3">
              {getActionIcon()}
              <div className="flex-1">
                <div style={{ 
                  fontSize: 'var(--text-body)', 
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '4px'
                }}>
                  {actionDetails.title}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  {actionDetails.description}
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            {actionDetails.impactSummary && actionDetails.impactSummary.length > 0 && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text)',
                  marginBottom: '8px'
                }}>
                  Impact Summary
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {actionDetails.impactSummary.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {item.label}:
                      </span>
                      <span style={{ 
                        fontSize: 'var(--text-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text)'
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Message */}
            {actionDetails.warningMessage && (
              <div className="mt-4 p-3 rounded-lg" style={{ 
                backgroundColor: 'var(--warning-bg)', 
                borderLeft: '3px solid var(--warning)' 
              }}>
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {actionDetails.warningMessage}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Select Approver */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="approver">Approver</Label>
            <Select value={selectedApprover} onValueChange={setSelectedApprover}>
              <SelectTrigger id="approver">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockApprovers.map((approver) => (
                  <SelectItem key={approver.id} value={approver.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{approver.name}</span>
                      <span style={{ color: 'var(--muted-foreground)' }}>
                        ({approver.role})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Approver Card */}
            {selectedApproverData && (
              <div className="mt-2 p-3 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {selectedApproverData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div style={{ 
                      fontSize: 'var(--text-body)', 
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {selectedApproverData.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {selectedApproverData.email}
                    </div>
                  </div>
                  <Badge variant="outline">{selectedApproverData.role}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Justification */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="justification">
              Business Justification
              <span style={{ color: 'var(--danger)' }}> *</span>
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why this change is needed and how it supports business objectives..."
              rows={4}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              Provide detailed justification to help the approver make an informed decision.
            </span>
          </div>

          {/* Expected Timeline */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent)' }}>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5" style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ 
                  fontSize: 'var(--text-body)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text)',
                  marginBottom: '4px'
                }}>
                  Expected Timeline
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Most approval requests are reviewed within 24-48 hours. You'll receive a notification once {selectedApproverData?.name.split(' ')[0]} reviews your request.
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!justification.trim()}>
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
