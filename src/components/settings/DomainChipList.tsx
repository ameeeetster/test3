import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, X, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Domain {
  domain: string;
  status: 'verified' | 'pending';
}

interface DomainChipListProps {
  domains: Domain[];
  onChange: (domains: Domain[]) => void;
}

export function DomainChipList({ domains, onChange }: DomainChipListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [txtRecord, setTxtRecord] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddDomain = () => {
    if (!newDomain) return;
    const record = `iam-verify=${Math.random().toString(36).substring(2, 15)}`;
    setTxtRecord(record);
    onChange([...domains, { domain: newDomain, status: 'pending' }]);
  };

  const handleRemoveDomain = (index: number) => {
    onChange(domains.filter((_, i) => i !== index));
  };

  const handleRecheck = (index: number) => {
    const updated = [...domains];
    updated[index].status = Math.random() > 0.5 ? 'verified' : 'pending';
    onChange(updated);
    toast.success(updated[index].status === 'verified' ? 'Domain verified!' : 'Verification pending');
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const closeDialog = () => {
    setAddDialogOpen(false);
    setNewDomain('');
    setTxtRecord('');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {domains.map((domain, index) => (
          <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-accent/50">
            <span className="text-sm font-medium">{domain.domain}</span>
            <Badge variant={domain.status === 'verified' ? 'default' : 'secondary'} className="text-xs h-5">
              {domain.status === 'verified' ? 'Verified' : 'Pending'}
            </Badge>
            {domain.status === 'pending' && (
              <button
                onClick={() => handleRecheck(index)}
                className="p-0.5 hover:bg-background rounded transition-colors"
                title="Recheck verification"
              >
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => handleRemoveDomain(index)}
              className="p-0.5 hover:bg-background rounded transition-colors"
              title="Remove domain"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)} className="h-8">
          <Plus className="w-3 h-3 mr-1" />
          Add Domain
        </Button>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Domain</DialogTitle>
            <DialogDescription>Add a new domain and verify ownership via DNS TXT record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
              />
            </div>

            {txtRecord && (
              <div className="space-y-3 p-4 rounded-lg bg-accent/50 border">
                <div>
                  <Label className="text-xs font-semibold">Verification Instructions</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add the following TXT record to your DNS configuration:
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value="_iam-verification" readOnly className="font-mono text-xs flex-1" />
                    <Button variant="outline" size="sm" onClick={() => handleCopy('_iam-verification')}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input value={txtRecord} readOnly className="font-mono text-xs flex-1" />
                    <Button variant="outline" size="sm" onClick={() => handleCopy(txtRecord)}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  DNS changes may take up to 24 hours to propagate. Click "Recheck" to verify.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            {txtRecord ? (
              <Button onClick={closeDialog}>Done</Button>
            ) : (
              <Button onClick={handleAddDomain}>Generate TXT Record</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
