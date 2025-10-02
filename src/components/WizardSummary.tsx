import React from 'react';
import { CheckCircle2, Calendar, Users, Settings, Map, Filter, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import type { ConnectorDefinition } from '../data/connectors';

interface WizardSummaryProps {
  connector: ConnectorDefinition;
  config: Record<string, any>;
  onRunTestSync?: (enabled: boolean) => void;
}

export function WizardSummary({ connector, config, onRunTestSync }: WizardSummaryProps) {
  const [runTestSync, setRunTestSync] = React.useState(false);

  const Icon = connector.icon;

  const renderConfigSection = (title: string, icon: React.ReactNode, items: Array<{ label: string; value: any }>) => {
    const filteredItems = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '');
    
    if (filteredItems.length === 0) return null;

    return (
      <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
            }}
          >
            {title}
          </h4>
        </div>
        <div className="space-y-2">
          {filteredItems.map((item, index) => (
            <div key={index} className="flex items-start justify-between gap-4">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{item.label}</span>
              <span
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text)',
                  fontWeight: 'var(--font-weight-medium)',
                  textAlign: 'right',
                  wordBreak: 'break-word',
                }}
              >
                {typeof item.value === 'boolean' ? (
                  <Badge variant={item.value ? 'default' : 'secondary'}>
                    {item.value ? 'Enabled' : 'Disabled'}
                  </Badge>
                ) : Array.isArray(item.value) ? (
                  <div className="flex flex-wrap gap-1 justify-end">
                    {item.value.map((v, i) => (
                      <Badge key={i} variant="secondary">
                        {v}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  String(item.value)
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text)',
            marginBottom: '4px',
          }}
        >
          Review Configuration
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          Review your integration settings before creating
        </p>
      </div>

      {/* Connector Info */}
      <Card className="p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }}
          >
            <Icon className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>
          <div className="flex-1">
            <h4
              style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '4px',
              }}
            >
              {connector.name}
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '8px' }}>
              {connector.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {connector.capabilities.map((cap) => (
                <Badge key={cap.id} variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                  {cap.label}
                </Badge>
              ))}
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
        </div>
      </Card>

      {/* Connection Details */}
      {renderConfigSection(
        'Connection',
        <Settings className="w-4 h-4" style={{ color: 'var(--primary)' }} />,
        [
          { label: 'Tenant ID', value: config.tenantId },
          { label: 'Domain', value: config.primaryDomain },
          { label: 'Environment', value: config.environment },
          { label: 'Host', value: config.host },
          { label: 'Instance URL', value: config.instanceUrl },
          { label: 'Site URL', value: config.siteUrl },
          { label: 'Role ARN', value: config.roleArn },
          { label: 'Region', value: config.region },
        ]
      )}

      {/* Authentication */}
      {renderConfigSection(
        'Authentication',
        <Badge className="w-4 h-4 p-0" variant="outline" />,
        [
          { label: 'Client ID', value: config.clientId ? '••••••••' : undefined },
          { label: 'Client Secret', value: config.clientSecret ? 'Configured' : undefined },
          { label: 'Certificate', value: config.certificate ? 'Uploaded' : undefined },
          { label: 'API Token', value: config.apiToken ? 'Configured' : undefined },
          { label: 'Permissions', value: config.permissions },
        ]
      )}

      {/* Scope */}
      {(config.scope || config.syncUsers !== undefined) &&
        renderConfigSection(
          'Scope & Discovery',
          <Filter className="w-4 h-4" style={{ color: 'var(--primary)' }} />,
          [
            { label: 'Sync Users', value: config.scope?.syncUsers ?? config.syncUsers },
            { label: 'Sync Groups', value: config.scope?.syncGroups ?? config.syncGroups },
            { label: 'Domains', value: config.scope?.domains },
            { label: 'OUs', value: config.scope?.organizationalUnits },
            { label: 'Filter Rules', value: config.scope?.rules?.length > 0 ? `${config.scope.rules.length} rules` : undefined },
          ]
        )}

      {/* Attribute Mapping */}
      {config.mappings && config.mappings.length > 0 && (
        <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Map className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
              }}
            >
              Attribute Mappings
            </h4>
          </div>
          <div className="space-y-2">
            {config.mappings.slice(0, 5).map((mapping: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <code
                  className="px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'monospace',
                  }}
                >
                  {mapping.source}
                </code>
                <span style={{ color: 'var(--muted-foreground)' }}>→</span>
                <code
                  className="px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'monospace',
                  }}
                >
                  {mapping.target}
                </code>
                {mapping.transform && mapping.transform !== 'none' && (
                  <Badge variant="outline" style={{ fontSize: 'var(--text-xs)' }}>
                    {mapping.transform}
                  </Badge>
                )}
              </div>
            ))}
            {config.mappings.length > 5 && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                + {config.mappings.length - 5} more mappings
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Provisioning */}
      {renderConfigSection(
        'Provisioning',
        <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />,
        [
          { label: 'Create Users', value: config.createUsers },
          { label: 'Update Users', value: config.updateUsers },
          { label: 'Disable Users', value: config.disableUsers },
          { label: 'Group Writeback', value: config.groupWriteback },
          { label: 'Pre-hire Handling', value: config.preHire },
          { label: 'Rehire Detection', value: config.rehire },
          { label: 'Conflict Policy', value: config.conflictPolicy },
        ]
      )}

      {/* Schedule */}
      {config.schedule &&
        renderConfigSection(
          'Sync Schedule',
          <Clock className="w-4 h-4" style={{ color: 'var(--primary)' }} />,
          [
            { label: 'Enabled', value: config.schedule.enabled },
            { label: 'Sync Type', value: config.schedule.syncType },
            {
              label: 'Frequency',
              value: config.schedule.mode === 'interval'
                ? `Every ${config.schedule.interval?.value} ${config.schedule.interval?.unit}`
                : config.schedule.cron,
            },
            {
              label: 'Max Retries',
              value: config.schedule.retryPolicy?.maxRetries,
            },
          ]
        )}

      <Separator />

      {/* Test Sync Option */}
      <Card className="p-4" style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Calendar className="w-5 h-5 mt-0.5" style={{ color: 'var(--info)' }} />
            <div>
              <Label htmlFor="test-sync" className="cursor-pointer" style={{ marginBottom: '4px', color: 'var(--info)' }}>
                Run test sync after creation
              </Label>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--info)' }}>
                Execute an initial sync job to verify the integration works correctly
              </p>
            </div>
          </div>
          <Switch
            id="test-sync"
            checked={runTestSync}
            onCheckedChange={(checked) => {
              setRunTestSync(checked);
              onRunTestSync?.(checked);
            }}
          />
        </div>
      </Card>

      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)' }}
      >
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--success)' }}>
          ✅ Configuration is complete and ready. Click "Create Integration" to finish setup.
        </p>
      </div>
    </div>
  );
}
