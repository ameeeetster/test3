import React, { useState, lazy, Suspense } from 'react';
import { Search, Filter, Download, CheckSquare, XSquare, Eye, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Checkbox } from '../components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { FilterChip } from '../components/FilterChip';
import { toast } from 'sonner@2.0.3';

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
}

// Mock data
const mockRequests: ApprovalRequest[] = [
  {
    id: 'REQ-2847',
    requester: {
      name: 'Alex Thompson',
      email: 'alex.thompson@company.com',
      department: 'Engineering'
    },
    item: {
      name: 'AWS Production',
      type: 'Application',
      icon: '☁️',
      scope: 'Admin'
    },
    status: 'Pending',
    risk: 'High',
    age: '2d',
    slaRemaining: '2d left',
    submittedAt: '2 days ago',
    businessJustification: 'Need access to production AWS environment to debug critical infrastructure issues affecting customer deployments. This is blocking P0 incidents.',
    duration: 'Permanent',
    sodConflicts: 2,
    peerCoverage: 85,
    lastUsed: 'Never',
    usageData: [5, 8, 12, 15, 11, 9, 14, 18, 22, 19, 16, 20, 25, 23, 21, 24, 28, 26, 24, 27, 30, 28, 25, 29, 32],
    impactItems: [
      { type: 'role', name: 'AWS Administrator', scope: 'Full Access' },
      { type: 'entitlement', name: 'EC2 Management', scope: 'Create, Delete' },
      { type: 'entitlement', name: 'RDS Admin', scope: 'Full Control' }
    ]
  },
  {
    id: 'REQ-2846',
    requester: {
      name: 'Maria Garcia',
      email: 'maria.garcia@company.com',
      department: 'Finance'
    },
    item: {
      name: 'Financial Approver',
      type: 'Role',
      icon: '💰',
      scope: 'Write'
    },
    status: 'Pending',
    risk: 'Medium',
    age: '1d',
    slaRemaining: '3d left',
    submittedAt: '1 day ago',
    businessJustification: 'Temporary coverage for Jane Doe who is on medical leave. Need to approve invoices and purchase orders for the department.',
    duration: '14 days',
    sodConflicts: 0,
    peerCoverage: 92,
    lastUsed: '3 days ago',
    usageData: [12, 15, 14, 13, 16, 18, 17, 15, 14, 16, 19, 20, 18, 17, 19, 21, 20, 19, 18, 20, 22],
    impactItems: [
      { type: 'role', name: 'Financial Approver', scope: 'Write' }
    ]
  },
  {
    id: 'REQ-2845',
    requester: {
      name: 'James Wilson',
      email: 'james.wilson@company.com',
      department: 'Sales'
    },
    item: {
      name: 'Salesforce Admin',
      type: 'Application',
      icon: '⚡',
      scope: 'Admin'
    },
    status: 'Pending',
    risk: 'Critical',
    age: '4h',
    slaRemaining: '1d 20h left',
    submittedAt: '4 hours ago',
    businessJustification: 'Promoted to Sales Operations Manager. Require admin access to manage territories, custom fields, and automation workflows.',
    duration: 'Permanent',
    sodConflicts: 3,
    peerCoverage: 78,
    lastUsed: 'N/A',
    usageData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    impactItems: [
      { type: 'application', name: 'Salesforce', scope: 'Admin' },
      { type: 'entitlement', name: 'Custom Objects', scope: 'Manage' },
      { type: 'entitlement', name: 'Territory Management', scope: 'Full' }
    ]
  },
  {
    id: 'REQ-2844',
    requester: {
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      department: 'HR'
    },
    item: {
      name: 'Employee Records',
      type: 'Entitlement',
      icon: '👥',
      scope: 'Read'
    },
    status: 'Pending',
    risk: 'Low',
    age: '6h',
    slaRemaining: '1d 18h left',
    submittedAt: '6 hours ago',
    businessJustification: 'Working on quarterly headcount report and compensation analysis. Need read access to employee database for reporting purposes.',
    duration: '7 days',
    sodConflicts: 0,
    peerCoverage: 95,
    lastUsed: '1 month ago',
    usageData: [8, 10, 9, 11, 10, 12, 11, 10, 9, 11, 13, 12, 11, 10, 12, 14, 13, 12, 11, 13],
    impactItems: [
      { type: 'entitlement', name: 'Employee Records', scope: 'Read' }
    ]
  },
  {
    id: 'REQ-2843',
    requester: {
      name: 'David Kim',
      email: 'david.kim@company.com',
      department: 'Security'
    },
    item: {
      name: 'Security Auditor',
      type: 'Role',
      icon: '🛡️',
      scope: 'Read'
    },
    status: 'Pending',
    risk: 'Medium',
    age: '12h',
    slaRemaining: '1d 12h left',
    submittedAt: '12 hours ago',
    businessJustification: 'Conducting annual security audit. Need read-only access to review security controls, access logs, and compliance configurations.',
    duration: '30 days',
    sodConflicts: 1,
    peerCoverage: 88,
    lastUsed: '6 months ago',
    usageData: [3, 4, 5, 4, 3, 5, 6, 5, 4, 6, 7, 6, 5, 6, 8, 7, 6, 7, 9, 8],
    impactItems: [
      { type: 'role', name: 'Security Auditor', scope: 'Read' },
      { type: 'entitlement', name: 'Audit Logs', scope: 'View' }
    ]
  }
];

