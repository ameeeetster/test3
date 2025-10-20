// Joiner Wizard - AI-Assisted New Hire Onboarding
// Step-by-step wizard for creating joiner requests with AI recommendations

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  UserPlus, Zap, Shield, CheckCircle, AlertCircle, Clock, 
  ArrowRight, ArrowLeft, Eye, Edit, Copy, Trash2, Plus,
  Users, Building, MapPin, Calendar, Mail, Phone, User,
  Target, Filter, Search, Info, HelpCircle, Sparkles
} from 'lucide-react';
import { 
  Identity, Role, Entitlement, EmploymentType, RiskLevel, 
  AiSuggestion, AiAnomaly, ChangeSet 
} from '../../types/jml';
import { mockDataService } from '../../services/mockDataService';
import { createAiService } from '../../services/aiService';

interface JoinerWizardProps {
  onClose: () => void;
  onComplete: (request: any) => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface JoinerForm {
  // Step 1 - Identity Basics
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  startDate: string;
  startTime: string;
  employmentType: EmploymentType;
  company: string;
  division: string;
  department: string;
  location: string;
  managerId: string;
  managerName: string;
  
  // Step 2 - Access & Recommendations
  selectedRoles: string[];
  selectedEntitlements: string[];
  aiSuggestions: AiSuggestion[];
  aiAnomalies: AiAnomaly[];
  
  // Step 3 - Approvals
  approvalPath: string[];
  requiresManagerApproval: boolean;
  requiresAppOwnerApproval: boolean;
  requiresIamApproval: boolean;
  
  // Step 4 - Review & Submit
  comments: string;
  scheduleImmediate: boolean;
  effectiveDate: string;
  effectiveTime: string;
}

export function JoinerWizard({ onClose, onComplete }: JoinerWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<JoinerForm>({
    firstName: '',
    lastName: '',
    email: '',
    employeeId: '',
    startDate: '',
    startTime: '09:00',
    employmentType: 'PERMANENT',
    company: 'ACME Corp',
    division: '',
    department: '',
    location: '',
    managerId: '',
    managerName: '',
    selectedRoles: [],
    selectedEntitlements: [],
    aiSuggestions: [],
    aiAnomalies: [],
    approvalPath: [],
    requiresManagerApproval: true,
    requiresAppOwnerApproval: false,
    requiresIamApproval: false,
    comments: '',
    scheduleImmediate: true,
    effectiveDate: '',
    effectiveTime: '09:00'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => createAiService());

  // Get data from services
  const identities = mockDataService.getIdentities();
  const roles = mockDataService.getRoles();
  const entitlements = mockDataService.getEntitlements();

  const steps: WizardStep[] = [
    { id: 'identity', title: 'Identity Basics', description: 'Personal and organizational information', completed: false },
    { id: 'access', title: 'Access & Recommendations', description: 'AI-suggested roles and entitlements', completed: false },
    { id: 'approvals', title: 'Approval Path', description: 'Configure approval workflow', completed: false },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission', completed: false }
  ];

  // Update step completion status
  useEffect(() => {
    const updatedSteps = steps.map((step, index) => {
      switch (step.id) {
        case 'identity':
          return { ...step, completed: !!(form.firstName && form.lastName && form.email && form.department) };
        case 'access':
          return { ...step, completed: form.selectedRoles.length > 0 || form.selectedEntitlements.length > 0 };
        case 'approvals':
          return { ...step, completed: form.approvalPath.length > 0 };
        case 'review':
          return { ...step, completed: !!form.comments };
        default:
          return step;
      }
    });
  }, [form]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const request = {
      type: 'JOINER',
      identity: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        employeeId: form.employeeId,
        department: form.department,
        employmentType: form.employmentType
      },
      changeSet: {
        addedRoles: form.selectedRoles,
        addedEntitlements: form.selectedEntitlements
      },
      comments: form.comments,
      effectiveDate: form.effectiveDate,
      effectiveTime: form.effectiveTime
    };
    
    onComplete(request);
    setIsLoading(false);
  };

  const generateAiSuggestions = async () => {
    setIsLoading(true);
    
    // Create mock identity context
    const identityContext = {
      identity: {
        department: form.department,
        employmentType: form.employmentType,
        location: form.location
      } as Identity,
      peerGroup: identities.filter(i => i.department === form.department),
      historicalPatterns: [],
      organizationalContext: {}
    };
    
    try {
      const suggestions = await aiService.suggestAccess(identityContext);
      const anomalies = await aiService.detectAnomalies({
        type: 'JOINER',
        identity: identityContext.identity,
        changeSet: { addedRoles: [], addedEntitlements: [] }
      } as any);
      
      setForm(prev => ({
        ...prev,
        aiSuggestions: suggestions,
        aiAnomalies: anomalies
      }));
    } catch (error) {
      console.error('AI service error:', error);
    }
    
    setIsLoading(false);
  };

  const getRiskLevel = (): RiskLevel => {
    if (form.aiAnomalies.some(a => a.severity === 'CRITICAL')) return 'CRITICAL';
    if (form.aiAnomalies.some(a => a.severity === 'HIGH')) return 'HIGH';
    if (form.aiAnomalies.some(a => a.severity === 'MEDIUM')) return 'MEDIUM';
    if (form.selectedEntitlements.some(e => entitlements.find(ent => ent.id === e)?.isPrivileged)) return 'MEDIUM';
    return 'LOW';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold">New Joiner Request</h2>
                <p className="text-sm text-muted-foreground">AI-assisted onboarding workflow</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-sm text-muted-foreground">{steps[currentStep].title}</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Identity Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Identity Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the new hire's personal and organizational details
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={form.employeeId}
                    onChange={e => setForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select
                    value={form.employmentType}
                    onValueChange={(value: EmploymentType) => setForm(prev => ({ ...prev, employmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERMANENT">Permanent</SelectItem>
                      <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                      <SelectItem value="INTERN">Intern</SelectItem>
                      <SelectItem value="VENDOR">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="division">Division *</Label>
                  <Select
                    value={form.division}
                    onValueChange={value => setForm(prev => ({ ...prev, division: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={form.department}
                    onValueChange={value => setForm(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={form.location}
                    onValueChange={value => setForm(prev => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="San Francisco">San Francisco</SelectItem>
                      <SelectItem value="New York">New York</SelectItem>
                      <SelectItem value="Chicago">Chicago</SelectItem>
                      <SelectItem value="London">London</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select
                    value={form.managerId}
                    onValueChange={value => {
                      const manager = identities.find(i => i.id === value);
                      setForm(prev => ({ 
                        ...prev, 
                        managerId: value,
                        managerName: manager?.displayName || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {identities.filter(i => i.department === form.department).map(identity => (
                        <SelectItem key={identity.id} value={identity.id}>
                          {identity.displayName} ({identity.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Helper */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Sparkles className="w-5 h-5" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Paste HR data to auto-fill form fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Paste HR export data here (JSON, CSV, or free text)..."
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Zap className="w-4 h-4 mr-1" />
                        Extract & Fill
                      </Button>
                      <span className="text-xs text-blue-600">
                        AI will extract and populate form fields with confidence indicators
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Access & Recommendations */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Access & Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-suggested roles and entitlements based on department and role
                  </p>
                </div>
                <Button onClick={generateAiSuggestions} disabled={isLoading}>
                  <Zap className="w-4 h-4 mr-1" />
                  Generate AI Suggestions
                </Button>
              </div>

              {/* AI Suggestions */}
              {form.aiSuggestions.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Sparkles className="w-5 h-5" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Suggested access based on department patterns and peer analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {form.aiSuggestions.map(suggestion => (
                        <div key={suggestion.id} className="p-3 rounded-lg border bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.type}
                              </Badge>
                              <span className="font-medium">{suggestion.title}</span>
                              <Badge variant="outline" className={`text-xs ${getRiskColor(suggestion.riskLevel)}`}>
                                {suggestion.riskLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (suggestion.type === 'ROLE') {
                                    setForm(prev => ({
                                      ...prev,
                                      selectedRoles: [...prev.selectedRoles, suggestion.target]
                                    }));
                                  } else if (suggestion.type === 'ENTITLEMENT') {
                                    setForm(prev => ({
                                      ...prev,
                                      selectedEntitlements: [...prev.selectedEntitlements, suggestion.target]
                                    }));
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                          <p className="text-xs text-blue-600">{suggestion.rationale}</p>
                          {suggestion.peerComparison && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Peer analysis: {suggestion.peerComparison.similarIdentities} similar identities
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Anomalies */}
              {form.aiAnomalies.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>AI Detected Anomalies:</strong>
                    <ul className="mt-2 space-y-1">
                      {form.aiAnomalies.map(anomaly => (
                        <li key={anomaly.id} className="text-sm">
                          • {anomaly.title}: {anomaly.description}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Manual Role Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Assignment</CardTitle>
                  <CardDescription>Select roles for the new hire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roles.map(role => (
                      <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={form.selectedRoles.includes(role.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setForm(prev => ({ ...prev, selectedRoles: [...prev.selectedRoles, role.id] }));
                              } else {
                                setForm(prev => ({ ...prev, selectedRoles: prev.selectedRoles.filter(id => id !== role.id) }));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {role.criticality}
                          </Badge>
                          {role.isBirthright && (
                            <Badge variant="secondary" className="text-xs">
                              Birthright
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Manual Entitlement Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Entitlement Assignment</CardTitle>
                  <CardDescription>Select specific application entitlements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entitlements.map(entitlement => (
                      <div key={entitlement.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={form.selectedEntitlements.includes(entitlement.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setForm(prev => ({ ...prev, selectedEntitlements: [...prev.selectedEntitlements, entitlement.id] }));
                              } else {
                                setForm(prev => ({ ...prev, selectedEntitlements: prev.selectedEntitlements.filter(id => id !== entitlement.id) }));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium">{entitlement.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {entitlement.applicationName} • {entitlement.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getRiskColor(entitlement.riskLevel)}`}>
                            {entitlement.riskLevel}
                          </Badge>
                          {entitlement.isPrivileged && (
                            <Badge variant="destructive" className="text-xs">
                              Privileged
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Approvals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Approval Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure the approval workflow for this joiner request
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Approval Requirements</CardTitle>
                  <CardDescription>Select who needs to approve this request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium">Manager Approval</div>
                        <div className="text-sm text-muted-foreground">
                          Direct manager must approve the request
                        </div>
                      </div>
                      <Switch
                        checked={form.requiresManagerApproval}
                        onCheckedChange={checked => setForm(prev => ({ ...prev, requiresManagerApproval: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium">Application Owner Approval</div>
                        <div className="text-sm text-muted-foreground">
                          Application owners must approve privileged access
                        </div>
                      </div>
                      <Switch
                        checked={form.requiresAppOwnerApproval}
                        onCheckedChange={checked => setForm(prev => ({ ...prev, requiresAppOwnerApproval: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium">IAM Admin Approval</div>
                        <div className="text-sm text-muted-foreground">
                          IAM administrators must approve high-risk requests
                        </div>
                      </div>
                      <Switch
                        checked={form.requiresIamApproval}
                        onCheckedChange={checked => setForm(prev => ({ ...prev, requiresIamApproval: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Fast-track Suggestion */}
              {getRiskLevel() === 'LOW' && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Zap className="w-5 h-5" />
                      AI Fast-track Recommendation
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      This request qualifies for fast-track approval
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-green-800">
                        Based on the low risk level and standard access patterns, this request can be fast-tracked with:
                      </p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Manager approval only</li>
                        <li>• Reduced SLA (24 hours vs 72 hours)</li>
                        <li>• Automated provisioning</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review all details before submitting the joiner request
                </p>
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Identity</Label>
                        <p className="text-sm">{form.firstName} {form.lastName}</p>
                        <p className="text-xs text-muted-foreground">{form.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Organization</Label>
                        <p className="text-sm">{form.department}, {form.location}</p>
                        <p className="text-xs text-muted-foreground">{form.employmentType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm">{form.startDate} at {form.startTime}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Manager</Label>
                        <p className="text-sm">{form.managerName || 'Not assigned'}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Selected Roles ({form.selectedRoles.length})</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.selectedRoles.map(roleId => {
                          const role = roles.find(r => r.id === roleId);
                          return role ? (
                            <Badge key={roleId} variant="outline" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Selected Entitlements ({form.selectedEntitlements.length})</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {form.selectedEntitlements.map(entId => {
                          const entitlement = entitlements.find(e => e.id === entId);
                          return entitlement ? (
                            <Badge key={entId} variant="outline" className="text-xs">
                              {entitlement.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Risk Assessment</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs ${getRiskColor(getRiskLevel())}`}>
                          {getRiskLevel()} RISK
                        </Badge>
                        {form.aiAnomalies.length > 0 && (
                          <span className="text-xs text-orange-600">
                            {form.aiAnomalies.length} anomalies detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <div className="space-y-2">
                <Label htmlFor="comments">Comments *</Label>
                <Textarea
                  id="comments"
                  value={form.comments}
                  onChange={e => setForm(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Add any additional context or special requirements..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Execution Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium">Execute Immediately</div>
                        <div className="text-sm text-muted-foreground">
                          Start provisioning as soon as approved
                        </div>
                      </div>
                      <Switch
                        checked={form.scheduleImmediate}
                        onCheckedChange={checked => setForm(prev => ({ ...prev, scheduleImmediate: checked }))}
                      />
                    </div>

                    {!form.scheduleImmediate && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="effectiveDate">Effective Date</Label>
                          <Input
                            id="effectiveDate"
                            type="date"
                            value={form.effectiveDate}
                            onChange={e => setForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="effectiveTime">Effective Time</Label>
                          <Input
                            id="effectiveTime"
                            type="time"
                            value={form.effectiveTime}
                            onChange={e => setForm(prev => ({ ...prev, effectiveTime: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-1 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Submit Request
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
