import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../ui/drawer';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, Pause, RotateCcw, CheckCircle, XCircle, AlertCircle, 
  Clock, Users, Shield, Zap, Target, Filter, GitBranch,
  BarChart3, Activity, FileText, Settings, Eye, Download,
  RefreshCw, PlayCircle, StopCircle, TrendingUp, AlertTriangle
} from 'lucide-react';

interface SimulationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'joiner' | 'mover' | 'leaver';
}

interface SimulationResult {
  id: string;
  userId: string;
  userName: string;
  department: string;
  title: string;
  matchedRules: string[];
  actions: {
    id: string;
    type: string;
    target: string;
    status: 'success' | 'failed' | 'skipped' | 'pending';
    duration: number;
    error?: string;
  }[];
  totalDuration: number;
  status: 'success' | 'partial' | 'failed';
  riskScore: number;
  complianceIssues: string[];
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  userProfile: {
    department: string;
    title: string;
    location: string;
    employmentType: string;
    manager: string;
    costCenter: string;
    tags: string[];
    startDate: string;
    securityLevel: string;
    riskScore: number;
  };
  expectedOutcome: string;
  category: 'standard' | 'edge-case' | 'compliance' | 'performance';
}

const mockScenarios: TestScenario[] = [
  {
    id: 'scenario-1',
    name: 'Standard Engineering Hire',
    description: 'Typical software engineer onboarding',
    userProfile: {
      department: 'Engineering',
      title: 'Software Engineer',
      location: 'San Francisco',
      employmentType: 'Full-time',
      manager: 'Jane Smith',
      costCenter: 'ENG-001',
      tags: ['engineering', 'developer'],
      startDate: '2024-01-15',
      securityLevel: 'Internal',
      riskScore: 25
    },
    expectedOutcome: 'Standard engineering access granted',
    category: 'standard'
  },
  {
    id: 'scenario-2',
    name: 'Executive Onboarding',
    description: 'C-level executive with high privileges',
    userProfile: {
      department: 'Executive',
      title: 'Chief Technology Officer',
      location: 'New York',
      employmentType: 'Full-time',
      manager: 'CEO',
      costCenter: 'EXEC-001',
      tags: ['executive', 'leadership'],
      startDate: '2024-01-15',
      securityLevel: 'Confidential',
      riskScore: 85
    },
    expectedOutcome: 'Enhanced security access with approval workflow',
    category: 'compliance'
  },
  {
    id: 'scenario-3',
    name: 'Contractor Access',
    description: 'Temporary contractor with limited access',
    userProfile: {
      department: 'Marketing',
      title: 'Contractor',
      location: 'Remote',
      employmentType: 'Contractor',
      manager: 'Marketing Director',
      costCenter: 'MKT-001',
      tags: ['contractor', 'temporary'],
      startDate: '2024-01-15',
      securityLevel: 'Public',
      riskScore: 15
    },
    expectedOutcome: 'Limited access with auto-expiry',
    category: 'edge-case'
  },
  {
    id: 'scenario-4',
    name: 'High-Risk User',
    description: 'User with elevated risk score',
    userProfile: {
      department: 'Finance',
      title: 'Financial Analyst',
      location: 'Chicago',
      employmentType: 'Full-time',
      manager: 'CFO',
      costCenter: 'FIN-001',
      tags: ['finance', 'sensitive'],
      startDate: '2024-01-15',
      securityLevel: 'Confidential',
      riskScore: 95
    },
    expectedOutcome: 'Additional approval required',
    category: 'compliance'
  }
];

