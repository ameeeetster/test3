import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent } from '../components/ui/tabs';
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
import { DomainChipList } from '../components/settings/DomainChipList';
import { EmailField } from '../components/settings/EmailField';
import { CardMetadata } from '../components/settings/CardMetadata';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { Building2, Shield, FileText, Workflow, Sparkles, Bell, Palette, Code, Database, Users, FileSearch, TriangleAlert as AlertTriangle, Search, Copy, Check, Plus, Trash2, CreditCard as Edit, Play, RotateCcw, Mail, MessageSquare, Webhook, Globe, Download, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: any;
  badge?: { text: string; variant: 'default' | 'destructive' | 'secondary' };
}

const sections: Section[] = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'authentication', label: 'Authentication', icon: Shield },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'lifecycle', label: 'Lifecycle', icon: Workflow },
  { id: 'ai', label: 'AI', icon: Sparkles, badge: { text: 'Beta', variant: 'secondary' } },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'api', label: 'API & Webhooks', icon: Code },
  { id: 'data', label: 'Data & Compliance', icon: Database },
  { id: 'rbac', label: 'Admin RBAC', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: FileSearch },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, badge: { text: 'Danger', variant: 'destructive' } }
];

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('organization');
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ssoDrawerOpen, setSsoDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const [orgData, setOrgData] = useState({
    name: 'Acme Corporation',
    domains: [
      { domain: 'acme.com', status: 'verified' as const },
      { domain: 'acme.io', status: 'pending' as const }
    ],
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    fiscalYearStart: 'January',
    securityEmail: 'security@acme.com',
    supportEmail: 'support@acme.com',
    tenantId: 'acme-prod-us-west-2',
    region: 'US West (Oregon)',
    dataResidency: 'United States',
    slaTier: 'Enterprise Plus',
    tags: ['Production', 'Enterprise']
  });

  const [authSettings, setAuthSettings] = useState({
    mfaRequired: 'always',
    passwordMinLength: 12,
    passwordExpiry: 90,
    sessionMaxIdle: 30,
    lockoutThreshold: 5
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
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleDiscard = () => {
    toast.info('Changes discarded');
    setIsDirty(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleFieldChange = () => {
    setIsDirty(true);
  };

  const handleSectionChange = (sectionId: string) => {
    if (isDirty) {
      setPendingNavigation(`/settings?section=${sectionId}`);
      setShowUnsavedDialog(true);
    } else {
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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

      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full flex-1">
        <div className="flex flex-col gap-6 h-full">
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

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-6 flex-1 min-h-0">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="sticky top-20 space-y-1">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </div>
                      {section.badge && (
                        <Badge variant={section.badge.variant} className="text-[10px] h-4 px-1.5">
                          {section.badge.text}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="lg:hidden border-b sticky top-16 bg-background z-10 -mx-4 px-4 -mt-2 pt-2 mb-6">
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                  {sections.map(section => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                          activeSection === section.id
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                        {section.badge && (
                          <Badge variant={section.badge.variant} className="text-[10px] h-4 px-1.5 ml-1">
                            {section.badge.text}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Tabs value={activeSection} className="w-full">
                <TabsContent value="organization" className="space-y-6 mt-0">
                  <SectionCard title="Organization Details" description="Basic information and settings for your organization">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      <FieldGroup label="Organization Name" description="Display name for your organization" required>
                        <Input
                          value={orgData.name}
                          onChange={e => {
                            setOrgData({ ...orgData, name: e.target.value });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Fiscal Year Start" description="Start month for fiscal year">
                        <Select
                          value={orgData.fiscalYearStart}
                          onValueChange={v => {
                            setOrgData({ ...orgData, fiscalYearStart: v });
                            handleFieldChange();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="January">January</SelectItem>
                            <SelectItem value="April">April</SelectItem>
                            <SelectItem value="July">July</SelectItem>
                            <SelectItem value="October">October</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <FieldGroup label="Timezone" description="Default timezone for scheduling">
                        <Select
                          value={orgData.timezone}
                          onValueChange={v => {
                            setOrgData({ ...orgData, timezone: v });
                            handleFieldChange();
                          }}
                        >
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
                        <Select
                          value={orgData.locale}
                          onValueChange={v => {
                            setOrgData({ ...orgData, locale: v });
                            handleFieldChange();
                          }}
                        >
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

                      <div className="md:col-span-2">
                        <FieldGroup label="Primary Email Domains" description="Verified domains for user email addresses">
                          <DomainChipList
                            domains={orgData.domains}
                            onChange={domains => {
                              setOrgData({ ...orgData, domains });
                              handleFieldChange();
                            }}
                          />
                        </FieldGroup>
                      </div>

                      <FieldGroup label="Security Email" description="Contact for security issues" required>
                        <EmailField
                          value={orgData.securityEmail}
                          onChange={v => {
                            setOrgData({ ...orgData, securityEmail: v });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Support Email" description="Contact for user support" required>
                        <EmailField
                          value={orgData.supportEmail}
                          onChange={v => {
                            setOrgData({ ...orgData, supportEmail: v });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>
                    </div>

                    <CardMetadata
                      user="Sarah Johnson"
                      timestamp="2 days ago"
                      onViewAudit={() => setAuditDrawerOpen(true)}
                    />
                  </SectionCard>

                  <SectionCard title="Environment & Residency" description="Deployment and data location information">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <FieldGroup label="Tenant ID" description="Unique identifier for your tenant">
                          <div className="flex gap-2">
                            <Input value={orgData.tenantId} readOnly className="font-mono text-sm bg-accent" />
                            <Button variant="outline" size="sm" onClick={() => handleCopy(orgData.tenantId)}>
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </FieldGroup>

                        <FieldGroup label="SLA Tier" description="Service level agreement">
                          <Input value={orgData.slaTier} readOnly className="bg-accent" />
                        </FieldGroup>

                        <FieldGroup label="Region" description="Primary data center location">
                          <Input value={orgData.region} readOnly className="bg-accent" />
                        </FieldGroup>

                        <FieldGroup label="Data Residency" description="Legal jurisdiction for data">
                          <Input value={orgData.dataResidency} readOnly className="bg-accent" />
                        </FieldGroup>
                      </div>

                      <div className="p-4 rounded-lg bg-accent/50 border">
                        <div className="flex gap-3">
                          <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Data Residency Notice</p>
                            <p>
                              Your data is stored and processed in the {orgData.region} region in compliance with local data
                              residency requirements. All user data, audit logs, and platform metadata remain within the{' '}
                              {orgData.dataResidency} jurisdiction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardMetadata user="System" timestamp="Never modified" />
                  </SectionCard>
                </TabsContent>

                <TabsContent value="authentication" className="space-y-6 mt-0">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['SAML', 'OIDC', 'Azure AD', 'Okta'].map(provider => (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      <FieldGroup label="Multi-Factor Authentication" description="Require MFA for users">
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

                      <FieldGroup label="Password Min Length" description="Minimum characters">
                        <Input
                          type="number"
                          value={authSettings.passwordMinLength}
                          onChange={e => {
                            setAuthSettings({ ...authSettings, passwordMinLength: parseInt(e.target.value) });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Password Expiry" description="Days until expiration">
                        <Input
                          type="number"
                          value={authSettings.passwordExpiry}
                          onChange={e => {
                            setAuthSettings({ ...authSettings, passwordExpiry: parseInt(e.target.value) });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Session Max Idle" description="Minutes before timeout">
                        <Input
                          type="number"
                          value={authSettings.sessionMaxIdle}
                          onChange={e => {
                            setAuthSettings({ ...authSettings, sessionMaxIdle: parseInt(e.target.value) });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>
                    </div>
                    <CardMetadata user="Michael Chen" timestamp="5 hours ago" onViewAudit={() => setAuditDrawerOpen(true)} />
                  </SectionCard>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6 mt-0">
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
                    <CardMetadata user="Emily Davis" timestamp="1 week ago" onViewAudit={() => setAuditDrawerOpen(true)} />
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
                        </div>
                      </div>
                    </div>
                    <CardMetadata user="Emily Davis" timestamp="1 week ago" onViewAudit={() => setAuditDrawerOpen(true)} />
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

      <Drawer open={auditDrawerOpen} onOpenChange={setAuditDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Change History</DrawerTitle>
            <DrawerDescription>View all changes to this setting</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">sarah.johnson@acme.com</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell className="text-xs">Organization Name</TableCell>
                  <TableCell className="text-xs text-muted-foreground">2 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">michael.chen@acme.com</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell className="text-xs">Security Email</TableCell>
                  <TableCell className="text-xs text-muted-foreground">1 week ago</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>You have unsaved changes. What would you like to do?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnsavedDialog(false);
                setPendingNavigation(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={handleDiscard}>
              Discard Changes
            </Button>
            <Button onClick={handleSave}>Save & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
