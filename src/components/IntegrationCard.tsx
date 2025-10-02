import React, { useState } from 'react';
import { LucideIcon, RefreshCw, Zap, Settings2, MoreVertical, Edit2, Copy, Power, Trash2 } from 'lucide-react';
import { Card } from './ui/card';
import { StatusBadge, IntegrationStatus } from './StatusBadge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { RenameIntegrationModal } from './RenameIntegrationModal';
import { BrandLogo } from './BrandLogo';

export interface Integration {
  id: string;
  name: string; // Instance name (editable)
  connectorName?: string; // Connector type name
  connectorType?: string; // Connector type ID for brand icons
  icon: LucideIcon;
  category: string;
  status: IntegrationStatus;
  statusReason?: string;
  lastSync: string;
  users: number;
  syncHealth: number;
  owner?: string;
  syncProgress?: number;
  environment?: 'prod' | 'sandbox' | 'dev' | 'gov';
  tenant?: string;
  domain?: string;
}

interface IntegrationCardProps {
  integration: Integration;
  onClick?: () => void;
  onSync?: () => void;
  onTest?: () => void;
  onSettings?: () => void;
  onRename?: (newName: string) => void;
  onDuplicate?: () => void;
  onDisable?: () => void;
  onDelete?: () => void;
}

export function IntegrationCard({
  integration,
  onClick,
  onSync,
  onTest,
  onSettings,
  onRename,
  onDuplicate,
  onDisable,
  onDelete,
}: IntegrationCardProps) {
  const [renameModalOpen, setRenameModalOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    onClick?.();
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'var(--success)';
    if (health >= 70) return 'var(--warning)';
    return 'var(--danger)';
  };

  const isActionDisabled = integration.status === 'disconnected' || integration.status === 'syncing';

  return (
    <Card
      className="p-5 cursor-pointer transition-all duration-150 group hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View ${integration.name} integration details`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <BrandLogo
          connectorType={integration.connectorType}
          fallbackIcon={integration.icon}
          size="lg"
          className="transition-transform duration-150 group-hover:scale-105"
        />
        <div className="flex items-center gap-2">
          <StatusBadge status={integration.status} size="sm" />
          {(onRename || onDuplicate || onDisable || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {onRename && (
                  <DropdownMenuItem onClick={() => setRenameModalOpen(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {(onDisable || onDelete) && <DropdownMenuSeparator />}
                {onDisable && (
                  <DropdownMenuItem onClick={onDisable}>
                    <Power className="w-4 h-4 mr-2" />
                    {integration.status === 'disconnected' ? 'Enable' : 'Disable'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Rename Modal */}
      {onRename && (
        <RenameIntegrationModal
          open={renameModalOpen}
          onClose={() => setRenameModalOpen(false)}
          currentName={integration.name}
          instanceId={integration.id}
          onSave={onRename}
        />
      )}

      {/* Title & Category */}
      <div className="mb-4">
        <h3
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text)',
            marginBottom: '2px',
          }}
        >
          {integration.name}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          {integration.connectorName || integration.name} {integration.category && `(${integration.category})`}
        </p>
        {(integration.tenant || integration.domain || integration.environment) && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            {integration.tenant || integration.domain}
            {integration.environment && integration.environment !== 'prod' && (
              <span style={{ marginLeft: '4px' }}>
                • {integration.environment.charAt(0).toUpperCase() + integration.environment.slice(1)}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Status Reason (Warning/Error) */}
      {integration.statusReason && (integration.status === 'warning' || integration.status === 'disconnected') && (
        <div
          className="mb-3 p-2 rounded"
          style={{
            backgroundColor: integration.status === 'warning' ? 'var(--warning-bg-subtle)' : 'var(--danger-bg-subtle)',
            fontSize: 'var(--text-xs)',
            color: integration.status === 'warning' ? 'var(--warning)' : 'var(--danger)',
          }}
        >
          {integration.statusReason}
        </div>
      )}

      {/* Syncing Progress */}
      {integration.status === 'syncing' && integration.syncProgress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              Syncing...
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--info)', fontWeight: 'var(--font-weight-medium)' }}>
              {integration.syncProgress}%
            </span>
          </div>
          <Progress value={integration.syncProgress} className="h-1.5" />
        </div>
      )}

      {/* Metrics */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Users</span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {integration.users.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Last Sync</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
            {integration.lastSync}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Sync Health
            </span>
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: getHealthColor(integration.syncHealth),
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {integration.syncHealth}%
            </span>
          </div>
          <Progress value={integration.syncHealth} className="h-1.5" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={handleCardClick}
        >
          View Details
        </Button>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                onClick={(e) => handleActionClick(e, onSync || (() => {}))}
                disabled={isActionDisabled}
                aria-label="Sync now"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync now</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                onClick={(e) => handleActionClick(e, onTest || (() => {}))}
                disabled={isActionDisabled}
                aria-label="Test connection"
              >
                <Zap className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Test connection</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                onClick={(e) => handleActionClick(e, onSettings || (() => {}))}
                aria-label="Settings"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
}
