import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Code2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface AttributeMapping {
  id: string;
  source: string;
  target: string;
  transform?: string;
}

interface AttributeMappingTableProps {
  connectorId: string;
  value: AttributeMapping[];
  onChange: (mappings: AttributeMapping[]) => void;
}

const transformOptions = [
  { value: 'none', label: 'None (Direct)' },
  { value: 'toLowerCase', label: 'Lowercase' },
  { value: 'toUpperCase', label: 'Uppercase' },
  { value: 'trim', label: 'Trim Whitespace' },
  { value: 'formatPhone', label: 'Format Phone' },
  { value: 'formatDate', label: 'Format Date' },
  { value: 'concat', label: 'Concatenate' },
  { value: 'split', label: 'Split' },
];

export function AttributeMappingTable({ connectorId, value, onChange }: AttributeMappingTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addMapping = () => {
    const newMapping: AttributeMapping = {
      id: `mapping-${Date.now()}`,
      source: '',
      target: '',
      transform: 'none',
    };
    onChange([...value, newMapping]);
    setEditingId(newMapping.id);
  };

  const updateMapping = (id: string, field: keyof AttributeMapping, fieldValue: string) => {
    onChange(value.map((m) => (m.id === id ? { ...m, [field]: fieldValue } : m)));
  };

  const deleteMapping = (id: string) => {
    onChange(value.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
              marginBottom: '4px',
            }}
          >
            Attribute Mappings
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            Map source attributes to your identity model
          </p>
        </div>
        <Button onClick={addMapping} size="sm" variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Mapping
        </Button>
      </div>

      <div className="border rounded-lg" style={{ borderColor: 'var(--border)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: '35%' }}>Source Attribute</TableHead>
              <TableHead style={{ width: '5%' }} className="text-center"></TableHead>
              <TableHead style={{ width: '35%' }}>Target Attribute</TableHead>
              <TableHead style={{ width: '20%' }}>Transform</TableHead>
              <TableHead style={{ width: '5%' }}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    No attribute mappings configured yet. Click "Add Mapping" to get started.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              value.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <Input
                      value={mapping.source}
                      onChange={(e) => updateMapping(mapping.id, 'source', e.target.value)}
                      placeholder="e.g., userPrincipalName"
                      className="font-mono"
                      style={{ fontSize: 'var(--text-sm)' }}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <ArrowRight className="w-4 h-4 mx-auto" style={{ color: 'var(--muted-foreground)' }} />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={mapping.target}
                      onChange={(e) => updateMapping(mapping.id, 'target', e.target.value)}
                      placeholder="e.g., username"
                      className="font-mono"
                      style={{ fontSize: 'var(--text-sm)' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.transform || 'none'}
                      onValueChange={(v) => updateMapping(mapping.id, 'transform', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {transformOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              {opt.value !== 'none' && <Code2 className="w-3 h-3" />}
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMapping(mapping.id)}
                      className="w-8 h-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {value.length > 0 && (
        <div
          className="flex items-start gap-2 p-3 rounded-md"
          style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}
        >
          <Code2 className="w-4 h-4 mt-0.5" style={{ color: 'var(--info)' }} />
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--info)', marginBottom: '4px' }}>
              <strong>Tip:</strong> Use transforms to normalize data
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--info)' }}>
              You can test these mappings in the next step before creating the integration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
