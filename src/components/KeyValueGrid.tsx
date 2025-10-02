import { useState, useMemo } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface KeyValueGridProps {
  data: Record<string, any>;
  columns?: 2 | 3 | 4;
  maskSecrets?: boolean;
  searchable?: boolean;
}

export function KeyValueGrid({ 
  data, 
  columns = 2, 
  maskSecrets = true,
  searchable = false 
}: KeyValueGridProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (key: string, value: any) => {
    const textValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    navigator.clipboard.writeText(textValue);
    setCopiedKey(key);
    toast.success(`Copied ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatValue = (value: any, key: string): string => {
    if (value === null || value === undefined) return '—';

    // Mask potential secrets
    const secretKeys = ['password', 'secret', 'token', 'key', 'credential'];
    if (maskSecrets && secretKeys.some((k) => key.toLowerCase().includes(k))) {
      return '••••••••';
    }

    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }

    return String(value);
  };

  const entries = useMemo(() => {
    const allEntries = Object.entries(data);
    
    if (!searchable || !searchQuery) {
      return allEntries;
    }

    const query = searchQuery.toLowerCase();
    return allEntries.filter(([key, value]) => {
      const keyMatch = key.toLowerCase().includes(query);
      const valueMatch = String(value).toLowerCase().includes(query);
      return keyMatch || valueMatch;
    });
  }, [data, searchQuery, searchable]);

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted)' }}
          />
          <Input
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {entries.length > 0 ? (
        <div
          className={`grid gap-4 ${
            columns === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : columns === 3
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="group p-3 rounded-lg border"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <dt
                  className="font-mono break-all"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
                >
                  {key}
                </dt>
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
              <dd
                className="font-medium break-words"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}
              >
                {formatValue(value, key)}
              </dd>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-8 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--surface)', 
            borderColor: 'var(--border)',
            color: 'var(--muted)',
            fontSize: 'var(--text-sm)',
          }}
        >
          No attributes found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
