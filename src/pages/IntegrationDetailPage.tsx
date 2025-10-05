import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Zap,
  Settings2,
  TrendingUp,
  AlertTriangle,
  Database,
  Download,
  Search,
  TestTube,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsTrigger } from '../components/ui/tabs';
import { ScrollableTabsList } from '../components/ScrollableTabsList';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { JobRow, Job } from '../components/JobRow';
import { MappingRow, AttributeMapping } from '../components/MappingRow';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InstanceSwitcher } from '../components/InstanceSwitcher';
import { getInstanceById, getInstancesByConnectorType } from '../data/integration-instances';
import { BrandLogo } from '../components/BrandLogo';
import { ManagedAccountsTable } from '../components/ManagedAccountsTable';
import { AccountDetailDrawer } from '../components/AccountDetailDrawer';
import { IdentityLinkingModal } from '../components/IdentityLinkingModal';
import { azureAdAccounts, azureAdColumnPresets, mockMatchCandidates, type Account } from '../data/managed-accounts';

const mockIntegration = {
  id: '1',
  name: 'Active Directory',
  status: 'connected' as const,
  owner: 'IT Team',
  environment: 'Production',
  lastSync: '2 minutes ago',
  nextSync: 'In 4 hours',
  syncHealth: 98,
  users: 1247,
  schedule: 'Every 6 hours',
  errors: 0,
  warnings: 2,
};

const mockJobs: Job[] = [
  {
    id: '1',
    type: 'Full Sync',
    status: 'success',
    startTime: '2024-01-15 14:32',
    duration: '4m 23s',
    recordsProcessed: 1247,
    errors: 0,
    warnings: 0,
  },
  {
    id: '2',
    type: 'Delta Sync',
    status: 'success',
    startTime: '2024-01-15 08:15',
    duration: '1m 12s',
    recordsProcessed: 12,
    errors: 0,
    warnings: 2,
  },
  {
    id: '3',
    type: 'Full Sync',
    status: 'warning',
    startTime: '2024-01-15 02:00',
    duration: '4m 45s',
    recordsProcessed: 1245,
    errors: 0,
    warnings: 3,
  },
  {
    id: '4',
    type: 'Delta Sync',
    status: 'failed',
    startTime: '2024-01-14 20:30',
    duration: '0m 45s',
    recordsProcessed: 0,
    errors: 1,
    warnings: 0,
  },
];

const mockMappings: AttributeMapping[] = [
  { id: '1', sourceAttribute: 'sAMAccountName', targetAttribute: 'username', required: true, dataType: 'string' },
  { id: '2', sourceAttribute: 'mail', targetAttribute: 'email', required: true, dataType: 'string' },
  { id: '3', sourceAttribute: 'displayName', targetAttribute: 'fullName', required: true, dataType: 'string' },
  {
    id: '4',
    sourceAttribute: 'department',
    targetAttribute: 'department',
    transform: 'toUpperCase',
    required: false,
    dataType: 'string',
  },
  {
    id: '5',
    sourceAttribute: 'telephoneNumber',
    targetAttribute: 'phone',
    transform: 'formatPhone',
    required: false,
    dataType: 'string',
  },
  { id: '6', sourceAttribute: 'title', targetAttribute: 'jobTitle', required: false, dataType: 'string' },
];

const mockCatalogItems = [
  { id: '1', name: 'Domain Admin', type: 'Group', users: 12, lastUsed: '2 hours ago' },
  { id: '2', name: 'Finance Access', type: 'Group', users: 45, lastUsed: '5 minutes ago' },
  { id: '3', name: 'HR System', type: 'Application', users: 32, lastUsed: '1 hour ago' },
  { id: '4', name: 'VPN Access', type: 'Group', users: 156, lastUsed: '3 minutes ago' },
];

const mockAccounts = [
  { id: '1', username: 'alice.johnson', email: 'alice.j@company.com', status: 'Active', lastSync: '2 min ago' },
  { id: '2', username: 'bob.smith', email: 'bob.s@company.com', status: 'Active', lastSync: '2 min ago' },
  { id: '3', username: 'orphan.user', email: 'orphan@company.com', status: 'Orphaned', lastSync: '7 days ago' },
];

const mockLogs = [
  { id: '1', timestamp: '14:32:15', level: 'INFO', subsystem: 'Sync', message: 'Full sync completed successfully' },
  { id: '2', timestamp: '14:32:10', level: 'WARN', subsystem: 'Mapping', message: 'User alice.johnson missing phone number' },
  { id: '3', timestamp: '14:28:05', level: 'INFO', subsystem: 'Connection', message: 'Connected to AD server' },
  { id: '4', timestamp: '14:28:00', level: 'INFO', subsystem: 'Sync', message: 'Starting full sync job' },
];

const failuresChartData = [
  { date: 'Jan 10', failures: 0 },
  { date: 'Jan 11', failures: 1 },
  { date: 'Jan 12', failures: 0 },
  { date: 'Jan 13', failures: 0 },
  { date: 'Jan 14', failures: 1 },
  { date: 'Jan 15', failures: 0 },
];

