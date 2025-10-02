import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Switch } from '../../ui/switch';
import { CampaignDraft } from '../CreateReviewWizard';

export function ReviewersStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
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
            <Label htmlFor="manager" className="cursor-pointer flex-1">
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Manager</div>
              <div className="text-sm text-slate-500">User's direct manager reviews their access</div>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="AppOwner" id="app-owner" className="mt-0.5" />
            <Label htmlFor="app-owner" className="cursor-pointer flex-1">
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Application Owner</div>
              <div className="text-sm text-slate-500">Owner of each application reviews access</div>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="RoleOwner" id="role-owner" className="mt-0.5" />
            <Label htmlFor="role-owner" className="cursor-pointer flex-1">
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Role Owner</div>
              <div className="text-sm text-slate-500">Owner of each role reviews memberships</div>
            </Label>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-slate-50 dark:hover:bg-white/5">
            <RadioGroupItem value="Custom" id="custom" className="mt-0.5" />
            <Label htmlFor="custom" className="cursor-pointer flex-1">
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>Custom Reviewers</div>
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
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Allow Delegation</Label>
            <p className="text-sm text-slate-500 mt-1">Reviewers can delegate to others</p>
          </div>
          <Switch
            checked={!!r.allowDelegation}
            onCheckedChange={(v) => setDraft({ ...draft, reviewers: { ...r, allowDelegation: v } })}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label style={{ fontWeight: 'var(--font-weight-medium)' }}>Require Reason on Revoke</Label>
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
