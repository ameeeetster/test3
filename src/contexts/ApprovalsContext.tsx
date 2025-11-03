import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ApprovalRisk = 'Low' | 'Medium' | 'High' | 'Critical';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ApprovalItem {
  name: string;
  type: 'Application' | 'Role' | 'Entitlement';
  icon?: string;
  scope?: string;
}

export interface ApprovalRequester {
  name: string;
  email: string;
  department: string;
}

export interface ApprovalRequest {
  id: string;
  requester: ApprovalRequester;
  item: ApprovalItem;
  status: ApprovalStatus;
  risk: ApprovalRisk;
  age: string;
  slaRemaining: string;
  submittedAt: string;
  businessJustification: string;
  duration?: string;
  sodConflicts: number;
  peerCoverage?: number;
  lastUsed?: string;
  usageData?: number[];
  impactItems?: Array<{ type: 'role' | 'entitlement' | 'application'; name: string; scope?: string; }>;
}

interface ApprovalsContextValue {
  requests: ApprovalRequest[];
  submitAccessRequest: (req: Omit<ApprovalRequest, 'id' | 'status' | 'age' | 'slaRemaining' | 'submittedAt'> & { status?: ApprovalStatus }) => ApprovalRequest;
  clearAll: () => void;
}

const ApprovalsContext = createContext<ApprovalsContextValue | undefined>(undefined);

export function ApprovalsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  const submitAccessRequest: ApprovalsContextValue['submitAccessRequest'] = useCallback((req) => {
    const now = new Date();
    const id = `REQ-${now.getFullYear()}-${now.getTime().toString().slice(-4)}`;
    const newReq: ApprovalRequest = {
      id,
      requester: req.requester,
      item: req.item,
      status: req.status ?? 'Pending',
      risk: req.risk,
      age: '0d',
      slaRemaining: '3d',
      submittedAt: now.toISOString(),
      businessJustification: req.businessJustification,
      duration: req.duration,
      sodConflicts: req.sodConflicts ?? 0,
      peerCoverage: req.peerCoverage,
      lastUsed: req.lastUsed,
      usageData: req.usageData,
      impactItems: req.impactItems,
    };
    setRequests(prev => [newReq, ...prev]);
    return newReq;
  }, []);

  const clearAll = useCallback(() => setRequests([]), []);

  const value = useMemo(() => ({ requests, submitAccessRequest, clearAll }), [requests, submitAccessRequest, clearAll]);

  return (
    <ApprovalsContext.Provider value={value}>{children}</ApprovalsContext.Provider>
  );
}

export function useApprovals() {
  const ctx = useContext(ApprovalsContext);
  if (!ctx) {
    throw new Error('useApprovals must be used within ApprovalsProvider');
  }
  return ctx;
}
