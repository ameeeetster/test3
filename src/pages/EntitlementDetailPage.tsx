import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { RiskChip } from '../components/RiskChip';
import { ConflictChip } from '../components/ConflictChip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, ChevronDown, Save, Package, Users, AlertTriangle, 
  Shield, Calendar, Eye, TrendingUp, Activity, GitBranch,
  MoreVertical, X, Edit, XCircle, Sparkles, ExternalLink, ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data for entitlement
const mockEntitlement = {
  id: 'E-2001',
  name: 'Create Purchase Orders',
  app: 'Procurement',
  appIcon: '💰',
  type: 'Permission',
  description: 'Allows users to create and submit purchase orders up to $100,000. This entitlement provides access to the procurement workflow system and enables initiating purchasing processes.',
  owner: { name: 'Sarah Johnson', avatar: 'SJ' },
  assigned: 45,
  lastUsed: '2 hours ago',
  risk: 'High' as const,
  sodConflicts: 2,
  created: 'Jan 15, 2024',
  lastModified: '2 days ago',
  lastReview: '30 days ago',
  category: 'Financial Operations',
  criticality: 'High',
  dataAccess: ['Financial Records', 'Vendor Information', 'Budget Data'],
  relatedRoles: ['Financial Controller', 'Procurement Manager', 'Treasury Analyst']
};

// Mock users who have this entitlement
const mockAssignedUsers = [
  { id: 'U-1', name: 'Alice Cooper', email: 'alice.cooper@company.com', dept: 'Finance', role: 'Financial Controller', grantedDate: 'Jan 20, 2024', lastUsed: '2 hours ago', risk: 'Medium' as const, accessType: 'role' as const, grantedVia: 'Financial Controller' },
  { id: 'U-2', name: 'Bob Martinez', email: 'bob.martinez@company.com', dept: 'Procurement', role: 'Procurement Manager', grantedDate: 'Feb 5, 2024', lastUsed: '1 day ago', risk: 'Low' as const, accessType: 'role' as const, grantedVia: 'Procurement Manager' },
  { id: 'U-3', name: 'Carol White', email: 'carol.white@company.com', dept: 'Finance', role: 'Financial Analyst', grantedDate: 'Mar 12, 2024', lastUsed: '3 days ago', risk: 'Medium' as const, accessType: 'direct' as const, grantedVia: 'Direct Assignment' },
  { id: 'U-4', name: 'David Brown', email: 'david.brown@company.com', dept: 'Operations', role: 'Operations Lead', grantedDate: 'Jan 8, 2024', lastUsed: '5 hours ago', risk: 'High' as const, accessType: 'role' as const, grantedVia: 'Financial Controller' }
];

