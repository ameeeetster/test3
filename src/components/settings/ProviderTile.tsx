import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Shield, MoveVertical as MoreVertical, Play, RotateCcw, Power, Settings, History } from 'lucide-react';

interface ProviderTileProps {
  name: string;
  icon?: React.ReactNode;
  status: 'configured' | 'not-configured' | 'disabled' | 'error';
  lastTest?: string;
  signIns?: number;
  onConfigure: () => void;
  onTest: () => void;
  onRotateSecret: () => void;
  onDisable: () => void;
  onHistory: () => void;
}

const statusConfig = {
  configured: { label: 'Configured', variant: 'default' as const, color: 'text-green-600 dark:text-green-400' },
  'not-configured': { label: 'Not configured', variant: 'secondary' as const, color: 'text-muted-foreground' },
  disabled: { label: 'Disabled', variant: 'secondary' as const, color: 'text-yellow-600 dark:text-yellow-400' },
  error: { label: 'Error', variant: 'destructive' as const, color: 'text-destructive' }
};

export function ProviderTile({
  name,
  icon,
  status,
  lastTest,
  signIns,
  onConfigure,
  onTest,
  onRotateSecret,
  onDisable,
  onHistory
}: ProviderTileProps) {
  const [isFocused, setIsFocused] = useState(false);
  const config = statusConfig[status];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfigure();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onTest();
    }
  };

  return (
    <div
      className={`
        group relative p-4 rounded-xl border bg-card hover:border-primary/50 transition-all cursor-pointer
        focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
        ${isFocused ? 'ring-2 ring-ring ring-offset-2' : ''}
        shadow-sm hover:shadow-md
      `}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="button"
      aria-label={`${name} provider - ${config.label}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            {icon || <Shield className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{name}</h3>
            <Badge variant={config.variant} className="mt-1 text-xs h-5">
              {config.label}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onConfigure}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onTest} disabled={status === 'not-configured'}>
              <Play className="w-4 h-4 mr-2" />
              Test Sign-In
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRotateSecret} disabled={status === 'not-configured'}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Rotate Secret
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onHistory}>
              <History className="w-4 h-4 mr-2" />
              View History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDisable} disabled={status === 'not-configured'} className="text-destructive">
              <Power className="w-4 h-4 mr-2" />
              {status === 'disabled' ? 'Enable' : 'Disable'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {status !== 'not-configured' && (lastTest || signIns !== undefined) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lastTest && <span>Last test {lastTest}</span>}
          {lastTest && signIns !== undefined && <span>•</span>}
          {signIns !== undefined && <span>{signIns} sign-ins / 24h</span>}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">Connection test failed. Check configuration.</p>
        </div>
      )}

      {status === 'not-configured' && (
        <div className="mt-3">
          <Button variant="outline" size="sm" onClick={onConfigure} className="w-full">
            <Settings className="w-3 h-3 mr-1" />
            Configure Provider
          </Button>
        </div>
      )}
    </div>
  );
}

export function ProviderTileSkeleton() {
  return (
    <div className="p-4 rounded-xl border bg-card shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-accent rounded" />
            <div className="h-5 w-20 bg-accent rounded" />
          </div>
        </div>
      </div>
      <div className="h-3 w-40 bg-accent rounded" />
    </div>
  );
}
