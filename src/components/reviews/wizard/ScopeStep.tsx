import React from 'react';
import { Info } from 'lucide-react';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { CampaignDraft } from '../CreateReviewWizard';

export function ScopeStep({ draft, setDraft }: { draft: CampaignDraft; setDraft: (u: CampaignDraft) => void }) {
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
                    <Label htmlFor={`dept-${dept}`} className="cursor-pointer">
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
                    <Label htmlFor={`app-${app}`} className="cursor-pointer">
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
                  <Label htmlFor={`role-${role}`} className="cursor-pointer">
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
            <h3 className="font-medium text-indigo-900 dark:text-indigo-100" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Estimated Scope
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-2xl text-indigo-600 dark:text-indigo-400" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                {estimatedSubjects.toLocaleString()}
              </div>
              <div className="text-sm text-indigo-700 dark:text-indigo-300">Subjects to review</div>
            </div>
            <div>
              <div className="text-2xl text-indigo-600 dark:text-indigo-400" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
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
