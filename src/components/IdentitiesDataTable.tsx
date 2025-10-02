import React, { useState } from 'react';
import { Eye, AlertCircle, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { StatusChip } from './StatusChip';
import { RiskChip } from './RiskChip';

export interface Identity {
  id: string;
  name: string;
  email: string;
  department: string;
  manager: string;
  status: 'Active' | 'Inactive' | 'Disabled' | 'Pending';
  risk: 'Critical' | 'High' | 'Medium' | 'Low';
  roles: number;
  lastLogin: string;
  lastLoginDays: number; // Days since last login
  issues?: {
    sodConflicts?: number;
    anomalies?: number;
  };
}

interface IdentitiesDataTableProps {
  data: Identity[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onRowClick: (identity: Identity) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const IdentitiesDataTable = React.memo(function IdentitiesDataTable({
  data,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onRowClick,
  isLoading = false,
  error = null
}: IdentitiesDataTableProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRelativeTime = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow 
                className="border-b hover:bg-transparent"
                style={{ 
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)',
                  height: '44px'
                }}
              >
                <TableHead className="sticky left-0 z-10" style={{ 
                  backgroundColor: 'var(--surface)',
                  boxShadow: '0 0 0 0 transparent',
                  width: '48px',
                  minWidth: '48px',
                  maxWidth: '48px'
                }}>
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead className="sticky z-10" style={{ 
                  backgroundColor: 'var(--surface)', 
                  left: '48px',
                  width: '280px',
                  minWidth: '280px',
                  maxWidth: '280px',
                  boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)'
                }}>User</TableHead>
                <TableHead style={{ minWidth: '140px' }}>Department</TableHead>
                <TableHead style={{ minWidth: '140px' }}>Manager</TableHead>
                <TableHead style={{ minWidth: '110px' }}>Status</TableHead>
                <TableHead style={{ minWidth: '110px' }}>Risk</TableHead>
                <TableHead style={{ minWidth: '80px' }}>Roles</TableHead>
                <TableHead style={{ minWidth: '140px' }}>Last Login</TableHead>
                <TableHead style={{ minWidth: '120px' }}>
                  <div className="flex items-center gap-1.5">
                    <span>Flags</span>
                    <Info className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} style={{ height: '48px' }}>
                  <TableCell className="sticky left-0 z-10" style={{ 
                    backgroundColor: 'var(--surface)',
                    boxShadow: '0 0 0 0 transparent',
                    width: '48px',
                    minWidth: '48px',
                    maxWidth: '48px'
                  }}>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="sticky z-10" style={{ 
                    backgroundColor: 'var(--surface)',
                    left: '48px',
                    width: '280px',
                    minWidth: '280px',
                    maxWidth: '280px',
                    boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="rounded-lg border p-12 text-center"
        style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)'
        }}
      >
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--danger)' }} />
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text)',
          marginBottom: '8px'
        }}>
          Error Loading Identities
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          {error}
        </p>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div 
        className="rounded-lg border p-12 text-center"
        style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)'
        }}
      >
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" 
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <svg className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text)',
          marginBottom: '8px'
        }}>
          No identities found
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  // Data table
  return (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{ 
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow 
              className="border-b hover:bg-transparent"
              style={{ 
                borderColor: 'var(--border)',
                backgroundColor: 'var(--surface)',
                height: '44px'
              }}
            >
              <TableHead className="sticky left-0 z-10" style={{ 
                backgroundColor: 'var(--surface)',
                boxShadow: '0 0 0 0 transparent',
                width: '48px',
                minWidth: '48px',
                maxWidth: '48px'
              }}>
                <Checkbox
                  checked={selectedIds.size === data.length && data.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all identities"
                />
              </TableHead>
              <TableHead className="sticky z-10" style={{ 
                backgroundColor: 'var(--surface)', 
                left: '48px',
                width: '280px',
                minWidth: '280px',
                maxWidth: '280px',
                boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)'
              }}>User</TableHead>
              <TableHead style={{ minWidth: '140px' }}>Department</TableHead>
              <TableHead style={{ minWidth: '140px' }}>Manager</TableHead>
              <TableHead style={{ minWidth: '110px' }}>Status</TableHead>
              <TableHead style={{ minWidth: '110px' }}>Risk</TableHead>
              <TableHead style={{ minWidth: '80px' }}>Roles</TableHead>
              <TableHead style={{ minWidth: '140px' }}>Last Login</TableHead>
              <TableHead style={{ minWidth: '120px' }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 cursor-help">
                        <span>Flags</span>
                        <Info className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p style={{ fontSize: 'var(--text-xs)' }}>
                        Active governance issues: SoD conflicts and access anomalies
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((identity) => {
              const isDormant = identity.lastLoginDays > 30;
              const totalIssues = (identity.issues?.sodConflicts || 0) + (identity.issues?.anomalies || 0);
              
              return (
                <TableRow
                  key={identity.id}
                  onClick={() => onRowClick(identity)}
                  className="cursor-pointer transition-colors duration-150 border-b group"
                  style={{ 
                    borderColor: 'var(--border)',
                    height: '48px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent)';
                    // Update sticky cell backgrounds on hover
                    const stickyCells = e.currentTarget.querySelectorAll('.sticky-cell');
                    stickyCells.forEach((cell: Element) => {
                      (cell as HTMLElement).style.backgroundColor = 'var(--accent)';
                    });
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    // Reset sticky cell backgrounds
                    const stickyCells = e.currentTarget.querySelectorAll('.sticky-cell');
                    stickyCells.forEach((cell: Element) => {
                      (cell as HTMLElement).style.backgroundColor = 'var(--surface)';
                    });
                  }}
                >
                  <TableCell 
                    onClick={(e) => e.stopPropagation()} 
                    className="sticky left-0 z-10 sticky-cell" 
                    style={{ 
                      backgroundColor: 'var(--surface)',
                      boxShadow: '0 0 0 0 transparent',
                      width: '48px',
                      minWidth: '48px',
                      maxWidth: '48px'
                    }}
                  >
                    <Checkbox
                      checked={selectedIds.has(identity.id)}
                      onCheckedChange={(checked) => onSelectRow(identity.id, checked as boolean)}
                      aria-label={`Select ${identity.name}`}
                    />
                  </TableCell>
                  <TableCell 
                    className="sticky z-10 sticky-cell" 
                    style={{ 
                      backgroundColor: 'var(--surface)',
                      left: '48px',
                      width: '280px',
                      minWidth: '280px',
                      maxWidth: '280px',
                      boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border" style={{ borderColor: 'var(--border)' }}>
                        <AvatarFallback style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)'
                        }}>
                          {getInitials(identity.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div style={{ 
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {identity.name}
                        </div>
                        <div style={{ 
                          fontSize: 'var(--text-xs)',
                          color: 'var(--muted-foreground)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {identity.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                      {identity.department}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                      {identity.manager}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={identity.status} size="sm" />
                  </TableCell>
                  <TableCell>
                    <RiskChip risk={identity.risk} size="sm" withTooltip />
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--text)'
                    }}>
                      {identity.roles}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                        {getRelativeTime(identity.lastLoginDays)}
                      </span>
                      {isDormant && (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: 'var(--warning-bg)',
                            borderColor: 'var(--warning-border)',
                            color: 'var(--warning)',
                            fontSize: 'var(--text-xs)'
                          }}
                        >
                          Dormant
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {totalIssues > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 cursor-help">
                              <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                              <span style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: 'var(--warning)'
                              }}>
                                {totalIssues}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <div className="space-y-1" style={{ fontSize: 'var(--text-xs)' }}>
                              {identity.issues?.sodConflicts ? (
                                <div>
                                  <strong>{identity.issues.sodConflicts}</strong> SoD conflict{identity.issues.sodConflicts > 1 ? 's' : ''}
                                </div>
                              ) : null}
                              {identity.issues?.anomalies ? (
                                <div>
                                  <strong>{identity.issues.anomalies}</strong> anomal{identity.issues.anomalies > 1 ? 'ies' : 'y'}
                                </div>
                              ) : null}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRowClick(identity)}
                      aria-label={`View ${identity.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});