import React from 'react';
import { useUser, UserRole, getRoleLabel, getRoleDescription } from '../contexts/UserContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { UserCircle, Check, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';

export function RoleSwitcher() {
  const { user, setUserRole } = useUser();

  const roles: UserRole[] = ['end-user', 'approver', 'administrator'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          style={{ 
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px'
          }}
        >
          <UserCircle className="w-4 h-4" strokeWidth={2} />
          <span>{getRoleLabel(user.role)}</span>
          <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} style={{ opacity: 0.5 }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        style={{ 
          width: '280px',
          backgroundColor: 'var(--popover)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '8px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <DropdownMenuLabel style={{ 
          fontSize: '11px',
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.05em',
          padding: '8px 12px 4px'
        }}>
          Switch Role (Demo)
        </DropdownMenuLabel>
        <DropdownMenuSeparator style={{ 
          backgroundColor: 'var(--border)',
          margin: '8px 0'
        }} />
        {roles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => setUserRole(role)}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '4px',
              backgroundColor: user.role === role ? 'var(--accent)' : 'transparent',
            }}
          >
            <div style={{ 
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              {user.role === role && (
                <Check className="w-4 h-4" style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getRoleLabel(role)}
                {user.role === role && (
                  <Badge style={{
                    backgroundColor: 'rgb(238 242 255)',
                    color: 'var(--primary)',
                    border: '1px solid rgb(224 231 255)',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    Active
                  </Badge>
                )}
              </div>
              <div style={{ 
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                lineHeight: '1.4'
              }}>
                {getRoleDescription(role)}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}