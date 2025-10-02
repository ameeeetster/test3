import { useState } from 'react';
import { Check, Columns3, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import type { ColumnPreset } from '../data/managed-accounts';

interface ColumnPickerProps {
  availableColumns: string[];
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  presets?: ColumnPreset[];
}

export function ColumnPicker({
  availableColumns,
  selectedColumns,
  onColumnsChange,
  presets = [],
}: ColumnPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filteredColumns = availableColumns.filter((col) =>
    col.toLowerCase().includes(search.toLowerCase())
  );

  const toggleColumn = (column: string) => {
    if (selectedColumns.includes(column)) {
      onColumnsChange(selectedColumns.filter((c) => c !== column));
    } else {
      onColumnsChange([...selectedColumns, column]);
    }
  };

  const applyPreset = (preset: ColumnPreset) => {
    onColumnsChange(preset.columns);
  };

  const selectAll = () => {
    onColumnsChange(availableColumns);
  };

  const clearAll = () => {
    onColumnsChange([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns3 className="w-4 h-4" />
          Columns
          {selectedColumns.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 min-w-[20px] h-5">
              {selectedColumns.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[400px] p-0"
        style={{
          backgroundColor: 'var(--popover)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h4
              className="font-medium mb-1"
              style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}
            >
              Customize Columns
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              Add extra attribute columns for power users. Click any row to view all attributes in detail.
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--muted)' }}
            />
            <Input
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <>
              <div>
                <div
                  className="mb-2"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}
                >
                  Presets
                </div>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
              {selectedColumns.length} of {availableColumns.length} selected
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
                Clear
              </Button>
            </div>
          </div>

          {/* Column List */}
          <ScrollArea className="h-[300px] -mx-1 px-1">
            <div className="space-y-1">
              {filteredColumns.map((column) => {
                const isSelected = selectedColumns.includes(column);
                return (
                  <button
                    key={column}
                    onClick={() => toggleColumn(column)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span
                      className="text-left font-mono"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: isSelected ? 'var(--text)' : 'var(--muted)',
                      }}
                    >
                      {column}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    )}
                  </button>
                );
              })}
              {filteredColumns.length === 0 && (
                <div
                  className="text-center py-8"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}
                >
                  No columns found
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
