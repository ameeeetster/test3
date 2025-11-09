import React, { useState } from 'react';
import { X, UserCog, Key, Lock, XCircle, UserX, Plus, Search, Download, Phone, Mail, MapPin, Calendar, Building, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { StatusChip } from './StatusChip';
import { RiskChip } from './RiskChip';
import { SpecGrid } from './SpecGrid';
import { AppGroup } from './AppGroup';
import { AccessItem } from './InlineRevokeRow';
import { IdentityActivityTimeline, ActivityEvent } from './IdentityActivityTimeline';
import { AIActionSuggestion, AISuggestion } from './AIActionSuggestion';
import { AIInsightCard, AIInsight } from './AIInsightCard';
import { toast } from 'sonner';

interface Identity {
  id: string;
  name: string;
  email: string;
  department: string;
  title?: string;
  company?: string;
  location?: string;
  manager: string;
  status: 'Active' | 'Inactive' | 'Disabled' | 'Pending';
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  lifecycleState?: string;
  joinDate?: string;
  // Access summary
  rolesCount: number;
  entitlementsCount: number;
  appsCount: number;
  isPrivileged: boolean;
}

interface IdentityDetailDrawerProps {
  identity: Identity | null;
  open: boolean;
  onClose: () => void;
}

// Mock data for access items
const mockAccessData: { [key: string]: AccessItem[] } = {
  'Salesforce': [
    { id: '1', name: 'Sales Cloud - Admin', type: 'Role', lastUsed: '2024-09-30', lastUsedDays: 0, risk: 'High', grantedOn: '2024-01-15' },
    { id: '2', name: 'Marketing Cloud Access', type: 'Entitlement', lastUsed: '2024-09-25', lastUsedDays: 5, risk: 'Medium', grantedOn: '2024-02-20' },
  ],
  'Oracle ERP': [
    { id: '3', name: 'AP Manager', type: 'Role', lastUsed: '2024-09-30', lastUsedDays: 0, risk: 'High', grantedOn: '2024-01-10' },
    { id: '4', name: 'GL Inquiry', type: 'Entitlement', lastUsed: '2024-09-15', lastUsedDays: 15, risk: 'Low', grantedOn: '2024-01-10' },
    { id: '5', name: 'AR Write', type: 'Entitlement', lastUsed: null, lastUsedDays: undefined, risk: 'Medium', grantedOn: '2024-01-10' },
  ],
  'Microsoft 365': [
    { id: '6', name: 'E5 License', type: 'Role', lastUsed: '2024-09-30', lastUsedDays: 0, risk: 'Low', grantedOn: '2024-01-05' },
    { id: '7', name: 'Teams Admin', type: 'Entitlement', lastUsed: '2024-09-28', lastUsedDays: 2, risk: 'Medium', grantedOn: '2024-03-15' },
  ],
  'AWS': [
    { id: '8', name: 'PowerUser', type: 'Role', lastUsed: '2024-08-15', lastUsedDays: 46, risk: 'High', grantedOn: '2024-02-01' },
    { id: '9', name: 'S3 Full Access', type: 'Entitlement', lastUsed: '2024-06-20', lastUsedDays: 102, risk: 'Critical', grantedOn: '2024-02-01' },
  ],
};

const mockActivityEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'login',
    action: 'Successful login',
    resource: 'Oracle ERP',
    timestamp: '2024-09-30 09:15 AM',
    location: 'San Francisco, CA',
    device: 'desktop',
    status: 'success'
  },
  {
    id: '2',
    type: 'request',
    action: 'Access request submitted',
    resource: 'SharePoint Finance Folder',
    timestamp: '2024-09-29 02:30 PM',
    location: 'San Francisco, CA',
    device: 'desktop',
    status: 'pending'
  },
  {
    id: '3',
    type: 'login',
    action: 'Failed login attempt',
    resource: 'Salesforce',
    timestamp: '2024-09-28 11:45 PM',
    location: 'Unknown Location',
    device: 'mobile',
    isAnomaly: true,
    status: 'failed'
  },
  {
    id: '4',
    type: 'password-reset',
    action: 'Password reset',
    resource: 'Azure AD',
    timestamp: '2024-09-28 11:20 AM',
    location: 'San Francisco, CA',
    device: 'desktop',
    status: 'success'
  },
  {
    id: '5',
    type: 'provisioning',
    action: 'Role provisioned',
    resource: 'Salesforce - Sales Cloud Admin',
    timestamp: '2024-09-27 04:45 PM',
    location: 'System',
    status: 'success'
  },
];

