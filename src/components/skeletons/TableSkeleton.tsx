import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 8, columns = 6 }: TableSkeletonProps) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="h-10 px-2 text-left align-middle">
                  <div
                    className="h-3 rounded"
                    style={{ backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 15%, transparent)' }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b" style={{ borderColor: 'var(--border)' }}>
                {Array.from({ length: columns }).map((__, c) => (
                  <td key={c} className="p-2">
                    <div
                      className="h-3 rounded animate-pulse"
                      style={{
                        backgroundColor:
                          'color-mix(in oklab, var(--muted-foreground) 12%, transparent)',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


