import React from 'react';
import { Calendar, Users, AlertCircle, CheckCircle2, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface CampaignCardProps {
  id: string;
  name: string;
  type: 'User' | 'Application' | 'Privileged' | 'Role';
  scope: string;
  itemCount: number;
  reviewerCount: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Overdue';
  progress: number;
  dueDate: string;
  riskCount?: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRemind?: () => void;
}

export function CampaignCard({
  name,
  type,
  scope,
  itemCount,
  reviewerCount,
  status,
  progress,
  dueDate,
  riskCount = 0,
  onClick,
  onEdit,
  onDelete,
  onRemind,
}: CampaignCardProps) {
  const statusConfig = {
    Draft: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Clock },
    Active: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: Clock },
    Completed: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2 },
    Overdue: { color: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300', icon: AlertCircle },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className="rounded-xl border border-border bg-slate-50 dark:bg-slate-800 p-5 hover:shadow-md transition-all cursor-pointer shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{name}</h3>
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">{scope}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 ${config.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</DropdownMenuItem>}
              {onRemind && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRemind(); }}>Send reminder</DropdownMenuItem>}
              {onDelete && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-danger">Delete</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
        <div>
          <div className="text-xs text-slate-500 mb-1">Items</div>
          <div className="text-lg font-medium">{itemCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Reviewers</div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-lg font-medium">{reviewerCount}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Due Date</div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm">{dueDate}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        {riskCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-warning mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            {riskCount} high-risk items flagged
          </div>
        )}
      </div>
    </div>
  );
}
