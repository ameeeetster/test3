import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { WizardStepper } from '../components/WizardStepper';
import { ImpactPreviewBar } from '../components/ImpactPreviewBar';
import { RiskChip } from '../components/RiskChip';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Users, Package, Plus, X, Shield, Settings, FileText, UserCheck } from 'lucide-react';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RBACService, Permission } from '../services/rbacService';
import { IdentityService, Identity } from '../services/identityService';
import { toast } from 'sonner';

const wizardSteps = [
  { id: 'basics', label: 'Basics', description: 'Role information' },
  { id: 'entitlements', label: 'Entitlements', description: 'Add permissions' },
  { id: 'rules', label: 'Rules', description: 'Membership criteria' },
  { id: 'review', label: 'Review', description: 'Confirm & create' }
];

// Permission categories with icons
const permissionCategories = {
  'User Management': { icon: Users, color: 'blue' },
  'Role Management': { icon: Shield, color: 'purple' },
  'Audit & Compliance': { icon: FileText, color: 'green' },
  'Organization': { icon: Settings, color: 'orange' },
  'Certification': { icon: UserCheck, color: 'red' },
  'Other': { icon: Package, color: 'gray' }
};

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

  // Identities for owner dropdown
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [isLoadingIdentities, setIsLoadingIdentities] = useState(true);
  const [manualOwnerEmail, setManualOwnerEmail] = useState('');

  // Step 2: Permissions (RBAC)
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<Record<string, Permission[]>>({});
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Step 3: Membership Rules
  const [membershipRules, setMembershipRules] = useState<MembershipRule[]>([]);

  // Loading and error states
  const [isCreating, setIsCreating] = useState(false);

  // Load permissions and identities on component mount
  useEffect(() => {
    loadPermissions();
    loadIdentities();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoadingPermissions(true);
      const permissionsData = await RBACService.getPermissionsByCategory();
      setPermissionsByCategory(permissionsData);
      
      // Flatten permissions for easy access
      const allPermissions = Object.values(permissionsData).flat();
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      toast.error('Failed to load permissions. Using fallback data.');
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const loadIdentities = async () => {
    try {
      setIsLoadingIdentities(true);
      console.log('Loading identities...');
      const identitiesData = await IdentityService.getIdentities();
      console.log('Identities loaded:', identitiesData);
      setIdentities(identitiesData);
    } catch (error) {
      console.error('Failed to load identities:', error);
      toast.error('Failed to load identities. Using fallback data.');
    } finally {
      setIsLoadingIdentities(false);
    }
  };

  const categories = Object.keys(permissionsByCategory);
  const filteredPermissions = filterCategory === 'all' 
    ? permissions 
    : permissionsByCategory[filterCategory] || [];

  const selectedPermissionsList = permissions.filter(p => selectedPermissions.has(p.key));
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

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      
      // Prepare role data
      const roleData = {
        name: roleName,
        description: description,
        permissions: Array.from(selectedPermissions) as string[]
      };

      // Create role via RBAC API
      const createdRole = await RBACService.createRole(roleData);
      
      // Show success message
      toast.success(`Role "${roleName}" created successfully!`);
      
      // Navigate to the roles page
      navigate('/access/roles');
      
    } catch (error: any) {
      console.error('Failed to create role:', error);
      
      // Show more specific error message
      const errorMessage = error.message || 'Failed to create role. Please try again.';
      toast.error(errorMessage);
      
      // Log additional details for debugging
      if (error.details) {
        console.error('Error details:', error.details);
      }
      if (error.hint) {
        console.error('Error hint:', error.hint);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const togglePermission = (permissionKey: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permissionKey)) {
      newSet.delete(permissionKey);
    } else {
      newSet.add(permissionKey);
    }
    setSelectedPermissions(newSet);
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
        return selectedPermissions.size > 0;
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="owner">Owner *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={loadIdentities}
                      disabled={isLoadingIdentities}
                      className="text-xs"
                    >
                      {isLoadingIdentities ? (
                        <>
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                          Loading...
                        </>
                      ) : (
                        'Refresh'
                      )}
                    </Button>
                  </div>
                  <Select value={owner} onValueChange={setOwner}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select or enter owner email" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingIdentities ? (
                        <SelectItem value="loading" disabled>
                          Loading identities...
                        </SelectItem>
                      ) : identities.length === 0 ? (
                        <>
                          <SelectItem value="no-identities" disabled>
                            No identities found
                          </SelectItem>
                          <SelectItem value="manual-input">
                            Enter email manually
                          </SelectItem>
                        </>
                      ) : (
                        <>
                          {identities.map((identity) => (
                            <SelectItem key={identity.id} value={identity.email}>
                              <div className="flex flex-col">
                                <span className="font-medium">{identity.name}</span>
                                <span className="text-xs text-muted-foreground">{identity.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="manual-input">
                            Enter email manually
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  
                  {owner === 'manual-input' && (
                    <Input
                      placeholder="Enter owner email"
                      value={manualOwnerEmail}
                      onChange={(e) => {
                        setManualOwnerEmail(e.target.value);
                        setOwner(e.target.value);
                      }}
                      className="mt-2"
                    />
                  )}
                  
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

          {/* Step 2: Permissions (RBAC) */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ 
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Select Permissions
                  </h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                    {selectedPermissions.size} permissions selected
                  </p>
                </div>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingPermissions ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                      Loading permissions...
                    </p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {filterCategory === 'all' ? (
                      // Show all categories
                      categories.map(category => {
                        const categoryPermissions = permissionsByCategory[category] || [];
                        if (categoryPermissions.length === 0) return null;
                        
                        const CategoryIcon = permissionCategories[category as keyof typeof permissionCategories]?.icon || Package;
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center gap-2 pb-2 border-b">
                              <CategoryIcon className="w-4 h-4" />
                              <h4 style={{ 
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--text)'
                              }}>
                                {category}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {categoryPermissions.length}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {categoryPermissions.map((permission) => (
                                <div
                                  key={permission.key}
                                  onClick={() => togglePermission(permission.key)}
                                  className="flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-sm cursor-pointer"
                                  style={{
                                    borderColor: selectedPermissions.has(permission.key) ? 'var(--primary)' : 'var(--border)',
                                    backgroundColor: selectedPermissions.has(permission.key) ? 'var(--accent)' : 'var(--surface)'
                                  }}
                                >
                                  <Checkbox 
                                    checked={selectedPermissions.has(permission.key)} 
                                    onCheckedChange={() => togglePermission(permission.key)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div style={{ 
                                      fontSize: 'var(--text-sm)',
                                      fontWeight: 'var(--font-weight-medium)',
                                      color: 'var(--text)'
                                    }}>
                                      {permission.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                      {permission.description}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Show filtered permissions
                      <div className="space-y-2">
                        {filteredPermissions.map((permission) => (
                          <div
                            key={permission.key}
                            onClick={() => togglePermission(permission.key)}
                            className="flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:shadow-sm cursor-pointer"
                            style={{
                              borderColor: selectedPermissions.has(permission.key) ? 'var(--primary)' : 'var(--border)',
                              backgroundColor: selectedPermissions.has(permission.key) ? 'var(--accent)' : 'var(--surface)'
                            }}
                          >
                            <Checkbox 
                              checked={selectedPermissions.has(permission.key)} 
                              onCheckedChange={() => togglePermission(permission.key)}
                            />
                            <div className="flex-1 min-w-0">
                              <div style={{ 
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--text)'
                              }}>
                                {permission.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                                {permission.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
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
                    <Shield className="w-4 h-4" style={{ color: 'var(--info)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      Permissions
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    {selectedPermissions.size}
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
                    Selected Permissions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPermissionsList.map((permission) => (
                      <Badge key={permission.key} variant="outline">
                        {permission.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
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
                disabled={!canProceed() || isCreating}
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Role
                  </>
                )}
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
          entitlementsChanged={selectedPermissions.size}
          riskChange={riskCategory === 'High' || riskCategory === 'Critical' ? 'increase' : 'none'}
        />
      )}
    </div>
  );
}