const mockAISuggestions: AISuggestion[] = [
  {
    id: '1',
    title: 'Revoke 3 unused entitlements',
    rationale: 'AWS S3 Full Access, Oracle AR Write, and Salesforce Marketing Cloud have not been used in 90+ days',
    confidence: 92,
    impact: 'Reduces attack surface by removing 3 high-risk unused permissions'
  },
  {
    id: '2',
    title: 'Reduce Salesforce scope to Read-Only',
    rationale: 'User primarily performs read operations; write access used less than 5% in past 6 months',
    confidence: 78,
    impact: 'Maintains user productivity while reducing write access risk'
  },
  {
    id: '3',
    title: 'Enable MFA requirement',
    rationale: 'User accesses 4 critical systems without multi-factor authentication enabled',
    confidence: 95,
    impact: 'Significantly improves account security for high-value access'
  },
];

const mockAIInsights: AIInsight[] = [
  {
    id: '1',
    type: 'unused-access',
    title: 'Unused Access Detected',
    description: '4 entitlements have not been used in 90+ days and can be safely removed',
    count: 4,
    severity: 'medium'
  },
  {
    id: '2',
    type: 'sod-conflict',
    title: 'SoD Conflicts',
    description: 'Conflicting roles detected: AP Manager + AR Write violates financial controls policy',
    count: 1,
    severity: 'high'
  },
];

