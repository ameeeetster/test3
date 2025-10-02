import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

// Two modes: detailed conflict card or simple count badge
type ConflictChipProps = 
  | {
      // Detailed mode
      conflictingAccess: string;
      reason: string;
      policy: string;
      policyLink?: string;
      count?: never;
      size?: never;
    }
  | {
      // Simple count badge mode
      count: number;
      size?: 'sm' | 'md';
      conflictingAccess?: never;
      reason?: never;
      policy?: never;
      policyLink?: never;
    };

export function ConflictChip(props: ConflictChipProps) {
  // Simple count badge mode
  if ('count' in props && props.count !== undefined) {
    const { count, size = 'md' } = props;
    
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded"
        style={{
          backgroundColor: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
        }}
      >
        <AlertTriangle 
          className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}
          style={{ color: 'var(--danger)' }}
          strokeWidth={2.5}
        />
        <span style={{
          fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--danger)'
        }}>
          {count}
        </span>
      </div>
    );
  }
  
  // Detailed conflict card mode
  const { conflictingAccess, reason, policy, policyLink } = props;
  
  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'var(--danger-bg)',
      border: '1px solid var(--danger-border)',
      borderRadius: '8px',
      transition: 'all 120ms var(--ease-out)'
    }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'start', marginBottom: '8px' }}>
        <AlertTriangle 
          className="w-4 h-4" 
          style={{ color: 'var(--danger)', marginTop: '2px', flexShrink: 0 }} 
          strokeWidth={2.5} 
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: 'var(--danger)',
            marginBottom: '4px'
          }}>
            {conflictingAccess}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            {reason}
          </div>
        </div>
      </div>
      
      {policyLink ? (
        <a
          href={policyLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'var(--danger)',
            textDecoration: 'none',
            transition: 'opacity 120ms var(--ease-out)'
          }}
          className="hover:opacity-70"
        >
          {policy}
          <ExternalLink className="w-3 h-3" strokeWidth={2.5} />
        </a>
      ) : (
        <div style={{
          fontSize: '12px',
          fontWeight: '500',
          color: 'var(--danger)'
        }}>
          {policy}
        </div>
      )}
    </div>
  );
}