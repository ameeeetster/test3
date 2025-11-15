import React, { useMemo, useState, lazy, Suspense, useEffect } from 'react';
import { Search, Filter, Download, CheckSquare, XSquare, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Checkbox } from '../components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { FilterChip } from '../components/FilterChip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useApprovals } from '../contexts/ApprovalsContext';
import { ApprovalChanges } from '../components/ApproveWithChangesDialog';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';

// Lazy load the heavy drawer component
const EnhancedApprovalDrawer = lazy(() => 
  import('../components/EnhancedApprovalDrawer').then(module => ({
    default: module.EnhancedApprovalDrawer
  }))
);

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
    icon?: string;
    scope?: string;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  age: string;
  slaRemaining: string;
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
  approvedAt?: string | null;
  completedAt?: string | null;
  forUserId?: string | null;
}

export function ApprovalsPage() {
  const { requests: allRequests, updateStatus } = useApprovals();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<{ label: string; value: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [savedViews, setSavedViews] = useState<Array<{ name: string; state: any }>>([]);
  const [selectedView, setSelectedView] = useState<string>('');
  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 300);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const raw = localStorage.getItem('views:approvals');
    if (raw) {
      try { setSavedViews(JSON.parse(raw)); } catch {}
    }
  }, []);
  
  // Filter states
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [riskFilters, setRiskFilters] = useState<string[]>([]);
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);

  const tabs = useMemo(() => ([
    { value: 'pending', label: 'Pending', count: allRequests.filter(r => r.status === 'Pending').length },
    { value: 'approved', label: 'Approved', count: allRequests.filter(r => r.status === 'Approved').length },
    { value: 'rejected', label: 'Rejected', count: allRequests.filter(r => r.status === 'Rejected').length },
    { value: 'high-risk', label: 'High Risk', count: allRequests.filter(r => ['High','Critical'].includes(r.risk)).length }
  ]), [allRequests]);
  
  const saveCurrentView = () => {
    const name = window.prompt('Save view as:');
    if (!name) return;
    const state = {
      selectedTab,
      searchQuery,
      statusFilters,
      riskFilters,
      departmentFilters,
    };
    const existing = savedViews.filter(v => v.name !== name);
    const next = [...existing, { name, state }];
    setSavedViews(next);
    localStorage.setItem('views:approvals', JSON.stringify(next));
    setSelectedView(name);
    toast.success('View saved');
  };
  const applyView = (name: string) => {
    setSelectedView(name);
    const v = savedViews.find(v => v.name === name);
    if (!v) return;
    setSelectedTab(v.state.selectedTab || 'pending');
    setSearchQuery(v.state.searchQuery || '');
    setStatusFilters(v.state.statusFilters || []);
    setRiskFilters(v.state.riskFilters || []);
    setDepartmentFilters(v.state.departmentFilters || []);
  };
  const deleteView = () => {
    if (!selectedView) return;
    const next = savedViews.filter(v => v.name !== selectedView);
    setSavedViews(next);
    localStorage.setItem('views:approvals', JSON.stringify(next));
    setSelectedView('');
    toast.message('View deleted');
  };
  
  // Filter requests based on tab, search, and filters
  const filteredRequests = allRequests.filter(req => {
    // Tab filters
    if (selectedTab === 'pending' && req.status !== 'Pending') return false;
    if (selectedTab === 'approved' && req.status !== 'Approved') return false;
    if (selectedTab === 'rejected' && req.status !== 'Rejected') return false;
    if (selectedTab === 'high-risk' && !['High', 'Critical'].includes(req.risk)) return false;
    
    // Status filters
    if (statusFilters.length > 0 && !statusFilters.includes(req.status)) return false;
    
    // Risk filters
    if (riskFilters.length > 0 && !riskFilters.includes(req.risk)) return false;
    
    // Department filters
    if (departmentFilters.length > 0 && !departmentFilters.includes(req.requester.department)) return false;
    
    // Search query
    if (searchQuery && !req.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.requester.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(filteredRequests.map(r => r.id)));
    } else {
      setSelectedRequests(new Set());
    }
  };

  const handleSelectRequest = (id: string, checked: boolean) => {
    setSelectedRequests(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  const handleRowClick = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleApprove = async (id: string, withChanges?: boolean, changes?: ApprovalChanges) => {
    try {
      console.log('🔄 Approving request:', id, withChanges ? 'with changes' : 'as requested', changes);
      
      // If there are changes, update the request first, then approve
      if (withChanges && changes) {
        // Update request with modifications
        const { RequestsService } = await import('../services/requestsService');
        
        const updates: any = {};
        if (changes.modifiedAccessLevel) {
          // Extract the resource name and update with new access level
          const selectedRequest = allRequests.find(r => r.id === id);
          if (selectedRequest) {
            const resourceParts = selectedRequest.item.name.split(' • ');
            updates.resource_name = resourceParts[0] + ' • ' + changes.modifiedAccessLevel;
          }
        }
        if (changes.modifiedDurationDays !== undefined) {
          updates.duration_days = changes.modifiedDurationDays;
        }
        
        // Add approval comments/reason to business justification or notes
        if (changes.reasonForChanges || changes.comments) {
          const commentText = [
            changes.reasonForChanges && `Approval Changes: ${changes.reasonForChanges}`,
            changes.comments && `Additional Comments: ${changes.comments}`
          ].filter(Boolean).join('\n\n');
          
          // Append to existing justification
          const selectedRequest = allRequests.find(r => r.id === id);
          if (selectedRequest) {
            updates.business_justification = selectedRequest.businessJustification + '\n\n--- APPROVAL MODIFICATIONS ---\n' + commentText;
          }
        }
        
        // Update the request with modifications
        if (Object.keys(updates).length > 0) {
          await RequestsService.update(id, updates);
          console.log('✅ Request updated with modifications:', updates);
        }
      }
      
      // Approve the request
      await updateStatus(id, 'Approved');
      console.log('✅ Request approved successfully:', id);
      
      const message = withChanges 
        ? 'Request approved with modifications' 
        : 'Request approved successfully';
      const description = withChanges && changes?.reasonForChanges
        ? `${id} has been approved with modifications: ${changes.reasonForChanges.substring(0, 50)}...`
        : `${id} has been approved and will be provisioned shortly.`;
      
      toast.success(message, {
        description,
        duration: 5000
      });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('❌ Failed to approve request:', error);
      toast.error('Failed to approve request', {
        description: error?.message || 'An error occurred while approving the request. Please try again.'
      });
      // Don't close drawer on error so user can retry
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      console.log('🔄 Rejecting request:', id, 'Reason:', reason);
      await updateStatus(id, 'Rejected');
      console.log('✅ Request rejected successfully:', id);
      toast.error('Request rejected', {
        description: `${id} has been rejected. The requester will be notified.`
      });
      setDrawerOpen(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('❌ Failed to reject request:', error);
      toast.error('Failed to reject request', {
        description: error?.message || 'An error occurred while rejecting the request. Please try again.'
      });
      // Don't close drawer on error so user can retry
    }
  };

  const handleDelegate = (id: string, delegateTo?: string) => {
    toast.info('Request delegated', {
      description: `${id} has been delegated to another approver.`
    });
    setDrawerOpen(false);
    setSelectedRequest(null);
  };

  const handleBulkApprove = async () => {
    for (const id of selectedRequests) {
      await updateStatus(id, 'Approved');
    }
    toast.success(`${selectedRequests.size} requests approved`, {
      description: 'The selected requests have been approved.'
    });
    setSelectedRequests(new Set());
  };

  const handleBulkReject = async () => {
    for (const id of selectedRequests) {
      await updateStatus(id, 'Rejected');
    }
    toast.error(`${selectedRequests.size} requests rejected`, {
      description: 'The selected requests have been rejected.'
    });
    setSelectedRequests(new Set());
  };

  // Filter helper functions
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
      setter(state.filter(item => item !== value));
    } else {
      setter([...state, value]);
    }
  };

  const clearAllFilters = () => {
    setStatusFilters([]);
    setRiskFilters([]);
    setDepartmentFilters([]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'var(--danger)';
      case 'High': return 'var(--warning)';
      case 'Medium': return 'var(--info)';
      default: return 'var(--success)';
    }
  };

  const getRiskIcon = (risk: string) => {
    if (risk === 'Critical' || risk === 'High') {
      return <AlertTriangle className="w-3 h-3" />;
    }
    return <ShieldAlert className="w-3 h-3" />;
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8 max-w-[1320px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 style={{ 
                  fontSize: 'var(--text-display)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Approvals
                </h1>
                <p style={{ 
                  fontSize: 'var(--text-body)',
                  color: 'var(--muted-foreground)',
                  marginTop: '4px'
                }}>
                  Review and approve pending access requests
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleBulkApprove}
                  disabled={selectedRequests.size === 0}
                  className="gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Bulk Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={selectedRequests.size === 0}
                  className="gap-2"
                  style={{
                    borderColor: selectedRequests.size > 0 ? 'var(--danger)' : undefined,
                    color: selectedRequests.size > 0 ? 'var(--danger)' : undefined
                  }}
                >
                  <XSquare className="w-4 h-4" />
                  Bulk Deny
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge 
                      className="ml-1 px-1.5 py-0.5 h-5"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                {/* Saved Views */}
                <div className="flex items-center gap-2">
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
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-4">
              <SegmentedTabs
                tabs={tabs}
                value={selectedTab}
                onChange={setSelectedTab}
              />
            </div>

            {/* Toolbar */}
            <div className="space-y-3">
              {/* Search */}
              <div className="relative max-w-md">
                <Search 
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" 
                  style={{ color: 'var(--muted-foreground)' }} 
                />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  style={{ backgroundColor: 'var(--input-background)' }}
                />
              </div>

              {/* Filter Chips */}
              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.map((filter, index) => (
                    <FilterChip
                      key={index}
                      label={filter.label}
                      value={filter.value}
                      onRemove={() => {
                        setFilters(filters.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters([])}
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div 
            className="rounded-lg border overflow-hidden"
            style={{ 
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow 
                    className="border-b hover:bg-transparent"
                    style={{ 
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface)',
                      height: '44px'
                    }}
                  >
                    <TableHead className="sticky left-0" style={{ 
                      backgroundColor: 'var(--surface)',
                      width: '48px',
                      minWidth: '48px',
                      maxWidth: '48px',
                      zIndex: 15
                    }}>
                      <Checkbox
                        checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="sticky" style={{ 
                      backgroundColor: 'var(--surface)',
                      left: '48px',
                      width: '120px',
                      minWidth: '120px',
                      maxWidth: '120px',
                      boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)',
                      zIndex: 15,
                      overflow: 'hidden'
                    }}>ID</TableHead>
                    <TableHead style={{ minWidth: '200px' }}>Requester</TableHead>
                    <TableHead style={{ minWidth: '180px' }}>Item</TableHead>
                    <TableHead style={{ minWidth: '120px' }}>Type</TableHead>
                    <TableHead style={{ minWidth: '100px' }}>Status</TableHead>
                    <TableHead style={{ minWidth: '110px' }}>Risk</TableHead>
                    <TableHead style={{ minWidth: '100px' }}>Age/SLA</TableHead>
                    <TableHead style={{ minWidth: '120px' }}>Submitted</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    onClick={() => handleRowClick(request)}
                    className="cursor-pointer transition-all duration-150 border-b"
                    style={{ 
                      borderColor: 'var(--border)',
                      height: '46px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} className="sticky left-0" style={{ 
                      backgroundColor: 'var(--bg)',
                      width: '48px',
                      minWidth: '48px',
                      maxWidth: '48px',
                      zIndex: 15
                    }}>
                      <Checkbox
                        checked={selectedRequests.has(request.id)}
                        onCheckedChange={(checked) => handleSelectRequest(request.id, checked as boolean)}
                        aria-label={`Select ${request.id}`}
                      />
                    </TableCell>
                    <TableCell className="sticky" style={{ 
                      backgroundColor: 'var(--bg)',
                      left: '48px',
                      width: '120px',
                      minWidth: '120px',
                      maxWidth: '120px',
                      boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)',
                      zIndex: 15,
                      overflow: 'hidden'
                    }}>
                      <span style={{ 
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--primary)'
                      }}>
                        {request.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                            color: 'white',
                            fontSize: 'var(--text-xs)'
                          }}>
                            {request.requester.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div style={{ 
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--text)'
                          }}>
                            {request.requester.name}
                          </div>
                          <div style={{ 
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted-foreground)'
                          }}>
                            {request.requester.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ fontSize: '16px' }}>{request.item.icon}</span>
                        <span style={{ 
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)'
                        }}>
                          {request.item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {request.item.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        style={{
                          borderColor: request.status === 'Pending' ? 'var(--warning)' : 'var(--border)',
                          color: request.status === 'Pending' ? 'var(--warning)' : 'var(--text)',
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="gap-1"
                        style={{
                          borderColor: getRiskColor(request.risk),
                          color: getRiskColor(request.risk),
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {getRiskIcon(request.risk)}
                        {request.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {request.age}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--text-xs)',
                          color: request.slaRemaining.includes('left') ? 'var(--warning)' : 'var(--muted-foreground)'
                        }}>
                          {request.slaRemaining}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {request.submittedAt}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRowClick(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Empty / Loading State */}
          {bootLoading ? (
            <div className="p-4">
              <TableSkeleton rows={8} columns={8} />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No approvals found"
                description={
                  searchQuery
                    ? 'Try adjusting your search or filters.'
                    : 'All caught up! No pending approvals at the moment.'
                }
                actionLabel={selectedTab !== 'pending' ? 'View Pending' : undefined}
                onAction={selectedTab !== 'pending' ? () => setSelectedTab('pending') : undefined}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Approval Drawer */}
      {drawerOpen && selectedRequest && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <EnhancedApprovalDrawer
            request={selectedRequest}
            open={drawerOpen}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedRequest(null);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelegate={handleDelegate}
          />
        </Suspense>
      )}

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
              Filter approvals by status, risk level, and department
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
                letterSpacing: '0.5px'
              }}>
                Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Pending', 'Approved', 'Rejected'].map((status) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={() => toggleFilter('status', status)}
                    />
                    <Label 
                      htmlFor={`status-${status}`}
                      style={{ 
                        fontSize: '13px',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      {status}
                    </Label>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted-foreground)',
                      backgroundColor: 'var(--accent)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {allRequests.filter(req => req.status === status).length}
                    </span>
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
                letterSpacing: '0.5px'
              }}>
                Risk Level
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Critical', 'High', 'Medium', 'Low'].map((risk) => (
                  <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <Checkbox
                      id={`risk-${risk}`}
                      checked={riskFilters.includes(risk)}
                      onCheckedChange={() => toggleFilter('risk', risk)}
                    />
                    <Label 
                      htmlFor={`risk-${risk}`}
                      style={{ 
                        fontSize: '13px',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {getRiskIcon(risk)}
                      {risk}
                    </Label>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted-foreground)',
                      backgroundColor: 'var(--accent)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {allRequests.filter(req => req.risk === risk).length}
                    </span>
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
                letterSpacing: '0.5px'
              }}>
                Department
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Engineering', 'Finance', 'Sales', 'HR', 'Security'].map((dept) => (
                  <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0' }}>
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={departmentFilters.includes(dept)}
                      onCheckedChange={() => toggleFilter('department', dept)}
                    />
                    <Label 
                      htmlFor={`dept-${dept}`}
                      style={{ 
                        fontSize: '13px',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      {dept}
                    </Label>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted-foreground)',
                      backgroundColor: 'var(--accent)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {allRequests.filter(req => req.requester.department === dept).length}
                    </span>
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
                    variant="secondary"
                    style={{ fontSize: '11px', height: '24px' }}
                  >
                    Status: {filter}
                  </Badge>
                ))}
                {riskFilters.map(filter => (
                  <Badge 
                    key={filter}
                    variant="secondary"
                    style={{ fontSize: '11px', height: '24px' }}
                  >
                    Risk: {filter}
                  </Badge>
                ))}
                {departmentFilters.map(filter => (
                  <Badge 
                    key={filter}
                    variant="secondary"
                    style={{ fontSize: '11px', height: '24px' }}
                  >
                    Dept: {filter}
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