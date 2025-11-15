import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ConflictChip } from './ConflictChip';
import { ConflictsModal } from './ConflictsModal';
import { RejectionDialog } from './RejectionDialog';
import { ApproveWithChangesDialog, ApprovalChanges } from './ApproveWithChangesDialog';
import { ImpactPreview } from './ImpactPreview';
import { UsageIntelligence } from './UsageIntelligence';
import { AIRecommendations } from './AIRecommendations';
import { WorkflowTimeline } from './WorkflowTimeline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';

interface ApprovalRequest {
  id: string;
  requester: {
    name: string;
    email: string;
    department: string;
  };
  item: {
    name: string;
    type: 'Application' | 'Role' | 'Entitlement';
    scope?: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  submittedAt: string;
  businessJustification: string;
  duration?: string;
  sodConflicts: number;
  peerCoverage?: number;
  lastUsed?: string;
  usageData?: number[];
  impactItems?: Array<{
    type: 'role' | 'entitlement' | 'application';
    name: string;
    scope?: string;
  }>;
}

interface EnhancedApprovalDrawerProps {
  request: ApprovalRequest;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string, withChanges?: boolean, changes?: ApprovalChanges) => void;
  onReject: (id: string, reason: string) => void;
  onDelegate: (id: string, delegateTo?: string) => void;
}

