import { useState } from 'react';
import { Link2, UserPlus, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import type { Account, MatchCandidate } from '../data/managed-accounts';

interface IdentityLinkingModalProps {
  account: Account;
  candidates: MatchCandidate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (accountId: string, identityId: string) => void;
  onCreateNew: (accountId: string) => void;
  onIgnore: (accountId: string) => void;
}

export function IdentityLinkingModal({
  account,
  candidates,
  open,
  onOpenChange,
  onLink,
  onCreateNew,
  onIgnore,
}: IdentityLinkingModalProps) {
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(null);

  const handleLink = () => {
    if (!selectedIdentityId) return;
    onLink(account.id, selectedIdentityId);
    onOpenChange(false);
    toast.success('Account linked to identity');
  };

  const handleCreateNew = () => {
    onCreateNew(account.id);
    onOpenChange(false);
    toast.success('New identity created and linked');
  };

  const handleIgnore = () => {
    onIgnore(account.id);
    onOpenChange(false);
    toast.info('Account marked as ignored');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-700 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        style={{ backgroundColor: 'var(--overlay)', borderColor: 'var(--border)' }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
            Link Account to Identity
          </DialogTitle>
          <DialogDescription style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            {candidates.length > 0
              ? `Select the correct identity match for this account from ${candidates.length} potential ${candidates.length === 1 ? 'match' : 'matches'}.`
              : 'No automatic matches found. You can create a new identity or manually search for one.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Account Info */}
          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div
                  className="font-medium mb-1"
                  style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}
                >
                  {account.username || account.email}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  Source ID: {account.sourceKey}
                </div>
              </div>
              <Badge variant="outline">{account.linkStatus}</Badge>
            </div>
            {account.email && account.username !== account.email && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                {account.email}
              </div>
            )}
          </div>

          {/* Explanation */}
          {account.linkStatus === 'Ambiguous' && (
            <div
              className="flex gap-3 p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--warning-bg)',
                borderColor: 'var(--warning-border)',
              }}
            >
              <AlertCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: 'var(--warning)' }}
              />
              <div>
                <div
                  className="font-medium mb-1"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                >
                  Multiple potential matches found
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  We found {candidates.length} possible identities that could match this account. Review
                  the confidence scores and select the correct match.
                </div>
              </div>
            </div>
          )}

          {account.linkStatus === 'Unlinked' && candidates.length === 0 && (
            <div
              className="flex gap-3 p-3 rounded-lg border"
              style={{
                backgroundColor: 'var(--info-bg)',
                borderColor: 'var(--info-border)',
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)' }} />
              <div>
                <div
                  className="font-medium mb-1"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                >
                  No matches found
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  We couldn't automatically find a matching identity. You can create a new identity or
                  manually search for one.
                </div>
              </div>
            </div>
          )}

          {/* Candidates */}
          {candidates.length > 0 && (
            <div>
              <div
                className="mb-3"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontWeight: 500 }}
              >
                Potential Matches ({candidates.length})
              </div>
              <ScrollArea className="max-h-[300px] -mx-1 px-1">
                <div className="space-y-2">
                  {candidates.map((candidate) => (
                    <button
                      key={candidate.identityId}
                      onClick={() => setSelectedIdentityId(candidate.identityId)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedIdentityId === candidate.identityId
                          ? 'ring-2 ring-offset-0'
                          : 'hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor:
                          selectedIdentityId === candidate.identityId
                            ? 'var(--primary)'
                            : 'var(--border)',
                        ringColor: 'var(--primary)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'var(--primary-foreground)',
                            }}
                          >
                            {candidate.identity.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div
                              className="font-medium"
                              style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}
                            >
                              {candidate.identity.name}
                            </div>
                            <div
                              className={`font-semibold flex-shrink-0 ${getScoreColor(
                                candidate.score
                              )}`}
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {candidate.score}%
                            </div>
                          </div>
                          <div
                            className="mb-2"
                            style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}
                          >
                            {candidate.identity.email}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.matchReasons.map((reason, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button variant="ghost" onClick={handleIgnore} className="gap-2">
              <X className="w-4 h-4" />
              Ignore
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateNew} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Create New Identity
              </Button>
              <Button
                onClick={handleLink}
                disabled={!selectedIdentityId}
                className="gap-2"
              >
                <Link2 className="w-4 h-4" />
                Link Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
