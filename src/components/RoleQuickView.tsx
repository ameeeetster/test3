import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RiskChip } from './RiskChip';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from './ui/drawer';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Users,
  Package,
  AlertTriangle,
  Shield,
  Copy,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Edit,
  UserPlus,
  Calendar,
  Download,
  XCircle,
  Eye,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Activity,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface RoleQuickViewProps {
  role: {
    id: string;
    name: string;
    description: string;
    owner: { name: string; avatar: string };
    members: number;
    applications: string[];
    risk: 'Low' | 'Medium' | 'High';
    sodConflicts: number;
    updated: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onAddMember: () => void;
  onStartReview: () => void;
  onExport?: () => void;
  onDisable?: () => void;
}

// Mock data for enhanced features
const getMockRoleData = (roleId: string) => ({
  status: 'Active',
  tags: ['Finance', 'Privileged'],
  isPrivileged: true,
  riskScore: 72,
  riskReason: 'Contains high-risk entitlements with financial impact',
  topEntitlements: [
    { id: 'E-1', name: 'AP Write', icon: '💰', app: 'Procurement', lastUsedPercent: 95, risk: 'High' as const },
    { id: 'E-2', name: 'Payment Approval', icon: '✓', app: 'QuickBooks', lastUsedPercent: 87, risk: 'High' as const },
    { id: 'E-3', name: 'GL Modify', icon: '📊', app: 'Treasury', lastUsedPercent: 62, risk: 'Medium' as const },
  ],
  sodConflictDetails: {
    pair: 'AP Write × Payment Approver',
    affectedUsers: 3,
  },
  recentChanges: [
    { type: 'add', description: 'Added 2 members', time: '2h ago', icon: UserPlus },
    { type: 'risk', description: 'Risk increased from 68 to 72', time: '1d ago', icon: TrendingUp },
    { type: 'remove', description: 'Removed 1 entitlement', time: '2d ago', icon: XCircle },
  ],
  aiSuggestions: [
    {
      id: 'ai-1',
      title: 'Remove seldom-used entitlement',
      description: 'GL Modify has only 2% usage in last 90 days',
      confidence: 92,
      applied: false,
    },
    {
      id: 'ai-2',
      title: 'Split role by organization',
      description: 'Members span 3 different departments',
      confidence: 78,
      applied: false,
    },
  ],
  metrics: {
    membersChange: +2,
    appsChange: 0,
    sodChange: -1,
  },
});

export function RoleQuickView({
  role,
  open,
  onOpenChange,
  onViewDetails,
  onEdit,
  onAddMember,
  onStartReview,
  onExport,
  onDisable,
}: RoleQuickViewProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([]);

  if (!role) return null;

  const mockData = getMockRoleData(role.id);

  const handleCopyId = () => {
    navigator.clipboard.writeText(role.id);
    setCopiedId(true);
    toast.success('Role ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions([...appliedSuggestions, suggestionId]);
    toast.success('Suggestion applied');
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent 
        className="max-h-[90vh]" 
        onKeyDown={handleKeyDown}
      >
        {/* Visually hidden title and description for accessibility */}
        <DrawerTitle className="sr-only">
          Role Quick View: {role.name}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Quick overview and actions for {role.name}
        </DrawerDescription>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Header - Two Rows */}
          <header className="px-6 pt-4 pb-2.5 space-y-2.5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          {/* Row 1: Title, Owner, Risk, Status, Updated */}
          <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  className="mr-2"
                  style={{
                    fontSize: 'var(--text-lg)',
                    lineHeight: 'var(--line-height-snug)',
                  }}
                >
                  {role.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className="gap-1.5 h-6"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Users className="w-3 h-3" />
                  {role.owner.name}
                </Badge>
                <RiskChip risk={role.risk} />
                <Badge 
                  className="h-6"
                  style={{ 
                    backgroundColor: 'var(--success-bg)', 
                    color: 'var(--success)',
                    borderColor: 'var(--success-border)'
                  }}
                >
                  {mockData.status}
                </Badge>
                <span 
                  className="ml-auto text-xs"
                  style={{ color: 'var(--muted)' }}
                >
                  Updated {role.updated}
                </span>
              </div>

              {/* Row 2: Description, Tags, Copy ID */}
              <div className="flex items-center gap-2 flex-wrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="line-clamp-1">{role.description}</span>
                <div className="flex items-center gap-1.5 ml-2">
                  {mockData.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="h-5 text-xs"
                      style={{ backgroundColor: 'var(--surface)' }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <button
                  onClick={handleCopyId}
                  className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  style={{ color: 'var(--muted)' }}
                  aria-label="Copy role ID"
                >
                  {copiedId ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" style={{ color: 'var(--success)' }} />
                      <span style={{ color: 'var(--success)' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      ID: {role.id}
                    </>
                  )}
                </button>
              </div>

              {/* Applied AI Pills */}
              {appliedSuggestions.length > 0 && (
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Applied:</span>
                  {appliedSuggestions.map((sugId) => {
                    const suggestion = mockData.aiSuggestions.find(s => s.id === sugId);
                    return (
                      <Badge 
                        key={sugId} 
                        className="h-5 text-xs gap-1"
                        style={{ 
                          backgroundColor: 'var(--info-bg)', 
                          color: 'var(--info)',
                          borderColor: 'var(--info-border)'
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        {suggestion?.title.split(' ').slice(0, 3).join(' ')}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </header>

            {/* KPI Strip - Compact One-Line Stats */}
            <section 
              className="grid grid-cols-5 gap-2.5 px-6 py-3 border-b flex-shrink-0" 
              style={{ borderColor: 'var(--border)' }}
            >
              <StatTile
                label="Members"
                value={role.members}
                delta={mockData.metrics.membersChange}
                icon={Users}
                color="var(--primary)"
              />
              <StatTile
                label="Apps"
                value={role.applications.length}
                delta={mockData.metrics.appsChange}
                icon={Package}
                color="var(--info)"
              />
              <StatTile
                label="SoD Conflicts"
                value={role.sodConflicts}
                delta={mockData.metrics.sodChange}
                icon={AlertTriangle}
                color="var(--warning)"
              />
              <div 
                className="flex flex-col justify-center px-3 py-2 rounded-lg border"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>Privileged?</div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>
                    {mockData.isPrivileged ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex flex-col justify-center px-3 py-2 rounded-lg border cursor-help"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center gap-1 text-xs mb-0.5" style={{ color: 'var(--muted)' }}>
                        Risk Score
                        <HelpCircle className="w-3 h-3" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>
                          {mockData.riskScore}/100
                        </span>
                        <Progress value={mockData.riskScore} className="h-1.5 flex-1" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-xs">{mockData.riskReason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          </section>

          {/* Main Content - Grid Layout with Scroll */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-6 py-3 pb-3">
                {/* Composition Preview */}
                <ContentCard title="Composition" icon={Package}>
                  <div className="space-y-1.5">
                  {mockData.topEntitlements.map((ent) => (
                    <div
                      key={ent.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg border transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="text-base">{ent.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate" style={{ color: 'var(--text)' }}>
                            {ent.name}
                          </span>
                          <RiskChip risk={ent.risk} />
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          {ent.app} · Used {ent.lastUsedPercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 mt-1"
                    style={{ color: 'var(--primary)' }}
                    onClick={onViewDetails}
                  >
                    View all entitlements
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </ContentCard>

              {/* SoD Preview */}
              <ContentCard title="SoD Conflicts" icon={AlertTriangle} iconColor="var(--warning)">
                {role.sodConflicts > 0 ? (
                  <div className="space-y-2.5">
                    <div
                      className="p-2.5 rounded-lg border"
                      style={{ 
                        backgroundColor: 'var(--warning-bg)', 
                        borderColor: 'var(--warning-border)' 
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: 'var(--warning)' }} />
                        <div className="flex-1">
                          <div className="text-sm" style={{ color: 'var(--text)' }}>
                            {mockData.sodConflictDetails.pair}
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                            Affects {mockData.sodConflictDetails.affectedUsers} user{mockData.sodConflictDetails.affectedUsers !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => toast.info('Opening SoD conflicts...')}
                    >
                      <Eye className="w-4 h-4" />
                      Review conflicts
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <CheckCircle2 className="w-7 h-7 mb-1.5" style={{ color: 'var(--success)' }} />
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      No SoD conflicts detected
                    </p>
                  </div>
                )}
              </ContentCard>

              {/* Recent Changes */}
              <ContentCard title="Recent Changes (7d)" icon={Activity}>
                <div className="space-y-1.5">
                  {mockData.recentChanges.map((change, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-1.5 rounded-md"
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: 'var(--surface)' }}
                      >
                        <change.icon className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: 'var(--text)' }}>
                          {change.description}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          {change.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-md transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 mt-1"
                    style={{ color: 'var(--primary)' }}
                    onClick={() => toast.info('Opening audit log...')}
                  >
                    View full audit log
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </ContentCard>

              {/* AI Suggestions */}
              <ContentCard title="AI Suggestions" icon={Sparkles} iconColor="var(--primary)">
                <div className="space-y-2">
                  {mockData.aiSuggestions.map((suggestion) => {
                    const isApplied = appliedSuggestions.includes(suggestion.id);
                    return (
                      <div
                        key={suggestion.id}
                        className="p-2.5 rounded-lg border"
                        style={{ 
                          backgroundColor: isApplied ? 'var(--info-bg)' : 'var(--surface)', 
                          borderColor: isApplied ? 'var(--info-border)' : 'var(--border)' 
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex-1">
                            <div className="text-sm mb-0.5" style={{ color: 'var(--text)' }}>
                              {suggestion.title}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--muted)' }}>
                              {suggestion.description}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="h-5 text-xs shrink-0"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {suggestion.confidence}%
                          </Badge>
                        </div>
                        {!isApplied && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs"
                            onClick={() => handleApplySuggestion(suggestion.id)}
                          >
                            Apply
                          </Button>
                        )}
                        {isApplied && (
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--info)' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Applied
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ContentCard>
            </div>
          </div>

          {/* Sticky Footer with Actions */}
          <footer
            className="border-t backdrop-blur-sm p-2.5 flex flex-wrap gap-2 bg-white/80 dark:bg-slate-950/80 flex-shrink-0"
            style={{ 
              borderColor: 'var(--border)',
            }}
            role="group"
            aria-label="Role actions"
          >
              <Button onClick={onEdit} size="sm" className="flex-1 min-w-[120px]">
                <Edit className="w-4 h-4 mr-2" />
                Edit Role
              </Button>
              <Button variant="outline" onClick={onAddMember} size="sm" className="flex-1 min-w-[120px]">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
              <Button variant="outline" onClick={onStartReview} size="sm" className="flex-1 min-w-[120px]">
                <Calendar className="w-4 h-4 mr-2" />
                Start Review
              </Button>
              <div className="flex gap-2 ml-auto">
                {onExport && (
                  <Button variant="outline" onClick={onExport} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
                {onDisable && (
                  <Button 
                    variant="outline" 
                    onClick={onDisable}
                    size="sm"
                    className="border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Disable
                  </Button>
                )}
              </div>
          </footer>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Helper Components
function StatTile({ 
  label, 
  value, 
  delta, 
  icon: Icon, 
  color 
}: { 
  label: string; 
  value: number; 
  delta: number; 
  icon: React.ElementType; 
  color: string;
}) {
  return (
    <div 
      className="flex flex-col justify-center px-2.5 py-1.5 rounded-lg border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="flex items-center gap-1.5">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="font-semibold" style={{ color: 'var(--text)' }}>{value}</span>
        {delta !== 0 && (
          <span 
            className="text-xs flex items-center gap-0.5"
            style={{ color: delta > 0 ? 'var(--success)' : 'var(--danger)' }}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(delta)}
          </span>
        )}
      </div>
    </div>
  );
}

function ContentCard({
  title,
  icon: Icon,
  iconColor = 'var(--text)',
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div 
      className="p-3 rounded-lg border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        <h4 className="text-sm" style={{ color: 'var(--text)' }}>
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}