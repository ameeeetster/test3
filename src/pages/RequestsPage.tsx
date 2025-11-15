import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, AlertTriangle, Clock, CheckCircle2, XCircle, ChevronRight, Calendar, Building2, Shield, User, X, TrendingUp, Users, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Checkbox } from '../components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { NewRequestDialog } from '../components/NewRequestDialog';
import { SoDBanner } from '../components/SoDBanner';
import { Timeline } from '../components/Timeline';
import { ConflictChip } from '../components/ConflictChip';
import { DecisionBar } from '../components/DecisionBar';
import { ConflictsModal } from '../components/ConflictsModal';
import { RejectionDialog } from '../components/RejectionDialog';
import { toast } from 'sonner';
import { useApprovals } from '../contexts/ApprovalsContext';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';

// Mock SoD conflicts data
const sodConflicts: Record<string, Array<{ id: string; conflictingAccess: string; reason: string; policy: string; policyLink?: string }>> = {
  'REQ-001': [
    {
      id: 'sod-1',
      conflictingAccess: 'Oracle ERP - Accounts Receivable Write',
      reason: 'User already has Accounts Payable Write access. Combining both creates a separation of duties violation.',
      policy: 'SOD-FIN-001: AP/AR Segregation',
      policyLink: '#'
    },
    {
      id: 'sod-2',
      conflictingAccess: 'Oracle ERP - General Ledger Write',
      reason: 'Cannot have both AP access and GL write permissions due to financial control requirements.',
      policy: 'SOD-FIN-003: GL Access Controls',
      policyLink: '#'
    }
  ],
  'REQ-005': [
    {
      id: 'sod-3',
      conflictingAccess: 'AWS Development - Admin Console',
      reason: 'User already has development admin access. Production admin would violate environment segregation.',
      policy: 'SOD-IT-002: Environment Separation',
      policyLink: '#'
    }
  ]
};

// Application and Access mapping
const applicationsData = {
  'oracle-erp': {
    name: 'Oracle ERP',
    accesses: [
      { id: 'ap-read', name: 'Accounts Payable Read' },
      { id: 'ap-write', name: 'Accounts Payable Write' },
      { id: 'ar-read', name: 'Accounts Receivable Read' },
      { id: 'ar-write', name: 'Accounts Receivable Write' },
      { id: 'gl-read', name: 'General Ledger Read' },
      { id: 'gl-write', name: 'General Ledger Write' },
      { id: 'admin', name: 'System Administrator' },
    ]
  },
  'sharepoint': {
    name: 'SharePoint',
    accesses: [
      { id: 'finance-viewer', name: 'Finance Site - Viewer' },
      { id: 'finance-editor', name: 'Finance Site - Editor' },
      { id: 'finance-admin', name: 'Finance Site - Administrator' },
      { id: 'hr-viewer', name: 'HR Site - Viewer' },
      { id: 'hr-editor', name: 'HR Site - Editor' },
      { id: 'it-viewer', name: 'IT Site - Viewer' },
    ]
  },
  'salesforce': {
    name: 'Salesforce',
    accesses: [
      { id: 'sales-user', name: 'Sales User' },
      { id: 'sales-manager', name: 'Sales Manager' },
      { id: 'marketing-user', name: 'Marketing User' },
      { id: 'service-user', name: 'Service Cloud User' },
      { id: 'system-admin', name: 'System Administrator' },
    ]
  },
  'workday': {
    name: 'Workday',
    accesses: [
      { id: 'employee', name: 'Employee' },
      { id: 'manager', name: 'Manager' },
      { id: 'hr-partner', name: 'HR Business Partner' },
      { id: 'recruiter', name: 'Recruiter' },
      { id: 'payroll', name: 'Payroll Specialist' },
      { id: 'hr-admin', name: 'HR Administrator' },
    ]
  },
  'aws': {
    name: 'AWS',
    accesses: [
      { id: 'dev-console', name: 'Development Console' },
      { id: 'staging-console', name: 'Staging Console' },
      { id: 'prod-console', name: 'Production Console' },
      { id: 'prod-admin', name: 'Production Admin Console' },
      { id: 'billing', name: 'Billing Dashboard' },
      { id: 'iam-admin', name: 'IAM Administrator' },
    ]
  },
};

const PROVISIONING_STATUS_META: Record<
  'not_started' | 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'skipped',
  { label: string; description: string; bg: string; color: string; border: string }
