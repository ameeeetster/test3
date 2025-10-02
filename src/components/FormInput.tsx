import React, { forwardRef } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  id: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required, helperText, error, id, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={id}
          style={{
            fontSize: 'var(--text-body)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--text)',
            display: 'block'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
        </Label>
        
        <Input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          style={{
            height: '44px',
            borderRadius: '8px',
            backgroundColor: 'var(--input-background)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
            fontSize: 'var(--text-body)',
            transition: 'all var(--transition-base) var(--ease-out)',
            boxShadow: 'var(--shadow-none)'
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

FormInput.displayName = 'FormInput';