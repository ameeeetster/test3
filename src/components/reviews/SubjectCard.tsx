import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ProgressDonut } from './ProgressDonut';
import { RiskChip } from '../RiskChip';

interface SubjectCardProps {
  name: string;
  department: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  total: number;
  reviewed: number;
  isActive?: boolean;
  onClick?: () => void;
  slaRemaining?: string;
}

export function SubjectCard({ name, department, risk, total, reviewed, isActive, onClick, slaRemaining }: SubjectCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const percentage = Math.round((reviewed / total) * 100) || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-all border-l-2 ${
        isActive
          ? 'bg-primary/10 dark:bg-primary/20 border-l-primary shadow-sm'
          : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
      style={{ minHeight: '56px' }}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate mb-0.5">{name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">{department}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <RiskChip risk={risk} size="sm" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {reviewed}/{total}
          </span>
          {slaRemaining && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium">
              {slaRemaining}
            </span>
          )}
        </div>
      </div>

      <ProgressDonut value={reviewed} max={total} size="sm" showLabel={false} />
    </button>
  );
}
