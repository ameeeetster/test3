import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { StatCard } from '../components/StatCard';
import { FilterChip } from '../components/FilterChip';
import { RiskChip } from '../components/RiskChip';
import { ConflictChip } from '../components/ConflictChip';
import { AppTile } from '../components/AppTile';
import { RoleQuickView } from '../components/RoleQuickView';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '../components/ui/drawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { toast } from 'sonner';
import { RBACService } from '../services/rbacService';
import { fetchEntitlements, fetchApplications } from '../services/mockDataService';
import { 
  Plus, Search, Filter, Download, Upload, MoreVertical, 
  Shield, Users, Package, AlertTriangle, TrendingUp, TrendingDown,
  Calendar, Settings, Edit, UserPlus, Trash2, Eye, GitBranch, XCircle, ClipboardList, ChevronDown, ChevronRight
} from 'lucide-react';

// Mock data
const kpiData = [
  { title: 'Total Roles', value: '247', change: '+12', changeType: 'positive' as const, trend: 'up' as const, icon: Shield, sparklineData: [10, 15, 12, 18, 22, 19, 24] },
  { title: 'Entitlements', value: '1,834', change: '+43', changeType: 'positive' as const, trend: 'up' as const, icon: Package, sparklineData: [120, 135, 142, 138, 155, 162, 183] },
  { title: 'Applications', value: '89', change: '+5', changeType: 'positive' as const, trend: 'up' as const, icon: Settings, sparklineData: [75, 78, 81, 83, 85, 87, 89] },
  { title: 'SoD Conflicts', value: '14', change: '-3', changeType: 'positive' as const, trend: 'down' as const, icon: AlertTriangle, iconColor: 'var(--warning)', sparklineData: [22, 20, 18, 17, 16, 15, 14] }
];

const mockRoles = [
  {
    id: 'R-1001',
    name: 'Financial Controller',
    description: 'Full financial system access with approval authority',
    owner: { name: 'Sarah Johnson', avatar: 'SJ' },
    members: 12,
    applications: ['Procurement', 'QuickBooks', 'Treasury'],
    risk: 'High' as const,
    sodConflicts: 3,
    updated: '2 days ago'
  },
  {
    id: 'R-1002',
    name: 'Engineering Lead',
    description: 'Development and production environment access',
    owner: { name: 'Michael Chen', avatar: 'MC' },
    members: 45,
    applications: ['GitHub', 'AWS', 'Jenkins'],
    risk: 'Medium' as const,
    sodConflicts: 0,
    updated: '1 week ago'
  },
  {
    id: 'R-1003',
    name: 'HR Manager',
    description: 'Human resources management and payroll access',
    owner: { name: 'Emily Davis', avatar: 'ED' },
    members: 8,
    applications: ['Workday', 'BambooHR', 'ADP'],
    risk: 'Medium' as const,
    sodConflicts: 1,
    updated: '3 days ago'
  },
  {
    id: 'R-1004',
    name: 'Auditor',
    description: 'Read-only access to all systems for compliance',
    owner: { name: 'James Wilson', avatar: 'JW' },
    members: 6,
    applications: ['Splunk', 'QuickBooks', 'SharePoint'],
    risk: 'Low' as const,
    sodConflicts: 0,
    updated: '1 day ago'
  }
];

const mockEntitlements = [
  {
    id: 'E-2001',
    name: 'Create Purchase Orders',
    app: 'Procurement',
    appIcon: '💰',
    type: 'Permission',
    assigned: 45,
    lastUsed: '2 hours ago',
    owner: 'Sarah Johnson',
    risk: 'High' as const,
    sodConflicts: 2
  },
  {
    id: 'E-2002',
    name: 'Deploy to Production',
    app: 'AWS',
    appIcon: '☁️',
    type: 'Action',
    assigned: 12,
    lastUsed: '1 day ago',
    owner: 'Michael Chen',
    risk: 'Critical' as const,
    sodConflicts: 0
  },
  {
    id: 'E-2003',
    name: 'Access Payroll Data',
    app: 'Workday',
    appIcon: '💼',
    type: 'Data Access',
    assigned: 8,
    lastUsed: '3 days ago',
    owner: 'Emily Davis',
    risk: 'High' as const,
    sodConflicts: 1
  },
  {
    id: 'E-2004',
    name: 'Read Audit Logs',
    app: 'Splunk',
    appIcon: '🔍',
    type: 'Permission',
    assigned: 25,
    lastUsed: '1 week ago',
    owner: 'James Wilson',
    risk: 'Low' as const,
    sodConflicts: 0
  }
];

