import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ChevronRight, ChevronLeft, Search, AlertTriangle, GripVertical } from 'lucide-react';
import { RiskChip } from './RiskChip';

interface Entitlement {
  id: string;
  name: string;
  app: string;
  appIcon: string;
  type: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  lastUsed?: number;
  inRole?: boolean;
}

interface DualPaneComposerProps {
  availableEntitlements: Entitlement[];
  selectedEntitlements: Entitlement[];
  onAdd: (entitlements: Entitlement[]) => void;
  onRemove: (entitlements: Entitlement[]) => void;
  onReorder?: (entitlements: Entitlement[]) => void;
  sodWarning?: { count: number; message: string };
}

export function DualPaneComposer({
  availableEntitlements,
  selectedEntitlements,
  onAdd,
  onRemove,
  sodWarning
}: DualPaneComposerProps) {
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [selectedLeft, setSelectedLeft] = useState<Set<string>>(new Set());
  const [selectedRight, setSelectedRight] = useState<Set<string>>(new Set());
  const [filterApp, setFilterApp] = useState<string>('all');

  const filteredAvailable = availableEntitlements.filter(e => 
    !selectedEntitlements.find(s => s.id === e.id) &&
    e.name.toLowerCase().includes(searchLeft.toLowerCase()) &&
    (filterApp === 'all' || e.app === filterApp)
  );

  const filteredSelected = selectedEntitlements.filter(e =>
    e.name.toLowerCase().includes(searchRight.toLowerCase())
  );

  const apps = Array.from(new Set(availableEntitlements.map(e => e.app)));

  const handleAdd = () => {
    const toAdd = availableEntitlements.filter(e => selectedLeft.has(e.id));
    onAdd(toAdd);
    setSelectedLeft(new Set());
  };

  const handleRemove = () => {
    const toRemove = selectedEntitlements.filter(e => selectedRight.has(e.id));
    onRemove(toRemove);
    setSelectedRight(new Set());
  };

  const toggleLeftSelection = (id: string) => {
    const newSet = new Set(selectedLeft);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLeft(newSet);
  };

  const toggleRightSelection = (id: string) => {
    const newSet = new Set(selectedRight);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRight(newSet);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
        {/* Left Pane - Available */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border" style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)'
        }}>
          <div>
            <h3 style={{ 
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              Available Entitlements
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
              {filteredAvailable.length} items
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
              <Input
                placeholder="Search entitlements..."
                value={searchLeft}
                onChange={(e) => setSearchLeft(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterApp}
              onChange={(e) => setFilterApp(e.target.value)}
              className="px-3 rounded-md border"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--input-background)',
                color: 'var(--text)',
                fontSize: 'var(--text-sm)'
              }}
            >
              <option value="all">All Apps</option>
              {apps.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="flex flex-col gap-1">
              {filteredAvailable.map(ent => (
                <button
                  key={ent.id}
                  onClick={() => toggleLeftSelection(ent.id)}
                  className="flex items-center gap-3 p-3 rounded-md text-left transition-colors"
                  style={{
                    backgroundColor: selectedLeft.has(ent.id) ? 'var(--accent)' : 'transparent',
                    border: selectedLeft.has(ent.id) ? '1px solid var(--primary)' : '1px solid transparent'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{ent.appIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {ent.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      {ent.app} • {ent.type}
                    </div>
                  </div>
                  <RiskChip risk={ent.risk} size="sm" />
                </button>
              ))}
              {filteredAvailable.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    No entitlements found
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Middle - Actions */}
        <div className="flex lg:flex-col items-center justify-center gap-2">
          <Button
            onClick={handleAdd}
            disabled={selectedLeft.size === 0}
            size="sm"
            variant="outline"
          >
            <ChevronRight className="w-4 h-4 lg:rotate-0 rotate-90" />
            <span className="lg:hidden">Add</span>
          </Button>
          <Button
            onClick={handleRemove}
            disabled={selectedRight.size === 0}
            size="sm"
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 lg:rotate-0 -rotate-90" />
            <span className="lg:hidden">Remove</span>
          </Button>
        </div>

        {/* Right Pane - In Role */}
        <div className="flex flex-col gap-3 p-4 rounded-lg border" style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)'
        }}>
          <div>
            <h3 style={{ 
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              In Role
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '4px' }}>
              {filteredSelected.length} items
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            <Input
              placeholder="Search selected..."
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="flex flex-col gap-1">
              {filteredSelected.map(ent => (
                <button
                  key={ent.id}
                  onClick={() => toggleRightSelection(ent.id)}
                  className="flex items-center gap-3 p-3 rounded-md text-left transition-colors"
                  style={{
                    backgroundColor: selectedRight.has(ent.id) ? 'var(--accent)' : 'transparent',
                    border: selectedRight.has(ent.id) ? '1px solid var(--primary)' : '1px solid transparent'
                  }}
                >
                  <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ fontSize: '16px' }}>{ent.appIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {ent.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      {ent.app} • Last used: {ent.lastUsed || 0}%
                    </div>
                  </div>
                  <RiskChip risk={ent.risk} size="sm" />
                </button>
              ))}
              {filteredSelected.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    No entitlements added yet
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* SoD Warning */}
      {sodWarning && sodWarning.count > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border" style={{
          backgroundColor: 'var(--warning-bg)',
          borderColor: 'var(--warning-border)'
        }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
          <div className="flex-1">
            <div style={{ 
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--warning)'
            }}>
              {sodWarning.count} SoD Conflict{sodWarning.count !== 1 ? 's' : ''} Detected
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {sodWarning.message}
            </p>
          </div>
          <Button size="sm" variant="outline">View Details</Button>
        </div>
      )}
    </div>
  );
}
