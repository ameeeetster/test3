import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { WizardStepper } from '../components/WizardStepper';
import { ImpactPreviewBar } from '../components/ImpactPreviewBar';
import { RiskChip } from '../components/RiskChip';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Users, Package, Plus, X } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const wizardSteps = [
  { id: 'basics', label: 'Basics', description: 'Role information' },
  { id: 'entitlements', label: 'Entitlements', description: 'Add permissions' },
  { id: 'rules', label: 'Rules', description: 'Membership criteria' },
  { id: 'review', label: 'Review', description: 'Confirm & create' }
];

const mockEntitlements = [
  { id: 'E-1', name: 'Create Purchase Orders', app: 'Procurement', appIcon: '💰', type: 'Permission', risk: 'High' as const },
  { id: 'E-2', name: 'Approve Invoices', app: 'Procurement', appIcon: '💰', type: 'Action', risk: 'High' as const, sodWarning: true },
  { id: 'E-3', name: 'View Financial Reports', app: 'QuickBooks', appIcon: '📊', type: 'Data Access', risk: 'Medium' as const },
  { id: 'E-4', name: 'Edit Chart of Accounts', app: 'QuickBooks', appIcon: '📊', type: 'Permission', risk: 'Critical' as const },
  { id: 'E-5', name: 'Initiate Wire Transfers', app: 'Treasury', appIcon: '🏦', type: 'Action', risk: 'Critical' as const, sodWarning: true },
  { id: 'E-6', name: 'View Payroll Data', app: 'Workday', appIcon: '👥', type: 'Data Access', risk: 'High' as const },
  { id: 'E-7', name: 'Deploy to Production', app: 'AWS', appIcon: '☁️', type: 'Action', risk: 'Critical' as const }
];

// Mock data for rule criteria
const ruleTypes = [
  { value: 'company', label: 'Company' },
  { value: 'division', label: 'Division' },
  { value: 'department', label: 'Department' },
  { value: 'jobTitle', label: 'Job Title' },
  { value: 'manager', label: 'Manager' },
  { value: 'location', label: 'Location' },
  { value: 'employeeType', label: 'Employee Type' }
];

const ruleValues: Record<string, string[]> = {
  company: ['Acme Corp', 'Acme Industries', 'Acme Global', 'Acme Technologies'],
  division: ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations'],
  department: ['IT', 'Security', 'Infrastructure', 'Development', 'QA', 'DevOps', 'Support', 'Accounting', 'Payroll'],
  jobTitle: ['Software Engineer', 'Senior Engineer', 'Engineering Manager', 'Director', 'VP', 'Analyst', 'Specialist', 'Coordinator'],
  manager: ['Sarah Chen', 'Michael Roberts', 'Emily Parker', 'David Kim', 'Jennifer Wu', 'Robert Martinez'],
  location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Remote'],
  employeeType: ['Full-time', 'Part-time', 'Contractor', 'Intern']
};

interface MembershipRule {
  id: string;
  type: string;
  value: string;
  estimatedUsers: number;
}

