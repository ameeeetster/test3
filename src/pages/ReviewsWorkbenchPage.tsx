import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ListFilter as Filter, Sparkles, ChevronRight, Keyboard, Download, Undo2, Redo2, Menu, X } from 'lucide-react';
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
  slaRemaining?: string;
};

const demoSubjects: Subject[] = [
  {
    id: 'u1',
    name: 'Jessica Smith',
    dept: 'Finance',
    risk: 'High',
    slaRemaining: '2d',
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
    slaRemaining: '5d',
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
    slaRemaining: '7d',
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

const HEADER_HEIGHT = 64;
const PROGRESS_BAR_HEIGHT = 64;
const TOP_OFFSET = HEADER_HEIGHT + PROGRESS_BAR_HEIGHT;

export function ReviewsWorkbenchPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>(demoSubjects);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [showSubjectsDrawer, setShowSubjectsDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedRow, setFocusedRow] = useState<string | null>(null);

  const currentSubject = subjects[currentIndex];

  const progress = useMemo(() => {
    const total = currentSubject.items.length;
    const decided = Object.values(currentSubject.reviewed).filter(Boolean).length;
    return { total, decided, pct: Math.round((decided / total) * 100) || 0 };
  }, [currentSubject]);

  const overallProgress = useMemo(() => {
    let totalItems = 0;
    let decidedItems = 0;
    let criticalRemaining = 0;
    subjects.forEach(s => {
      totalItems += s.items.length;
      decidedItems += Object.values(s.reviewed).filter(Boolean).length;
      s.items.forEach(item => {
        if (item.risk === 'Critical' && !s.reviewed[item.id]) {
          criticalRemaining++;
        }
      });
    });
    return {
      total: totalItems,
      decided: decidedItems,
      pct: Math.round((decidedItems / totalItems) * 100) || 0,
      criticalRemaining
    };
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

  function exportCSV() {
    toast.info('Exporting decisions to CSV...');
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if (focusedRow) {
        switch(key) {
          case 'k':
            setDecision(focusedRow, 'Keep');
            break;
          case 'r':
            setDecision(focusedRow, 'Revoke');
            break;
          case 'd':
            setDecision(focusedRow, 'Delegate');
            break;
          case 't':
            setDecision(focusedRow, 'Time-bound');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusedRow]);

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Top Bar - Fixed */}
      <header
        className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm z-50"
        style={{ height: `${HEADER_HEIGHT}px` }}
      >
        <div className="h-full max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/reviews')} className="lg:flex hidden">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowSubjectsDrawer(!showSubjectsDrawer)}
            >
              {showSubjectsDrawer ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
            <h1 className="text-lg font-semibold">Q1 2025 User Access Review</h1>
            <Badge variant="outline" className="hidden sm:inline-flex">Active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs hidden md:inline-flex">
              <Keyboard className="w-3 h-3 mr-1" />
              K · R · D · T
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Band - Sticky under top bar */}
      <div
        className="fixed left-0 right-0 bg-slate-50/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm z-40"
        style={{ top: `${HEADER_HEIGHT}px`, height: `${PROGRESS_BAR_HEIGHT}px` }}
      >
        <div className="h-full max-w-[1320px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600 dark:text-slate-400">
              Overall: {overallProgress.decided}/{overallProgress.total} items
            </span>
            <div className="flex items-center gap-3">
              {overallProgress.criticalRemaining > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overallProgress.criticalRemaining} Critical Remaining
                </Badge>
              )}
              <span className="font-semibold">{overallProgress.pct}%</span>
            </div>
          </div>
          <Progress value={overallProgress.pct} className="h-2" />
        </div>
      </div>

      {/* Main Content Area */}
      <main
        className="max-w-[1320px] mx-auto px-6"
        style={{ paddingTop: `${TOP_OFFSET + 24}px`, paddingBottom: '24px' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Rail - Subjects (280px = 3 cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div
              className="sticky bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              style={{ top: `${TOP_OFFSET + 24}px` }}
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Subjects ({subjects.length})</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Filter className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div
                className="overflow-y-auto"
                style={{ maxHeight: `calc(100vh - ${TOP_OFFSET + 24 + 88}px)` }}
              >
                {filteredSubjects.map((subject, index) => {
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
                      onClick={() => {
                        setCurrentIndex(index);
                        setShowSubjectsDrawer(false);
                      }}
                      slaRemaining={subject.slaRemaining}
                    />
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Mobile Subjects Drawer */}
          {showSubjectsDrawer && (
            <div
              className="lg:hidden fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowSubjectsDrawer(false)}
            >
              <aside
                className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ paddingTop: `${TOP_OFFSET}px` }}
              >
                <div className="h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">Subjects ({subjects.length})</h3>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Filter className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredSubjects.map((subject, index) => {
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
                          onClick={() => {
                            setCurrentIndex(index);
                            setShowSubjectsDrawer(false);
                          }}
                          slaRemaining={subject.slaRemaining}
                        />
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Main Column - Access Items (6 or 9 cols) */}
          <section className={`lg:col-span-${showAIPanel ? '6' : '9'}`}>
            <div className="space-y-5">
              {/* Subject Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">{currentSubject.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 flex-wrap">
                    <span>{currentSubject.dept}</span>
                    <span>·</span>
                    <RiskChip risk={currentSubject.risk} size="sm" />
                    <span>·</span>
                    <span>
                      {progress.decided}/{progress.total} reviewed ({progress.pct}%)
                    </span>
                    {currentSubject.slaRemaining && (
                      <>
                        <span>·</span>
                        <Badge variant="outline" className="text-xs">
                          {currentSubject.slaRemaining} remaining
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                    onClick={() => bulkApply(currentSubject.items.filter(i => i.risk === 'Low'), 'Keep')}
                  >
                    Keep low-risk
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                    onClick={() => bulkApply(currentSubject.items.filter(i => (i.lastUsedPct ?? 0) === 0), 'Revoke')}
                  >
                    Revoke unused
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          Application / Item
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          Last Used
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          Risk
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          AI Rec.
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">
                          Decision
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSubject.items.map((item, idx) => {
                        const decision = currentSubject.reviewed[item.id];
                        const isFocused = focusedRow === item.id;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors ${
                              isFocused
                                ? 'bg-primary/5 ring-2 ring-inset ring-primary/20'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                            style={{ height: '46px' }}
                            tabIndex={0}
                            onFocus={() => setFocusedRow(item.id)}
                            onBlur={() => setFocusedRow(null)}
                          >
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {item.app}
                                  {item.sodConflict && (
                                    <Badge variant="destructive" className="text-xs h-5">SoD</Badge>
                                  )}
                                  {item.elevated && (
                                    <Badge variant="outline" className="text-xs h-5">Elevated</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{item.item}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {item.type}
                            </td>
                            <td className="px-4 py-3">
                              <span className={
                                item.lastUsedPct === 0
                                  ? 'text-danger font-medium'
                                  : item.lastUsedPct && item.lastUsedPct < 20
                                  ? 'text-warning'
                                  : 'text-slate-600 dark:text-slate-300'
                              }>
                                {item.lastUsedPct !== undefined ? `${item.lastUsedPct}%` : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <RiskChip risk={item.risk} size="sm" showScore />
                            </td>
                            <td className="px-4 py-3">
                              {item.ai ? (
                                <Badge variant="secondary" className="text-xs h-6 font-normal">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {item.ai}
                                </Badge>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5">
                                <DecisionChip
                                  label="K"
                                  fullLabel="Keep"
                                  variant="success"
                                  active={decision === 'Keep'}
                                  onClick={() => setDecision(item.id, 'Keep')}
                                />
                                <DecisionChip
                                  label="R"
                                  fullLabel="Revoke"
                                  variant="danger"
                                  active={decision === 'Revoke'}
                                  onClick={() => setDecision(item.id, 'Revoke')}
                                />
                                <DecisionChip
                                  label="D"
                                  fullLabel="Delegate"
                                  variant="outline"
                                  active={decision === 'Delegate'}
                                  onClick={() => setDecision(item.id, 'Delegate')}
                                />
                                <DecisionChip
                                  label="T"
                                  fullLabel="Time"
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

              {/* Decision Bar - Sticky to bottom of main column */}
              <div
                className="sticky bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg"
                style={{ bottom: '16px', zIndex: 30, height: '64px' }}
              >
                <div className="h-full px-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Decisions: </span>
                      <span className="font-semibold">{progress.decided}/{progress.total}</span>
                    </div>
                    {progress.decided === progress.total && (
                      <Badge variant="default" className="bg-emerald-500">
                        ✓ Complete
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex"
                      onClick={exportCSV}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextSubject}
                      disabled={currentIndex === subjects.length - 1}
                    >
                      Next Subject
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      onClick={submitDecisions}
                      disabled={overallProgress.decided === 0}
                    >
                      Submit All
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Rail - AI Assist (320px = 3 cols) */}
          {showAIPanel && (
            <aside className="hidden lg:block lg:col-span-3">
              <div
                className="sticky"
                style={{ top: `${TOP_OFFSET + 24}px` }}
              >
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: `calc(100vh - ${TOP_OFFSET + 24 + 88}px)` }}
                >
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
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Mobile AI Button */}
      {!showAIPanel && (
        <Button
          className="lg:hidden fixed bottom-24 right-6 rounded-full h-12 w-12 p-0 shadow-lg z-40"
          onClick={() => setShowAIPanel(true)}
        >
          <Sparkles className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

function DecisionChip({
  label,
  fullLabel,
  variant,
  active,
  onClick,
}: {
  label: string;
  fullLabel: string;
  variant: 'success' | 'danger' | 'warning' | 'outline';
  active?: boolean;
  onClick: () => void;
}) {
  const styles = {
    success: active
      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900',
    danger: active
      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900',
    warning: active
      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900',
    outline: active
      ? 'bg-primary text-white border-primary shadow-sm'
      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700',
  };

  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-md border transition-all font-medium ${styles[variant]} focus:ring-2 focus:ring-offset-1 focus:ring-primary`}
      aria-pressed={active}
      aria-label={fullLabel}
      title={fullLabel}
    >
      {label}
    </button>
  );
}