// Mock data for access paths - direct users
const mockDirectUsers = [
  { id: 'U-101', name: 'Carol White', email: 'carol.white@company.com', dept: 'Finance', lastUsed: '3 days ago' },
  { id: 'U-102', name: 'Edward Kim', email: 'edward.kim@company.com', dept: 'Procurement', lastUsed: '1 hour ago' },
  { id: 'U-103', name: 'Fiona Green', email: 'fiona.green@company.com', dept: 'Finance', lastUsed: '5 hours ago' },
  { id: 'U-104', name: 'George Harris', email: 'george.harris@company.com', dept: 'Operations', lastUsed: '2 days ago' },
  { id: 'U-105', name: 'Hannah Lee', email: 'hannah.lee@company.com', dept: 'Finance', lastUsed: '3 hours ago' },
  { id: 'U-106', name: 'Ian Rodriguez', email: 'ian.rodriguez@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
  { id: 'U-107', name: 'Julia Thompson', email: 'julia.thompson@company.com', dept: 'Finance', lastUsed: '4 hours ago' },
  { id: 'U-108', name: 'Kevin Wright', email: 'kevin.wright@company.com', dept: 'Operations', lastUsed: '6 hours ago' }
];

// Mock data for access paths - role-based users
const mockRoleBasedUsers: Record<string, Array<{id: string; name: string; email: string; dept: string; lastUsed: string}>> = {
  'Financial Controller': [
    { id: 'U-201', name: 'Alice Cooper', email: 'alice.cooper@company.com', dept: 'Finance', lastUsed: '2 hours ago' },
    { id: 'U-202', name: 'David Brown', email: 'david.brown@company.com', dept: 'Finance', lastUsed: '5 hours ago' },
    { id: 'U-203', name: 'Laura Martinez', email: 'laura.martinez@company.com', dept: 'Finance', lastUsed: '1 day ago' },
    { id: 'U-204', name: 'Marcus Johnson', email: 'marcus.johnson@company.com', dept: 'Finance', lastUsed: '3 hours ago' },
    { id: 'U-205', name: 'Nina Patel', email: 'nina.patel@company.com', dept: 'Finance', lastUsed: '7 hours ago' },
    { id: 'U-206', name: 'Oliver Chen', email: 'oliver.chen@company.com', dept: 'Finance', lastUsed: '2 days ago' },
    { id: 'U-207', name: 'Patricia Davis', email: 'patricia.davis@company.com', dept: 'Finance', lastUsed: '4 hours ago' },
    { id: 'U-208', name: 'Quinn Roberts', email: 'quinn.roberts@company.com', dept: 'Finance', lastUsed: '1 hour ago' },
    { id: 'U-209', name: 'Rachel Kim', email: 'rachel.kim@company.com', dept: 'Finance', lastUsed: '5 hours ago' },
    { id: 'U-210', name: 'Steven Lee', email: 'steven.lee@company.com', dept: 'Finance', lastUsed: '8 hours ago' },
    { id: 'U-211', name: 'Tina Wang', email: 'tina.wang@company.com', dept: 'Finance', lastUsed: '3 days ago' },
    { id: 'U-212', name: 'Uma Singh', email: 'uma.singh@company.com', dept: 'Finance', lastUsed: '6 hours ago' }
  ],
  'Procurement Manager': [
    { id: 'U-301', name: 'Bob Martinez', email: 'bob.martinez@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
    { id: 'U-302', name: 'Victor Brown', email: 'victor.brown@company.com', dept: 'Procurement', lastUsed: '2 hours ago' },
    { id: 'U-303', name: 'Wendy Clark', email: 'wendy.clark@company.com', dept: 'Procurement', lastUsed: '4 hours ago' },
    { id: 'U-304', name: 'Xavier Moore', email: 'xavier.moore@company.com', dept: 'Procurement', lastUsed: '1 hour ago' },
    { id: 'U-305', name: 'Yolanda Taylor', email: 'yolanda.taylor@company.com', dept: 'Procurement', lastUsed: '3 hours ago' },
    { id: 'U-306', name: 'Zachary White', email: 'zachary.white@company.com', dept: 'Procurement', lastUsed: '5 hours ago' },
    { id: 'U-307', name: 'Amy Wilson', email: 'amy.wilson@company.com', dept: 'Procurement', lastUsed: '2 days ago' },
    { id: 'U-308', name: 'Brian Anderson', email: 'brian.anderson@company.com', dept: 'Procurement', lastUsed: '6 hours ago' },
    { id: 'U-309', name: 'Catherine Lewis', email: 'catherine.lewis@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
    { id: 'U-310', name: 'Daniel Harris', email: 'daniel.harris@company.com', dept: 'Procurement', lastUsed: '7 hours ago' },
    { id: 'U-311', name: 'Emma Thompson', email: 'emma.thompson@company.com', dept: 'Procurement', lastUsed: '3 hours ago' },
    { id: 'U-312', name: 'Frank Garcia', email: 'frank.garcia@company.com', dept: 'Procurement', lastUsed: '8 hours ago' },
    { id: 'U-313', name: 'Grace Miller', email: 'grace.miller@company.com', dept: 'Procurement', lastUsed: '4 hours ago' },
    { id: 'U-314', name: 'Henry Davis', email: 'henry.davis@company.com', dept: 'Procurement', lastUsed: '2 hours ago' },
    { id: 'U-315', name: 'Iris Martinez', email: 'iris.martinez@company.com', dept: 'Procurement', lastUsed: '5 hours ago' },
    { id: 'U-316', name: 'Jack Robinson', email: 'jack.robinson@company.com', dept: 'Procurement', lastUsed: '1 day ago' },
    { id: 'U-317', name: 'Kelly Young', email: 'kelly.young@company.com', dept: 'Procurement', lastUsed: '9 hours ago' },
    { id: 'U-318', name: 'Luke Walker', email: 'luke.walker@company.com', dept: 'Procurement', lastUsed: '6 hours ago' }
  ]
};

const mockApps = [
  {
    id: 'A-3001',
    name: 'AWS Production',
    icon: '☁️',
    category: 'Cloud Infrastructure',
    users: 234,
    roles: 18,
    risk: 'Critical' as const,
    connectorStatus: 'connected' as const
  },
  {
    id: 'A-3002',
    name: 'Salesforce',
    icon: '💼',
    category: 'CRM',
    users: 456,
    roles: 32,
    risk: 'Medium' as const,
    connectorStatus: 'connected' as const
  },
  {
    id: 'A-3003',
    name: 'Workday',
    icon: '👥',
    category: 'HR & Payroll',
    users: 1243,
    roles: 24,
    risk: 'High' as const,
    connectorStatus: 'connected' as const
  },
  {
    id: 'A-3004',
    name: 'GitHub',
    icon: '⚙️',
    category: 'Development',
    users: 189,
    roles: 12,
    risk: 'Medium' as const,
    connectorStatus: 'error' as const
  },
  {
    id: 'A-3005',
    name: 'Jira',
    icon: '📋',
    category: 'Project Management',
    users: 345,
    roles: 15,
    risk: 'Low' as const,
    connectorStatus: 'connected' as const
  },
  {
    id: 'A-3006',
    name: 'Slack',
    icon: '💬',
    category: 'Communication',
    users: 1156,
    roles: 8,
    risk: 'Low' as const,
    connectorStatus: 'pending' as const
  }
];

export function AccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for real roles data
  const [roles, setRoles] = useState<typeof mockRoles>(mockRoles);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  // Determine current tab from URL path
  const currentTab = useMemo(() => {
    const path = location.pathname;
    if (path === '/access/entitlements') {
      return 'entitlements';
    } else if (path.startsWith('/access/apps')) {
      return 'applications';
    }
    return 'roles';
  }, [location.pathname]);
  
  // Load roles when component mounts or when roles tab is active
  React.useEffect(() => {
    if (currentTab === 'roles') {
      loadRoles();
    } else if (currentTab === 'entitlements') {
      loadEntitlements();
    } else if (currentTab === 'applications') {
      loadApplications();
    }
  }, [currentTab]);
  
  const loadRoles = async () => {
    try {
      console.log('🔄 Loading roles...');
      setIsLoadingRoles(true);
      const rolesData = await RBACService.getRoles();
      console.log('📦 Roles data received:', rolesData);
      
      if (rolesData && rolesData.length > 0) {
        console.log(`✅ Found ${rolesData.length} roles`);
        // Transform database roles to match mockRoles structure
        const transformedRoles = rolesData.map((role: any) => {
          console.log('🔄 Processing role:', role);
          
          // Extract owner information
          let ownerName = 'System';
          let ownerAvatar = 'SY';
          
          // Try different possible column names for created_by
          const createdBy = role.created_by || role.created_by_id;
          
          if (createdBy) {
            ownerName = 'You';
            ownerAvatar = 'YO';
          }
          
          return {
            id: role.id,
            name: role.name || 'Unnamed Role',
            description: role.description || '',
            owner: { name: ownerName, avatar: ownerAvatar },
            members: role.assigned_user_count || role.members || 0,
            applications: [], // TODO: fetch actual applications
            risk: 'Medium' as const, // TODO: calculate actual risk
            sodConflicts: 0, // TODO: calculate actual conflicts
            updated: 'Just now',
            created_at: (role as any).created_at
          };
        });
        console.log('✨ Transformed roles:', transformedRoles);
        setRoles(transformedRoles);
      } else {
        console.log('⚠️ No roles found in database, using mockRoles');
        setRoles(mockRoles);
      }
    } catch (error) {
      console.error('❌ Failed to load roles:', error);
      // Keep mockRoles as fallback
      setRoles(mockRoles);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const loadEntitlements = async () => {
    try {
      setIsLoadingEntitlements(true);
      const data = await fetchEntitlements();
      setEntitlements(data);
    } catch (error) {
      console.error('❌ Failed to load entitlements:', error);
      setEntitlements([]);
    } finally {
      setIsLoadingEntitlements(false);
    }
  };

  const loadApplications = async () => {
    try {
      setIsLoadingApps(true);
      const data = await fetchApplications();
      setApplications(data);
    } catch (error) {
      console.error('❌ Failed to load applications:', error);
      setApplications([]);
    } finally {
      setIsLoadingApps(false);
    }
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [isLoadingEntitlements, setIsLoadingEntitlements] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [selectedRole, setSelectedRole] = useState<typeof mockRoles[0] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    owner: [],
    risk: [],
    app: [],
    updated: []
  });
  
  // Role action dialogs
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [startReviewDialog, setStartReviewDialog] = useState(false);
  const [deleteRoleDialog, setDeleteRoleDialog] = useState(false);
  const [actionRole, setActionRole] = useState<typeof mockRoles[0] | null>(null);
  
  // Entitlement action dialogs
  const [entitlementDetailsDialog, setEntitlementDetailsDialog] = useState(false);
  const [accessPathsDialog, setAccessPathsDialog] = useState(false);
  const [decommissionDialog, setDecommissionDialog] = useState(false);
  const [actionEntitlement, setActionEntitlement] = useState<typeof mockEntitlements[0] | null>(null);
  
  // Form data
  const [reviewData, setReviewData] = useState({
    reviewType: 'quarterly',
    assignedTo: '',
    dueDate: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleTabChange = (value: string) => {
    // Navigate to the appropriate path
    if (value === 'roles') {
      navigate('/access/roles');
    } else if (value === 'entitlements') {
      navigate('/access/entitlements');
    } else if (value === 'applications') {
      navigate('/access/apps');
    }
  };

  const handleRoleClick = (role: typeof mockRoles[0]) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const handleViewRoleDetail = () => {
    // Close the quick view drawer
    setDrawerOpen(false);
    // Navigate to full role detail page after a brief delay to allow drawer to close
    setTimeout(() => {
      if (selectedRole) {
        navigate(`/access/roles/${selectedRole.id}`);
      }
    }, 100);
  };

  // Role action handlers
  const handleEditRole = (role: typeof mockRoles[0]) => {
    setActionRole(role);
    setEditRoleDialog(true);
  };

  const handleAddMember = (role: typeof mockRoles[0]) => {
    setActionRole(role);
    setAddMemberDialog(true);
  };

  const handleStartReview = (role: typeof mockRoles[0]) => {
    setActionRole(role);
    setReviewData({ reviewType: 'quarterly', assignedTo: '', dueDate: '' });
    setStartReviewDialog(true);
  };

  const handleDeleteRole = (role: typeof mockRoles[0]) => {
    setActionRole(role);
    setDeleteConfirmation('');
    setDeleteRoleDialog(true);
  };

  const handleConfirmEditRole = () => {
    toast.success('Role updated successfully', {
      description: `Changes to "${actionRole?.name}" have been saved`
    });
    setEditRoleDialog(false);
  };

  const handleConfirmAddMember = () => {
    toast.success('Members added successfully', {
      description: `New members have been added to "${actionRole?.name}"`
    });
    setAddMemberDialog(false);
  };

  const handleConfirmStartReview = () => {
    toast.success('Access review created', {
      description: `Review campaign for "${actionRole?.name}" has been scheduled`
    });
    setStartReviewDialog(false);
  };

  const handleConfirmDeleteRole = () => {
    if (deleteConfirmation === actionRole?.name) {
      toast.success('Role deleted successfully', {
        description: `"${actionRole?.name}" has been removed`
      });
      setDeleteRoleDialog(false);
    }
  };

  // Entitlement action handlers
  const handleViewEntitlementDetails = (ent: typeof mockEntitlements[0]) => {
    navigate(`/access/entitlements/${ent.id}`);
  };

  const handleViewAccessPaths = (ent: typeof mockEntitlements[0]) => {
    setActionEntitlement(ent);
    setAccessPathsDialog(true);
  };

  const handleDecommission = (ent: typeof mockEntitlements[0]) => {
    setActionEntitlement(ent);
    setDecommissionDialog(true);
  };

  const handleConfirmDecommission = () => {
    toast.success('Entitlement decommissioned', {
      description: `"${actionEntitlement?.name}" has been removed from all users`
    });
    setDecommissionDialog(false);
  };

  const handleToggleFilter = (category: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[category] || [];
      const hasValue = current.includes(value);
      return {
        ...prev,
        [category]: hasValue
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };

  const handleRemoveFilter = (category: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(v => v !== value)
    }));
  };

  const handleClearAllFilters = () => {
    setActiveFilters({
      owner: [],
      risk: [],
      app: [],
      updated: []
    });
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).flat().length;
  }, [activeFilters]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 lg:p-6 max-w-[1320px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-6">
          <div>
            <h1 style={{ 
              fontSize: 'var(--text-display)',
              lineHeight: 'var(--line-height-display)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              Roles & Entitlements
            </h1>
            <p style={{ 
              fontSize: 'var(--text-body)', 
              color: 'var(--muted-foreground)', 
              marginTop: '8px' 
            }}>
              Manage roles, entitlements, and application access
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((kpi, idx) => (
              <StatCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                changeType={kpi.changeType}
                trend={kpi.trend}
                icon={kpi.icon}
                iconColor={kpi.iconColor}
                sparklineData={kpi.sparklineData}
              />
            ))}
          </div>

          {/* Tabs & Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <SegmentedTabs
              value={currentTab}
              onChange={handleTabChange}
              tabs={[
                { value: 'roles', label: 'Roles' },
                { value: 'entitlements', label: 'Entitlements' },
                { value: 'applications', label: 'Applications' }
              ]}
            />

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => navigate('/access/roles/new')}
              >
                <Plus className="w-4 h-4" />
                New Role
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentTab === 'roles' && (
          <div className="flex flex-col gap-4">
            {isLoadingRoles && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                  Loading roles...
                </p>
              </div>
            )}
            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <Input
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Filters</h4>
                        {activeFilterCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllFilters}
                            className="h-auto py-1 px-2 text-xs"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Risk Level</Label>
                          <div className="flex flex-col gap-2">
                            {['Critical', 'High', 'Medium', 'Low'].map(risk => (
                              <div key={risk} className="flex items-center gap-2">
                                <Checkbox
                                  id={`risk-${risk}`}
                                  checked={activeFilters.risk?.includes(risk)}
                                  onCheckedChange={() => handleToggleFilter('risk', risk)}
                                />
                                <Label htmlFor={`risk-${risk}`} className="text-sm cursor-pointer">
                                  {risk}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Owner</Label>
                          <div className="flex flex-col gap-2">
                            {['Sarah Johnson', 'Michael Chen', 'Emily Davis', 'James Wilson'].map(owner => (
                              <div key={owner} className="flex items-center gap-2">
                                <Checkbox
                                  id={`owner-${owner}`}
                                  checked={activeFilters.owner?.includes(owner)}
                                  onCheckedChange={() => handleToggleFilter('owner', owner)}
                                />
                                <Label htmlFor={`owner-${owner}`} className="text-sm cursor-pointer">
                                  {owner}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Application</Label>
                          <div className="flex flex-col gap-2">
                            {['AWS', 'GitHub', 'Workday', 'QuickBooks', 'Salesforce'].map(app => (
                              <div key={app} className="flex items-center gap-2">
                                <Checkbox
                                  id={`app-${app}`}
                                  checked={activeFilters.app?.includes(app)}
                                  onCheckedChange={() => handleToggleFilter('app', app)}
                                />
                                <Label htmlFor={`app-${app}`} className="text-sm cursor-pointer">
                                  {app}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(activeFilters).map(([category, values]) =>
                    values.map(value => (
                      <FilterChip
                        key={`${category}-${value}`}
                        label={value}
                        onRemove={() => handleRemoveFilter(category, value)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Roles Table */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ minWidth: '300px' }}>Role</TableHead>
                      <TableHead style={{ minWidth: '140px' }}>Owner</TableHead>
                      <TableHead style={{ minWidth: '100px' }}>Members</TableHead>
                      <TableHead style={{ minWidth: '140px' }}>Applications</TableHead>
                      <TableHead style={{ minWidth: '100px' }}>Risk</TableHead>
                      <TableHead style={{ minWidth: '100px' }}>SoD</TableHead>
                      <TableHead style={{ minWidth: '120px' }}>Updated</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow
                        key={role.id}
                        onClick={() => handleRoleClick(role)}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div style={{ 
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--text)'
                            }}>
                              {role.name}
                            </div>
                            <div style={{ 
                              fontSize: 'var(--text-xs)',
                              color: 'var(--muted-foreground)',
                              marginTop: '2px'
                            }}>
                              {role.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback style={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                color: 'white',
                                fontSize: 'var(--text-xs)'
                              }}>
                                {role.owner.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                              {role.owner.name.split(' ')[0]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                            {role.members}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {role.applications.slice(0, 2).map((app, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary"
                                style={{ 
                                  fontSize: 'var(--text-xs)',
                                  fontWeight: 'var(--font-weight-medium)'
                                }}
                              >
                                {app}
                              </Badge>
                            ))}
                            {role.applications.length > 2 && (
                              <Badge 
                                variant="outline"
                                style={{ 
                                  fontSize: 'var(--text-xs)',
                                  color: 'var(--muted-foreground)'
                                }}
                              >
                                +{role.applications.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RiskChip risk={role.risk} size="sm" />
                        </TableCell>
                        <TableCell>
                          {role.sodConflicts > 0 ? (
                            <ConflictChip count={role.sodConflicts} />
                          ) : (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {role.updated}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => navigate(`/access/roles/${role.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleEditRole(role)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleAddMember(role)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleStartReview(role)}>
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Start Review
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={() => handleDeleteRole(role)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Role
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'entitlements' && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <Input
                    placeholder="Search entitlements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Filters</h4>
                        {activeFilterCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllFilters}
                            className="h-auto py-1 px-2 text-xs"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Risk Level</Label>
                          <div className="flex flex-col gap-2">
                            {['Critical', 'High', 'Medium', 'Low'].map(risk => (
                              <div key={risk} className="flex items-center gap-2">
                                <Checkbox
                                  id={`risk-${risk}`}
                                  checked={activeFilters.risk?.includes(risk)}
                                  onCheckedChange={() => handleToggleFilter('risk', risk)}
                                />
                                <Label htmlFor={`risk-${risk}`} className="text-sm cursor-pointer">
                                  {risk}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Application</Label>
                          <div className="flex flex-col gap-2">
                            {['AWS', 'Workday', 'Procurement', 'Splunk'].map(app => (
                              <div key={app} className="flex items-center gap-2">
                                <Checkbox
                                  id={`app-${app}`}
                                  checked={activeFilters.app?.includes(app)}
                                  onCheckedChange={() => handleToggleFilter('app', app)}
                                />
                                <Label htmlFor={`app-${app}`} className="text-sm cursor-pointer">
                                  {app}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(activeFilters).map(([category, values]) =>
                    values.map(value => (
                      <FilterChip
                        key={`${category}-${value}`}
                        label={value}
                        onRemove={() => handleRemoveFilter(category, value)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Entitlements Table */}
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ minWidth: '250px' }}>Entitlement</TableHead>
                      <TableHead style={{ minWidth: '140px' }}>Application</TableHead>
                      <TableHead style={{ minWidth: '100px' }}>Assigned</TableHead>
                      <TableHead style={{ minWidth: '120px' }}>Last Used</TableHead>
                      <TableHead style={{ minWidth: '140px' }}>Owner</TableHead>
                      <TableHead style={{ minWidth: '100px' }}>Risk</TableHead>
                      <TableHead style={{ minWidth: '100px' }}>SoD</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(isLoadingEntitlements ? [] : entitlements).map((ent: any) => (
                      <TableRow key={ent.id} className="cursor-pointer hover:bg-accent/50">
                        <TableCell>
                          <div style={{ 
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--text)'
                          }}>
                            {ent.key?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || ent.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: '16px' }}>{ent.app_icon || '🔧'}</span>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                              {ent.app}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                            {ent.assigned || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {ent.lastUsed || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                            {ent.owner || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <RiskChip risk={(ent.risk as any) || 'Medium'} size="sm" />
                        </TableCell>
                        <TableCell>
                          {(ent.sod_conflicts || ent.sodConflicts) > 0 ? (
                            <ConflictChip count={ent.sod_conflicts || ent.sodConflicts} />
                          ) : (
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleViewEntitlementDetails(ent)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleViewAccessPaths(ent)}>
                                <GitBranch className="w-4 h-4 mr-2" />
                                View Access Paths
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onSelect={() => handleDecommission(ent)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Decommission
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'applications' && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Filters</h4>
                        {activeFilterCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllFilters}
                            className="h-auto py-1 px-2 text-xs"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-col gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Risk Level</Label>
                          <div className="flex flex-col gap-2">
                            {['Critical', 'High', 'Medium', 'Low'].map(risk => (
                              <div key={risk} className="flex items-center gap-2">
                                <Checkbox
                                  id={`risk-${risk}`}
                                  checked={activeFilters.risk?.includes(risk)}
                                  onCheckedChange={() => handleToggleFilter('risk', risk)}
                                />
                                <Label htmlFor={`risk-${risk}`} className="text-sm cursor-pointer">
                                  {risk}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(activeFilters).map(([category, values]) =>
                    values.map(value => (
                      <FilterChip
                        key={`${category}-${value}`}
                        label={value}
                        onRemove={() => handleRemoveFilter(category, value)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isLoadingApps ? [] : applications).map((app: any) => (
                <AppTile 
                  key={app.id} 
                  app={app}
                  onClick={() => navigate(`/access/apps/${app.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Role Quick View Drawer */}
      <RoleQuickView
        role={selectedRole}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onViewDetails={handleViewRoleDetail}
        onEdit={() => {
          if (selectedRole) {
            handleEditRole(selectedRole);
            setDrawerOpen(false);
          }
        }}
        onAddMember={() => {
          if (selectedRole) {
            handleAddMember(selectedRole);
            setDrawerOpen(false);
          }
        }}
        onStartReview={() => {
          if (selectedRole) {
            handleStartReview(selectedRole);
            setDrawerOpen(false);
          }
        }}
        onExport={() => {
          toast.success('Exporting role members...');
        }}
        onDisable={() => {
          if (selectedRole) {
            toast.info(`Disabling role: ${selectedRole.name}`);
          }
        }}
      />

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialog} onOpenChange={setEditRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details for "{actionRole?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input id="role-name" defaultValue={actionRole?.name} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea id="role-description" defaultValue={actionRole?.description} rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-owner">Owner</Label>
              <Select defaultValue={actionRole?.owner.name}>
                <SelectTrigger id="role-owner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                  <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  <SelectItem value="James Wilson">James Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members</DialogTitle>
            <DialogDescription>
              Add users to "{actionRole?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="search-users">Search Users</Label>
              <Input id="search-users" placeholder="Search by name, email, or department..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Select Users</Label>
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', maxHeight: '240px', overflowY: 'auto' }}>
                <div className="flex flex-col gap-3">
                  {['Alice Cooper', 'Bob Martinez', 'Carol White', 'David Brown'].map((user, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Checkbox id={`user-${idx}`} />
                      <Label htmlFor={`user-${idx}`} className="flex-1 cursor-pointer">
                        {user}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmAddMember}>Add Members</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Review Dialog */}
      <Dialog open={startReviewDialog} onOpenChange={setStartReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Access Review</DialogTitle>
            <DialogDescription>
              Create an access review campaign for "{actionRole?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="review-type">Review Type</Label>
              <Select value={reviewData.reviewType} onValueChange={(v) => setReviewData({...reviewData, reviewType: v})}>
                <SelectTrigger id="review-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly Review</SelectItem>
                  <SelectItem value="annual">Annual Review</SelectItem>
                  <SelectItem value="adhoc">Ad-hoc Review</SelectItem>
                  <SelectItem value="certification">Certification Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Select value={reviewData.assignedTo} onValueChange={(v) => setReviewData({...reviewData, assignedTo: v})}>
                <SelectTrigger id="assigned-to">
                  <SelectValue placeholder="Select reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah Johnson (Manager)</SelectItem>
                  <SelectItem value="michael">Michael Chen (Security Lead)</SelectItem>
                  <SelectItem value="emily">Emily Davis (Compliance Officer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input id="due-date" type="date" value={reviewData.dueDate} onChange={(e) => setReviewData({...reviewData, dueDate: e.target.value})} />
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent)' }}>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                This review will include {actionRole?.members} members across {actionRole?.applications.length} applications.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartReviewDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmStartReview} disabled={!reviewData.assignedTo || !reviewData.dueDate}>
              Create Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={deleteRoleDialog} onOpenChange={setDeleteRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the role and remove access for all members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--danger-bg)', borderLeft: '3px solid var(--danger)' }}>
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <div className="flex flex-col gap-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                    Warning: Critical Action
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    Deleting this role will affect {actionRole?.members} users and remove {actionRole?.applications.length} application assignments.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="delete-confirm">
                Type <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{actionRole?.name}</span> to confirm
              </Label>
              <Input 
                id="delete-confirm" 
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type role name to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoleDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDeleteRole}
              disabled={deleteConfirmation !== actionRole?.name}
            >
              Delete Role Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Entitlement Details Dialog */}
      <Dialog open={entitlementDetailsDialog} onOpenChange={setEntitlementDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Entitlement Details</DialogTitle>
            <DialogDescription>
              Detailed information about "{actionEntitlement?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Application</span>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '16px' }}>{actionEntitlement?.appIcon}</span>
                  <span style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                    {actionEntitlement?.app}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Type</span>
                <Badge variant="outline">{actionEntitlement?.type}</Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Users Assigned</span>
                <span style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                  {actionEntitlement?.assigned}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Last Used</span>
                <span style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                  {actionEntitlement?.lastUsed}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Owner</span>
                <span style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                  {actionEntitlement?.owner}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>Risk Level</span>
                <RiskChip risk={actionEntitlement?.risk || 'Low'} size="sm" />
              </div>
            </div>
            {actionEntitlement && actionEntitlement.sodConflicts > 0 && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--warning-bg)', borderLeft: '3px solid var(--warning)' }}>
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    This entitlement has {actionEntitlement.sodConflicts} Segregation of Duties conflict{actionEntitlement.sodConflicts !== 1 ? 's' : ''}.
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setEntitlementDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Paths Dialog */}
      <Dialog open={accessPathsDialog} onOpenChange={setAccessPathsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Access Paths</DialogTitle>
            <DialogDescription>
              Visual representation of how users can access "{actionEntitlement?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4 overflow-y-auto">
            {/* Direct Assignment Section */}
            <Collapsible defaultOpen>
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                        Direct Assignment
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {mockDirectUsers.length} users have direct access
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 transition-transform [[data-state=open]>&]:rotate-180" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-col gap-2">
                      {mockDirectUsers.map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                          style={{ backgroundColor: 'var(--accent)' }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback style={{
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                color: 'white',
                                fontSize: 'var(--text-xs)'
                              }}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
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
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <Badge variant="outline" className="mb-1">{user.dept}</Badge>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                Used {user.lastUsed}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Via Roles Section */}
            <Collapsible defaultOpen>
              <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--info)', color: 'white' }}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                        Via Roles
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {Object.values(mockRoleBasedUsers).flat().length} users through role membership
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 transition-transform [[data-state=open]>&]:rotate-180" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="mt-4 pt-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
                    {Object.entries(mockRoleBasedUsers).map(([roleName, users]) => (
                      <Collapsible key={roleName}>
                        <div className="rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent)' }}>
                          <CollapsibleTrigger className="w-full p-3">
                            <div className="flex items-center justify-between hover:opacity-80 transition-opacity">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" style={{ color: 'var(--info)' }} />
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                                  {roleName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                  {users.length} users
                                </span>
                                <ChevronRight className="w-4 h-4 transition-transform [[data-state=open]>&]:rotate-90" style={{ color: 'var(--text-secondary)' }} />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="px-3 pb-3 pt-2 flex flex-col gap-2">
                              {users.map((user) => (
                                <div 
                                  key={user.id}
                                  className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
                                  style={{ backgroundColor: 'var(--background)' }}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <Avatar className="w-7 h-7">
                                      <AvatarFallback style={{
                                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                        color: 'white',
                                        fontSize: 'var(--text-xs)'
                                      }}>
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div style={{ 
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--text)'
                                      }}>
                                        {user.name}
                                      </div>
                                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                    Used {user.lastUsed}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button onClick={() => setAccessPathsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decommission Dialog */}
      <Dialog open={decommissionDialog} onOpenChange={setDecommissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decommission Entitlement</DialogTitle>
            <DialogDescription>
              Remove "{actionEntitlement?.name}" from all users and roles
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--danger-bg)', borderLeft: '3px solid var(--danger)' }}>
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                <div className="flex flex-col gap-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                    Warning: This action will affect {actionEntitlement?.assigned} users
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
            <Button variant="destructive" onClick={handleConfirmDecommission}>
              Decommission Entitlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
