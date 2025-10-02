import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RiskChip } from './RiskChip';
import { Progress } from './ui/progress';

export interface AccessItem {
  id: string;
  name: string;
  type: 'Role' | 'Entitlement';
  lastUsed: string | null; // Date string or null if never used
  lastUsedDays?: number; // Days since last use
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  grantedOn: string;
}

interface InlineRevokeRowProps {
  item: AccessItem;
  onRevoke: (id: string) => void;
}

export function InlineRevokeRow({ item, onRevoke }: InlineRevokeRowProps) {
  const getRelativeTime = (days?: number) => {
    if (days === undefined || days === null) return 'Never';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const getLastUsedColor = (days?: number) => {
    if (days === undefined || days === null) return 'var(--danger)';
    if (days === 0) return 'var(--success)';
    if (days < 7) return 'var(--success)';
    if (days < 30) return 'var(--info)';
    if (days < 90) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <tr 
      className="border-b transition-all duration-120"
      style={{ borderColor: 'var(--border)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <td className="px-4 py-3">
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 'var(--font-weight-medium)' }}>
          {item.name}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant="outline"
          style={{
            backgroundColor: item.type === 'Role' ? 'var(--info-bg)' : 'var(--accent)',
            borderColor: item.type === 'Role' ? 'var(--info-border)' : 'var(--border)',
            color: item.type === 'Role' ? 'var(--info)' : 'var(--muted-foreground)',
            fontSize: 'var(--text-xs)'
          }}
        >
          {item.type}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <span style={{ 
          fontSize: 'var(--text-sm)', 
          color: getLastUsedColor(item.lastUsedDays)
        }}>
          {item.lastUsed ? getRelativeTime(item.lastUsedDays) : 'Never'}
        </span>
      </td>
      <td className="px-4 py-3">
        <RiskChip risk={item.risk} size="sm" />
      </td>
      <td className="px-4 py-3">
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          {item.grantedOn}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(item.id)}
          className="gap-1.5 h-7"
          style={{ color: 'var(--danger)' }}
        >
          <XCircle className="w-3.5 h-3.5" />
          Revoke
        </Button>
      </td>
    </tr>
  );
}