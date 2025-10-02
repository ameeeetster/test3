import React from 'react';
import { Users, Calendar, Sparkles, Check, AlertCircle } from 'lucide-react';
import { CampaignDraft } from '../CreateReviewWizard';

export function ReviewSummaryStep({ draft }: { draft: CampaignDraft }) {
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-lg border border-border">
        <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          <Users className="w-4 h-4" />
          Campaign Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Campaign Name</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.name || '—'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Type</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.type}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Owner</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.owner || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Timezone</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.timezone || 'System default'}</div>
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
        <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          <Calendar className="w-4 h-4" />
          Schedule & Reviewers
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Mode</div>
            <div className="mt-1 capitalize" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.schedule.mode}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Due in</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.schedule.dueDays || 7} days</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Reviewer Model</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>{draft.reviewers.model}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Delegation</div>
            <div className="mt-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              {draft.reviewers.allowDelegation ? 'Allowed' : 'Not allowed'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
        <h3 className="mb-4 text-indigo-900 dark:text-indigo-100 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
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
