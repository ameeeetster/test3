import React from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { IntegrationInstance } from '../data/integration-instances';

interface InstanceSwitcherProps {
  currentInstance: IntegrationInstance;
  instances: IntegrationInstance[];
  onSelect: (instance: IntegrationInstance) => void;
}

export function InstanceSwitcher({ currentInstance, instances, onSelect }: InstanceSwitcherProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />;
      case 'warning':
        return <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />;
      case 'disconnected':
        return <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />;
      default:
        return null;
    }
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'prod':
        return 'var(--success)';
      case 'sandbox':
        return 'var(--warning)';
      case 'dev':
        return 'var(--info)';
      case 'gov':
        return 'var(--primary)';
      default:
        return 'var(--muted)';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          style={{
            height: 'auto',
            padding: '12px',
          }}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(currentInstance.status)}
            <div className="text-left">
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text)',
                }}
              >
                {currentInstance.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                {currentInstance.tenant || currentInstance.domain}
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel>
          Other {currentInstance.connectorName} Instances ({instances.length - 1})
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {instances
          .filter((inst) => inst.id !== currentInstance.id)
          .map((instance) => (
            <DropdownMenuItem
              key={instance.id}
              onClick={() => onSelect(instance)}
              className="cursor-pointer py-3"
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {getStatusIcon(instance.status)}
                  <div className="flex-1">
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text)',
                        marginBottom: '2px',
                      }}
                    >
                      {instance.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      {instance.tenant || instance.domain}
                    </div>
                    {instance.owner && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                        Owner: {instance.owner}
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  style={{
                    fontSize: 'var(--text-xs)',
                    borderColor: getEnvironmentColor(instance.environment),
                    color: getEnvironmentColor(instance.environment),
                  }}
                >
                  {instance.environment.toUpperCase()}
                </Badge>
              </div>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
