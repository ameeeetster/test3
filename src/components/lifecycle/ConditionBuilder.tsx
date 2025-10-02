import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Plus, X } from 'lucide-react';

export interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface ConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

const fieldOptions = [
  { value: 'department', label: 'Department' },
  { value: 'title', label: 'Title' },
  { value: 'location', label: 'Location' },
  { value: 'employmentType', label: 'Employment Type' },
  { value: 'ou', label: 'Organizational Unit' },
  { value: 'manager', label: 'Manager' },
  { value: 'costCenter', label: 'Cost Center' },
  { value: 'tags', label: 'Tags' }
];

const operatorOptions = [
  { value: 'equals', label: 'equals' },
  { value: 'notEquals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'in', label: 'in' }
];

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const [open, setOpen] = useState(false);

  const addCondition = (field: string) => {
    onChange([
      ...conditions,
      { field, operator: 'equals', value: '' }
    ]);
    setOpen(false);
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange(newConditions);
  };

  const removeCondition = (index: number) => {
    onChange(conditions.filter((_, i) => i !== index));
  };

  const getFieldLabel = (field: string) => {
    return fieldOptions.find(f => f.value === field)?.label || field;
  };

  const getOperatorLabel = (operator: string) => {
    return operatorOptions.find(o => o.value === operator)?.label || operator;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Conditions</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-3 h-3 mr-1" />
              Add Condition
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search fields..." />
              <CommandEmpty>No field found.</CommandEmpty>
              <CommandGroup>
                {fieldOptions
                  .filter(field => !conditions.find(c => c.field === field.value))
                  .map(field => (
                    <CommandItem key={field.value} onSelect={() => addCondition(field.value)}>
                      {field.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {conditions.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed text-center">
          <p className="text-sm text-muted-foreground">No conditions set. Rule applies to all users.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
              <Badge variant="secondary" className="font-normal">
                {getFieldLabel(condition.field)}
              </Badge>
              <select
                value={condition.operator}
                onChange={e => updateCondition(index, { operator: e.target.value })}
                className="text-xs px-2 py-1 rounded border bg-background"
              >
                {operatorOptions.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={condition.value}
                onChange={e => updateCondition(index, { value: e.target.value })}
                placeholder="value"
                className="flex-1 text-sm px-2 py-1 rounded border bg-background"
              />
              <button
                onClick={() => removeCondition(index)}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {conditions.length > 0 && (
        <p className="text-xs text-muted-foreground">
          All conditions must match (AND logic)
        </p>
      )}
    </div>
  );
}
