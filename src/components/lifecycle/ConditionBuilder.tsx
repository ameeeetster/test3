import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Plus, X, GitBranch, Layers, Target, Filter, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle, Clock, Users, Building, MapPin, DollarSign,
  Calendar, Shield, Zap, Settings, Eye, EyeOff
} from 'lucide-react';

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string | string[];
  logicalOperator?: 'AND' | 'OR';
  groupId?: string;
  isGroup?: boolean;
  children?: Condition[];
  negate?: boolean;
  caseSensitive?: boolean;
  description?: string;
}

interface ConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  mode?: 'joiner' | 'mover' | 'leaver';
  allowBranching?: boolean;
  allowGrouping?: boolean;
}

const fieldOptions = [
  { 
    value: 'department', 
    label: 'Department', 
    icon: Building,
    type: 'string',
    description: 'User department or division',
    operators: ['equals', 'notEquals', 'contains', 'startsWith', 'in', 'notIn']
  },
  { 
    value: 'title', 
    label: 'Job Title', 
    icon: Users,
    type: 'string',
    description: 'User job title or position',
    operators: ['equals', 'notEquals', 'contains', 'startsWith', 'in', 'notIn']
  },
  { 
    value: 'location', 
    label: 'Location', 
    icon: MapPin,
    type: 'string',
    description: 'Office location or region',
    operators: ['equals', 'notEquals', 'contains', 'startsWith', 'in', 'notIn']
  },
  { 
    value: 'employmentType', 
    label: 'Employment Type', 
    icon: Users,
    type: 'enum',
    description: 'Full-time, part-time, contractor, etc.',
    operators: ['equals', 'notEquals', 'in', 'notIn'],
    values: ['Full-time', 'Part-time', 'Contractor', 'Intern', 'Consultant']
  },
  { 
    value: 'manager', 
    label: 'Manager', 
    icon: Users,
    type: 'string',
    description: 'Direct manager or supervisor',
    operators: ['equals', 'notEquals', 'contains', 'startsWith', 'in', 'notIn']
  },
  { 
    value: 'costCenter', 
    label: 'Cost Center', 
    icon: DollarSign,
    type: 'string',
    description: 'Financial cost center code',
    operators: ['equals', 'notEquals', 'contains', 'startsWith', 'in', 'notIn']
  },
  { 
    value: 'tags', 
    label: 'Tags', 
    icon: Target,
    type: 'array',
    description: 'Custom user tags or labels',
    operators: ['contains', 'notContains', 'containsAll', 'containsAny']
  },
  { 
    value: 'startDate', 
    label: 'Start Date', 
    icon: Calendar,
    type: 'date',
    description: 'Employee start date',
    operators: ['equals', 'notEquals', 'before', 'after', 'between']
  },
  { 
    value: 'securityLevel', 
    label: 'Security Level', 
    icon: Shield,
    type: 'enum',
    description: 'Security clearance level',
    operators: ['equals', 'notEquals', 'in', 'notIn'],
    values: ['Public', 'Internal', 'Confidential', 'Secret', 'Top Secret']
  },
  { 
    value: 'riskScore', 
    label: 'Risk Score', 
    icon: AlertCircle,
    type: 'number',
    description: 'Calculated risk assessment score',
    operators: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'between']
  }
];

const operatorLabels = {
  equals: 'equals',
  notEquals: 'not equals',
  contains: 'contains',
  notContains: 'does not contain',
  startsWith: 'starts with',
  endsWith: 'ends with',
  in: 'is in',
  notIn: 'is not in',
  containsAll: 'contains all',
  containsAny: 'contains any',
  before: 'is before',
  after: 'is after',
  between: 'is between',
  greaterThan: 'is greater than',
  lessThan: 'is less than',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty'
};