> = {
  not_started: {
    label: 'Not started',
    description: 'Waiting for approval before provisioning kicks off',
    bg: 'var(--surface)',
    color: 'var(--muted-foreground)',
    border: 'var(--border)',
  },
  pending: {
    label: 'Queued',
    description: 'Job queued and waiting for connector capacity',
    bg: 'var(--warning-bg)',
    color: 'var(--warning)',
    border: 'var(--warning-border)',
  },
  in_progress: {
    label: 'Provisioning',
    description: 'Connector is actively creating or updating access',
    bg: 'var(--info-bg)',
    color: 'var(--info)',
    border: 'var(--info-border)',
  },
  succeeded: {
    label: 'Provisioned',
    description: 'Access granted and provisioning completed successfully',
    bg: 'var(--success-bg)',
    color: 'var(--success)',
    border: 'var(--success-border)',
  },
  failed: {
    label: 'Failed',
    description: 'Connector returned an error – requires manual review',
    bg: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: 'var(--danger-border)',
  },
  skipped: {
    label: 'Skipped',
    description: 'Provisioning not required (rejected or canceled)',
    bg: 'var(--surface)',
    color: 'var(--muted-foreground)',
    border: 'var(--border)',
  },
};
type ProvisioningStateKey = keyof typeof PROVISIONING_STATUS_META;

