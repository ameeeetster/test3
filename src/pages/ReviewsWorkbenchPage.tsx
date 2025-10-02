import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ListFilter as Filter, Sparkles, ChevronRight, Keyboard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { SubjectCard } from '../components/reviews/SubjectCard';
import { AIAssistPanel } from '../components/reviews/AIAssistPanel';
import { RiskChip } from '../components/RiskChip';
import { toast } from 'sonner@2.0.3';

type AccessItem = {
  id: string;
  app: string;
  item: string;
  type: 'Role' | 'Entitlement';
  lastUsedPct?: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  ai?: 'Keep' | 'Revoke' | 'Lower scope' | 'Time-bound';
  sodConflict?: boolean;
  elevated?: boolean;
};

type Subject = {
  id: string;
  name: string;
  dept: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  items: AccessItem[];
  reviewed: Record<string, 'Keep' | 'Revoke' | 'Delegate' | 'Time-bound' | undefined>;
};

const demoSubjects: Subject[] = [
  {
    id: 'u1',
    name: 'Jessica Smith',
    dept: 'Finance',
    risk: 'High',
    items: [
      { id: '1', app: 'Oracle ERP', item: 'AP Write', type: 'Role', lastUsedPct: 3, risk: 'High', ai: 'Time-bound', elevated: true },
      { id: '2', app: 'M365', item: 'Global Reader', type: 'Role', lastUsedPct: 78, risk: 'Low', ai: 'Keep' },
      { id: '3', app: 'Salesforce', item: 'System Admin', type: 'Role', lastUsedPct: 0, risk: 'Critical', ai: 'Revoke', sodConflict: true },
      { id: '4', app: 'Workday', item: 'Payroll Admin', type: 'Entitlement', lastUsedPct: 45, risk: 'Medium', ai: 'Keep' },
    ],
    reviewed: {},
  },
  {
    id: 'u2',
    name: 'Michael Chen',
    dept: 'Engineering',
    risk: 'Medium',
    items: [
      { id: '5', app: 'GitHub', item: 'Org Owner', type: 'Role', lastUsedPct: 92, risk: 'High', ai: 'Keep' },
      { id: '6', app: 'AWS', item: 'Production Admin', type: 'Role', lastUsedPct: 67, risk: 'High', ai: 'Keep' },
      { id: '7', app: 'Datadog', item: 'Admin', type: 'Role', lastUsedPct: 12, risk: 'Low', ai: 'Time-bound' },
    ],
    reviewed: {},
  },
  {
    id: 'u3',
    name: 'Sarah Johnson',
    dept: 'Operations',
    risk: 'Low',
    items: [
      { id: '8', app: 'Jira', item: 'Project Admin', type: 'Role', lastUsedPct: 89, risk: 'Low', ai: 'Keep' },
      { id: '9', app: 'Confluence', item: 'Space Admin', type: 'Role', lastUsedPct: 71, risk: 'Low', ai: 'Keep' },
    ],
    reviewed: {},
  },
];

const aiRecommendations = [
  { id: '1', type: 'revoke' as const, confidence: 95, reason: 'Not used in 90+ days', itemCount: 1 },
  { id: '2', type: 'time-bound' as const, confidence: 82, reason: 'Low usage, high privilege', itemCount: 2 },
  { id: '3', type: 'keep' as const, confidence: 88, reason: 'Regular usage, low risk', itemCount: 4 },
  { id: '4', type: 'flag' as const, confidence: 91, reason: 'SoD conflict detected', itemCount: 1 },
];

