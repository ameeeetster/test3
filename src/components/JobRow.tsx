import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { TableRow, TableCell } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export type JobStatus = 'success' | 'failed' | 'warning' | 'running';

export interface Job {
  id: string;
  type: string;
  status: JobStatus;
  startTime: string;
  duration: string;
  recordsProcessed?: number;
  errors?: number;
  warnings?: number;
}

interface JobRowProps {
  job: Job;
  onRetry?: (jobId: string) => void;
}

export function JobRow({ job, onRetry }: JobRowProps) {
  const getStatusConfig = (status: JobStatus) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle2,
          color: 'var(--success)',
          bg: 'var(--success-bg)',
          border: 'var(--success-border)',
          label: 'Success',
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'var(--danger)',
          bg: 'var(--danger-bg)',
          border: 'var(--danger-border)',
          label: 'Failed',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'var(--warning)',
          bg: 'var(--warning-bg)',
          border: 'var(--warning-border)',
          label: 'Warning',
        };
      case 'running':
        return {
          icon: Clock,
          color: 'var(--info)',
          bg: 'var(--info-bg)',
          border: 'var(--info-border)',
          label: 'Running',
        };
    }
  };

  const { icon: Icon, color, bg, border, label } = getStatusConfig(job.status);

  return (
    <TableRow className="transition-colors hover:bg-surface/50">
      <TableCell>
        <Badge
          variant="outline"
          className="inline-flex items-center gap-1.5"
          style={{
            backgroundColor: bg,
            borderColor: border,
            color,
            fontSize: 'var(--text-xs)',
          }}
        >
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </Badge>
      </TableCell>
      <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
        {job.type}
      </TableCell>
      <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        {job.startTime}
      </TableCell>
      <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
        {job.duration}
      </TableCell>
      <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
        {job.recordsProcessed?.toLocaleString() || '-'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {job.errors !== undefined && job.errors > 0 && (
            <Badge
              variant="outline"
              style={{
                backgroundColor: 'var(--danger-bg-subtle)',
                borderColor: 'var(--danger-border)',
                color: 'var(--danger)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {job.errors} {job.errors === 1 ? 'error' : 'errors'}
            </Badge>
          )}
          {job.warnings !== undefined && job.warnings > 0 && (
            <Badge
              variant="outline"
              style={{
                backgroundColor: 'var(--warning-bg-subtle)',
                borderColor: 'var(--warning-border)',
                color: 'var(--warning)',
                fontSize: 'var(--text-xs)',
              }}
            >
              {job.warnings} {job.warnings === 1 ? 'warning' : 'warnings'}
            </Badge>
          )}
          {job.errors === 0 && job.warnings === 0 && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>-</span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {job.status === 'failed' && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRetry(job.id)}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
