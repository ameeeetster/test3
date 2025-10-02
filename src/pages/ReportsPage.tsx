import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { KPIChip } from '../components/reports/KPIChip';
import { ChartCard } from '../components/reports/ChartCard';
import { ReportCard } from '../components/reports/ReportCard';
import { FilterChip } from '../components/FilterChip';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { RiskChip } from '../components/RiskChip';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import {
  Plus,
  Calendar,
  Download,
  Search,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  Play,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  Database,
  FileText
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const kpiData = [
  { label: 'Access Requests', value: '1,247', trend: 'up' as const, trendValue: '+12%', filter: 'requests' },
  { label: 'Avg Approval SLA', value: '18h', trend: 'down' as const, trendValue: '-8%', filter: 'sla' },
  { label: 'Revokes', value: '89', trend: 'up' as const, trendValue: '+18%', filter: 'revokes' },
  { label: 'SoD Conflicts', value: '14', trend: 'down' as const, trendValue: '-3', filter: 'sod' },
  { label: 'Prov. Failures', value: '23', trend: 'down' as const, trendValue: '-12%', filter: 'failures' },
  { label: 'High-Risk IDs', value: '156', trend: 'up' as const, trendValue: '+5%', filter: 'risk' },
  { label: 'Dormant Accounts', value: '342', trend: 'down' as const, trendValue: '-22', filter: 'dormant' },
  { label: 'Reviewer Backlog', value: '67', trend: 'down' as const, trendValue: '-15%', filter: 'backlog' }
];

const requestTrendData = [
  { date: 'Jan', approved: 420, rejected: 45, provisioned: 380 },
  { date: 'Feb', approved: 380, rejected: 52, provisioned: 340 },
  { date: 'Mar', approved: 450, rejected: 48, provisioned: 410 },
  { date: 'Apr', approved: 520, rejected: 41, provisioned: 475 },
  { date: 'May', approved: 490, rejected: 38, provisioned: 445 },
  { date: 'Jun', approved: 560, rejected: 44, provisioned: 510 }
];

const revokesByDeptData = [
  { dept: 'Finance', revokes: 34, keeps: 156 },
  { dept: 'Engineering', revokes: 28, keeps: 289 },
  { dept: 'Sales', revokes: 19, keeps: 178 },
  { dept: 'Marketing', revokes: 15, keeps: 123 },
  { dept: 'Operations', revokes: 12, keeps: 145 },
  { dept: 'HR', revokes: 9, keeps: 98 },
  { dept: 'Legal', revokes: 7, keeps: 56 },
  { dept: 'IT', revokes: 6, keeps: 87 }
];

const funnelData = [
  { stage: 'Request', count: 1247, percentage: 100 },
  { stage: 'Approved', count: 1089, percentage: 87 },
  { stage: 'Provisioned', count: 998, percentage: 80 },
  { stage: 'First Login', count: 876, percentage: 70 }
];

const riskyApps = [
  { app: 'AWS Production', highRisk: 156, sod: 12, failures: 8, trend: [45, 52, 48, 61, 58, 67, 72] },
  { app: 'Salesforce', highRisk: 89, sod: 5, failures: 3, trend: [34, 38, 41, 39, 45, 48, 52] },
  { app: 'Workday', highRisk: 67, sod: 8, failures: 12, trend: [23, 28, 31, 35, 39, 42, 45] },
  { app: 'GitHub Enterprise', highRisk: 45, sod: 2, failures: 5, trend: [18, 22, 25, 28, 31, 35, 38] },
  { app: 'QuickBooks', highRisk: 34, sod: 6, failures: 2, trend: [12, 15, 18, 21, 24, 28, 31] }
];

const provFailures = [
  { resource: 'AWS IAM Role: DataAnalyst', reason: 'Permission boundary conflict', owner: 'Michael Chen', age: '2h', status: 'pending' },
  { resource: 'Salesforce Profile: Sales Manager', reason: 'License limit exceeded', owner: 'Sarah Johnson', age: '5h', status: 'retry' },
  { resource: 'GitHub Team: platform-eng', reason: 'API rate limit', owner: 'Emily Davis', age: '1d', status: 'failed' },
  { resource: 'Workday Role: HR Partner', reason: 'Security group not found', owner: 'James Wilson', age: '3h', status: 'pending' }
];

const dormantAccounts = [
  { user: 'Alice Cooper', app: 'Salesforce', lastUsed: '127 days ago', risk: 'High' as const },
  { user: 'Bob Martinez', app: 'AWS', lastUsed: '105 days ago', risk: 'Critical' as const },
  { user: 'Carol White', app: 'GitHub', lastUsed: '98 days ago', risk: 'Medium' as const },
  { user: 'David Brown', app: 'Workday', lastUsed: '92 days ago', risk: 'High' as const }
];

const mockReports = [
  {
    id: '1',
    name: 'Access Request Volume',
    description: 'Time series analysis of access requests by application',
    tags: ['Compliance', 'Monthly'],
    owner: { name: 'Sarah Johnson', avatar: 'SJ' },
    lastRun: '2 hours ago',
    sparklineData: [45, 52, 48, 61, 58, 67, 72]
  },
  {
    id: '2',
    name: 'Approval SLA Dashboard',
    description: 'SLA metrics by app and approver with breach alerts',
    tags: ['Operations', 'Real-time'],
    owner: { name: 'Michael Chen', avatar: 'MC' },
    scheduled: 'Daily 9AM',
    sparklineData: [34, 38, 41, 39, 45, 48, 52]
  },
  {
    id: '3',
    name: 'Revocations Analysis',
    description: 'Revocation trends by campaign and department',
    tags: ['Compliance', 'Quarterly'],
    owner: { name: 'Emily Davis', avatar: 'ED' },
    lastRun: '1 day ago',
    sparklineData: [23, 28, 31, 35, 39, 42, 45]
  },
  {
    id: '4',
    name: 'SoD Violations Report',
    description: 'Segregation of Duties conflicts by policy and application',
    tags: ['Security', 'Weekly'],
    owner: { name: 'James Wilson', avatar: 'JW' },
    scheduled: 'Weekly Mon',
    sparklineData: [18, 22, 25, 28, 31, 35, 38]
  }
];

export function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleKPIClick = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Reports & Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Generate compliance and audit insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Report
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b sticky top-16 bg-background z-10 -mx-6 px-6 -mt-2 pt-2">
              <TabsList className="h-auto p-0 bg-transparent border-0 gap-6">
                <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="library" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  Library
                </TabsTrigger>
                <TabsTrigger value="builder" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  Builder
                </TabsTrigger>
                <TabsTrigger value="schedules" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  Schedules
                </TabsTrigger>
                <TabsTrigger value="exports" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  Exports
                </TabsTrigger>
                <TabsTrigger value="sources" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3">
                  Data Sources
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {kpiData.map((kpi, idx) => (
                  <KPIChip
                    key={idx}
                    label={kpi.label}
                    value={kpi.value}
                    trend={kpi.trend}
                    trendValue={kpi.trendValue}
                    active={activeFilters.includes(kpi.filter)}
                    onClick={() => handleKPIClick(kpi.filter)}
                  />
                ))}
              </div>

              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {activeFilters.map(filter => (
                    <FilterChip
                      key={filter}
                      label={kpiData.find(k => k.filter === filter)?.label || filter}
                      onRemove={() => handleRemoveFilter(filter)}
                    />
                  ))}
                  <Button variant="ghost" size="sm" onClick={handleClearAllFilters} className="h-7 text-xs">
                    Clear all
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Request Lifecycle Trends" subtitle="Approved, Rejected, and Provisioned (Last 6 months)">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={requestTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="approved" stackId="1" stroke="var(--success)" fill="var(--success)" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="rejected" stackId="1" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="provisioned" stackId="1" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Revokes vs Keeps by Department" subtitle="Top 8 departments (Current review cycle)">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={revokesByDeptData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                      <YAxis dataKey="dept" type="category" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revokes" fill="var(--danger)" />
                      <Bar dataKey="keeps" fill="var(--success)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Request to First Login Funnel" subtitle="Conversion rates at each stage">
                  <div className="space-y-3 py-4">
                    {funnelData.map((stage, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-muted-foreground">
                            {stage.count.toLocaleString()} ({stage.percentage}%)
                          </span>
                        </div>
                        <div className="h-10 bg-accent rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all flex items-center justify-end pr-3 text-xs text-white font-medium"
                            style={{ width: `${stage.percentage}%` }}
                          >
                            {stage.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex gap-2">
                        <TrendingUp className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-1">Revokes up 18% WoW</p>
                          <p className="text-xs text-muted-foreground">Driven by Salesforce Admin Role cleanup campaign</p>
                          <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                            Show affected campaigns →
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-1">Provisioning failures spiked</p>
                          <p className="text-xs text-muted-foreground">Workday connector experiencing issues (12 failures in 24h)</p>
                          <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                            Open failing connectors →
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex gap-2">
                        <TrendingDown className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-1">Approval SLA improved</p>
                          <p className="text-xs text-muted-foreground">Average time reduced from 22h to 18h (8% improvement)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Top Risky Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Application</TableHead>
                          <TableHead>High-Risk Items</TableHead>
                          <TableHead>SoD Conflicts</TableHead>
                          <TableHead>Failed Prov.</TableHead>
                          <TableHead>Trend</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riskyApps.map((app, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{app.app}</TableCell>
                            <TableCell>{app.highRisk}</TableCell>
                            <TableCell>
                              {app.sod > 0 ? <Badge variant="destructive">{app.sod}</Badge> : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              {app.failures > 0 ? <Badge variant="outline">{app.failures}</Badge> : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              <MiniTrendline data={app.trend} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Recent Provisioning Failures</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {provFailures.map((failure, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-accent/50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{failure.resource}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{failure.reason}</p>
                              </div>
                              <Badge variant={failure.status === 'failed' ? 'destructive' : 'secondary'} className="ml-2">
                                {failure.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{failure.owner}</span>
                              <span>{failure.age}</span>
                            </div>
                            {failure.status !== 'failed' && (
                              <Button variant="outline" size="sm" className="w-full mt-2 h-7 text-xs">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Retry
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Dormant Account Candidates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Application</TableHead>
                            <TableHead>Last Used</TableHead>
                            <TableHead>Risk</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dormantAccounts.map((account, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{account.user}</TableCell>
                              <TableCell>{account.app}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{account.lastUsed}</TableCell>
                              <TableCell>
                                <RiskChip risk={account.risk} size="sm" />
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                  Revoke
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="library" className="mt-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                  <div className="flex border rounded-lg p-0.5">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Report Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {mockReports.map(report => (
                    <ReportCard
                      key={report.id}
                      name={report.name}
                      description={report.description}
                      tags={report.tags}
                      owner={report.owner}
                      lastRun={report.lastRun}
                      scheduled={report.scheduled}
                      sparklineData={report.sparklineData}
                      onRun={() => toast.success(`Running ${report.name}...`)}
                      onEdit={() => toast.info('Opening report builder...')}
                      onShare={() => toast.info('Opening share dialog...')}
                      onSchedule={() => toast.info('Opening schedule dialog...')}
                      onExport={() => toast.success('Exporting report...')}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="builder" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Report Builder</h3>
                    <p className="text-sm text-muted-foreground mb-4">No-code report builder with visual query interface</p>
                    <Button>Start Building</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedules" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Scheduled Reports</h3>
                    <p className="text-sm text-muted-foreground mb-4">Manage automated report generation and delivery</p>
                    <Button>Create Schedule</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exports" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Export History</h3>
                    <p className="text-sm text-muted-foreground mb-4">View and download previously generated reports</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Data Sources</h3>
                    <p className="text-sm text-muted-foreground mb-4">Monitor connector health and data freshness</p>
                    <Button>View Connectors</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function MiniTrendline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const isUptrend = data[data.length - 1] > data[0];

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={isUptrend ? 'var(--danger)' : 'var(--success)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
