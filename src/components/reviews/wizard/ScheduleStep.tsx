import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { CampaignDraft } from '../CreateReviewWizard';

export function ScheduleStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
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
            <Label htmlFor="one-time" className="cursor-pointer">
              One-time — Single review campaign
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recurring" id="recurring" />
            <Label htmlFor="recurring" className="cursor-pointer">
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
