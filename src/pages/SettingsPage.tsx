import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { SectionCard } from '../components/settings/SectionCard';
import { FieldGroup, FieldGroup2Col } from '../components/settings/FieldGroup';
import { SecretField } from '../components/settings/SecretField';
import { DirtyStateBanner } from '../components/settings/DirtyStateBanner';
import { StickyFooter } from '../components/settings/StickyFooter';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { Building2, Shield, FileText, Workflow, Sparkles, Bell, Palette, Code, Database, Users, FileSearch, TriangleAlert as AlertTriangle, Search, Copy, Check, Plus, Trash2, CreditCard as Edit, Play, RotateCcw, Eye, Mail, MessageSquare, Webhook, Key, Globe, Settings, ChevronRight, X, Download } from 'lucide-react';

const sections = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'authentication', label: 'Authentication', icon: Shield },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'lifecycle', label: 'Lifecycle', icon: Workflow },
  { id: 'ai', label: 'AI', icon: Sparkles },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'api', label: 'API & Webhooks', icon: Code },
  { id: 'data', label: 'Data & Compliance', icon: Database },
  { id: 'rbac', label: 'Admin RBAC', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: FileSearch },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
];

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('organization');
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ssoDrawerOpen, setSsoDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [orgData, setOrgData] = useState({
    name: 'Acme Corporation',
    domain: 'acme.com',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    fiscalYearStart: 'January',
    securityEmail: 'security@acme.com',
    supportEmail: 'support@acme.com',
    tenantId: 'acme-prod-us-west-2',
    region: 'US West (Oregon)',
    tags: ['Production', 'Enterprise']
  });

  const [authSettings, setAuthSettings] = useState({
    mfaRequired: 'always',
    mfaFactors: ['totp', 'push', 'webauthn'],
    passwordMinLength: 12,
    passwordComplexity: true,
    passwordReuse: 5,
    passwordExpiry: 90,
    sessionMaxIdle: 30,
    sessionAbsoluteMax: 480,
    rememberMe: true,
    lockoutThreshold: 5,
    lockoutCooloff: 15
  });

  const [aiSettings, setAISettings] = useState({
    roleMining: true,
    accessRecommendations: true,
    anomalyDetection: true,
    confidenceThreshold: 0.75,
    autoApproveBirthright: true,
    autoFlagSod: true,
    collapseDuplicates: true,
    showExplainability: true,
    modelInputRetention: 90,
    piiMasking: true,
    allowTraining: false
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setIsDirty(false);
  };

  const handleDiscard = () => {
    toast.info('Changes discarded');
    setIsDirty(false);
  };

  const handleFieldChange = () => {
    setIsDirty(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty]);

  return (
    <div className="flex flex-col h-full">
      {isDirty && <DirtyStateBanner onSave={handleSave} onDiscard={handleDiscard} />}

      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Configure your IAM platform settings and preferences</p>
            </div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDiscard}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="sticky top-20 space-y-1">
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
              <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                <div className="border-b sticky top-16 bg-background z-10 -mx-6 px-6 -mt-2 pt-2 lg:hidden">
                  <TabsList className="h-auto p-0 bg-transparent border-0 gap-4 overflow-x-auto w-full justify-start">
                    {sections.map(section => {
                      const Icon = section.icon;
                      return (
                        <TabsTrigger
                          key={section.id}
                          value={section.id}
                          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 gap-2 whitespace-nowrap"
                        >
                          <Icon className="w-4 h-4" />
                          {section.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                <TabsContent value="organization" className="space-y-6 mt-6">
                  <SectionCard title="Organization Details" description="Basic information about your organization">
                    <FieldGroup2Col>
                      <FieldGroup label="Organization Name" description="Display name for your organization" required>
                        <Input
                          value={orgData.name}
                          onChange={e => {
                            setOrgData({ ...orgData, name: e.target.value });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Primary Domain" description="Your organization's email domain">
                        <div className="flex gap-2">
                          <Input value={orgData.domain} onChange={handleFieldChange} />
                          <Button variant="outline" size="sm">
                            Verify
                          </Button>
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Timezone" description="Default timezone for scheduling">
                        <Select value={orgData.timezone} onValueChange={handleFieldChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <FieldGroup label="Locale" description="Language and region format">
                        <Select value={orgData.locale} onValueChange={handleFieldChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="es-ES">Spanish</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <FieldGroup label="Security Email" description="Contact for security issues">
                        <Input type="email" value={orgData.securityEmail} onChange={handleFieldChange} />
                      </FieldGroup>

                      <FieldGroup label="Support Email" description="Contact for user support">
                        <Input type="email" value={orgData.supportEmail} onChange={handleFieldChange} />
                      </FieldGroup>
                    </FieldGroup2Col>
                  </SectionCard>

                  <SectionCard title="Environment" description="Tenant and deployment information">
                    <div className="space-y-4">
                      <FieldGroup label="Tenant ID" description="Unique identifier for your tenant">
                        <div className="flex gap-2">
                          <Input value={orgData.tenantId} readOnly className="font-mono text-sm" />
                          <Button variant="outline" size="sm" onClick={() => handleCopy(orgData.tenantId)}>
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Region" description="Data center location">
                        <Input value={orgData.region} readOnly />
                      </FieldGroup>

                      <div className="p-3 rounded-lg bg-accent/50 border">
                        <div className="flex gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            Your data is stored and processed in the {orgData.region} region in compliance with local data residency
                            requirements.
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="authentication" className="space-y-6 mt-6">
                  <SectionCard
                    title="SSO Providers"
                    description="Configure single sign-on with identity providers"
                    actions={
                      <Button size="sm" onClick={() => setSsoDrawerOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Provider
                      </Button>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['SAML', 'OIDC', 'Azure AD', 'Okta', 'Google Workspace'].map(provider => (
                        <button
                          key={provider}
                          onClick={() => {
                            setSelectedProvider(provider);
                            setSsoDrawerOpen(true);
                          }}
                          className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{provider}</div>
                              <div className="text-xs text-muted-foreground">Not configured</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Authentication Policies" description="MFA and password requirements">
                    <div className="space-y-6">
                      <FieldGroup label="Multi-Factor Authentication" description="Require MFA for user authentication">
                        <Select
                          value={authSettings.mfaRequired}
                          onValueChange={v => {
                            setAuthSettings({ ...authSettings, mfaRequired: v });
                            handleFieldChange();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never require</SelectItem>
                            <SelectItem value="risk-based">Risk-based</SelectItem>
                            <SelectItem value="always">Always require</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <FieldGroup label="Allowed MFA Factors" description="Authentication methods users can use">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox id="totp" defaultChecked />
                            <Label htmlFor="totp">TOTP (Authenticator App)</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="push" defaultChecked />
                            <Label htmlFor="push">Push Notification</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="webauthn" defaultChecked />
                            <Label htmlFor="webauthn">WebAuthn (Security Keys)</Label>
                          </div>
                        </div>
                      </FieldGroup>

                      <FieldGroup2Col>
                        <FieldGroup label="Password Min Length" description="Minimum characters required">
                          <Input type="number" value={authSettings.passwordMinLength} onChange={handleFieldChange} />
                        </FieldGroup>

                        <FieldGroup label="Password Expiry" description="Days until password expires">
                          <Input type="number" value={authSettings.passwordExpiry} onChange={handleFieldChange} />
                        </FieldGroup>

                        <FieldGroup label="Session Max Idle" description="Minutes before idle timeout">
                          <Input type="number" value={authSettings.sessionMaxIdle} onChange={handleFieldChange} />
                        </FieldGroup>

                        <FieldGroup label="Lockout Threshold" description="Failed attempts before lockout">
                          <Input type="number" value={authSettings.lockoutThreshold} onChange={handleFieldChange} />
                        </FieldGroup>
                      </FieldGroup2Col>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="policies" className="space-y-6 mt-6">
                  <SectionCard
                    title="Segregation of Duties (SoD)"
                    description="Define conflicting access combinations"
                    actions={
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        New Policy
                      </Button>
                    }
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Name</TableHead>
                          <TableHead>Rule Type</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Enforcement</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Financial: Create & Approve POs</TableCell>
                          <TableCell>Mutual Exclusion</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Critical</Badge>
                          </TableCell>
                          <TableCell>Block</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Dev: Code Merge & Deploy</TableCell>
                          <TableCell>Conditional</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-warning text-warning">
                              High
                            </Badge>
                          </TableCell>
                          <TableCell>Detect Only</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </SectionCard>

                  <SectionCard title="Access Request Workflow" description="Approval steps and SLAs">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          1
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Manager Approval</div>
                          <div className="text-xs text-muted-foreground">SLA: 24 hours</div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          2
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">App Owner Approval</div>
                          <div className="text-xs text-muted-foreground">SLA: 48 hours</div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-lg border">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          3
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Security Review</div>
                          <div className="text-xs text-muted-foreground">SLA: 72 hours (high-risk only)</div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="lifecycle" className="space-y-6 mt-6">
                  <SectionCard title="Joiner Rules" description="Birthright access for new hires">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Auto-provision new users</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Automatically create accounts from HR system
                          </div>
                        </div>
                        <Switch defaultChecked onCheckedChange={handleFieldChange} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Birthright access by department</div>
                          <div className="text-xs text-muted-foreground mt-1">Grant default access based on department</div>
                        </div>
                        <Switch defaultChecked onCheckedChange={handleFieldChange} />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Mover Rules" description="Handle department and role changes">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Department change triggers review</div>
                          <div className="text-xs text-muted-foreground mt-1">Re-certify access when department changes</div>
                        </div>
                        <Switch defaultChecked onCheckedChange={handleFieldChange} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Manager change triggers review</div>
                          <div className="text-xs text-muted-foreground mt-1">Review access when manager changes</div>
                        </div>
                        <Switch defaultChecked onCheckedChange={handleFieldChange} />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Leaver Rules" description="Offboarding and deprovisioning">
                    <div className="space-y-4">
                      <FieldGroup label="Deprovision Window" description="Days after termination to remove access">
                        <Input type="number" defaultValue="1" onChange={handleFieldChange} />
                      </FieldGroup>

                      <FieldGroup label="Mailbox Retention" description="Days to retain email after termination">
                        <Input type="number" defaultValue="30" onChange={handleFieldChange} />
                      </FieldGroup>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Create offboarding ticket</div>
                          <div className="text-xs text-muted-foreground mt-1">Automatically create ticket in ticketing system</div>
                        </div>
                        <Switch defaultChecked onCheckedChange={handleFieldChange} />
                      </div>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6 mt-6">
                  <SectionCard title="AI Features" description="Enable intelligent governance capabilities">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Role Mining</div>
                          <div className="text-xs text-muted-foreground mt-1">Discover role patterns from access data</div>
                        </div>
                        <Switch
                          checked={aiSettings.roleMining}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, roleMining: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Access Recommendations</div>
                          <div className="text-xs text-muted-foreground mt-1">Suggest access based on peer analysis</div>
                        </div>
                        <Switch
                          checked={aiSettings.accessRecommendations}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, accessRecommendations: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Anomaly Detection</div>
                          <div className="text-xs text-muted-foreground mt-1">Flag unusual access patterns</div>
                        </div>
                        <Switch
                          checked={aiSettings.anomalyDetection}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, anomalyDetection: v });
                            handleFieldChange();
                          }}
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Confidence & Auto-Actions" description="Configure AI decision thresholds">
                    <div className="space-y-6">
                      <FieldGroup
                        label="Confidence Threshold"
                        description={`AI recommendations above ${(aiSettings.confidenceThreshold * 100).toFixed(0)}% will be shown`}
                      >
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[aiSettings.confidenceThreshold * 100]}
                            onValueChange={v => {
                              setAISettings({ ...aiSettings, confidenceThreshold: v[0] / 100 });
                              handleFieldChange();
                            }}
                            min={50}
                            max={90}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium min-w-[50px]">
                            {(aiSettings.confidenceThreshold * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Impact: ~{Math.round((1 - aiSettings.confidenceThreshold) * 40)}% fewer items to review
                        </p>
                      </FieldGroup>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Auto-Actions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="auto-birthright"
                              checked={aiSettings.autoApproveBirthright}
                              onCheckedChange={v => {
                                setAISettings({ ...aiSettings, autoApproveBirthright: v as boolean });
                                handleFieldChange();
                              }}
                            />
                            <Label htmlFor="auto-birthright" className="text-sm font-normal">
                              Auto-approve low-risk birthright access
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="auto-sod"
                              checked={aiSettings.autoFlagSod}
                              onCheckedChange={v => {
                                setAISettings({ ...aiSettings, autoFlagSod: v as boolean });
                                handleFieldChange();
                              }}
                            />
                            <Label htmlFor="auto-sod" className="text-sm font-normal">
                              Auto-flag SoD conflicts
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="collapse-dupes"
                              checked={aiSettings.collapseDuplicates}
                              onCheckedChange={v => {
                                setAISettings({ ...aiSettings, collapseDuplicates: v as boolean });
                                handleFieldChange();
                              }}
                            />
                            <Label htmlFor="collapse-dupes" className="text-sm font-normal">
                              Collapse duplicate items in reviews
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Privacy & Explainability" description="Control AI transparency and data usage">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Show explanations</div>
                          <div className="text-xs text-muted-foreground mt-1">Display "Why" panel for AI decisions</div>
                        </div>
                        <Switch
                          checked={aiSettings.showExplainability}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, showExplainability: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">PII masking in prompts</div>
                          <div className="text-xs text-muted-foreground mt-1">Mask sensitive data in AI processing</div>
                        </div>
                        <Switch
                          checked={aiSettings.piiMasking}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, piiMasking: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Allow training on tenant data</div>
                          <div className="text-xs text-muted-foreground mt-1">Use your data to improve models</div>
                        </div>
                        <Switch
                          checked={aiSettings.allowTraining}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, allowTraining: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <Button variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Run Backtest
                      </Button>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6 mt-6">
                  <SectionCard
                    title="Notification Channels"
                    description="Configure how users receive notifications"
                    actions={
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Channel
                      </Button>
                    }
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Email (SMTP)</div>
                            <div className="text-xs text-muted-foreground">smtp.acme.com</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Slack</div>
                            <div className="text-xs text-muted-foreground">Not configured</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Webhook className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">Webhooks</div>
                            <div className="text-xs text-muted-foreground">Not configured</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard title="Email Templates" description="Customize notification content">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Access Request</TableCell>
                          <TableCell className="text-sm">New access request from {'{user}'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">2 days ago</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Approval Reminder</TableCell>
                          <TableCell className="text-sm">Action required: Pending approvals</TableCell>
                          <TableCell className="text-xs text-muted-foreground">5 days ago</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Review Assignment</TableCell>
                          <TableCell className="text-sm">You've been assigned to review {'{campaign}'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">1 week ago</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="branding" className="space-y-6 mt-6">
                  <SectionCard title="Brand Assets" description="Customize your platform appearance">
                    <FieldGroup2Col>
                      <FieldGroup label="Logo (Light)" description="PNG or SVG, max 2MB">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Upload</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Logo (Dark)" description="PNG or SVG, max 2MB">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Upload</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Accent Color" description="Primary brand color">
                        <div className="flex gap-2">
                          <Input value="#0066FF" onChange={handleFieldChange} />
                          <div className="w-10 h-10 rounded border" style={{ backgroundColor: '#0066FF' }} />
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Favicon" description="ICO or PNG, 32×32px">
                        <Button variant="outline" size="sm">
                          Choose File
                        </Button>
                      </FieldGroup>
                    </FieldGroup2Col>
                  </SectionCard>

                  <SectionCard title="Login Page Preview" description="Preview how your branding appears">
                    <div className="aspect-video rounded-lg border bg-accent/50 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Login page preview will appear here</p>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="api" className="space-y-6 mt-6">
                  <SectionCard
                    title="Personal Access Tokens"
                    description="API tokens for programmatic access"
                    actions={
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Generate Token
                      </Button>
                    }
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Scope</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">CI/CD Pipeline</TableCell>
                          <TableCell>
                            <Badge variant="secondary">read:users</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">Jan 15, 2025</TableCell>
                          <TableCell className="text-xs text-muted-foreground">2 hours ago</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </SectionCard>

                  <SectionCard
                    title="Webhooks"
                    description="Receive real-time event notifications"
                    actions={
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Webhook
                      </Button>
                    }
                  >
                    <div className="p-8 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center">
                      <Webhook className="w-8 h-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">No webhooks configured</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Add Your First Webhook
                      </Button>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="data" className="space-y-6 mt-6">
                  <SectionCard title="Data Retention" description="Configure how long data is stored">
                    <FieldGroup2Col>
                      <FieldGroup label="Audit Log Retention" description="Days to retain audit logs">
                        <Input type="number" defaultValue="365" onChange={handleFieldChange} />
                      </FieldGroup>

                      <FieldGroup label="Event Data Retention" description="Days to retain event data">
                        <Input type="number" defaultValue="90" onChange={handleFieldChange} />
                      </FieldGroup>
                    </FieldGroup2Col>

                    <div className="mt-4 flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <div className="font-medium text-sm">PII masking</div>
                        <div className="text-xs text-muted-foreground mt-1">Mask sensitive data in exports and logs</div>
                      </div>
                      <Switch defaultChecked onCheckedChange={handleFieldChange} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Data Export" description="Export your data for compliance">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Generate Full Data Export
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileSearch className="w-4 h-4 mr-2" />
                        Subject Access Request (GDPR)
                      </Button>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="rbac" className="space-y-6 mt-6">
                  <SectionCard
                    title="Admin Roles"
                    description="Define who can access settings"
                    actions={
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Create Role
                      </Button>
                    }
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Members</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">System Admin</TableCell>
                          <TableCell>3</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Full access</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Security Admin</TableCell>
                          <TableCell>5</TableCell>
                          <TableCell className="text-xs text-muted-foreground">Policies, Auth, Audit</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="audit" className="space-y-6 mt-6">
                  <SectionCard title="Settings Audit Log" description="Track all configuration changes">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Filter by actor, action, or target..." />
                        <Button variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Actor</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">sarah.johnson@acme.com</TableCell>
                            <TableCell>Updated</TableCell>
                            <TableCell className="text-xs">Organization / MFA Settings</TableCell>
                            <TableCell className="text-xs text-muted-foreground">2 hours ago</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">michael.chen@acme.com</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell className="text-xs">SoD Policy / Financial Controls</TableCell>
                            <TableCell className="text-xs text-muted-foreground">1 day ago</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">emily.davis@acme.com</TableCell>
                            <TableCell>Enabled</TableCell>
                            <TableCell className="text-xs">AI / Role Mining</TableCell>
                            <TableCell className="text-xs text-muted-foreground">3 days ago</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </SectionCard>
                </TabsContent>

                <TabsContent value="danger" className="space-y-6 mt-6">
                  <SectionCard title="Danger Zone" description="Irreversible and destructive actions">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border-2 border-destructive/20 bg-destructive/5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-destructive mb-1">Delete Tenant</div>
                            <div className="text-xs text-muted-foreground mb-3">
                              Permanently delete this tenant and all associated data. This action cannot be undone.
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                              Delete Tenant
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border-2 border-warning/20 bg-warning/5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-warning mb-1">Reset Configuration</div>
                            <div className="text-xs text-muted-foreground mb-3">
                              Reset all settings to defaults. A backup will be created before resetting.
                            </div>
                            <Button variant="outline" size="sm" className="border-warning text-warning hover:bg-warning/10">
                              Reset to Defaults
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border-2 border-warning/20 bg-warning/5">
                        <div className="flex items-start gap-3">
                          <RotateCcw className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-warning mb-1">Rotate All Secrets</div>
                            <div className="text-xs text-muted-foreground mb-3">
                              Rotate all API tokens, client secrets, and signing keys. Update your integrations immediately.
                            </div>
                            <Button variant="outline" size="sm" className="border-warning text-warning hover:bg-warning/10">
                              Rotate All Secrets
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </TabsContent>
              </Tabs>

              {isDirty && <StickyFooter onCancel={handleDiscard} onSave={handleSave} />}
            </div>
          </div>
        </div>
      </div>

      <Drawer open={ssoDrawerOpen} onOpenChange={setSsoDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Configure {selectedProvider || 'SSO'} Provider</DrawerTitle>
            <DrawerDescription>Set up single sign-on integration</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 space-y-6 overflow-y-auto">
            <SectionCard title="Connection Settings" description="Provider configuration">
              <div className="space-y-4">
                <FieldGroup label="Provider Name" required>
                  <Input placeholder={`${selectedProvider || 'SSO'} Production`} />
                </FieldGroup>

                <FieldGroup label="Issuer URL" required>
                  <Input placeholder="https://provider.com/issuer" />
                </FieldGroup>

                <FieldGroup label="Client ID" required>
                  <Input placeholder="abc123..." />
                </FieldGroup>

                <FieldGroup label="Client Secret" required>
                  <SecretField value="••••••••••••••••" onRotate={() => toast.info('Secret rotated')} />
                </FieldGroup>

                <FieldGroup label="Redirect URI" description="Use this URL in your provider config">
                  <div className="flex gap-2">
                    <Input value="https://acme.iam.app/auth/callback/oidc" readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="sm" onClick={() => handleCopy('https://acme.iam.app/auth/callback/oidc')}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </FieldGroup>
              </div>
            </SectionCard>

            <SectionCard title="Claims Mapping" description="Map provider claims to user attributes">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="email" className="font-mono text-sm" />
                  <Input value="email" readOnly className="bg-accent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="name" className="font-mono text-sm" />
                  <Input value="displayName" readOnly className="bg-accent" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="groups" className="font-mono text-sm" />
                  <Input value="roles" readOnly className="bg-accent" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Just-in-Time Provisioning" description="Auto-create users on first login">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable JIT provisioning</Label>
                  <Switch defaultChecked />
                </div>

                <FieldGroup label="Default Role" description="Assigned to new JIT users">
                  <Select defaultValue="end-user">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="end-user">End User</SelectItem>
                      <SelectItem value="requester">Requester</SelectItem>
                      <SelectItem value="approver">Approver</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldGroup>

                <FieldGroup label="Domain Allowlist" description="Only allow these domains">
                  <Textarea placeholder="acme.com&#10;partner.acme.com" rows={3} />
                </FieldGroup>
              </div>
            </SectionCard>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setSsoDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSsoDrawerOpen(false)} className="gap-2">
              <Play className="w-4 h-4" />
              Test Sign-In
            </Button>
            <Button onClick={() => setSsoDrawerOpen(false)}>Save Provider</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>This action cannot be undone. All data will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/20">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div className="text-sm text-destructive">
                  <p className="font-semibold mb-1">This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All users and identities</li>
                    <li>All access policies and roles</li>
                    <li>All integrations and connectors</li>
                    <li>All audit logs and historical data</li>
                  </ul>
                </div>
              </div>
            </div>

            <FieldGroup label={`Type "${orgData.name}" to confirm`} required>
              <Input placeholder={orgData.name} />
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>
              Delete Tenant Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
