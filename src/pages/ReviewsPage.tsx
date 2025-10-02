import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Download, Search, Filter, Grid3x3, List, Calendar, Users, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ReviewKPICard } from '../components/reviews/ReviewKPICard';
import { CampaignCard } from '../components/reviews/CampaignCard';
import { RiskChip } from '../components/RiskChip';
import { Progress } from '../components/ui/progress';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner@2.0.3';

const mockMyTasks = [
  {
    id: '1',
    subject: 'Jessica Smith',
    department: 'Finance',
    itemCount: 12,
    risk: 'High' as const,
    campaign: 'Q1 2025 User Access Review',
    dueDate: '2025-10-05',
    progress: 58,
  },
  {
    id: '2',
    subject: 'Michael Chen',
    department: 'Engineering',
    itemCount: 8,
    risk: 'Medium' as const,
    campaign: 'Q1 2025 User Access Review',
    dueDate: '2025-10-05',
    progress: 75,
  },
  {
    id: '3',
    subject: 'Sarah Johnson',
    department: 'Operations',
    itemCount: 5,
    risk: 'Low' as const,
    campaign: 'Q1 2025 User Access Review',
    dueDate: '2025-10-05',
    progress: 100,
  },
];

const mockCampaigns = [
  {
    id: '1',
    name: 'Q1 2025 User Access Review',
    type: 'User' as const,
    scope: 'All departments',
    itemCount: 1247,
    reviewerCount: 24,
    status: 'Active' as const,
    progress: 67,
    dueDate: 'Oct 5, 2025',
    riskCount: 34,
  },
  {
    id: '2',
    name: 'Salesforce Access Review',
    type: 'Application' as const,
    scope: 'Salesforce users',
    itemCount: 456,
    reviewerCount: 8,
    status: 'Active' as const,
    progress: 42,
    dueDate: 'Oct 12, 2025',
    riskCount: 12,
  },
  {
    id: '3',
    name: 'Privileged Access Review',
    type: 'Privileged' as const,
    scope: 'Elevated permissions',
    itemCount: 89,
    reviewerCount: 3,
    status: 'Overdue' as const,
    progress: 23,
    dueDate: 'Sep 28, 2025',
    riskCount: 28,
  },
  {
    id: '4',
    name: 'Annual Role Certification',
    type: 'Role' as const,
    scope: 'All business roles',
    itemCount: 234,
    reviewerCount: 12,
    status: 'Completed' as const,
    progress: 100,
    dueDate: 'Sep 15, 2025',
    riskCount: 0,
  },
];

