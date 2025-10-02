import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface SoDConflict {
  id: string;
  conflictingAccess: string;
  reason: string;
  policy: string;
  policyLink: string;
}

interface SoDBannerProps {
  conflictCount: number;
  onReviewClick: () => void;
}

export function SoDBanner({ conflictCount, onReviewClick }: SoDBannerProps) {
  if (conflictCount === 0) return null;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: 'var(--danger-bg)',
      border: '1px solid var(--danger)',
      borderRadius: '10px',
      padding: '16px',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle className="w-5 h-5" style={{ color: 'white' }} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: 'var(--danger)', 
            marginBottom: '4px' 
          }}>
            Segregation of Duties Conflict Detected
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '12px' }}>
            {conflictCount} conflict{conflictCount > 1 ? 's' : ''} detected. This request requires additional review and approval before proceeding.
          </p>
          <Button
            onClick={onReviewClick}
            style={{
              height: '36px',
              padding: '0 16px',
              backgroundColor: 'var(--danger)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 120ms var(--ease-out)'
            }}
            className="hover:opacity-90"
          >
            Review Conflicts ({conflictCount})
          </Button>
        </div>
      </div>
    </div>
  );
}