import React from 'react';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';
import { Button } from './ui/button';

interface AlertBarProps {
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export function AlertBar({ 
  variant = 'danger', 
  icon,
  title, 
  description,
  action,
  onDismiss 
}: AlertBarProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          text: '#991B1B',
          iconColor: '#DC2626'
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FED7AA',
          text: '#92400E',
          iconColor: '#F59E0B'
        };
      case 'info':
        return {
          bg: '#EFF6FF',
          border: '#DBEAFE',
          text: '#1E3A8A',
          iconColor: '#3B82F6'
        };
    }
  };

  const styles = getVariantStyles();
  const defaultIcon = variant === 'danger' ? <ShieldAlert /> : <AlertCircle />;

  return (
    <div 
      className="rounded-lg border p-3 flex items-start gap-3 transition-all duration-150"
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
        borderWidth: '1px'
      }}
    >
      <div 
        className="flex-shrink-0 w-5 h-5 mt-0.5"
        style={{ color: styles.iconColor }}
      >
        {icon || defaultIcon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p 
              className="font-semibold mb-0.5"
              style={{ 
                fontSize: 'var(--text-body)',
                color: styles.text,
                lineHeight: 'var(--line-height-snug)'
              }}
            >
              {title}
            </p>
            {description && (
              <p 
                style={{ 
                  fontSize: 'var(--text-sm)',
                  color: styles.text,
                  opacity: 0.8,
                  lineHeight: 'var(--line-height-normal)'
                }}
              >
                {description}
              </p>
            )}
          </div>
          
          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
              className="h-7 text-xs font-semibold flex-shrink-0"
              style={{
                color: styles.text,
                borderColor: styles.border,
                backgroundColor: 'white'
              }}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss alert"
          style={{ color: styles.text }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Dark mode variant
AlertBar.displayName = 'AlertBar';