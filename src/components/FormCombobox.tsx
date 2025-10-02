import React, { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface FormComboboxProps {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  id: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function FormCombobox({
  label,
  required,
  helperText,
  error,
  id,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  options,
  value,
  onChange,
  disabled
}: FormComboboxProps) {
  const [open, setOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);
  
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
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            disabled={disabled}
            style={{
              width: '100%',
              height: '44px',
              justifyContent: 'space-between',
              borderRadius: '8px',
              backgroundColor: disabled ? 'var(--accent)' : 'var(--input-background)',
              border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
              fontSize: 'var(--text-body)',
              fontWeight: 'var(--font-weight-normal)',
              color: selectedOption ? 'var(--text)' : 'var(--muted-foreground)',
              transition: 'all var(--transition-base) var(--ease-out)',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            className={!disabled ? 'hover:bg-input-background focus:ring-2 focus:ring-primary/20 focus:border-primary' : ''}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              overflow: 'hidden',
              flex: 1
            }}>
              {selectedOption ? (
                <>
                  {selectedOption.icon && (
                    <span style={{ flexShrink: 0 }}>
                      {selectedOption.icon}
                    </span>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    overflow: 'hidden',
                    minWidth: 0
                  }}>
                    <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      width: '100%',
                      textAlign: 'left'
                    }}>
                      {selectedOption.label}
                    </span>
                    {selectedOption.sublabel && (
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        color: 'var(--muted-foreground)',
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        width: '100%',
                        textAlign: 'left'
                      }}>
                        {selectedOption.sublabel}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                placeholder
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0" 
          style={{ 
            width: 'var(--radix-popover-trigger-width)',
            maxHeight: '400px',
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <Command style={{ backgroundColor: 'transparent' }}>
            <div style={{ 
              padding: '8px',
              borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}
                />
                <CommandInput 
                  placeholder={searchPlaceholder}
                  style={{
                    height: '36px',
                    paddingLeft: '36px',
                    fontSize: 'var(--text-body)',
                    backgroundColor: 'var(--input-background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  className="focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
            <CommandList style={{ maxHeight: '320px' }}>
              <CommandEmpty style={{ 
                padding: '24px',
                textAlign: 'center',
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)'
              }}>
                {emptyText}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange?.(option.value === value ? '' : option.value);
                      setOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontSize: 'var(--text-body)',
                      borderRadius: '6px',
                      margin: '2px 8px'
                    }}
                    className="hover:bg-accent"
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      width: '100%'
                    }}>
                      <Check
                        className={`h-4 w-4 ${value === option.value ? 'opacity-100' : 'opacity-0'}`}
                        style={{ color: 'var(--primary)' }}
                      />
                      {option.icon && (
                        <span style={{ flexShrink: 0 }}>
                          {option.icon}
                        </span>
                      )}
                      <div style={{ 
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <span style={{ 
                          color: 'var(--text)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {option.label}
                        </span>
                        {option.sublabel && (
                          <span style={{ 
                            fontSize: 'var(--text-xs)', 
                            color: 'var(--muted-foreground)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {option.sublabel}
                          </span>
                        )}
                        {option.description && (
                          <span style={{ 
                            fontSize: 'var(--text-xs)', 
                            color: 'var(--muted-foreground)',
                            marginTop: '2px'
                          }}>
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
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