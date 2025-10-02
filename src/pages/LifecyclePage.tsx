import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../components/ui/drawer';
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
  Plus,
  Play,
  Database,
  UserPlus,
  UserCog,
  UserMinus,
  AlertTriangle,
  Calendar,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Section {
  id: string;
  label: string;
  icon: any;
}

const sections: Section[] = [
  { id: 'sources', label: 'Sources & Mappings', icon: Database },
  { id: 'joiner', label: 'Joiner (Birthright)', icon: UserPlus },
  { id: 'mover', label: 'Mover', icon: UserCog },
  { id: 'leaver', label: 'Leaver', icon: UserMinus },
  { id: 'orphans', label: 'Orphan Accounts', icon: AlertTriangle },
  { id: 'calendars', label: 'Calendars & Blackouts', icon: Calendar }
];

export function LifecyclePage() {
  const [activeSection, setActiveSection] = useState('sources');
  const [createRuleOpen, setCreateRuleOpen] = useState(false);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

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
      description: 'Grant baseline access for engineering department',
      priority: 1,
      status: 'published',
      conditions: 2,
      actions: 4
    },
    {
      id: 'rule-2',
      name: 'Sales Team Onboarding',
      description: 'Provision Salesforce and CRM access',
      priority: 2,
      status: 'published',
      conditions: 1,
      actions: 3
    }
  ]);

  const [moverRules, setMoverRules] = useState<LifecycleRule[]>([
    {
      id: 'rule-3',
      name: 'Manager Promotion',
      description: 'Grant manager permissions on title change',
      priority: 1,
      status: 'published',
      conditions: 1,
      actions: 2
    }
  ]);

  const [leaverRules, setLeaverRules] = useState<LifecycleRule[]>([
    {
      id: 'rule-4',
      name: 'Standard Offboarding',
      description: 'Immediate disable and phased deprovisioning',
      priority: 1,
      status: 'published',
      conditions: 0,
      actions: 5
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
    <div className="flex flex-col h-full">
      <div className="sticky top-16 z-10 bg-background border-b">
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Lifecycle Automation</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure joiner, mover, and leaver workflows with automated provisioning
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSimulationOpen(true)}>
                <Play className="w-4 h-4 mr-1" />
                Run Simulation
              </Button>
              <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Rule
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
              {activeSection === 'sources' && (
                <>
                  <SectionCard
                    title="HR Source Precedence"
                    description="Define priority order for resolving conflicting data"
                  >
                    <div className="space-y-2">
                      {['Workday', 'Azure AD', 'Google Workspace'].map((source, index) => (
                        <div key={source} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                          <div className="w-8 h-8 rounded flex items-center justify-center bg-accent font-medium text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium">{source}</span>
                          <Badge variant="secondary" className="ml-auto">Priority {index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                    <CardMetadata user="System Admin" timestamp="1 week ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                  </SectionCard>

                  <SectionCard
                    title="Attribute Mappings"
                    description="Map source fields to user profile attributes with transformations"
                  >
                    <MappingTable mappings={mappings} onChange={setMappings} />
                    {mappings.some(m => m.conflict) && (
                      <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-destructive">
                          <p className="font-medium mb-1">Mapping Conflicts Detected</p>
                          <p>Duplicate employeeId found in multiple sources. Review precedence rules.</p>
                        </div>
                      </div>
                    )}
                    <CardMetadata user="Sarah Johnson" timestamp="2 days ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                  </SectionCard>
                </>
              )}

              {activeSection === 'joiner' && (
                <SectionCard
                  title="Joiner Rules (Birthright Access)"
                  description="Automatically grant access to new hires based on their attributes"
                  actions={
                    <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Rule
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Rules are evaluated top-down. First matching rule wins.
                    </p>
                    <PriorityList
                      rules={joinerRules}
                      onReorder={(from, to) => handleReorder(joinerRules, from, to)}
                      onView={id => toast.info('View rule: ' + id)}
                    />
                  </div>
                  <CardMetadata user="Michael Chen" timestamp="5 hours ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                </SectionCard>
              )}

              {activeSection === 'mover' && (
                <SectionCard
                  title="Mover Rules"
                  description="Respond to attribute changes like promotions or department transfers"
                  actions={
                    <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Rule
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Manager Change', 'Department Change', 'Location Change', 'Title Change'].map(trigger => (
                        <div key={trigger} className="p-3 rounded-lg border bg-card">
                          <div className="text-xs text-muted-foreground mb-1">Trigger</div>
                          <div className="text-sm font-medium">{trigger}</div>
                        </div>
                      ))}
                    </div>
                    <PriorityList
                      rules={moverRules}
                      onReorder={(from, to) => handleReorder(moverRules, from, to)}
                      onView={id => toast.info('View rule: ' + id)}
                    />
                  </div>
                  <CardMetadata user="Emily Davis" timestamp="1 day ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                </SectionCard>
              )}

              {activeSection === 'leaver' && (
                <SectionCard
                  title="Leaver Rules"
                  description="Automated offboarding with phased deprovisioning"
                  actions={
                    <Button size="sm" onClick={() => setCreateRuleOpen(true)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Rule
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Offboarding Phases
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="text-xs">Immediate</Badge>
                          <span className="text-muted-foreground">Disable sign-in, revoke tokens</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="text-xs">By EOD</Badge>
                          <span className="text-muted-foreground">Remove privileged access</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="text-xs">+7 days</Badge>
                          <span className="text-muted-foreground">Deprovision apps, forward email</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Badge variant="secondary" className="text-xs">+30 days</Badge>
                          <span className="text-muted-foreground">Archive mailbox</span>
                        </div>
                      </div>
                    </div>
                    <PriorityList
                      rules={leaverRules}
                      onReorder={(from, to) => handleReorder(leaverRules, from, to)}
                      onView={id => toast.info('View rule: ' + id)}
                    />
                  </div>
                  <CardMetadata user="Security Team" timestamp="1 week ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                </SectionCard>
              )}

              {activeSection === 'orphans' && (
                <SectionCard
                  title="Orphan & Unlinked Accounts"
                  description="Detect and remediate accounts without a linked identity"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Detection Rules</Label>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="text-sm font-medium">No identity match</div>
                          <div className="text-xs text-muted-foreground">Account exists but no user record found</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <div className="text-sm font-medium">Dormant accounts</div>
                          <div className="text-xs text-muted-foreground">No activity for 90+ days</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Remediation Actions</Label>
                      <Select defaultValue="quarantine">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quarantine">Quarantine (disable)</SelectItem>
                          <SelectItem value="notify">Notify owners</SelectItem>
                          <SelectItem value="delete">Schedule deletion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardMetadata user="System Admin" timestamp="3 days ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                </SectionCard>
              )}

              {activeSection === 'calendars' && (
                <SectionCard
                  title="Calendars & Blackout Dates"
                  description="Configure organizational calendars and provisioning schedules"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="text-sm font-medium">Skip deprovision on holidays</div>
                        <div className="text-xs text-muted-foreground">Delay offboarding actions during org blackout dates</div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="text-sm font-medium">Skip deprovision on weekends</div>
                        <div className="text-xs text-muted-foreground">Schedule deprovisioning for next business day</div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label>Regional Calendars</Label>
                      <div className="space-y-2">
                        {['US Holidays', 'EMEA Holidays', 'APAC Holidays'].map(cal => (
                          <div key={cal} className="flex items-center gap-2 p-2 rounded border bg-card">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{cal}</span>
                            <Badge variant="secondary" className="ml-auto text-xs">23 dates</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardMetadata user="Global Ops" timestamp="2 weeks ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
                </SectionCard>
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