const tabs = [
  { value: 'all', label: 'All', count: 12 },
  { value: 'pending', label: 'Pending', count: 5 },
  { value: 'delegated', label: 'Delegated', count: 2 },
  { value: 'completed', label: 'Completed', count: 5 },
  { value: 'high-risk', label: 'High Risk', count: 3 }
];

export function ApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<{ label: string; value: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter requests based on tab and search
  const filteredRequests = mockRequests.filter(req => {
    if (selectedTab === 'pending' && req.status !== 'Pending') return false;
    if (selectedTab === 'high-risk' && !['High', 'Critical'].includes(req.risk)) return false;
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
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRequests(newSelected);
  };

  const handleRowClick = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const handleApprove = (id: string, withChanges?: boolean) => {
    const message = withChanges ? 'Request approved with modifications' : 'Request approved successfully';
    toast.success(message, {
      description: `${id} has been approved and will be provisioned shortly.`
    });
    setDrawerOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (id: string, reason: string) => {
    toast.error('Request rejected', {
      description: `${id} has been rejected. The requester will be notified.`
    });
    setDrawerOpen(false);
    setSelectedRequest(null);
  };

  const handleDelegate = (id: string, delegateTo?: string) => {
    toast.info('Request delegated', {
      description: `${id} has been delegated to another approver.`
    });
    setDrawerOpen(false);
    setSelectedRequest(null);
  };

  const handleBulkApprove = () => {
    toast.success(`${selectedRequests.size} requests approved`, {
      description: 'The selected requests have been approved.'
    });
    setSelectedRequests(new Set());
  };

  const handleBulkReject = () => {
    toast.error(`${selectedRequests.size} requests rejected`, {
      description: 'The selected requests have been rejected.'
    });
    setSelectedRequests(new Set());
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
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {filters.length > 0 && (
                    <Badge 
                      className="ml-1 px-1.5 py-0.5 h-5"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      {filters.length}
                    </Badge>
                  )}
                </Button>
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

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="py-16 text-center">
              <CheckSquare 
                className="w-12 h-12 mx-auto mb-4" 
                style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} 
              />
              <h3 style={{ 
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '8px'
              }}>
                No approvals found
              </h3>
              <p style={{ 
                fontSize: 'var(--text-body)',
                color: 'var(--muted-foreground)',
                marginBottom: '16px'
              }}>
                {searchQuery ? 'Try adjusting your search or filters' : 'All caught up! No pending approvals at the moment.'}
              </p>
              {selectedTab !== 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedTab('pending')}
                >
                  View Pending Approvals
                </Button>
              )}
            </div>
          )}
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
    </div>
  );
}