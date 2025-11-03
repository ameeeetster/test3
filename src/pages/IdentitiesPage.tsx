import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Plus, Eye, MoreVertical } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { AIPanel } from '../components/AIPanel';
import { InviteUserDialog } from '../components/InviteUserDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const identities = [
  {
    id: '1',
    name: 'J. Smith',
    email: 'j.smith@company.com',
    department: 'Finance',
    manager: 'A. Johnson',
    status: 'Active',
    risk: 'Medium',
    roles: 5,
    lastLogin: '2024-09-30'
  },
  {
    id: '2',
    name: 'R. Kumar',
    email: 'r.kumar@company.com',
    department: 'IT',
    manager: 'M. Chen',
    status: 'Active',
    risk: 'High',
    roles: 12,
    lastLogin: '2024-09-30'
  },
  {
    id: '3',
    name: 'M. Chen',
    email: 'm.chen@company.com',
    department: 'Sales',
    manager: 'S. Patel',
    status: 'Active',
    risk: 'Low',
    roles: 3,
    lastLogin: '2024-09-29'
  },
  {
    id: '4',
    name: 'A. Johnson',
    email: 'a.johnson@company.com',
    department: 'HR',
    manager: 'J. Smith',
    status: 'Active',
    risk: 'Low',
    roles: 4,
    lastLogin: '2024-09-28'
  },
  {
    id: '5',
    name: 'S. Patel',
    email: 's.patel@company.com',
    department: 'Finance',
    manager: 'A. Johnson',
    status: 'Inactive',
    risk: 'Medium',
    roles: 7,
    lastLogin: '2024-08-15'
  },
];

const userAccess = [
  { app: 'Oracle ERP', role: 'AP Read', granted: '2024-01-15', lastUsed: '2024-09-29' },
  { app: 'Salesforce', role: 'Sales User', granted: '2024-02-20', lastUsed: '2024-09-28' },
  { app: 'Microsoft 365', role: 'E3 License', granted: '2024-01-10', lastUsed: '2024-09-30' },
  { app: 'AWS', role: 'Developer', granted: '2024-03-05', lastUsed: '2024-09-25' },
  { app: 'Azure AD', role: 'User', granted: '2024-01-10', lastUsed: '2024-09-30' },
];

const userActivity = [
  { action: 'Login', resource: 'Oracle ERP', timestamp: '2024-09-30 09:15', status: 'Success' },
  { action: 'Access Request', resource: 'SharePoint Finance', timestamp: '2024-09-29 14:30', status: 'Pending' },
  { action: 'Password Reset', resource: 'Azure AD', timestamp: '2024-09-28 11:20', status: 'Success' },
  { action: 'Role Change', resource: 'Salesforce', timestamp: '2024-09-27 16:45', status: 'Completed' },
];

const aiSuggestions = [
  {
    type: 'recommendation' as const,
    title: 'Unused access detected',
    description: 'AWS Developer role not used in 90+ days',
    action: 'Review access'
  },
  {
    type: 'alert' as const,
    title: 'Elevated privileges',
    description: 'User has admin rights in 3 critical systems',
    action: 'Validate need'
  }
];

