import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, X, UserPlus, Shield, Users, Mail, Trash2, RefreshCw, 
  Clock, AlertCircle, CheckCircle, Zap, Settings, ArrowRight,
  Play, Pause, RotateCcw, Layers, Target, Filter, GitBranch,
  Database, Lock, Unlock, FileText, Calendar, DollarSign
} from 'lucide-react';

export interface Action {
  id: string;
  type: 'grantRole' | 'grantEntitlement' | 'createAccount' | 'addToGroup' | 'notify' | 'removeRole' | 'removeEntitlement' | 'disableAccount' | 'revokeAccess' | 'scheduleAction' | 'conditionalAction' | 'rollbackAction';
  target?: string;
  params?: Record<string, any>;
  dependencies?: string[];
  rollbackAction?: string;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
    timeout: number;
  };
  conditions?: {
    field: string;
    operator: string;
    value: string;
  }[];
  delay?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  requiresApproval?: boolean;
  dryRun?: boolean;
}

interface ActionPickerProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
  mode: 'joiner' | 'mover' | 'leaver';
  allowDependencies?: boolean;
  allowRollback?: boolean;
  allowScheduling?: boolean;
}

const actionTypes = {
  joiner: [
    { 
      value: 'grantRole', 
      label: 'Grant Role', 
      icon: Shield,
      description: 'Assign user to a role',
      category: 'access',
      requiresTarget: true,
      supportsDelay: true
    },
    { 
      value: 'grantEntitlement', 
      label: 'Grant Entitlement', 
      icon: Shield,
      description: 'Grant specific application access',
      category: 'access',
      requiresTarget: true,
      supportsDelay: true
    },
    { 
      value: 'createAccount', 
      label: 'Create Account', 
      icon: UserPlus,
      description: 'Create user account in target system',
      category: 'provisioning',
      requiresTarget: true,
      supportsDelay: false
    },
    { 
      value: 'addToGroup', 
      label: 'Add to Group', 
      icon: Users,
      description: 'Add user to security or distribution group',
      category: 'access',
      requiresTarget: true,
      supportsDelay: true
    },
    { 
      value: 'notify', 
      label: 'Send Notification', 
      icon: Mail,
      description: 'Send email notification to stakeholders',
      category: 'communication',
      requiresTarget: false,
      supportsDelay: true
    },
    { 
      value: 'scheduleAction', 
      label: 'Schedule Action', 
      icon: Calendar,
      description: 'Schedule action for future execution',
      category: 'automation',
      requiresTarget: false,
      supportsDelay: false
    }
  ],
  mover: [
    { 
      value: 'grantRole', 
      label: 'Swap Role', 
      icon: Shield,
      description: 'Replace existing role with new role',
      category: 'access',
      requiresTarget: true,
      supportsDelay: true
    },
    { 
      value: 'removeRole', 
      label: 'Remove Role', 
      icon: Trash2,
      description: 'Remove user from specific role',
      category: 'access',
      requiresTarget: true,
      supportsDelay: true
    },
    { 
      value: 'conditionalAction', 
      label: 'Conditional Action', 
      icon: GitBranch,
      description: 'Execute action based on conditions',
      category: 'automation',
      requiresTarget: false,
      supportsDelay: true
    },
    { 
      value: 'notify', 
      label: 'Notify for Review', 
      icon: Mail,
      description: 'Send notification for manual review',
      category: 'communication',
      requiresTarget: false,
      supportsDelay: true
    }
  ],
  leaver: [
    { 
      value: 'disableAccount', 
      label: 'Disable Account', 
      icon: Lock,
      description: 'Disable user account immediately',
      category: 'security',
      requiresTarget: true,
      supportsDelay: false
    },
    { 
      value: 'revokeAccess', 
      label: 'Revoke Access', 
      icon: Trash2,
      description: 'Remove all application access',
      category: 'security',
      requiresTarget: false,
      supportsDelay: true
    },
    { 
      value: 'removeRole', 
      label: 'Remove Role', 
      icon: Shield,
      description: 'Remove user from all roles',
      category: 'access',
      requiresTarget: true,
      supportsDelay: true
    },
    { 
      value: 'rollbackAction', 
      label: 'Rollback Action', 
      icon: RotateCcw,
      description: 'Rollback previous provisioning actions',
      category: 'automation',
      requiresTarget: false,
      supportsDelay: true
    },
    { 
      value: 'notify', 
      label: 'Send Notification', 
      icon: Mail,
      description: 'Notify stakeholders of offboarding',
      category: 'communication',
      requiresTarget: false,
      supportsDelay: true
    }
  ]
};

