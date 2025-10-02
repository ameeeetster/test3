import React from 'react';
import { Sparkles, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Clock, Shield, Eye, Check } from 'lucide-react';
import { Button } from '../ui/button';

interface AIRecommendation {
  id: string;
  type: 'keep' | 'revoke' | 'time-bound' | 'flag';
  confidence: number;
  reason: string;
  itemCount: number;
}

interface AIAssistPanelProps {
  recommendations: AIRecommendation[];
  onApplyAll?: () => void;
  onFilterRisky?: () => void;
  onPreview?: (rec: AIRecommendation) => void;
  onApply?: (rec: AIRecommendation) => void;
}

export function AIAssistPanel({ recommendations, onApplyAll, onFilterRisky, onPreview, onApply }: AIAssistPanelProps) {
  const iconMap = {
    keep: <CheckCircle2 className="w-4 h-4 text-success" />,
    revoke: <AlertTriangle className="w-4 h-4 text-danger" />,
    'time-bound': <Clock className="w-4 h-4 text-warning" />,
    flag: <Shield className="w-4 h-4 text-info" />,
  };

  const labelMap = {
    keep: 'Keep',
    revoke: 'Revoke',
    'time-bound': 'Time-bound',
    flag: 'Flag for review',
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Recommendations</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-2 mb-3">
              {iconMap[rec.type]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{labelMap[rec.type]}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {rec.itemCount} {rec.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{rec.reason}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{rec.confidence}%</span>
                <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => onPreview?.(rec)}
              >
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => onApply?.(rec)}
              >
                <Check className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Button onClick={onApplyAll} variant="outline" className="w-full justify-start" size="sm">
          <Sparkles className="w-3.5 h-3.5 mr-2" />
          Apply all safe recommendations
        </Button>
        <Button onClick={onFilterRisky} variant="outline" className="w-full justify-start" size="sm">
          <AlertTriangle className="w-3.5 h-3.5 mr-2" />
          Show only risky/unused items
        </Button>
      </div>
    </div>
  );
}
