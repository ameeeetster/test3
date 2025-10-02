import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Plus, X, UserPlus, Shield, Users, Mail, Trash2 } from 'lucide-react';

export interface Action {
  type: 'grantRole' | 'grantEntitlement' | 'createAccount' | 'addToGroup' | 'notify' | 'removeRole' | 'removeEntitlement' | 'disableAccount' | 'revokeAccess';
  target?: string;
  params?: Record<string, any>;
}

interface ActionPickerProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
  mode: 'joiner' | 'mover' | 'leaver';
}

const actionTypes = {
  joiner: [
    { value: 'grantRole', label: 'Grant Role', icon: Shield },
    { value: 'grantEntitlement', label: 'Grant Entitlement', icon: Shield },
    { value: 'createAccount', label: 'Create Account', icon: UserPlus },
    { value: 'addToGroup', label: 'Add to Group', icon: Users },
    { value: 'notify', label: 'Send Notification', icon: Mail }
  ],
  mover: [
    { value: 'grantRole', label: 'Swap Role', icon: Shield },
    { value: 'removeRole', label: 'Remove Role', icon: Trash2 },
    { value: 'notify', label: 'Notify for Review', icon: Mail }
  ],
  leaver: [
    { value: 'disableAccount', label: 'Disable Account', icon: UserPlus },
    { value: 'revokeAccess', label: 'Revoke Access', icon: Trash2 },
    { value: 'removeRole', label: 'Remove Role', icon: Shield },
    { value: 'notify', label: 'Send Notification', icon: Mail }
  ]
};

const mockRoles = ['Employee', 'Contractor', 'Manager', 'Admin'];
const mockApps = ['Slack', 'GitHub', 'Salesforce', 'Workday'];
const mockGroups = ['Engineering', 'Sales', 'All Staff'];

export function ActionPicker({ actions, onChange, mode }: ActionPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const addAction = (type: string) => {
    onChange([
      ...actions,
      { type: type as Action['type'], target: '', params: {} }
    ]);
    setShowPicker(false);
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updates };
    onChange(newActions);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const getActionLabel = (type: string) => {
    const allTypes = [...actionTypes.joiner, ...actionTypes.mover, ...actionTypes.leaver];
    return allTypes.find(a => a.value === type)?.label || type;
  };

  const availableActions = actionTypes[mode];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Actions</label>
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

      {showPicker && (
        <div className="p-3 rounded-lg border bg-accent/30 space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Select action type:</p>
          <div className="grid grid-cols-2 gap-2">
            {availableActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.value}
                  onClick={() => addAction(action.value)}
                  className="flex items-center gap-2 p-2 rounded border bg-card hover:border-primary transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {actions.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">No actions configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action, index) => (
            <div key={index} className="p-3 rounded-lg border bg-card space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{getActionLabel(action.type)}</Badge>
                <button
                  onClick={() => removeAction(index)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {(action.type === 'grantRole' || action.type === 'removeRole') && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Role</label>
                  <Select
                    value={action.target}
                    onValueChange={target => updateAction(index, { target })}
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
              )}

              {action.type === 'createAccount' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Application</label>
                  <Select
                    value={action.target}
                    onValueChange={target => updateAction(index, { target })}
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
              )}

              {action.type === 'addToGroup' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Group</label>
                  <Select
                    value={action.target}
                    onValueChange={target => updateAction(index, { target })}
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
              )}

              {action.type === 'notify' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Recipients</label>
                  <input
                    type="text"
                    value={action.target || ''}
                    onChange={e => updateAction(index, { target: e.target.value })}
                    placeholder="manager, hr@acme.com"
                    className="w-full text-sm px-2 py-1.5 rounded border bg-background"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