export function IntegrationDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentTab, setCurrentTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  
  // Managed Accounts state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false);
  const [accountToLink, setAccountToLink] = useState<Account | null>(null);

  // Get the instance data
  const instance = id ? getInstanceById(id) : null;
  const relatedInstances = instance ? getInstancesByConnectorType(instance.connectorType) : [];

  const handleBack = () => {
    navigate('/integrations');
  };

  const handleInstanceSwitch = (newInstance: any) => {
    if (newInstance) {
      navigate(`/integrations/${newInstance.id}`);
    }
  };

  // Managed Accounts handlers
  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setAccountDrawerOpen(true);
  };

  const handleLinkClick = (account: Account) => {
    setAccountToLink(account);
    setLinkingModalOpen(true);
  };

  const handleLink = (accountId: string, identityId: string) => {
    console.log('Link account:', accountId, 'to identity:', identityId);
    // In real app, make API call to link
  };

  const handleCreateNewIdentity = (accountId: string) => {
    console.log('Create new identity for account:', accountId);
    // In real app, navigate to create identity flow
  };

  const handleIgnoreAccount = (accountId: string) => {
    console.log('Ignore account:', accountId);
    // In real app, mark account as ignored
  };

  // Get all unique attribute keys from accounts
  const availableAttributes = useMemo(() => {
    const keys = new Set<string>();
    azureAdAccounts.forEach((acc) => {
      Object.keys(acc.attributes).forEach((key) => keys.add(key));
    });
    return Array.from(keys).sort();
  }, []);

  // Use instance data if available, otherwise fallback to mock
  const integration = instance ? {
    ...mockIntegration,
    id: instance.id,
    name: instance.name,
    status: instance.status,
    owner: instance.owner,
    environment: instance.environment,
    lastSync: instance.lastSync,
    syncHealth: instance.health,
    users: instance.accountsCount || 0,
  } : mockIntegration;

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Container - wraps entire page for state management */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
        {/* Sticky Header with Tabs */}
        <div
          className="sticky top-0 z-10 border-b backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header Content */}
          <div className="p-4 lg:p-6 max-w-[1320px] mx-auto w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                {instance && (
                  <BrandLogo 
                    connectorType={instance.connectorType} 
                    size="lg"
                  />
                )}
                <div className="flex-1">
                  <h1
                    style={{
                      fontSize: 'var(--text-display)',
                      lineHeight: 'var(--line-height-display)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    {integration.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={integration.status} size="sm" />
                    <Badge variant="outline">{integration.environment}</Badge>
                    <Badge variant="outline">{integration.owner}</Badge>
                  </div>
                  
                  {/* Instance Switcher - Show if multiple instances of same type */}
                  {instance && relatedInstances.length > 1 && (
                    <div className="mt-4 max-w-xs">
                      <InstanceSwitcher
                        currentInstance={instance}
                        instances={relatedInstances}
                        onSelect={handleInstanceSwitch}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={() => toast.info('Testing connection...')}>
                  <Zap className="w-4 h-4" />
                  Test
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => toast.success('Syncing...')}>
                  <RefreshCw className="w-4 h-4" />
                  Sync
                </Button>
                <Button variant="outline" size="sm" className="w-9 h-9 p-0">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs Bar - Part of sticky header */}
          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="p-4 lg:px-6 lg:py-3 max-w-[1320px] mx-auto w-full">
              <ScrollableTabsList 
                className="w-full"
                role="tablist" 
                aria-label="Integration detail sections"
              >
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="provisioning">Provisioning</TabsTrigger>
                <TabsTrigger value="mappings">Mappings</TabsTrigger>
                <TabsTrigger value="catalog">Catalog Items</TabsTrigger>
                <TabsTrigger value="accounts">Accounts</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </ScrollableTabsList>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 max-w-[1320px] mx-auto w-full">

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status & Info */}
                  <Card className="p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <h3
                      style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                        marginBottom: '16px',
                      }}
                    >
                      Connection Status
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Last Sync
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockIntegration.lastSync}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Next Sync
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockIntegration.nextSync}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Schedule
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {mockIntegration.schedule}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                          Sync Health
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={mockIntegration.syncHealth} className="h-2 flex-1" />
                          <span
                            style={{
                              fontSize: 'var(--text-sm)',
                              color: 'var(--success)',
                              fontWeight: 'var(--font-weight-medium)',
                            }}
                          >
                            {mockIntegration.syncHealth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Failures Chart */}
                  <Card className="p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <h3
                      style={{
                        fontSize: 'var(--text-md)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                        marginBottom: '16px',
                      }}
                    >
                      Sync Failures (Last 7 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={failuresChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--popover)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                        <Bar dataKey="failures" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                {/* Right Column - Quick Stats */}
                <div className="space-y-4">
                  <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Total Users
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                      }}
                    >
                      {mockIntegration.users.toLocaleString()}
                    </div>
                  </Card>

                  <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Sync Health
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--success)',
                      }}
                    >
                      {mockIntegration.syncHealth}%
                    </div>
                  </Card>

                  {mockIntegration.warnings > 0 && (
                    <Card className="p-4" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>
                          Warnings
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-3xl)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--warning)',
                        }}
                      >
                        {mockIntegration.warnings}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Provisioning Tab */}
            <TabsContent value="provisioning" className="space-y-6">
              <Card className="p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{
                      fontSize: 'var(--text-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    Job History
                  </h3>
                  <Button variant="outline" size="sm">
                    Run Sync Now
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockJobs.map((job) => (
                      <JobRow
                        key={job.id}
                        job={job}
                        onRetry={(jobId) => toast.info(`Retrying job ${jobId}...`)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Mappings Tab */}
            <TabsContent value="mappings" className="space-y-6">
              <Card className="p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{
                      fontSize: 'var(--text-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    Attribute Mappings
                  </h3>
                  <Button variant="outline" size="sm" className="gap-2">
                    <TestTube className="w-4 h-4" />
                    Test Mapping
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Attribute</TableHead>
                      <TableHead className="text-center w-12"></TableHead>
                      <TableHead>Target Attribute</TableHead>
                      <TableHead>Transform</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Flags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMappings.map((mapping) => (
                      <MappingRow key={mapping.id} mapping={mapping} />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Catalog Items Tab */}
            <TabsContent value="catalog" className="space-y-6">
              <Card className="p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{
                      fontSize: 'var(--text-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    Catalog Items
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <Input placeholder="Search items..." className="pl-9 w-64" />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Last Used</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCatalogItems.map((item) => (
                      <TableRow key={item.id} className="transition-colors hover:bg-surface/50">
                        <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 'var(--font-weight-medium)' }}>
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                          {item.users}
                        </TableCell>
                        <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {item.lastUsed}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Accounts Tab */}
            <TabsContent value="accounts" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    Total Accounts
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    {mockAccounts.length}
                  </div>
                </Card>
                <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    Active
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--success)',
                    }}
                  >
                    {mockAccounts.filter((a) => a.status === 'Active').length}
                  </div>
                </Card>
                <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                    Orphaned
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--warning)',
                    }}
                  >
                    {mockAccounts.filter((a) => a.status === 'Orphaned').length}
                  </div>
                </Card>
              </div>

              <ManagedAccountsTable
                accounts={azureAdAccounts}
                availableAttributes={availableAttributes}
                columnPresets={azureAdColumnPresets}
                onAccountClick={handleAccountClick}
                onLinkClick={handleLinkClick}
              />
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <Card className="p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3
                    style={{
                      fontSize: 'var(--text-md)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    Activity Logs
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                      <Input
                        placeholder="Search logs..."
                        className="pl-9 w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={logLevel} onValueChange={setLogLevel}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="INFO">INFO</SelectItem>
                        <SelectItem value="WARN">WARN</SelectItem>
                        <SelectItem value="ERROR">ERROR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-96 rounded border" style={{ borderColor: 'var(--border)' }}>
                  <div className="p-4 space-y-2 font-mono text-xs">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-3 p-2 rounded hover:bg-surface/50"
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        <span style={{ color: 'var(--muted-foreground)', minWidth: '70px' }}>
                          {log.timestamp}
                        </span>
                        <Badge
                          variant="outline"
                          className="h-5"
                          style={{
                            backgroundColor:
                              log.level === 'ERROR'
                                ? 'var(--danger-bg)'
                                : log.level === 'WARN'
                                ? 'var(--warning-bg)'
                                : 'var(--info-bg)',
                            borderColor:
                              log.level === 'ERROR'
                                ? 'var(--danger-border)'
                                : log.level === 'WARN'
                                ? 'var(--warning-border)'
                                : 'var(--info-border)',
                            color:
                              log.level === 'ERROR'
                                ? 'var(--danger)'
                                : log.level === 'WARN'
                                ? 'var(--warning)'
                                : 'var(--info)',
                            fontSize: 'var(--text-xs)',
                            minWidth: '50px',
                            textAlign: 'center',
                          }}
                        >
                          {log.level}
                        </Badge>
                        <span style={{ color: 'var(--muted-foreground)', minWidth: '100px' }}>
                          [{log.subsystem}]
                        </span>
                        <span style={{ color: 'var(--text)' }}>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Account Detail Drawer */}
      <AccountDetailDrawer
        account={selectedAccount}
        open={accountDrawerOpen}
        onOpenChange={setAccountDrawerOpen}
        onLinkClick={handleLinkClick}
      />

      {/* Identity Linking Modal */}
      {accountToLink && (
        <IdentityLinkingModal
          account={accountToLink}
          candidates={mockMatchCandidates[accountToLink.id] || []}
          open={linkingModalOpen}
          onOpenChange={setLinkingModalOpen}
          onLink={handleLink}
          onCreateNew={handleCreateNewIdentity}
          onIgnore={handleIgnoreAccount}
        />
      )}
    </div>
  );
}
