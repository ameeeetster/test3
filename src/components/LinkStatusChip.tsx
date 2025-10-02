import { Link2, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';

export type LinkStatus = 'Linked' | 'Unlinked' | 'Ambiguous';

interface LinkStatusChipProps {
  status: LinkStatus;
  onClick?: () => void;
}

export function LinkStatusChip({ status, onClick }: LinkStatusChipProps) {
  if (status === 'Linked') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
        <Link2 className="w-3 h-3" />
        Linked
      </div>
    );
  }

  if (status === 'Unlinked') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="h-7 px-2 gap-1.5 text-xs font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/50"
      >
        <AlertCircle className="w-3 h-3" />
        Link
      </Button>
    );
  }

  // Ambiguous
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-7 px-2 gap-1.5 text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/50"
    >
      <HelpCircle className="w-3 h-3" />
      Resolve
    </Button>
  );
}
