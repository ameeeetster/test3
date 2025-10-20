import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Activity, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Users, Shield, Zap, Database, FileText, Download, Filter, Search,
  BarChart3, PieChart, LineChart, Eye, RefreshCw, Settings, Bell,
  Server, Cpu, HardDrive, Wifi, AlertTriangle, Info, XCircle
} from 'lucide-react';

interface MonitoringDashboardProps {
  mode?: 'overview' | 'detailed';
}

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  status: 'success' | 'failed' | 'pending' | 'blocked';
  duration: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceFlags: string[];
  correlationId: string;
  details: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'healthy' | 'warning' | 'critical';
}

interface Alert {
  id: string;
  type: 'performance' | 'security' | 'compliance' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  affectedSystems: string[];
  correlationId?: string;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: 'audit-001',
    timestamp: '2024-01-15T10:30:00Z',
    userId: 'user-123',
    userName: 'John Doe',
    action: 'Grant Role',
    target: 'Employee',
    status: 'success',
    duration: 120,
    riskLevel: 'low',
    complianceFlags: [],
    correlationId: 'corr-001',
    details: 'Standard employee role assignment'
  },
  {
    id: 'audit-002',
    timestamp: '2024-01-15T10:31:00Z',
    userId: 'user-124',
    userName: 'Jane Smith',
    action: 'Create Account',
    target: 'Salesforce',
    status: 'failed',
    duration: 5000,
    riskLevel: 'medium',
    complianceFlags: ['SoD Violation'],
    correlationId: 'corr-002',
    details: 'Account creation failed due to SoD conflict'
  },
  {
    id: 'audit-003',
    timestamp: '2024-01-15T10:32:00Z',
    userId: 'user-125',
    userName: 'Bob Wilson',
    action: 'Revoke Access',
    target: 'All Applications',
    status: 'success',
    duration: 800,
    riskLevel: 'high',
    complianceFlags: ['Offboarding'],
    correlationId: 'corr-003',
    details: 'Complete access revocation for terminated user'
  }
];

const mockPerformanceMetrics: PerformanceMetric[] = [
  {
    name: 'Average Execution Time',
    value: 1.2,
    unit: 'seconds',
    trend: 'down',
    threshold: { warning: 2.0, critical: 5.0 },
    status: 'healthy'
  },
  {
    name: 'Success Rate',
    value: 94.5,
    unit: '%',
    trend: 'up',
    threshold: { warning: 90, critical: 85 },
    status: 'healthy'
  },
  {
    name: 'Queue Depth',
    value: 15,
    unit: 'items',
    trend: 'stable',
    threshold: { warning: 50, critical: 100 },
    status: 'healthy'
  },
  {
    name: 'Error Rate',
    value: 2.1,
    unit: '%',
    trend: 'up',
    threshold: { warning: 5, critical: 10 },
    status: 'healthy'
  },
  {
    name: 'CPU Usage',
    value: 78,
    unit: '%',
    trend: 'up',
    threshold: { warning: 80, critical: 95 },
    status: 'warning'
  },
  {
    name: 'Memory Usage',
    value: 65,
    unit: '%',
    trend: 'stable',
    threshold: { warning: 85, critical: 95 },
    status: 'healthy'
  }
];

const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'performance',
    severity: 'medium',
    title: 'High CPU Usage Detected',
    description: 'CPU usage has exceeded 80% for the last 10 minutes',
    timestamp: '2024-01-15T10:25:00Z',
    status: 'active',
    affectedSystems: ['Workflow Engine', 'Policy Engine']
  },
  {
    id: 'alert-002',
    type: 'compliance',
    severity: 'high',
    title: 'SoD Violation Detected',
    description: 'User attempted to gain conflicting roles',
    timestamp: '2024-01-15T10:31:00Z',
    status: 'acknowledged',
    affectedSystems: ['Role Management'],
    correlationId: 'corr-002'
  },
  {
    id: 'alert-003',
    type: 'security',
    severity: 'critical',
    title: 'Unauthorized Access Attempt',
    description: 'Multiple failed authentication attempts detected',
    timestamp: '2024-01-15T10:35:00Z',
    status: 'active',
    affectedSystems: ['Authentication Service']
  }
];

export function MonitoringDashboard({ mode = 'overview' }: MonitoringDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const filteredAuditEvents = useMemo(() => {
    return mockAuditEvents.filter(event => {
      const matchesSearch = !searchQuery || 
        event.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.target.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSystem = selectedSystem === 'all' || 
        event.target.toLowerCase().includes(selectedSystem.toLowerCase());
      
      return matchesSearch && matchesSystem;
    });
  }, [searchQuery, selectedSystem]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'blocked': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Monitoring & Audit Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring, performance metrics, and comprehensive audit trails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-2xl font-bold text-green-600">98.5%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold">24</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Currently processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">94.5%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Require attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <CardDescription className="text-xs">
                Latest workflow executions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAuditEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <div className="text-sm font-medium">{event.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {event.userName} • {event.target}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getRiskColor(event.riskLevel)}`}>
                        {event.riskLevel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPerformanceMetrics.map(metric => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                        {metric.value}{metric.unit}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <Progress 
                      value={(metric.value / metric.threshold.critical) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Warning: {metric.threshold.warning}{metric.unit}</span>
                      <span>Critical: {metric.threshold.critical}{metric.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Resources</CardTitle>
              <CardDescription className="text-xs">
                Real-time system resource utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <span className="text-xs text-muted-foreground">78%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <span className="text-xs text-muted-foreground">65%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <span className="text-xs text-muted-foreground">45%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Trail Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Audit Trail</CardTitle>
              <CardDescription className="text-xs">
                Comprehensive audit log of all system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-xs">Time Range</Label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">System</Label>
                  <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Systems</SelectItem>
                      <SelectItem value="workflow">Workflow Engine</SelectItem>
                      <SelectItem value="policy">Policy Engine</SelectItem>
                      <SelectItem value="connector">Connectors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex-1">
                  <Label className="text-xs">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8 h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditEvents.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="text-xs">
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{event.userName}</div>
                            <div className="text-xs text-muted-foreground">{event.userId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{event.action}</TableCell>
                        <TableCell className="text-sm">{event.target}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(event.status)}
                            <Badge variant="outline" className={`text-xs ${getStatusColor(event.status)}`}>
                              {event.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{event.duration}ms</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(event.riskLevel)}`}>
                            {event.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Active Alerts */}
          <div className="space-y-4">
            {mockAlerts.map(alert => (
              <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : ''}>
                <div className="flex items-start gap-3">
                  {alert.severity === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  ) : alert.severity === 'high' ? (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Info className="h-4 w-4 text-blue-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'} className="text-xs">
                          {alert.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <AlertDescription className="text-sm">
                      {alert.description}
                    </AlertDescription>
                    <div className="mt-2">
                      <div className="text-xs text-muted-foreground mb-1">Affected Systems:</div>
                      <div className="flex flex-wrap gap-1">
                        {alert.affectedSystems.map(system => (
                          <Badge key={system} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>

          {/* Alert Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Alert Statistics</CardTitle>
              <CardDescription className="text-xs">
                Alert trends and resolution metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">1</div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">1</div>
                  <div className="text-xs text-muted-foreground">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">1</div>
                  <div className="text-xs text-muted-foreground">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-xs text-muted-foreground">Low</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