export function IdentitiesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUser, setSelectedUser] = useState<typeof identities[0] | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Helper function to normalize name to URL-friendly format
  const normalizeNameToId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Effect to handle userId from URL params
  useEffect(() => {
    if (userId) {
      // Find the user that matches the userId
      const user = identities.find(
        identity => normalizeNameToId(identity.name) === userId
      );
      if (user) {
        setSelectedUser(user);
        // Handle tab from location state
        const state = location.state as { tab?: string } | null;
        if (state?.tab === 'access-history') {
          setActiveTab('activity');
        } else if (state?.tab) {
          setActiveTab(state.tab);
        } else {
          setActiveTab('overview');
        }
      }
    } else {
      // Clear selection when no userId in URL
      setSelectedUser(null);
      setActiveTab('overview');
    }
  }, [userId, location.state]);

  // Update URL when user is selected/deselected
  const handleUserSelect = (user: typeof identities[0] | null) => {
    setSelectedUser(user);
    if (user) {
      navigate(`/identities/${normalizeNameToId(user.name)}`, { 
        state: location.state 
      });
    } else {
      navigate('/identities');
      setActiveTab('overview'); // Reset to default tab
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--muted)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'var(--success)';
      case 'inactive':
        return 'var(--muted)';
      default:
        return 'var(--muted)';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
            style={{ backgroundColor: 'var(--primary)' }}
            onClick={() => setShowInviteDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <Input 
              placeholder="Search users..." 
              className="pl-10"
              style={{ backgroundColor: 'var(--surface)' }}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Card style={{ 
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden'
      }}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: 'var(--border)' }}>
                <TableHead style={{ color: 'var(--muted)' }}>User</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Department</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Manager</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Status</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Risk</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Roles</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Last Login</TableHead>
                <TableHead style={{ color: 'var(--muted)' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {identities.map((user) => (
                <TableRow 
                  key={user.id}
                  style={{ borderColor: 'var(--border)' }}
                  className="cursor-pointer hover:bg-opacity-50"
                  onClick={() => handleUserSelect(user)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div style={{ color: 'var(--text)', fontWeight: 'var(--font-weight-medium)' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text)' }}>{user.department}</TableCell>
                  <TableCell style={{ color: 'var(--text)' }}>{user.manager}</TableCell>
                  <TableCell>
                    <Badge 
                      className="text-white"
                      style={{ 
                        backgroundColor: getStatusColor(user.status),
                        fontSize: 'var(--text-caption)'
                      }}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className="text-white"
                      style={{ 
                        backgroundColor: getRiskColor(user.risk),
                        fontSize: 'var(--text-caption)'
                      }}
                    >
                      {user.risk}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: 'var(--text)' }}>{user.roles}</TableCell>
                  <TableCell style={{ color: 'var(--text)' }}>{user.lastLogin}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserSelect(user);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* User Detail SlideOver */}
      <Sheet open={!!selectedUser} onOpenChange={() => handleUserSelect(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto" style={{ backgroundColor: 'var(--bg)' }}>
          {selectedUser && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '20px' }}>
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle style={{ color: 'var(--text)', marginBottom: '4px' }}>
                      {selectedUser.name}
                    </SheetTitle>
                    <p style={{ fontSize: 'var(--text-body)', color: 'var(--muted)' }}>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <SheetDescription className="sr-only">
                  User profile information, access details, and activity history
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start" style={{ backgroundColor: 'var(--surface)' }}>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="access">Access</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Department
                        </div>
                        <div style={{ color: 'var(--text)' }}>
                          {selectedUser.department}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Manager
                        </div>
                        <div style={{ color: 'var(--text)' }}>
                          {selectedUser.manager}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Status
                        </div>
                        <Badge 
                          className="text-white"
                          style={{ backgroundColor: getStatusColor(selectedUser.status) }}
                        >
                          {selectedUser.status}
                        </Badge>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Risk Level
                        </div>
                        <Badge 
                          className="text-white"
                          style={{ backgroundColor: getRiskColor(selectedUser.risk) }}
                        >
                          {selectedUser.risk}
                        </Badge>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Total Roles
                        </div>
                        <div style={{ color: 'var(--text)' }}>
                          {selectedUser.roles}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Last Login
                        </div>
                        <div style={{ color: 'var(--text)' }}>
                          {selectedUser.lastLogin}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button size="sm" style={{ backgroundColor: 'var(--primary)' }}>
                        Edit User
                      </Button>
                      <Button size="sm" variant="outline">
                        Request Access
                      </Button>
                      <Button size="sm" variant="outline" style={{ color: 'var(--danger)' }}>
                        Offboard
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="access" className="mt-6">
                    <div className="space-y-3">
                      {userAccess.map((access, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg"
                          style={{ 
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 style={{ 
                                fontSize: 'var(--text-body)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--text)',
                                marginBottom: '4px'
                              }}>
                                {access.app}
                              </h4>
                              <p style={{ 
                                fontSize: 'var(--text-body)',
                                color: 'var(--text)',
                                marginBottom: '8px'
                              }}>
                                {access.role}
                              </p>
                              <div className="flex gap-4" style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                                <span>Granted: {access.granted}</span>
                                <span>Last Used: {access.lastUsed}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-6">
                    <div className="space-y-3">
                      {userActivity.map((activity, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg"
                          style={{ 
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 style={{ 
                              fontSize: 'var(--text-body)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--text)'
                            }}>
                              {activity.action}
                            </h4>
                            <Badge 
                              className="text-white"
                              style={{ 
                                backgroundColor: activity.status === 'Success' || activity.status === 'Completed' 
                                  ? 'var(--success)' 
                                  : 'var(--warning)',
                                fontSize: 'var(--text-caption)'
                              }}
                            >
                              {activity.status}
                            </Badge>
                          </div>
                          <p style={{ fontSize: 'var(--text-body)', color: 'var(--text)', marginBottom: '4px' }}>
                            {activity.resource}
                          </p>
                          <p style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                            {activity.timestamp}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-6">
                    <AIPanel suggestions={aiSuggestions} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Invite User Dialog */}
      <InviteUserDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />
    </div>
  );
}