import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import { InlineRevokeRow, AccessItem } from './InlineRevokeRow';
import { Badge } from './ui/badge';

interface AppGroupProps {
  appName: string;
  items: AccessItem[];
  onRevoke: (itemId: string) => void;
}

export function AppGroup({ appName, items, onRevoke }: AppGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const highRiskCount = items.filter(item => item.risk === 'High' || item.risk === 'Critical').length;

  return (
    <div 
      className="rounded-lg border overflow-hidden transition-all duration-150"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {/* Group Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-50 transition-all duration-120"
        style={{
          backgroundColor: isExpanded ? 'var(--accent)' : 'transparent'
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          )}
          <span 
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}
          >
            {appName}
          </span>
          <Badge 
            variant="outline"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--muted-foreground)',
              fontSize: 'var(--text-xs)'
            }}
          >
            {items.length}
          </Badge>
        </div>
        {highRiskCount > 0 && (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>
              {highRiskCount} high risk
            </span>
          </div>
        )}
      </button>

      {/* Group Content */}
      {isExpanded && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr 
                  className="border-b"
                  style={{ 
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--accent)'
                  }}
                >
                  <th className="px-4 py-2 text-left" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Item
                  </th>
                  <th className="px-4 py-2 text-left" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Type
                  </th>
                  <th className="px-4 py-2 text-left" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Last Used
                  </th>
                  <th className="px-4 py-2 text-left" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Risk
                  </th>
                  <th className="px-4 py-2 text-left" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Granted On
                  </th>
                  <th className="px-4 py-2 text-right" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <InlineRevokeRow
                    key={item.id}
                    item={item}
                    onRevoke={onRevoke}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}