export function SimulationDrawer({ open, onOpenChange, mode }: SimulationDrawerProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [customUser, setCustomUser] = useState<Partial<TestScenario['userProfile']>>({});
  const [simulationType, setSimulationType] = useState<'single' | 'batch' | 'stress'>('single');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'custom' | 'results'>('scenarios');
  const [simulationProgress, setSimulationProgress] = useState(0);

  const selectedScenarioData = useMemo(() => {
    return mockScenarios.find(s => s.id === selectedScenario);
  }, [selectedScenario]);

  const runSimulation = async () => {
    setIsRunning(true);
    setSimulationProgress(0);
    setResults([]);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsRunning(false);
          generateResults();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const generateResults = () => {
    const mockResults: SimulationResult[] = [
      {
        id: 'result-1',
        userId: 'user-001',
        userName: 'John Doe',
        department: selectedScenarioData?.userProfile.department || 'Engineering',
        title: selectedScenarioData?.userProfile.title || 'Software Engineer',
        matchedRules: ['Engineering New Hires', 'Standard Onboarding'],
        actions: [
          { id: 'action-1', type: 'Grant Role', target: 'Employee', status: 'success', duration: 120 },
          { id: 'action-2', type: 'Create Account', target: 'Slack', status: 'success', duration: 800 },
          { id: 'action-3', type: 'Add to Group', target: 'Engineering', status: 'success', duration: 300 },
          { id: 'action-4', type: 'Send Notification', target: 'manager@acme.com', status: 'success', duration: 150 }
        ],
        totalDuration: 1370,
        status: 'success',
        riskScore: selectedScenarioData?.userProfile.riskScore || 25,
        complianceIssues: []
      },
      {
        id: 'result-2',
        userId: 'user-002',
        userName: 'Jane Smith',
        department: 'Sales',
        title: 'Sales Manager',
        matchedRules: ['Sales Team Onboarding'],
        actions: [
          { id: 'action-5', type: 'Grant Role', target: 'Manager', status: 'success', duration: 200 },
          { id: 'action-6', type: 'Create Account', target: 'Salesforce', status: 'failed', duration: 5000, error: 'Connection timeout' },
          { id: 'action-7', type: 'Add to Group', target: 'Sales', status: 'success', duration: 250 }
        ],
        totalDuration: 5450,
        status: 'partial',
        riskScore: 45,
        complianceIssues: ['Salesforce account creation failed']
      }
    ];

    setResults(mockResults);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'standard': return <CheckCircle className="w-4 h-4" />;
      case 'edge-case': return <AlertTriangle className="w-4 h-4" />;
      case 'compliance': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard': return 'text-green-600 bg-green-100';
      case 'edge-case': return 'text-orange-600 bg-orange-100';
      case 'compliance': return 'text-blue-600 bg-blue-100';
      case 'performance': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[95vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-600" />
            Workflow Simulation & Testing
          </DrawerTitle>
          <DrawerDescription>
            Test your {mode} workflows with realistic scenarios and validate outcomes
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
              <TabsTrigger value="custom">Custom User</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pre-built Test Scenarios</CardTitle>
                  <CardDescription className="text-xs">
                    Choose from realistic scenarios to test your workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockScenarios.map(scenario => (
                      <div
                        key={scenario.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedScenario === scenario.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedScenario(scenario.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{scenario.name}</h4>
                              <Badge variant="outline" className={`text-xs ${getCategoryColor(scenario.category)}`}>
                                {getCategoryIcon(scenario.category)}
                                <span className="ml-1">{scenario.category}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div><strong>Department:</strong> {scenario.userProfile.department}</div>
                              <div><strong>Title:</strong> {scenario.userProfile.title}</div>
                              <div><strong>Location:</strong> {scenario.userProfile.location}</div>
                              <div><strong>Risk Score:</strong> {scenario.userProfile.riskScore}</div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Expected:</div>
                            <div className="font-medium">{scenario.expectedOutcome}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Simulation Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Simulation Type</Label>
                      <Select value={simulationType} onValueChange={(value: any) => setSimulationType(value)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single User</SelectItem>
                          <SelectItem value="batch">Batch Test</SelectItem>
                          <SelectItem value="stress">Stress Test</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Test Mode</Label>
                      <Select defaultValue="dry-run">
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dry-run">Dry Run</SelectItem>
                          <SelectItem value="live">Live Test</SelectItem>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Timeout (seconds)</Label>
                      <Input type="number" defaultValue="30" className="h-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Custom User Profile</CardTitle>
                  <CardDescription className="text-xs">
                    Create a custom user profile for testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Department</Label>
                      <Input
                        value={customUser.department || ''}
                        onChange={e => setCustomUser({ ...customUser, department: e.target.value })}
                        placeholder="Engineering"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Job Title</Label>
                      <Input
                        value={customUser.title || ''}
                        onChange={e => setCustomUser({ ...customUser, title: e.target.value })}
                        placeholder="Software Engineer"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={customUser.location || ''}
                        onChange={e => setCustomUser({ ...customUser, location: e.target.value })}
                        placeholder="San Francisco"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Employment Type</Label>
                      <Select
                        value={customUser.employmentType || ''}
                        onValueChange={value => setCustomUser({ ...customUser, employmentType: value })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contractor">Contractor</SelectItem>
                          <SelectItem value="Intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Manager</Label>
                      <Input
                        value={customUser.manager || ''}
                        onChange={e => setCustomUser({ ...customUser, manager: e.target.value })}
                        placeholder="Jane Smith"
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Risk Score</Label>
                      <Input
                        type="number"
                        value={customUser.riskScore || 0}
                        onChange={e => setCustomUser({ ...customUser, riskScore: parseInt(e.target.value) || 0 })}
                        placeholder="25"
                        className="h-8"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {isRunning && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Running Simulation...</span>
                        <span className="text-sm text-muted-foreground">{Math.round(simulationProgress)}%</span>
                      </div>
                      <Progress value={simulationProgress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        Testing {selectedScenarioData?.name || 'custom scenario'}...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Simulation Results</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={runSimulation}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Re-run
                      </Button>
                    </div>
                  </div>

                  {results.map(result => (
                    <Card key={result.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(result.status)}
                            <div>
                              <CardTitle className="text-sm">{result.userName}</CardTitle>
                              <CardDescription className="text-xs">
                                {result.department} • {result.title}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${getStatusColor(result.status)}`}>
                              {result.status}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {result.totalDuration}ms
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-medium">Matched Rules</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.matchedRules.map(rule => (
                                <Badge key={rule} variant="outline" className="text-xs">
                                  {rule}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Actions Executed</Label>
                            <div className="space-y-2 mt-2">
                              {result.actions.map(action => (
                                <div key={action.id} className="flex items-center justify-between p-2 rounded border bg-card">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(action.status)}
                                    <span className="text-sm">{action.type}</span>
                                    <span className="text-xs text-muted-foreground">{action.target}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{action.duration}ms</span>
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(action.status)}`}>
                                      {action.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {result.complianceIssues.length > 0 && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Compliance Issues:</strong>
                                <ul className="mt-1 list-disc list-inside">
                                  {result.complianceIssues.map(issue => (
                                    <li key={issue} className="text-sm">{issue}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isRunning && results.length === 0 && (
                <div className="text-center py-12">
                  <PlayCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run a simulation to see detailed results and performance metrics
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                onClick={runSimulation} 
                disabled={isRunning || (!selectedScenario && Object.keys(customUser).length === 0)}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}