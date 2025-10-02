import React, { useState } from 'react';
import { Clock, Calendar, Zap } from 'lucide-react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ScheduleConfig {
  mode: 'interval' | 'cron';
  interval?: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  cron?: string;
  syncType: 'full' | 'delta';
  enabled: boolean;
  retryPolicy?: {
    maxRetries: number;
    backoffMultiplier: number;
  };
}

interface SchedulePickerProps {
  connectorId: string;
  value: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
}

export function SchedulePicker({ connectorId, value, onChange }: SchedulePickerProps) {
  const [mode, setMode] = useState<'interval' | 'cron'>(value.mode || 'interval');

  const supportsDelta = ['azure-ad', 'microsoft-365', 'okta'].includes(connectorId);

  const intervalOptions = [
    { value: 15, unit: 'minutes' as const, label: 'Every 15 minutes' },
    { value: 30, unit: 'minutes' as const, label: 'Every 30 minutes' },
    { value: 1, unit: 'hours' as const, label: 'Every hour' },
    { value: 6, unit: 'hours' as const, label: 'Every 6 hours' },
    { value: 12, unit: 'hours' as const, label: 'Every 12 hours' },
    { value: 1, unit: 'days' as const, label: 'Daily' },
  ];

  const commonCronOptions = [
    { value: '0 */6 * * *', label: 'Every 6 hours' },
    { value: '0 0 * * *', label: 'Daily at midnight' },
    { value: '0 2 * * *', label: 'Daily at 2 AM' },
    { value: '0 0 * * 0', label: 'Weekly (Sunday)' },
    { value: '0 0 1 * *', label: 'Monthly (1st)' },
  ];

  const handleModeChange = (newMode: 'interval' | 'cron') => {
    setMode(newMode);
    onChange({
      ...value,
      mode: newMode,
      ...(newMode === 'interval' && !value.interval
        ? { interval: { value: 6, unit: 'hours' } }
        : {}),
      ...(newMode === 'cron' && !value.cron ? { cron: '0 */6 * * *' } : {}),
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Sync */}
      <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <Label className="cursor-pointer" style={{ marginBottom: '4px' }}>
              Enable Automatic Sync
            </Label>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Run sync jobs automatically on a schedule
            </p>
          </div>
          <Switch
            checked={value.enabled !== false}
            onCheckedChange={(checked) => onChange({ ...value, enabled: checked })}
          />
        </div>
      </Card>

      {value.enabled !== false && (
        <>
          {/* Sync Type */}
          {supportsDelta && (
            <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h4
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px',
                }}
              >
                Sync Type
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    value.syncType === 'delta' ? 'border-primary' : ''
                  }`}
                  style={{
                    borderColor: value.syncType === 'delta' ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: value.syncType === 'delta' ? 'var(--primary)' + '10' : 'transparent',
                  }}
                  onClick={() => onChange({ ...value, syncType: 'delta' })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                      }}
                    >
                      Delta Sync
                    </span>
                    <Badge variant="secondary" style={{ fontSize: 'var(--text-xs)' }}>
                      Recommended
                    </Badge>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Only sync changes since last run. Faster and more efficient.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    value.syncType === 'full' ? 'border-primary' : ''
                  }`}
                  style={{
                    borderColor: value.syncType === 'full' ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: value.syncType === 'full' ? 'var(--primary)' + '10' : 'transparent',
                  }}
                  onClick={() => onChange({ ...value, syncType: 'full' })}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--text)' }} />
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)',
                      }}
                    >
                      Full Sync
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Sync all users and groups on every run. More thorough but slower.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Schedule Configuration */}
          <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '12px',
              }}
            >
              Schedule
            </h4>

            <Tabs value={mode} onValueChange={(v) => handleModeChange(v as 'interval' | 'cron')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="interval">
                  <Clock className="w-4 h-4 mr-2" />
                  Interval
                </TabsTrigger>
                <TabsTrigger value="cron">
                  <Calendar className="w-4 h-4 mr-2" />
                  CRON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interval" className="space-y-3">
                <div className="space-y-2">
                  <Label>Run every</Label>
                  <Select
                    value={`${value.interval?.value}-${value.interval?.unit}`}
                    onValueChange={(v) => {
                      const [val, unit] = v.split('-');
                      onChange({
                        ...value,
                        interval: { value: parseInt(val), unit: unit as 'minutes' | 'hours' | 'days' },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {intervalOptions.map((opt) => (
                        <SelectItem key={`${opt.value}-${opt.unit}`} value={`${opt.value}-${opt.unit}`}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="cron" className="space-y-3">
                <div className="space-y-2">
                  <Label>CRON Expression</Label>
                  <Select value={value.cron || '0 */6 * * *'} onValueChange={(v) => onChange({ ...value, cron: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {commonCronOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <div style={{ fontSize: 'var(--text-sm)' }}>{opt.label}</div>
                            <code
                              style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--muted-foreground)',
                                fontFamily: 'monospace',
                              }}
                            >
                              {opt.value}
                            </code>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Custom CRON</Label>
                  <Input
                    value={value.cron || ''}
                    onChange={(e) => onChange({ ...value, cron: e.target.value })}
                    placeholder="0 */6 * * *"
                    className="font-mono"
                  />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                    Format: minute hour day month weekday
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Retry Policy */}
          <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '12px',
              }}
            >
              Retry Policy
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Retries</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={value.retryPolicy?.maxRetries || 3}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      retryPolicy: {
                        ...(value.retryPolicy || { backoffMultiplier: 2 }),
                        maxRetries: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Backoff Multiplier</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={value.retryPolicy?.backoffMultiplier || 2}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      retryPolicy: {
                        ...(value.retryPolicy || { maxRetries: 3 }),
                        backoffMultiplier: parseFloat(e.target.value) || 1,
                      },
                    })
                  }
                />
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '8px' }}>
              If a sync job fails, it will be retried with exponential backoff
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
