import React, { useState } from 'react';
import { Eye, EyeOff, HelpCircle, Upload, X } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { Field } from '../data/connectors';

interface WizardFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function WizardField({ field, value, onChange, error }: WizardFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // In a real app, you'd upload this to a temporary storage
      onChange(file);
    }
  };

  const handleMultiselectToggle = (optionValue: string) => {
    const currentValues = value || [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v: string) => v !== optionValue)
      : [...currentValues, optionValue];
    onChange(newValues);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <div className="relative">
            <Input
              type={field.secret && !showPassword ? 'password' : 'text'}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {field.secret && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                ) : (
                  <Eye className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                )}
              </button>
            )}
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className={error ? 'border-destructive' : ''}
          />
        );

      case 'select':
        return (
          <Select value={value || field.defaultValue} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-3">
            <Switch
              checked={value !== undefined ? value : field.defaultValue}
              onCheckedChange={onChange}
              id={field.key}
            />
            <Label htmlFor={field.key} className="cursor-pointer" style={{ marginBottom: 0 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{field.label}</span>
            </Label>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 p-3 rounded-md border" style={{ borderColor: 'var(--border)' }}>
              {field.options?.map((option) => {
                const isSelected = (value || field.defaultValue || []).includes(option.value);
                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-120"
                    onClick={() => handleMultiselectToggle(option.value)}
                  >
                    {option.label}
                    {isSelected && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
            {(value || field.defaultValue || []).length === 0 && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                Click to select one or more options
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:border-primary/50 cursor-pointer"
              style={{ borderColor: error ? 'var(--destructive)' : 'var(--border)' }}
              onClick={() => document.getElementById(`file-${field.key}`)?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: '4px' }}>
                {fileName || 'Click to upload or drag and drop'}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                {field.accept || 'Any file type'}
              </p>
              <input
                id={`file-${field.key}`}
                type="file"
                accept={field.accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {fileName && (
              <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileName('');
                    onChange(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render label for toggle type (it's inline)
  if (field.type === 'toggle') {
    return (
      <div className="space-y-2">
        {renderField()}
        {field.helper && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>{field.helper}</p>
        )}
        {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--destructive)' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={field.key}>
          {field.label}
          {field.required && <span style={{ color: 'var(--destructive)' }}> *</span>}
        </Label>
        {field.helper && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="inline-flex">
                  <HelpCircle className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{field.helper}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {renderField()}
      {!field.helper && error && (
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--destructive)' }}>{error}</p>
      )}
    </div>
  );
}
