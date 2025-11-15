import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { RequestsService } from '../services/requestsService';
import { supabase } from '../lib/supabase';
import type { ProvisioningStatus } from '../types/database';

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
  approvedAt?: string | null;
  completedAt?: string | null;
  forUserId?: string | null;
  provisioningStatus?: ProvisioningStatus;
  provisioningStartedAt?: string | null;
  provisioningCompletedAt?: string | null;
  provisioningError?: string | null;
}

interface ApprovalsContextValue {
  requests: ApprovalRequest[];
  submitAccessRequest: (req: Omit<ApprovalRequest, 'id' | 'status' | 'age' | 'slaRemaining' | 'submittedAt'> & { status?: ApprovalStatus }) => Promise<ApprovalRequest>;
  updateStatus: (id: string, status: ApprovalStatus) => Promise<void>;
  reload: () => Promise<void>;
  clearAll: () => void;
  syncLocalToDb: () => Promise<{ migrated: number }>;
}

const ApprovalsContext = createContext<ApprovalsContextValue | undefined>(undefined);
const CACHE_KEY = 'approvals-requests-cache-v1';

function computeDurationDaysFromDate(endDateString: string | undefined): number | null {
  if (!endDateString) return null;
  const end = new Date(endDateString);
  if (isNaN(end.getTime())) return null;
  const start = new Date();
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) return 0; // same-day or past date treated as 0 days
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function mapDbStatus(status: string): ApprovalStatus {
  const s = status.toUpperCase();
  if (s === 'APPROVED') return 'Approved';
  if (s === 'REJECTED') return 'Rejected';
  return 'Pending';
}

function mapDbRisk(risk: string | null | undefined): ApprovalRisk {
  const normalized = (risk || '').toUpperCase();
  if (normalized === 'CRITICAL') return 'Critical';
  if (normalized === 'HIGH') return 'High';
  if (normalized === 'MEDIUM') return 'Medium';
  return 'Low';
}

function saveCache(items: ApprovalRequest[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch {}
}
function loadCache(): ApprovalRequest[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ApprovalRequest[];
    return [];
  } catch { return []; }
}

