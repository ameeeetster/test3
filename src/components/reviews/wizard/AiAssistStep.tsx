import React from 'react';
import { Sparkles } from 'lucide-react';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { CampaignDraft } from '../CreateReviewWizard';

export function AiAssistStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
  const a = draft.ai;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
          <div>
            <h3 className="text-indigo-900 dark:text-indigo-100" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              AI-Powered Review Assistance
            </h3>
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
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Highlight unused ≥90 days</Label>
            <p className="text-sm text-slate-500 mt-1">Flag access not used recently</p>
          </div>
          <Switch
            checked={!!a.highlightUnused90d}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, highlightUnused90d: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Highlight SoD conflicts</Label>
            <p className="text-sm text-slate-500 mt-1">Flag segregation violations</p>
          </div>
          <Switch
            checked={!!a.highlightSoD}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, highlightSoD: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Highlight privileged access</Label>
            <p className="text-sm text-slate-500 mt-1">Flag elevated permissions</p>
          </div>
          <Switch
            checked={!!a.highlightPrivileged}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, highlightPrivileged: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Auto-approve low-risk</Label>
            <p className="text-sm text-slate-500 mt-1">Automatically approve safe items</p>
          </div>
          <Switch
            checked={!!a.autoApproveLowRisk}
            onCheckedChange={(v) => setDraft({ ...draft, ai: { ...a, autoApproveLowRisk: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Collapse duplicates</Label>
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
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={a.confidence || 0.7}
            onChange={(e) => setDraft({ ...draft, ai: { ...a, confidence: parseFloat(e.target.value) } })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
            <span>Lower (more suggestions)</span>
            <span className="text-primary" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              {Math.round((a.confidence || 0.7) * 100)}%
            </span>
            <span>Higher (fewer, more confident)</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 dark:bg-white/5 border border-border">
        <h4 className="mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>Estimated Impact</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-lg text-success" style={{ fontWeight: 'var(--font-weight-semibold)' }}>~340</div>
            <div className="text-slate-600 dark:text-slate-400">Auto-approved items</div>
          </div>
          <div>
            <div className="text-lg text-warning" style={{ fontWeight: 'var(--font-weight-semibold)' }}>~127</div>
            <div className="text-slate-600 dark:text-slate-400">Flagged for review</div>
          </div>
          <div>
            <div className="text-lg text-info" style={{ fontWeight: 'var(--font-weight-semibold)' }}>~89</div>
            <div className="text-slate-600 dark:text-slate-400">AI suggestions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
