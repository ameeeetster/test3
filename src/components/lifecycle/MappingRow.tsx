import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TriangleAlert as AlertTriangle, Check } from 'lucide-react';

export interface AttributeMapping {
  sourceField: string;
  targetField: string;
  type: 'string' | 'email' | 'date' | 'number' | 'boolean';
  transform?: 'trim' | 'toLower' | 'toUpper' | 'concat';
  example?: string;
  conflict?: boolean;
}

interface MappingRowProps {
  mapping: AttributeMapping;
  onChange: (mapping: AttributeMapping) => void;
}

const transformOptions = [
  { value: 'none', label: 'None' },
  { value: 'trim', label: 'Trim whitespace' },
  { value: 'toLower', label: 'To lowercase' },
  { value: 'toUpper', label: 'To uppercase' },
  { value: 'concat', label: 'Concatenate' }
];

export function MappingRow({ mapping, onChange }: MappingRowProps) {
  return (
    <div className={`grid grid-cols-12 gap-3 p-3 rounded-lg border ${mapping.conflict ? 'border-destructive bg-destructive/5' : 'bg-card'}`}>
      <div className="col-span-3">
        <input
          type="text"
          value={mapping.sourceField}
          onChange={e => onChange({ ...mapping, sourceField: e.target.value })}
          placeholder="Source field"
          className="w-full text-sm px-2 py-1.5 rounded border bg-background"
        />
      </div>

      <div className="col-span-3">
        <input
          type="text"
          value={mapping.targetField}
          onChange={e => onChange({ ...mapping, targetField: e.target.value })}
          placeholder="Profile field"
          className="w-full text-sm px-2 py-1.5 rounded border bg-background"
        />
      </div>

      <div className="col-span-2">
        <Select value={mapping.type} onValueChange={(v: any) => onChange({ ...mapping, type: v })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2">
        <Select value={mapping.transform || 'none'} onValueChange={(v: any) => onChange({ ...mapping, transform: v === 'none' ? undefined : v })}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {transformOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-2 flex items-center">
        {mapping.conflict ? (
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" />
            Conflict
          </Badge>
        ) : (
          mapping.example && (
            <code className="text-xs text-muted-foreground truncate">{mapping.example}</code>
          )
        )}
      </div>
    </div>
  );
}

interface MappingTableProps {
  mappings: AttributeMapping[];
  onChange: (mappings: AttributeMapping[]) => void;
}

export function MappingTable({ mappings, onChange }: MappingTableProps) {
  const addMapping = () => {
    onChange([
      ...mappings,
      {
        sourceField: '',
        targetField: '',
        type: 'string',
        example: 'john.doe'
      }
    ]);
  };

  const updateMapping = (index: number, mapping: AttributeMapping) => {
    const newMappings = [...mappings];
    newMappings[index] = mapping;
    onChange(newMappings);
  };

  const removeMapping = (index: number) => {
    onChange(mappings.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-3 px-3 pb-2 border-b">
        <div className="col-span-3 text-xs font-medium text-muted-foreground">Source Field</div>
        <div className="col-span-3 text-xs font-medium text-muted-foreground">Profile Field</div>
        <div className="col-span-2 text-xs font-medium text-muted-foreground">Type</div>
        <div className="col-span-2 text-xs font-medium text-muted-foreground">Transform</div>
        <div className="col-span-2 text-xs font-medium text-muted-foreground">Preview</div>
      </div>

      {mappings.map((mapping, index) => (
        <MappingRow key={index} mapping={mapping} onChange={m => updateMapping(index, m)} />
      ))}

      <button
        onClick={addMapping}
        className="w-full py-2 rounded-lg border border-dashed hover:border-primary hover:bg-accent transition-colors text-sm text-muted-foreground"
      >
        + Add Mapping
      </button>
    </div>
  );
}