export function EnhancedApprovalDrawer({
  request,
  open,
  onClose,
  onApprove,
  onReject,
  onDelegate
}: EnhancedApprovalDrawerProps) {
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showApproveWithChangesDialog, setShowApproveWithChangesDialog] = useState(false);
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open || !request) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onApprove(request.id);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setShowRejectionDialog(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setShowDelegateDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, request?.id, onApprove]);

  if (!open || !request) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'var(--danger)';
      case 'High': return 'var(--warning)';
      case 'Medium': return 'var(--info)';
      default: return 'var(--success)';
    }
  };

  const getRiskIcon = (risk: string) => {
    return <AlertTriangle className="w-3 h-3" />;
  };

  const workflowSteps = React.useMemo(() => [
    {
      id: '1',
      status: 'completed' as const,
      title: 'Request Submitted',
      user: request.requester.name,
      timestamp: request.submittedAt
    },
    {
      id: '2',
      status: 'completed' as const,
      title: 'Manager Approved',
      user: 'Sarah Chen',
      timestamp: '2 hours ago'
    },
    {
      id: '3',
      status: 'current' as const,
      title: 'App Owner Review',
      user: 'You',
      timestamp: 'In Progress',
      eta: '4 hours'
    },
    {
      id: '4',
      status: 'pending' as const,
      title: 'Provisioning',
      user: 'System',
      timestamp: undefined
    }
  ], [request.requester.name, request.submittedAt]);

  const recommendations = React.useMemo(() => [
    {
      id: 'rec-1',
      title: 'Reduce scope to Read-only',
      description: 'Lower risk while maintaining essential access based on peer usage patterns',
      confidence: 92,
      type: 'scope' as const
    },
    {
      id: 'rec-2',
      title: 'Time-bound access (7 days)',
      description: 'Grant temporary access with automatic revocation for short-term needs',
      confidence: 85,
      type: 'duration' as const
    }
  ], []);

  const slaRemaining = request.status === 'Pending' ? '2d left' : null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-150"
        onClick={onClose}
        style={{ backdropFilter: 'blur(2px)' }}
      />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] z-50 flex flex-col overflow-hidden transition-transform duration-150"
        style={{
          backgroundColor: 'var(--bg)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Sticky Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between sticky top-0 z-10"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--bg)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <h2
              className="flex-shrink-0"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}
            >
              {request.id}
            </h2>
            <Badge
              variant="outline"
              className="flex-shrink-0"
              style={{
                borderColor: request.status === 'Pending' ? 'var(--warning)' : 'var(--border)',
                color: request.status === 'Pending' ? 'var(--warning)' : 'var(--text)',
                fontSize: 'var(--text-xs)'
              }}
            >
              {request.status}
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 flex-shrink-0"
              style={{
                borderColor: getRiskColor(request.risk),
                color: getRiskColor(request.risk),
                fontSize: 'var(--text-xs)'
              }}
            >
              {getRiskIcon(request.risk)}
              {request.risk}
            </Badge>
            {slaRemaining && (
              <Badge
                variant="outline"
                className="flex-shrink-0"
                style={{
                  borderColor: 'var(--info-border)',
                  backgroundColor: 'var(--info-bg)',
                  color: 'var(--info)',
                  fontSize: 'var(--text-xs)'
                }}
              >
                {slaRemaining}
              </Badge>
            )}
            {/* Applied recommendation pills */}
            {appliedRecommendations.map(recId => {
              const rec = recommendations.find(r => r.id === recId);
              if (!rec) return null;
              return (
                <Badge
                  key={recId}
                  className="flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--success-bg)',
                    borderColor: 'var(--success-border)',
                    color: 'var(--success)',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  {rec.title}
                </Badge>
              );
            })}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 flex-shrink-0 ml-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* SoD Conflicts Alert */}
          {request.sodConflicts > 0 && (
            <div
              className="p-4 rounded-lg border flex items-start gap-3"
              style={{
                backgroundColor: 'var(--warning-bg)',
                borderColor: 'var(--warning-border)'
              }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
              <div className="flex-1 min-w-0">
                <h4
                  className="mb-1"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}
                >
                  {request.sodConflicts} Segregation of Duties Conflict{request.sodConflicts > 1 ? 's' : ''}
                </h4>
                <p
                  className="mb-3"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--line-height-relaxed)'
                  }}
                >
                  This request conflicts with existing access. Review required before approval.
                </p>
                <Button variant="outline" size="sm" onClick={() => setShowConflictsModal(true)}>
                  Review Conflicts
                </Button>
              </div>
            </div>
          )}

          {/* Summary Card - 2 Column Grid */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3
              className="mb-4"
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}
            >
              Request Summary
            </h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <div
                  className="mb-1"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Requester
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}
                >
                  {request.requester.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  {request.requester.department}
                </div>
              </div>

              <div>
                <div
                  className="mb-1"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Item
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}
                >
                  {request.item.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  {request.item.type}
                </div>
              </div>

              {request.item.scope && (
                <div>
                  <div
                    className="mb-1"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Scope
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}
                  >
                    {request.item.scope}
                  </div>
                </div>
              )}

              {request.duration && (
                <div>
                  <div
                    className="mb-1"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Duration
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}
                  >
                    {request.duration}
                  </div>
                </div>
              )}
            </div>

            {/* Impact Preview */}
            {request.impactItems && request.impactItems.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <div
                    className="mb-3"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Impact Preview
                  </div>
                  <ImpactPreview items={request.impactItems} />
                </div>
              </>
            )}
          </div>

          {/* Workflow Timeline */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3
              className="mb-4"
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}
            >
              Approval Workflow
            </h3>
            <WorkflowTimeline steps={workflowSteps} />
          </div>

          {/* Usage Intelligence */}
          {(request.peerCoverage !== undefined || request.lastUsed) && (
            <div
              className="p-5 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h3
                className="mb-4"
                style={{
                  fontSize: 'var(--text-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}
              >
                Usage Intelligence
              </h3>
              <UsageIntelligence
                peerCoverage={request.peerCoverage}
                lastUsed={request.lastUsed}
                usageData={request.usageData}
              />
            </div>
          )}

          {/* Business Justification */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3
              className="mb-3"
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}
            >
              Business Justification
            </h3>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)'
              }}
            >
              {request.businessJustification}
            </p>
          </div>

          {/* AI Recommendations */}
          <div
            className="p-5 rounded-lg border"
            style={{
              backgroundColor: 'var(--info-bg)',
              borderColor: 'var(--info-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3
              className="mb-3"
              style={{
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}
            >
              AI Recommendations
            </h3>
            <p
              className="mb-4"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)'
              }}
            >
              Based on similar requests and risk analysis
            </p>
            <AIRecommendations
              recommendations={recommendations}
              onApply={(id) => {
                setAppliedRecommendations([...appliedRecommendations, id]);
              }}
              appliedIds={appliedRecommendations}
            />
          </div>
        </div>

        {/* Decision Bar - Sticky Bottom */}
        {request.status === 'Pending' && (
          <div
            className="border-t px-6 py-4 flex items-center gap-3 sticky bottom-0"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="flex-1 flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelegateDialog(true)}
                className="gap-2"
              >
                Delegate
                <kbd
                  className="px-1.5 py-0.5 rounded border text-[10px]"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  D
                </kbd>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(true)}
                className="gap-2"
                style={{
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}
              >
                Reject
                <kbd
                  className="px-1.5 py-0.5 rounded border text-[10px]"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--danger)',
                    color: 'var(--danger)'
                  }}
                >
                  R
                </kbd>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="gap-2"
                    style={{
                      backgroundColor: 'var(--success)',
                      color: 'white'
                    }}
                  >
                    Approve
                    <ChevronDown className="w-4 h-4" />
                    <kbd
                      className="px-1.5 py-0.5 rounded border text-[10px]"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white'
                      }}
                    >
                      A
                    </kbd>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onApprove(request.id)}>
                    Approve as requested
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowApproveWithChangesDialog(true)}>
                    Approve with changes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConflictsModal
        open={showConflictsModal}
        onOpenChange={setShowConflictsModal}
        requestId={request.id}
        conflicts={[
          {
            id: '1',
            conflictingAccess: 'Finance Approver + Purchasing Admin',
            reason: 'User cannot both approve and create purchase orders',
            policy: 'SOD-FIN-001',
            policyLink: '#'
          },
          {
            id: '2',
            conflictingAccess: 'AWS Production Admin + Database Admin',
            reason: 'Excessive combined privileges in production environment',
            policy: 'SOD-INF-002',
            policyLink: '#'
          }
        ]}
      />

      <RejectionDialog
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        onConfirm={(reason) => {
          onReject(request.id, reason);
          setShowRejectionDialog(false);
          onClose();
        }}
        requestId={request.id}
      />

      <ApproveWithChangesDialog
        open={showApproveWithChangesDialog}
        onOpenChange={setShowApproveWithChangesDialog}
        onConfirm={(changes) => {
          onApprove(request.id, true, changes);
          setShowApproveWithChangesDialog(false);
          onClose();
        }}
        requestId={request.id}
        originalRequest={{
          resourceName: request.item.name,
          accessLevel: request.item.name.split(' • ')[1] || request.item.name,
          duration: request.duration,
          businessJustification: request.businessJustification
        }}
      />

      {/* Delegate Dialog */}
      <Dialog open={showDelegateDialog} onOpenChange={setShowDelegateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delegate Approval</DialogTitle>
            <DialogDescription>
              Select a user to delegate this approval request to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Delegate to</Label>
              <select
                className="w-full h-10 px-3 rounded-md border"
                style={{
                  backgroundColor: 'var(--input-background)',
                  borderColor: 'var(--border)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <option>Sarah Chen - Manager</option>
                <option>James Wilson - Tech Lead</option>
                <option>Maria Garcia - Security</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDelegateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onDelegate(request.id);
                setShowDelegateDialog(false);
                onClose();
              }}
            >
              Delegate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}