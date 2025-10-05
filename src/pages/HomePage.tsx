import React, { useEffect } from 'react';
import { CheckSquare, AlertTriangle, FileCheck, XCircle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { AIPanel } from '../components/AIPanel';
import { AlertBar } from '../components/AlertBar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../contexts/UserContext';
import { EndUserDashboard } from './home/EndUserDashboard';
import { ApproverDashboard } from './home/ApproverDashboard';
import { toast } from 'sonner';

const requestsData = [
  { day: 'Day 1', requests: 12 },
  { day: 'Day 5', requests: 19 },
  { day: 'Day 10', requests: 15 },
  { day: 'Day 15', requests: 28 },
  { day: 'Day 20', requests: 22 },
  { day: 'Day 25', requests: 35 },
  { day: 'Day 30', requests: 30 },
];

const riskByAppData = [
  { app: 'Oracle ERP', risk: 85 },
  { app: 'Salesforce', risk: 62 },
  { app: 'AWS Prod', risk: 78 },
  { app: 'Azure AD', risk: 45 },
  { app: 'Workday', risk: 53 },
];

const aiSuggestions = [
  {
    type: 'alert' as const,
    title: 'High-risk SoD detected',
    description: '3 users have conflicting roles in Oracle ERP Finance module',
    action: 'Review conflicts'
  },
  {
    type: 'recommendation' as const,
    title: 'Optimize approval workflow',
    description: 'Finance role approvals take 40% longer than average',
    action: 'View details'
  },
  {
    type: 'insight' as const,
    title: 'Dormant account spike',
    description: '15 accounts inactive for 90+ days in Sales department',
    action: 'Start review'
  }
];

const tasks = [
  { 
    id: 1, 
    user: 'J. Smith', 
    request: 'Oracle ERP - AP Read', 
    risk: 'High',
    submitted: '2h ago'
  },
  { 
    id: 2, 
    user: 'R. Kumar', 
    request: 'SharePoint Finance Editors', 
    risk: 'Medium',
    submitted: '4h ago'
  },
  { 
    id: 3, 
    user: 'M. Chen', 
    request: 'Salesforce Admin', 
    risk: 'Low',
    submitted: '1d ago'
  },
];

export function HomePage() {
  const { user } = useUser();
  const [showAlert, setShowAlert] = React.useState(true);

  // Add keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render role-specific dashboard
  if (user.role === 'end-user') {
    return <EndUserDashboard />;
  }

  if (user.role === 'approver') {
    return <ApproverDashboard />;
  }

  // Administrator dashboard (default - existing full dashboard)

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--muted)';
    }
  };

  // Sparkline data for KPI cards
  const approvalsSparkline = [18, 22, 19, 24, 20, 26, 24];
  const alertsSparkline = [3, 5, 4, 6, 5, 8, 7];
  const reviewsSparkline = [5, 4, 3, 3, 3, 3, 3];
  const provisionsSparkline = [8, 6, 5, 4, 3, 2, 2];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Enhanced Alert Bar */}
      {showAlert && (
        <div className="mb-8">
          <AlertBar
            variant="danger"
            title="3 Segregation of Duties conflicts detected"
            description="Users have conflicting roles that violate SoD policies in Oracle ERP Finance module"
            action={{
              label: 'Review Conflicts',
              onClick: () => console.log('Review conflicts')
            }}
            onDismiss={() => setShowAlert(false)}
          />
        </div>
      )}

      {/* Enhanced Hero Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 
              className="tracking-tight"
              style={{ 
                fontSize: '36px',
                lineHeight: '1.2',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '8px'
              }}
            >
              Welcome back, {user.name}
            </h1>
            <p style={{ 
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-height-normal)'
            }}>
              Here's what's happening with your identity governance today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Last updated
              </div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Pending Approvals"
          value={24}
          change="+3 today"
          changeType="neutral"
          trend="up"
          icon={CheckSquare}
          iconColor="var(--primary)"
          sparklineData={approvalsSparkline}
        />
        <StatCard
          title="High-Risk Alerts"
          value={7}
          change="+2 this week"
          changeType="negative"
          trend="up"
          icon={AlertTriangle}
          iconColor="var(--danger)"
          sparklineData={alertsSparkline}
        />
        <StatCard
          title="Reviews Due"
          value={3}
          change="This month"
          changeType="neutral"
          trend="flat"
          icon={FileCheck}
          iconColor="var(--warning)"
          sparklineData={reviewsSparkline}
        />
        <StatCard
          title="Failed Provisions"
          value={2}
          change="−60% vs last week"
          changeType="positive"
          trend="down"
          icon={XCircle}
          iconColor="var(--success)"
          sparklineData={provisionsSparkline}
        />
      </div>

      {/* Enhanced Charts & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Requests Chart */}
          <Card className="p-6 transition-all duration-200 hover:shadow-md" style={{ 
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="mb-2 tracking-tight" style={{ 
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Access Requests Trend
                </h3>
                <p style={{ 
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)'
                }}>
                  Daily request volume over the last 30 days
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5" style={{
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)'
              }}>
                <span className="text-xs" style={{ fontSize: '10px' }}>▲</span>
                <div className="text-right">
                  <div className="tracking-tight" style={{ 
                    fontSize: '18px',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--success)',
                    lineHeight: '1.2'
                  }}>
                    161
                  </div>
                  <div style={{ 
                    fontSize: '11px',
                    color: 'var(--success)',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    +12% vs last month
                  </div>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={requestsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)' }}
                  tickCount={5}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px 10px'
                  }}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--bg)' }}
                  fill="url(#colorRequests)"
                  name="Requests"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Risk by App Chart */}
          <Card className="p-5" style={{ 
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="mb-5">
              <h3 className="mb-1 tracking-tight" style={{ 
                fontSize: '18px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)'
              }}>
                Risk Score by Application
              </h3>
              <p style={{ 
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)'
              }}>
                Top 5 applications by risk level
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskByAppData} layout="vertical" margin={{ left: -10, right: 16, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="var(--muted-foreground)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)' }}
                  domain={[0, 100]}
                />
                <YAxis 
                  type="category" 
                  dataKey="app" 
                  stroke="var(--text)"
                  style={{ fontSize: '13px', fontWeight: 'var(--font-weight-medium)' }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                  tick={{ fill: 'var(--text)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px 10px'
                  }}
                  cursor={{ fill: 'var(--accent)', opacity: 0.3 }}
                />
                <Bar 
                  dataKey="risk" 
                  fill="var(--danger)" 
                  radius={[0, 4, 4, 0]}
                  background={{ fill: 'var(--accent)', radius: [0, 4, 4, 0] }}
                  name="Risk Score"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* AI Insights - Right Rail */}
        <div className="lg:col-span-1">
          <AIPanel suggestions={aiSuggestions} />
        </div>
      </div>

      {/* My Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5" style={{ 
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="tracking-tight" style={{ 
                  fontSize: '18px',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '2px'
                }}>
                  My Tasks
                </h3>
                <p style={{ 
                  fontSize: 'var(--text-sm)',
                  color: 'var(--muted-foreground)'
                }}>
                  {tasks.length} pending approvals
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 hover:bg-accent transition-colors text-xs"
                style={{ 
                  fontWeight: 'var(--font-weight-medium)'
                }}
                onClick={() => {
                  toast.info("Navigating to approvals page");
                  console.log('View all approvals clicked');
                  // In a real app, this would navigate to /approvals
                  // window.location.href = '/approvals';
                }}
              >
                View all →
              </Button>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="group p-4 rounded-lg flex items-center justify-between transition-all duration-150 cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--accent)',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent)';
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)'
                      }}>
                        {task.user}
                      </span>
                      <Badge 
                        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5"
                        style={{ 
                          backgroundColor: task.risk === 'High' 
                            ? 'var(--danger-bg)' 
                            : task.risk === 'Medium'
                            ? 'var(--warning-bg)'
                            : 'var(--success-bg)',
                          color: getRiskColor(task.risk),
                          border: `1px solid ${task.risk === 'High' ? 'var(--danger-border)' : task.risk === 'Medium' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                          fontSize: '11px',
                          fontWeight: 'var(--font-weight-semibold)'
                        }}
                      >
                        {task.risk === 'High' && <AlertTriangle className="w-3 h-3" />}
                        {task.risk}
                      </Badge>
                    </div>
                    <p style={{ 
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text)',
                      marginBottom: '4px',
                      fontWeight: 'var(--font-weight-medium)'
                    }}>
                      {task.request}
                    </p>
                    <p style={{ 
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)'
                    }}>
                      Submitted {task.submitted}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      size="sm" 
                      className="h-8 text-xs shadow-sm hover:shadow transition-all duration-150"
                      style={{ 
                        backgroundColor: 'var(--success)',
                        fontWeight: 'var(--font-weight-semibold)',
                        paddingLeft: '12px',
                        paddingRight: '12px'
                      }}
                      onClick={() => {
                        toast.success(`Approved request for ${task.user}`);
                        console.log('Approved:', task);
                      }}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 text-xs hover:bg-accent transition-all duration-150"
                      style={{ 
                        fontWeight: 'var(--font-weight-medium)'
                      }}
                      onClick={() => {
                        toast.error(`Denied request for ${task.user}`);
                        console.log('Denied:', task);
                      }}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Insights - Right Rail (repeated for mobile) */}
        <div className="lg:hidden">
          <AIPanel suggestions={aiSuggestions} />
        </div>
      </div>
    </div>
  );
}