export function ReviewsPage() {
  const navigate = useNavigate();
  const { currentRole } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(currentRole === 'end-user' ? 'my-tasks' : 'campaigns');

  const isAdmin = currentRole === 'administrator';
  const isApprover = currentRole === 'approver';

  // Keyboard shortcut: C to create campaign
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (isAdmin || isApprover) {
            navigate('/reviews/new');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate, isAdmin, isApprover]);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-display">Access Reviews</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create and manage periodic access review campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {(isAdmin || isApprover) && (
              <Button onClick={() => navigate('/reviews/new')} size="default" className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/20 text-xs font-mono">C</kbd>
              </Button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReviewKPICard
            title="My Pending"
            value={isAdmin ? '—' : 3}
            delta={isAdmin ? undefined : { value: 25, trend: 'down' }}
            sparkline={[12, 8, 15, 10, 6, 3]}
            variant="warning"
          />
          <ReviewKPICard
            title="Active Campaigns"
            value={isAdmin ? 3 : 1}
            delta={{ value: 50, trend: 'up' }}
            sparkline={[2, 2, 1, 2, 3, 3]}
          />
          <ReviewKPICard
            title="Due in 7 Days"
            value={isAdmin ? 1247 : 25}
            delta={{ value: 12, trend: 'up' }}
            sparkline={[800, 900, 1000, 1100, 1200, 1247]}
            variant="warning"
          />
          <ReviewKPICard
            title="AI-Flagged Risks"
            value={isAdmin ? 74 : 8}
            delta={{ value: 18, trend: 'down' }}
            sparkline={[120, 110, 95, 88, 79, 74]}
            variant="danger"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger value="my-tasks" className="flex-1 lg:flex-none">
              <Users className="w-4 h-4 mr-2" />
              My Tasks
              {!isAdmin && (
                <Badge variant="secondary" className="ml-2">
                  3
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex-1 lg:flex-none">
              <Calendar className="w-4 h-4 mr-2" />
              Campaigns
              {isAdmin && (
                <Badge variant="secondary" className="ml-2">
                  3 Active
                </Badge>
              )}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="templates" className="flex-1 lg:flex-none">
                <Grid3x3 className="w-4 h-4 mr-2" />
                Templates
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full lg:w-64"
              />
            </div>
            <Button variant="outline" size="default">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* My Tasks Tab */}
        <TabsContent value="my-tasks" className="mt-0">
          <MyTasksView tasks={mockMyTasks} onOpenWorkbench={(taskId) => navigate(`/reviews/campaign-1/workbench`)} />
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-0">
          <CampaignsView
            campaigns={mockCampaigns}
            onViewCampaign={(id) => navigate(`/reviews/${id}/workbench`)}
          />
        </TabsContent>

        {/* Templates Tab */}
        {isAdmin && (
          <TabsContent value="templates" className="mt-0">
            <TemplatesView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function MyTasksView({ tasks, onOpenWorkbench }: { tasks: any[]; onOpenWorkbench: (id: string) => void }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-white dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-white/5 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Subject</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Items</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Risk</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Campaign</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300">Progress</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-300"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-border last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 cursor-pointer"
                onClick={() => onOpenWorkbench(task.id)}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{task.subject}</div>
                    <div className="text-sm text-slate-500">{task.department}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{task.itemCount} items</Badge>
                </td>
                <td className="px-6 py-4">
                  <RiskChip risk={task.risk} size="sm" />
                </td>
                <td className="px-6 py-4 text-sm">{task.campaign}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{task.dueDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-[100px]">
                      <Progress value={task.progress} className="h-2" />
                    </div>
                    <span className="text-sm font-medium min-w-[40px] text-right">{task.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Button variant="ghost" size="sm">
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="p-12 text-center text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No pending review tasks</p>
        </div>
      )}
    </div>
  );
}

function CampaignsView({ campaigns, onViewCampaign }: { campaigns: any[]; onViewCampaign: (id: string) => void }) {
  const navigate = useNavigate();

  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="max-w-md text-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/20">
            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl mb-2" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
            No campaigns yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first access review campaign to certify user permissions, validate role assignments, and ensure compliance.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/reviews/new')} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button variant="outline" size="lg">
              <Upload className="w-4 h-4 mr-2" />
              Import Campaign
            </Button>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-border text-left">
            <h4 className="text-sm font-medium mb-2">Quick start</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Choose review type (User, Application, Role, or Privileged)</li>
              <li>• Define scope and select reviewers</li>
              <li>• Set schedule and enable AI assistance</li>
              <li>• Launch and track progress in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          {...campaign}
          onClick={() => onViewCampaign(campaign.id)}
          onEdit={() => {}}
          onDelete={() => {}}
          onRemind={() => {}}
        />
      ))}
    </div>
  );
}

function TemplatesView() {
  const templates = [
    {
      id: '1',
      name: 'Quarterly User Access Review',
      description: 'Review all user access across departments',
      frequency: 'Quarterly',
      lastUsed: 'Sep 15, 2025',
    },
    {
      id: '2',
      name: 'Annual Privileged Access Certification',
      description: 'Certify all elevated and admin access',
      frequency: 'Yearly',
      lastUsed: 'Jan 1, 2025',
    },
    {
      id: '3',
      name: 'Application-Specific Review',
      description: 'Review access for critical applications',
      frequency: 'Monthly',
      lastUsed: 'Oct 1, 2025',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="rounded-xl border border-border bg-white dark:bg-slate-900 p-5 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-medium mb-1">{template.name}</h3>
              <p className="text-sm text-slate-500">{template.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {template.frequency}
            </div>
            <div className="text-xs text-slate-500">
              Last used: {template.lastUsed}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              Use Template
            </Button>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </div>
        </div>
      ))}

      <button className="rounded-xl border-2 border-dashed border-border bg-white dark:bg-slate-900 p-5 hover:border-primary hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex flex-col items-center justify-center min-h-[200px]">
        <Plus className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-sm font-medium">Create New Template</span>
      </button>
    </div>
  );
}
