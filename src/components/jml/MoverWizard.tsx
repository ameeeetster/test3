// Mover Wizard - Delta-Driven Role and Access Changes
// Safe-by-design workflow for role changes and access modifications

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
  UserCog, Zap, Shield, CheckCircle, AlertCircle, Clock, 
  ArrowRight, ArrowLeft, Eye, Edit, Copy, Trash2, Plus,
  Users, Building, MapPin, Calendar, Mail, Phone, User,
  Target, Filter, Search, Info, HelpCircle, Sparkles,
  ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle
} from 'lucide-react';
import { 
  Identity, Role, Entitlement, RiskLevel, 
  AiSuggestion, AiAnomaly, ChangeSet 
} from '../../types/jml';
import { mockDataService } from '../../services/mockDataService';
import { createAiService } from '../../services/aiService';

interface MoverWizardProps {
  onClose: () => void;
  onComplete: (request: any) => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface MoverForm {
  // Step 1 - Identity Selection
  identityId: string;
  identity: Identity | null;
  
  // Step 2 - Change Set
  changes: {
    manager?: { before: string; after: string };
    department?: { before: string; after: string };
    division?: { before: string; after: string };
    location?: { before: string; after: string };
    role?: { before: string; after: string };
  };
  
  // Step 3 - Delta Access Plan
  addedRoles: string[];
  removedRoles: string[];
  addedEntitlements: string[];
  removedEntitlements: string[];
  aiSuggestions: AiSuggestion[];
  aiAnomalies: AiAnomaly[];
  
  // Step 4 - Execution Plan
  phasedExecution: boolean;
  phases: Array<{
    phase: number;
    effectiveDate: string;
    effectiveTime: string;
    actions: string[];
  }>;
  
  // Step 5 - Review & Submit
  comments: string;
  effectiveDate: string;
  effectiveTime: string;
  requiresApproval: boolean;
}

export function MoverWizard({ onClose, onComplete }: MoverWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<MoverForm>({
    identityId: '',
    identity: null,
    changes: {},
    addedRoles: [],
    removedRoles: [],
    addedEntitlements: [],
    removedEntitlements: [],
    aiSuggestions: [],
    aiAnomalies: [],
    phasedExecution: false,
    phases: [],
    comments: '',
    effectiveDate: '',
    effectiveTime: '09:00',
    requiresApproval: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => createAiService());

  // Get data from services
  const identities = mockDataService.getIdentities();
  const roles = mockDataService.getRoles();
  const entitlements = mockDataService.getEntitlements();

  const steps: WizardStep[] = [
    { id: 'identity', title: 'Select Identity', description: 'Choose the identity to modify', completed: false },
    { id: 'changes', title: 'Define Changes', description: 'Specify organizational changes', completed: false },
    { id: 'access', title: 'Delta Access Plan', description: 'AI-suggested access modifications', completed: false },
    { id: 'execution', title: 'Execution Plan', description: 'Configure phased execution', completed: false },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission', completed: false }
  ];

  // Update step completion status
  useEffect(() => {
    const updatedSteps = steps.map((step, index) => {
      switch (step.id) {
        case 'identity':
          return { ...step, completed: !!form.identityId };
        case 'changes':
          return { ...step, completed: Object.keys(form.changes).length > 0 };
        case 'access':
          return { ...step, completed: form.addedRoles.length > 0 || form.removedRoles.length > 0 || form.addedEntitlements.length > 0 || form.removedEntitlements.length > 0 };
        case 'execution':
          return { ...step, completed: !!form.effectiveDate };
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
      type: 'MOVER',
      identity: form.identity,
      changeSet: {
        addedRoles: form.addedRoles,
        removedRoles: form.removedRoles,
        addedEntitlements: form.addedEntitlements,
        removedEntitlements: form.removedEntitlements,
        modifiedAttributes: form.changes
      },
      comments: form.comments,
      effectiveDate: form.effectiveDate,
      effectiveTime: form.effectiveTime,
      phasedExecution: form.phasedExecution,
      phases: form.phases
    };
    
    onComplete(request);
    setIsLoading(false);
  };

  const generateDeltaPlan = async () => {
    if (!form.identity) return;
    
    setIsLoading(true);
    
    // Create mock identity context for AI
    const identityContext = {
      identity: form.identity,
      peerGroup: identities.filter(i => i.department === form.changes.department?.after || i.department === form.identity?.department),
      historicalPatterns: [],
      organizationalContext: {}
    };
    
    try {
      const suggestions = await aiService.suggestAccess(identityContext);
      const anomalies = await aiService.detectAnomalies({
        type: 'MOVER',
        identity: form.identity,
        changeSet: {
          addedRoles: [],
          addedEntitlements: [],
          modifiedAttributes: form.changes
        }
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
    if (form.addedEntitlements.some(e => entitlements.find(ent => ent.id === e)?.isPrivileged)) return 'MEDIUM';
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

  const simulateImpact = () => {
    // TODO: Implement impact simulation
    console.log('Simulating impact...');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCog className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Mover Request</h2>
                <p className="text-sm text-muted-foreground">Delta-driven role and access changes</p>
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
          {/* Step 1: Identity Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select Identity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose the identity that will undergo role or access changes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identity">Identity *</Label>
                <Select
                  value={form.identityId}
                  onValueChange={value => {
                    const identity = identities.find(i => i.id === value);
                    setForm(prev => ({ 
                      ...prev, 
                      identityId: value,
                      identity: identity || null
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select identity to modify" />
                  </SelectTrigger>
                  <SelectContent>
                    {identities.filter(i => i.status === 'ACTIVE').map(identity => (
                      <SelectItem key={identity.id} value={identity.id}>
                        <div className="flex items-center gap-2">
                          <span>{identity.displayName}</span>
                          <span className="text-muted-foreground">({identity.email})</span>
                          <Badge variant="outline" className="text-xs">
                            {identity.department}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Identity Details */}
              {form.identity && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Current Identity Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Name</Label>
                        <p className="text-sm">{form.identity.displayName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{form.identity.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Department</Label>
                        <p className="text-sm">{form.identity.department}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm">{form.identity.location}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Manager</Label>
                        <p className="text-sm">{form.identity.managerName || 'Not assigned'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Employment Type</Label>
                        <p className="text-sm">{form.identity.employmentType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Define Changes */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Define Changes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Specify what organizational changes will occur
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department Change</Label>
                  <Select
                    value={form.changes.department?.after || ''}
                    onValueChange={value => {
                      setForm(prev => ({
                        ...prev,
                        changes: {
                          ...prev.changes,
                          department: {
                            before: form.identity?.department || '',
                            after: value
                          }
                        }
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new department" />
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
                  <Label htmlFor="location">Location Change</Label>
                  <Select
                    value={form.changes.location?.after || ''}
                    onValueChange={value => {
                      setForm(prev => ({
                        ...prev,
                        changes: {
                          ...prev.changes,
                          location: {
                            before: form.identity?.location || '',
                            after: value
                          }
                        }
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new location" />
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
                  <Label htmlFor="manager">Manager Change</Label>
                  <Select
                    value={form.changes.manager?.after || ''}
                    onValueChange={value => {
                      const manager = identities.find(i => i.id === value);
                      setForm(prev => ({
                        ...prev,
                        changes: {
                          ...prev.changes,
                          manager: {
                            before: form.identity?.managerName || '',
                            after: manager?.displayName || ''
                          }
                        }
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {identities.filter(i => i.department === form.changes.department?.after || i.department === form.identity?.department).map(identity => (
                        <SelectItem key={identity.id} value={identity.id}>
                          {identity.displayName} ({identity.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role Change</Label>
                  <Select
                    value={form.changes.role?.after || ''}
                    onValueChange={value => {
                      setForm(prev => ({
                        ...prev,
                        changes: {
                          ...prev.changes,
                          role: {
                            before: 'Current Role', // TODO: Get current role
                            after: value
                          }
                        }
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Change Summary */}
              {Object.keys(form.changes).length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <ArrowUpDown className="w-5 h-5" />
                      Change Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(form.changes).map(([key, change]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="font-medium capitalize">{key}:</span>
                          <span className="text-muted-foreground">{change.before}</span>
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{change.after}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Delta Access Plan */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Delta Access Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-suggested access modifications based on organizational changes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={simulateImpact}>
                    <Eye className="w-4 h-4 mr-1" />
                    Simulate Impact
                  </Button>
                  <Button onClick={generateDeltaPlan} disabled={isLoading}>
                    <Zap className="w-4 h-4 mr-1" />
                    Generate Delta Plan
                  </Button>
                </div>
              </div>

              {/* AI Suggestions */}
              {form.aiSuggestions.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Sparkles className="w-5 h-5" />
                      AI Delta Recommendations
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      Suggested access changes based on organizational move
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
                                      addedRoles: [...prev.addedRoles, suggestion.target]
                                    }));
                                  } else if (suggestion.type === 'ENTITLEMENT') {
                                    setForm(prev => ({
                                      ...prev,
                                      addedEntitlements: [...prev.addedEntitlements, suggestion.target]
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
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Anomalies */}
              {form.aiAnomalies.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
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

              {/* Access Changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Roles to Add */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <ArrowUp className="w-5 h-5" />
                      Roles to Add
                    </CardTitle>
                    <CardDescription>New roles for the identity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {roles.map(role => (
                        <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.addedRoles.includes(role.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForm(prev => ({ ...prev, addedRoles: [...prev.addedRoles, role.id] }));
                                } else {
                                  setForm(prev => ({ ...prev, addedRoles: prev.addedRoles.filter(id => id !== role.id) }));
                                }
                              }}
                              className="rounded"
                            />
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {role.criticality}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Roles to Remove */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <ArrowDown className="w-5 h-5" />
                      Roles to Remove
                    </CardTitle>
                    <CardDescription>Roles to revoke from the identity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {roles.map(role => (
                        <div key={role.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.removedRoles.includes(role.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForm(prev => ({ ...prev, removedRoles: [...prev.removedRoles, role.id] }));
                                } else {
                                  setForm(prev => ({ ...prev, removedRoles: prev.removedRoles.filter(id => id !== role.id) }));
                                }
                              }}
                              className="rounded"
                            />
                            <div>
                              <div className="font-medium">{role.name}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {role.criticality}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Entitlements Changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entitlements to Add */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <ArrowUp className="w-5 h-5" />
                      Entitlements to Add
                    </CardTitle>
                    <CardDescription>New application entitlements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entitlements.map(entitlement => (
                        <div key={entitlement.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.addedEntitlements.includes(entitlement.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForm(prev => ({ ...prev, addedEntitlements: [...prev.addedEntitlements, entitlement.id] }));
                                } else {
                                  setForm(prev => ({ ...prev, addedEntitlements: prev.addedEntitlements.filter(id => id !== entitlement.id) }));
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

                {/* Entitlements to Remove */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <ArrowDown className="w-5 h-5" />
                      Entitlements to Remove
                    </CardTitle>
                    <CardDescription>Application entitlements to revoke</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {entitlements.map(entitlement => (
                        <div key={entitlement.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.removedEntitlements.includes(entitlement.id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setForm(prev => ({ ...prev, removedEntitlements: [...prev.removedEntitlements, entitlement.id] }));
                                } else {
                                  setForm(prev => ({ ...prev, removedEntitlements: prev.removedEntitlements.filter(id => id !== entitlement.id) }));
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
            </div>
          )}

          {/* Step 4: Execution Plan */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Execution Plan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure how and when the changes will be executed
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Execution Options</CardTitle>
                  <CardDescription>Choose between immediate or phased execution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium">Phased Execution</div>
                        <div className="text-sm text-muted-foreground">
                          Execute changes in phases to minimize business disruption
                        </div>
                      </div>
                      <Switch
                        checked={form.phasedExecution}
                        onCheckedChange={checked => setForm(prev => ({ ...prev, phasedExecution: checked }))}
                      />
                    </div>

                    {form.phasedExecution && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium text-yellow-800">Phased Execution Plan</span>
                          </div>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p>• Phase 1: Remove obsolete access (Friday 18:00)</p>
                            <p>• Phase 2: Add new access (Monday 08:30)</p>
                            <p>• Phase 3: Update organizational attributes (Monday 09:00)</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Phase 1 Date</Label>
                              <Input type="date" />
                            </div>
                            <div className="space-y-2">
                              <Label>Phase 1 Time</Label>
                              <Input type="time" defaultValue="18:00" />
                            </div>
                            <div className="space-y-2">
                              <Label>Actions</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select actions" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="remove">Remove Access</SelectItem>
                                  <SelectItem value="disable">Disable Accounts</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!form.phasedExecution && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="effectiveDate">Effective Date *</Label>
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

              {/* AI Schedule Optimization */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Zap className="w-5 h-5" />
                    AI Schedule Optimization
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    AI suggests optimal timing based on historical patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-800">
                      Based on historical data and business patterns, AI recommends:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Execute role changes during low-activity hours (18:00-08:00)</li>
                      <li>• Avoid execution during critical business periods</li>
                      <li>• Schedule access removal before access addition to prevent conflicts</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review all changes before submitting the mover request
                </p>
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Identity</Label>
                        <p className="text-sm">{form.identity?.displayName}</p>
                        <p className="text-xs text-muted-foreground">{form.identity?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Department</Label>
                        <p className="text-sm">{form.identity?.department}</p>
                        <p className="text-xs text-muted-foreground">{form.identity?.location}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Organizational Changes</Label>
                      <div className="space-y-1 mt-1">
                        {Object.entries(form.changes).map(([key, change]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="font-medium capitalize">{key}:</span>
                            <span className="text-muted-foreground">{change.before}</span>
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{change.after}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Access Changes</Label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm font-medium text-green-600">Adding:</p>
                          <div className="flex flex-wrap gap-1">
                            {form.addedRoles.map(roleId => {
                              const role = roles.find(r => r.id === roleId);
                              return role ? (
                                <Badge key={roleId} variant="outline" className="text-xs">
                                  {role.name}
                                </Badge>
                              ) : null;
                            })}
                            {form.addedEntitlements.map(entId => {
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
                          <p className="text-sm font-medium text-red-600">Removing:</p>
                          <div className="flex flex-wrap gap-1">
                            {form.removedRoles.map(roleId => {
                              const role = roles.find(r => r.id === roleId);
                              return role ? (
                                <Badge key={roleId} variant="outline" className="text-xs">
                                  {role.name}
                                </Badge>
                              ) : null;
                            })}
                            {form.removedEntitlements.map(entId => {
                              const entitlement = entitlements.find(e => e.id === entId);
                              return entitlement ? (
                                <Badge key={entId} variant="outline" className="text-xs">
                                  {entitlement.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
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

                    <div>
                      <Label className="text-sm font-medium">Execution Plan</Label>
                      <p className="text-sm mt-1">
                        {form.phasedExecution ? 'Phased execution' : 'Immediate execution'} on {form.effectiveDate} at {form.effectiveTime}
                      </p>
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
                  placeholder="Add justification for the organizational changes..."
                  className="min-h-[100px]"
                />
              </div>
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