export function NewRolePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Step 1: Basics
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [riskCategory, setRiskCategory] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  // Step 2: Entitlements
  const [selectedEntitlements, setSelectedEntitlements] = useState<Set<string>>(new Set());
  const [filterApp, setFilterApp] = useState('all');

  // Step 3: Membership Rules
  const [membershipRules, setMembershipRules] = useState<MembershipRule[]>([]);

  const apps = Array.from(new Set(mockEntitlements.map(e => e.app)));
  const filteredEntitlements = mockEntitlements.filter(e => 
    filterApp === 'all' || e.app === filterApp
  );

  const selectedEntitlementsList = mockEntitlements.filter(e => selectedEntitlements.has(e.id));
  const hasSodConflicts = selectedEntitlementsList.some(e => e.sodWarning);
  const estimatedMembers = 24; // Mock calculation

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = () => {
    // Submit logic here
    navigate('/access/roles/R-1005');
  };

  const toggleEntitlement = (id: string) => {
    const newSet = new Set(selectedEntitlements);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEntitlements(newSet);
  };

  const addMembershipRule = () => {
    const newRule: MembershipRule = {
      id: `rule-${Date.now()}`,
      type: '',
      value: '',
      estimatedUsers: 0
    };
    setMembershipRules([...membershipRules, newRule]);
  };

  const updateRuleType = (id: string, type: string) => {
    setMembershipRules(membershipRules.map(rule => 
      rule.id === id ? { ...rule, type, value: '', estimatedUsers: 0 } : rule
    ));
  };

  const updateRuleValue = (id: string, value: string) => {
    // Generate a consistent random number for this rule when value is selected
    const estimatedUsers = Math.floor(Math.random() * 20) + 5;
    setMembershipRules(membershipRules.map(rule => 
      rule.id === id ? { ...rule, value, estimatedUsers } : rule
    ));
  };

  const removeRule = (id: string) => {
    setMembershipRules(membershipRules.filter(rule => rule.id !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return roleName && description && owner;
      case 1:
        return selectedEntitlements.size > 0;
      case 2:
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="border-b"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="p-4 lg:p-6 max-w-[1320px] mx-auto w-full">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/access/roles')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>
            <div>
              <h1 style={{ 
                fontSize: 'var(--text-h1)',
                lineHeight: 'var(--line-height-h1)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}>
                Create New Role
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                Define a new role with entitlements and membership rules
              </p>
            </div>
          </div>

          <WizardStepper steps={wizardSteps} currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-[900px] mx-auto w-full">
          {/* Step 1: Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g., Financial Controller"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the purpose and responsibilities of this role..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="owner">Owner *</Label>
                  <Input
                    id="owner"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Select or enter owner email"
                    className="mt-2"
                  />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                    The owner is responsible for reviewing and maintaining this role
                  </p>
                </div>

                <div>
                  <Label>Risk Category</Label>
                  <div className="flex gap-2 mt-2">
                    {(['Low', 'Medium', 'High', 'Critical'] as const).map((risk) => (
                      <button
                        key={risk}
                        onClick={() => setRiskCategory(risk)}
                        className="px-4 py-2 rounded-md border transition-all"
                        style={{
                          borderColor: riskCategory === risk ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: riskCategory === risk ? 'var(--accent)' : 'transparent'
                        }}
                      >
                        <RiskChip risk={risk} size="sm" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Entitlements */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Select Entitlements
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                    {selectedEntitlements.size} selected
                  </p>
                </div>

                <select
                  value={filterApp}
                  onChange={(e) => setFilterApp(e.target.value)}
                  className="px-3 py-2 rounded-md border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--input-background)',
                    color: 'var(--text)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <option value="all">All Applications</option>
                  {apps.map(app => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>

              {hasSodConflicts && (
                <div className="flex items-start gap-3 p-4 rounded-lg border" style={{
                  backgroundColor: 'var(--warning-bg)',
                  borderColor: 'var(--warning-border)'
                }}>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                  <div>
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--warning)'
                    }}>
                      SoD Conflict Detected
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Some selected entitlements may create segregation of duties conflicts
                    </p>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[500px]">
                <div className="flex flex-col gap-2 pr-4">
                  {filteredEntitlements.map((ent) => (
                    <div
                      key={ent.id}
                      onClick={() => toggleEntitlement(ent.id)}
                      className="flex items-center gap-3 p-4 rounded-lg border text-left transition-all hover:shadow-sm cursor-pointer"
                      style={{
                        borderColor: selectedEntitlements.has(ent.id) ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: selectedEntitlements.has(ent.id) ? 'var(--accent)' : 'var(--surface)'
                      }}
                    >
                      <Checkbox 
                        checked={selectedEntitlements.has(ent.id)} 
                        onCheckedChange={() => toggleEntitlement(ent.id)}
                      />
                      <span style={{ fontSize: '16px' }}>{ent.appIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div style={{ 
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--text)'
                          }}>
                            {ent.name}
                          </div>
                          {ent.sodWarning && (
                            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                          {ent.app} • {ent.type}
                        </div>
                      </div>
                      <RiskChip risk={ent.risk} size="sm" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Step 3: Membership Rules */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 style={{ 
                  fontSize: 'var(--text-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Membership Rules (Optional)
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  Define criteria to automatically assign users to this role
                </p>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {membershipRules.map((rule, index) => (
                  <div 
                    key={rule.id}
                    className="flex items-start gap-3 p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Rule Type Dropdown */}
                      <div>
                        <Label style={{ fontSize: 'var(--text-sm)' }}>
                          Rule Type
                        </Label>
                        <Select 
                          value={rule.type} 
                          onValueChange={(value) => updateRuleType(rule.id, value)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select rule type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ruleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rule Value Dropdown */}
                      <div>
                        <Label style={{ fontSize: 'var(--text-sm)' }}>
                          Value
                        </Label>
                        <Select 
                          value={rule.value}
                          onValueChange={(value) => updateRuleValue(rule.id, value)}
                          disabled={!rule.type}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder={rule.type ? "Select value..." : "Select rule type first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {rule.type && ruleValues[rule.type]?.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(rule.id)}
                      className="mt-6"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Add Rule Button */}
                <Button
                  variant="outline"
                  onClick={addMembershipRule}
                  className="w-full gap-2"
                  style={{ 
                    borderStyle: 'dashed',
                    borderColor: 'var(--border)'
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Membership Rule
                </Button>
              </div>

              {/* Info Banner */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info-border)', border: '1px solid' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  💡 Leave fields empty to manually manage role membership
                </p>
              </div>

              {/* Preview */}
              {membershipRules.filter(r => r.type && r.value).length > 0 && (
                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    <span style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      Estimated Impact
                    </span>
                  </div>
                  <div className="space-y-2">
                    {membershipRules.filter(r => r.type && r.value).map((rule) => {
                      const ruleTypeLabel = ruleTypes.find(t => t.value === rule.type)?.label;
                      return (
                        <div 
                          key={rule.id}
                          className="flex items-center justify-between text-sm"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <span>{ruleTypeLabel}: {rule.value}</span>
                          <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                            ~{rule.estimatedUsers} users
                          </Badge>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <span style={{ 
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)'
                        }}>
                          Total Estimated Members
                        </span>
                        <Badge style={{ fontSize: 'var(--text-sm)' }}>
                          ~{membershipRules.filter(r => r.type && r.value).reduce((acc, rule) => 
                            acc + rule.estimatedUsers, 0
                          )} users
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 style={{ 
                  fontSize: 'var(--text-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Review & Create
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  Review the role configuration before creating
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      Initial Members
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    {estimatedMembers}
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4" style={{ color: 'var(--info)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      Entitlements
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    {selectedEntitlements.size}
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      Risk Level
                    </span>
                  </div>
                  <RiskChip risk={riskCategory} />
                </div>
              </div>

              {/* Role Details */}
              <div className="p-6 rounded-lg border space-y-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Role Name
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginTop: '4px' }}>
                    {roleName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Description
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginTop: '4px' }}>
                    {description}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Owner
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginTop: '4px' }}>
                    {owner}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                    Selected Entitlements
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntitlementsList.map((ent) => (
                      <Badge key={ent.id} variant="outline">
                        {ent.appIcon} {ent.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {hasSodConflicts && (
                <div className="flex items-start gap-3 p-4 rounded-lg border" style={{
                  backgroundColor: 'var(--warning-bg)',
                  borderColor: 'var(--warning-border)'
                }}>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                  <div className="flex-1">
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--warning)'
                    }}>
                      Warning: SoD Conflicts
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      This role contains entitlements that may create segregation of duties conflicts. Consider reviewing the composition before creating.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer */}
      <div 
        className="sticky bottom-0 left-0 right-0 p-4 border-t backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--overlay)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="flex items-center justify-between max-w-[1320px] mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep === wizardSteps.length - 1 ? (
              <Button
                onClick={handleCreate}
                disabled={!canProceed()}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Create Role
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Impact Preview (on review step) */}
      {currentStep === 3 && (
        <ImpactPreviewBar
          membersAffected={estimatedMembers}
          entitlementsChanged={selectedEntitlements.size}
          riskChange={riskCategory === 'High' || riskCategory === 'Critical' ? 'increase' : 'none'}
        />
      )}
    </div>
  );
}
