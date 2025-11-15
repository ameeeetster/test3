import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { SectionCard } from '../../components/settings/SectionCard';
import { CardMetadata } from '../../components/settings/CardMetadata';
import { ProviderTile, ProviderTileSkeleton } from '../../components/settings/ProviderTile';
import { ProviderWizard } from '../../components/settings/ProviderWizard';
import { HRDRuleChip } from '../../components/settings/HRDRuleChip';
import { PolicyRow } from '../../components/settings/PolicyRow';
import { MFAPolicyEdit } from '../../components/settings/PolicyEditDrawer';
import { DiffDrawer } from '../../components/settings/DiffDrawer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Plus, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, CirclePlay as PlayCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SSOService, type SSOProvider } from '../../services/ssoService';

interface AuthenticationTabProps {
  onFieldChange: () => void;
}

export function AuthenticationTab({ onFieldChange }: AuthenticationTabProps) {
  const [providers, setProviders] = useState<SSOProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);
  const [rotateConfirmOpen, setRotateConfirmOpen] = useState(false);
  const [mfaPolicyOpen, setMfaPolicyOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');

  const [hrdRules, setHrdRules] = useState([
    { pattern: '@acme.com', provider: 'Azure AD' },
    { pattern: '@contractors.acme.com', provider: 'SAML' }
  ]);

  const [mfaPolicy, setMfaPolicy] = useState({
    requirement: 'always',
    factors: ['totp', 'push', 'webauthn'],
    gracePeriod: 7,
    fallbackFactor: 'recovery-code'
  });

  const mockHistory = [
    { timestamp: '2 days ago', actor: 'sarah.johnson@acme.com', field: 'MFA Requirement', oldValue: 'Risk-based', newValue: 'Always' },
    { timestamp: '1 week ago', actor: 'michael.chen@acme.com', field: 'Password Min Length', oldValue: '8', newValue: '12' }
  ];

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const loadedProviders = await SSOService.getProviders();
      setProviders(loadedProviders);
    } catch (error) {
      console.error('Error loading providers:', error);
      // Keep empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    setTemplatePickerOpen(true);
  };

  const handleProviderSaved = () => {
    loadProviders();
    onFieldChange();
  };

  const handleSelectTemplate = (template: string) => {
    setSelectedProvider(template);
    setTemplatePickerOpen(false);
    setWizardOpen(true);
  };

  const handleDisableProvider = (providerId: string) => {
    const activeProviders = providers.filter(p => p.status === 'configured').length;
    if (activeProviders <= 1) {
      toast.error('Cannot disable the last active provider');
      return;
    }
    setDisableConfirmOpen(true);
  };

  const confirmDisable = () => {
    toast.success('Provider disabled successfully');
    setDisableConfirmOpen(false);
    onFieldChange();
  };

  const handleRotateSecret = () => {
    setRotateConfirmOpen(true);
  };

  const confirmRotate = () => {
    toast.success('Secret rotated successfully');
    setRotateConfirmOpen(false);
    onFieldChange();
  };

  const handleTestEmail = () => {
    if (!testEmailInput) {
      toast.error('Please enter an email address');
      return;
    }
    const domain = testEmailInput.split('@')[1];
    const rule = hrdRules.find(r => r.pattern === `@${domain}`);
    if (rule) {
      toast.success(`Email would route to ${rule.provider}`, {
        description: `Rule: ${rule.pattern} → ${rule.provider}`
      });
    } else {
      toast.info('No matching rule found', {
        description: 'User would see provider selection screen'
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="SSO Providers"
        description="Configure single sign-on with identity providers"
        actions={
          <Button size="sm" onClick={handleAddProvider}>
            <Plus className="w-4 h-4 mr-1" />
            Add Provider
          </Button>
        }
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <ProviderTileSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No SSO providers configured yet.</p>
            <p className="text-sm mt-2">Click "Add Provider" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.map(provider => (
              <ProviderTile
                key={provider.id}
                name={provider.name}
                status={provider.status}
                lastTest={provider.lastTest}
                signIns={provider.signIns}
                onConfigure={() => {
                  setSelectedProvider(provider.name);
                  setWizardOpen(true);
                }}
                onTest={() => toast.info(`Testing ${provider.name}...`)}
                onRotateSecret={handleRotateSecret}
                onDisable={() => handleDisableProvider(provider.id)}
                onHistory={() => setHistoryDrawerOpen(true)}
              />
            ))}
          </div>
        )}
        <CardMetadata
          user="Sarah Johnson"
          timestamp="2 days ago"
          onViewAudit={() => setHistoryDrawerOpen(true)}
        />
      </SectionCard>

      <SectionCard
        title="Identity Provider Discovery"
        description="Route users to the correct SSO provider based on email domain"
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setHrdRules([...hrdRules, { pattern: '@example.com', provider: 'SAML' }]);
              onFieldChange();
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Rule
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {hrdRules.map((rule, index) => (
              <HRDRuleChip
                key={index}
                pattern={rule.pattern}
                provider={rule.provider}
                onRemove={() => {
                  setHrdRules(hrdRules.filter((_, i) => i !== index));
                  onFieldChange();
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="user@example.com"
              value={testEmailInput}
              onChange={e => setTestEmailInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTestEmail()}
            />
            <Button variant="outline" onClick={handleTestEmail}>
              <PlayCircle className="w-4 h-4 mr-1" />
              Test
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Enter an email address to test which provider it would route to
          </p>
        </div>
        <CardMetadata user="Michael Chen" timestamp="1 week ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
      </SectionCard>

      <SectionCard title="Authentication Policies" description="Configure access control and security requirements">
        <div className="space-y-3">
          <PolicyRow
            label="Multi-Factor Authentication"
            value={
              <div className="flex items-center gap-2">
                <span>
                  {mfaPolicy.requirement === 'always' ? 'Always Required' : mfaPolicy.requirement === 'risk-based' ? 'Risk-Based' : 'Never'}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{mfaPolicy.factors.length} factors enabled</span>
              </div>
            }
            description={`Grace period: ${mfaPolicy.gracePeriod} days • Fallback: ${mfaPolicy.fallbackFactor}`}
            warning={mfaPolicy.requirement === 'always' && mfaPolicy.gracePeriod < 7 ? 'Short grace period' : undefined}
            onEdit={() => setMfaPolicyOpen(true)}
          />

          <PolicyRow
            label="Password Requirements"
            value="Minimum 12 characters, complexity required"
            description="Expiry: 90 days • Reuse: last 5 passwords blocked"
            onEdit={() => toast.info('Password policy editor')}
          />

          <PolicyRow
            label="Session Management"
            value="Idle timeout: 30 minutes"
            description="Absolute timeout: 8 hours • Remember me: enabled"
            onEdit={() => toast.info('Session policy editor')}
          />

          <PolicyRow
            label="Account Lockout"
            value="5 failed attempts"
            description="Cooldown: 15 minutes • Admin override: enabled"
            onEdit={() => toast.info('Lockout policy editor')}
          />
        </div>
        <CardMetadata user="Sarah Johnson" timestamp="2 days ago" onViewAudit={() => setHistoryDrawerOpen(true)} />
      </SectionCard>

      <Dialog open={templatePickerOpen} onOpenChange={setTemplatePickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Provider Type</DialogTitle>
            <DialogDescription>Select the identity provider you want to integrate</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {['SAML', 'OIDC', 'Azure AD', 'Okta', 'Google Workspace', 'PingIdentity'].map(template => (
              <button
                key={template}
                onClick={() => handleSelectTemplate(template)}
                className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary hover:bg-accent transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">{template}</div>
                  <div className="text-xs text-muted-foreground">
                    {template === 'SAML' && 'SAML 2.0 protocol'}
                    {template === 'OIDC' && 'OpenID Connect'}
                    {template === 'Azure AD' && 'Microsoft identity platform'}
                    {template === 'Okta' && 'Okta identity cloud'}
                    {template === 'Google Workspace' && 'Google OAuth 2.0'}
                    {template === 'PingIdentity' && 'PingOne/PingFederate'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ProviderWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        provider={selectedProvider}
        mode="create"
        onSuccess={handleProviderSaved}
      />

      <DiffDrawer
        open={historyDrawerOpen}
        onOpenChange={setHistoryDrawerOpen}
        title="Authentication Settings"
        history={mockHistory}
      />

      <MFAPolicyEdit
        open={mfaPolicyOpen}
        onOpenChange={setMfaPolicyOpen}
        initialData={mfaPolicy}
        onSave={data => {
          setMfaPolicy(data);
          onFieldChange();
        }}
      />

      <Dialog open={disableConfirmOpen} onOpenChange={setDisableConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Provider?</DialogTitle>
            <DialogDescription>Users will no longer be able to sign in using this provider.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">Impact Assessment</p>
                <p className="text-muted-foreground">
                  This will affect <strong>134 users</strong> who signed in via this provider in the last 30 days.
                  They will need to use an alternative authentication method.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>2 other active providers available</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDisable}>
              Disable Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rotateConfirmOpen} onOpenChange={setRotateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rotate Client Secret?</DialogTitle>
            <DialogDescription>A new secret will be generated and the old one will be invalidated.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Important</p>
                <p>
                  You must update the secret in your identity provider's configuration immediately.
                  The old secret will stop working as soon as you confirm.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRotateConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRotate}>Generate New Secret</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
