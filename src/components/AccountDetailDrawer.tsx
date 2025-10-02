import { useState } from 'react';
import { X, Link2, Copy, User, FileJson, Activity, GitBranch } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { KeyValueGrid } from './KeyValueGrid';
import { JSONViewer } from './JSONViewer';
import { LinkStatusChip } from './LinkStatusChip';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import type { Account } from '../data/managed-accounts';

interface AccountDetailDrawerProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkClick: (account: Account) => void;
}

export function AccountDetailDrawer({
  account,
  open,
  onOpenChange,
  onLinkClick,
}: AccountDetailDrawerProps) {
  const [currentTab, setCurrentTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'json'>('grid');

  if (!account) return null;

  const coreAttributes = {
    username: account.username,
    email: account.email,
    sourceKey: account.sourceKey,
    status: account.status,
    lastLoginAt: account.lastLoginAt || 'Never',
    lastSyncAt: account.lastSyncAt,
    groupsCount: account.groupsCount,
  };

  // Mock mapping data
  const attributeMappings = [
    {
      sourceAttribute: 'userPrincipalName',
      targetField: 'email',
      sourceValue: account.attributes.userPrincipalName || account.email,
      targetValue: account.identity?.email,
      status: account.identity?.email === (account.attributes.userPrincipalName || account.email) ? 'matched' : 'mismatched',
    },
    {
      sourceAttribute: 'displayName',
      targetField: 'fullName',
      sourceValue: account.attributes.displayName,
      targetValue: account.identity?.name,
      status: 'matched',
    },
    {
      sourceAttribute: 'mail',
      targetField: 'primaryEmail',
      sourceValue: account.attributes.mail || account.email,
      targetValue: account.identity?.email,
      status: 'matched',
    },
    {
      sourceAttribute: 'employeeId',
      targetField: 'employeeNumber',
      sourceValue: account.attributes.employeeId,
      targetValue: account.attributes.employeeId,
      status: 'matched',
    },
  ];

  // Mock activity data
  const activities = [
    {
      id: '1',
      timestamp: '2025-10-01T14:32:00Z',
      type: 'sync',
      description: 'Account synchronized from connector',
      details: 'Updated 3 attributes',
    },
    {
      id: '2',
      timestamp: '2025-10-01T09:15:00Z',
      type: 'login',
      description: 'User logged in',
      details: 'IP: 192.168.1.100',
    },
    {
      id: '3',
      timestamp: '2025-09-30T10:00:00Z',
      type: 'provision',
      description: 'Added to security group',
      details: 'Group: Engineering-All',
    },
    {
      id: '4',
      timestamp: '2025-09-28T15:30:00Z',
      type: 'update',
      description: 'Profile updated',
      details: 'Department changed: Product → Engineering',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      Disabled: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      Orphaned: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      Pending: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    };

    return (
      <Badge variant="outline" className={`text-xs ${variants[status] || variants.Pending}`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Never') return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sync':
        return <Copy className="w-4 h-4" />;
      case 'login':
        return <User className="w-4 h-4" />;
      case 'provision':
        return <Link2 className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <SheetTitle
            className="mb-2"
            style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}
          >
            {account.username || account.email}
          </SheetTitle>
          <SheetDescription className="sr-only">
            View and manage account details including attributes, mappings, and activity for {account.username || account.email}
          </SheetDescription>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {getStatusBadge(account.status)}
                <span
                  className="font-mono"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                >
                  {account.sourceKey}
                </span>
              </div>

              {/* Identity Link Status */}
              {account.identity ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
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
                  <div className="flex-1">
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>
                      {account.identity.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      {account.identity.email}
                    </div>
                  </div>
                  <LinkStatusChip status="Linked" />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>
                      Not Linked to Identity
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      Link this account to track access
                    </div>
                  </div>
                  <LinkStatusChip status={account.linkStatus} onClick={() => onLinkClick(account)} />
                </div>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="border-b px-6 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-0">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none px-4 py-3">
                Overview
              </TabsTrigger>
              <TabsTrigger value="attributes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none px-4 py-3">
                Attributes
              </TabsTrigger>
              <TabsTrigger value="mappings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none px-4 py-3">
                Mappings
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none px-4 py-3">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6">
              <div>
                <h3
                  className="mb-4"
                  style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}
                >
                  Core Information
                </h3>
                <KeyValueGrid data={coreAttributes} columns={2} maskSecrets={false} />
              </div>

              {account.attributes.department && (
                <div>
                  <h3
                    className="mb-4"
                    style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}
                  >
                    Organization
                  </h3>
                  <KeyValueGrid
                    data={{
                      department: account.attributes.department,
                      jobTitle: account.attributes.jobTitle,
                      officeLocation: account.attributes.officeLocation,
                      manager: account.attributes.managerName || account.attributes.managerID,
                    }}
                    columns={2}
                    maskSecrets={false}
                  />
                </div>
              )}
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent value="attributes" className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3
                  style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}
                >
                  All Attributes ({Object.keys(account.attributes).length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('json')}
                    className="gap-2"
                  >
                    <FileJson className="w-4 h-4" />
                    JSON
                  </Button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <KeyValueGrid data={account.attributes} columns={3} searchable />
              ) : (
                <div className="space-y-3">
                  <div
                    className="text-xs px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--info-bg)',
                      borderColor: 'var(--info-border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Secrets and credentials are masked in Grid view for security
                  </div>
                  <JSONViewer data={account.attributes} />
                </div>
              )}
            </TabsContent>

            {/* Mappings Tab */}
            <TabsContent value="mappings" className="p-6 space-y-4">
              <div>
                <h3
                  className="mb-2"
                  style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}
                >
                  Attribute Mappings
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  How connector attributes map to identity profile fields
                </p>
              </div>

              <div className="space-y-3">
                {attributeMappings.map((mapping, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start gap-3">
                      <GitBranch className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: 'var(--muted)' }} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono"
                              style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                            >
                              {mapping.sourceAttribute}
                            </span>
                            <span style={{ color: 'var(--muted)' }}>→</span>
                            <span
                              className="font-medium"
                              style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                            >
                              {mapping.targetField}
                            </span>
                          </div>
                          {mapping.status === 'matched' ? (
                            <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                              Matched
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                              Mismatch
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>
                              Source Value
                            </div>
                            <div
                              className="font-mono px-2 py-1 rounded"
                              style={{ backgroundColor: 'var(--bg)', fontSize: 'var(--text-xs)', color: 'var(--text)' }}
                            >
                              {mapping.sourceValue || '—'}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>
                              Target Value
                            </div>
                            <div
                              className="font-mono px-2 py-1 rounded"
                              style={{ backgroundColor: 'var(--bg)', fontSize: 'var(--text-xs)', color: 'var(--text)' }}
                            >
                              {mapping.targetValue || '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="p-6 space-y-4">
              <div>
                <h3
                  className="mb-2"
                  style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)' }}
                >
                  Recent Activity
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  Last 30 days of provisioning events and usage
                </p>
              </div>

              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-3 rounded-lg border"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-medium mb-1"
                        style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                      >
                        {activity.description}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        {activity.details}
                      </div>
                      <div
                        className="mt-1"
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                      >
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
