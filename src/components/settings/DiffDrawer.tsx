import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '../ui/drawer';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ArrowRight } from 'lucide-react';

interface HistoryEntry {
  timestamp: string;
  actor: string;
  field: string;
  oldValue: string;
  newValue: string;
}

interface DiffDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  history: HistoryEntry[];
}

export function DiffDrawer({ open, onOpenChange, title, history }: DiffDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{title} History</DrawerTitle>
          <DrawerDescription>View all changes with before and after values</DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{entry.timestamp}</TableCell>
                  <TableCell className="font-medium text-sm">{entry.actor}</TableCell>
                  <TableCell className="text-sm">{entry.field}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <code className="px-2 py-1 rounded bg-destructive/10 text-destructive">{entry.oldValue}</code>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <code className="px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                        {entry.newValue}
                      </code>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