export function ConditionBuilder({ 
  conditions, 
  onChange, 
  mode = 'joiner',
  allowBranching = true,
  allowGrouping = true 
}: ConditionBuilderProps) {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addCondition = (field: string) => {
    const fieldConfig = fieldOptions.find(f => f.value === field);
    const newCondition: Condition = {
      id: `cond-${Date.now()}`,
      field,
      operator: fieldConfig?.operators[0] || 'equals',
      value: '',
      logicalOperator: 'AND',
      negate: false,
      caseSensitive: false,
      description: fieldConfig?.description
    };
    
    onChange([...conditions, newCondition]);
    setOpen(false);
  };

  const addGroup = () => {
    const newGroup: Condition = {
      id: `group-${Date.now()}`,
      field: '',
      operator: '',
      value: '',
      logicalOperator: 'AND',
      isGroup: true,
      children: [],
      description: 'Condition group'
    };
    
    onChange([...conditions, newGroup]);
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    const newConditions = conditions.map(cond => 
      cond.id === id ? { ...cond, ...updates } : cond
    );
    onChange(newConditions);
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(cond => cond.id !== id));
  };

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getFieldConfig = (field: string) => {
    return fieldOptions.find(f => f.value === field);
  };

  const getOperatorLabel = (operator: string) => {
    return operatorLabels[operator as keyof typeof operatorLabels] || operator;
  };

  const renderValueInput = (condition: Condition) => {
    const fieldConfig = getFieldConfig(condition.field);
    
    if (fieldConfig?.type === 'enum' && fieldConfig.values) {
      return (
        <Select
          value={Array.isArray(condition.value) ? condition.value[0] : condition.value}
          onValueChange={(value) => updateCondition(condition.id, { value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value..." />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.values.map(value => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (fieldConfig?.type === 'date') {
      return (
        <Input
          type="date"
          value={condition.value as string}
          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
          className="w-full"
        />
      );
    }
    
    if (fieldConfig?.type === 'number') {
      return (
        <Input
          type="number"
          value={condition.value as string}
          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
          placeholder="Enter number..."
          className="w-full"
        />
      );
    }
    
    return (
      <Input
        type="text"
        value={Array.isArray(condition.value) ? condition.value.join(', ') : condition.value}
        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
        placeholder="Enter value..."
        className="w-full"
      />
    );
  };

  const renderCondition = (condition: Condition, index: number) => {
    const fieldConfig = getFieldConfig(condition.field);
    const Icon = fieldConfig?.icon || Filter;
    
    if (condition.isGroup) {
      const isExpanded = expandedGroups.has(condition.id);
      return (
        <Card key={condition.id} className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleGroupExpansion(condition.id)}
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Condition Group</span>
                <Badge variant="outline" className="text-xs">
                  {condition.children?.length || 0} conditions
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={condition.logicalOperator}
                  onValueChange={(value: 'AND' | 'OR') => updateCondition(condition.id, { logicalOperator: value })}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {isExpanded && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {condition.children?.map((child, childIndex) => (
                  <div key={child.id} className="ml-4">
                    {renderCondition(child, childIndex)}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newChild: Condition = {
                      id: `cond-${Date.now()}`,
                      field: 'department',
                      operator: 'equals',
                      value: '',
                      logicalOperator: 'AND'
                    };
                    updateCondition(condition.id, {
                      children: [...(condition.children || []), newChild]
                    });
                  }}
                  className="ml-4"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Condition
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      );
    }

    return (
      <div key={condition.id} className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <Badge variant="secondary" className="font-normal">
            {fieldConfig?.label || condition.field}
          </Badge>
        </div>
        
        <Select
          value={condition.operator}
          onValueChange={(operator) => updateCondition(condition.id, { operator })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(fieldConfig?.operators || ['equals']).map(op => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex-1">
          {renderValueInput(condition)}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateCondition(condition.id, { negate: !condition.negate })}
            className={condition.negate ? 'text-red-600' : 'text-muted-foreground'}
          >
            {condition.negate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCondition(condition.id)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Conditions</Label>
          <p className="text-xs text-muted-foreground">
            Define when this rule applies. Use groups for complex logic.
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Add Condition
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search fields..." />
                <CommandEmpty>No field found.</CommandEmpty>
                <CommandGroup>
                  {fieldOptions
                    .filter(field => !conditions.find(c => c.field === field.value))
                    .map(field => {
                      const Icon = field.icon;
                      return (
                        <CommandItem key={field.value} onSelect={() => addCondition(field.value)}>
                          <Icon className="w-4 h-4 mr-2" />
                          <div>
                            <div className="font-medium">{field.label}</div>
                            <div className="text-xs text-muted-foreground">{field.description}</div>
                          </div>
                        </CommandItem>
                      );
                    })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {allowGrouping && (
            <Button variant="outline" size="sm" onClick={addGroup}>
              <GitBranch className="w-3 h-3 mr-1" />
              Add Group
            </Button>
          )}
        </div>
      </div>

      {conditions.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">No conditions set</p>
          <p className="text-xs text-muted-foreground">This rule will apply to all users</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div key={condition.id}>
              {index > 0 && (
                <div className="flex items-center justify-center py-2">
                  <Select
                    value={condition.logicalOperator}
                    onValueChange={(value: 'AND' | 'OR') => updateCondition(condition.id, { logicalOperator: value })}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {renderCondition(condition, index)}
            </div>
          ))}
        </div>
      )}

      {showAdvanced && conditions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Advanced Options</CardTitle>
            <CardDescription className="text-xs">
              Fine-tune condition behavior and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Case Sensitivity</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="case-sensitive" />
                  <Label htmlFor="case-sensitive" className="text-xs">Case sensitive matching</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Performance</Label>
                <Select defaultValue="standard">
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="optimized">Optimized</SelectItem>
                    <SelectItem value="cached">Cached</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {conditions.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>All conditions must match (AND logic)</span>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span>Groups support nested logic</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Optimized for performance</span>
          </div>
        </div>
      )}
    </div>
  );
}
