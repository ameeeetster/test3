// Leaver Wizard - Safe Termination and Offboarding
// Rapid, reversible termination process with safety controls

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
import { Checkbox } from '../ui/checkbox';
import { 
  UserMinus, Zap, Shield, CheckCircle, AlertCircle, Clock, 
  ArrowRight, ArrowLeft, Eye, Edit, Copy, Trash2, Plus,
  Users, Building, MapPin, Calendar, Mail, Phone, User,
  Target, Filter, Search, Info, HelpCircle, Sparkles,
  AlertTriangle, Lock, Unlock, Mailbox, HardDrive, Smartphone
} from 'lucide-react';
import { 
  Identity, TerminationType, RiskLevel, 
  AiSuggestion, AiAnomaly 
} from '../../types/jml';
import { mockDataService } from '../../services/mockDataService';
import { createAiService } from '../../services/aiService';

interface LeaverWizardProps {
  onClose: () => void;
  onComplete: (request: any) => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface LeaverForm {
  // Step 1 - Identity Selection
  identityId: string;
  identity: Identity | null;
  
  // Step 2 - Termination Details
  terminationType: TerminationType;
  effectiveDate: string;
  effectiveTime: string;
  reason: string;
  isImmediate: boolean;
  
  // Step 3 - Access Actions
  actions: {
    disableAccounts: boolean;
    removeAccess: boolean;
    reclaimLicenses: boolean;
    forwardMail: boolean;
    managerDataAccess: boolean;
    quarantineGroups: boolean;
    wipeMdm: boolean;
    deleteAfterRetention: boolean;
  };
  
  // Step 4 - Safety Controls
  gracePeriod: number; // days
  litigationHold: boolean;
  dataRetentionPeriod: number; // days
  managerDataHandover: boolean;
  requiresApproval: boolean;
  
  // Step 5 - Review & Submit
  comments: string;
  aiAnomalies: AiAnomaly[];
}

export function LeaverWizard({ onClose, onComplete }: LeaverWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<LeaverForm>({
    identityId: '',
    identity: null,
    terminationType: 'VOLUNTARY',
    effectiveDate: '',
    effectiveTime: '17:00',
    reason: '',
    isImmediate: false,
    actions: {
      disableAccounts: true,
      removeAccess: true,
      reclaimLicenses: true,
      forwardMail: false,
      managerDataAccess: true,
      quarantineGroups: true,
      wipeMdm: false,
      deleteAfterRetention: true
    },
    gracePeriod: 7,
    litigationHold: false,
    dataRetentionPeriod: 30,
    managerDataHandover: true,
    requiresApproval: true,
    comments: '',
    aiAnomalies: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiService] = useState(() => createAiService());

  // Get data from services
  const identities = mockDataService.getIdentities();

  const steps: WizardStep[] = [
    { id: 'identity', title: 'Select Identity', description: 'Choose the identity to terminate', completed: false },
    { id: 'termination', title: 'Termination Details', description: 'Specify termination type and timing', completed: false },
    { id: 'actions', title: 'Access Actions', description: 'Configure offboarding actions', completed: false },
    { id: 'safety', title: 'Safety Controls', description: 'Set safety and retention policies', completed: false },
    { id: 'review', title: 'Review & Submit', description: 'Final review and submission', completed: false }
  ];

  // Update step completion status
  useEffect(() => {
    const updatedSteps = steps.map((step, index) => {
      switch (step.id) {
        case 'identity':
          return { ...step, completed: !!form.identityId };
        case 'termination':
          return { ...step, completed: !!form.effectiveDate && !!form.reason };
        case 'actions':
          return { ...step, completed: Object.values(form.actions).some(action => action) };
        case 'safety':
          return { ...step, completed: form.gracePeriod > 0 && form.dataRetentionPeriod > 0 };
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
      type: 'LEAVER',
      identity: form.identity,
      terminationType: form.terminationType,
      effectiveDate: form.effectiveDate,
      effectiveTime: form.effectiveTime,
      reason: form.reason,
      actions: form.actions,
      safetyControls: {
        gracePeriod: form.gracePeriod,
        litigationHold: form.litigationHold,
        dataRetentionPeriod: form.dataRetentionPeriod,
        managerDataHandover: form.managerDataHandover
      },
      comments: form.comments
    };
    
    onComplete(request);
    setIsLoading(false);
  };

  const detectAnomalies = async () => {
    if (!form.identity) return;
    
    setIsLoading(true);
    
    try {
      const anomalies = await aiService.detectAnomalies({
        type: 'LEAVER',
        identity: form.identity,
        changeSet: { addedRoles: [], addedEntitlements: [] }
      } as any);
      
      setForm(prev => ({
        ...prev,
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
    if (form.terminationType === 'IMMEDIATE') return 'HIGH';
    if (form.actions.wipeMdm) return 'HIGH';
    return 'MEDIUM';
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

  const getTerminationTypeColor = (type: TerminationType) => {
    switch (type) {
      case 'VOLUNTARY': return 'text-blue-600 bg-blue-100';
      case 'INVOLUNTARY': return 'text-orange-600 bg-orange-100';
      case 'IMMEDIATE': return 'text-red-600 bg-red-100';
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
              <UserMinus className="w-6 h-6 text-red-600" />
              <div>
                <h2 className="text-xl font-semibold">Leaver Request</h2>
                <p className="text-sm text-muted-foreground">Safe termination and offboarding process</p>
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
                  Choose the identity that will be terminated
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
                    <SelectValue placeholder="Select identity to terminate" />
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
                      Identity Details
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
                        <Label className="text-sm font-medium">Manager</Label>
                        <p className="text-sm">{form.identity.managerName || 'Not assigned'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Employment Type</Label>
                        <p className="text-sm">{form.identity.employmentType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm">{form.identity.startDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Termination Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Termination Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Specify the type and timing of termination
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="terminationType">Termination Type *</Label>
                  <Select
                    value={form.terminationType}
                    onValueChange={(value: TerminationType) => setForm(prev => ({ ...prev, terminationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOLUNTARY">Voluntary</SelectItem>
                      <SelectItem value="INVOLUNTARY">Involuntary</SelectItem>
                      <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    value={form.reason}
                    onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter termination reason"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div>
                  <div className="font-medium">Immediate Termination</div>
                  <div className="text-sm text-muted-foreground">
                    Terminate immediately without grace period
                  </div>
                </div>
                <Switch
                  checked={form.isImmediate}
                  onCheckedChange={checked => setForm(prev => ({ ...prev, isImmediate: checked }))}
                />
              </div>

              {/* Termination Type Warnings */}
              {form.terminationType === 'IMMEDIATE' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Immediate Termination:</strong> This will immediately disable all accounts and remove access. 
                    Ensure all necessary data has been backed up and manager has been notified.
                  </AlertDescription>
                </Alert>
              )}

              {form.terminationType === 'INVOLUNTARY' && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Involuntary Termination:</strong> Additional security measures will be applied. 
                    Consider immediate account disable and data preservation.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 3: Access Actions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Access Actions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure what actions will be taken during offboarding
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Account Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Disable Accounts</div>
                          <div className="text-sm text-muted-foreground">
                            Disable all user accounts immediately
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.disableAccounts}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, disableAccounts: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Remove Access</div>
                          <div className="text-sm text-muted-foreground">
                            Remove all role and entitlement access
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.removeAccess}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, removeAccess: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Reclaim Licenses</div>
                          <div className="text-sm text-muted-foreground">
                            Reclaim software licenses for reuse
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.reclaimLicenses}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, reclaimLicenses: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Quarantine Groups</div>
                          <div className="text-sm text-muted-foreground">
                            Remove from all distribution groups
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.quarantineGroups}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, quarantineGroups: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      Data Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Forward Mail</div>
                          <div className="text-sm text-muted-foreground">
                            Forward emails to manager or delegate
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.forwardMail}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, forwardMail: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Manager Data Access</div>
                          <div className="text-sm text-muted-foreground">
                            Grant manager access to files and data
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.managerDataAccess}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, managerDataAccess: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Wipe MDM</div>
                          <div className="text-sm text-muted-foreground">
                            Remote wipe mobile devices
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.wipeMdm}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, wipeMdm: checked }
                          }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Delete After Retention</div>
                          <div className="text-sm text-muted-foreground">
                            Delete accounts after retention period
                          </div>
                        </div>
                        <Switch
                          checked={form.actions.deleteAfterRetention}
                          onCheckedChange={checked => setForm(prev => ({ 
                            ...prev, 
                            actions: { ...prev.actions, deleteAfterRetention: checked }
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Risk Detection */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Zap className="w-5 h-5" />
                    AI Risk Detection
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    AI analyzes termination actions for potential risks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={detectAnomalies} disabled={isLoading}>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Analyze Risks
                    </Button>
                    <span className="text-xs text-blue-600">
                      AI will detect at-risk entitlements and recommend retention duration
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Anomalies */}
              {form.aiAnomalies.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>AI Detected Risks:</strong>
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
            </div>
          )}

          {/* Step 4: Safety Controls */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Safety Controls</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure safety measures and data retention policies
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    min="0"
                    max="30"
                    value={form.gracePeriod}
                    onChange={e => setForm(prev => ({ ...prev, gracePeriod: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time before accounts are fully disabled
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataRetentionPeriod">Data Retention Period (days)</Label>
                  <Input
                    id="dataRetentionPeriod"
                    type="number"
                    min="1"
                    max="365"
                    value={form.dataRetentionPeriod}
                    onChange={e => setForm(prev => ({ ...prev, dataRetentionPeriod: parseInt(e.target.value) || 30 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to retain data before deletion
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <div className="font-medium">Litigation Hold</div>
                    <div className="text-sm text-muted-foreground">
                      Preserve all data for legal proceedings
                    </div>
                  </div>
                  <Switch
                    checked={form.litigationHold}
                    onCheckedChange={checked => setForm(prev => ({ ...prev, litigationHold: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <div className="font-medium">Manager Data Handover</div>
                    <div className="text-sm text-muted-foreground">
                      Transfer data ownership to manager
                    </div>
                  </div>
                  <Switch
                    checked={form.managerDataHandover}
                    onCheckedChange={checked => setForm(prev => ({ ...prev, managerDataHandover: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <div className="font-medium">Requires Approval</div>
                    <div className="text-sm text-muted-foreground">
                      Manager must approve termination actions
                    </div>
                  </div>
                  <Switch
                    checked={form.requiresApproval}
                    onCheckedChange={checked => setForm(prev => ({ ...prev, requiresApproval: checked }))}
                  />
                </div>
              </div>

              {/* Safety Warnings */}
              {form.gracePeriod === 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>No Grace Period:</strong> Accounts will be disabled immediately. 
                    Ensure all necessary data has been backed up.
                  </AlertDescription>
                </Alert>
              )}

              {form.dataRetentionPeriod < 7 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Short Retention Period:</strong> Data will be deleted quickly. 
                    Consider extending retention period for compliance.
                  </AlertDescription>
                </Alert>
              )}

              {/* AI Recommendations */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Sparkles className="w-5 h-5" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    AI suggests optimal retention duration by role and regulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-green-800">
                      Based on role analysis and regulatory requirements:
                    </p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Recommended retention: 30 days for standard roles</li>
                      <li>• Manager approval required for privileged access</li>
                      <li>• Consider litigation hold for involuntary terminations</li>
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
                  Review all termination details before submitting
                </p>
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Termination Summary</CardTitle>
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
                        <Label className="text-sm font-medium">Department</Label>
                        <p className="text-sm">{form.identity?.department}</p>
                        <p className="text-xs text-muted-foreground">{form.identity?.managerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Termination Type</Label>
                        <Badge variant="outline" className={`text-xs ${getTerminationTypeColor(form.terminationType)}`}>
                          {form.terminationType}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Effective</Label>
                        <p className="text-sm">{form.effectiveDate} at {form.effectiveTime}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Actions</Label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm font-medium text-red-600">Account Actions:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {form.actions.disableAccounts && <li>• Disable accounts</li>}
                            {form.actions.removeAccess && <li>• Remove access</li>}
                            {form.actions.reclaimLicenses && <li>• Reclaim licenses</li>}
                            {form.actions.quarantineGroups && <li>• Quarantine groups</li>}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">Data Actions:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {form.actions.forwardMail && <li>• Forward mail</li>}
                            {form.actions.managerDataAccess && <li>• Manager data access</li>}
                            {form.actions.wipeMdm && <li>• Wipe MDM</li>}
                            {form.actions.deleteAfterRetention && <li>• Delete after retention</li>}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Safety Controls</Label>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-sm">Grace Period: {form.gracePeriod} days</p>
                          <p className="text-sm">Data Retention: {form.dataRetentionPeriod} days</p>
                        </div>
                        <div>
                          <p className="text-sm">Litigation Hold: {form.litigationHold ? 'Yes' : 'No'}</p>
                          <p className="text-sm">Manager Handover: {form.managerDataHandover ? 'Yes' : 'No'}</p>
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
                            {form.aiAnomalies.length} risks detected
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
                  placeholder="Add termination justification and special instructions..."
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
