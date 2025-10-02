import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Eye, EyeOff, Copy, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SecretFieldProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  onRotate?: () => void;
}

export function SecretField({ value, onChange, readOnly = true, onRotate }: SecretFieldProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          className="pr-10 font-mono text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
      {onRotate && (
        <Button type="button" variant="outline" size="sm" onClick={onRotate}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
