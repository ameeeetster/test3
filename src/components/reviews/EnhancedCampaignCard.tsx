import React from 'react';
import { Calendar, Users, AlertCircle, CheckCircle2, Clock, MoreHorizontal, Bell, ArrowUpRight, Calendar as CalendarExtend, FileDown, Sparkles, AlertTriangle, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { getRelativeDateText, formatDate } from '../../lib/dateUtils';

interface CampaignCardProps {
  id: string;
  name: string;
  type: 'User' | 'Application' | 'Privileged' | 'Role';
  scope: string;
  itemCount: number;
  reviewerCount: number;
  status: 'Draft' | 'Active' | 'Completed' | 'Overdue';
  progress: number;
  progressSegments?: {
    keep: number;
    revoke: number;
    delegate: number;
    timeBound: number;
  };
  dueDate: string;
  riskCount?: number;
  owner?: string;
  reviewerModel?: 'Manager' | 'App Owner' | 'Custom';
  health?: {
    blocked?: number;
    reminders?: number;
    escalations?: number;
  };
  aiSummary?: {
    highRisk: number;
    unused90d: number;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRemind?: () => void;
  onEscalate?: () => void;
  onExtendDue?: () => void;
  onExport?: () => void;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export function EnhancedCampaignCard({
  name,
  type,
  scope,
  itemCount,
  reviewerCount,
  status,
  progress,
  progressSegments,
  dueDate,
  riskCount = 0,
  owner,
  reviewerModel = 'Manager',
  health = {},
  aiSummary,
  onClick,
  onEdit,
  onDelete,
  onRemind,
  onEscalate,
  onExtendDue,
  onExport,
  isSelected,
  onSelect,
}: CampaignCardProps) {
  const statusConfig = {
    Draft: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: Clock },
    Active: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', icon: Clock },
    Completed: { color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2 },
    Overdue: { color: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300', icon: AlertCircle },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const { text: dueDateText, variant: dueDateVariant } = getRelativeDateText(dueDate);
  
  const dueDateColors = {
    neutral: 'text-slate-600 dark:text-slate-400',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  // Calculate coverage percentage
  const totalDecisions = progressSegments 
    ? progressSegments.keep + progressSegments.revoke + progressSegments.delegate + progressSegments.timeBound
    : 0;
  const coverage = totalDecisions > 0 ? Math.round((totalDecisions / itemCount) * 100) : progress;

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-slate-900 p-5 transition-all duration-150 ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
          />
        )}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium">{name}</h3>
              <Badge variant="outline" className="text-xs">
                {type}
              </Badge>
              {owner && (
                <Badge variant="secondary" className="text-xs">
                  {owner}
                </Badge>
              )}
            </div>
            <div className={`px-2 py-1 rounded-md text-xs flex items-center gap-1 shrink-0 ${config.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{scope}</span>
            <span>•</span>
            <span className="text-xs">{reviewerModel}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Items</div>
          <div className="font-medium">{itemCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Reviewers</div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{reviewerCount}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-0.5">Due</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1 text-sm font-medium ${dueDateColors[dueDateVariant]}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dueDateText}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formatDate(dueDate)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Segmented Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className="font-medium">{coverage}% coverage</span>
        </div>
        {progressSegments ? (
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {progressSegments.keep > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="bg-success h-full"
                      style={{ width: `${(progressSegments.keep / itemCount) * 100}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{progressSegments.keep} Keep</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {progressSegments.revoke > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="bg-danger h-full"
                      style={{ width: `${(progressSegments.revoke / itemCount) * 100}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{progressSegments.revoke} Revoke</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {progressSegments.delegate > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="bg-info h-full"
                      style={{ width: `${(progressSegments.delegate / itemCount) * 100}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{progressSegments.delegate} Delegate</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {progressSegments.timeBound > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="bg-warning h-full"
                      style={{ width: `${(progressSegments.timeBound / itemCount) * 100}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{progressSegments.timeBound} Time-bound</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : (
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Health indicators */}
      {(health.blocked || health.reminders || health.escalations) && (
        <div className="flex items-center gap-3 mb-3 text-xs">
          {health.blocked !== undefined && health.blocked > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{health.blocked}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{health.blocked} reviewer{health.blocked > 1 ? 's' : ''} blocked</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {health.reminders !== undefined && health.reminders > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{health.reminders}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{health.reminders} reminder{health.reminders > 1 ? 's' : ''} sent</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {health.escalations !== undefined && health.escalations > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-danger">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{health.escalations}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{health.escalations} escalation{health.escalations > 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* AI Summary */}
      {aiSummary && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full mb-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {aiSummary.highRisk} high-risk items • {aiSummary.unused90d} unused >90d
            </span>
          </div>
        </button>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="flex-1"
        >
          Open
        </Button>
        {onRemind && status === 'Active' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemind();
                  }}
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send reminder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onEscalate && status === 'Active' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEscalate();
                  }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Escalate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onExtendDue && (status === 'Active' || status === 'Overdue') && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExtendDue();
                  }}
                >
                  <CalendarExtend className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Extend due date</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onExport && status === 'Completed' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport();
                  }}
                >
                  <FileDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export decisions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit campaign</DropdownMenuItem>}
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>View details</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>Duplicate</DropdownMenuItem>
            {onDelete && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-danger">Archive</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}