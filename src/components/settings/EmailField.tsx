import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Mail, Check, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function EmailField({ value, onChange, onBlur }: EmailFieldProps) {
  const [isValid, setIsValid] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleBlur = () => {
    setIsValid(validateEmail(value));
    onBlur?.();
  };

  const handleSendTest = async () => {
    if (!validateEmail(value)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Test email sent to ${value}`);
    }, 1000);
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <Input
          type="email"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={handleBlur}
          className={!isValid && value ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendTest}
          disabled={!value || !isValid || isSending}
          className="whitespace-nowrap"
        >
          {isSending ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="w-3 h-3 mr-1" />
              Send Test
            </>
          )}
        </Button>
      </div>
      {!isValid && value && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          <span>Please enter a valid email address</span>
        </div>
      )}
    </div>
  );
}
