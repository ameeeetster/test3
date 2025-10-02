import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  isLastStep: boolean;
  isCreating?: boolean;
}

export function WizardFooter({
  currentStep,
  totalSteps,
  canGoNext,
  canGoBack,
  onBack,
  onNext,
  onCancel,
  isLastStep,
  isCreating,
}: WizardFooterProps) {
  return (
    <div
      className="sticky bottom-0 border-t backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
        marginTop: 'auto',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back/Cancel */}
          <div className="flex items-center gap-2">
            {canGoBack ? (
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {/* Center: Progress */}
          <div className="hidden md:flex items-center gap-2">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      index === currentStep
                        ? 'var(--primary)'
                        : index < currentStep
                        ? 'var(--success)'
                        : 'var(--border)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: Next/Create */}
          <Button onClick={onNext} disabled={!canGoNext || isCreating} className="gap-2">
            {isCreating ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : isLastStep ? (
              <>
                <Check className="w-4 h-4" />
                Create Integration
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Mobile progress */}
        <div className="md:hidden mt-3">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: 'var(--primary)',
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