export function IdentityDetailDrawer({ identity, open, onClose }: IdentityDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [accessSearch, setAccessSearch] = useState('');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  if (!identity) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleRevoke = (itemId: string) => {
    toast.success('Access revoked successfully');
  };

  const handleSuggestionApply = (id: string, applied: boolean) => {
    const newSet = new Set(appliedSuggestions);
    if (applied) {
      newSet.add(id);
      toast.success('Suggestion applied');
    } else {
      newSet.delete(id);
      toast.info('Suggestion unapplied');
    }
    setAppliedSuggestions(newSet);
  };

  const handleInsightReview = (id: string) => {
    toast.info('Opening insight details...');
  };

  const handleInsightApply = (id: string) => {
    toast.success('Applying fix...');
  };

  const handleExportActivity = () => {
    toast.success('Exporting activity log...');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        className="w-full sm:max-w-[900px] lg:max-w-[1100px] p-0 overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        {/* Hidden accessibility elements */}
        <SheetTitle className="sr-only">
          {identity.name} - Identity Details
        </SheetTitle>
        <SheetDescription className="sr-only">
          View and manage identity information, access details, activity history, and AI-powered suggestions for {identity.name}
        </SheetDescription>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Sticky Header */}
          <div 
            className="sticky top-0 z-20 border-b"
            style={{ 
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 border-2" style={{ borderColor: 'var(--border)' }}>
                  <AvatarFallback style={{ 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    fontSize: '20px',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>
                    {getInitials(identity.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h2 style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '4px'
                  }}>
                    {identity.name}
                  </h2>
                  <p style={{ 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--muted-foreground)',
                    marginBottom: '12px'
                  }}>
                    {identity.email}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusChip status={identity.status} size="sm" />
                    <RiskChip risk={identity.risk} size="sm" withTooltip />
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: 'var(--accent)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                        fontSize: 'var(--text-xs)'
                      }}
                    >
                      Manager: {identity.manager}
                    </Badge>
                    {appliedSuggestions.size > 0 && (
                      <Badge
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {appliedSuggestions.size} AI {appliedSuggestions.size === 1 ? 'fix' : 'fixes'} applied
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <TabsList className="w-full justify-start px-6 rounded-none border-0" style={{ backgroundColor: 'transparent' }}>
              <TabsTrigger value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger value="access">
                Access
              </TabsTrigger>
              <TabsTrigger value="activity">
                Activity
              </TabsTrigger>
              <TabsTrigger value="ai">
                AI Suggestions
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Area with Right Rail */}
          <div className="flex-1 overflow-hidden flex">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6 m-0">
                {/* Spec Grid */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <h3 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '16px'
                  }}>
                    User Information
                  </h3>
                  <SpecGrid
                    items={[
                      { label: 'Department', value: identity.department },
                      { label: 'Job Title', value: (identity as any).jobTitle || identity.title || 'Not specified' },
                      { label: 'Division', value: (identity as any).division || 'Not specified' },
                      { label: 'Business Unit', value: (identity as any).businessUnit || 'Not specified' },
                      { label: 'Location', value: (identity as any).location || identity.location || 'Not specified' },
                      { label: 'Cost Center', value: (identity as any).costCenter || 'Not specified' },
                      { label: 'Manager', value: identity.manager || 'Not specified' },
                      { label: 'Employee ID', value: (identity as any).employeeId || identity.id },
                      { label: 'Employment Type', value: (identity as any).employmentType || 'Not specified' },
                      { label: 'Lifecycle State', value: identity.lifecycleState || 'Active Employee' },
                      { label: 'Start Date', value: (identity as any).startDate || identity.joinDate || 'Not specified' },
                      { label: 'End Date', value: (identity as any).endDate || 'N/A' },
                    ]}
                  />
                </div>

                {/* Contact Information Section */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <h3 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      Contact Information
                    </h3>
                  </div>
                  <SpecGrid
                    items={[
                      { label: 'Email', value: identity.email },
                      { label: 'Phone', value: (identity as any).phone || 'Not specified' },
                      { label: 'Mobile Phone', value: (identity as any).mobilePhone || 'Not specified' },
                      { label: 'Office Address', value: (identity as any).officeAddress || 'Not specified' },
                      { label: 'Timezone', value: (identity as any).timezone || 'Not specified' },
                      { label: 'Preferred Language', value: (identity as any).preferredLanguage || 'English' },
                    ]}
                  />
                </div>

                {/* Account Security Section */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <h3 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      Account Security
                    </h3>
                  </div>
                  <SpecGrid
                    items={[
                      { label: 'Username', value: (identity as any).username || 'Not set' },
                      { label: 'MFA Enabled', value: (identity as any).mfaEnabled ? 'Yes' : 'No' },
                      { label: 'Account Created', value: (identity as any).accountCreated 
                        ? new Date((identity as any).accountCreated).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })
                        : 'Not available' },
                      { label: 'Account Age', value: (identity as any).accountAge 
                        ? `${(identity as any).accountAge} days`
                        : 'Not available' },
                      { label: 'Password Last Changed', value: (identity as any).passwordLastChanged 
                        ? new Date((identity as any).passwordLastChanged).toLocaleDateString()
                        : 'Never' },
                      { label: 'Require Password Change', value: (identity as any).requiresPasswordChange ? 'Yes' : 'No' },
                      { label: 'Account Expiration', value: (identity as any).accountExpiration 
                        ? new Date((identity as any).accountExpiration).toLocaleDateString()
                        : 'Never' },
                      { label: 'Failed Login Attempts', value: String((identity as any).failedLoginAttempts || 0) },
                      { label: 'Account Locked', value: (identity as any).accountLocked ? 'Yes' : 'No' },
                      { label: 'Account Locked Until', value: (identity as any).accountLockedUntil 
                        ? new Date((identity as any).accountLockedUntil).toLocaleString()
                        : 'N/A' },
                    ]}
                  />
                </div>

                {/* Employment Details Section */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <h3 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      Employment Details
                    </h3>
                  </div>
                  <SpecGrid
                    items={[
                      { label: 'Employment Type', value: (identity as any).employmentType || 'Not specified' },
                      { label: 'Start Date', value: (identity as any).startDate 
                        ? new Date((identity as any).startDate).toLocaleDateString()
                        : 'Not specified' },
                      { label: 'End Date', value: (identity as any).endDate 
                        ? new Date((identity as any).endDate).toLocaleDateString()
                        : 'N/A' },
                      { label: 'Onboarding Status', value: (identity as any).onboardingStatus || 'Not specified' },
                      { label: 'Offboarding Status', value: (identity as any).offboardingStatus || 'N/A' },
                    ]}
                  />
                </div>

                {/* Compliance & Governance Section */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    <h3 style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)'
                    }}>
                      Compliance & Governance
                    </h3>
                  </div>
                  <SpecGrid
                    items={[
                      { label: 'Data Classification', value: (identity as any).dataClassification || 'Not specified' },
                      { label: 'Compliance Certifications', value: (identity as any).complianceCertifications?.length 
                        ? (identity as any).complianceCertifications.join(', ')
                        : 'None' },
                      { label: 'Privacy Consent Status', value: (identity as any).privacyConsentStatus || 'Not specified' },
                      { label: 'Audit Trail Enabled', value: (identity as any).auditTrailEnabled !== false ? 'Yes' : 'No' },
                      { label: 'Risk Score', value: (identity as any).riskScore !== undefined 
                        ? String((identity as any).riskScore)
                        : 'Not calculated' },
                    ]}
                  />
                </div>

                {/* Access Summary */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <h3 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '16px'
                  }}>
                    Access Summary
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {identity.rolesCount}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Roles
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {identity.entitlementsCount}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Entitlements
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {identity.appsCount}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Apps
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: identity.isPrivileged ? 'var(--warning)' : 'var(--success)',
                        marginBottom: '4px'
                      }}>
                        {identity.isPrivileged ? 'Yes' : 'No'}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Privileged
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div 
                  className="rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <h3 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '16px'
                  }}>
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="gap-1.5" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                      <UserCog className="w-4 h-4" />
                      Edit User
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Key className="w-4 h-4" />
                      Request Access
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Lock className="w-4 h-4" />
                      Reset Password
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <XCircle className="w-4 h-4" />
                      Disable
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)' }}>
                      <UserX className="w-4 h-4" />
                      Offboard
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Access Tab */}
              <TabsContent value="access" className="p-6 space-y-4 m-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                    <Input
                      placeholder="Search access..."
                      value={accessSearch}
                      onChange={(e) => setAccessSearch(e.target.value)}
                      className="pl-10"
                      style={{ backgroundColor: 'var(--input-background)' }}
                    />
                  </div>
                  <Button className="gap-1.5" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                    <Plus className="w-4 h-4" />
                    Add Access
                  </Button>
                </div>

                <div className="space-y-3">
                  {Object.entries(mockAccessData).map(([appName, items]) => (
                    <AppGroup
                      key={appName}
                      appName={appName}
                      items={items}
                      onRevoke={handleRevoke}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="p-6 m-0">
                <IdentityActivityTimeline
                  events={mockActivityEvents}
                  onExport={handleExportActivity}
                />
              </TabsContent>

              {/* AI Suggestions Tab */}
              <TabsContent value="ai" className="p-6 space-y-4 m-0">
                {mockAISuggestions.map((suggestion) => (
                  <AIActionSuggestion
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={handleSuggestionApply}
                    isApplied={appliedSuggestions.has(suggestion.id)}
                  />
                ))}
              </TabsContent>
            </div>

          {/* Right Rail - AI Insights (Desktop only) */}
          <div 
            className="hidden lg:block w-80 border-l overflow-y-auto"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--surface)'
            }}
          >
            <div className="p-5 space-y-4 sticky top-0">
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                AI Insights
              </h3>

              {mockAIInsights.map((insight) => (
                <AIInsightCard
                  key={insight.id}
                  insight={insight}
                  onReview={handleInsightReview}
                  onApply={handleInsightApply}
                />
              ))}

              <Separator />

              <div>
                <h4 style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Impact Preview
                </h4>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)'
                  }}
                >
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Select an action to preview its impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Sticky Bottom Action Bar */}
          <div 
            className="sticky bottom-0 border-t p-4"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                Save Changes
              </Button>
            </div>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}