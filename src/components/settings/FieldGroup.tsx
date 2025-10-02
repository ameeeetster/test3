import React from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FieldGroupProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FieldGroup({ label, description, required, error, children }: FieldGroupProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FieldGroup2ColProps {
  children: React.ReactNode;
}

export function FieldGroup2Col({ children }: FieldGroup2ColProps) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}