export function ReviewsWorkbenchPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>(demoSubjects);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSubject = subjects[currentIndex];

  const progress = useMemo(() => {
    const total = currentSubject.items.length;
    const decided = Object.values(currentSubject.reviewed).filter(Boolean).length;
    return { total, decided, pct: Math.round((decided / total) * 100) || 0 };
  }, [currentSubject]);

  const overallProgress = useMemo(() => {
    let totalItems = 0;
    let decidedItems = 0;
    subjects.forEach(s => {
      totalItems += s.items.length;
      decidedItems += Object.values(s.reviewed).filter(Boolean).length;
    });
    return { total: totalItems, decided: decidedItems, pct: Math.round((decidedItems / totalItems) * 100) || 0 };
  }, [subjects]);

  function setDecision(itemId: string, decision: Subject['reviewed'][string]) {
    setSubjects(prev => {
      const copy = [...prev];
      copy[currentIndex] = {
        ...prev[currentIndex],
        reviewed: { ...prev[currentIndex].reviewed, [itemId]: decision }
      };
      return copy;
    });
    toast.success(`Decision recorded: ${decision}`);
  }

  function bulkApply(items: AccessItem[], decision: Subject['reviewed'][string]) {
    items.forEach(item => setDecision(item.id, decision));
  }

  function nextSubject() {
    if (currentIndex < subjects.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.success('All subjects reviewed!');
    }
  }

  function submitDecisions() {
    toast.success('Decisions submitted successfully');
    navigate('/reviews');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800 border-b border-border shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/reviews')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reviews
              </Button>
              <div className="h-5 w-px bg-border" />
              <h1 className="text-xl" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Q1 2025 User Access Review
              </h1>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Keyboard className="w-3 h-3 mr-1" />
                K = Keep · R = Revoke · D = Delegate
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowAIPanel(!showAIPanel)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assist
              </Button>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Overall Progress: {overallProgress.decided}/{overallProgress.total} items reviewed
              </span>
              <span className="font-medium">{overallProgress.pct}%</span>
            </div>
            <Progress value={overallProgress.pct} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Subject List */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-800 overflow-hidden sticky top-6 shadow-sm">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Subjects ({subjects.length})</h3>
                  <Button variant="ghost" size="sm" className="h-7">
                    <Filter className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Input
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="max-h-[70vh] overflow-auto">
                {subjects.map((subject, index) => {
                  const reviewed = Object.values(subject.reviewed).filter(Boolean).length;
                  return (
                    <SubjectCard
                      key={subject.id}
                      name={subject.name}
                      department={subject.dept}
                      risk={subject.risk}
                      total={subject.items.length}
                      reviewed={reviewed}
                      isActive={index === currentIndex}
                      onClick={() => setCurrentIndex(index)}
                    />
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Center: Access Items */}
          <section className={`col-span-12 ${showAIPanel ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-4`}>
            {/* Subject Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium mb-1">{currentSubject.name}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>{currentSubject.dept}</span>
                  <span>·</span>
                  <RiskChip risk={currentSubject.risk} size="sm" />
                  <span>·</span>
                  <span>
                    {progress.decided}/{progress.total} reviewed ({progress.pct}%)
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkApply(currentSubject.items.filter(i => i.risk === 'Low'), 'Keep')}
                >
                  Keep all low-risk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkApply(currentSubject.items.filter(i => (i.lastUsedPct ?? 0) === 0), 'Revoke')}
                >
                  Revoke unused
                </Button>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-xl border border-border overflow-hidden bg-slate-50 dark:bg-slate-800 shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-700 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Application / Item</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Last Used</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Risk</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">AI</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubject.items.map(item => {
                      const decision = currentSubject.reviewed[item.id];
                      return (
                        <tr key={item.id} className="border-b border-border last:border-0 hover:bg-slate-100 dark:hover:bg-slate-700">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {item.app}
                                {item.sodConflict && (
                                  <Badge variant="destructive" className="text-xs">SoD</Badge>
                                )}
                                {item.elevated && (
                                  <Badge variant="outline" className="text-xs">Elevated</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">{item.item}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.type}</td>
                          <td className="px-4 py-3">
                            <span className={item.lastUsedPct === 0 ? 'text-danger' : ''}>
                              {item.lastUsedPct ?? '—'}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <RiskChip risk={item.risk} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            {item.ai ? (
                              <Badge variant="outline" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {item.ai}
                              </Badge>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <DecisionChip
                                label="Keep"
                                variant="success"
                                active={decision === 'Keep'}
                                onClick={() => setDecision(item.id, 'Keep')}
                              />
                              <DecisionChip
                                label="Revoke"
                                variant="danger"
                                active={decision === 'Revoke'}
                                onClick={() => setDecision(item.id, 'Revoke')}
                              />
                              <DecisionChip
                                label="Delegate"
                                variant="outline"
                                active={decision === 'Delegate'}
                                onClick={() => setDecision(item.id, 'Delegate')}
                              />
                              <DecisionChip
                                label="Time-bound"
                                variant="warning"
                                active={decision === 'Time-bound'}
                                onClick={() => setDecision(item.id, 'Time-bound')}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="sticky bottom-4 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur border border-border rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {progress.decided}/{progress.total} decisions made
                  {progress.decided === progress.total && (
                    <span className="ml-2 text-success">✓ All items reviewed</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={nextSubject}
                    disabled={currentIndex === subjects.length - 1}
                  >
                    Next Subject
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button onClick={submitDecisions}>
                    Submit All Decisions
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: AI Assist Panel */}
          {showAIPanel && (
            <aside className="col-span-12 lg:col-span-3">
              <div className="sticky top-6">
                <AIAssistPanel
                  recommendations={aiRecommendations}
                  onApplyAll={() => {
                    toast.success('Applied all safe AI recommendations');
                  }}
                  onFilterRisky={() => {
                    toast.info('Filtered to show risky/unused items only');
                  }}
                />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function DecisionChip({
  label,
  variant,
  active,
  onClick,
}: {
  label: string;
  variant: 'success' | 'danger' | 'warning' | 'outline';
  active?: boolean;
  onClick: () => void;
}) {
  const styles = {
    success: active
      ? 'bg-success text-white border-success'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    danger: active
      ? 'bg-danger text-white border-danger'
      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    warning: active
      ? 'bg-warning text-white border-warning'
      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    outline: active
      ? 'bg-primary text-white border-primary'
      : 'bg-transparent text-slate-700 border-slate-300 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-white/5',
  };

  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded-md border transition-colors ${styles[variant]}`}
    >
      {label}
    </button>
  );
}
