import React from 'react';
import { Button } from '../ui/button';

interface StickyFooterProps {
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}

export function StickyFooter({ onCancel, onSave, disabled }: StickyFooterProps) {
  return (
    <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-background border-t shadow-lg">
      <div className="max-w-[1600px] mx-auto flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={disabled}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
