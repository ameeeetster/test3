import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RiskChip } from '../components/RiskChip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  ArrowLeft, Users, Package, AlertTriangle,
  TrendingUp, Clock, Activity
} from 'lucide-react';

// Mock data
const mockRole = {
  id: 'R-1001',
  name: 'Financial Controller',
  description: 'Full financial system access with approval authority',
  purpose: 'This role provides comprehensive access to financial systems including accounting, procurement, and budgeting. Members can create and approve financial transactions up to $100,000.',
  owner: { name: 'Sarah Johnson', email: 'sarah.j@company.com', avatar: 'SJ' },
  risk: 'High' as const,
  members: 12,
  entitlements: 24,
  applications: ['💰 Procurement', '📊 QuickBooks', '🏦 Treasury'],
  createdDate: 'Jan 15, 2024',
  lastModified: '2 days ago'
};

const mockMembers = [
  { id: 'U-1', name: 'Alice Martinez', email: 'alice.m@company.com', dept: 'Finance', manager: 'Sarah Johnson', lastUsed: '2 hours ago', risk: 'Low' as const },
  { id: 'U-2', name: 'Bob Smith', email: 'bob.s@company.com', dept: 'Finance', manager: 'Sarah Johnson', lastUsed: '1 day ago', risk: 'Low' as const },
  { id: 'U-3', name: 'Carol White', email: 'carol.w@company.com', dept: 'Accounting', manager: 'David Lee', lastUsed: '5 days ago', risk: 'Medium' as const },
  { id: 'U-4', name: 'David Chen', email: 'david.c@company.com', dept: 'Treasury', manager: 'Sarah Johnson', lastUsed: '3 hours ago', risk: 'Low' as const }
];

const mockEntitlements = [
  { id: 'E-1', name: 'Create Purchase Orders', app: 'Procurement', appIcon: '💰', type: 'Permission', risk: 'High' as const, lastUsed: 87 },
  { id: 'E-3', name: 'View Financial Reports', app: 'QuickBooks', appIcon: '📊', type: 'Data Access', risk: 'Medium' as const, lastUsed: 95 }
];

export function RoleDetailPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/access/roles')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roles
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 style={{
                  fontSize: 'var(--text-display)',
                  lineHeight: 'var(--line-height-display)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  {mockRole.name}
                </h1>
                <RiskChip risk={mockRole.risk} />
              </div>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--text-secondary)' }}>
                {mockRole.description}
              </p>

              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {mockRole.members} members
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {mockRole.entitlements} entitlements
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    Modified {mockRole.lastModified}
                  </span>
                </div>
              </div>
            </div>

            <Button>
              Edit Role
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
        <div className="border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="px-4 lg:px-6 max-w-[1440px] mx-auto">
            <TabsList className="h-12 bg-transparent border-0 p-0 gap-6">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0">
                Overview
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0">
                Members
              </TabsTrigger>
              <TabsTrigger value="entitlements" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0">
                Entitlements
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent px-0">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-6">
                {/* Role Information */}
                <div className="border rounded-lg p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <h2 style={{
                    fontSize: 'var(--text-h2)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '16px'
                  }}>
                    Role Information
                  </h2>
                  
                  <div className="grid gap-4">
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '4px' }}>
                        Purpose
                      </div>
                      <p style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                        {mockRole.purpose}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Owner
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {mockRole.owner.name}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '4px' }}>
                          Created
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {mockRole.createdDate}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: '8px' }}>
                        Applications
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mockRole.applications.map((app, idx) => (
                          <Badge key={idx} variant="outline">
                            {app}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Members</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>
                      {mockRole.members}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Entitlements</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>
                      {mockRole.entitlements}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4" style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Avg Usage</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text)' }}>
                      91%
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              <div className="border rounded-lg" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback style={{ fontSize: '11px' }}>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                                {member.name}
                              </div>
                              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.dept}</TableCell>
                        <TableCell>{member.manager}</TableCell>
                        <TableCell>{member.lastUsed}</TableCell>
                        <TableCell>
                          <RiskChip risk={member.risk} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="entitlements" className="mt-0">
              <div className="border rounded-lg" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entitlement</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEntitlements.map((ent) => (
                      <TableRow key={ent.id}>
                        <TableCell>
                          <div style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
                            {ent.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{ent.appIcon}</span>
                            <span>{ent.app}</span>
                          </div>
                        </TableCell>
                        <TableCell>{ent.type}</TableCell>
                        <TableCell>{ent.lastUsed}%</TableCell>
                        <TableCell>
                          <RiskChip risk={ent.risk} size="sm" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <div className="border rounded-lg p-6" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <p style={{ fontSize: 'var(--text-body)', color: 'var(--muted)', textAlign: 'center' }}>
                  Activity timeline coming soon
                </p>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
