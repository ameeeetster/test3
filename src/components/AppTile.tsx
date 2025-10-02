import React from 'react';
import { Badge } from './ui/badge';
import { RiskChip } from './RiskChip';
import { Users, Shield, CheckCircle2, XCircle } from 'lucide-react';

interface AppTileProps {
  app: {
    id: string;
    name: string;
    icon: string;
    category: string;
    users: number;
    roles: number;
    risk: 'Low' | 'Medium' | 'High' | 'Critical';
    connectorStatus: 'connected' | 'error' | 'pending';
  };
  onClick?: () => void;
}

export function AppTile({ app, onClick }: AppTileProps) {
  const getStatusIcon = () => {
    switch (app.connectorStatus) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />;
      case 'error':
        return <XCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />;
      case 'pending':
        return <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--warning)' }} />;
    }
  };

  const getStatusText = () => {
    switch (app.connectorStatus) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      case 'pending': return 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (app.connectorStatus) {
      case 'connected': return 'var(--success)';
      case 'error': return 'var(--danger)';
      case 'pending': return 'var(--warning)';
    }
  };

  return (
    <button
      onClick={onClick}
      className="p-4 rounded-lg border text-left transition-all hover:shadow-md w-full"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)'
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'var(--accent)',
              fontSize: '24px'
            }}
          >
            {app.icon}
          </div>
          <div>
            <h4 style={{
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              {app.name}
            </h4>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--muted-foreground)',
              marginTop: '2px'
            }}>
              {app.category}
            </p>
          </div>
        </div>
        <RiskChip risk={app.risk} size="sm" />
      </div>

      <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {app.users.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {app.roles}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {getStatusIcon()}
          <span style={{ fontSize: 'var(--text-xs)', color: getStatusColor() }}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </button>
  );
}
