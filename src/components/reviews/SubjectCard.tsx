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
}

export function SubjectCard({ name, department, risk, total, reviewed, isActive, onClick }: SubjectCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const percentage = Math.round((reviewed / total) * 100) || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-l-2 ${
        isActive
          ? 'bg-slate-100 dark:bg-slate-700 border-l-primary'
          : 'border-l-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-slate-500 truncate">{department}</div>
        <div className="flex items-center gap-2 mt-1">
          <RiskChip risk={risk} size="sm" />
          <span className="text-xs text-slate-500">
            {reviewed}/{total} items
          </span>
        </div>
      </div>

      <ProgressDonut value={reviewed} max={total} size="sm" showLabel={false} />
    </button>
  );
}
