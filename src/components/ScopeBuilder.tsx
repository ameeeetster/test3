import React, { useState } from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Card } from './ui/card';

interface ScopeRule {
  id: string;
  type: 'include' | 'exclude';
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: string;
}

interface ScopeConfig {
  syncUsers: boolean;
  syncGroups: boolean;
  rules: ScopeRule[];
  domains?: string[];
  organizationalUnits?: string[];
}

interface ScopeBuilderProps {
  connectorId: string;
  value: ScopeConfig;
  onChange: (config: ScopeConfig) => void;
}

export function ScopeBuilder({ connectorId, value, onChange }: ScopeBuilderProps) {
  const [newDomain, setNewDomain] = useState('');
  const [newOU, setNewOU] = useState('');

  const addRule = () => {
    const newRule: ScopeRule = {
      id: `rule-${Date.now()}`,
      type: 'include',
      field: 'department',
      operator: 'equals',
      value: '',
    };
    onChange({
      ...value,
      rules: [...(value.rules || []), newRule],
    });
  };

  const updateRule = (id: string, updates: Partial<ScopeRule>) => {
    onChange({
      ...value,
      rules: value.rules?.map((r) => (r.id === id ? { ...r, ...updates } : r)) || [],
    });
  };

  const deleteRule = (id: string) => {
    onChange({
      ...value,
      rules: value.rules?.filter((r) => r.id !== id) || [],
    });
  };

  const addDomain = () => {
    if (newDomain && !value.domains?.includes(newDomain)) {
      onChange({
        ...value,
        domains: [...(value.domains || []), newDomain],
      });
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    onChange({
      ...value,
      domains: value.domains?.filter((d) => d !== domain) || [],
    });
  };

  const addOU = () => {
    if (newOU && !value.organizationalUnits?.includes(newOU)) {
      onChange({
        ...value,
        organizationalUnits: [...(value.organizationalUnits || []), newOU],
      });
      setNewOU('');
    }
  };

  const removeOU = (ou: string) => {
    onChange({
      ...value,
      organizationalUnits: value.organizationalUnits?.filter((o) => o !== ou) || [],
    });
  };

  return (
    <div className="space-y-6">
      {/* What to Sync */}
      <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h4
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text)',
            marginBottom: '12px',
          }}
        >
          What to Sync
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-users" className="cursor-pointer" style={{ marginBottom: 0 }}>
              Sync Users
            </Label>
            <Switch
              id="sync-users"
              checked={value.syncUsers !== false}
              onCheckedChange={(checked) => onChange({ ...value, syncUsers: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-groups" className="cursor-pointer" style={{ marginBottom: 0 }}>
              Sync Groups
            </Label>
            <Switch
              id="sync-groups"
              checked={value.syncGroups !== false}
              onCheckedChange={(checked) => onChange({ ...value, syncGroups: checked })}
            />
          </div>
        </div>
      </Card>

      {/* Domain Filters (if applicable) */}
      {connectorId.includes('ad') && (
        <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h4
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
              marginBottom: '12px',
            }}
          >
            Domain Filters
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., contoso.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDomain()}
              />
              <Button onClick={addDomain} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {value.domains && value.domains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.domains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1">
                    {domain}
                    <button onClick={() => removeDomain(domain)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Organizational Units (if applicable) */}
      {connectorId === 'active-directory' && (
        <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h4
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
              marginBottom: '12px',
            }}
          >
            Organizational Units
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., OU=Users,DC=company,DC=com"
                value={newOU}
                onChange={(e) => setNewOU(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOU()}
                className="font-mono"
                style={{ fontSize: 'var(--text-sm)' }}
              />
              <Button onClick={addOU} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {value.organizationalUnits && value.organizationalUnits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {value.organizationalUnits.map((ou) => (
                  <Badge key={ou} variant="secondary" className="gap-1 font-mono text-xs">
                    {ou}
                    <button onClick={() => removeOU(ou)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Filter Rules */}
      <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h4
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
            }}
          >
            Advanced Filter Rules
          </h4>
          <Button onClick={addRule} size="sm" variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Rule
          </Button>
        </div>

        {value.rules && value.rules.length > 0 ? (
          <div className="space-y-3">
            {value.rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center gap-2 p-3 rounded-md border"
                style={{ borderColor: 'var(--border)' }}
              >
                <Filter className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                <select
                  value={rule.type}
                  onChange={(e) => updateRule(rule.id, { type: e.target.value as 'include' | 'exclude' })}
                  className="px-2 py-1 rounded border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <option value="include">Include</option>
                  <option value="exclude">Exclude</option>
                </select>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>where</span>
                <Input
                  placeholder="field"
                  value={rule.field}
                  onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                  className="w-32"
                />
                <select
                  value={rule.operator}
                  onChange={(e) =>
                    updateRule(rule.id, {
                      operator: e.target.value as 'equals' | 'contains' | 'startsWith' | 'endsWith',
                    })
                  }
                  className="px-2 py-1 rounded border"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  <option value="equals">equals</option>
                  <option value="contains">contains</option>
                  <option value="startsWith">starts with</option>
                  <option value="endsWith">ends with</option>
                </select>
                <Input
                  placeholder="value"
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)} className="w-8 h-8 p-0">
                  <X className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            No filter rules configured. All users and groups matching the above criteria will be synced.
          </p>
        )}
      </Card>
    </div>
  );
}
