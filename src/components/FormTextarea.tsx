import React, { forwardRef } from 'react';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  id: string;
  showCharCount?: boolean;
  maxLength?: number;
  currentLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, required, helperText, error, id, showCharCount, maxLength, currentLength, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label 
            htmlFor={id}
            style={{
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--text)',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
          </Label>
          
          {showCharCount && maxLength && (
            <span style={{
              fontSize: 'var(--text-xs)',
              color: currentLength && currentLength > maxLength ? 'var(--danger)' : 'var(--muted-foreground)'
            }}>
              {currentLength || 0} / {maxLength}
            </span>
          )}
        </div>
        
        <Textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          maxLength={maxLength}
          style={{
            minHeight: '120px',
            borderRadius: '8px',
            backgroundColor: 'var(--input-background)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
            fontSize: 'var(--text-body)',
            transition: 'all var(--transition-base) var(--ease-out)',
            boxShadow: 'var(--shadow-none)',
            resize: 'vertical'
          }}
          className={`focus:ring-2 focus:ring-primary/20 focus:border-primary focus:shadow-sm ${className || ''}`}
          {...props}
        />
        
        {helperText && !error && (
          <p 
            id={`${id}-helper`}
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              marginTop: '6px'
            }}
          >
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={`${id}-error`}
            role="alert"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--danger)',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';