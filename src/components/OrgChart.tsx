import React, { useMemo, useState } from 'react';
import { User, ChevronDown, ChevronRight, Building2, Mail, Briefcase, Users, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { Identity } from './IdentitiesDataTable';

interface OrgChartNode {
  id: string;
  name: string;
  email: string;
  department?: string;
  jobTitle?: string;
  status?: string;
  risk?: string;
  managerId?: string;
  managerEmail?: string;
  children: OrgChartNode[];
  level: number;
}

interface OrgChartProps {
  identities: Identity[];
  onNodeClick?: (identity: Identity) => void;
  selectedId?: string;
}

export function OrgChart({ identities, onNodeClick, selectedId }: OrgChartProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
  const [rootNode, setRootNode] = useState<string | null>(null);

  // Create identity map for lookups (used throughout component)
  const identityMap = useMemo(() => {
    const map = new Map<string, Identity>();
    identities.forEach(identity => {
      map.set(identity.id, identity);
    });
    return map;
  }, [identities]);

  // Build the organizational tree from manager relationships
  const orgTree = useMemo(() => {

    // Build nodes with manager relationships
    const nodes = new Map<string, OrgChartNode>();
    const rootNodes: OrgChartNode[] = [];

    // First pass: create all nodes
    identities.forEach(identity => {
      const node: OrgChartNode = {
        id: identity.id,
        name: identity.name,
        email: identity.email,
        department: identity.department,
        jobTitle: identity.jobTitle,
        status: identity.status,
        risk: identity.risk,
        managerId: identity.managerId,
        managerEmail: identity.managerEmail,
        children: [],
        level: 0
      };
      nodes.set(identity.id, node);
    });

    // Second pass: build parent-child relationships
    nodes.forEach((node, id) => {
      if (node.managerId && nodes.has(node.managerId)) {
        const managerNode = nodes.get(node.managerId)!;
        managerNode.children.push(node);
      } else {
        // No manager or manager not found - this is a root node
        rootNodes.push(node);
      }
    });

    // Calculate levels for each node
    const calculateLevels = (node: OrgChartNode, level: number = 0) => {
      node.level = level;
      node.children.forEach(child => calculateLevels(child, level + 1));
    };

    rootNodes.forEach(node => calculateLevels(node, 0));

    // Sort children by name for consistent display
    const sortChildren = (node: OrgChartNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortChildren);
    };

    rootNodes.forEach(sortChildren);

    return rootNodes;
  }, [identities]);

  // Filter to show only selected root node's subtree if rootNode is set
  const displayTree = useMemo(() => {
    if (!rootNode) return orgTree;

    const findNode = (nodes: OrgChartNode[], id: string): OrgChartNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = findNode(node.children, id);
        if (found) return found;
      }
      return null;
    };

    const node = findNode(orgTree, rootNode);
    return node ? [node] : orgTree;
  }, [orgTree, rootNode]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: OrgChartNode[]) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(displayTree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderNode = (node: OrgChartNode, isRoot: boolean = false): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedId === node.id;
    const isRootNode = rootNode === node.id;

    return (
      <div key={node.id} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            marginLeft: isRoot ? '0' : `${node.level * 40}px`,
            position: 'relative'
          }}
        >
          {/* Connector line for non-root nodes */}
          {!isRoot && (
            <div
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                width: '20px',
                height: '1px',
                backgroundColor: 'var(--border)',
                zIndex: 0
              }}
            />
          )}

          {/* Expand/Collapse button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpand(node.id)}
              style={{
                width: '24px',
                height: '24px',
                padding: 0,
                marginRight: '8px',
                minWidth: '24px'
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {!hasChildren && <div style={{ width: '32px' }} />}

          {/* Node Card */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  onClick={() => {
                    const identity = identityMap.get(node.id);
                    if (identity) onNodeClick?.(identity);
                  }}
                  style={{
                    cursor: onNodeClick ? 'pointer' : 'default',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    transition: 'all 150ms var(--ease-out)',
                    minWidth: viewMode === 'detailed' ? '280px' : '200px',
                    flex: 1
                  }}
                  className={onNodeClick ? 'hover:shadow-md hover:border-primary/50' : ''}
                >
                  <CardContent style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar style={{ width: '40px', height: '40px' }}>
                        <AvatarFallback style={{ fontSize: '14px', fontWeight: '600' }}>
                          {node.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text)',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {node.name}
                        </div>
                        {viewMode === 'detailed' && (
                          <>
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--muted-foreground)',
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {node.jobTitle || 'No title'}
                            </div>
                            {node.department && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <Building2 className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--muted-foreground)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {node.department}
                                </span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Mail className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--muted-foreground)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {node.email}
                              </span>
                            </div>
                          </>
                        )}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {node.status && (
                            <Badge
                              variant="outline"
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                backgroundColor:
                                  node.status === 'Active'
                                    ? 'var(--success-bg)'
                                    : node.status === 'Inactive'
                                    ? 'var(--muted)'
                                    : 'var(--warning-bg)',
                                color:
                                  node.status === 'Active'
                                    ? 'var(--success)'
                                    : node.status === 'Inactive'
                                    ? 'var(--muted-foreground)'
                                    : 'var(--warning)',
                                borderColor:
                                  node.status === 'Active'
                                    ? 'var(--success-border)'
                                    : node.status === 'Inactive'
                                    ? 'var(--border)'
                                    : 'var(--warning-border)'
                              }}
                            >
                              {node.status}
                            </Badge>
                          )}
                          {hasChildren && (
                            <Badge
                              variant="outline"
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                backgroundColor: 'var(--accent)',
                                color: 'var(--text)',
                                borderColor: 'var(--border)'
                              }}
                            >
                              <Users className="w-3 h-3" style={{ marginRight: '2px' }} />
                              {node.children.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="right" style={{ maxWidth: '300px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontWeight: '600' }}>{node.name}</div>
                  {node.jobTitle && <div style={{ fontSize: '12px' }}>{node.jobTitle}</div>}
                  {node.department && <div style={{ fontSize: '12px' }}>{node.department}</div>}
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{node.email}</div>
                  {node.managerEmail && (
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                      Reports to: {identityMap.get(node.managerId || '')?.name || node.managerEmail}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div style={{ position: 'relative' }}>
            {/* Vertical connector line */}
            <div
              style={{
                position: 'absolute',
                left: `${node.level * 40 + 8}px`,
                top: '0',
                bottom: '0',
                width: '1px',
                backgroundColor: 'var(--border)',
                zIndex: 0
              }}
            />
            {node.children.map(child => renderNode(child, false))}
          </div>
        )}
      </div>
    );
  };

  // Get all root nodes (users without managers)
  const rootNodes = useMemo(() => {
    return identities.filter(id => !id.managerId || !identities.find(i => i.id === id.managerId));
  }, [identities]);

  // Get orphaned nodes (users whose manager doesn't exist)
  const orphanedNodes = useMemo(() => {
    return identities.filter(
      id => id.managerId && !identities.find(i => i.id === id.managerId)
    );
  }, [identities]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'var(--surface)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            style={{ fontSize: '12px', height: '32px' }}
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            style={{ fontSize: '12px', height: '32px' }}
          >
            <Minimize2 className="w-3.5 h-3.5 mr-1.5" />
            Collapse All
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
            style={{ fontSize: '12px', height: '32px' }}
          >
            {viewMode === 'detailed' ? 'Compact View' : 'Detailed View'}
          </Button>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Badge variant="outline" style={{ fontSize: '11px' }}>
            {displayTree.length} {displayTree.length === 1 ? 'Root' : 'Roots'}
          </Badge>
          <Badge variant="outline" style={{ fontSize: '11px' }}>
            {identities.length} Total
          </Badge>
          {orphanedNodes.length > 0 && (
            <Badge variant="outline" style={{ fontSize: '11px', color: 'var(--warning)' }}>
              {orphanedNodes.length} Orphaned
            </Badge>
          )}
        </div>
      </div>

      {/* Org Chart */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          backgroundColor: 'var(--background)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          minHeight: '400px'
        }}
      >
        {displayTree.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--muted-foreground)',
              gap: '12px'
            }}
          >
            <Users className="w-12 h-12" style={{ opacity: 0.5 }} />
            <div style={{ fontSize: '14px', fontWeight: '500' }}>No organizational structure found</div>
            <div style={{ fontSize: '12px', textAlign: 'center', maxWidth: '300px' }}>
              Manager relationships need to be set up. Assign managers to users to see the org chart.
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            {displayTree.map((node, index) => (
              <div key={node.id}>{renderNode(node, true)}</div>
            ))}
          </div>
        )}

        {/* Show orphaned nodes separately if any */}
        {orphanedNodes.length > 0 && rootNode === null && (
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--warning)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <AlertCircle className="w-4 h-4" />
              Orphaned Users ({orphanedNodes.length})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
              These users have managers assigned, but their managers are not in the system.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {orphanedNodes.map(identity => (
                <Badge
                  key={identity.id}
                  variant="outline"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    cursor: onNodeClick ? 'pointer' : 'default'
                  }}
                  onClick={() => onNodeClick?.(identity)}
                >
                  {identity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

