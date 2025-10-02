import React from 'react';
import { ArrowRight, Code2 } from 'lucide-react';
import { TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';

export interface AttributeMapping {
  id: string;
  sourceAttribute: string;
  targetAttribute: string;
  transform?: string;
  required: boolean;
  dataType: string;
}

interface MappingRowProps {
  mapping: AttributeMapping;
}

export function MappingRow({ mapping }: MappingRowProps) {
  return (
    <TableRow className="transition-colors hover:bg-surface/50">
      <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
        <code
          className="px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'var(--surface)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'monospace',
            color: 'var(--text)',
          }}
        >
          {mapping.sourceAttribute}
        </code>
      </TableCell>
      <TableCell className="text-center">
        <ArrowRight className="w-4 h-4 mx-auto" style={{ color: 'var(--muted-foreground)' }} />
      </TableCell>
      <TableCell style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
        <code
          className="px-2 py-0.5 rounded"
          style={{
            backgroundColor: 'var(--surface)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'monospace',
            color: 'var(--text)',
          }}
        >
          {mapping.targetAttribute}
        </code>
      </TableCell>
      <TableCell>
        {mapping.transform ? (
          <Badge
            variant="outline"
            className="gap-1"
            style={{
              backgroundColor: 'var(--info-bg)',
              borderColor: 'var(--info-border)',
              color: 'var(--info)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <Code2 className="w-3 h-3" />
            {mapping.transform}
          </Badge>
        ) : (
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            Direct
          </span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          style={{
            fontSize: 'var(--text-xs)',
            backgroundColor: 'var(--surface)',
          }}
        >
          {mapping.dataType}
        </Badge>
      </TableCell>
      <TableCell>
        {mapping.required && (
          <Badge
            variant="outline"
            style={{
              backgroundColor: 'var(--warning-bg-subtle)',
              borderColor: 'var(--warning-border)',
              color: 'var(--warning)',
              fontSize: 'var(--text-xs)',
            }}
          >
            Required
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