const mockRoles = ['Employee', 'Contractor', 'Manager', 'Admin', 'Executive', 'Developer', 'Analyst'];
const mockApps = ['Slack', 'GitHub', 'Salesforce', 'Workday', 'Office 365', 'AWS', 'Azure AD'];
const mockGroups = ['Engineering', 'Sales', 'All Staff', 'Managers', 'Executives', 'Contractors'];

const priorityConfig = {
  low: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Low' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Medium' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' }
};

export function ActionPicker({ 
  actions, 
  onChange, 
  mode,
  allowDependencies = true,
  allowRollback = true,
  allowScheduling = true
}: ActionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addAction = (type: string) => {
    const actionConfig = actionTypes[mode].find(a => a.value === type);
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: type as Action['type'],
      target: '',
      params: {},
      dependencies: [],
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        timeout: 30
      },
      delay: 0,
      priority: 'medium',
      description: actionConfig?.description,
      requiresApproval: false,
      dryRun: false
    };
    
    onChange([...actions, newAction]);
    setShowPicker(false);
    setSelectedAction(newAction.id);
  };

  const updateAction = (id: string, updates: Partial<Action>) => {
    const newActions = actions.map(action => 
      action.id === id ? { ...action, ...updates } : action
    );
    onChange(newActions);
  };

  const removeAction = (id: string) => {
    onChange(actions.filter(action => action.id !== id));
  };

  const getActionConfig = (type: string) => {
    const allTypes = [...actionTypes.joiner, ...actionTypes.mover, ...actionTypes.leaver];
    return allTypes.find(a => a.value === type);
  };

  const getActionLabel = (type: string) => {
    return getActionConfig(type)?.label || type;
  };

  const availableActions = actionTypes[mode];

  const renderActionTarget = (action: Action) => {
    const actionConfig = getActionConfig(action.type);
    
    if (!actionConfig?.requiresTarget) return null;

    if (action.type === 'grantRole' || action.type === 'removeRole') {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Role</Label>
          <Select
            value={action.target}
            onValueChange={target => updateAction(action.id, { target })}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              {mockRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (action.type === 'createAccount' || action.type === 'grantEntitlement') {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Application</Label>
          <Select
            value={action.target}
            onValueChange={target => updateAction(action.id, { target })}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select app..." />
            </SelectTrigger>
            <SelectContent>
              {mockApps.map(app => (
                <SelectItem key={app} value={app}>
                  {app}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (action.type === 'addToGroup') {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Group</Label>
          <Select
            value={action.target}
            onValueChange={target => updateAction(action.id, { target })}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select group..." />
            </SelectTrigger>
            <SelectContent>
              {mockGroups.map(group => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (action.type === 'notify') {
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Recipients</Label>
          <Input
            value={action.target || ''}
            onChange={e => updateAction(action.id, { target: e.target.value })}
            placeholder="manager, hr@acme.com"
            className="h-8"
          />
        </div>
      );
    }

    return null;
  };

  const renderActionCard = (action: Action, index: number) => {
    const actionConfig = getActionConfig(action.type);
    const Icon = actionConfig?.icon || Shield;
    const priorityStyle = priorityConfig[action.priority || 'medium'];

    return (
      <Card key={action.id} className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded flex items-center justify-center bg-accent font-medium text-sm">
                {index + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">{getActionLabel(action.type)}</CardTitle>
                  <Badge variant="outline" className={`text-xs ${priorityStyle.color} ${priorityStyle.bg}`}>
                    {priorityStyle.label}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  {action.description || actionConfig?.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {action.requiresApproval && (
                <Badge variant="secondary" className="text-xs">Requires Approval</Badge>
              )}
              {action.dryRun && (
                <Badge variant="outline" className="text-xs">Dry Run</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAction(action.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {renderActionTarget(action)}
            
            {actionConfig?.supportsDelay && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Execution Delay (seconds)</Label>
                <Input
                  type="number"
                  value={action.delay || 0}
                  onChange={e => updateAction(action.id, { delay: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="h-8"
                />
              </div>
            )}

            {showAdvanced && (
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
                  <TabsTrigger value="retry" className="text-xs">Retry</TabsTrigger>
                  <TabsTrigger value="deps" className="text-xs">Dependencies</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Priority</Label>
                      <Select
                        value={action.priority}
                        onValueChange={(priority: 'low' | 'medium' | 'high' | 'critical') => 
                          updateAction(action.id, { priority })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={action.description || ''}
                        onChange={e => updateAction(action.id, { description: e.target.value })}
                        placeholder="Action description..."
                        className="h-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Requires Approval</Label>
                      <Switch
                        checked={action.requiresApproval}
                        onCheckedChange={checked => updateAction(action.id, { requiresApproval: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Dry Run Mode</Label>
                      <Switch
                        checked={action.dryRun}
                        onCheckedChange={checked => updateAction(action.id, { dryRun: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="retry" className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Max Retries</Label>
                      <Input
                        type="number"
                        value={action.retryPolicy?.maxRetries || 3}
                        onChange={e => updateAction(action.id, { 
                          retryPolicy: { 
                            ...action.retryPolicy!, 
                            maxRetries: parseInt(e.target.value) || 3 
                          }
                        })}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Backoff Multiplier</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={action.retryPolicy?.backoffMultiplier || 2}
                        onChange={e => updateAction(action.id, { 
                          retryPolicy: { 
                            ...action.retryPolicy!, 
                            backoffMultiplier: parseFloat(e.target.value) || 2 
                          }
                        })}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Timeout (seconds)</Label>
                      <Input
                        type="number"
                        value={action.retryPolicy?.timeout || 30}
                        onChange={e => updateAction(action.id, { 
                          retryPolicy: { 
                            ...action.retryPolicy!, 
                            timeout: parseInt(e.target.value) || 30 
                          }
                        })}
                        className="h-8"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="deps" className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Dependencies</Label>
                    <div className="text-xs text-muted-foreground mb-2">
                      Actions that must complete before this one
                    </div>
                    <div className="space-y-1">
                      {actions.filter(a => a.id !== action.id).map(depAction => (
                        <div key={depAction.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dep-${action.id}-${depAction.id}`}
                            checked={action.dependencies?.includes(depAction.id) || false}
                            onCheckedChange={checked => {
                              const deps = action.dependencies || [];
                              const newDeps = checked 
                                ? [...deps, depAction.id]
                                : deps.filter(id => id !== depAction.id);
                              updateAction(action.id, { dependencies: newDeps });
                            }}
                          />
                          <Label htmlFor={`dep-${action.id}-${depAction.id}`} className="text-xs">
                            {getActionLabel(depAction.type)} ({depAction.priority})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Actions</Label>
          <p className="text-xs text-muted-foreground">
            Define what happens when conditions are met. Actions execute in order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-3 h-3 mr-1" />
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
          {!showPicker ? (
            <Button variant="outline" size="sm" onClick={() => setShowPicker(true)}>
              <Plus className="w-3 h-3 mr-1" />
              Add Action
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowPicker(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {showPicker && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Action Type</CardTitle>
            <CardDescription className="text-xs">
              Choose the action to add to your workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableActions.map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.value}
                    onClick={() => addAction(action.value)}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:border-primary transition-colors text-left"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {action.category}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {actions.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">No actions configured</p>
          <p className="text-xs text-muted-foreground">Add actions to define what happens when conditions are met</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div key={action.id}>
              {index > 0 && (
                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {renderActionCard(action, index)}
            </div>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Actions execute in sequence</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span>Retry policies configured</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span>Dependencies supported</span>
          </div>
        </div>
      )}
    </div>
  );
}
