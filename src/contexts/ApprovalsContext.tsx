import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RequestsService } from '../services/requestsService';

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
  submitAccessRequest: (req: Omit<ApprovalRequest, 'id' | 'status' | 'age' | 'slaRemaining' | 'submittedAt'> & { status?: ApprovalStatus }) => Promise<ApprovalRequest>;
  reload: () => Promise<void>;
  clearAll: () => void;
}

const ApprovalsContext = createContext<ApprovalsContextValue | undefined>(undefined);

function computeDurationDaysFromDate(endDateString: string | undefined): number | null {
  if (!endDateString) return null;
  const end = new Date(endDateString);
  if (isNaN(end.getTime())) return null;
  const start = new Date();
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0; // same-day or past date treated as 0 days
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function ApprovalsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  const reload = useCallback(async () => {
    const rows = await RequestsService.listPending();
    const mapped: ApprovalRequest[] = rows.map(r => ({
      id: r.id,
      requester: { name: 'Requester', email: 'user@example.com', department: 'General' },
      item: { name: r.resource_name, type: 'Application' },
      status: 'Pending',
      risk: 'Low',
      age: '0d',
      slaRemaining: '3d',
      submittedAt: r.submitted_at,
      businessJustification: r.business_justification || '',
      sodConflicts: 0,
    }));
    setRequests(mapped);
  }, []);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  const submitAccessRequest: ApprovalsContextValue['submitAccessRequest'] = useCallback(async (req) => {
    const durationDays = computeDurationDaysFromDate(req.duration);
    const created = await RequestsService.create({
      resource_type: req.item.type,
      resource_name: req.item.name,
      business_justification: req.businessJustification,
      risk_level: req.risk,
      sod_conflicts_count: req.sodConflicts ?? 0,
      duration_days: durationDays,
    });
    const mapped: ApprovalRequest = {
      id: created.id,
      requester: req.requester,
      item: req.item,
      status: 'Pending',
      risk: req.risk,
      age: '0d',
      slaRemaining: '3d',
      submittedAt: created.submitted_at,
      businessJustification: req.businessJustification,
      duration: req.duration,
      sodConflicts: req.sodConflicts ?? 0,
      peerCoverage: req.peerCoverage,
      lastUsed: req.lastUsed,
      usageData: req.usageData,
      impactItems: req.impactItems,
    };
    setRequests(prev => [mapped, ...prev]);
    return mapped;
  }, []);

  const clearAll = useCallback(() => setRequests([]), []);

  const value = useMemo(() => ({ requests, submitAccessRequest, reload, clearAll }), [requests, submitAccessRequest, reload, clearAll]);

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
