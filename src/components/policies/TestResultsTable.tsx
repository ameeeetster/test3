import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, ExternalLink } from 'lucide-react';

interface Violation {
  userId: string;
  userName: string;
  userEmail: string;
  conflictingItems: string[];
  apps: string[];
  severity: 'high' | 'medium' | 'low';
}

interface TestResultsTableProps {
  violations: Violation[];
  totalUsers: number;
  onViewUser?: (userId: string) => void;
}

export function TestResultsTable({ violations, totalUsers, onViewUser }: TestResultsTableProps) {
  const severityConfig = {
    high: { label: 'High', variant: 'destructive' as const, color: 'text-destructive' },
    medium: { label: 'Medium', variant: 'secondary' as const, color: 'text-yellow-600 dark:text-yellow-400' },
    low: { label: 'Low', variant: 'secondary' as const, color: 'text-blue-600 dark:text-blue-400' }
  };

  if (violations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Violations Found</h3>
        <p className="text-sm text-muted-foreground">
          Tested against {totalUsers.toLocaleString()} users. This policy is currently compliant.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <h3 className="text-sm font-semibold">
                {violations.length} Violation{violations.length !== 1 ? 's' : ''} Detected
              </h3>
              <p className="text-xs text-muted-foreground">
                Affecting {violations.length} of {totalUsers.toLocaleString()} users
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Conflicting Items</TableHead>
              <TableHead>Applications</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.map((violation, index) => {
              const config = severityConfig[violation.severity];
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{violation.userName}</div>
                      <div className="text-xs text-muted-foreground">{violation.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {violation.conflictingItems.slice(0, 2).map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {violation.conflictingItems.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{violation.conflictingItems.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {violation.apps.slice(0, 2).map((app, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                      {violation.apps.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{violation.apps.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="text-xs">
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewUser?.(violation.userId)}
                      className="h-8"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
