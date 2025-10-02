import React from 'react';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface RiskWeight {
  label: string;
  value: number;
  description: string;
}

interface RiskWeightSliderProps {
  weights: RiskWeight[];
  onChange: (weights: RiskWeight[]) => void;
}

export function RiskWeightSlider({ weights, onChange }: RiskWeightSliderProps) {
  const updateWeight = (index: number, value: number) => {
    const newWeights = [...weights];
    newWeights[index].value = value;
    onChange(newWeights);
  };

  const total = weights.reduce((sum, w) => sum + w.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border">
        <span className="text-sm font-medium">Total Weight</span>
        <Badge variant={total === 100 ? 'default' : 'secondary'} className="font-mono">
          {total}%
        </Badge>
      </div>

      <div className="space-y-5">
        {weights.map((weight, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">{weight.label}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{weight.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium font-mono min-w-[50px] text-right">{weight.value}%</span>
            </div>
            <Slider
              value={[weight.value]}
              onValueChange={v => updateWeight(index, v[0])}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
          </div>
        ))}
      </div>

      {total !== 100 && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
          Total weight should equal 100%. Current: {total}%
        </div>
      )}
    </div>
  );
}
