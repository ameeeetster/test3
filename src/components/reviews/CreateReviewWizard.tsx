import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Users, Calendar, AlertCircle, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';

type ReviewType = 'User' | 'Application' | 'Role' | 'Privileged' | 'SoD';

type CampaignDraft = {
  name: string;
  type: ReviewType;
  templateId?: string;
  owner?: string;
  timezone?: string;
  description?: string;
  scope: Record<string, any>;
  reviewers: {
    model: 'Manager' | 'AppOwner' | 'RoleOwner' | 'Custom';
    custom?: string[];
    allowDelegation?: boolean;
    fallbackReviewer?: string;
    quorum?: number;
    requireReasonOnRevoke?: boolean;
  };
  schedule: {
    mode: 'one-time' | 'recurring';
    startDate?: string;
    endDate?: string;
    dueDays?: number;
    rrule?: string;
    reminders?: { daysBefore: number }[];
    escalation?: { afterDays: number; to: 'Owner' | 'Admin' | 'Security' };
  };
  ai: {
    highlightUnused90d?: boolean;
    highlightSoD?: boolean;
    highlightPrivileged?: boolean;
    autoApproveLowRisk?: boolean;
    collapseDuplicates?: boolean;
    confidence?: number;
  };
};

const STEPS = ['Basics', 'Scope', 'Reviewers', 'Schedule', 'AI Assist', 'Review'] as const;
type Step = typeof STEPS[number];

