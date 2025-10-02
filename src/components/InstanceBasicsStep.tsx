import React, { useState } from 'react';
import { Sparkles, Tag, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import type { IntegrationEnvironment } from '../data/integration-instances';

interface InstanceBasicsStepProps {
  connectorName: string;
  value: {
    instanceName: string;
    environment: IntegrationEnvironment;
    owner: string;
    tags: string[];
  };
  onChange: (updates: Partial<InstanceBasicsStepProps['value']>) => void;
  onSuggestName: () => void;
}

export function InstanceBasicsStep({ connectorName, value, onChange, onSuggestName }: InstanceBasicsStepProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag && !value.tags.includes(newTag)) {
      onChange({ tags: [...value.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onChange({ tags: value.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card
        className="p-4"
        style={{
          backgroundColor: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
        }}
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--info)' }}>
          <strong>Multiple Instances:</strong> You can create multiple integrations of the same type with different
          names. For example: "{connectorName} — Corp Prod", "{connectorName} — M&A Tenant", etc.
        </p>
      </Card>

      {/* Instance Name */}
      <div className="space-y-2">
        <Label htmlFor="instanceName">
          Instance Name <span style={{ color: 'var(--destructive)' }}>*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="instanceName"
            value={value.instanceName}
            onChange={(e) => onChange({ instanceName: e.target.value })}
            placeholder={`${connectorName} — Production`}
          />
          <Button variant="outline" size="sm" onClick={onSuggestName} className="gap-2 whitespace-nowrap">
            <Sparkles className="w-4 h-4" />
            Suggest
          </Button>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          Choose a unique, descriptive name. This will be shown throughout the UI.
        </p>
      </div>

      {/* Environment */}
      <div className="space-y-2">
        <Label htmlFor="environment">
          Environment <span style={{ color: 'var(--destructive)' }}>*</span>
        </Label>
        <Select value={value.environment} onValueChange={(v) => onChange({ environment: v as IntegrationEnvironment })}>
          <SelectTrigger id="environment">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prod">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--success)' }}
                />
                Production
              </div>
            </SelectItem>
            <SelectItem value="sandbox">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--warning)' }}
                />
                Sandbox
              </div>
            </SelectItem>
            <SelectItem value="dev">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--info)' }}
                />
                Development
              </div>
            </SelectItem>
            <SelectItem value="gov">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                Government
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          Select the environment tier for this integration
        </p>
      </div>

      {/* Owner */}
      <div className="space-y-2">
        <Label htmlFor="owner">
          Owner <span style={{ color: 'var(--destructive)' }}>*</span>
        </Label>
        <Input
          id="owner"
          value={value.owner}
          onChange={(e) => onChange({ owner: e.target.value })}
          placeholder="e.g., IdM Team, IT Operations"
        />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          Team or person responsible for this integration
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="newTag">
          Tags <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--muted-foreground)' }}>(Optional)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="newTag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="e.g., production, critical, sso"
          />
          <Button variant="outline" size="sm" onClick={addTag}>
            <Tag className="w-4 h-4" />
          </Button>
        </div>
        {value.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {value.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          Add tags to organize and filter integrations
        </p>
      </div>

      {/* Preview Card */}
      {value.instanceName && (
        <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h4
                style={{
                  fontSize: 'var(--text-md)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                {value.instanceName}
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                {connectorName} • {value.environment.charAt(0).toUpperCase() + value.environment.slice(1)}
              </p>
            </div>
            <Badge
              variant="outline"
              style={{
                backgroundColor:
                  value.environment === 'prod'
                    ? 'var(--success-bg)'
                    : value.environment === 'sandbox'
                    ? 'var(--warning-bg)'
                    : 'var(--info-bg)',
                borderColor:
                  value.environment === 'prod'
                    ? 'var(--success-border)'
                    : value.environment === 'sandbox'
                    ? 'var(--warning-border)'
                    : 'var(--info-border)',
                color:
                  value.environment === 'prod'
                    ? 'var(--success)'
                    : value.environment === 'sandbox'
                    ? 'var(--warning)'
                    : 'var(--info)',
              }}
            >
              {value.environment.toUpperCase()}
            </Badge>
          </div>
          {value.owner && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Owner: {value.owner}
            </p>
          )}
          {value.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {value.tags.map((tag) => (
                <Badge key={tag} variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}