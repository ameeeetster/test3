import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectorChooser } from './ConnectorChooser';
import { WizardStepper } from './WizardStepper';
import { WizardField } from './WizardField';
import { InstanceBasicsStep } from './InstanceBasicsStep';
import { AttributeMappingTable } from './AttributeMappingTable';
import { ScopeBuilder } from './ScopeBuilder';
import { SchedulePicker } from './SchedulePicker';
import { PreflightCheck } from './PreflightCheck';
import { WizardSummary } from './WizardSummary';
import { WizardFooter } from './WizardFooter';
import { getConnectorById, defaultMappings } from '../data/connectors';
import { suggestInstanceName } from '../data/integration-instances';
import { toast } from 'sonner';

interface AddIntegrationWizardProps {
  onClose: () => void;
  preselectedConnectorId?: string;
}

export function AddIntegrationWizard({ onClose, preselectedConnectorId }: AddIntegrationWizardProps) {
  const navigate = useNavigate();
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(preselectedConnectorId || null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);

  const connector = selectedConnectorId ? getConnectorById(selectedConnectorId) : null;

  // Initialize default values when connector is selected
  const handleConnectorSelect = (connectorId: string) => {
    setSelectedConnectorId(connectorId);
    const conn = getConnectorById(connectorId);
    if (conn) {
      // Set defaults from connector definition
      const defaults = conn.defaults || {};
      
      // Initialize default mappings
      const mappings = defaultMappings[connectorId] || [];
      
      // Suggest instance name
      const suggestedName = `${conn.name} — Production`;
      
      setConfig({
        ...defaults,
        // Instance basics (new)
        instanceName: suggestedName,
        environment: 'prod',
        owner: '',
        tags: [],
        // Existing config
        mappings: mappings.map((m, i) => ({ ...m, id: `mapping-${i}` })),
        scope: {
          syncUsers: true,
          syncGroups: true,
          rules: [],
          domains: [],
          organizationalUnits: [],
        },
        schedule: {
          mode: 'interval',
          interval: { value: 6, unit: 'hours' },
          syncType: 'delta',
          enabled: true,
          retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
          },
        },
      });
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Insert instance basics as step 0, shift connector steps to 1+
  const allSteps = connector
    ? [
        { id: 'instance-basics', title: 'Instance Basics' },
        ...connector.steps.map((s) => ({ id: s.id, title: s.title })),
      ]
    : [];

  const currentStep = connector?.steps[currentStepIndex - 1]; // -1 because step 0 is instance basics
  const isInstanceBasicsStep = currentStepIndex === 0;

  // Validate current step
  const canProceed = useMemo(() => {
    // Step 0: Instance Basics validation
    if (isInstanceBasicsStep) {
      return !!(config.instanceName && config.environment && config.owner);
    }

    if (!currentStep || !currentStep.fields) return true;

    return currentStep.fields.every((field) => {
      if (!field.required) return true;
      const value = config[field.key];
      
      if (field.type === 'toggle') return true; // Toggles always valid
      if (field.type === 'multiselect') return true; // Multiselect can be empty
      
      return value !== undefined && value !== null && value !== '';
    });
  }, [currentStep, config, isInstanceBasicsStep]);

  const handleNext = async () => {
    if (!connector) return;

    if (currentStepIndex === allSteps.length - 1) {
      // Last step - create integration
      setIsCreating(true);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success(`Integration "${config.instanceName}" created successfully!`);
      navigate('/integrations');
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      // Go back to connector chooser
      setSelectedConnectorId(null);
      setConfig({});
    } else {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      onClose();
    }
  };

  // Step 0: Connector selection
  if (!connector) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 p-4 lg:p-6">
          <ConnectorChooser onSelect={handleConnectorSelect} onCancel={onClose} />
        </div>
      </div>
    );
  }

  // Steps 1+: Wizard
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
          <div className="mb-4">
            <h1
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '4px',
              }}
            >
              Configure {connector.name}
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              {connector.description}
            </p>
          </div>
          <WizardStepper
            steps={allSteps}
            currentStep={currentStepIndex}
            onStepClick={(index) => {
              // Allow navigation to completed steps
              if (index < currentStepIndex) {
                setCurrentStepIndex(index);
              }
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6">
          {/* Step 0: Instance Basics */}
          {isInstanceBasicsStep && (
            <>
              <div className="mb-6">
                <h2
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Instance Basics
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                  Give this integration a unique name and configure basic settings
                </p>
              </div>
              <InstanceBasicsStep
                connectorName={connector.name}
                value={{
                  instanceName: config.instanceName || '',
                  environment: config.environment || 'prod',
                  owner: config.owner || '',
                  tags: config.tags || [],
                }}
                onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
                onSuggestName={() => {
                  const suggestion = suggestInstanceName(
                    connector.name,
                    config.tenantId || config.tenant,
                    config.primaryDomain || config.domain,
                    config.environment
                  );
                  setConfig((prev) => ({ ...prev, instanceName: suggestion }));
                }}
              />
            </>
          )}

          {/* Steps 1+: Connector-specific steps */}
          {!isInstanceBasicsStep && currentStep && (
            <>
              <div className="mb-6">
                <h2
                  style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  {currentStep.title}
                </h2>
                {currentStep.description && (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                    {currentStep.description}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Render step content */}
          {!isInstanceBasicsStep && currentStep?.render === 'mapping' && (
            <AttributeMappingTable
              connectorId={connector.id}
              value={config.mappings || []}
              onChange={(mappings) => updateConfig('mappings', mappings)}
            />
          )}

          {!isInstanceBasicsStep && currentStep?.render === 'scope' && (
            <ScopeBuilder
              connectorId={connector.id}
              value={config.scope || { syncUsers: true, syncGroups: true, rules: [] }}
              onChange={(scope) => updateConfig('scope', scope)}
            />
          )}

          {!isInstanceBasicsStep && currentStep?.render === 'schedule' && (
            <SchedulePicker
              connectorId={connector.id}
              value={
                config.schedule || {
                  mode: 'interval',
                  interval: { value: 6, unit: 'hours' },
                  syncType: 'delta',
                  enabled: true,
                }
              }
              onChange={(schedule) => updateConfig('schedule', schedule)}
            />
          )}

          {!isInstanceBasicsStep && currentStep?.render === 'preflight' && (
            <PreflightCheck connectorId={connector.id} config={config} />
          )}

          {!isInstanceBasicsStep && currentStep?.render === 'summary' && (
            <WizardSummary connector={connector} config={config} />
          )}

          {!isInstanceBasicsStep && currentStep?.fields && (
            <div className="space-y-6">
              {currentStep.fields.map((field) => (
                <WizardField
                  key={field.key}
                  field={field}
                  value={config[field.key]}
                  onChange={(value) => updateConfig(field.key, value)}
                />
              ))}
            </div>
          )}

          {/* Documentation link */}
          {connector.docsUrl && (
            <div
              className="mt-6 p-4 rounded-lg"
              style={{ backgroundColor: 'var(--info-bg)', border: '1px solid var(--info-border)' }}
            >
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--info)' }}>
                📚 Need help?{' '}
                <a
                  href={connector.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: 'var(--info)' }}
                >
                  View {connector.name} documentation
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <WizardFooter
        currentStep={currentStepIndex}
        totalSteps={allSteps.length}
        canGoNext={canProceed}
        canGoBack={true}
        onBack={handleBack}
        onNext={handleNext}
        onCancel={handleCancel}
        isLastStep={currentStepIndex === allSteps.length - 1}
        isCreating={isCreating}
      />
    </div>
  );
}
