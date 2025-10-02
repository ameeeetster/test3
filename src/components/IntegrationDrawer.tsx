import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { StatusBadge, IntegrationStatus } from './StatusBadge';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  RefreshCw,
  Zap,
  ExternalLink
} from 'lucide-react';

interface JobRecord {
  id: string;
  type: string;
  status: 'success' | 'failed' | 'warning';
  timestamp: string;
  details: string;
}

interface IntegrationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: {
    id: string;
    name: string;
    status: IntegrationStatus;
    owner?: string;
    lastSync: string;
    nextSync?: string;
    syncHealth: number;
    errors?: number;
    warnings?: number;
    jobs?: JobRecord[];
  } | null;
  onOpenDetails?: () => void;
  onSync?: () => void;
  onTest?: () => void;
  onReconnect?: () => void;
}

export function IntegrationDrawer({
  open,
  onOpenChange,
  integration,
  onOpenDetails,
  onSync,
  onTest,
  onReconnect,
}: IntegrationDrawerProps) {
  if (!integration) return null;

  const getJobStatusConfig = (status: 'success' | 'failed' | 'warning') => {
    switch (status) {
      case 'success':
        return { icon: CheckCircle2, color: 'var(--success)', bg: 'var(--success-bg)' };
      case 'failed':
        return { icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-bg)' };
      case 'warning':
        return { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-bg)' };
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-lg p-0 flex flex-col"
        style={{
          backgroundColor: 'var(--bg)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '8px',
                }}
              >
                {integration.name}
              </SheetTitle>
              <SheetDescription className="sr-only">
                View details and quick actions for {integration.name} integration
              </SheetDescription>
              <div className="flex items-center gap-2">
                <StatusBadge status={integration.status} size="sm" />
                {integration.owner && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      {integration.owner}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="space-y-6">
            {/* Sync Info */}
            <div>
              <h4
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px',
                }}
              >
                Sync Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    Last Sync
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                    {integration.lastSync}
                  </span>
                </div>
                {integration.nextSync && (
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                      Next Sync
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                      {integration.nextSync}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    Health
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: integration.syncHealth >= 95 ? 'var(--success)' : integration.syncHealth >= 70 ? 'var(--warning)' : 'var(--danger)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                  >
                    {integration.syncHealth}%
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Health Status */}
            {(integration.errors || integration.warnings) && (
              <>
                <div>
                  <h4
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                      marginBottom: '12px',
                    }}
                  >
                    Health Status
                  </h4>
                  <div className="space-y-2">
                    {integration.errors > 0 && (
                      <div
                        className="flex items-center gap-2 p-2 rounded"
                        style={{ backgroundColor: 'var(--danger-bg-subtle)' }}
                      >
                        <XCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>
                          {integration.errors} {integration.errors === 1 ? 'error' : 'errors'}
                        </span>
                      </div>
                    )}
                    {integration.warnings > 0 && (
                      <div
                        className="flex items-center gap-2 p-2 rounded"
                        style={{ backgroundColor: 'var(--warning-bg-subtle)' }}
                      >
                        <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>
                          {integration.warnings} {integration.warnings === 1 ? 'warning' : 'warnings'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Recent Jobs */}
            {integration.jobs && integration.jobs.length > 0 && (
              <div>
                <h4
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '12px',
                  }}
                >
                  Last 5 Jobs
                </h4>
                <div className="space-y-2">
                  {integration.jobs.slice(0, 5).map((job) => {
                    const { icon: Icon, color, bg } = getJobStatusConfig(job.status);
                    return (
                      <div
                        key={job.id}
                        className="p-3 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: bg }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text)',
                                fontWeight: 'var(--font-weight-medium)',
                                marginBottom: '2px',
                              }}
                            >
                              {job.type}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                              {job.details}
                            </div>
                            <div
                              className="flex items-center gap-1 mt-1"
                              style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}
                            >
                              <Clock className="w-3 h-3" />
                              {job.timestamp}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
          {integration.status === 'disconnected' && onReconnect && (
            <Button className="w-full" onClick={onReconnect}>
              Reconnect
            </Button>
          )}
          
          <div className="flex gap-2">
            {integration.status !== 'disconnected' && onSync && (
              <Button variant="outline" className="flex-1 gap-2" onClick={onSync}>
                <RefreshCw className="w-4 h-4" />
                Sync Now
              </Button>
            )}
            {integration.status !== 'disconnected' && onTest && (
              <Button variant="outline" className="flex-1 gap-2" onClick={onTest}>
                <Zap className="w-4 h-4" />
                Test
              </Button>
            )}
          </div>

          {onOpenDetails && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={onOpenDetails}
            >
              Open Details
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
