/**
 * ManagedAccountsTable - Lean table design for connector accounts
 * 
 * Design Philosophy:
 * - Keep the table horizontal-scroll-free with 5 core columns
 * - Show ALL attributes in detail drawer when row is clicked
 * - Column picker available for power users who need specific attributes visible
 * 
 * Default Columns: Email/UPN, Identity, Status, Last Sync, Groups/Roles
 */

import { useState, useMemo } from 'react';
import { Search, Download, Filter, MoreVertical } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ColumnPicker } from './ColumnPicker';
import { LinkStatusChip } from './LinkStatusChip';
import { AttributesPeekPopover } from './AttributesPeekPopover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Account, ColumnPreset, AccountStatus, LinkStatus } from '../data/managed-accounts';

interface ManagedAccountsTableProps {
  accounts: Account[];
  availableAttributes: string[];
  columnPresets?: ColumnPreset[];
  onAccountClick: (account: Account) => void;
  onLinkClick: (account: Account) => void;
}

export function ManagedAccountsTable({
  accounts,
  availableAttributes,
  columnPresets = [],
  onAccountClick,
  onLinkClick,
}: ManagedAccountsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
  const [linkFilter, setLinkFilter] = useState<LinkStatus | 'all'>('all');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showExtraColumns, setShowExtraColumns] = useState(false);

  // Core columns that are always visible - lean approach
  const coreColumns = [
    { key: 'email', label: 'Email/UPN', width: 'min-w-[200px]' },
    { key: 'identity', label: 'Identity', width: 'min-w-[200px]' },
    { key: 'status', label: 'Status', width: 'min-w-[110px]' },
    { key: 'lastSyncAt', label: 'Last Sync', width: 'min-w-[120px]' },
    { key: 'groupsCount', label: 'Groups/Roles', width: 'min-w-[120px]' },
  ];

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          account.username?.toLowerCase().includes(searchLower) ||
          account.email?.toLowerCase().includes(searchLower) ||
          account.sourceKey.toLowerCase().includes(searchLower) ||
          account.identity?.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && account.status !== statusFilter) {
        return false;
      }

      // Link status filter
      if (linkFilter !== 'all' && account.linkStatus !== linkFilter) {
        return false;
      }

      return true;
    });
  }, [accounts, search, statusFilter, linkFilter]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: AccountStatus) => {
    const variants = {
      Active: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      Disabled: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      Orphaned: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      Pending: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };

    return (
      <Badge variant="outline" className={`text-xs ${variants[status]}`}>
        {status}
      </Badge>
    );
  };

  const handleExport = () => {
    // Export filtered accounts to CSV with all attributes
    const headers = [
      'Email/UPN',
      'Identity',
      'Status',
      'Last Sync',
      'Groups/Roles',
      ...(showExtraColumns ? selectedColumns : []),
      // Add all attribute keys if not showing extra columns
      ...(!showExtraColumns ? Object.keys(accounts[0]?.attributes || {}) : []),
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredAccounts.map((acc) => {
        const baseFields = [
          acc.email || '',
          acc.identity?.name || '',
          acc.status,
          acc.lastSyncAt,
          acc.groupsCount,
        ];
        
        if (showExtraColumns) {
          return [...baseFields, ...selectedColumns.map((col) => formatValue(acc.attributes[col]))].join(',');
        } else {
          // Export all attributes
          const allAttrValues = Object.keys(accounts[0]?.attributes || {}).map((key) => 
            formatValue(acc.attributes[key])
          );
          return [...baseFields, ...allAttrValues].join(',');
        }
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted)' }}
          />
          <Input
            placeholder="Search by username, email, source ID, or identity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Disabled">Disabled</SelectItem>
              <SelectItem value="Orphaned">Orphaned</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={linkFilter} onValueChange={(v: any) => setLinkFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Link Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Links</SelectItem>
              <SelectItem value="Linked">Linked</SelectItem>
              <SelectItem value="Unlinked">Unlinked</SelectItem>
              <SelectItem value="Ambiguous">Ambiguous</SelectItem>
            </SelectContent>
          </Select>

          <ColumnPicker
            availableColumns={availableAttributes}
            selectedColumns={selectedColumns}
            onColumnsChange={(cols) => {
              setSelectedColumns(cols);
              setShowExtraColumns(cols.length > 0);
            }}
            presets={columnPresets}
          />

          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </div>
        {showExtraColumns && selectedColumns.length > 0 && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Displaying {selectedColumns.length} additional column{selectedColumns.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-xl border"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <table className="min-w-full text-sm">
          <thead
            className="sticky top-0 backdrop-blur-sm"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {coreColumns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 font-medium ${col.width}`}
                  style={{ color: 'var(--muted)' }}
                >
                  {col.label}
                </th>
              ))}
              {showExtraColumns && selectedColumns.map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 font-mono font-medium min-w-[160px]"
                  style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}
                >
                  {col}
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account, idx) => (
              <tr
                key={account.id}
                onClick={() => onAccountClick(account)}
                className="border-t cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Email */}
                <td className="px-4 py-3">
                  <div style={{ color: 'var(--text)', fontWeight: 500 }}>
                    {account.email || account.username || '—'}
                  </div>
                  {account.username && account.email && account.username !== account.email && (
                    <div style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>
                      {account.username}
                    </div>
                  )}
                </td>

                {/* Identity */}
                <td className="px-4 py-3">
                  {account.identity ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback
                          className="text-xs"
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--primary-foreground)',
                          }}
                        >
                          {account.identity.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className="font-medium"
                          style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                        >
                          {account.identity.name}
                        </div>
                        <LinkStatusChip status="Linked" />
                      </div>
                    </div>
                  ) : (
                    <LinkStatusChip
                      status={account.linkStatus}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLinkClick(account);
                      }}
                    />
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">{getStatusBadge(account.status)}</td>

                {/* Last Sync */}
                <td className="px-4 py-3">
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {formatDate(account.lastSyncAt)}
                  </div>
                </td>

                {/* Groups Count */}
                <td className="px-4 py-3">
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                    {account.groupsCount}
                  </div>
                </td>

                {/* Dynamic attribute columns (only shown when column picker is used) */}
                {showExtraColumns && selectedColumns.map((col) => (
                  <td key={col} className="px-4 py-3">
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {formatValue(account.attributes[col])}
                    </div>
                  </td>
                ))}

                {/* Actions */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end"
                      collisionPadding={20}
                      collisionBoundary={typeof window !== 'undefined' ? document.body : undefined}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onAccountClick(account);
                      }}>
                        View Details
                      </DropdownMenuItem>
                      {!account.identity && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onLinkClick(account);
                        }}>
                          Link to Identity
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAccounts.length === 0 && (
          <div
            className="text-center py-12"
            style={{ fontSize: 'var(--text-body)', color: 'var(--muted)' }}
          >
            No accounts found
          </div>
        )}
      </div>
    </div>
  );
}
