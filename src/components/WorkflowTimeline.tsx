import React, { useState } from 'react';
import { CheckCircle2, Clock, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';

interface WorkflowStep {
  id: string;
  status: 'completed' | 'current' | 'pending';
  title: string;
  user: string;
  timestamp?: string;
  eta?: string;
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  collapsible?: boolean;
}

export const WorkflowTimeline = React.memo(function WorkflowTimeline({ steps, collapsible = true }: WorkflowTimelineProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  
  const completedSteps = React.useMemo(() => steps.filter(s => s.status === 'completed'), [steps]);
  const activeAndPendingSteps = React.useMemo(() => steps.filter(s => s.status !== 'completed'), [steps]);
  
  const getIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'current':
        return Clock;
      default:
        return Circle;
    }
  };

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'var(--success)';
      case 'current':
        return 'var(--primary)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  const renderStep = (step: WorkflowStep, index: number, isLast: boolean) => {
    const Icon = getIcon(step.status);
    
    return (
      <div key={step.id} className="flex gap-3 relative">
        {/* Timeline line */}
        {!isLast && (
          <div
            className="absolute left-5 top-12 bottom-0 w-0.5"
            style={{
              backgroundColor: step.status === 'completed' ? 'var(--success)' : 'var(--border)',
              opacity: step.status === 'completed' ? 0.3 : 1
            }}
          />
        )}
        
        {/* Avatar */}
        <Avatar className="w-10 h-10 border-2 relative z-10" style={{ borderColor: getStatusColor(step.status) }}>
          <AvatarFallback style={{
            backgroundColor: step.status === 'pending' ? 'var(--surface)' : step.status === 'completed' ? 'var(--success-bg)' : 'var(--info-bg)',
            color: getStatusColor(step.status),
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>
            {step.user === 'System' ? <Icon className="w-4 h-4" /> : step.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pb-6">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              {step.title}
            </h4>
            {step.status === 'completed' && (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
            )}
            {step.status === 'current' && (
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: 'var(--primary)' }}
              />
            )}
          </div>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginBottom: '4px'
          }}>
            {step.user}
          </p>
          {step.timestamp && (
            <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <Clock className="w-3 h-3" />
              <span style={{ fontSize: 'var(--text-xs)' }}>{step.timestamp}</span>
            </div>
          )}
          {step.eta && step.status === 'current' && (
            <div
              className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded"
              style={{
                backgroundColor: 'var(--info-bg)',
                border: '1px solid var(--info-border)'
              }}
            >
              <Clock className="w-3 h-3" style={{ color: 'var(--info)' }} />
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--info)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                ETA: {step.eta}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Completed steps (collapsible) */}
      {collapsible && completedSteps.length > 0 && (
        <div className="mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
            className="h-8 gap-2 -ml-2 mb-2"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {completedSteps.length} completed step{completedSteps.length > 1 ? 's' : ''}
          </Button>
          {showCompleted && (
            <div className="space-y-0">
              {completedSteps.map((step, index) => 
                renderStep(step, index, index === completedSteps.length - 1 && activeAndPendingSteps.length === 0)
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Active and pending steps */}
      <div className="space-y-0">
        {activeAndPendingSteps.map((step, index) => 
          renderStep(step, index, index === activeAndPendingSteps.length - 1)
        )}
      </div>
    </div>
  );
});