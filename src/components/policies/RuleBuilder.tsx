import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Plus, X, Search, TriangleAlert as AlertTriangle } from 'lucide-react';

interface SoDRule {
  type: 'mutual-exclusion' | 'conditional';
  leftSet: string[];
  rightSet: string[];
  exceptions: string[];
}

interface RuleBuilderProps {
  rule: SoDRule;
  onChange: (rule: SoDRule) => void;
}

const mockRoles = [
  { id: 'admin', name: 'Admin', type: 'role' },
  { id: 'auditor', name: 'Auditor', type: 'role' },
  { id: 'developer', name: 'Developer', type: 'role' },
  { id: 'finance-approve', name: 'Finance Approver', type: 'role' },
  { id: 'finance-create', name: 'Finance Creator', type: 'role' }
];

const mockUsers = [
  { id: 'user1', name: 'John Doe', email: 'john@acme.com' },
  { id: 'user2', name: 'Jane Smith', email: 'jane@acme.com' }
];

export function RuleBuilder({ rule, onChange }: RuleBuilderProps) {
  const [leftSetOpen, setLeftSetOpen] = useState(false);
  const [rightSetOpen, setRightSetOpen] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState(false);

  const addToSet = (set: 'left' | 'right', itemId: string) => {
    const setKey = set === 'left' ? 'leftSet' : 'rightSet';
    if (!rule[setKey].includes(itemId)) {
      onChange({ ...rule, [setKey]: [...rule[setKey], itemId] });
    }
  };

  const removeFromSet = (set: 'left' | 'right', itemId: string) => {
    const setKey = set === 'left' ? 'leftSet' : 'rightSet';
    onChange({ ...rule, [setKey]: rule[setKey].filter(id => id !== itemId) });
  };

  const addException = (userId: string) => {
    if (!rule.exceptions.includes(userId)) {
      onChange({ ...rule, exceptions: [...rule.exceptions, userId] });
    }
  };

  const removeException = (userId: string) => {
    onChange({ ...rule, exceptions: rule.exceptions.filter(id => id !== userId) });
  };

  const getItemName = (id: string) => {
    const item = mockRoles.find(r => r.id === id);
    return item?.name || id;
  };

  const getUserName = (id: string) => {
    const user = mockUsers.find(u => u.id === id);
    return user?.name || id;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Rule Type</Label>
        <Select value={rule.type} onValueChange={(v: any) => onChange({ ...rule, type: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mutual-exclusion">Mutual Exclusion (A vs B)</SelectItem>
            <SelectItem value="conditional">Conditional (IF A THEN NOT B)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {rule.type === 'mutual-exclusion'
            ? 'Users cannot have roles/entitlements from both sets'
            : 'If user has items from left set, they cannot have items from right set'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {rule.type === 'conditional' ? 'IF User Has' : 'Left Set'}
            </Label>
            <Popover open={leftSetOpen} onOpenChange={setLeftSetOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search roles..." />
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {mockRoles
                      .filter(r => !rule.leftSet.includes(r.id))
                      .map(role => (
                        <CommandItem
                          key={role.id}
                          onSelect={() => {
                            addToSet('left', role.id);
                            setLeftSetOpen(false);
                          }}
                        >
                          <Badge variant="secondary" className="text-xs mr-2">
                            {role.type}
                          </Badge>
                          {role.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="min-h-[100px] p-3 rounded-lg border bg-accent/30">
            {rule.leftSet.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No items selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rule.leftSet.map(id => (
                  <Badge key={id} variant="secondary" className="gap-2">
                    {getItemName(id)}
                    <button
                      onClick={() => removeFromSet('left', id)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {rule.type === 'conditional' ? 'THEN Cannot Have' : 'Right Set'}
            </Label>
            <Popover open={rightSetOpen} onOpenChange={setRightSetOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search roles..." />
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {mockRoles
                      .filter(r => !rule.rightSet.includes(r.id))
                      .map(role => (
                        <CommandItem
                          key={role.id}
                          onSelect={() => {
                            addToSet('right', role.id);
                            setRightSetOpen(false);
                          }}
                        >
                          <Badge variant="secondary" className="text-xs mr-2">
                            {role.type}
                          </Badge>
                          {role.name}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="min-h-[100px] p-3 rounded-lg border bg-accent/30">
            {rule.rightSet.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No items selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rule.rightSet.map(id => (
                  <Badge key={id} variant="secondary" className="gap-2">
                    {getItemName(id)}
                    <button
                      onClick={() => removeFromSet('right', id)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Exceptions</Label>
            <p className="text-xs text-muted-foreground">Users/groups exempt from this rule</p>
          </div>
          <Popover open={exceptionOpen} onOpenChange={setExceptionOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-3 h-3 mr-1" />
                Add Exception
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search users..." />
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {mockUsers
                    .filter(u => !rule.exceptions.includes(u.id))
                    .map(user => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => {
                          addException(user.id);
                          setExceptionOpen(false);
                        }}
                      >
                        <div>
                          <div className="text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {rule.exceptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.exceptions.map(id => (
              <Badge key={id} variant="outline" className="gap-2">
                {getUserName(id)}
                <button onClick={() => removeException(id)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {rule.leftSet.length > 0 && rule.rightSet.length > 0 && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-600 dark:text-blue-400">
            <p className="font-medium mb-1">Rule Preview</p>
            <p>
              {rule.type === 'mutual-exclusion'
                ? `Users cannot have both "${getItemName(rule.leftSet[0])}" and "${getItemName(rule.rightSet[0])}"`
                : `If user has "${getItemName(rule.leftSet[0])}", they cannot have "${getItemName(rule.rightSet[0])}"`}
              {rule.exceptions.length > 0 && ` (${rule.exceptions.length} exceptions)`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
