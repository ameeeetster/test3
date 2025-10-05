import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { SectionCard } from '../components/settings/SectionCard';
import { CardMetadata } from '../components/settings/CardMetadata';
import { DiffDrawer } from '../components/settings/DiffDrawer';
import { StepBuilder } from '../components/policies/StepBuilder';
import { RuleBuilder } from '../components/policies/RuleBuilder';
import { TestResultsTable } from '../components/policies/TestResultsTable';
import { LintList } from '../components/policies/LintList';
import { RiskWeightSlider } from '../components/policies/RiskWeightSlider';
import { VersionBadge } from '../components/policies/VersionBadge';
import { Plus, Upload, Download, GitBranch, Shield, Award, TriangleAlert as AlertTriangle, Zap, Clock, Settings, Play, Eye, ChevronDown, FileJson } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Section {
  id: string;
  label: string;
  icon: any;
}

const sections: Section[] = [
  { id: 'workflow', label: 'Access Request Workflow', icon: GitBranch },
  { id: 'sod', label: 'Segregation of Duties', icon: Shield },
  { id: 'role-standards', label: 'Role Standards', icon: Award },
  { id: 'risk', label: 'Risk Policy', icon: AlertTriangle },
  { id: 'break-glass', label: 'Emergency Access', icon: Zap },
  { id: 'reviews', label: 'Review Defaults', icon: Clock },
  { id: 'provisioning', label: 'Provisioning Rules', icon: Settings }
];

