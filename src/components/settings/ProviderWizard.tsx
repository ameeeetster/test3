import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { SecretField } from './SecretField';
import { Copy, Check, ExternalLink, Eye, EyeOff, Upload, Play, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProviderWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: string;
  mode?: 'create' | 'edit';
}

export function ProviderWizard({ open, onOpenChange, provider = 'SAML', mode = 'create' }: ProviderWizardProps) {
  const [activeTab, setActiveTab] = useState('connection');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const [connectionData, setConnectionData] = useState({
    name: '',
    issuer: '',
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/auth/callback`
  });

  const [claimsData, setClaimsData] = useState({
    email: 'email',
    name: 'name',
    roles: 'roles',
    groups: 'groups'
  });

  const [policiesData, setPoliciesData] = useState({
    jitProvisioning: true,
    defaultRole: 'user',
    allowedDomains: ['acme.com']
  });

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setTestStatus(success ? 'success' : 'error');
    }, 2000);
  };

  const handleSave = () => {
    toast.success('Provider configured successfully');
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{mode === 'create' ? 'Add' : 'Configure'} {provider} Provider</DrawerTitle>
          <DrawerDescription>Set up single sign-on integration</DrawerDescription>
        </DrawerHeader>

        <div className="px-6 flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="claims">Claims</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">
                    Provider Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="provider-name"
                    placeholder="Production SSO"
                    value={connectionData.name}
                    onChange={e => setConnectionData({ ...connectionData, name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Display name for this provider</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issuer">
                    Issuer URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="issuer"
                    placeholder="https://provider.com/oauth2/default"
                    value={connectionData.issuer}
                    onChange={e => setConnectionData({ ...connectionData, issuer: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">OAuth 2.0 authorization server URL</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-id">
                    Client ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="client-id"
                    placeholder="abc123..."
                    value={connectionData.clientId}
                    onChange={e => setConnectionData({ ...connectionData, clientId: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-secret">
                    Client Secret <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="client-secret"
                        type={showSecret ? 'text' : 'password'}
                        placeholder="••••••••••••••••"
                        value={connectionData.clientSecret}
                        onChange={e => setConnectionData({ ...connectionData, clientSecret: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redirect-uri">Redirect URI</Label>
                  <div className="flex gap-2">
                    <Input id="redirect-uri" value={connectionData.redirectUri} readOnly className="font-mono text-xs" />
                    <Button variant="outline" size="sm" onClick={() => handleCopy(connectionData.redirectUri)}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Add this URI to your provider's allowed callback URLs</p>
                </div>

                <div className="p-4 rounded-lg border bg-accent/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-1">Metadata Upload (Optional)</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Auto-fill configuration from provider metadata XML/JSON
                      </p>
                      <Button variant="outline" size="sm">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Metadata
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <a
                    href="#"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View {provider} integration guide
                  </a>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="claims" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Attribute Mapping</h3>
                  <p className="text-xs text-muted-foreground mb-4">Map provider claims to user attributes</p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="claim-email" className="text-xs">
                          Email Address
                        </Label>
                        <Input
                          id="claim-email"
                          value={claimsData.email}
                          onChange={e => setClaimsData({ ...claimsData, email: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-name" className="text-xs">
                          Full Name
                        </Label>
                        <Input
                          id="claim-name"
                          value={claimsData.name}
                          onChange={e => setClaimsData({ ...claimsData, name: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-roles" className="text-xs">
                          Roles
                        </Label>
                        <Input
                          id="claim-roles"
                          value={claimsData.roles}
                          onChange={e => setClaimsData({ ...claimsData, roles: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="claim-groups" className="text-xs">
                          Groups
                        </Label>
                        <Input
                          id="claim-groups"
                          value={claimsData.groups}
                          onChange={e => setClaimsData({ ...claimsData, groups: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-accent/50">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium">Sample Claim Data</h4>
                    <Badge variant="secondary" className="text-xs">
                      Live Preview
                    </Badge>
                  </div>
                  <pre className="text-xs font-mono mt-2 p-3 rounded bg-background overflow-x-auto">
                    {JSON.stringify(
                      {
                        email: 'user@acme.com',
                        name: 'John Doe',
                        roles: ['admin', 'developer'],
                        groups: ['engineering', 'leadership']
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <h4 className="text-sm font-medium">Just-In-Time User Creation</h4>
                    <p className="text-xs text-muted-foreground mt-1">Automatically create users on first sign-in</p>
                  </div>
                  <Switch
                    checked={policiesData.jitProvisioning}
                    onCheckedChange={v => setPoliciesData({ ...policiesData, jitProvisioning: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-role">Default Role</Label>
                  <Select
                    value={policiesData.defaultRole}
                    onValueChange={v => setPoliciesData({ ...policiesData, defaultRole: v })}
                  >
                    <SelectTrigger id="default-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Role assigned to new users</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowed-domains">Domain Allowlist</Label>
                  <Textarea
                    id="allowed-domains"
                    value={policiesData.allowedDomains.join('\n')}
                    onChange={e => setPoliciesData({ ...policiesData, allowedDomains: e.target.value.split('\n') })}
                    placeholder="acme.com&#10;example.com"
                    rows={3}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">Only allow sign-ins from these email domains (one per line)</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-6">
              <div className="space-y-4">
                <div className="text-center py-8">
                  {testStatus === 'idle' && (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                        <Play className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Test Connection</h3>
                        <p className="text-sm text-muted-foreground">
                          Verify your configuration with a test authentication flow
                        </p>
                      </div>
                      <Button onClick={handleTest} size="lg">
                        <Play className="w-4 h-4 mr-2" />
                        Run Test Sign-In
                      </Button>
                    </div>
                  )}

                  {testStatus === 'testing' && (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Testing Connection...</h3>
                        <p className="text-sm text-muted-foreground">
                          Opening authentication flow in new window
                        </p>
                      </div>
                    </div>
                  )}

                  {testStatus === 'success' && (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1 text-green-600 dark:text-green-400">Connection Successful</h3>
                        <p className="text-sm text-muted-foreground">
                          Authentication completed successfully
                        </p>
                      </div>

                      <div className="max-w-md mx-auto p-4 rounded-lg border bg-accent/50 text-left">
                        <h4 className="text-xs font-semibold mb-2">Decoded Claims</h4>
                        <pre className="text-xs font-mono overflow-x-auto">
                          {JSON.stringify(
                            {
                              sub: '1234567890',
                              email: 'user@acme.com',
                              name: 'John Doe',
                              iat: 1516239022
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>

                      <Button variant="outline" onClick={() => setTestStatus('idle')}>
                        Run Again
                      </Button>
                    </div>
                  )}

                  {testStatus === 'error' && (
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto flex items-center justify-center">
                        <XCircle className="w-8 h-8 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1 text-destructive">Connection Failed</h3>
                        <p className="text-sm text-muted-foreground">Unable to complete authentication</p>
                      </div>

                      <div className="max-w-md mx-auto p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-left">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-destructive">
                            <p className="font-medium mb-1">Error: invalid_client</p>
                            <p>The client_id or client_secret is incorrect. Please verify your configuration.</p>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" onClick={() => setTestStatus('idle')}>
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter className="border-t">
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {activeTab !== 'test' && (
                <Button variant="outline" onClick={() => setActiveTab('test')}>
                  Test Connection
                </Button>
              )}
              <Button onClick={handleSave}>Save Provider</Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