// Mock data for access paths
const mockDirectUsers = [
  { id: 'U-3', name: 'Carol White', email: 'carol.white@company.com', dept: 'Finance', lastUsed: '3 days ago' },
  { id: 'U-5', name: 'Edward Kim', email: 'edward.kim@company.com', dept: 'Procurement', lastUsed: '1 hour ago' },
  { id: 'U-6', name: 'Fiona Green', email: 'fiona.green@company.com', dept: 'Finance', lastUsed: '5 hours ago' },
  { id: 'U-7', name: 'George Harris', email: 'george.harris@company.com', dept: 'Operations', lastUsed: '2 days ago' },
  { id: 'U-8', name: 'Hannah Lee', email: 'hannah.lee@company.com', dept: 'Finance', lastUsed: '3 hours ago' },
  { id: 'U-9', name: 'Ian Rodriguez', email: 'ian.rodriguez@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
  { id: 'U-10', name: 'Julia Thompson', email: 'julia.thompson@company.com', dept: 'Finance', lastUsed: '4 hours ago' },
  { id: 'U-11', name: 'Kevin Wright', email: 'kevin.wright@company.com', dept: 'Operations', lastUsed: '6 hours ago' }
];

const mockRoleBasedUsers = {
  'Financial Controller': [
    { id: 'U-1', name: 'Alice Cooper', email: 'alice.cooper@company.com', dept: 'Finance', lastUsed: '2 hours ago' },
    { id: 'U-4', name: 'David Brown', email: 'david.brown@company.com', dept: 'Finance', lastUsed: '5 hours ago' },
    { id: 'U-12', name: 'Laura Martinez', email: 'laura.martinez@company.com', dept: 'Finance', lastUsed: '1 day ago' },
    { id: 'U-13', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', dept: 'Finance', lastUsed: '3 hours ago' },
    { id: 'U-14', name: 'Nina Patel', email: 'nina.patel@company.com', dept: 'Finance', lastUsed: '7 hours ago' },
    { id: 'U-15', name: 'Oliver Chen', email: 'oliver.chen@company.com', dept: 'Finance', lastUsed: '2 days ago' },
    { id: 'U-16', name: 'Patricia Davis', email: 'patricia.davis@company.com', dept: 'Finance', lastUsed: '4 hours ago' },
    { id: 'U-17', name: 'Quinn Roberts', email: 'quinn.roberts@company.com', dept: 'Finance', lastUsed: '1 hour ago' },
    { id: 'U-18', name: 'Rachel Kim', email: 'rachel.kim@company.com', dept: 'Finance', lastUsed: '5 hours ago' },
    { id: 'U-19', name: 'Steven Lee', email: 'steven.lee@company.com', dept: 'Finance', lastUsed: '8 hours ago' },
    { id: 'U-20', name: 'Tina Wang', email: 'tina.wang@company.com', dept: 'Finance', lastUsed: '3 days ago' },
    { id: 'U-21', name: 'Uma Singh', email: 'uma.singh@company.com', dept: 'Finance', lastUsed: '6 hours ago' }
  ],
  'Procurement Manager': [
    { id: 'U-2', name: 'Bob Martinez', email: 'bob.martinez@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
    { id: 'U-22', name: 'Victor Brown', email: 'victor.brown@company.com', dept: 'Procurement', lastUsed: '2 hours ago' },
    { id: 'U-23', name: 'Wendy Clark', email: 'wendy.clark@company.com', dept: 'Procurement', lastUsed: '4 hours ago' },
    { id: 'U-24', name: 'Xavier Moore', email: 'xavier.moore@company.com', dept: 'Procurement', lastUsed: '1 hour ago' },
    { id: 'U-25', name: 'Yolanda Taylor', email: 'yolanda.taylor@company.com', dept: 'Procurement', lastUsed: '3 hours ago' },
    { id: 'U-26', name: 'Zachary White', email: 'zachary.white@company.com', dept: 'Procurement', lastUsed: '5 hours ago' },
    { id: 'U-27', name: 'Amy Wilson', email: 'amy.wilson@company.com', dept: 'Procurement', lastUsed: '2 days ago' },
    { id: 'U-28', name: 'Brian Anderson', email: 'brian.anderson@company.com', dept: 'Procurement', lastUsed: '6 hours ago' },
    { id: 'U-29', name: 'Catherine Lewis', email: 'catherine.lewis@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
    { id: 'U-30', name: 'Daniel Harris', email: 'daniel.harris@company.com', dept: 'Procurement', lastUsed: '7 hours ago' },
    { id: 'U-31', name: 'Emma Thompson', email: 'emma.thompson@company.com', dept: 'Procurement', lastUsed: '3 hours ago' },
    { id: 'U-32', name: 'Frank Garcia', email: 'frank.garcia@company.com', dept: 'Procurement', lastUsed: '8 hours ago' },
    { id: 'U-33', name: 'Grace Miller', email: 'grace.miller@company.com', dept: 'Procurement', lastUsed: '4 hours ago' },
    { id: 'U-34', name: 'Henry Davis', email: 'henry.davis@company.com', dept: 'Procurement', lastUsed: '2 hours ago' },
    { id: 'U-35', name: 'Iris Martinez', email: 'iris.martinez@company.com', dept: 'Procurement', lastUsed: '5 hours ago' },
    { id: 'U-36', name: 'Jack Robinson', email: 'jack.robinson@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
    { id: 'U-37', name: 'Kelly Young', email: 'kelly.young@company.com', dept: 'Procurement', lastUsed: '9 hours ago' },
    { id: 'U-38', name: 'Luke Walker', email: 'luke.walker@company.com', dept: 'Procurement', lastUsed: '6 hours ago' }
  ]
};

// Mock SoD conflicts
const mockSoDConflicts = [
  {
    id: 'SOD-1',
    ruleName: 'Create & Approve Purchase Orders',
    ruleDescription: 'Users should not be able to both create and approve purchase orders to prevent fraud',
    severity: 'High' as const,
    conflictingEntitlements: [
      { name: 'Create Purchase Orders', app: 'Procurement' },
      { name: 'Approve Purchase Orders', app: 'Procurement' }
    ],
    affectedUsers: 8,
    policy: 'FIN-SOD-001'
  },
  {
    id: 'SOD-2',
    ruleName: 'Vendor Management & Payment Processing',
    ruleDescription: 'Separating vendor setup from payment processing reduces risk of fraudulent payments',
    severity: 'Medium' as const,
    conflictingEntitlements: [
      { name: 'Create Purchase Orders', app: 'Procurement' },
      { name: 'Process Vendor Payments', app: 'Treasury' }
    ],
    affectedUsers: 3,
    policy: 'FIN-SOD-003'
  }
];

// Usage data
const usageByDeptData = [
  { dept: 'Finance', usage: 145 },
  { dept: 'Procurement', usage: 98 },
  { dept: 'Operations', usage: 67 },
  { dept: 'IT', usage: 23 }
];

const usageTrendData = [
  { date: 'May', usage: 120 },
  { date: 'Jun', usage: 135 },
  { date: 'Jul', usage: 128 },
  { date: 'Aug', usage: 155 },
  { date: 'Sep', usage: 148 },
  { date: 'Oct', usage: 167 }
];

// AI suggestions
const mockAISuggestions = [
  {
    id: 'AI-1',
    type: 'optimize' as const,
    title: 'Unused Entitlement Detected',
    description: '12 users haven\'t used this entitlement in the last 90 days. Consider revoking to reduce risk exposure.',
    impact: 'Medium',
    confidence: 92,
    actions: ['Review Usage', 'Revoke Access']
  },
  {
    id: 'AI-2',
    type: 'risk' as const,
    title: 'SoD Conflict Mitigation',
    description: 'Implement compensating controls for users with conflicting permissions. Consider splitting into separate roles.',
    impact: 'High',
    confidence: 88,
    actions: ['View Conflicts', 'Create Mitigation']
  },
  {
    id: 'AI-3',
    type: 'suggestion' as const,
    title: 'Access Pattern Anomaly',
    description: 'Usage spike detected in Operations department. This may indicate business process changes.',
    impact: 'Low',
    confidence: 75,
    actions: ['Investigate', 'Approve']
  }
];

export function EntitlementDetailPage() {
  const navigate = useNavigate();
  const { entitlementId } = useParams();
  const [currentTab, setCurrentTab] = useState('overview');
  const [decommissionDialog, setDecommissionDialog] = useState(false);

  const handleDecommission = () => {
    toast.success('Entitlement decommissioned', {
      description: `"${mockEntitlement.name}" has been removed from all users`
    });
    setDecommissionDialog(false);
    navigate('/access/entitlements');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid var(--border)', 
        backgroundColor: 'var(--surface)'
      }}>
        <div className="p-4 lg:p-6 max-w-[1320px] mx-auto w-full">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                if (currentTab !== 'overview') {
                  setCurrentTab('overview');
                } else {
                  navigate('/access/entitlements');
                }
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <ChevronDown className="w-4 h-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('View access paths')}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    View Access Paths
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setDecommissionDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decommission
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ 
                backgroundColor: 'var(--primary)',
                fontSize: '24px'
              }}>
                {mockEntitlement.appIcon}
              </div>
              <div className="flex-1 min-w-0">
                <h1 style={{ 
                  fontSize: 'var(--text-display)',
                  lineHeight: 'var(--line-height-display)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  {mockEntitlement.name}
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        fontSize: 'var(--text-xs)'
                      }}>
                        {mockEntitlement.owner.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                      {mockEntitlement.owner.name}
                    </span>
                  </div>
                  <RiskChip risk={mockEntitlement.risk} />
                  <Badge variant="outline">{mockEntitlement.app}</Badge>
                  <Badge variant="secondary">{mockEntitlement.type}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-[1320px] mx-auto w-full">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Assigned Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="sod">
                SoD Conflicts
                {mockSoDConflicts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {mockSoDConflicts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <h3 style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                      marginBottom: '12px'
                    }}>
                      Description
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                      {mockEntitlement.description}
                    </p>
                  </div>

                  <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <h3 style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                      marginBottom: '16px'
                    }}>
                      Data Access
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mockEntitlement.dataAccess.map((data, idx) => (
                        <Badge key={idx} variant="outline">
                          {data}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <h3 style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                      marginBottom: '16px'
                    }}>
                      Related Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mockEntitlement.relatedRoles.map((role, idx) => (
                        <Badge key={idx} variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <h3 style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                      marginBottom: '16px'
                    }}>
                      Audit Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Created
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockEntitlement.created}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Last Modified
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockEntitlement.lastModified}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Owner
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockEntitlement.owner.name}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Last Review
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockEntitlement.lastReview}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Category
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockEntitlement.category}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Criticality
                        </div>
                        <Badge variant="outline">{mockEntitlement.criticality}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div 
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    onClick={() => setCurrentTab('users')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        Assigned Users
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      {mockEntitlement.assigned}
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    onClick={() => setCurrentTab('roles')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4" style={{ color: 'var(--info)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        Related Roles
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      {mockEntitlement.relatedRoles.length}
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    onClick={() => setCurrentTab('usage')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4" style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        Last Used
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      {mockEntitlement.lastUsed}
                    </div>
                  </div>

                  <div 
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md" 
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    onClick={() => setCurrentTab('sod')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        SoD Conflicts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div style={{ 
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)'
                      }}>
                        {mockEntitlement.sodConflicts}
                      </div>
                      <RiskChip risk={mockEntitlement.risk} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Assigned Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Assigned Users
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                    {mockAssignedUsers.length} users have access to this entitlement
                  </p>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Granted Date</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAssignedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback style={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                color: 'white',
                                fontSize: 'var(--text-xs)'
                              }}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div style={{ 
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--text)'
                              }}>
                                {user.name}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {user.dept}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {user.grantedDate}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {user.lastUsed}
                          </span>
                        </TableCell>
                        <TableCell>
                          <RiskChip risk={user.risk} size="sm" />
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toast.info('Revoke access')}>
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <div>
                <h3 style={{ 
                  fontSize: 'var(--text-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Roles with this Entitlement
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  {mockEntitlement.relatedRoles.length} roles include this entitlement
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {mockEntitlement.relatedRoles.map((role, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    onClick={() => navigate(`/access/roles/R-100${idx + 1}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: 'var(--text-body)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--text)'
                          }}>
                            {role}
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {12 + idx * 3} members
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <h3 style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '16px'
                  }}>
                    Usage by Department
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={usageByDeptData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="dept" style={{ fontSize: 'var(--text-xs)' }} />
                      <YAxis style={{ fontSize: 'var(--text-xs)' }} />
                      <Tooltip />
                      <Bar dataKey="usage" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-6 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <h3 style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '16px'
                  }}>
                    Usage Trend (Last 6 Months)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={usageTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" style={{ fontSize: 'var(--text-xs)' }} />
                      <YAxis style={{ fontSize: 'var(--text-xs)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="usage" stroke="var(--primary)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* SoD Conflicts Tab */}
            <TabsContent value="sod" className="space-y-4">
              <div>
                <h3 style={{ 
                  fontSize: 'var(--text-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Segregation of Duties Conflicts
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  {mockSoDConflicts.length} conflict{mockSoDConflicts.length !== 1 ? 's' : ''} detected
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {mockSoDConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface)'
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 style={{
                            fontSize: 'var(--text-body)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--text)'
                          }}>
                            {conflict.ruleName}
                          </h4>
                          <RiskChip risk={conflict.severity} size="sm" />
                        </div>
                        <p style={{ 
                          fontSize: 'var(--text-sm)', 
                          color: 'var(--text-secondary)'
                        }}>
                          {conflict.ruleDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--muted-foreground)',
                          marginBottom: '8px'
                        }}>
                          Conflicting Entitlements
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {conflict.conflictingEntitlements.map((ent, idx) => (
                            <Badge key={idx} variant="outline">
                              {ent.name} ({ent.app})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {conflict.affectedUsers} user{conflict.affectedUsers !== 1 ? 's' : ''} affected
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="gap-2">
                            View Policy
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            Simulate Fix
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    AI-Powered Insights
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                    Recommendations based on usage patterns and risk analysis
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Refresh Insights
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {mockAISuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white'
                      }}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 style={{
                            fontSize: 'var(--text-body)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--text)'
                          }}>
                            {suggestion.title}
                          </h4>
                          <Badge variant="outline">{suggestion.impact} Impact</Badge>
                          <Badge variant="secondary">{suggestion.confidence}% confidence</Badge>
                        </div>
                        <p style={{ 
                          fontSize: 'var(--text-sm)', 
                          color: 'var(--text-secondary)',
                          marginBottom: '12px'
                        }}>
                          {suggestion.description}
                        </p>
                        <div className="flex gap-2">
                          {suggestion.actions.map((action, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Decommission Dialog */}
      <Dialog open={decommissionDialog} onOpenChange={setDecommissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decommission Entitlement</DialogTitle>
            <DialogDescription>
              Remove "{mockEntitlement.name}" from all users and roles
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--danger-bg)', borderLeft: '3px solid var(--danger)' }}>
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <div className="flex flex-col gap-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                    Warning: This action will affect {mockEntitlement.assigned} users
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    All users will immediately lose access to this entitlement. This action cannot be undone.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="decommission-reason">Reason for Decommissioning</Label>
              <Textarea id="decommission-reason" placeholder="Provide a reason for removing this entitlement..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecommissionDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDecommission}>
              Decommission Entitlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}