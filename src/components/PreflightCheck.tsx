import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface PreflightTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'warning' | 'failed';
  message?: string;
  duration?: number;
}

interface PreflightCheckProps {
  connectorId: string;
  config: Record<string, any>;
  onComplete?: (allPassed: boolean) => void;
}

export function PreflightCheck({ connectorId, config, onComplete }: PreflightCheckProps) {
  const [tests, setTests] = useState<PreflightTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Initialize tests based on connector type
  useEffect(() => {
    const baseTests: PreflightTest[] = [
      {
        id: 'connection',
        name: 'Connection Test',
        description: 'Verify network connectivity to the service',
        status: 'pending',
      },
      {
        id: 'authentication',
        name: 'Authentication',
        description: 'Validate credentials and permissions',
        status: 'pending',
      },
      {
        id: 'permissions',
        name: 'Permission Check',
        description: 'Ensure required API permissions are granted',
        status: 'pending',
      },
      {
        id: 'discovery',
        name: 'Discovery Test',
        description: 'Attempt to discover users and groups',
        status: 'pending',
      },
      {
        id: 'mapping',
        name: 'Attribute Mapping',
        description: 'Verify attribute mappings are valid',
        status: 'pending',
      },
    ];

    setTests(baseTests);
  }, [connectorId]);

  const runTests = async () => {
    setIsRunning(true);
    setHasRun(true);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      
      // Mark as running
      setTests((prev) =>
        prev.map((t) => (t.id === test.id ? { ...t, status: 'running' } : t))
      );

      // Simulate test execution
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

      // Simulate test results (in real app, actually call APIs)
      const passed = Math.random() > 0.15; // 85% pass rate for demo
      const hasWarning = !passed && Math.random() > 0.5;

      let message = '';
      if (test.id === 'connection') {
        message = passed
          ? 'Successfully connected to the service'
          : 'Connection timeout - check network settings';
      } else if (test.id === 'authentication') {
        message = passed
          ? 'Credentials validated successfully'
          : 'Authentication failed - verify client ID and secret';
      } else if (test.id === 'permissions') {
        message = passed
          ? 'All required permissions are granted'
          : hasWarning
          ? 'Some optional permissions are missing - functionality may be limited'
          : 'Missing required permissions - grant User.Read.All';
      } else if (test.id === 'discovery') {
        message = passed
          ? 'Successfully discovered 5 users and 3 groups'
          : 'Unable to query users - check scope configuration';
      } else if (test.id === 'mapping') {
        message = passed
          ? 'All attribute mappings are valid'
          : hasWarning
          ? '2 optional attributes are missing in source'
          : 'Required attribute "email" not found in source';
      }

      setTests((prev) =>
        prev.map((t) =>
          t.id === test.id
            ? {
                ...t,
                status: passed ? 'passed' : hasWarning ? 'warning' : 'failed',
                message,
                duration: Math.floor(800 + Math.random() * 1200),
              }
            : t
        )
      );
    }

    setIsRunning(false);

    // Check if all passed or have warnings
    const allPassedOrWarning = tests.every((t) => t.status === 'passed' || t.status === 'warning');
    onComplete?.(allPassedOrWarning);
  };

  const getStatusIcon = (status: PreflightTest['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: 'var(--border)' }} />;
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />;
      case 'passed':
        return <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" style={{ color: 'var(--warning)' }} />;
      case 'failed':
        return <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />;
    }
  };

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const progress = hasRun ? (passedCount / tests.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)',
              marginBottom: '4px',
            }}
          >
            Connection Validation
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
            Run pre-flight checks to validate your configuration before creating the integration
          </p>
        </div>
        <Button onClick={runTests} disabled={isRunning} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? 'Running Tests...' : hasRun ? 'Run Again' : 'Run Tests'}
        </Button>
      </div>

      {hasRun && (
        <Card className="p-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
              {passedCount} of {tests.length} tests passed
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>
      )}

      <div className="space-y-3">
        {tests.map((test, index) => (
          <Card
            key={test.id}
            className="p-4 transition-all duration-200"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor:
                test.status === 'passed'
                  ? 'var(--success-border)'
                  : test.status === 'failed'
                  ? 'var(--danger-border)'
                  : test.status === 'warning'
                  ? 'var(--warning-border)'
                  : 'var(--border)',
              opacity: test.status === 'pending' && hasRun ? 0.6 : 1,
            }}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">{getStatusIcon(test.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                    }}
                  >
                    {test.name}
                  </h4>
                  {test.duration && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                      {test.duration}ms
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                  {test.description}
                </p>
                {test.message && (
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color:
                        test.status === 'passed'
                          ? 'var(--success)'
                          : test.status === 'warning'
                          ? 'var(--warning)'
                          : test.status === 'failed'
                          ? 'var(--danger)'
                          : 'var(--text)',
                      marginTop: '8px',
                    }}
                  >
                    {test.message}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasRun && !isRunning && (
        <Card
          className="p-4"
          style={{
            backgroundColor:
              tests.some((t) => t.status === 'failed')
                ? 'var(--danger-bg)'
                : tests.some((t) => t.status === 'warning')
                ? 'var(--warning-bg)'
                : 'var(--success-bg)',
            border: `1px solid ${
              tests.some((t) => t.status === 'failed')
                ? 'var(--danger-border)'
                : tests.some((t) => t.status === 'warning')
                ? 'var(--warning-border)'
                : 'var(--success-border)'
            }`,
          }}
        >
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color:
                tests.some((t) => t.status === 'failed')
                  ? 'var(--danger)'
                  : tests.some((t) => t.status === 'warning')
                  ? 'var(--warning)'
                  : 'var(--success)',
            }}
          >
            {tests.some((t) => t.status === 'failed')
              ? '⚠️ Some tests failed. Please review and fix the issues before proceeding.'
              : tests.some((t) => t.status === 'warning')
              ? '⚠️ All critical tests passed with some warnings. You can proceed, but review the warnings.'
              : '✅ All tests passed successfully! Your integration is ready to be created.'}
          </p>
        </Card>
      )}
    </div>
  );
}
