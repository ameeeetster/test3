import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { SectionCard } from '../components/settings/SectionCard';
import { CardMetadata } from '../components/settings/CardMetadata';
import { DiffDrawer } from '../components/settings/DiffDrawer';
import { ConditionBuilder, Condition } from '../components/lifecycle/ConditionBuilder';
import { ActionPicker, Action } from '../components/lifecycle/ActionPicker';
import { MappingTable, AttributeMapping } from '../components/lifecycle/MappingRow';
import { SimulationDrawer } from '../components/lifecycle/SimulationDrawer';
import { PriorityList, LifecycleRule } from '../components/lifecycle/PriorityList';
import { RuleStatusBadge } from '../components/lifecycle/RuleStatusBadge';
import { 
  Plus, Play, Database, UserPlus, UserCog, UserMinus, TriangleAlert as AlertTriangle, 
  Calendar, Settings, Workflow, Shield, Clock, AlertCircle, CheckCircle, 
  BarChart3, Activity, Zap, GitBranch, Layers, Target, Filter, 
  ChevronRight, ChevronDown, Eye, Edit, Copy, Trash2, MoreHorizontal,
  TrendingUp, Users, Lock, Unlock, RefreshCw, Pause, PlayCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Section {
  id: string;
  label: string;
  icon: any;
  description: string;
  badge?: string;
}

const sections: Section[] = [
  { 
    id: 'overview', 
    label: 'Dashboard', 
    icon: BarChart3, 
    description: 'Overview and key metrics',
    badge: 'Live'
  },
  { 
    id: 'joiner', 
    label: 'Joiner', 
    icon: UserPlus, 
    description: 'New hire onboarding',
    badge: '12 rules'
  },
  { 
    id: 'mover', 
    label: 'Mover', 
    icon: UserCog, 
    description: 'Role and access changes',
    badge: '8 rules'
  },
  { 
    id: 'leaver', 
    label: 'Leaver', 
    icon: UserMinus, 
    description: 'Offboarding workflows',
    badge: '5 rules'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    description: 'Configuration and monitoring'
  }
];

export function LifecyclePage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enhanced analytics and metrics
  const analytics = useMemo(() => ({
    totalWorkflows: 25,
    activeRules: 18,
    executionsToday: 47,
    successRate: 94.2,
    avgExecutionTime: '2.3s',
    complianceScore: 98.5,
    criticalAlerts: 2,
    pendingApprovals: 7,
    orphanAccounts: 12,
    lastSync: '2 minutes ago',
    nextScheduledRun: 'in 4 hours'
  }), []);

  const workflowMetrics = useMemo(() => ({
    joiner: { executions: 23, success: 22, avgTime: '1.8s', errors: 1 },
    mover: { executions: 15, success: 14, avgTime: '3.2s', errors: 1 },
    leaver: { executions: 9, success: 9, avgTime: '4.1s', errors: 0 }
  }), []);

  const [mappings, setMappings] = useState<AttributeMapping[]>([
    {
      sourceField: 'email',
      targetField: 'primaryEmail',
      type: 'email',
      transform: 'toLower',
      example: 'john.doe@acme.com'
    },
    {
      sourceField: 'employeeId',
      targetField: 'employeeNumber',
      type: 'string',
      example: 'EMP-12345',
      conflict: true
    },
    {
      sourceField: 'displayName',
      targetField: 'fullName',
      type: 'string',
      transform: 'trim',
      example: 'John Doe'
    }
  ]);

  const [joinerRules, setJoinerRules] = useState<LifecycleRule[]>([
    {
      id: 'rule-1',
      name: 'Engineering New Hires',
      description: 'Comprehensive onboarding for engineering department with security clearance',
      priority: 1,
      status: 'published',
      conditions: 3,
      actions: 8,
      lastExecuted: '2 hours ago',
      executionCount: 47,
      successRate: 95.7,
      avgExecutionTime: '1.8s',
      requiresApproval: false,
      riskLevel: 'low',
      tags: ['engineering', 'security', 'high-priority']
    },
    {
      id: 'rule-2',
      name: 'Sales Team Onboarding',
      description: 'CRM access provisioning with territory assignment',
      priority: 2,
      status: 'published',
      conditions: 2,
      actions: 5,
      lastExecuted: '1 hour ago',
      executionCount: 23,
      successRate: 91.3,
      avgExecutionTime: '2.1s',
      requiresApproval: true,
      riskLevel: 'medium',
      tags: ['sales', 'crm', 'territory']
    },
    {
      id: 'rule-3',
      name: 'Executive Onboarding',
      description: 'Privileged access for C-level executives with enhanced security',
      priority: 1,
      status: 'test',
      conditions: 1,
      actions: 12,
      lastExecuted: 'never',
      executionCount: 0,
      successRate: 0,
      avgExecutionTime: '0s',
      requiresApproval: true,
      riskLevel: 'high',
      tags: ['executive', 'privileged', 'security']
    }
  ]);

  const [moverRules, setMoverRules] = useState<LifecycleRule[]>([
    {
      id: 'rule-4',
      name: 'Manager Promotion Workflow',
      description: 'Automated role elevation with approval workflow and SoD checks',
      priority: 1,
      status: 'published',
      conditions: 2,
      actions: 6,
      lastExecuted: '30 minutes ago',
      executionCount: 12,
      successRate: 100,
      avgExecutionTime: '3.2s',
      requiresApproval: true,
      riskLevel: 'medium',
      tags: ['promotion', 'manager', 'sod']
    },
    {
      id: 'rule-5',
      name: 'Department Transfer',
      description: 'Cross-departmental access changes with cleanup',
      priority: 2,
      status: 'published',
      conditions: 3,
      actions: 4,
      lastExecuted: '1 hour ago',
      executionCount: 8,
      successRate: 87.5,
      avgExecutionTime: '2.8s',
      requiresApproval: false,
      riskLevel: 'low',
      tags: ['transfer', 'department', 'cleanup']
    }
  ]);

  const [leaverRules, setLeaverRules] = useState<LifecycleRule[]>([
    {
      id: 'rule-6',
      name: 'Standard Offboarding',
      description: 'Phased deprovisioning with compliance checks and data retention',
      priority: 1,
      status: 'published',
      conditions: 0,
      actions: 9,
      lastExecuted: '45 minutes ago',
      executionCount: 15,
      successRate: 93.3,
      avgExecutionTime: '4.1s',
      requiresApproval: false,
      riskLevel: 'low',
      tags: ['offboarding', 'compliance', 'phased']
    },
    {
      id: 'rule-7',
      name: 'Emergency Termination',
      description: 'Immediate access revocation for security incidents',
      priority: 1,
      status: 'published',
      conditions: 1,
      actions: 7,
      lastExecuted: 'never',
      executionCount: 0,
      successRate: 0,
      avgExecutionTime: '0s',
      requiresApproval: true,
      riskLevel: 'high',
      tags: ['emergency', 'security', 'immediate']
    }
  ]);

  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    type: 'joiner' as 'joiner' | 'mover' | 'leaver',
    conditions: [] as Condition[],
    actions: [] as Action[],
    effectiveDelay: 0,
    requiresApproval: false,
    dryRun: true
  });

  const mockHistory = [
    {
      timestamp: '2 days ago',
      actor: 'sarah.johnson@acme.com',
      field: 'Joiner Rule - Engineering',
      oldValue: '3 actions',
      newValue: '4 actions'
    }
  ];

  const handleSaveRule = () => {
    toast.success('Rule saved successfully');
    setCreateRuleOpen(false);
    setRuleForm({
      name: '',
      description: '',
      type: 'joiner',
      conditions: [],
      actions: [],
      effectiveDelay: 0,
      requiresApproval: false,
      dryRun: true
    });
  };

  const handleReorder = (rules: LifecycleRule[], fromIndex: number, toIndex: number) => {
    const newRules = [...rules];
    const [moved] = newRules.splice(fromIndex, 1);
    newRules.splice(toIndex, 0, moved);

    if (activeSection === 'joiner') setJoinerRules(newRules);
    else if (activeSection === 'mover') setMoverRules(newRules);
    else if (activeSection === 'leaver') setLeaverRules(newRules);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Simplified Header */}
      <div className="sticky top-16 z-10 bg-background border-b">
        <div className="p-6 max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold">Lifecycle Automation</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Identity lifecycle management with automated workflows
              </p>
            </div>
            
            {/* Essential Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics.successRate}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics.executionsToday}</div>
                <div className="text-xs text-muted-foreground">Today</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSimulationOpen(true)}>
                <Play className="w-4 h-4 mr-1" />
                Test
              </Button>
              <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                New Rule
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1800px] mx-auto w-full flex-1">
        <div className="flex gap-6">
          {/* Enhanced Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <nav className="sticky top-32 space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{section.label}</span>
                        {section.badge && (
                          <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                            {section.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs mt-1 opacity-75">{section.description}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Mobile Navigation */}
            <div className="lg:hidden border-b mb-6 -mx-4 px-4">
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {/* Simplified Overview Section */}
              {activeSection === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.activeRules}</div>
                        <p className="text-xs text-muted-foreground">
                          {joinerRules.length} Joiner • {moverRules.length} Mover • {leaverRules.length} Leaver
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{analytics.successRate}%</div>
                        <Progress value={analytics.successRate} className="mt-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.executionsToday}</div>
                        <p className="text-xs text-muted-foreground">
                          Avg time: {analytics.avgExecutionTime}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common lifecycle management tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveSection('joiner')}>
                          <UserPlus className="w-6 h-6" />
                          <span>Manage Joiner Rules</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveSection('mover')}>
                          <UserCog className="w-6 h-6" />
                          <span>Manage Mover Rules</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveSection('leaver')}>
                          <UserMinus className="w-6 h-6" />
                          <span>Manage Leaver Rules</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest workflow executions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { type: 'joiner', user: 'Sarah Chen', action: 'Engineering onboarding', time: '2 min ago', status: 'success' },
                          { type: 'mover', user: 'Mike Johnson', action: 'Manager promotion', time: '15 min ago', status: 'success' },
                          { type: 'leaver', user: 'Alex Rivera', action: 'Standard offboarding', time: '45 min ago', status: 'success' },
                          { type: 'joiner', user: 'Emma Wilson', action: 'Sales onboarding', time: '1 hour ago', status: 'pending' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'success' ? 'bg-green-500' : 
                              activity.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div className="flex-1">
                              <div className="font-medium">{activity.user}</div>
                              <div className="text-sm text-muted-foreground">{activity.action}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{activity.time}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Settings Section - Consolidated Configuration */}
              {activeSection === 'settings' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Data Sources & Mapping</CardTitle>
                      <CardDescription>Configure HR systems and attribute mappings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">HR Source Precedence</h4>
                          <div className="space-y-2">
                            {['Workday', 'Azure AD', 'Google Workspace'].map((source, index) => (
                              <div key={source} className="flex items-center gap-3 p-2 rounded border bg-card">
                                <div className="w-6 h-6 rounded flex items-center justify-center bg-accent font-medium text-xs">
                                  {index + 1}
                                </div>
                                <span className="text-sm">{source}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">Priority {index + 1}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Attribute Mappings</h4>
                          <MappingTable mappings={mappings} onChange={setMappings} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monitoring & Alerts</CardTitle>
                      <CardDescription>System health and alerting configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">System Health</span>
                            <Badge variant="secondary">98.5%</Badge>
                          </div>
                          <Progress value={98.5} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Active Alerts</span>
                            <Badge variant="destructive">2</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">Require attention</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance & Risk</CardTitle>
                      <CardDescription>SoD controls and risk management</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-purple-600">98.5%</div>
                          <div className="text-xs text-muted-foreground">Compliance Score</div>
                        </div>
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-red-600">3</div>
                          <div className="text-xs text-muted-foreground">SoD Violations</div>
                        </div>
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-yellow-600">7</div>
                          <div className="text-xs text-muted-foreground">Active Exceptions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Joiner Automation Section */}
              {activeSection === 'joiner' && (
                <div className="space-y-6">
                  {/* Joiner Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        Joiner Automation Dashboard
                      </CardTitle>
                      <CardDescription>Birthright access provisioning and onboarding workflows</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">{joinerRules.length}</div>
                          <div className="text-sm text-blue-800">Active Rules</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                          <div className="text-2xl font-bold text-green-600">23</div>
                          <div className="text-sm text-green-800">Executions Today</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
                          <div className="text-2xl font-bold text-purple-600">95.7%</div>
                          <div className="text-sm text-purple-800">Success Rate</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                          <div className="text-2xl font-bold text-orange-600">1.8s</div>
                          <div className="text-sm text-orange-800">Avg Time</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-1" />
                            Filter
                          </Button>
                          <Button variant="outline" size="sm">
                            <Target className="w-4 h-4 mr-1" />
                            Templates
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSimulationOpen(true)}>
                            <Play className="w-4 h-4 mr-1" />
                            Test Rules
                          </Button>
                          <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Create Rule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Simplified Rules List */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Onboarding Rules</CardTitle>
                      <CardDescription>Rules are evaluated top-down. First matching rule wins.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {joinerRules.map((rule, index) => (
                          <div key={rule.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded flex items-center justify-center bg-accent font-medium text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{rule.name}</h4>
                                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={rule.status === 'published' ? 'default' : 'secondary'}>
                                  {rule.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{rule.conditions} conditions</span>
                                <span>{rule.actions} actions</span>
                                <span>{rule.executionCount} runs</span>
                                <span className="text-green-600">{rule.successRate}% success</span>
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
                </div>
              )}

              {/* Simplified Mover Automation Section */}
              {activeSection === 'mover' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-orange-600" />
                        Mover Automation
                      </CardTitle>
                      <CardDescription>Role changes, promotions, and access modifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-orange-600">{moverRules.length}</div>
                          <div className="text-xs text-muted-foreground">Active Rules</div>
                        </div>
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-green-600">15</div>
                          <div className="text-xs text-muted-foreground">Executions Today</div>
                        </div>
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-purple-600">93.3%</div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Mover Rules</CardTitle>
                      <CardDescription>Automated workflows for role and access changes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {moverRules.map((rule, index) => (
                          <div key={rule.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded flex items-center justify-center bg-accent font-medium text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{rule.name}</h4>
                                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={rule.status === 'published' ? 'default' : 'secondary'}>
                                  {rule.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{rule.conditions} conditions</span>
                                <span>{rule.actions} actions</span>
                                <span>{rule.executionCount} runs</span>
                                <span className="text-green-600">{rule.successRate}% success</span>
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
                </div>
              )}

              {/* Simplified Leaver Automation Section */}
              {activeSection === 'leaver' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserMinus className="w-5 h-5 text-red-600" />
                        Leaver Automation
                      </CardTitle>
                      <CardDescription>Automated offboarding with phased deprovisioning</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-red-600">{leaverRules.length}</div>
                          <div className="text-xs text-muted-foreground">Active Rules</div>
                        </div>
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-green-600">9</div>
                          <div className="text-xs text-muted-foreground">Executions Today</div>
                        </div>
                        <div className="text-center p-3 rounded border bg-card">
                          <div className="text-lg font-bold text-purple-600">100%</div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Leaver Rules</CardTitle>
                      <CardDescription>Automated workflows for offboarding and access revocation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {leaverRules.map((rule, index) => (
                          <div key={rule.id} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded flex items-center justify-center bg-accent font-medium text-sm">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{rule.name}</h4>
                                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={rule.status === 'published' ? 'default' : 'secondary'}>
                                  {rule.status}
                                </Badge>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{rule.conditions} conditions</span>
                                <span>{rule.actions} actions</span>
                                <span>{rule.executionCount} runs</span>
                                <span className="text-green-600">{rule.successRate}% success</span>
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
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Drawer open={createRuleOpen} onOpenChange={setCreateRuleOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Create Lifecycle Rule</DrawerTitle>
            <DrawerDescription>Configure conditions and actions for automated provisioning</DrawerDescription>
          </DrawerHeader>

          <div className="px-6 py-4 flex-1 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={ruleForm.name}
                  onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g., Engineering New Hires"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select
                  value={ruleForm.type}
                  onValueChange={(v: any) => setRuleForm({ ...ruleForm, type: v })}
                >
                  <SelectTrigger id="rule-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joiner">Joiner (New Hire)</SelectItem>
                    <SelectItem value="mover">Mover (Change)</SelectItem>
                    <SelectItem value="leaver">Leaver (Offboarding)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">Description</Label>
              <Input
                id="rule-description"
                value={ruleForm.description}
                onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })}
                placeholder="Describe when this rule applies"
              />
            </div>

            <ConditionBuilder
              conditions={ruleForm.conditions}
              onChange={conditions => setRuleForm({ ...ruleForm, conditions })}
            />

            <ActionPicker
              actions={ruleForm.actions}
              onChange={actions => setRuleForm({ ...ruleForm, actions })}
              mode={ruleForm.type}
            />

            <div className="pt-4 border-t space-y-4">
              <h3 className="text-sm font-semibold">Options</h3>

              <div className="space-y-2">
                <Label htmlFor="effective-delay">Effective Start Delay (days)</Label>
                <Input
                  id="effective-delay"
                  type="number"
                  value={ruleForm.effectiveDelay}
                  onChange={e => setRuleForm({ ...ruleForm, effectiveDelay: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Wait period before executing actions</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">Require Approval</div>
                  <div className="text-xs text-muted-foreground">Manager must approve before provisioning</div>
                </div>
                <Switch
                  checked={ruleForm.requiresApproval}
                  onCheckedChange={v => setRuleForm({ ...ruleForm, requiresApproval: v })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">Dry Run Mode</div>
                  <div className="text-xs text-muted-foreground">Log actions without executing</div>
                </div>
                <Switch
                  checked={ruleForm.dryRun}
                  onCheckedChange={v => setRuleForm({ ...ruleForm, dryRun: v })}
                />
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t">
            <Button variant="outline" onClick={() => setCreateRuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>Save Rule</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <SimulationDrawer
        open={simulationOpen}
        onOpenChange={setSimulationOpen}
        mode={activeSection === 'joiner' ? 'joiner' : activeSection === 'mover' ? 'mover' : 'leaver'}
      />

      <DiffDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        title="Lifecycle Rules"
        history={mockHistory}
      />
    </div>
  );
}