export function RequestsPage() {
  const navigate = useNavigate();
  const { requests: approvalsRequests, updateStatus, syncLocalToDb } = useApprovals();
  const provisioningMetaFor = (status?: string | null) =>
    PROVISIONING_STATUS_META[(status as ProvisioningStateKey) ?? 'not_started'] ?? PROVISIONING_STATUS_META.not_started;
  const formatProvisioningTimestamp = (value?: string | null) =>
    value
      ? new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
      : '—';
  const [bootLoading, setBootLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 300);
    return () => clearTimeout(t);
  }, []);
  const metrics = useMemo(() => {
    const dataset = approvalsRequests;
    const total = dataset.length;
    const now = new Date();
    const msInDay = 1000 * 60 * 60 * 24;

    const inLast7Days = dataset.filter(r => {
      const submitted = new Date(r.submittedAt);
      if (Number.isNaN(submitted.getTime())) return false;
      return (now.getTime() - submitted.getTime()) / msInDay <= 7;
    }).length;

    const pendingCount = dataset.filter(r => r.status === 'Pending').length;
    const highRiskCount = dataset.filter(r => r.risk === 'High' || r.risk === 'Critical').length;
    const provisioningInFlight = dataset.filter(r => {
      const state = (r.provisioningStatus ?? 'not_started') as string;
      return state === 'pending' || state === 'in_progress';
    }).length;

    const approvalDurationsMs = dataset
      .filter(r => r.status === 'Approved' && r.approvedAt)
      .map(r => {
        const approved = new Date(r.approvedAt as string);
        const submitted = new Date(r.submittedAt);
        if (Number.isNaN(approved.getTime()) || Number.isNaN(submitted.getTime())) return null;
        const diff = approved.getTime() - submitted.getTime();
        return diff >= 0 ? diff : null;
      })
      .filter((ms): ms is number => ms !== null);

    const avgApprovalHours = approvalDurationsMs.length
      ? approvalDurationsMs.reduce((sum, ms) => sum + ms, 0) / approvalDurationsMs.length / (1000 * 60 * 60)
      : null;

    const avgApprovalDisplay = avgApprovalHours !== null
      ? `${avgApprovalHours >= 10 ? avgApprovalHours.toFixed(0) : avgApprovalHours.toFixed(1)}h`
      : '—';

    return [
      {
        label: 'Total Requests',
        value: total.toString(),
        change: total ? `${inLast7Days} in last 7 days` : 'No requests yet',
        icon: Calendar,
        color: '#4F46E5',
      },
      {
        label: 'Pending Approval',
        value: pendingCount.toString(),
        change: pendingCount ? `${pendingCount} awaiting action` : 'All caught up',
        icon: Clock,
        color: '#F59E0B',
      },
      {
        label: 'High Risk',
        value: highRiskCount.toString(),
        change: highRiskCount ? `${highRiskCount} flagged` : 'No high-risk requests',
        icon: AlertTriangle,
        color: '#EF4444',
      },
      {
        label: 'Provisioning',
        value: provisioningInFlight.toString(),
        change: provisioningInFlight ? 'Jobs running now' : 'No active jobs',
        icon: Activity,
        color: '#0EA5E9',
      },
      {
        label: 'Avg. Approval Time',
        value: avgApprovalDisplay,
        change: approvalDurationsMs.length ? `${approvalDurationsMs.length} approvals measured` : 'Waiting for approvals',
        icon: CheckCircle2,
        color: '#10B981',
      },
    ];
  }, [approvalsRequests]);
  const dynamicRequests = useMemo(() => approvalsRequests.map(r => ({
    id: r.id,
    user: r.requester.name,
    department: r.requester.department,
    resource: r.item.name,
    status: r.status,
    risk: r.risk,
    submitted: r.submittedAt,
    sodHits: r.sodConflicts ?? 0,
    justification: r.businessJustification,
    approver: '—',
    forUserId: r.forUserId,
    provisioningStatus: r.provisioningStatus ?? 'not_started',
    provisioningStartedAt: r.provisioningStartedAt ?? null,
    provisioningCompletedAt: r.provisioningCompletedAt ?? null,
    provisioningError: r.provisioningError ?? null,
  })), [approvalsRequests]);

  // Use only live database-backed requests to avoid non-persistent mock rows
  const combinedRequests = useMemo(() => [...dynamicRequests], [dynamicRequests]);

  const [selectedRequest, setSelectedRequest] = useState<typeof combinedRequests[0] | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showConflictsModal, setShowConflictsModal] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Filter states
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [riskFilters, setRiskFilters] = useState<string[]>([]);
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<Array<{ name: string; state: any }>>([]);
  const [selectedView, setSelectedView] = useState<string>('');
  useEffect(() => {
    const raw = localStorage.getItem('views:requests');
    if (raw) {
      try { setSavedViews(JSON.parse(raw)); } catch {}
    }
  }, []);
  const saveCurrentView = () => {
    const name = window.prompt('Save view as:');
    if (!name) return;
    const state = {
      activeTab,
      searchQuery,
      statusFilters,
      riskFilters,
      departmentFilters,
    };
    const existing = savedViews.filter(v => v.name !== name);
    const next = [...existing, { name, state }];
    setSavedViews(next);
    localStorage.setItem('views:requests', JSON.stringify(next));
    setSelectedView(name);
    toast.success('View saved');
  };
  const applyView = (name: string) => {
    setSelectedView(name);
    const v = savedViews.find(v => v.name === name);
    if (!v) return;
    setActiveTab(v.state.activeTab || 'all');
    setSearchQuery(v.state.searchQuery || '');
    setStatusFilters(v.state.statusFilters || []);
    setRiskFilters(v.state.riskFilters || []);
    setDepartmentFilters(v.state.departmentFilters || []);
  };
  const deleteView = () => {
    if (!selectedView) return;
    const next = savedViews.filter(v => v.name !== selectedView);
    setSavedViews(next);
    localStorage.setItem('views:requests', JSON.stringify(next));
    setSelectedView('');
    toast.message('View deleted');
  };

  const filteredRequests = useMemo(() => {
    return combinedRequests.filter(request => {
      // Tab filters
      if (activeTab === 'pending' && request.status !== 'Pending') return false;
      if (activeTab === 'in-progress') {
        const provisioningState = (request.provisioningStatus ?? 'not_started') as string;
        if (provisioningState !== 'pending' && provisioningState !== 'in_progress') return false;
      }
      if (activeTab === 'approved' && request.status !== 'Approved') return false;
      if (activeTab === 'high-risk' && request.risk !== 'High') return false;
      
      // Status filters
      if (statusFilters.length > 0 && !statusFilters.includes(request.status)) return false;
      
      // Risk filters
      if (riskFilters.length > 0 && !riskFilters.includes(request.risk)) return false;
      
      // Department filters
      if (departmentFilters.length > 0 && !departmentFilters.includes(request.department)) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          request.id.toLowerCase().includes(query) ||
          request.user.toLowerCase().includes(query) ||
          request.resource.toLowerCase().includes(query) ||
          request.department.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [combinedRequests, activeTab, searchQuery, statusFilters, riskFilters, departmentFilters]);

  const activeFiltersCount = statusFilters.length + riskFilters.length + departmentFilters.length;

  const toggleFilter = (category: 'status' | 'risk' | 'department', value: string) => {
    const setters = {
      status: setStatusFilters,
      risk: setRiskFilters,
      department: setDepartmentFilters,
    };
    const states = {
      status: statusFilters,
      risk: riskFilters,
      department: departmentFilters,
    };
    
    const setter = setters[category];
    const state = states[category];
    
    if (state.includes(value)) {
      setter(state.filter(v => v !== value));
    } else {
      setter([...state, value]);
    }
  };

  const clearAllFilters = () => {
    setStatusFilters([]);
    setRiskFilters([]);
    setDepartmentFilters([]);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      await updateStatus(selectedRequest.id, 'Approved');
      toast.success('Request Approved', {
        description: `${selectedRequest.id} has been approved successfully.`,
        action: { label: 'View Audit Trail', onClick: () => console.log('View audit trail') }
      });
      setSelectedRequest(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (selectedRequest) {
      await updateStatus(selectedRequest.id, 'Rejected');
      toast.error('Request Rejected', {
        description: `${selectedRequest.id} has been rejected. Reason: ${reason}`,
        action: { label: 'View Audit Trail', onClick: () => console.log('View audit trail') }
      });
      setSelectedRequest(null);
    }
  };

  const handleDelegate = () => {
    if (selectedRequest) {
      toast.info('Delegation Started', {
        description: `Opening delegation dialog for ${selectedRequest.id}...`
      });
      // Would open delegation modal here
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div style={{ padding: '32px', maxWidth: '1320px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ 
                fontSize: '32px',
                lineHeight: '1.3',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '8px'
              }}>
                Access Requests
              </h1>
              <p style={{ 
                fontSize: '14px',
                color: 'var(--muted-foreground)'
              }}>
                Review and manage access requests across all systems
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              style={{ 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                height: '40px',
                padding: '0 20px',
                borderRadius: '10px'
              }}
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} />
              New Request
            </Button>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {metrics.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index}
                  className="card-elevate"
                  style={{ 
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--accent)' }}>
                      <Icon className="w-4 h-4" style={{ color: stat.color }} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '28px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '4px' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      {stat.change}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="tabs-pill" style={{ backgroundColor: 'transparent', padding: '4px', height: '40px' }}>
                <TabsTrigger value="all" style={{ fontSize: '13px' }}>All Requests</TabsTrigger>
                <TabsTrigger value="pending" style={{ fontSize: '13px' }}>Pending</TabsTrigger>
                <TabsTrigger value="in-progress" style={{ fontSize: '13px' }}>In Progress</TabsTrigger>
                <TabsTrigger value="approved" style={{ fontSize: '13px' }}>Approved</TabsTrigger>
                <TabsTrigger value="high-risk" style={{ fontSize: '13px' }}>High Risk</TabsTrigger>
              </TabsList>
            </Tabs>

            <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
              <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} strokeWidth={2} />
              <Input 
                placeholder="Search requests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  paddingLeft: '40px',
                  height: '40px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px'
                }}
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(true)}
              style={{ 
                height: '40px', 
                borderRadius: '10px', 
                fontSize: '13px',
                position: 'relative'
              }}
            >
              <Filter className="w-4 h-4 mr-2" strokeWidth={2} />
              Filters
              {activeFiltersCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  border: '2px solid var(--bg)'
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Saved Views */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={selectedView}
                onChange={(e) => applyView(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm"
                style={{ backgroundColor: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="">Saved views…</option>
                {savedViews.map(v => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={saveCurrentView} className="h-10">
                Save view
              </Button>
              <Button variant="ghost" size="sm" onClick={deleteView} className="h-10">
                Delete
              </Button>
            </div>

            {approvalsRequests.some(r => r.id.startsWith('REQ-LOCAL-')) && (
              <Button
                variant="outline"
                onClick={async () => {
                  const { migrated } = await syncLocalToDb();
                  if (migrated > 0) {
                    toast.success('Synced to database', { description: `${migrated} local request${migrated>1?'s':''} persisted.` });
                  } else {
                    toast.message('No local requests to sync');
                  }
                }}
                style={{ height: '40px', borderRadius: '10px', fontSize: '13px' }}
              >
                Sync local requests
              </Button>
            )}
          </div>
        </div>

        {/* Requests Table */}
        <Card style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            {bootLoading ? (
              <div className="p-4">
                <TableSkeleton rows={8} columns={8} />
              </div>
            ) : combinedRequests.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No requests yet"
                  description="Create your first access request to get started or adjust your filters."
                  actionLabel="New Request"
                  onAction={() => setShowCreateDialog(true)}
                />
              </div>
            ) : null}
            <Table>
              <TableHeader style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <TableRow>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Request ID</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Requestor</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Resource</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Status</TableHead>
                <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Provisioning</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Risk</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Submitted</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow 
                    key={request.id}
                    style={{ height: '56px', borderColor: 'var(--border)', cursor: 'pointer' }}
                    onClick={() => setSelectedRequest(request)}
                    className="hover:bg-accent transition-colors"
                  >
                    <TableCell style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {request.id}
                        {request.sodHits > 0 && (
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%',
                            backgroundColor: 'var(--danger-bg)',
                            border: '1px solid var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <AlertTriangle className="w-3 h-3" style={{ color: 'var(--danger)' }} strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {request.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ color: 'var(--text)', fontWeight: '500', fontSize: '14px' }}>
                            {request.user}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Building2 className="w-3 h-3" strokeWidth={2} />
                            {request.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text)', fontSize: '14px', maxWidth: '300px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {request.resource}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge style={{ 
                        backgroundColor: request.status === 'Approved' ? 'var(--success-bg)' : request.status === 'Pending' ? 'var(--warning-bg)' : request.status === 'Rejected' ? 'var(--danger-bg)' : 'var(--info-bg)',
                        color: request.status === 'Approved' ? 'var(--success)' : request.status === 'Pending' ? 'var(--warning)' : request.status === 'Rejected' ? 'var(--danger)' : 'var(--primary)',
                        border: `1px solid ${request.status === 'Approved' ? 'var(--success-border)' : request.status === 'Pending' ? 'var(--warning-border)' : request.status === 'Rejected' ? 'var(--danger-border)' : 'var(--info-border)'}`,
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '8px'
                      }}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const meta = provisioningMetaFor(request.provisioningStatus);
                        return (
                          <Badge
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.color,
                              border: `1px solid ${meta.border}`,
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              textTransform: 'none',
                            }}
                          >
                            {meta.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge style={{ 
                        backgroundColor: request.risk === 'High' ? 'var(--danger-bg)' : request.risk === 'Medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
                        color: request.risk === 'High' ? 'var(--danger)' : request.risk === 'Medium' ? 'var(--warning)' : 'var(--success)',
                        border: `1px solid ${request.risk === 'High' ? 'var(--danger-border)' : request.risk === 'Medium' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {request.risk === 'High' && <Shield className="w-3 h-3" strokeWidth={2.5} />}
                        {request.risk}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(request.submitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right' }}>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                        }}
                        style={{ height: '32px', width: '32px', padding: 0 }}
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div style={{ padding: '64px 16px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                No requests found
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
                Try adjusting your filters or search query
              </p>
            </div>
          )}

          {filteredRequests.length > 0 && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--surface)'
            }}>
              <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                Showing <span style={{ fontWeight: '500', color: 'var(--text)' }}>{filteredRequests.length}</span> of <span style={{ fontWeight: '500', color: 'var(--text)' }}>{combinedRequests.length}</span> requests
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Refined Detail Panel - Two Column Layout */}
      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent 
          className="overflow-y-auto" 
          style={{ 
            backgroundColor: 'var(--bg)', 
            borderLeft: '1px solid var(--border)', 
            width: '100%', 
            maxWidth: '900px', 
            padding: 0
          }}
        >
          {selectedRequest && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Hidden accessibility elements */}
              <SheetTitle className="sr-only">
                Request {selectedRequest.id} Details
              </SheetTitle>
              <SheetDescription className="sr-only">
                View and manage access request {selectedRequest.id}
              </SheetDescription>
              
              {/* Header with badges */}
              <div style={{ 
                padding: '24px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--surface)'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <h2 style={{ 
                    color: 'var(--text)', 
                    fontSize: '20px', 
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {selectedRequest.id}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    Access request details and approval options
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge style={{ 
                    backgroundColor: selectedRequest.status === 'Approved' ? 'var(--success-bg)' : selectedRequest.status === 'Pending' ? 'var(--warning-bg)' : selectedRequest.status === 'Rejected' ? 'var(--danger-bg)' : 'var(--info-bg)',
                    color: selectedRequest.status === 'Approved' ? 'var(--success)' : selectedRequest.status === 'Pending' ? 'var(--warning)' : selectedRequest.status === 'Rejected' ? 'var(--danger)' : 'var(--primary)',
                    border: `1px solid ${selectedRequest.status === 'Approved' ? 'var(--success-border)' : selectedRequest.status === 'Pending' ? 'var(--warning-border)' : selectedRequest.status === 'Rejected' ? 'var(--danger-border)' : 'var(--info-border)'}`,
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    borderRadius: '8px'
                  }}>
                    {selectedRequest.status}
                  </Badge>
                  <Badge style={{ 
                    backgroundColor: selectedRequest.risk === 'High' ? 'var(--danger-bg)' : selectedRequest.risk === 'Medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: selectedRequest.risk === 'High' ? 'var(--danger)' : selectedRequest.risk === 'Medium' ? 'var(--warning)' : 'var(--success)',
                    border: `1px solid ${selectedRequest.risk === 'High' ? 'var(--danger-border)' : selectedRequest.risk === 'Medium' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {selectedRequest.risk === 'High' && <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    {selectedRequest.risk} Risk
                  </Badge>
                </div>
              </div>

              {/* Scrollable content area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', paddingBottom: selectedRequest.status === 'Pending' ? '100px' : '24px' }}>
                {/* Sticky SoD Banner */}
                {selectedRequest.sodHits > 0 && sodConflicts[selectedRequest.id] && (
                  <SoDBanner 
                    conflictCount={selectedRequest.sodHits}
                    onReviewClick={() => setShowConflictsModal(true)}
                  />
                )}

                {/* Two Column Layout */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 380px',
                  gap: '24px'
                }}>
                  {/* Left Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Request Summary Card */}
                    <Card style={{ 
                      padding: '20px', 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'var(--muted-foreground)', 
                        marginBottom: '16px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        Requestor Information
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ 
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {selectedRequest.user.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                            {selectedRequest.user}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                            {selectedRequest.department}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        padding: '16px', 
                        backgroundColor: 'var(--accent)', 
                        borderRadius: '8px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>
                          Resource Requested
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>
                          {selectedRequest.resource}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Submitted
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>
                            {new Date(selectedRequest.submitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Approver
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>
                            {selectedRequest.approver}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Workflow Timeline */}
                    <Card style={{ 
                      padding: '20px', 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'var(--muted-foreground)', 
                        marginBottom: '16px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        Workflow Timeline
                      </h3>
                      <Timeline 
                        events={[
                          {
                            id: '1',
                            status: 'completed',
                            title: 'Request Submitted',
                            description: `${selectedRequest.user} submitted the request`,
                            timestamp: new Date(selectedRequest.submitted).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })
                          },
                          {
                            id: '2',
                            status: selectedRequest.status === 'Pending' ? 'active' : 'completed',
                            title: selectedRequest.status === 'Pending' ? 'Pending Review' : 'Reviewed',
                            description: `Assigned to ${selectedRequest.approver}`,
                            timestamp: selectedRequest.status !== 'Pending' ? new Date(new Date(selectedRequest.submitted).getTime() + 7200000).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            }) : undefined
                          },
                          {
                            id: '3',
                            status: selectedRequest.status === 'Approved' || selectedRequest.status === 'Rejected' ? 'completed' : 'pending',
                            title: 'Decision Made',
                            description: selectedRequest.status === 'Approved' ? 'Request approved' : selectedRequest.status === 'Rejected' ? 'Request rejected' : 'Awaiting decision'
                          }
                        ]}
                      />
                    </Card>

                    {/* Activity Log */}
                    <Card style={{ 
                      padding: '20px', 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'var(--muted-foreground)', 
                        marginBottom: '16px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        Business Justification
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {selectedRequest.justification}
                      </p>
                    </Card>
                  </div>

                  {/* Right Rail */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Provisioning summary */}
                  <Card style={{ 
                    padding: '16px', 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <h3 style={{ 
                      fontSize: '13px', 
                      fontWeight: '600', 
                      color: 'var(--muted-foreground)', 
                      marginBottom: '12px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Provisioning Status
                    </h3>
                    {(() => {
                      const meta = provisioningMetaFor(selectedRequest.provisioningStatus);
                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Badge
                              style={{
                                backgroundColor: meta.bg,
                                color: meta.color,
                                border: `1px solid ${meta.border}`,
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                textTransform: 'none',
                              }}
                            >
                              {meta.label}
                            </Badge>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {meta.description}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <div>
                              <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', marginBottom: '4px', color: 'var(--muted-foreground)' }}>
                                Started
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                                {formatProvisioningTimestamp(selectedRequest.provisioningStartedAt)}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', marginBottom: '4px', color: 'var(--muted-foreground)' }}>
                                Completed
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                                {formatProvisioningTimestamp(selectedRequest.provisioningCompletedAt)}
                              </div>
                            </div>
                          </div>
                          {selectedRequest.provisioningError && (
                            <div style={{ 
                              marginTop: '12px', 
                              fontSize: '12px', 
                              color: 'var(--danger)', 
                              backgroundColor: 'var(--danger-bg)', 
                              border: '1px solid var(--danger-border)',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              gap: '8px',
                              alignItems: 'flex-start'
                            }}>
                              <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
                              <div>
                                <div style={{ fontWeight: 600 }}>Connector error</div>
                                <div style={{ color: 'var(--danger)' }}>{selectedRequest.provisioningError}</div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </Card>

                    {/* Risk Panel */}
                    <Card style={{ 
                      padding: '16px', 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'var(--muted-foreground)', 
                        marginBottom: '12px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        Risk Assessment
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '16px',
                        backgroundColor: selectedRequest.risk === 'High' ? 'var(--danger-bg)' : selectedRequest.risk === 'Medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
                        borderRadius: '8px',
                        border: `1px solid ${selectedRequest.risk === 'High' ? 'var(--danger-border)' : selectedRequest.risk === 'Medium' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: selectedRequest.risk === 'High' ? 'var(--danger)' : selectedRequest.risk === 'Medium' ? 'var(--warning)' : 'var(--success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}>
                          <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                            {selectedRequest.risk} Risk
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {selectedRequest.risk === 'High' ? 'Requires approval' : selectedRequest.risk === 'Medium' ? 'Standard review' : 'Low impact'}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        <strong style={{ color: 'var(--text)', fontWeight: '600' }}>Factors:</strong> Sensitive resource, privileged access level
                      </div>
                    </Card>

                    {/* SoD Conflicts */}
                    {selectedRequest.sodHits > 0 && sodConflicts[selectedRequest.id] && (
                      <Card style={{ 
                        padding: '16px', 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '10px',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <h3 style={{ 
                          fontSize: '13px', 
                          fontWeight: '600', 
                          color: 'var(--muted-foreground)', 
                          marginBottom: '12px', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.05em' 
                        }}>
                          SoD Conflicts ({selectedRequest.sodHits})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {sodConflicts[selectedRequest.id].slice(0, 1).map(conflict => (
                            <ConflictChip
                              key={conflict.id}
                              conflictingAccess={conflict.conflictingAccess}
                              reason={conflict.reason}
                              policy={conflict.policy}
                              policyLink={conflict.policyLink}
                            />
                          ))}
                          {sodConflicts[selectedRequest.id].length > 1 && (
                            <Button
                              variant="ghost"
                              onClick={() => setShowConflictsModal(true)}
                              style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--danger)',
                                height: '32px',
                                justifyContent: 'flex-start'
                              }}
                            >
                              View {sodConflicts[selectedRequest.id].length - 1} more conflict{sodConflicts[selectedRequest.id].length - 1 > 1 ? 's' : ''}
                            </Button>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Usage Signals */}
                    <Card style={{ 
                      padding: '16px', 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'var(--muted-foreground)', 
                        marginBottom: '12px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        Usage Signals
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Activity className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} strokeWidth={2} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                              Last Used
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Never (new access)
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} strokeWidth={2} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>
                              Peer Coverage
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              73% of {selectedRequest.department} have this
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Related Items */}
                    <Card style={{ 
                      padding: '16px', 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h3 style={{ 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: 'var(--muted-foreground)', 
                        marginBottom: '12px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em' 
                      }}>
                        Related Items
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            // Navigate to the user's identity page
                            const userId = selectedRequest.user.toLowerCase().replace(/\s+/g, '-');
                            navigate(`/identities/${userId}`);
                          }}
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-secondary)',
                            height: '32px',
                            justifyContent: 'flex-start',
                            transition: 'all 120ms var(--ease-out)'
                          }}
                          className="hover:bg-accent hover:text-text"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" strokeWidth={2} />
                          User Profile
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            // Navigate to identities page with access history focus
                            const userId = selectedRequest.user.toLowerCase().replace(/\s+/g, '-');
                            navigate(`/identities/${userId}`, { state: { tab: 'access-history' } });
                          }}
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--text-secondary)',
                            height: '32px',
                            justifyContent: 'flex-start',
                            transition: 'all 120ms var(--ease-out)'
                          }}
                          className="hover:bg-accent hover:text-text"
                        >
                          <ChevronRight className="w-4 h-4 mr-2" strokeWidth={2} />
                          Access History
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Sticky Decision Bar */}
              {selectedRequest.status === 'Pending' && (
                <DecisionBar
                  onApprove={handleApprove}
                  onReject={() => setShowRejectionDialog(true)}
                  onDelegate={handleDelegate}
                  slaHours={8}
                />
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Conflicts Modal */}
      {selectedRequest && sodConflicts[selectedRequest.id] && (
        <ConflictsModal
          open={showConflictsModal}
          onOpenChange={setShowConflictsModal}
          conflicts={sodConflicts[selectedRequest.id]}
          requestId={selectedRequest.id}
        />
      )}

      {/* Rejection Dialog */}
      {selectedRequest && (
        <RejectionDialog
          open={showRejectionDialog}
          onOpenChange={setShowRejectionDialog}
          onConfirm={handleReject}
          requestId={selectedRequest.id}
        />
      )}

      {/* New Request Dialog */}
      <NewRequestDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />

      {/* Filters Panel */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent style={{ 
          backgroundColor: 'var(--bg)', 
          borderLeft: '1px solid var(--border)', 
          width: '100%', 
          maxWidth: '400px',
          padding: '24px'
        }}>
          <SheetHeader style={{ marginBottom: '24px' }}>
            <SheetTitle style={{ color: 'var(--text)', fontSize: '20px', fontWeight: '600' }}>
              Filters
            </SheetTitle>
            <SheetDescription style={{ fontSize: '13px' }}>
              Filter requests by status, risk level, and department
            </SheetDescription>
            {activeFiltersCount > 0 && (
              <div className="pt-2">
                <Button 
                  variant="ghost" 
                  onClick={clearAllFilters}
                  style={{ 
                    height: '32px', 
                    fontSize: '13px',
                    color: 'var(--primary)'
                  }}
                >
                  Clear All ({activeFiltersCount})
                </Button>
              </div>
            )}
          </SheetHeader>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Status Filters */}
            <div>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--text)', 
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Pending', 'In Progress', 'Approved', 'Rejected'].map((status) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={() => toggleFilter('status', status)}
                    />
                    <Label 
                      htmlFor={`status-${status}`}
                      style={{ 
                        fontSize: '14px', 
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1
                      }}
                    >
                      <span style={{ flex: 1 }}>{status}</span>
                      <Badge style={{ 
                        backgroundColor: status === 'Approved' ? 'var(--success-bg)' : status === 'Pending' ? 'var(--warning-bg)' : status === 'Rejected' ? 'var(--danger-bg)' : 'var(--info-bg)',
                        color: status === 'Approved' ? 'var(--success)' : status === 'Pending' ? 'var(--warning)' : status === 'Rejected' ? 'var(--danger)' : 'var(--primary)',
                        border: `1px solid ${status === 'Approved' ? 'var(--success-border)' : status === 'Pending' ? 'var(--warning-border)' : status === 'Rejected' ? 'var(--danger-border)' : 'var(--info-border)'}`,
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {combinedRequests.filter(r => r.status === status).length}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Level Filters */}
            <div>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--text)', 
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Risk Level
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['High', 'Medium', 'Low'].map((risk) => (
                  <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <Checkbox
                      id={`risk-${risk}`}
                      checked={riskFilters.includes(risk)}
                      onCheckedChange={() => toggleFilter('risk', risk)}
                    />
                    <Label 
                      htmlFor={`risk-${risk}`}
                      style={{ 
                        fontSize: '14px', 
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1
                      }}
                    >
                      <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {risk === 'High' && <Shield className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} strokeWidth={2.5} />}
                        {risk}
                      </span>
                      <Badge style={{ 
                        backgroundColor: risk === 'High' ? 'var(--danger-bg)' : risk === 'Medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
                        color: risk === 'High' ? 'var(--danger)' : risk === 'Medium' ? 'var(--warning)' : 'var(--success)',
                        border: `1px solid ${risk === 'High' ? 'var(--danger-border)' : risk === 'Medium' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {combinedRequests.filter(r => r.risk === risk).length}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Filters */}
            <div>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--text)', 
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Department
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Finance', 'IT Operations', 'Sales', 'Human Resources'].map((dept) => (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={departmentFilters.includes(dept)}
                      onCheckedChange={() => toggleFilter('department', dept)}
                    />
                    <Label 
                      htmlFor={`dept-${dept}`}
                      style={{ 
                        fontSize: '14px', 
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1
                      }}
                    >
                      <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} strokeWidth={2} />
                        {dept}
                      </span>
                      <Badge variant="outline" style={{ 
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {combinedRequests.filter(r => r.department === dept).length}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div style={{ 
              marginTop: '32px',
              padding: '16px',
              backgroundColor: 'var(--accent)',
              borderRadius: '10px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: '600', 
                color: 'var(--muted-foreground)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                Active Filters
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {statusFilters.map(filter => (
                  <Badge 
                    key={filter}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {filter}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      strokeWidth={2.5}
                      onClick={() => toggleFilter('status', filter)}
                    />
                  </Badge>
                ))}
                {riskFilters.map(filter => (
                  <Badge 
                    key={filter}
                    style={{
                      backgroundColor: 'var(--warning)',
                      color: 'white',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {filter} Risk
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      strokeWidth={2.5}
                      onClick={() => toggleFilter('risk', filter)}
                    />
                  </Badge>
                ))}
                {departmentFilters.map(filter => (
                  <Badge 
                    key={filter}
                    style={{
                      backgroundColor: 'var(--info)',
                      color: 'white',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {filter}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      strokeWidth={2.5}
                      onClick={() => toggleFilter('department', filter)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}