export function CreateReviewWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('Basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState<CampaignDraft>({
    name: '',
    type: 'User',
    scope: {},
    reviewers: { model: 'Manager', allowDelegation: true, quorum: 1, requireReasonOnRevoke: true },
    schedule: { mode: 'one-time', dueDays: 7, reminders: [{ daysBefore: 3 }] },
    ai: { highlightUnused90d: true, highlightSoD: true, confidence: 0.7 },
  });

  const canNext = validate(step, draft);
  const currentStepIndex = STEPS.indexOf(step);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleLaunch = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Campaign launched successfully!');
    setIsSubmitting(false);
    navigate('/reviews');
  };

  const handleSaveDraft = () => {
    toast.success('Campaign saved as draft');
    navigate('/reviews');
  };

  const handleSaveTemplate = () => {
    toast.success('Campaign saved as template');
    navigate('/reviews');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              Create Access Review Campaign
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Step {currentStepIndex + 1} of {STEPS.length}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/reviews')}>
            <X className="w-4 h-4" />
          </Button>
        </header>

        {/* Stepper */}
        <nav className="flex gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => {
            const isActive = s === step;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s}
                className={`px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : isCompleted
                    ? 'bg-success/10 text-success border-success/20'
                    : 'border-border hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
                onClick={() => setStep(s)}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 inline mr-1" />}
                {s}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="rounded-xl border border-border bg-white dark:bg-slate-900 p-6">
          {step === 'Basics' && <BasicsStep draft={draft} setDraft={setDraft} />}
          {step === 'Scope' && <ScopeStep draft={draft} setDraft={setDraft} />}
          {step === 'Reviewers' && <ReviewersStep draft={draft} setDraft={setDraft} />}
          {step === 'Schedule' && <ScheduleStep draft={draft} setDraft={setDraft} />}
          {step === 'AI Assist' && <AiAssistStep draft={draft} setDraft={setDraft} />}
          {step === 'Review' && <ReviewSummaryStep draft={draft} />}
        </div>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-border rounded-t-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentStepIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button variant="outline" onClick={handleSaveTemplate}>
                Save as Template
              </Button>
              {currentStepIndex < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleLaunch} disabled={isSubmitting || !canNext}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Launching...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Launch Campaign
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ----- Step Components ----- */

function BasicsStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">
            Campaign Name <span className="text-danger">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Q1 2025 User Access Review"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="type">
            Review Type <span className="text-danger">*</span>
          </Label>
          <Select value={draft.type} onValueChange={(type) => setDraft({ ...draft, type: type as ReviewType })}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="User">User Access Review</SelectItem>
              <SelectItem value="Application">Application Review</SelectItem>
              <SelectItem value="Role">Role Review</SelectItem>
              <SelectItem value="Privileged">Privileged Access Review</SelectItem>
              <SelectItem value="SoD">Segregation of Duties</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="owner">Owner</Label>
          <Input
            id="owner"
            placeholder="email@company.com"
            value={draft.owner || ''}
            onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="America/Los_Angeles"
            value={draft.timezone || ''}
            onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="template">Template (Optional)</Label>
          <Select value={draft.templateId || ''} onValueChange={(id) => setDraft({ ...draft, templateId: id })}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              <SelectItem value="quarterly">Quarterly User Review</SelectItem>
              <SelectItem value="privileged">Privileged Access Annual</SelectItem>
              <SelectItem value="app-specific">Application-Specific</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose and scope of this review campaign..."
          value={draft.description || ''}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="mt-2"
          rows={3}
        />
      </div>
    </div>
  );
}

function ScopeStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
  const estimatedSubjects = draft.type === 'User' ? 247 : draft.type === 'Application' ? 89 : 156;
  const estimatedItems = draft.type === 'User' ? 1247 : draft.type === 'Application' ? 456 : 823;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {draft.type === 'User' && (
          <>
            <div>
              <Label>Departments</Label>
              <div className="mt-2 space-y-2">
                {['Finance', 'Engineering', 'Sales', 'Operations', 'HR', 'IT'].map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={draft.scope.departments?.includes(dept)}
                      onCheckedChange={(checked) => {
                        const departments = draft.scope.departments || [];
                        setDraft({
                          ...draft,
                          scope: {
                            ...draft.scope,
                            departments: checked
                              ? [...departments, dept]
                              : departments.filter((d: string) => d !== dept),
                          },
                        });
                      }}
                    />
                    <Label htmlFor={`dept-${dept}`} className="cursor-pointer font-normal">
                      {dept}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <Label>Exclude service accounts</Label>
              <Switch
                checked={!!draft.scope.excludeService}
                onCheckedChange={(v) => setDraft({ ...draft, scope: { ...draft.scope, excludeService: v } })}
              />
            </div>

            <div>
              <Label>Active within last (days)</Label>
              <div className="mt-2">
                <Slider
                  value={[draft.scope.activeDays || 90]}
                  onValueChange={([v]) => setDraft({ ...draft, scope: { ...draft.scope, activeDays: v } })}
                  min={0}
                  max={365}
                  step={30}
                  className="mt-2"
                />
                <div className="text-sm text-slate-500 mt-2">{draft.scope.activeDays || 90} days</div>
              </div>
            </div>
          </>
        )}

        {draft.type === 'Application' && (
          <>
            <div>
              <Label>Applications</Label>
              <div className="mt-2 space-y-2">
                {['Salesforce', 'Workday', 'AWS', 'GitHub', 'M365', 'Oracle ERP'].map((app) => (
                  <div key={app} className="flex items-center space-x-2">
                    <Checkbox
                      id={`app-${app}`}
                      checked={draft.scope.apps?.includes(app)}
                      onCheckedChange={(checked) => {
                        const apps = draft.scope.apps || [];
                        setDraft({
                          ...draft,
                          scope: {
                            ...draft.scope,
                            apps: checked ? [...apps, app] : apps.filter((a: string) => a !== app),
                          },
                        });
                      }}
                    />
                    <Label htmlFor={`app-${app}`} className="cursor-pointer font-normal">
                      {app}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Risk Threshold</Label>
              <Select
                value={draft.scope.risk || 'All'}
                onValueChange={(v) => setDraft({ ...draft, scope: { ...draft.scope, risk: v } })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All risk levels</SelectItem>
                  <SelectItem value="Medium+">Medium and above</SelectItem>
                  <SelectItem value="High+">High and above</SelectItem>
                  <SelectItem value="Critical">Critical only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Last used threshold (%)</Label>
              <div className="mt-2">
                <Slider
                  value={[draft.scope.lastUsedPct || 0]}
                  onValueChange={([v]) => setDraft({ ...draft, scope: { ...draft.scope, lastUsedPct: v } })}
                  min={0}
                  max={100}
                  step={10}
                />
                <div className="text-sm text-slate-500 mt-2">≥ {draft.scope.lastUsedPct || 0}%</div>
              </div>
            </div>
          </>
        )}

        {draft.type === 'Role' && (
          <div>
            <Label>Roles to Review</Label>
            <div className="mt-2 space-y-2">
              {['Finance Admin', 'Engineering Lead', 'Sales Manager', 'HR Partner', 'IT Admin'].map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={draft.scope.roles?.includes(role)}
                    onCheckedChange={(checked) => {
                      const roles = draft.scope.roles || [];
                      setDraft({
                        ...draft,
                        scope: {
                          ...draft.scope,
                          roles: checked ? [...roles, role] : roles.filter((r: string) => r !== role),
                        },
                      });
                    }}
                  />
                  <Label htmlFor={`role-${role}`} className="cursor-pointer font-normal">
                    {role}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {(draft.type === 'Privileged' || draft.type === 'SoD') && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-border text-sm text-slate-600 dark:text-slate-400">
            Configure scope for {draft.type} reviews. Select policies and thresholds.
          </div>
        )}
      </div>

      {/* Right Rail - Estimates */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-indigo-50 dark:bg-indigo-950/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-medium text-indigo-900 dark:text-indigo-100">Estimated Scope</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {estimatedSubjects.toLocaleString()}
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-300">Subjects to review</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {estimatedItems.toLocaleString()}
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-300">Total items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewersStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
  const r = draft.reviewers;

  return (
    <div className="space-y-6">
      <div>
        <Label>Reviewer Assignment Model</Label>
        <RadioGroup
          value={r.model}
          onValueChange={(model) => setDraft({ ...draft, reviewers: { ...r, model: model as any } })}
          className="mt-3 space-y-3"
        >
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="Manager" id="manager" className="mt-0.5" />
            <Label htmlFor="manager" className="cursor-pointer font-normal flex-1">
              <div className="font-medium">Manager</div>
              <div className="text-sm text-slate-500">User's direct manager reviews their access</div>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="AppOwner" id="app-owner" className="mt-0.5" />
            <Label htmlFor="app-owner" className="cursor-pointer font-normal flex-1">
              <div className="font-medium">Application Owner</div>
              <div className="text-sm text-slate-500">Owner of each application reviews access</div>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="RoleOwner" id="role-owner" className="mt-0.5" />
            <Label htmlFor="role-owner" className="cursor-pointer font-normal flex-1">
              <div className="font-medium">Role Owner</div>
              <div className="text-sm text-slate-500">Owner of each role reviews memberships</div>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="Custom" id="custom" className="mt-0.5" />
            <Label htmlFor="custom" className="cursor-pointer font-normal flex-1">
              <div className="font-medium">Custom Reviewers</div>
              <div className="text-sm text-slate-500">Select specific reviewers manually</div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {r.model === 'Custom' && (
        <div>
          <Label htmlFor="custom-reviewers">Reviewer Emails</Label>
          <Input
            id="custom-reviewers"
            placeholder="email1@company.com, email2@company.com"
            className="mt-2"
            onChange={(e) =>
              setDraft({
                ...draft,
                reviewers: { ...r, custom: e.target.value.split(',').map((s) => s.trim()) },
              })
            }
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Allow Delegation</Label>
            <p className="text-sm text-slate-500 mt-1">Reviewers can delegate to others</p>
          </div>
          <Switch
            checked={!!r.allowDelegation}
            onCheckedChange={(v) => setDraft({ ...draft, reviewers: { ...r, allowDelegation: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Require Reason on Revoke</Label>
            <p className="text-sm text-slate-500 mt-1">Mandatory comment for revocations</p>
          </div>
          <Switch
            checked={!!r.requireReasonOnRevoke}
            onCheckedChange={(v) => setDraft({ ...draft, reviewers: { ...r, requireReasonOnRevoke: v } })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fallback">Fallback Reviewer</Label>
          <Input
            id="fallback"
            placeholder="fallback@company.com"
            value={r.fallbackReviewer || ''}
            onChange={(e) => setDraft({ ...draft, reviewers: { ...r, fallbackReviewer: e.target.value } })}
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-2">Used when assigned reviewer is unavailable</p>
        </div>

        <div>
          <Label htmlFor="quorum">Quorum (Approvals Required)</Label>
          <Input
            id="quorum"
            type="number"
            min="1"
            value={r.quorum || 1}
            onChange={(e) => setDraft({ ...draft, reviewers: { ...r, quorum: Number(e.target.value) } })}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

function ScheduleStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
  const s = draft.schedule;

  return (
    <div className="space-y-6">
      <div>
        <Label>Campaign Type</Label>
        <RadioGroup
          value={s.mode}
          onValueChange={(mode) => setDraft({ ...draft, schedule: { ...s, mode: mode as any } })}
          className="mt-3 space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="one-time" id="one-time" />
            <Label htmlFor="one-time" className="cursor-pointer font-normal">
              One-time — Single review campaign
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring" className="cursor-pointer font-normal">
              Recurring — Automatically create campaigns on a schedule
            </Label>
          </div>
        </RadioGroup>
      </div>

      {s.mode === 'recurring' && (
        <div>
          <Label htmlFor="rrule">RRULE (Recurrence Rule)</Label>
          <Input
            id="rrule"
            placeholder="FREQ=MONTHLY;BYMONTHDAY=1"
            value={s.rrule || ''}
            onChange={(e) => setDraft({ ...draft, schedule: { ...s, rrule: e.target.value } })}
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-2">
            Example: FREQ=QUARTERLY;BYMONTH=1,4,7,10 (quarterly on Jan, Apr, Jul, Oct)
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={s.startDate || ''}
            onChange={(e) => setDraft({ ...draft, schedule: { ...s, startDate: e.target.value } })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={s.endDate || ''}
            onChange={(e) => setDraft({ ...draft, schedule: { ...s, endDate: e.target.value } })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="due-days">Due in (Days)</Label>
          <Input
            id="due-days"
            type="number"
            min="1"
            value={s.dueDays || 7}
            onChange={(e) => setDraft({ ...draft, schedule: { ...s, dueDays: Number(e.target.value) } })}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reminder">Reminder (Days Before Due)</Label>
          <Input
            id="reminder"
            type="number"
            min="1"
            value={s.reminders?.[0]?.daysBefore ?? 3}
            onChange={(e) =>
              setDraft({ ...draft, schedule: { ...s, reminders: [{ daysBefore: Number(e.target.value) }] } })
            }
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="escalate">Escalate After (Days Overdue)</Label>
          <Input
            id="escalate"
            type="number"
            min="1"
            value={s.escalation?.afterDays ?? 2}
            onChange={(e) =>
              setDraft({
                ...draft,
                schedule: { ...s, escalation: { afterDays: Number(e.target.value), to: 'Owner' } },
              })
            }
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

function AiAssistStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
  const a = draft.ai;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-indigo-900 dark:text-indigo-100">AI-Powered Review Assistance</h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
              Enable AI features to help reviewers make faster, more informed decisions based on usage patterns and risk
              signals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Highlight unused ≥90 days</Label>
            <p className="text-sm text-slate-500 mt-1">Flag access not used recently</p>
          </div>
          <Switch
            checked={!!a.highlightUnused90d}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, highlightUnused90d: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Highlight SoD conflicts</Label>
            <p className="text-sm text-slate-500 mt-1">Flag segregation violations</p>
          </div>
          <Switch
            checked={!!a.highlightSoD}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, highlightSoD: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Highlight privileged access</Label>
            <p className="text-sm text-slate-500 mt-1">Flag elevated permissions</p>
          </div>
          <Switch
            checked={!!a.highlightPrivileged}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, highlightPrivileged: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Auto-approve low-risk</Label>
            <p className="text-sm text-slate-500 mt-1">Automatically approve safe items</p>
          </div>
          <Switch
            checked={!!a.autoApproveLowRisk}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, autoApproveLowRisk: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label className="font-medium">Collapse duplicates</Label>
            <p className="text-sm text-slate-500 mt-1">Group similar items</p>
          </div>
          <Switch
            checked={!!a.collapseDuplicates}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, collapseDuplicates: v } })}
          />
        </div>
      </div>

      <div>
        <Label>AI Confidence Threshold</Label>
        <div className="mt-3">
          <Slider
            value={[a.confidence || 0.7]}
            onValueChange={([v]) => setDraft({ ...draft, ai: { ...a, confidence: v } })}
            min={0}
            max={1}
            step={0.05}
          />
          <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
            <span>Lower (more suggestions)</span>
            <span className="font-medium text-primary">{Math.round((a.confidence || 0.7) * 100)}%</span>
            <span>Higher (fewer, more confident)</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-border">
        <h4 className="font-medium mb-2">Estimated Impact</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-lg font-semibold text-success">~340</div>
            <div className="text-slate-600 dark:text-slate-400">Auto-approved items</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning">~127</div>
            <div className="text-slate-600 dark:text-slate-400">Flagged for review</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-info">~89</div>
            <div className="text-slate-600 dark:text-slate-400">AI suggestions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSummaryStep({ draft }: { draft: CampaignDraft }) {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-lg border border-border">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Campaign Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Campaign Name</div>
            <div className="font-medium mt-1">{draft.name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Type</div>
            <div className="font-medium mt-1">{draft.type}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Owner</div>
            <div className="font-medium mt-1">{draft.owner || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Timezone</div>
            <div className="font-medium mt-1">{draft.timezone || 'System default'}</div>
          </div>
        </div>
        {draft.description && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-sm text-slate-500">Description</div>
            <div className="mt-1 text-sm">{draft.description}</div>
          </div>
        )}
      </div>

      <div className="p-5 rounded-lg border border-border">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule & Reviewers
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Mode</div>
            <div className="font-medium mt-1 capitalize">{draft.schedule.mode}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Due in</div>
            <div className="font-medium mt-1">{draft.schedule.dueDays || 7} days</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Reviewer Model</div>
            <div className="font-medium mt-1">{draft.reviewers.model}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Delegation</div>
            <div className="font-medium mt-1">{draft.reviewers.allowDelegation ? 'Allowed' : 'Not allowed'}</div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
        <h3 className="font-medium mb-4 text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI Features Enabled
        </h3>
        <div className="space-y-2">
          {draft.ai.highlightUnused90d && (
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Check className="w-4 h-4" />
              Highlight unused access (90+ days)
            </div>
          )}
          {draft.ai.highlightSoD && (
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Check className="w-4 h-4" />
              Flag SoD conflicts
            </div>
          )}
          {draft.ai.highlightPrivileged && (
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Check className="w-4 h-4" />
              Highlight privileged access
            </div>
          )}
          {draft.ai.autoApproveLowRisk && (
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Check className="w-4 h-4" />
              Auto-approve low-risk items
            </div>
          )}
          {draft.ai.collapseDuplicates && (
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
              <Check className="w-4 h-4" />
              Collapse duplicate items
            </div>
          )}
          {!draft.ai.highlightUnused90d &&
            !draft.ai.highlightSoD &&
            !draft.ai.highlightPrivileged &&
            !draft.ai.autoApproveLowRisk &&
            !draft.ai.collapseDuplicates && (
              <p className="text-sm text-indigo-600 dark:text-indigo-400">No AI features enabled</p>
            )}
        </div>
        <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
          <div className="text-sm text-indigo-700 dark:text-indigo-300">
            Confidence threshold: {Math.round((draft.ai.confidence || 0.7) * 100)}%
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-info mt-0.5" />
          <div className="flex-1 text-sm text-slate-600 dark:text-slate-400">
            On launch, we'll create subjects and items from your scope, assign reviewers per your rules, schedule
            reminders, and enable AI hints per your settings. Reviewers will receive email notifications.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- Helper Functions ----- */

function validate(step: Step, draft: CampaignDraft): boolean {
  if (step === 'Basics') {
    return draft.name.trim().length > 0;
  }
  return true;
}
