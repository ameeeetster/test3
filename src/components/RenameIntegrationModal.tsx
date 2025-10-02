import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import { isInstanceNameUnique } from '../data/integration-instances';

interface RenameIntegrationModalProps {
  open: boolean;
  onClose: () => void;
  currentName: string;
  instanceId: string;
  onSave: (newName: string) => void;
}

export function RenameIntegrationModal({
  open,
  onClose,
  currentName,
  instanceId,
  onSave,
}: RenameIntegrationModalProps) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    // Validate
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    if (name === currentName) {
      onClose();
      return;
    }

    if (!isInstanceNameUnique(name, instanceId)) {
      setError('An integration with this name already exists');
      return;
    }

    onSave(name);
    onClose();
  };

  const handleClose = () => {
    setName(currentName);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Integration</DialogTitle>
          <DialogDescription>
            Choose a unique, descriptive name for this integration instance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="integration-name">Instance Name</Label>
            <Input
              id="integration-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
              placeholder="Azure AD — Corp Prod"
              autoFocus
            />
            {error && (
              <div
                className="flex items-center gap-2 p-2 rounded"
                style={{
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                }}
              >
                <AlertCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>{error}</p>
              </div>
            )}
          </div>

          <div
            className="p-3 rounded"
            style={{
              backgroundColor: 'var(--info-bg)',
              border: '1px solid var(--info-border)',
            }}
          >
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--info)' }}>
              <strong>Note:</strong> Renaming this integration will not affect its configuration,
              connections, or scheduled jobs. The new name will be reflected throughout the system
              immediately.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
