import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface DirtyStateBannerProps {
  onSave: () => void;
  onDiscard: () => void;
}

export function DirtyStateBanner({ onSave, onDiscard }: DirtyStateBannerProps) {
  return (
    <div className="sticky top-16 z-20 -mx-6 px-6 py-3 bg-warning/10 border-b border-warning/20">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-warning" />
          <span className="font-medium">You have unsaved changes</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDiscard}>
            Discard
          </Button>
          <Button size="sm" onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
