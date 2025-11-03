// ISR Configuration Component for Add Application Screen
// Extends existing Add Application wizard with ISR capabilities

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { 
  Shield, Zap, AlertTriangle, CheckCircle, XCircle, Plus, 
  Edit, Trash2, Eye, Play, Download, Upload, Search, Filter,
  Users, Building, MapPin, Calendar, Mail, Phone, User,
  Target, Info, HelpCircle, Sparkles, ArrowRight, ArrowUp, ArrowDown,
  MoreHorizontal, Settings, Database, GitBranch, Clock, FileText
} from 'lucide-react';
import {
  IdentitySystemOfRecord, ISRScope, AttributeMastership, PrecedenceStrategy,
  AttributeValidator, DataQualityRule, IngestionMode, ChangeDetectionConfig,
  ValidationResult, MappingSuggestion, ConflictDetection
} from '../../types/isr';
import { isrService } from '../../services/isrService';

interface ISRConfigurationProps {
  applicationId: string;
  onSave: (isrConfig: Partial<IdentitySystemOfRecord>) => void;
  onCancel: () => void;
}

export function ISRConfiguration({ applicationId, onSave, onCancel }: ISRConfigurationProps) {
  const [isISREnabled, setIsISREnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('scope');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<MappingSuggestion[]>([]);
  const [conflicts, setConflicts] = useState<ConflictDetection[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<IdentitySystemOfRecord>>({
    name: '',
    description: '',
    applicationId,
    scope: {
      masteredAttributes: [],
      organizationalScope: {},
      populationTypes: [],
      environments: ['PROD']
    },
    attributeMastership: [],
    precedenceStrategy: {
      type: 'PRIORITY_NUMBER',
      config: {},
      conflictResolution: 'HIGHEST_PRIORITY'
    },
    validators: [],
    dataQualityRules: [],
    ingestionMode: {
      type: 'POLLING',
      config: {}
    },
    changeDetection: {
      enabled: true,
      deltaDetection: true,
      batchProcessing: true,
      realTimeProcessing: false
    },
    aiAssistEnabled: true
  });

  // Sample data for validation
  const [sampleData, setSampleData] = useState<any[]>([]);

  useEffect(() => {
    if (isISREnabled) {
      // Load AI suggestions when ISR is enabled
      loadAISuggestions();
      detectConflicts();
    }
  }, [isISREnabled]);

  const loadAISuggestions = async () => {
    if (sampleData.length > 0) {
      const suggestions = await isrService.suggestMappings(sampleData);
      setAiSuggestions(suggestions);
    }
  };

  const detectConflicts = async () => {
    const detectedConflicts = await isrService.detectConflicts(formData);
    setConflicts(detectedConflicts);
  };

  const handleValidate = async () => {
    if (sampleData.length === 0) {
      alert('Please provide sample data for validation');
      return;
    }

    setIsValidating(true);
    try {
      const result = await isrService.validateISR(formData, sampleData);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  const addAttributeMastership = () => {
    const newMastership: AttributeMastership = {
      attribute: '',
      sourceField: '',
      mastershipType: 'PREFERRED_MASTER',
      precedence: 100,
      trustLevel: 80,
      nullPolicy: 'ACCEPT'
    };

    setFormData(prev => ({
      ...prev,
      attributeMastership: [...(prev.attributeMastership || []), newMastership]
    }));
  };

  const updateAttributeMastership = (index: number, updates: Partial<AttributeMastership>) => {
    setFormData(prev => ({
      ...prev,
      attributeMastership: prev.attributeMastership?.map((mastership, i) => 
        i === index ? { ...mastership, ...updates } : mastership
      ) || []
    }));
  };

  const removeAttributeMastership = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributeMastership: prev.attributeMastership?.filter((_, i) => i !== index) || []
    }));
  };

  const ScopeConfigurationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Attribute Scope</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select which attributes this ISR will master
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Mastered Attributes</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              'employmentStatus', 'startDate', 'endDate', 'company', 'division',
              'department', 'location', 'managerId', 'title', 'email', 'employeeId',
              'phone', 'address', 'grade', 'costCenter'
            ].map(attr => (
              <div key={attr} className="flex items-center space-x-2">
                <Checkbox
                  id={attr}
                  checked={formData.scope?.masteredAttributes?.includes(attr) || false}
                  onCheckedChange={(checked) => {
                    const currentAttrs = formData.scope?.masteredAttributes || [];
                    const newAttrs = checked 
                      ? [...currentAttrs, attr]
                      : currentAttrs.filter(a => a !== attr);
                    
                    setFormData(prev => ({
                      ...prev,
                      scope: {
                        ...prev.scope,
                        masteredAttributes: newAttrs
                      }
                    }));
                  }}
                />
                <Label htmlFor={attr} className="text-sm">{attr}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Organizational Scope</Label>
            <div className="space-y-2 mt-2">
              <div>
                <Label className="text-xs">Companies</Label>
                <Input 
                  placeholder="ACME Corp, Subsidiary Inc"
                  value={formData.scope?.organizationalScope?.companies?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    scope: {
                      ...prev.scope,
                      organizationalScope: {
                        ...prev.scope?.organizationalScope,
                        companies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }
                  }))}
                />
              </div>
              <div>
                <Label className="text-xs">Divisions</Label>
                <Input 
                  placeholder="Product, Sales, Finance"
                  value={formData.scope?.organizationalScope?.divisions?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    scope: {
                      ...prev.scope,
                      organizationalScope: {
                        ...prev.scope?.organizationalScope,
                        divisions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Population Types</Label>
            <div className="space-y-2 mt-2">
              {['PERMANENT', 'CONTRACTOR', 'INTERN', 'VENDOR'].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={formData.scope?.populationTypes?.includes(type as any) || false}
                    onCheckedChange={(checked) => {
                      const currentTypes = formData.scope?.populationTypes || [];
                      const newTypes = checked 
                        ? [...currentTypes, type as any]
                        : currentTypes.filter(t => t !== type);
                      
                      setFormData(prev => ({
                        ...prev,
                        scope: {
                          ...prev.scope,
                          populationTypes: newTypes
                        }
                      }));
                    }}
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MastershipTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Attribute Mastership</h3>
          <p className="text-sm text-muted-foreground">
            Define how each attribute is mastered and precedence rules
          </p>
        </div>
        <Button onClick={addAttributeMastership} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Attribute
        </Button>
      </div>

      <div className="space-y-4">
        {formData.attributeMastership?.map((mastership, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Attribute Mapping</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeAttributeMastership(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Attribute</Label>
                  <Select
                    value={mastership.attribute}
                    onValueChange={(value) => updateAttributeMastership(index, { attribute: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.scope?.masteredAttributes?.map(attr => (
                        <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Source Field</Label>
                  <Input
                    value={mastership.sourceField}
                    onChange={(e) => updateAttributeMastership(index, { sourceField: e.target.value })}
                    placeholder="e.g., emp_status"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mastership Type</Label>
                  <Select
                    value={mastership.mastershipType}
                    onValueChange={(value: any) => updateAttributeMastership(index, { mastershipType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXCLUSIVE_MASTER">Exclusive Master</SelectItem>
                      <SelectItem value="PREFERRED_MASTER">Preferred Master</SelectItem>
                      <SelectItem value="FALLBACK">Fallback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Precedence</Label>
                  <Input
                    type="number"
                    value={mastership.precedence}
                    onChange={(e) => updateAttributeMastership(index, { precedence: parseInt(e.target.value) })}
                    placeholder="1-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trust Level</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={mastership.trustLevel}
                    onChange={(e) => updateAttributeMastership(index, { trustLevel: parseInt(e.target.value) })}
                    placeholder="0-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Null Policy</Label>
                  <Select
                    value={mastership.nullPolicy}
                    onValueChange={(value: any) => updateAttributeMastership(index, { nullPolicy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REJECT">Reject</SelectItem>
                      <SelectItem value="ACCEPT">Accept</SelectItem>
                      <SelectItem value="DEFAULT">Use Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Precedence Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Precedence Strategy</CardTitle>
          <CardDescription>How to resolve conflicts between ISRs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Strategy Type</Label>
              <Select
                value={formData.precedenceStrategy?.type}
                onValueChange={(value: any) => setFormData(prev => ({
                  ...prev,
                  precedenceStrategy: {
                    ...prev.precedenceStrategy!,
                    type: value
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIORITY_NUMBER">Priority Number</SelectItem>
                  <SelectItem value="TIMESTAMP_FRESHNESS">Timestamp Freshness</SelectItem>
                  <SelectItem value="TRUST_SCORE">Trust Score</SelectItem>
                  <SelectItem value="CUSTOM_RULE">Custom Rule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Conflict Resolution</Label>
              <Select
                value={formData.precedenceStrategy?.conflictResolution}
                onValueChange={(value: any) => setFormData(prev => ({
                  ...prev,
                  precedenceStrategy: {
                    ...prev.precedenceStrategy!,
                    conflictResolution: value
                  }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGHEST_PRIORITY">Highest Priority</SelectItem>
                  <SelectItem value="MOST_RECENT">Most Recent</SelectItem>
                  <SelectItem value="HIGHEST_TRUST">Highest Trust</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ChangeDetectionTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Change Detection</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configure how changes are detected and processed
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingestion Mode</CardTitle>
            <CardDescription>How data is ingested from the ISR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mode Type</Label>
                <Select
                  value={formData.ingestionMode?.type}
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    ingestionMode: {
                      ...prev.ingestionMode!,
                      type: value
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POLLING">Polling</SelectItem>
                    <SelectItem value="WEBHOOK">Webhook</SelectItem>
                    <SelectItem value="FILE_DROP">File Drop</SelectItem>
                    <SelectItem value="API_PUSH">API Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.ingestionMode?.type === 'POLLING' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Polling Interval (seconds)</Label>
                    <Input
                      type="number"
                      value={formData.ingestionMode?.config?.interval || 3600}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        ingestionMode: {
                          ...prev.ingestionMode!,
                          config: {
                            ...prev.ingestionMode?.config,
                            interval: parseInt(e.target.value)
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Watermark Field</Label>
                    <Input
                      value={formData.ingestionMode?.config?.watermark || 'last_updated'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        ingestionMode: {
                          ...prev.ingestionMode!,
                          config: {
                            ...prev.ingestionMode?.config,
                            watermark: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deduplication Key</Label>
                  <Input
                    value={formData.ingestionMode?.config?.deduplicationKey || 'employeeId'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ingestionMode: {
                        ...prev.ingestionMode!,
                        config: {
                          ...prev.ingestionMode?.config,
                          deduplicationKey: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Idempotency Token Field</Label>
                  <Input
                    value={formData.ingestionMode?.config?.idempotencyToken || 'batch_id'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      ingestionMode: {
                        ...prev.ingestionMode!,
                        config: {
                          ...prev.ingestionMode?.config,
                          idempotencyToken: e.target.value
                        }
                      }
                    }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Detection Settings</CardTitle>
            <CardDescription>Configure how changes are detected and processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Change Detection</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically detect and process attribute changes
                  </div>
                </div>
                <Switch
                  checked={formData.changeDetection?.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    changeDetection: {
                      ...prev.changeDetection!,
                      enabled: checked
                    }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Delta Detection</div>
                  <div className="text-sm text-muted-foreground">
                    Track before/after values for changes
                  </div>
                </div>
                <Switch
                  checked={formData.changeDetection?.deltaDetection}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    changeDetection: {
                      ...prev.changeDetection!,
                      deltaDetection: checked
                    }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Batch Processing</div>
                  <div className="text-sm text-muted-foreground">
                    Process changes in batches for efficiency
                  </div>
                </div>
                <Switch
                  checked={formData.changeDetection?.batchProcessing}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    changeDetection: {
                      ...prev.changeDetection!,
                      batchProcessing: checked
                    }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Real-time Processing</div>
                  <div className="text-sm text-muted-foreground">
                    Process changes immediately as they occur
                  </div>
                </div>
                <Switch
                  checked={formData.changeDetection?.realTimeProcessing}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    changeDetection: {
                      ...prev.changeDetection!,
                      realTimeProcessing: checked
                    }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ValidationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Validation & Testing</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Test your ISR configuration with sample data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample Data</CardTitle>
          <CardDescription>Provide sample data to validate your configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Sample Data (JSON)</Label>
              <Textarea
                placeholder='[{"employeeId": "EMP001", "emp_status": "ACTIVE", "dept_code": "ENG", "start_date": "2024-01-01"}]'
                value={JSON.stringify(sampleData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setSampleData(Array.isArray(parsed) ? parsed : []);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleValidate} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Validate Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationResult.errors.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="font-medium mb-2">Errors ({validationResult.errors.length})</div>
                    <ul className="space-y-1">
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          • {error.field}: {error.message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="font-medium mb-2">Warnings ({validationResult.warnings.length})</div>
                    <ul className="space-y-1">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">
                          • {warning.field}: {warning.message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.isValid && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Configuration is valid! Ready to enable ISR.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Suggestions
            </CardTitle>
            <CardDescription>AI-recommended attribute mappings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.sourceField} → {suggestion.targetAttribute}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${
                        suggestion.confidence > 0.8 ? 'text-green-600 bg-green-100' :
                        suggestion.confidence > 0.6 ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Detected Conflicts
            </CardTitle>
            <CardDescription>Potential conflicts with existing ISRs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict, index) => (
                <Alert key={index} className={`border-${
                  conflict.severity === 'HIGH' ? 'red' :
                  conflict.severity === 'MEDIUM' ? 'orange' : 'yellow'
                }-200 bg-${
                  conflict.severity === 'HIGH' ? 'red' :
                  conflict.severity === 'MEDIUM' ? 'orange' : 'yellow'
                }-50`}>
                  <AlertTriangle className={`h-4 w-4 text-${
                    conflict.severity === 'HIGH' ? 'red' :
                    conflict.severity === 'MEDIUM' ? 'orange' : 'yellow'
                  }-600`} />
                  <AlertDescription className={`text-${
                    conflict.severity === 'HIGH' ? 'red' :
                    conflict.severity === 'MEDIUM' ? 'orange' : 'yellow'
                  }-800`}>
                    <div className="font-medium">{conflict.description}</div>
                    <p className="text-sm mt-1">{conflict.resolution}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ISR Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Identity System of Record (ISR)
          </CardTitle>
          <CardDescription>
            Designate this application as an authoritative source for identity attributes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable ISR</div>
              <div className="text-sm text-muted-foreground">
                This application will be designated as a system of record for identity data
              </div>
            </div>
            <Switch
              checked={isISREnabled}
              onCheckedChange={setIsISREnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* ISR Configuration */}
      {isISREnabled && (
        <Card>
          <CardHeader>
            <CardTitle>ISR Configuration</CardTitle>
            <CardDescription>Configure attribute mastership and change detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ISR Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Workday HRIS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this ISR"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="scope">Scope</TabsTrigger>
                  <TabsTrigger value="mastership">Mastership</TabsTrigger>
                  <TabsTrigger value="detection">Change Detection</TabsTrigger>
                  <TabsTrigger value="validation">Validation</TabsTrigger>
                </TabsList>

                <TabsContent value="scope">
                  <ScopeConfigurationTab />
                </TabsContent>

                <TabsContent value="mastership">
                  <MastershipTab />
                </TabsContent>

                <TabsContent value="detection">
                  <ChangeDetectionTab />
                </TabsContent>

                <TabsContent value="validation">
                  <ValidationTab />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={!isISREnabled}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Validate
          </Button>
          <Button onClick={handleSave} disabled={!isISREnabled}>
            <Shield className="w-4 h-4 mr-1" />
            Save ISR Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}














