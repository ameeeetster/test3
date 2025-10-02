import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { CampaignDraft, ReviewType } from '../CreateReviewWizard';

export function BasicsStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
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