export function ApprovalsProvider({ children }: { children: React.ReactNode }) {
  // DB is the source of truth; cache is only an offline optimization
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  const reload = useCallback(async () => {
    try {
      const rows = await RequestsService.listAll();
      const mappedDb: ApprovalRequest[] = rows.map(r => ({
        id: r.request_number || r.id, // Use friendly request_number instead of UUID
        requester: { name: 'Requester', email: 'user@example.com', department: 'General' },
        item: { name: r.resource_name, type: 'Application' },
        status: mapDbStatus(r.status), // This maps 'APPROVED' -> 'Approved', 'REJECTED' -> 'Rejected', etc.
        risk: mapDbRisk(r.risk_level),
        age: '0d',
        slaRemaining: '3d',
        submittedAt: r.submitted_at,
        businessJustification: r.business_justification || '',
        sodConflicts: r.sod_conflicts_count ?? 0,
        approvedAt: r.approved_at,
        completedAt: r.provisioning_completed_at || r.completed_at,
        forUserId: r.for_user_id ?? null,
        provisioningStatus: r.provisioning_status,
        provisioningStartedAt: r.provisioning_started_at,
        provisioningCompletedAt: r.provisioning_completed_at,
        provisioningError: r.provisioning_error,
      }));
      const sorted = mappedDb.sort((a,b) => (b.submittedAt.localeCompare(a.submittedAt)));
      console.log('🔄 Reloaded requests from database:', sorted.length, 'requests');
      console.log('📊 Status breakdown:', {
        pending: sorted.filter(r => r.status === 'Pending').length,
        approved: sorted.filter(r => r.status === 'Approved').length,
        rejected: sorted.filter(r => r.status === 'Rejected').length,
      });
      setRequests(sorted);
      saveCache(sorted);
    } catch (error) {
      console.error('❌ Error reloading requests:', error);
      // Fall back to cache for offline scenarios
      const cached = loadCache();
      setRequests(cached);
    }
  }, []);

  const submitAccessRequest: ApprovalsContextValue['submitAccessRequest'] = useCallback(async (req) => {
    // ALWAYS require authentication - no dev bypass for data persistence
    const res = await supabase.auth.getSession();
    const session = res.data.session;
    const sessionError = res.error;
    
    if (sessionError || !session) {
      const error = new Error('You must be authenticated to create requests. Please sign in.');
      console.error('Authentication required:', sessionError || 'No session');
      throw error;
    }

    const durationDays = computeDurationDaysFromDate(req.duration);

    // ALWAYS save directly to Supabase database (no localStorage bypass)
    console.log('Creating access request in database...');
    const created = await RequestsService.create({
      resource_type: req.item.type,
      resource_name: req.item.name,
      business_justification: req.businessJustification,
      risk_level: req.risk,
      sod_conflicts_count: req.sodConflicts ?? 0,
      for_user_id: req.forUserId || undefined,
      duration_days: durationDays,
    });
    
    console.log('✅ Access request created in database:', created.request_number);

    const mapped: ApprovalRequest = {
      id: created.request_number || created.id, // Use friendly request_number instead of UUID
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
      approvedAt: null,
      completedAt: null,
      forUserId: req.forUserId || null,
      provisioningStatus: 'not_started',
      provisioningStartedAt: null,
      provisioningCompletedAt: null,
      provisioningError: null,
    };

    setRequests(prev => {
      const next = [mapped, ...prev.filter(p => p.id !== mapped.id)];
      saveCache(next);
      return next;
    });

    return mapped;
  }, []);

  const updateStatus: ApprovalsContextValue['updateStatus'] = useCallback(async (id, status) => {
    const supaStatus = status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED';
    
    if (!id.startsWith('REQ-LOCAL-')) {
      try { 
        // Optimistically update local state first for immediate UI feedback
        setRequests(prev => {
          const next = prev.map(r => r.id === id ? { ...r, status } : r);
          saveCache(next);
          return next;
        });
        
        // Update in database
        await RequestsService.updateStatus(id, supaStatus);
        console.log('✅ Status updated in database, reloading...');
        
        // Reload from database to ensure consistency (this will overwrite optimistic update)
        await reload();
      } catch (err) {
        console.error('❌ Failed to update status in database:', err);
        
        // Revert optimistic update on error
        await reload();
        
        // Re-throw error so UI can show it
        throw new Error(`Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      // For local-only requests, just update local state
      setRequests(prev => {
        const next = prev.map(r => {
          if (r.id !== id) return r;
          const nowIso = new Date().toISOString();
          let approvedAt = r.approvedAt ?? null;
          let completedAt = r.completedAt ?? null;
          let provisioningStatus = r.provisioningStatus ?? 'not_started';
          let provisioningStartedAt = r.provisioningStartedAt ?? null;
          let provisioningCompletedAt = r.provisioningCompletedAt ?? null;
          let provisioningError = r.provisioningError ?? null;

          if (status === 'Pending') {
            approvedAt = null;
            completedAt = null;
            provisioningStatus = 'not_started';
            provisioningStartedAt = null;
            provisioningCompletedAt = null;
            provisioningError = null;
          } else if (status === 'Approved') {
            approvedAt = nowIso;
            completedAt = nowIso;
            provisioningStatus = 'succeeded';
            provisioningStartedAt = nowIso;
            provisioningCompletedAt = nowIso;
            provisioningError = null;
          } else if (status === 'Rejected') {
            approvedAt = null;
            completedAt = nowIso;
            provisioningStatus = 'skipped';
            provisioningStartedAt = null;
            provisioningCompletedAt = nowIso;
            provisioningError = null;
          }

          return { 
            ...r, 
            status, 
            approvedAt, 
            completedAt,
            provisioningStatus,
            provisioningStartedAt,
            provisioningCompletedAt,
            provisioningError,
          };
        });
        saveCache(next);
        return next;
      });
    }
  }, [reload]);

  const clearAll = useCallback(() => { setRequests([]); saveCache([]); }, []);

  const syncLocalToDb = useCallback(async () => {
    const cached = loadCache();
    const localOnly = cached.filter(r => r.id.startsWith('REQ-LOCAL-'));
    if (localOnly.length === 0) return { migrated: 0 };

    let migratedCount = 0;
    const migratedItems: ApprovalRequest[] = [];

    for (const it of localOnly) {
      try {
        const durationDays = computeDurationDaysFromDate(it.duration);
        const created = await RequestsService.create({
          resource_type: it.item.type,
          resource_name: it.item.name,
          business_justification: it.businessJustification,
          risk_level: it.risk,
          sod_conflicts_count: it.sodConflicts ?? 0,
          duration_days: durationDays,
        });
        const mapped: ApprovalRequest = {
          ...it,
          id: created.id,
          status: 'Pending',
          submittedAt: created.submitted_at,
          approvedAt: null,
          completedAt: null,
        };
        migratedItems.push(mapped);
        migratedCount += 1;
      } catch {
        // keep local item if migration fails
        migratedItems.push(it);
      }
    }

    // Update cache with migrated items
    const nonLocal = cached.filter(r => !r.id.startsWith('REQ-LOCAL-'));
    const updatedCache = [...migratedItems, ...nonLocal].sort((a,b) => (b.submittedAt.localeCompare(a.submittedAt)));
    saveCache(updatedCache);
    
    // Update state
    setRequests(updatedCache);

    return { migrated: migratedCount };
  }, []);

  // Initialize: sync any local items, reload from DB, and subscribe to realtime changes
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await syncLocalToDb().catch(() => {});
      if (mounted) await reload().catch(() => {});
    }

    initialize();

    // Realtime subscription keeps state consistent
    const channel = supabase
      .channel('access_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, () => {
        reload().catch(() => {});
      })
      .subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [syncLocalToDb, reload]);

  const value = useMemo(() => ({ requests, submitAccessRequest, updateStatus, reload, clearAll, syncLocalToDb }), [requests, submitAccessRequest, updateStatus, reload, clearAll, syncLocalToDb]);

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