export function PoliciesPage() {
  const [activeSection, setActiveSection] = useState('workflow');
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const [workflowSteps, setWorkflowSteps] = useState([
    {
      id: 'step-1',
      name: 'Manager Approval',
      slaDays: 2,
      escalationDays: 3,
      requireJustification: true,
      allowAttachment: true,
      allowDelegate: false
    },
    {
      id: 'step-2',
      name: 'App Owner',
      slaDays: 3,
      escalationDays: 5,
      requireJustification: false,
      allowAttachment: true,
      allowDelegate: true
    },
    {
      id: 'step-3',
      name: 'Security Review',
      slaDays: 1,
      escalationDays: 2,
      requireJustification: true,
      allowAttachment: false,
      allowDelegate: false
    }
  ]);

  const [sodRule, setSodRule] = useState({
    name: 'Finance Approval vs Creation',
    severity: 'high' as const,
    enforcement: 'block' as const,
    description: 'Users cannot both approve and create financial transactions',
    status: 'published' as const,
    version: '2.1',
    rule: {
      type: 'mutual-exclusion' as const,
      leftSet: ['finance-approve'],
      rightSet: ['finance-create'],
      exceptions: []
    }
  });

  const [riskWeights, setRiskWeights] = useState([
    { label: 'SoD Violations', value: 30, description: 'Weight for segregation of duties conflicts' },
    { label: 'Privileged Access', value: 25, description: 'Weight for administrative and privileged roles' },
    { label: 'Unused Access (>90d)', value: 20, description: 'Weight for dormant entitlements' },
    { label: 'Peer Outlier', value: 15, description: 'Weight for access deviating from peers' },
    { label: 'Login Anomalies', value: 10, description: 'Weight for unusual login patterns' }
  ]);

  const [rolePattern, setRolePattern] = useState('{dept}-{app}-{access}');
  const [ownerRequired, setOwnerRequired] = useState(true);
  const [reviewCadence, setReviewCadence] = useState('quarterly');

  const mockLintResults = [
    { roleName: 'Engineering-GitHub-Admin', status: 'pass' as const, issues: [] },
    { roleName: 'Finance-SAP-Approver', status: 'pass' as const, issues: [] },
    { roleName: 'AdminRole', status: 'fail' as const, issues: ['Does not match naming pattern', 'No owner assigned'] },
    { roleName: 'Sales-Salesforce', status: 'warn' as const, issues: ['Missing access level token'] }
  ];

  const mockViolations = [
    {
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john.doe@acme.com',
      conflictingItems: ['Finance Approver', 'Finance Creator'],
      apps: ['SAP', 'Workday'],
      severity: 'high' as const
    },
    {
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@acme.com',
      conflictingItems: ['Admin', 'Auditor'],
      apps: ['Azure AD'],
      severity: 'medium' as const
    }
  ];

  const mockHistory = [
    {
      timestamp: '2 days ago',
      actor: 'sarah.johnson@acme.com',
      field: 'Enforcement',
      oldValue: 'Detect only',
      newValue: 'Block'
    },
    {
      timestamp: '1 week ago',
      actor: 'michael.chen@acme.com',
      field: 'Left Set',
      oldValue: '2 items',
      newValue: '3 items'
    }
  ];

  const handleExport = () => {
    const data = {
      workflow: workflowSteps,
      sod: sodRule,
      riskWeights
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'policies-export.json';
    a.click();
    toast.success('Policies exported successfully');
  };

  const handleImport = () => {
    toast.success('Policies imported successfully');
    setImportDialogOpen(false);
  };

  const handleTestPolicy = () => {
    toast.info('Testing policy against current data...');
    setTimeout(() => {
      toast.success('Test complete. 2 violations found.');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-16 z-10 bg-background border-b">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Policies</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure governance rules, workflows, and compliance policies
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button size="sm" onClick={() => setCreateDrawerOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Policy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto w-full flex-1">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-32 space-y-1">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="lg:hidden border-b mb-6 -mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                        activeSection === section.id
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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
              {activeSection === 'workflow' && (
                <SectionCard
                  title="Access Request Workflow"
                  description="Configure approval steps, SLAs, and conditional routing"
                  actions={
                    <Button variant="outline" size="sm" onClick={() => setPreviewModalOpen(true)}>
                      <Eye className="w-3 h-3 mr-1" />
                      Preview Path
                    </Button>
                  }
                >
                  <StepBuilder steps={workflowSteps} onChange={setWorkflowSteps} />
                  <CardMetadata
                    user="Sarah Johnson"
                    timestamp="2 days ago"
                    onViewAudit={() => setHistoryDrawerOpen(true)}
                  />
                </SectionCard>
              )}

              {activeSection === 'sod' && (
                <>
                  <SectionCard
                    title="Segregation of Duties Policy"
                    description="Define conflicting roles and entitlements"
                    actions={
                      <div className="flex items-center gap-2">
                        <VersionBadge status={sodRule.status} version={sodRule.version} />
                        <Button variant="outline" size="sm" onClick={() => setTestModalOpen(true)}>
                          <Play className="w-3 h-3 mr-1" />
                          Test Policy
                        </Button>
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="policy-name">Policy Name</Label>
                          <Input
                            id="policy-name"
                            value={sodRule.name}
                            onChange={e => setSodRule({ ...sodRule, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="severity">Severity</Label>
                          <Select
                            value={sodRule.severity}
                            onValueChange={(v: any) => setSodRule({ ...sodRule, severity: v })}
                          >
                            <SelectTrigger id="severity">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="enforcement">Enforcement</Label>
                          <Select
                            value={sodRule.enforcement}
                            onValueChange={(v: any) => setSodRule({ ...sodRule, enforcement: v })}
                          >
                            <SelectTrigger id="enforcement">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="block">Block (prevent)</SelectItem>
                              <SelectItem value="detect">Detect only (warn)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={sodRule.description}
                          onChange={e => setSodRule({ ...sodRule, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <RuleBuilder rule={sodRule.rule} onChange={rule => setSodRule({ ...sodRule, rule })} />
                    </div>
                    <CardMetadata
                      user="Michael Chen"
                      timestamp="5 hours ago"
                      onViewAudit={() => setHistoryDrawerOpen(true)}
                    />
                  </SectionCard>
                </>
              )}

              {activeSection === 'role-standards' && (
                <SectionCard title="Role Standards" description="Define naming conventions and governance requirements">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="naming-pattern">Naming Pattern</Label>
                        <Input
                          id="naming-pattern"
                          value={rolePattern}
                          onChange={e => setRolePattern(e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Available tokens: {'{dept}'}, {'{app}'}, {'{access}'}, {'{env}'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <Label className="text-sm font-medium">Owner Required</Label>
                          <p className="text-xs text-muted-foreground">All roles must have an assigned owner</p>
                        </div>
                        <Switch checked={ownerRequired} onCheckedChange={setOwnerRequired} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="review-cadence">Default Review Cadence</Label>
                        <Select value={reviewCadence} onValueChange={setReviewCadence}>
                          <SelectTrigger id="review-cadence">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="semiannual">Semi-Annual</SelectItem>
                            <SelectItem value="annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold">Lint Preview</h4>
                        <Badge variant="secondary" className="text-xs">
                          {mockLintResults.length} roles scanned
                        </Badge>
                      </div>
                      <LintList results={mockLintResults} />
                    </div>
                  </div>
                  <CardMetadata
                    user="Emily Davis"
                    timestamp="1 day ago"
                    onViewAudit={() => setHistoryDrawerOpen(true)}
                  />
                </SectionCard>
              )}

              {activeSection === 'risk' && (
                <SectionCard title="Risk Scoring Policy" description="Configure risk calculation weights and thresholds">
                  <div className="space-y-6">
                    <RiskWeightSlider weights={riskWeights} onChange={setRiskWeights} />

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-4">Risk Thresholds</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg border bg-card">
                          <Badge variant="secondary" className="mb-2">
                            Low
                          </Badge>
                          <div className="text-xs text-muted-foreground">0-24 points</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Badge variant="secondary" className="mb-2">
                            Medium
                          </Badge>
                          <div className="text-xs text-muted-foreground">25-49 points</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Badge variant="secondary" className="mb-2">
                            High
                          </Badge>
                          <div className="text-xs text-muted-foreground">50-74 points</div>
                        </div>
                        <div className="p-3 rounded-lg border bg-card">
                          <Badge variant="destructive" className="mb-2">
                            Critical
                          </Badge>
                          <div className="text-xs text-muted-foreground">75-100 points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardMetadata
                    user="Sarah Johnson"
                    timestamp="3 days ago"
                    onViewAudit={() => setHistoryDrawerOpen(true)}
                  />
                </SectionCard>
              )}

              {activeSection === 'break-glass' && (
                <SectionCard
                  title="Emergency Access (Break-Glass)"
                  description="Configure emergency access policies for critical situations"
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        <p className="font-medium mb-1">High-Risk Configuration</p>
                        <p>Break-glass access bypasses normal approval workflows and should be audited carefully.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Time-Bound Default</Label>
                      <Select defaultValue="4h">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="4h">4 hours</SelectItem>
                          <SelectItem value="8h">8 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Automatic expiration for emergency access</p>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label className="text-sm font-medium">Require Ticket Number</Label>
                        <p className="text-xs text-muted-foreground">Must provide incident/change ticket</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label className="text-sm font-medium">Extra MFA Challenge</Label>
                        <p className="text-xs text-muted-foreground">Require additional authentication</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <Label className="text-sm font-medium">Auto-Review After Use</Label>
                        <p className="text-xs text-muted-foreground">Create review task after access ends</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <CardMetadata
                    user="Security Team"
                    timestamp="1 week ago"
                    onViewAudit={() => setHistoryDrawerOpen(true)}
                  />
                </SectionCard>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Test SoD Policy</DialogTitle>
            <DialogDescription>Run policy against current access data to identify violations</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <TestResultsTable violations={mockViolations} totalUsers={1248} />
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setTestModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTestPolicy}>Run Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Workflow Path</DialogTitle>
            <DialogDescription>See how a request would flow through approval steps</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{step.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      SLA: {step.slaDays}d • Escalate after {step.escalationDays}d
                      {step.requireJustification && ' • Justification required'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Policies</DialogTitle>
            <DialogDescription>Upload a JSON file containing policy definitions</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileJson className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drop JSON file here or click to browse</p>
              <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DiffDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        title="Policy Changes"
        history={mockHistory}
      />
    </div>
  );
}
