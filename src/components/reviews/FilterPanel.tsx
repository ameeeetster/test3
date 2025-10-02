import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export function FilterPanel({ isOpen, onClose, onApply }: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-border shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter sections */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <Label className="mb-3 block">Status</Label>
              <div className="space-y-2">
                {['Active', 'Completed', 'Overdue', 'Scheduled'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox id={`status-${status}`} />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <Label className="mb-3 block">Review Type</Label>
              <div className="space-y-2">
                {['User', 'Application', 'Role', 'Privileged'].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox id={`type-${type}`} />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Owner */}
            <div>
              <Label htmlFor="owner-filter" className="mb-3 block">Owner</Label>
              <Select>
                <SelectTrigger id="owner-filter">
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">Me</SelectItem>
                  <SelectItem value="sarah">Sarah Chen</SelectItem>
                  <SelectItem value="alex">Alex Kim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Window */}
            <div>
              <Label htmlFor="due-filter" className="mb-3 block">Due Window</Label>
              <Select>
                <SelectTrigger id="due-filter">
                  <SelectValue placeholder="Select timeframe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Due today</SelectItem>
                  <SelectItem value="week">Due in 7 days</SelectItem>
                  <SelectItem value="month">Due in 30 days</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Level */}
            <div>
              <Label className="mb-3 block">Risk Level</Label>
              <div className="space-y-2">
                {['High', 'Medium', 'Low'].map((risk) => (
                  <label key={risk} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox id={`risk-${risk}`} />
                    <span className="text-sm">{risk}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <Label htmlFor="recurrence-filter" className="mb-3 block">Recurrence</Label>
              <Select>
                <SelectTrigger id="recurrence-filter">
                  <SelectValue placeholder="Select frequency..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-8 pt-6 border-t border-border">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onApply({})}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}