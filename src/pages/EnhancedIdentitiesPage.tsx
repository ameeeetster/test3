import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Plus, Download, Lock, XCircle, FileCheck, X, User, Mail, Phone, Building, Calendar, Shield, Key } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

import { FilterChip } from '../components/FilterChip';
import { IdentitiesDataTable, Identity } from '../components/IdentitiesDataTable';
import { IdentityDetailDrawer } from '../components/IdentityDetailDrawer';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { InviteUserDialog } from '../components/InviteUserDialog';

// Mock data with enhanced fields
const identitiesData: Identity[] = [
  {
    id: '1',
    name: 'Jennifer Smith',
    email: 'j.smith@company.com',
    department: 'Finance',
    manager: 'Alice Johnson',
    status: 'Active',
    risk: 'Medium',
    roles: 5,
    lastLogin: '2024-09-30',
    lastLoginDays: 0,
    issues: { sodConflicts: 1, anomalies: 0 }
  },
  {
    id: '2',
    name: 'Raj Kumar',
    email: 'r.kumar@company.com',
    department: 'IT',
    manager: 'Mike Chen',
    status: 'Active',
    risk: 'High',
    roles: 12,
    lastLogin: '2024-09-30',
    lastLoginDays: 0,
    issues: { sodConflicts: 2, anomalies: 1 }
  },
  {
    id: '3',
    name: 'Maria Garcia',
    email: 'm.garcia@company.com',
    department: 'Sales',
    manager: 'Sarah Patel',
    status: 'Active',
    risk: 'Low',
    roles: 3,
    lastLogin: '2024-09-29',
    lastLoginDays: 1,
    issues: { sodConflicts: 0, anomalies: 0 }
  },
  {
    id: '4',
    name: 'Alice Johnson',
    email: 'a.johnson@company.com',
    department: 'HR',
    manager: 'Jennifer Smith',
    status: 'Active',
    risk: 'Low',
    roles: 4,
    lastLogin: '2024-09-28',
    lastLoginDays: 2,
    issues: { sodConflicts: 0, anomalies: 0 }
  },
  {
    id: '5',
    name: 'Sarah Patel',
    email: 's.patel@company.com',
    department: 'Finance',
    manager: 'Alice Johnson',
    status: 'Inactive',
    risk: 'Medium',
    roles: 7,
    lastLogin: '2024-08-15',
    lastLoginDays: 46,
    issues: { sodConflicts: 1, anomalies: 2 }
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'd.kim@company.com',
    department: 'Engineering',
    manager: 'Mike Chen',
    status: 'Active',
    risk: 'High',
    roles: 10,
    lastLogin: '2024-09-29',
    lastLoginDays: 1,
    issues: { sodConflicts: 3, anomalies: 0 }
  },
  {
    id: '7',
    name: 'Emily Brown',
    email: 'e.brown@company.com',
    department: 'Marketing',
    manager: 'Sarah Patel',
    status: 'Active',
    risk: 'Low',
    roles: 2,
    lastLogin: '2024-09-30',
    lastLoginDays: 0,
    issues: { sodConflicts: 0, anomalies: 0 }
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'j.wilson@company.com',
    department: 'IT',
    manager: 'Mike Chen',
    status: 'Disabled',
    risk: 'Critical',
    roles: 15,
    lastLogin: '2024-07-20',
    lastLoginDays: 72,
    issues: { sodConflicts: 5, anomalies: 3 }
  }
];



type FilterType = {
  type: 'status' | 'department' | 'risk' | 'manager' | 'lastLogin';
  value: string;
  label: string;
};

