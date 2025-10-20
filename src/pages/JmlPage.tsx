// JML (Joiner/Mover/Leaver) Main Page
// Production-ready Identity Lifecycle Management module

import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  Users, UserPlus, UserCog, UserMinus, BarChart3, Shield, 
  FileText, Activity, AlertCircle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Zap, Search, Filter, Download,
  Plus, Eye, Edit, Copy, MoreHorizontal, RefreshCw
} from 'lucide-react';
import { mockDataService, DEMO_METRICS, DEMO_TRENDS } from '../services/mockDataService';
import { JmlRequest, JmlType, JmlStatus, RiskLevel } from '../types/jml';
import { JoinerWizard } from '../components/jml/JoinerWizard';
import { MoverWizard } from '../components/jml/MoverWizard';
import { LeaverWizard } from '../components/jml/LeaverWizard';
import { JmlRequestDetails } from '../components/jml/JmlRequestDetails';
import { PoliciesWorkspace } from '../components/jml/PoliciesWorkspace';

export function JmlPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    status: '',
    riskLevel: '',
    department: ''
  });
  
  // Wizard and details state
  const [showJoinerWizard, setShowJoinerWizard] = useState(false);
  const [showMoverWizard, setShowMoverWizard] = useState(false);
  const [showLeaverWizard, setShowLeaverWizard] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JmlRequest | null>(null);

  // Get data from mock service
  const jmlRequests = mockDataService.getJmlRequests();
  const metrics = mockDataService.getMetrics();
  const trends = mockDataService.getTrends();

  // Filter requests based on search and filters
  const filteredRequests = useMemo(() => {
    return jmlRequests.filter(request => {
      const matchesSearch = !searchQuery || 
        request.identity.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.identity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.comments?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !selectedFilters.type || request.type === selectedFilters.type;
      const matchesStatus = !selectedFilters.status || request.status === selectedFilters.status;
      const matchesRisk = !selectedFilters.riskLevel || request.riskLevel === selectedFilters.riskLevel;
      const matchesDept = !selectedFilters.department || request.identity.department === selectedFilters.department;

      return matchesSearch && matchesType && matchesStatus && matchesRisk && matchesDept;
    });
  }, [jmlRequests, searchQuery, selectedFilters]);

  // Calculate overview metrics
  const overviewMetrics = useMemo(() => {
    const pending = jmlRequests.filter(r => r.status === 'PENDING_APPROVAL').length;
    const inProgress = jmlRequests.filter(r => r.status === 'IN_PROGRESS').length;
    const completed = jmlRequests.filter(r => r.status === 'COMPLETED').length;
    const failed = jmlRequests.filter(r => r.status === 'FAILED').length;
    const highRisk = jmlRequests.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;

    return { pending, inProgress, completed, failed, highRisk };
  }, [jmlRequests]);

  const getStatusColor = (status: JmlStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: JmlType) => {
    switch (type) {
      case 'JOINER': return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'MOVER': return <UserCog className="w-4 h-4 text-blue-600" />;
      case 'LEAVER': return <UserMinus className="w-4 h-4 text-red-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  // Handler functions
  const handleJoinerComplete = (request: any) => {
    console.log('Joiner request completed:', request);
    setShowJoinerWizard(false);
    // TODO: Add to requests list
  };

  const handleMoverComplete = (request: any) => {
    console.log('Mover request completed:', request);
    setShowMoverWizard(false);
    // TODO: Add to requests list
  };

  const handleLeaverComplete = (request: any) => {
    console.log('Leaver request completed:', request);
    setShowLeaverWizard(false);
    // TODO: Add to requests list
  };

  const handleRequestUpdate = (updatedRequest: JmlRequest) => {
    console.log('Request updated:', updatedRequest);
    // TODO: Update request in list
  };

  const handleViewRequest = (request: JmlRequest) => {
    setSelectedRequest(request);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-16 z-10 bg-background border-b">
        <div className="p-6 max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold">Identity Lifecycle Management</h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Activity className="w-3 h-3 mr-1" />
                  JML
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered Joiner, Mover, and Leaver processes with enterprise controls
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" onClick={() => setShowJoinerWizard(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1800px] mx-auto w-full flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="joiners">Joiners</TabsTrigger>
            <TabsTrigger value="movers">Movers</TabsTrigger>
            <TabsTrigger value="leavers">Leavers</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{overviewMetrics.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{overviewMetrics.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Currently executing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{overviewMetrics.completed}</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Open Failures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overviewMetrics.failed}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{overviewMetrics.highRisk}</div>
                  <p className="text-xs text-muted-foreground">Require review</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Spotlight */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  AI Spotlight
                </CardTitle>
                <CardDescription>Natural language commands for JML processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Try: 'Create joiner for Ava Patel starting 2025-01-15 in Finance, London'"
                      className="flex-1"
                    />
                    <Button>Parse</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Create joiner for Ava Patel starting 2025-01-15 in Finance, London, manager EMP00123',
                      'Move EMP00987 to Engineering (DevOps) next Monday 09:00; propose access',
                      'Terminate EMP00421 today 17:00; immediate disable; mailbox retain 30 days',
                      'Explain why Salesforce Admin was suggested for EMP00777; show SoD risks'
                    ].map((command, index) => (
                      <Button key={index} variant="outline" size="sm" className="text-xs">
                        {command}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trends */}
            <Card>
              <CardHeader>
                <CardTitle>JML Volume Trends</CardTitle>
                <CardDescription>Weekly trends for Joiner, Mover, and Leaver processes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends.slice(-7).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">{trend.date}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-green-600">
                            {trend.joiners} Joiners
                          </Badge>
                          <Badge variant="outline" className="text-blue-600">
                            {trend.movers} Movers
                          </Badge>
                          <Badge variant="outline" className="text-red-600">
                            {trend.leavers} Leavers
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Risk: {Object.values(trend.riskDistribution).reduce((a, b) => a + b, 0)} total
                        </span>
                        {trend.slaBreaches > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {trend.slaBreaches} SLA breach
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest JML requests and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jmlRequests.slice(0, 5).map(request => (
                    <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(request.type)}
                        <div className={`w-2 h-2 rounded-full ${
                          request.status === 'COMPLETED' ? 'bg-green-500' : 
                          request.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                          request.status === 'PENDING_APPROVAL' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{request.identity.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.type} • {request.identity.department} • {request.comments}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getRiskColor(request.riskLevel)}`}>
                          {request.riskLevel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Joiners Tab */}
          <TabsContent value="joiners" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Joiner Requests</h2>
                <p className="text-sm text-muted-foreground">New hire onboarding and access provisioning</p>
              </div>
              <Button onClick={() => setShowJoinerWizard(true)}>
                <UserPlus className="w-4 h-4 mr-1" />
                New Joiner
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Joiner Requests</CardTitle>
                <CardDescription>New hire onboarding in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.type === 'JOINER').map(request => (
                    <div key={request.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <UserPlus className="w-5 h-5 text-green-600" />
                          <div>
                            <h4 className="font-medium">{request.identity.displayName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.identity.department} • {request.identity.employmentType} • Start: {request.effectiveDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(request.riskLevel)}`}>
                            {request.riskLevel}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{request.changeSet.addedRoles.length} roles</span>
                          <span>{request.changeSet.addedEntitlements.length} entitlements</span>
                          <span>{request.approvals.length} approvals</span>
                          <span>{request.tasks.length} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Movers Tab */}
          <TabsContent value="movers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Mover Requests</h2>
                <p className="text-sm text-muted-foreground">Role changes and access modifications</p>
              </div>
              <Button onClick={() => setShowMoverWizard(true)}>
                <UserCog className="w-4 h-4 mr-1" />
                New Mover
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Mover Requests</CardTitle>
                <CardDescription>Role and access changes in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.type === 'MOVER').map(request => (
                    <div key={request.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <UserCog className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{request.identity.displayName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.changeSet.modifiedAttributes.department ? 
                                `${request.changeSet.modifiedAttributes.department.before} → ${request.changeSet.modifiedAttributes.department.after}` :
                                'Role change'
                              } • Effective: {request.effectiveDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(request.riskLevel)}`}>
                            {request.riskLevel}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>+{request.changeSet.addedRoles.length} roles</span>
                          <span>-{request.changeSet.removedRoles.length} roles</span>
                          <span>+{request.changeSet.addedEntitlements.length} entitlements</span>
                          <span>-{request.changeSet.removedEntitlements.length} entitlements</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leavers Tab */}
          <TabsContent value="leavers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Leaver Requests</h2>
                <p className="text-sm text-muted-foreground">Offboarding and access revocation</p>
              </div>
              <Button onClick={() => setShowLeaverWizard(true)}>
                <UserMinus className="w-4 h-4 mr-1" />
                New Leaver
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Leaver Requests</CardTitle>
                <CardDescription>Termination and offboarding in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRequests.filter(r => r.type === 'LEAVER').map(request => (
                    <div key={request.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <UserMinus className="w-5 h-5 text-red-600" />
                          <div>
                            <h4 className="font-medium">{request.identity.displayName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.identity.department} • Effective: {request.effectiveDate} {request.effectiveTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(request.riskLevel)}`}>
                            {request.riskLevel}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>-{request.changeSet.removedRoles.length} roles</span>
                          <span>-{request.changeSet.removedEntitlements.length} entitlements</span>
                          <span>{request.tasks.filter(t => t.state === 'COMPLETED').length}/{request.tasks.length} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">All Requests</h2>
                <p className="text-sm text-muted-foreground">Complete view of all JML requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={selectedFilters.type}
                      onChange={e => setSelectedFilters({...selectedFilters, type: e.target.value})}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="JOINER">Joiners</option>
                      <option value="MOVER">Movers</option>
                      <option value="LEAVER">Leavers</option>
                    </select>
                    <select 
                      value={selectedFilters.status}
                      onChange={e => setSelectedFilters({...selectedFilters, status: e.target.value})}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                    </select>
                    <select 
                      value={selectedFilters.riskLevel}
                      onChange={e => setSelectedFilters({...selectedFilters, riskLevel: e.target.value})}
                      className="px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="">All Risk Levels</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Requests ({filteredRequests.length})</CardTitle>
                <CardDescription>All JML requests with current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRequests.map(request => (
                    <div key={request.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(request.type)}
                          <div>
                            <h4 className="font-medium">{request.identity.displayName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {request.type} • {request.identity.department} • Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getRiskColor(request.riskLevel)}`}>
                            {request.riskLevel}
                          </Badge>
                          {request.slaBreached && (
                            <Badge variant="destructive" className="text-xs">
                              SLA Breached
                            </Badge>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Submitted by {request.submittedByName}</span>
                          <span>Effective: {request.effectiveDate}</span>
                          <span>{request.approvals.length} approvals</span>
                          <span>{request.tasks.length} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <PoliciesWorkspace />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>Risk analysis, SLA tracking, and AI insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard will be implemented in the next phase.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit & Exports</CardTitle>
                <CardDescription>Immutable audit trails and evidence packs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Audit and export features will be implemented in the next phase.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Wizards and Details */}
      {showJoinerWizard && (
        <JoinerWizard
          onClose={() => setShowJoinerWizard(false)}
          onComplete={handleJoinerComplete}
        />
      )}

      {showMoverWizard && (
        <MoverWizard
          onClose={() => setShowMoverWizard(false)}
          onComplete={handleMoverComplete}
        />
      )}

      {showLeaverWizard && (
        <LeaverWizard
          onClose={() => setShowLeaverWizard(false)}
          onComplete={handleLeaverComplete}
        />
      )}

      {selectedRequest && (
        <JmlRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={handleRequestUpdate}
        />
      )}
    </div>
  );
}
