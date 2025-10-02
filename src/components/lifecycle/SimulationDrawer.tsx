import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../ui/drawer';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Play } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SimulationResult {
  app: string;
  action: 'grant' | 'revoke' | 'create';
  target: string;
  timing: string;
  status: 'success' | 'blocked' | 'requires-approval';
  reason?: string;
}

interface SimulationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'joiner' | 'mover' | 'leaver';
}

export function SimulationDrawer({ open, onOpenChange, mode }: SimulationDrawerProps) {
  const [userName, setUserName] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);

  const mockResults: SimulationResult[] = [
    {
      app: 'Slack',
      action: 'create',
      target: 'Account',
      timing: 'Immediate',
      status: 'success'
    },
    {
      app: 'GitHub',
      action: 'grant',
      target: 'Engineering Team',
      timing: 'Immediate',
      status: 'success'
    },
    {
      app: 'Salesforce',
      action: 'grant',
      target: 'Admin Role',
      timing: '+1 day',
      status: 'requires-approval',
      reason: 'High-risk role requires manager approval'
    },
    {
      app: 'SAP',
      action: 'grant',
      target: 'Finance Approver',
      timing: 'Immediate',
      status: 'blocked',
      reason: 'SoD conflict: User already has Finance Creator'
    }
  ];

  const handleRun = () => {
    if (!userName) {
      toast.error('Please enter a user identifier');
      return;
    }

    setRunning(true);
    setTimeout(() => {
      setResults(mockResults);
      setRunning(false);
      toast.success('Simulation complete');
    }, 2000);
  };

  const statusConfig = {
    success: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: 'Success' },
    blocked: { icon: XCircle, color: 'text-destructive', label: 'Blocked' },
    'requires-approval': { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', label: 'Needs Approval' }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Run Lifecycle Simulation</DrawerTitle>
          <DrawerDescription>
            Test {mode} rules against a user to preview planned actions and identify conflicts
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">User Identifier</Label>
              <Input
                id="user-name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="email@acme.com or employee ID"
              />
              <p className="text-xs text-muted-foreground">
                Enter an existing user to test rules, or use sample data
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleRun} disabled={running}>
                {running ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setUserName('sample-finance-nyc')}>
                Use Sample
              </Button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Simulation Results</h3>
                <Badge variant="secondary">{results.length} actions planned</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-muted-foreground">Success</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {results.filter(r => r.status === 'success').length}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-muted-foreground">Needs Approval</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {results.filter(r => r.status === 'requires-approval').length}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs font-medium text-muted-foreground">Blocked</span>
                  </div>
                  <div className="text-2xl font-semibold">
                    {results.filter(r => r.status === 'blocked').length}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Timing</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => {
                      const config = statusConfig[result.status];
                      const Icon = config.icon;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.app}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {result.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{result.target}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{result.timing}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-4 h-4 ${config.color}`} />
                                <span className={`text-xs ${config.color}`}>{config.label}</span>
                              </div>
                              {result.reason && (
                                <p className="text-xs text-muted-foreground">{result.reason}</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {results.some(r => r.status === 'blocked') && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-destructive">
                    <p className="font-medium mb-1">Conflicts Detected</p>
                    <p>Some actions are blocked due to policy violations. Review and resolve before proceeding.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {results.length > 0 && (
            <Button>Apply as Draft Changes</Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
