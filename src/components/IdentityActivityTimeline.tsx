import React from 'react';
import { LogIn, FileCheck, Key, UserX, AlertTriangle, Download, Monitor, Smartphone } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export interface ActivityEvent {
  id: string;
  type: 'login' | 'request' | 'provisioning' | 'deprovisioning' | 'password-reset' | 'anomaly';
  action: string;
  resource?: string;
  timestamp: string;
  location?: string;
  device?: 'desktop' | 'mobile';
  isAnomaly?: boolean;
  status: 'success' | 'pending' | 'failed' | 'warning';
}

interface IdentityActivityTimelineProps {
  events: ActivityEvent[];
  onExport?: () => void;
}

export function IdentityActivityTimeline({ events, onExport }: IdentityActivityTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'login':
        return LogIn;
      case 'request':
        return FileCheck;
      case 'provisioning':
        return Key;
      case 'deprovisioning':
        return UserX;
      case 'password-reset':
        return Key;
      case 'anomaly':
        return AlertTriangle;
      default:
        return FileCheck;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'success':
        return {
          bgColor: 'var(--success-bg)',
          borderColor: 'var(--success-border)',
          color: 'var(--success)',
          label: 'Success'
        };
      case 'pending':
        return {
          bgColor: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)',
          color: 'var(--warning)',
          label: 'Pending'
        };
      case 'failed':
        return {
          bgColor: 'var(--danger-bg)',
          borderColor: 'var(--danger-border)',
          color: 'var(--danger)',
          label: 'Failed'
        };
      case 'warning':
        return {
          bgColor: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)',
          color: 'var(--warning)',
          label: 'Warning'
        };
      default:
        return {
          bgColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--muted-foreground)',
          label: status
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <h3 style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text)'
        }}>
          Activity History
        </h3>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {events.map((event, index) => {
          const Icon = getIcon(event.type);
          const statusConfig = getStatusConfig(event.status);
          const DeviceIcon = event.device === 'mobile' ? Smartphone : Monitor;
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative flex gap-4 pb-6">
              {/* Timeline line */}
              {!isLast && (
                <div 
                  className="absolute left-5 top-12 w-px h-full"
                  style={{ backgroundColor: 'var(--border)' }}
                />
              )}

              {/* Icon */}
              <div 
                className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0"
                style={{
                  backgroundColor: event.isAnomaly ? 'var(--danger-bg)' : statusConfig.bgColor,
                  borderColor: event.isAnomaly ? 'var(--danger)' : statusConfig.borderColor,
                  color: event.isAnomaly ? 'var(--danger)' : statusConfig.color
                }}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)'
                      }}>
                        {event.action}
                      </h4>
                      {event.isAnomaly && (
                        <Badge
                          variant="outline"
                          className="gap-1"
                          style={{
                            backgroundColor: 'var(--danger-bg)',
                            borderColor: 'var(--danger-border)',
                            color: 'var(--danger)',
                            fontSize: 'var(--text-xs)'
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Anomaly
                        </Badge>
                      )}
                    </div>
                    {event.resource && (
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        {event.resource}
                      </p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                        {event.timestamp}
                      </span>
                      {event.location && (
                        <>
                          <span style={{ color: 'var(--border)' }}>•</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                            {event.location}
                          </span>
                        </>
                      )}
                      {event.device && (
                        <>
                          <span style={{ color: 'var(--border)' }}>•</span>
                          <div className="flex items-center gap-1">
                            <DeviceIcon className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>
                              {event.device}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      borderColor: statusConfig.borderColor,
                      color: statusConfig.color,
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div 
          className="text-center py-8 rounded-lg border"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)'
          }}
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            No activity recorded
          </p>
        </div>
      )}
    </div>
  );
}