import { useState } from 'react';
import { Copy, Check, MoreHorizontal } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

interface AttributesPeekPopoverProps {
  attributes: Record<string, any>;
  topN?: number;
}

export function AttributesPeekPopover({ attributes, topN = 3 }: AttributesPeekPopoverProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Get top N attributes (excluding common ones that are already in columns)
  const excludeKeys = ['username', 'email', 'status', 'lastSyncAt', 'groupsCount', 'sourceKey'];
  const topAttributes = Object.entries(attributes)
    .filter(([key]) => !excludeKeys.includes(key))
    .slice(0, topN);

  const remainingCount = Math.max(0, Object.keys(attributes).length - topN);

  const copyToClipboard = (key: string, value: any) => {
    const textValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(textValue);
    setCopiedKey(key);
    toast.success(`Copied ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    const str = String(value);
    if (str.length > 50) return str.substring(0, 50) + '...';
    return str;
  };

  if (topAttributes.length === 0) {
    return (
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        No additional attributes
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}
        >
          <span>{topAttributes.length} attributes</span>
          {remainingCount > 0 && (
            <span style={{ color: 'var(--muted)' }}>+{remainingCount} more</span>
          )}
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[320px] p-3"
        style={{
          backgroundColor: 'var(--popover)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="space-y-2">
          <div
            className="mb-2"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 500 }}
          >
            Top {topN} Attributes
          </div>
          {topAttributes.map(([key, value]) => (
            <div
              key={key}
              className="group flex items-start justify-between gap-2 p-2 rounded-md border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="font-mono truncate"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                >
                  {key}
                </div>
                <div
                  className="font-medium break-words"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
                >
                  {formatValue(value)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(key, value)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 flex-shrink-0"
              >
                {copiedKey === key ? (
                  <Check className="w-3 h-3" style={{ color: 'var(--success)' }} />
                ) : (
                  <Copy className="w-3 h-3" style={{ color: 'var(--muted)' }} />
                )}
              </Button>
            </div>
          ))}
          {remainingCount > 0 && (
            <div
              className="text-center pt-2 border-t mt-2"
              style={{ 
                fontSize: 'var(--text-xs)', 
                color: 'var(--muted)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="pt-2">
                Click row to view all {Object.keys(attributes).length} attributes
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}