import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { ArrowRight, Plus, Trash2, Settings, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  slaDays: number;
  escalationDays: number;
  requireJustification: boolean;
  allowAttachment: boolean;
  allowDelegate: boolean;
  conditions?: Condition[];
  branches?: WorkflowStep[][];
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface StepBuilderProps {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
}

export function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const addStep = () => {
    onChange([
      ...steps,
      {
        id: `step-${Date.now()}`,
        name: 'New Step',
        slaDays: 2,
        escalationDays: 3,
        requireJustification: false,
        allowAttachment: true,
        allowDelegate: false
      }
    ]);
  };

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onChange(newSteps);
  };

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    onChange(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`
                flex-shrink-0 p-3 rounded-lg border bg-card cursor-pointer transition-all
                ${expandedStep === step.id ? 'ring-2 ring-ring' : 'hover:border-primary/50'}
              `}
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium">{step.name}</h4>
                {step.conditions && step.conditions.length > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    <GitBranch className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                SLA: {step.slaDays}d • Escalate: {step.escalationDays}d
              </div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
        <Button variant="outline" size="sm" onClick={addStep} className="flex-shrink-0">
          <Plus className="w-3 h-3 mr-1" />
          Add Step
        </Button>
      </div>

      {expandedStep && (
        <div className="p-4 rounded-lg border bg-card space-y-4">
          {steps.map((step, index) => {
            if (step.id !== expandedStep) return null;
            return (
              <div key={step.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Configure Step</h3>
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => moveStep(index, 'up')}>
                        ↑
                      </Button>
                    )}
                    {index < steps.length - 1 && (
                      <Button variant="ghost" size="sm" onClick={() => moveStep(index, 'down')}>
                        ↓
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="step-name">Step Name</Label>
                    <Input
                      id="step-name"
                      value={step.name}
                      onChange={e => updateStep(index, { name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sla-days">SLA (days)</Label>
                    <Input
                      id="sla-days"
                      type="number"
                      value={step.slaDays}
                      onChange={e => updateStep(index, { slaDays: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalation-days">Escalate after (days)</Label>
                    <Input
                      id="escalation-days"
                      type="number"
                      value={step.escalationDays}
                      onChange={e => updateStep(index, { escalationDays: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Require Justification</Label>
                      <p className="text-xs text-muted-foreground">User must provide a reason</p>
                    </div>
                    <Switch
                      checked={step.requireJustification}
                      onCheckedChange={v => updateStep(index, { requireJustification: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Attachments</Label>
                      <p className="text-xs text-muted-foreground">Enable file uploads</p>
                    </div>
                    <Switch
                      checked={step.allowAttachment}
                      onCheckedChange={v => updateStep(index, { allowAttachment: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow Delegation</Label>
                      <p className="text-xs text-muted-foreground">Approver can reassign</p>
                    </div>
                    <Switch
                      checked={step.allowDelegate}
                      onCheckedChange={v => updateStep(index, { allowDelegate: v })}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Conditional Branches</Label>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  {(!step.conditions || step.conditions.length === 0) && (
                    <p className="text-xs text-muted-foreground">No conditions. This step applies to all requests.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
