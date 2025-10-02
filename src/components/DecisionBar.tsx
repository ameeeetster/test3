import React from 'react';
import { CheckCircle2, XCircle, UserPlus, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface DecisionBarProps {
  onApprove: () => void;
  onReject: () => void;
  onDelegate: () => void;
  slaHours?: number;
  disabled?: boolean;
}

export function DecisionBar({ onApprove, onReject, onDelegate, slaHours, disabled = false }: DecisionBarProps) {
  const getSLAColor = () => {
    if (!slaHours) return 'var(--muted-foreground)';
    if (slaHours <= 2) return 'var(--danger)';
    if (slaHours <= 6) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      padding: '16px 24px',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 10,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Button
          onClick={onApprove}
          disabled={disabled}
          style={{
            flex: '1 1 auto',
            minWidth: '140px',
            height: '44px',
            backgroundColor: 'var(--success)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 120ms var(--ease-out)'
          }}
          className="hover:opacity-90 active:scale-[0.98]"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" strokeWidth={2.5} />
          Approve Request
        </Button>

        <Button
          onClick={onReject}
          disabled={disabled}
          variant="outline"
          style={{
            flex: '1 1 auto',
            minWidth: '140px',
            height: '44px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            borderColor: 'var(--danger)',
            color: 'var(--danger)',
            transition: 'all 120ms var(--ease-out)'
          }}
          className="hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.98]"
        >
          <XCircle className="w-4 h-4 mr-2" strokeWidth={2.5} />
          Reject
        </Button>

        <Button
          onClick={onDelegate}
          disabled={disabled}
          variant="outline"
          style={{
            height: '44px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 120ms var(--ease-out)'
          }}
          className="active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4 mr-2" strokeWidth={2} />
          Delegate
        </Button>

        {slaHours !== undefined && (
          <Badge style={{
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '8px',
            backgroundColor: 'var(--accent)',
            color: getSLAColor(),
            border: `1px solid ${getSLAColor()}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginLeft: 'auto'
          }}>
            <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
            SLA: {slaHours}h remaining
          </Badge>
        )}
      </div>
    </div>
  );
}