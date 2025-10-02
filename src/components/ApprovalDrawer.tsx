import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Clock, Users, Shield, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Timeline } from './Timeline';
import { ConflictChip } from './ConflictChip';
import { ConflictsModal } from './ConflictsModal';
import { RejectionDialog } from './RejectionDialog';
import { Separator } from './ui/separator';

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
}

interface ApprovalDrawerProps {
  request: ApprovalRequest;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelegate: (id: string) => void;
}

export function ApprovalDrawer({ 
  request, 
  open, 
  onClose, 
  onApprove, 
  onReject,
  onDelegate 
}: ApprovalDrawerProps) {
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  if (!open) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'var(--danger)';
      case 'High': return 'var(--warning)';
      case 'Medium': return 'var(--info)';
      default: return 'var(--success)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'var(--success)';
      case 'Rejected': return 'var(--danger)';
      default: return 'var(--warning)';
    }
  };

  const timelineEvents = [
    { 
      id: '1',
      status: 'completed' as const, 
      title: 'Request Submitted',
      description: `By ${request.requester.name}`,
      timestamp: request.submittedAt
    },
    { 
      id: '2',
      status: 'completed' as const, 
      title: 'Manager Approved',
      description: 'Sarah Chen approved',
      timestamp: '2 hours ago'
    },
    { 
      id: '3',
      status: 'active' as const, 
      title: 'App Owner Review',
      description: 'Awaiting your decision',
      timestamp: 'In Progress'
    },
    { 
      id: '4',
      status: 'pending' as const, 
      title: 'Provisioning',
      description: 'Access will be granted',
      timestamp: undefined
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />
      <div 
        className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] z-50 flex flex-col overflow-hidden"
        style={{ 
          backgroundColor: 'var(--bg)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <h2 style={{ 
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              {request.id}
            </h2>
            <Badge 
              variant="outline"
              style={{
                borderColor: getStatusColor(request.status),
                color: getStatusColor(request.status),
                fontSize: 'var(--text-xs)'
              }}
            >
              {request.status}
            </Badge>
            <ConflictChip count={request.sodConflicts} size="sm" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Summary Card */}
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
            
            {/* Requester */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {request.requester.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}>
                    {request.requester.name}
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)'
                  }}>
                    {request.requester.department}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Access Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                    marginBottom: '4px'
                  }}>
                    Item
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}>
                    {request.item.name}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-foreground)',
                    marginBottom: '4px'
                  }}>
                    Type
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}>
                    {request.item.type}
                  </div>
                </div>
                {request.item.scope && (
                  <div>
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      color: 'var(--muted-foreground)',
                      marginBottom: '4px'
                    }}>
                      Scope
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {request.item.scope}
                    </div>
                  </div>
                )}
                {request.duration && (
                  <div>
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      color: 'var(--muted-foreground)',
                      marginBottom: '4px'
                    }}>
                      Duration
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {request.duration}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            <Timeline events={timelineEvents} />
          </div>

          {/* SoD Check */}
          <div 
            className="p-5 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 
                style={{ 
                  fontSize: 'var(--text-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}
              >
                Separation of Duties
              </h3>
              {request.sodConflicts === 0 ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  <span style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--success)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    No conflicts
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                  <span style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--warning)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    {request.sodConflicts} conflict{request.sodConflicts > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            {request.sodConflicts > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConflictsModal(true)}
                className="w-full"
              >
                View Conflicts
              </Button>
            )}
          </div>

          {/* Usage Signal */}
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
              <div className="space-y-3">
                {request.peerCoverage !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                        Peer Coverage
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--primary)'
                    }}>
                      {request.peerCoverage}%
                    </span>
                  </div>
                )}
                {request.lastUsed && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                        Last Used
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {request.lastUsed}
                    </span>
                  </div>
                )}
              </div>
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
            <p style={{ 
              fontSize: 'var(--text-body)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              {request.businessJustification}
            </p>
          </div>

          {/* AI Suggestions */}
          <div 
            className="p-5 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--info-bg)',
              borderColor: 'var(--info-border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: 'var(--info)' }} />
              <div>
                <h3 
                  className="mb-1"
                  style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}
                >
                  AI Recommendations
                </h3>
                <p style={{ 
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px'
                }}>
                  Based on similar requests and risk analysis
                </p>
                <ul className="space-y-2">
                  <li 
                    className="flex items-center justify-between p-3 rounded-md"
                    style={{ backgroundColor: 'var(--bg)' }}
                  >
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                      Approve with reduced scope (Read-only)
                    </span>
                    <Button variant="ghost" size="sm" className="h-7">
                      Apply
                    </Button>
                  </li>
                  <li 
                    className="flex items-center justify-between p-3 rounded-md"
                    style={{ backgroundColor: 'var(--bg)' }}
                  >
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                      Time-bound access (7 days)
                    </span>
                    <Button variant="ghost" size="sm" className="h-7">
                      Apply
                    </Button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Decision Bar - Sticky Bottom */}
        {request.status === 'Pending' && (
          <div 
            className="border-t px-6 py-4 flex items-center gap-3"
            style={{ 
              borderColor: 'var(--border)',
              backgroundColor: 'var(--bg)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <Badge 
              variant="outline"
              className="flex items-center gap-1.5"
              style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
            >
              <Clock className="w-3 h-3" />
              <span>2d left</span>
            </Badge>
            <div className="flex-1 flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => onDelegate(request.id)}
              >
                Delegate
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectionDialog(true)}
                style={{
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)'
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => onApprove(request.id)}
                style={{
                  backgroundColor: 'var(--success)',
                  color: 'white'
                }}
              >
                Approve
              </Button>
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
    </>
  );
}