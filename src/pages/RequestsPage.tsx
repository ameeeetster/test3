import React, { useState, useMemo } from 'react';
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

const requests = [
  {
    id: 'REQ-001',
    user: 'Jessica Smith',
    department: 'Finance',
    resource: 'Oracle ERP - Accounts Payable Read',
    status: 'Pending',
    risk: 'High',
    submitted: '2025-09-29T14:30:00',
    sodHits: 2,
    justification: 'Need access to process quarterly financial reports and reconciliation tasks for Q4 fiscal closing period.',
    approver: 'Michael Chen'
  },
  {
    id: 'REQ-002',
    user: 'Raj Kumar',
    department: 'IT Operations',
    resource: 'SharePoint Finance Site - Editors',
    status: 'Pending',
    risk: 'Medium',
    submitted: '2025-09-29T11:15:00',
    sodHits: 0,
    justification: 'Required to maintain and update financial documentation for quarterly reports.',
    approver: 'Sarah Johnson'
  },
  {
    id: 'REQ-003',
    user: 'Maria Chen',
    department: 'Sales',
    resource: 'Salesforce - System Administrator',
    status: 'In Progress',
    risk: 'Low',
    submitted: '2025-09-28T16:45:00',
    sodHits: 0,
    justification: 'Promoted to Sales Operations Manager role. Need admin access to configure workflows.',
    approver: 'David Park'
  },
  {
    id: 'REQ-004',
    user: 'Alex Johnson',
    department: 'Human Resources',
    resource: 'Workday - HR Business Partner',
    status: 'Approved',
    risk: 'Low',
    submitted: '2025-09-27T09:20:00',
    sodHits: 0,
    justification: 'New HRBP role requires access to employee records for assigned business units.',
    approver: 'Lisa Anderson'
  },
  {
    id: 'REQ-005',
    user: 'Sam Patel',
    department: 'Finance',
    resource: 'AWS Production - Admin Console',
    status: 'Rejected',
    risk: 'High',
    submitted: '2025-09-26T13:10:00',
    sodHits: 1,
    justification: 'Need production access to troubleshoot billing integration issues.',
    approver: 'Michael Chen'
  },
];

const stats = [
  { label: 'Total Requests', value: '156', change: '+12 this week', icon: Calendar, color: '#4F46E5' },
  { label: 'Pending Approval', value: '24', change: '3 require attention', icon: Clock, color: '#F59E0B' },
  { label: 'High Risk', value: '7', change: '+2 today', icon: AlertTriangle, color: '#EF4444' },
  { label: 'Avg. Approval Time', value: '4.2h', change: '−15% vs last month', icon: CheckCircle2, color: '#10B981' },
];

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

export function RequestsPage() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<typeof requests[0] | null>(null);
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

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Tab filters
      if (activeTab === 'pending' && request.status !== 'Pending') return false;
      if (activeTab === 'in-progress' && request.status !== 'In Progress') return false;
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
  }, [activeTab, searchQuery, statusFilters, riskFilters, departmentFilters]);

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

  const handleApprove = () => {
    if (selectedRequest) {
      toast.success('Request Approved', {
        description: `${selectedRequest.id} has been approved successfully.`,
        action: {
          label: 'View Audit Trail',
          onClick: () => console.log('View audit trail')
        }
      });
      setSelectedRequest(null);
    }
  };

  const handleReject = (reason: string) => {
    if (selectedRequest) {
      toast.error('Request Rejected', {
        description: `${selectedRequest.id} has been rejected. Reason: ${reason}`,
        action: {
          label: 'View Audit Trail',
          onClick: () => console.log('View audit trail')
        }
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
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index}
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
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList style={{ backgroundColor: 'var(--accent)', padding: '4px', borderRadius: '10px', height: '40px' }}>
                <TabsTrigger value="all" style={{ borderRadius: '8px', fontSize: '13px' }}>All Requests</TabsTrigger>
                <TabsTrigger value="pending" style={{ borderRadius: '8px', fontSize: '13px' }}>Pending</TabsTrigger>
                <TabsTrigger value="in-progress" style={{ borderRadius: '8px', fontSize: '13px' }}>In Progress</TabsTrigger>
                <TabsTrigger value="high-risk" style={{ borderRadius: '8px', fontSize: '13px' }}>High Risk</TabsTrigger>
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
            <Table>
              <TableHeader style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <TableRow>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Request ID</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Requestor</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Resource</TableHead>
                  <TableHead style={{ height: '48px', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Status</TableHead>
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
                Showing <span style={{ fontWeight: '500', color: 'var(--text)' }}>{filteredRequests.length}</span> of <span style={{ fontWeight: '500', color: 'var(--text)' }}>{requests.length}</span> requests
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
                        {requests.filter(r => r.status === status).length}
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
                        {requests.filter(r => r.risk === risk).length}
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
                        {requests.filter(r => r.department === dept).length}
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