export function EnhancedIdentitiesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState<Identity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterType[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // User creation dialog state
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Organizational
    department: '',
    manager: '',
    jobTitle: '',
    // Access Control
    initialRoles: [] as string[],
    status: 'active',
    riskLevel: 'low',
    // Account Settings
    username: '',
    password: '',
    passwordConfirm: '',
    accountExpiration: '',
    sendWelcomeEmail: true,
    requirePasswordChange: true,
    // Additional
    notes: ''
  });

  // Helper function to normalize name to URL-friendly format
  const normalizeNameToId = (name: string) => {
    return name.toLowerCase().replace(/\\s+/g, '-');
  };

  // User creation form handlers
  const handleFormFieldChange = (field: string, value: any) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    
    try {
      // Log the action for audit trail
      console.log('User creation initiated', {
        timestamp: new Date().toISOString(),
        action: 'create_user',
        user: 'current_user', // In real implementation, get from context
        correlationId: `create-user-${Date.now()}`,
        userData: {
          name: `${userFormData.firstName} ${userFormData.lastName}`,
          email: userFormData.email,
          department: userFormData.department,
          status: userFormData.status,
          riskLevel: userFormData.riskLevel
        }
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success feedback
      toast.success("User created successfully!", {
        description: `${userFormData.firstName} ${userFormData.lastName} has been added to the system.`,
        duration: 5000
      });

      // Close dialog and reset form
      setShowCreateUserDialog(false);
      setUserFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        manager: '',
        jobTitle: '',
        initialRoles: [],
        status: 'active',
        riskLevel: 'low',
        username: '',
        password: '',
        passwordConfirm: '',
        accountExpiration: '',
        sendWelcomeEmail: true,
        requirePasswordChange: true,
        notes: ''
      });

    } catch (error) {
      toast.error("Failed to create user", {
        description: "Please check the form data and try again.",
        duration: 5000
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const resetForm = () => {
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      manager: '',
      jobTitle: '',
      initialRoles: [],
      status: 'active',
      riskLevel: 'low',
      username: '',
      password: '',
      passwordConfirm: '',
      accountExpiration: '',
      sendWelcomeEmail: true,
      requirePasswordChange: true,
      notes: ''
    });
  };

  // Effect to handle userId from URL params
  useEffect(() => {
    if (userId) {
      const user = identitiesData.find(
        identity => normalizeNameToId(identity.name) === userId
      );
      if (user) {
        setSelectedUser(user);
      }
    } else {
      setSelectedUser(null);
    }
  }, [userId, location.state]);

  // Update URL when user is selected/deselected
  const handleUserSelect = (user: Identity | null) => {
    setSelectedUser(user);
    if (user) {
      navigate(`/identities/${normalizeNameToId(user.name)}`, { 
        state: location.state 
      });
    } else {
      navigate('/identities');
    }
  };

  // Filter and search logic
  const filteredIdentities = useMemo(() => {
    let result = [...identitiesData];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(identity =>
        identity.name.toLowerCase().includes(query) ||
        identity.email.toLowerCase().includes(query) ||
        identity.department.toLowerCase().includes(query)
      );
    }

    // Apply filters
    filters.forEach(filter => {
      switch (filter.type) {
        case 'status':
          result = result.filter(i => i.status.toLowerCase() === filter.value.toLowerCase());
          break;
        case 'department':
          result = result.filter(i => i.department === filter.value);
          break;
        case 'risk':
          result = result.filter(i => i.risk.toLowerCase() === filter.value.toLowerCase());
          break;
        case 'manager':
          result = result.filter(i => i.manager === filter.value);
          break;
        case 'lastLogin':
          if (filter.value === '>30d') {
            result = result.filter(i => i.lastLoginDays > 30);
          }
          break;
      }
    });

    return result;
  }, [searchQuery, filters]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredIdentities.map(i => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk actions
  const handleBulkAction = (action: string) => {
    const count = selectedIds.size;
    switch (action) {
      case 'reset-password':
        toast.success(`Password reset initiated for ${count} user${count > 1 ? 's' : ''}`);
        break;
      case 'disable':
        toast.warning(`${count} user${count > 1 ? 's' : ''} disabled`);
        break;
      case 'start-review':
        toast.info(`Access review started for ${count} user${count > 1 ? 's' : ''}`);
        break;
      case 'export':
        toast.success(`Exporting ${count} user${count > 1 ? 's' : ''}...`);
        break;
    }
    setSelectedIds(new Set());
  };

  // Filter management
  const addFilter = (type: FilterType['type'], value: string, label: string) => {
    const exists = filters.find(f => f.type === type && f.value === value);
    if (!exists) {
      setFilters([...filters, { type, value, label }]);
    }
    setShowFilterDialog(false);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get unique values for filter dropdowns
  const uniqueDepartments = Array.from(new Set(identitiesData.map(i => i.department))).sort();
  const uniqueManagers = Array.from(new Set(identitiesData.map(i => i.manager))).sort();

  return (
    <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 style={{ 
            fontSize: 'var(--text-display)',
            lineHeight: 'var(--line-height-display)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text)'
          }}>
            Identities
          </h1>
          <Button 
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            onClick={() => {
              // Log the action for audit trail
              console.log('Invite User button clicked', {
                timestamp: new Date().toISOString(),
                action: 'open_invite_user_dialog',
                user: 'current_user', // In real implementation, get from context
                correlationId: `invite-user-${Date.now()}`
              });
              
              // Open the invite user dialog
              setShowInviteDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <Input 
                placeholder="Search users by name, email, or department..." 
                className="pl-10"
                style={{ backgroundColor: 'var(--input-background)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilterDialog(true)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {filters.length > 0 && (
                <Badge
                  className="ml-1"
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

          {/* Active Filters */}
          {filters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                Active filters:
              </span>
              {filters.map((filter, index) => (
                <FilterChip
                  key={index}
                  label={filter.label}
                  onRemove={() => removeFilter(index)}
                />
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7"
                style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div 
              className="flex items-center justify-between p-3 rounded-lg border transition-all duration-150"
              style={{
                backgroundColor: 'var(--info-bg)',
                borderColor: 'var(--info-border)'
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                <strong>{selectedIds.size}</strong> user{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('reset-password')}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('disable')}
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Disable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('start-review')}
                  className="gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  Start Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <IdentitiesDataTable
        data={filteredIdentities}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onRowClick={handleUserSelect}
        isLoading={isLoading}
      />

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Identities</DialogTitle>
            <DialogDescription>
              Add filters to narrow down the identity list
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(value) => addFilter('status', value, `Status: ${value}`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select onValueChange={(value) => addFilter('department', value, `Dept: ${value}`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select onValueChange={(value) => addFilter('risk', value, `Risk: ${value}`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Manager</Label>
              <Select onValueChange={(value) => addFilter('manager', value, `Manager: ${value}`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueManagers.map(mgr => (
                    <SelectItem key={mgr} value={mgr}>{mgr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Last Login</Label>
              <Select onValueChange={(value) => addFilter('lastLogin', value, 'Dormant (>30d)')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=">30d">More than 30 days ago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Drawer */}
      <IdentityDetailDrawer
        identity={selectedUser ? {
          ...selectedUser,
          rolesCount: selectedUser.roles,
          entitlementsCount: selectedUser.roles * 2,
          appsCount: 4,
          isPrivileged: selectedUser.risk === 'High' || selectedUser.risk === 'Critical',
          title: selectedUser.department === 'Finance' ? 'Financial Analyst' : 
                 selectedUser.department === 'IT' ? 'Software Engineer' :
                 selectedUser.department === 'Sales' ? 'Account Executive' :
                 selectedUser.department === 'HR' ? 'HR Manager' :
                 selectedUser.department === 'Marketing' ? 'Marketing Specialist' :
                 selectedUser.department === 'Engineering' ? 'Senior Engineer' : 'Employee',
          company: 'Acme Corporation',
          location: 'San Francisco, CA',
          lifecycleState: selectedUser.status === 'Active' ? 'Active Employee' : 
                          selectedUser.status === 'Inactive' ? 'On Leave' :
                          selectedUser.status === 'Disabled' ? 'Suspended' : 'Pending Activation',
          joinDate: '2023-01-15'
        } : null}
        open={!!selectedUser}
        onClose={() => handleUserSelect(null)}
      />

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Create New User
            </DialogTitle>
            <DialogDescription>
              Add a new user to the identity management system. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-4 h-4" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic personal details for the new user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={userFormData.firstName}
                      onChange={(e) => handleFormFieldChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={userFormData.lastName}
                      onChange={(e) => handleFormFieldChange('lastName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@company.com"
                        className="pl-10"
                        value={userFormData.email}
                        onChange={(e) => handleFormFieldChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        value={userFormData.phone}
                        onChange={(e) => handleFormFieldChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizational Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="w-4 h-4" />
                  Organizational Information
                </CardTitle>
                <CardDescription>
                  Department, manager, and job details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={userFormData.department} onValueChange={(value) => handleFormFieldChange('department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select value={userFormData.manager} onValueChange={(value) => handleFormFieldChange('manager', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alice-johnson">Alice Johnson</SelectItem>
                        <SelectItem value="mike-chen">Mike Chen</SelectItem>
                        <SelectItem value="sarah-patel">Sarah Patel</SelectItem>
                        <SelectItem value="jennifer-smith">Jennifer Smith</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Enter job title"
                    value={userFormData.jobTitle}
                    onChange={(e) => handleFormFieldChange('jobTitle', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-4 h-4" />
                  Access Control
                </CardTitle>
                <CardDescription>
                  Initial roles, status, and risk level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={userFormData.status} onValueChange={(value) => handleFormFieldChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskLevel">Risk Level</Label>
                    <Select value={userFormData.riskLevel} onValueChange={(value) => handleFormFieldChange('riskLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="w-4 h-4" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Username, password, and account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={userFormData.username}
                    onChange={(e) => handleFormFieldChange('username', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={userFormData.password}
                      onChange={(e) => handleFormFieldChange('password', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                    <Input
                      id="passwordConfirm"
                      type="password"
                      placeholder="Confirm password"
                      value={userFormData.passwordConfirm}
                      onChange={(e) => handleFormFieldChange('passwordConfirm', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountExpiration">Account Expiration</Label>
                  <Input
                    id="accountExpiration"
                    type="date"
                    value={userFormData.accountExpiration}
                    onChange={(e) => handleFormFieldChange('accountExpiration', e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sendWelcomeEmail">Send Welcome Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Send a welcome email with login instructions
                      </p>
                    </div>
                    <Switch
                      id="sendWelcomeEmail"
                      checked={userFormData.sendWelcomeEmail}
                      onCheckedChange={(checked) => handleFormFieldChange('sendWelcomeEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requirePasswordChange">Require Password Change</Label>
                      <p className="text-sm text-muted-foreground">
                        User must change password on first login
                      </p>
                    </div>
                    <Switch
                      id="requirePasswordChange"
                      checked={userFormData.requirePasswordChange}
                      onCheckedChange={(checked) => handleFormFieldChange('requirePasswordChange', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
                <CardDescription>
                  Any additional information about this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter any additional notes or comments..."
                  value={userFormData.notes}
                  onChange={(e) => handleFormFieldChange('notes', e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setShowCreateUserDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              disabled={isCreatingUser || !userFormData.firstName || !userFormData.lastName || !userFormData.email || !userFormData.department || !userFormData.username || !userFormData.password}
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              {isCreatingUser ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating User...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <InviteUserDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />

    </div>
  );
}