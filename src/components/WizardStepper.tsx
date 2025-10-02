import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: index < currentStep 
                        ? 'var(--success)' 
                        : index === currentStep 
                        ? 'var(--primary)' 
                        : 'var(--surface)',
                      border: index <= currentStep ? 'none' : '2px solid var(--border)',
                      color: index <= currentStep ? 'white' : 'var(--muted-foreground)'
                    }}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: index <= currentStep ? 'var(--text)' : 'var(--muted-foreground)'
                    }}>
                      {step.label}
                    </div>
                    {step.description && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--muted-foreground)',
                        marginTop: '2px'
                      }}>
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div 
                    className="flex-1 h-0.5 mx-4"
                    style={{
                      backgroundColor: index < currentStep ? 'var(--success)' : 'var(--border)'
                    }}
                  />
                )}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
