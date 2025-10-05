import React from 'react';
import { 
  Building2, Shield, FileText, Workflow, Sparkles, Bell, Lock, Code,
  Users, Settings2, Database, BarChart3, AlertTriangle, CheckSquare,
  Globe, Key, ShieldCheck, Zap, Monitor, Mail, Clock, Save, RotateCcw
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export function SettingsPage() {
  // State management for all settings
  const [settings, setSettings] = React.useState({
    // Organization & Governance
    organization: {
      name: "Acme Corporation",
      domain: "acme.com",
      timezone: "pacific",
      industry: "technology",
      soxCompliance: true,
      gdprCompliance: true,
      iso27001: false,
      hipaaCompliance: false
    },
    // Identity & Access Management
    identity: {
      mfaEnabled: true,
      ssoEnabled: true,
      passwordlessAuth: false,
      minPasswordLength: 12,
      sessionTimeout: 8,
      highRiskApproval: true
    },
    // Security & Compliance
    security: {
      sodValidation: true,
      exceptionApproval: true,
      sodRiskThreshold: 75,
      continuousRiskMonitoring: true,
      privilegedAccessMonitoring: true,
      riskReviewInterval: "30"
    },
    // Workflows & Automation
    workflows: {
      autoProvisionUsers: true,
      managerChangeWorkflows: true,
      autoDisableDormant: true,
      dormantThreshold: 90,
      defaultApprovalLevels: "2",
      escalationRules: true,
      escalationTime: 24,
      parallelApprovals: false
    },
    // Integrations & Connectors
    integrations: {
      autoDiscovery: true,
      healthMonitoring: true,
      errorRecovery: true,
      syncInterval: 6,
      primaryHrSystem: "workday",
      cmdbSource: "servicenow",
      conflictResolution: true,
      correlationKey: "email"
    },
    // AI & Analytics
    ai: {
      aiPoweredInsights: true,
      peerGroupAnalysis: true,
      autoSuggestReviewers: true,
      riskScoreThreshold: 75,
      behavioralAnalytics: true
    },
    // Notifications & Alerts
    notifications: {
      emailNotifications: true,
      slackIntegration: false,
      weeklyDigest: true,
      criticalAlerts: true
    },
    // System Administration
    system: {
      auditLogRetention: 7,
      backupFrequency: "daily",
      maintenanceMode: false,
      performanceMonitoring: true
    }
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Generic update function for settings
  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('iga-settings', JSON.stringify(settings));
    toast.success("Settings saved successfully");
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    // Reset to defaults
    const defaultSettings = {
      organization: {
        name: "Acme Corporation",
        domain: "acme.com",
        timezone: "pacific",
        industry: "technology",
        soxCompliance: true,
        gdprCompliance: true,
        iso27001: false,
        hipaaCompliance: false
      },
      identity: {
        mfaEnabled: true,
        ssoEnabled: true,
        passwordlessAuth: false,
        minPasswordLength: 12,
        sessionTimeout: 8,
        highRiskApproval: true
      },
      security: {
        sodValidation: true,
        exceptionApproval: true,
        sodRiskThreshold: 75,
        continuousRiskMonitoring: true,
        privilegedAccessMonitoring: true,
        riskReviewInterval: "30"
      },
      workflows: {
        autoProvisionUsers: true,
        managerChangeWorkflows: true,
        autoDisableDormant: true,
        dormantThreshold: 90,
        defaultApprovalLevels: "2",
        escalationRules: true,
        escalationTime: 24,
        parallelApprovals: false
      },
      integrations: {
        autoDiscovery: true,
        healthMonitoring: true,
        errorRecovery: true,
        syncInterval: 6,
        primaryHrSystem: "workday",
        cmdbSource: "servicenow",
        conflictResolution: true,
        correlationKey: "email"
      },
      ai: {
        aiPoweredInsights: true,
        peerGroupAnalysis: true,
        autoSuggestReviewers: true,
        riskScoreThreshold: 75,
        behavioralAnalytics: true
      },
      notifications: {
        emailNotifications: true,
        slackIntegration: false,
        weeklyDigest: true,
        criticalAlerts: true
      },
      system: {
        auditLogRetention: 7,
        backupFrequency: "daily",
        maintenanceMode: false,
        performanceMonitoring: true
      }
    };
    
    setSettings(defaultSettings);
    toast.info("Settings reset to defaults");
    setHasUnsavedChanges(false);
  };

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('iga-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 
              className="tracking-tight"
              style={{ 
                fontSize: '36px',
                lineHeight: '1.2',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '8px'
              }}
            >
              Platform Settings
            </h1>
            <p style={{ 
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--line-height-normal)'
            }}>
              Configure your IGA platform governance, security, and operational settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                className="gap-2"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card 
        className="transition-all duration-200 hover:shadow-md"
        style={{ 
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Tabs defaultValue="governance" className="w-full">
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <TabsList className="w-full justify-start rounded-none h-auto p-0 overflow-x-auto" style={{ backgroundColor: 'transparent' }}>
              <TabsTrigger 
                value="governance" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Organization & Governance
              </TabsTrigger>
              <TabsTrigger 
                value="iam"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Users className="w-4 h-4 mr-2" />
                Identity & Access
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Security & Compliance
              </TabsTrigger>
              <TabsTrigger 
                value="workflows"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Workflow className="w-4 h-4 mr-2" />
                Workflows & Automation
              </TabsTrigger>
              <TabsTrigger 
                value="integrations"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Database className="w-4 h-4 mr-2" />
                Integrations & Connectors
              </TabsTrigger>
              <TabsTrigger 
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI & Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications & Alerts
              </TabsTrigger>
              <TabsTrigger 
                value="system"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap transition-all duration-200"
                style={{ padding: '16px 20px' }}
              >
                <Settings2 className="w-4 h-4 mr-2" />
                System Administration
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Organization & Governance Tab */}
          <TabsContent value="governance" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Organization Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Organization Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input 
                        id="org-name" 
                        value={settings.organization.name}
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                        onChange={(e) => updateSetting('organization.name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-domain">Primary Domain</Label>
                      <Input 
                        id="org-domain" 
                        value={settings.organization.domain}
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                        onChange={(e) => updateSetting('organization.domain', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-timezone">Timezone</Label>
                      <Select value={settings.organization.timezone} onValueChange={(value) => updateSetting('organization.timezone', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pacific">UTC-8 (Pacific Time)</SelectItem>
                          <SelectItem value="mountain">UTC-7 (Mountain Time)</SelectItem>
                          <SelectItem value="central">UTC-6 (Central Time)</SelectItem>
                          <SelectItem value="eastern">UTC-5 (Eastern Time)</SelectItem>
                          <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="org-industry">Industry</Label>
                      <Select value={settings.organization.industry} onValueChange={(value) => updateSetting('organization.industry', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Financial Services</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Framework */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Compliance Framework
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          SOX Compliance
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Sarbanes-Oxley Act compliance controls
                        </div>
                      </div>
                      <Switch 
                        checked={settings.organization.soxCompliance}
                        onCheckedChange={(checked) => updateSetting('organization.soxCompliance', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          GDPR Compliance
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          General Data Protection Regulation
                        </div>
                      </div>
                      <Switch 
                        checked={settings.organization.gdprCompliance}
                        onCheckedChange={(checked) => updateSetting('organization.gdprCompliance', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          ISO 27001
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Information Security Management
                        </div>
                      </div>
                      <Switch 
                        checked={settings.organization.iso27001}
                        onCheckedChange={(checked) => updateSetting('organization.iso27001', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          HIPAA Compliance
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Health Insurance Portability and Accountability Act
                        </div>
                      </div>
                      <Switch 
                        checked={settings.organization.hipaaCompliance}
                        onCheckedChange={(checked) => updateSetting('organization.hipaaCompliance', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Identity & Access Management Tab */}
          <TabsContent value="iam" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Authentication Methods */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Authentication Methods
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Multi-Factor Authentication (MFA)
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Require MFA for all users
                        </div>
                      </div>
                      <Switch 
                        checked={settings.identity.mfaEnabled}
                        onCheckedChange={(checked) => updateSetting('identity.mfaEnabled', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Single Sign-On (SSO)
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Enable SAML-based SSO
                        </div>
                      </div>
                      <Switch 
                        checked={settings.identity.ssoEnabled}
                        onCheckedChange={(checked) => updateSetting('identity.ssoEnabled', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Passwordless Authentication
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Allow biometric and hardware key auth
                        </div>
                      </div>
                      <Switch 
                        checked={settings.identity.passwordlessAuth}
                        onCheckedChange={(checked) => updateSetting('identity.passwordlessAuth', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Policies */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Access Policies
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password-min">Minimum Password Length</Label>
                      <Input 
                        id="password-min" 
                        type="number" 
                        value={settings.identity.minPasswordLength}
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                        onChange={(e) => updateSetting('identity.minPasswordLength', parseInt(e.target.value) || 12)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        value={settings.identity.sessionTimeout}
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                        onChange={(e) => updateSetting('identity.sessionTimeout', parseInt(e.target.value) || 8)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Require Approval for High-Risk Access
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatically escalate high-risk requests
                        </div>
                      </div>
                      <Switch 
                        checked={settings.identity.highRiskApproval}
                        onCheckedChange={(checked) => updateSetting('identity.highRiskApproval', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security & Compliance Tab */}
          <TabsContent value="security" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Separation of Duties */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Separation of Duties (SoD)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Enable SoD Validation
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatically detect and prevent SoD violations
                        </div>
                      </div>
                      <Switch 
                        checked={settings.security.sodValidation}
                        onCheckedChange={(checked) => updateSetting('security.sodValidation', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Require Exception Approval
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          All SoD exceptions require manager approval
                        </div>
                      </div>
                      <Switch 
                        checked={settings.security.exceptionApproval}
                        onCheckedChange={(checked) => updateSetting('security.exceptionApproval', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sod-threshold">SoD Risk Threshold</Label>
                      <div className="flex items-center gap-4 mt-4">
                        <Slider 
                          value={[settings.security.sodRiskThreshold]}
                          max={100}
                          step={1}
                          className="flex-1"
                          onValueChange={(value) => updateSetting('security.sodRiskThreshold', value[0])}
                        />
                        <span style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          minWidth: '50px'
                        }}>
                          {settings.security.sodRiskThreshold}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                        Violations above this score require immediate attention
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Risk Management
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Continuous Risk Monitoring
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Real-time risk scoring and alerting
                        </div>
                      </div>
                      <Switch 
                        checked={settings.security.continuousRiskMonitoring}
                        onCheckedChange={(checked) => updateSetting('security.continuousRiskMonitoring', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Privileged Access Monitoring
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Monitor and audit privileged account usage
                        </div>
                      </div>
                      <Switch 
                        checked={settings.security.privilegedAccessMonitoring}
                        onCheckedChange={(checked) => updateSetting('security.privilegedAccessMonitoring', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="risk-review-interval">Risk Review Interval (days)</Label>
                      <Select value={settings.security.riskReviewInterval} onValueChange={(value) => updateSetting('security.riskReviewInterval', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations & Connectors Tab */}
          <TabsContent value="integrations" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Connector Management */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Connector Management
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Auto-Discovery
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatically discover new integrations
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Health Monitoring
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Continuous connector health checks
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Error Recovery
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatic retry and recovery mechanisms
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label htmlFor="sync-interval">Default Sync Interval (hours)</Label>
                      <Input 
                        id="sync-interval" 
                        type="number" 
                        defaultValue="6" 
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Authoritative Sources
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hr-source">Primary HR System</Label>
                      <Select defaultValue="workday">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workday">Workday</SelectItem>
                          <SelectItem value="successfactors">SAP SuccessFactors</SelectItem>
                          <SelectItem value="bamboohr">BambooHR</SelectItem>
                          <SelectItem value="adp">ADP Workforce Now</SelectItem>
                          <SelectItem value="custom">Custom HR System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cmdb-source">CMDB Source</Label>
                      <Select defaultValue="servicenow">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="servicenow">ServiceNow</SelectItem>
                          <SelectItem value="jira">Jira Service Management</SelectItem>
                          <SelectItem value="custom">Custom CMDB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Conflict Resolution
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatically resolve data conflicts
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div>
                      <Label htmlFor="correlation-key">Primary Correlation Key</Label>
                      <Select defaultValue="email">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email Address</SelectItem>
                          <SelectItem value="employee-id">Employee ID</SelectItem>
                          <SelectItem value="username">Username</SelectItem>
                          <SelectItem value="custom">Custom Field</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Workflows & Automation Tab */}
          <TabsContent value="workflows" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* JML Workflows */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    JML (Joiner-Mover-Leaver) Workflows
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Auto-Provision New Users
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatically create accounts from HR system
                        </div>
                      </div>
                      <Switch 
                        checked={settings.workflows.autoProvisionUsers}
                        onCheckedChange={(checked) => updateSetting('workflows.autoProvisionUsers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Manager Change Workflows
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Trigger access review on manager changes
                        </div>
                      </div>
                      <Switch 
                        checked={settings.workflows.managerChangeWorkflows}
                        onCheckedChange={(checked) => updateSetting('workflows.managerChangeWorkflows', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Auto-Disable Dormant Accounts
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Disable accounts inactive for 90+ days
                        </div>
                      </div>
                      <Switch 
                        checked={settings.workflows.autoDisableDormant}
                        onCheckedChange={(checked) => updateSetting('workflows.autoDisableDormant', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dormant-threshold">Dormant Account Threshold (days)</Label>
                      <Input 
                        id="dormant-threshold" 
                        type="number"
                        value={settings.workflows.dormantThreshold}
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                        onChange={(e) => updateSetting('workflows.dormantThreshold', parseInt(e.target.value) || 90)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Matrices */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Approval Matrices
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="approval-levels">Default Approval Levels</Label>
                      <Select value={settings.workflows.defaultApprovalLevels} onValueChange={(value) => updateSetting('workflows.defaultApprovalLevels', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Single Level</SelectItem>
                          <SelectItem value="2">Two Levels</SelectItem>
                          <SelectItem value="3">Three Levels</SelectItem>
                          <SelectItem value="custom">Custom Matrix</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Escalation Rules
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Automatically escalate overdue approvals
                        </div>
                      </div>
                      <Switch 
                        checked={settings.workflows.escalationRules}
                        onCheckedChange={(checked) => updateSetting('workflows.escalationRules', checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="escalation-time">Escalation Time (hours)</Label>
                      <Input 
                        id="escalation-time" 
                        type="number"
                        value={settings.workflows.escalationTime}
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                        onChange={(e) => updateSetting('workflows.escalationTime', parseInt(e.target.value) || 24)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Parallel Approvals
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Allow multiple approvers at same level
                        </div>
                      </div>
                      <Switch 
                        checked={settings.workflows.parallelApprovals}
                        onCheckedChange={(checked) => updateSetting('workflows.parallelApprovals', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="ai" className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Features */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    AI & Machine Learning
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          AI-Powered Insights
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Enable intelligent recommendations and anomaly detection
                        </div>
                      </div>
                      <Switch 
                        checked={settings.ai.aiPoweredInsights}
                        onCheckedChange={(checked) => updateSetting('ai.aiPoweredInsights', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Peer Group Analysis
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Compare access patterns with similar roles
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Auto-Suggest Reviewers
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Recommend optimal reviewers for access campaigns
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Scoring */}
              <div className="space-y-6">
                <div>
                  <h3 className="mb-6" style={{ 
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text)'
                  }}>
                    Risk Scoring Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Risk Score Threshold</Label>
                      <div className="flex items-center gap-4 mt-4">
                        <Slider 
                          value={[settings.ai.riskScoreThreshold]}
                          onValueChange={(value) => updateSetting('ai.riskScoreThreshold', value[0])}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          minWidth: '50px'
                        }}>
                          {settings.ai.riskScoreThreshold}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                        Requests above this score will be flagged for review
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Behavioral Analytics
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Analyze user behavior patterns for risk assessment
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications & Alerts Tab */}
          <TabsContent value="notifications" className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="mb-6" style={{ 
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Notification Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        Email Notifications
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Receive email alerts for important events
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        Slack Integration
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Send notifications to Slack channels
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        Weekly Digest
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Receive weekly summary of platform activity
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        Critical Alerts
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                        Immediate notifications for security incidents
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* System Administration Tab */}
          <TabsContent value="system" className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="mb-6" style={{ 
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  System Administration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
                      <Input 
                        id="audit-retention" 
                        type="number" 
                        defaultValue="2555" 
                        className="mt-2"
                        style={{ backgroundColor: 'var(--background)' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="backup-frequency">Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Maintenance Mode
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Enable maintenance mode for system updates
                        </div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          Performance Monitoring
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                          Enable detailed performance metrics collection
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
=======
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { SectionCard } from '../components/settings/SectionCard';
import { FieldGroup, FieldGroup2Col } from '../components/settings/FieldGroup';
import { SecretField } from '../components/settings/SecretField';
import { DirtyStateBanner } from '../components/settings/DirtyStateBanner';
import { StickyFooter } from '../components/settings/StickyFooter';
import { DomainChipList } from '../components/settings/DomainChipList';
import { EmailField } from '../components/settings/EmailField';
import { CardMetadata } from '../components/settings/CardMetadata';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '../components/ui/drawer';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { AuthenticationTab } from './settings/AuthenticationTab';
import { toast } from 'sonner@2.0.3';
import { Building2, Shield, FileText, Workflow, Sparkles, Bell, Palette, Code, Database, Users, FileSearch, TriangleAlert as AlertTriangle, Search, Copy, Check, Plus, Trash2, CreditCard as Edit, Play, RotateCcw, Mail, MessageSquare, Webhook, Globe, Download, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  icon: any;
  badge?: { text: string; variant: 'default' | 'destructive' | 'secondary' };
}

const sections: Section[] = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'authentication', label: 'Authentication', icon: Shield },
  { id: 'policies', label: 'Policies', icon: FileText },
  { id: 'lifecycle', label: 'Lifecycle', icon: Workflow },
  { id: 'ai', label: 'AI', icon: Sparkles, badge: { text: 'Beta', variant: 'secondary' } },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'api', label: 'API & Webhooks', icon: Code },
  { id: 'data', label: 'Data & Compliance', icon: Database },
  { id: 'rbac', label: 'Admin RBAC', icon: Users },
  { id: 'audit', label: 'Audit Log', icon: FileSearch },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, badge: { text: 'Danger', variant: 'destructive' } }
];

export function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('organization');
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ssoDrawerOpen, setSsoDrawerOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const [orgData, setOrgData] = useState({
    name: 'Acme Corporation',
    domains: [
      { domain: 'acme.com', status: 'verified' as const },
      { domain: 'acme.io', status: 'pending' as const }
    ],
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    fiscalYearStart: 'January',
    securityEmail: 'security@acme.com',
    supportEmail: 'support@acme.com',
    tenantId: 'acme-prod-us-west-2',
    region: 'US West (Oregon)',
    dataResidency: 'United States',
    slaTier: 'Enterprise Plus',
    tags: ['Production', 'Enterprise']
  });

  const [authSettings, setAuthSettings] = useState({
    mfaRequired: 'always',
    passwordMinLength: 12,
    passwordExpiry: 90,
    sessionMaxIdle: 30,
    lockoutThreshold: 5
  });

  const [aiSettings, setAISettings] = useState({
    roleMining: true,
    accessRecommendations: true,
    anomalyDetection: true,
    confidenceThreshold: 0.75,
    autoApproveBirthright: true,
    autoFlagSod: true,
    collapseDuplicates: true,
    showExplainability: true,
    piiMasking: true,
    allowTraining: false
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setIsDirty(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleDiscard = () => {
    toast.info('Changes discarded');
    setIsDirty(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleFieldChange = () => {
    setIsDirty(true);
  };

  const handleSectionChange = (sectionId: string) => {
    if (isDirty) {
      setPendingNavigation(`/settings?section=${sectionId}`);
      setShowUnsavedDialog(true);
    } else {
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty]);

  return (
    <div className="flex flex-col h-full">
      {isDirty && <DirtyStateBanner onSave={handleSave} onDiscard={handleDiscard} />}

      <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full flex-1">
        <div className="flex flex-col gap-6 h-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Configure your IAM platform settings and preferences</p>
            </div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDiscard}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-6 flex-1 min-h-0">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <nav className="sticky top-20 space-y-1">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-accent text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </div>
                      {section.badge && (
                        <Badge variant={section.badge.variant} className="text-[10px] h-4 px-1.5">
                          {section.badge.text}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="lg:hidden border-b sticky top-16 bg-background z-10 -mx-4 px-4 -mt-2 pt-2 mb-6">
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                  {sections.map(section => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                          activeSection === section.id
                            ? 'bg-accent text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                        {section.badge && (
                          <Badge variant={section.badge.variant} className="text-[10px] h-4 px-1.5 ml-1">
                            {section.badge.text}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Tabs value={activeSection} className="w-full">
                <TabsContent value="organization" className="space-y-6 mt-0">
                  <SectionCard title="Organization Details" description="Basic information and settings for your organization">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      <FieldGroup label="Organization Name" description="Display name for your organization" required>
                        <Input
                          value={orgData.name}
                          onChange={e => {
                            setOrgData({ ...orgData, name: e.target.value });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Fiscal Year Start" description="Start month for fiscal year">
                        <Select
                          value={orgData.fiscalYearStart}
                          onValueChange={v => {
                            setOrgData({ ...orgData, fiscalYearStart: v });
                            handleFieldChange();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="January">January</SelectItem>
                            <SelectItem value="April">April</SelectItem>
                            <SelectItem value="July">July</SelectItem>
                            <SelectItem value="October">October</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <FieldGroup label="Timezone" description="Default timezone for scheduling">
                        <Select
                          value={orgData.timezone}
                          onValueChange={v => {
                            setOrgData({ ...orgData, timezone: v });
                            handleFieldChange();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <FieldGroup label="Locale" description="Language and region format">
                        <Select
                          value={orgData.locale}
                          onValueChange={v => {
                            setOrgData({ ...orgData, locale: v });
                            handleFieldChange();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="es-ES">Spanish</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldGroup>

                      <div className="md:col-span-2">
                        <FieldGroup label="Primary Email Domains" description="Verified domains for user email addresses">
                          <DomainChipList
                            domains={orgData.domains}
                            onChange={domains => {
                              setOrgData({ ...orgData, domains });
                              handleFieldChange();
                            }}
                          />
                        </FieldGroup>
                      </div>

                      <FieldGroup label="Security Email" description="Contact for security issues" required>
                        <EmailField
                          value={orgData.securityEmail}
                          onChange={v => {
                            setOrgData({ ...orgData, securityEmail: v });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>

                      <FieldGroup label="Support Email" description="Contact for user support" required>
                        <EmailField
                          value={orgData.supportEmail}
                          onChange={v => {
                            setOrgData({ ...orgData, supportEmail: v });
                            handleFieldChange();
                          }}
                        />
                      </FieldGroup>
                    </div>

                    <CardMetadata
                      user="Sarah Johnson"
                      timestamp="2 days ago"
                      onViewAudit={() => setAuditDrawerOpen(true)}
                    />
                  </SectionCard>

                  <SectionCard title="Environment & Residency" description="Deployment and data location information">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <FieldGroup label="Tenant ID" description="Unique identifier for your tenant">
                          <div className="flex gap-2">
                            <Input value={orgData.tenantId} readOnly className="font-mono text-sm bg-accent" />
                            <Button variant="outline" size="sm" onClick={() => handleCopy(orgData.tenantId)}>
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </FieldGroup>

                        <FieldGroup label="SLA Tier" description="Service level agreement">
                          <Input value={orgData.slaTier} readOnly className="bg-accent" />
                        </FieldGroup>

                        <FieldGroup label="Region" description="Primary data center location">
                          <Input value={orgData.region} readOnly className="bg-accent" />
                        </FieldGroup>

                        <FieldGroup label="Data Residency" description="Legal jurisdiction for data">
                          <Input value={orgData.dataResidency} readOnly className="bg-accent" />
                        </FieldGroup>
                      </div>

                      <div className="p-4 rounded-lg bg-accent/50 border">
                        <div className="flex gap-3">
                          <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">Data Residency Notice</p>
                            <p>
                              Your data is stored and processed in the {orgData.region} region in compliance with local data
                              residency requirements. All user data, audit logs, and platform metadata remain within the{' '}
                              {orgData.dataResidency} jurisdiction.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardMetadata user="System" timestamp="Never modified" />
                  </SectionCard>
                </TabsContent>

                <TabsContent value="authentication" className="mt-0">
                  <AuthenticationTab onFieldChange={handleFieldChange} />
                </TabsContent>

                <TabsContent value="ai" className="space-y-6 mt-0">
                  <SectionCard title="AI Features" description="Enable intelligent governance capabilities">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Role Mining</div>
                          <div className="text-xs text-muted-foreground mt-1">Discover role patterns from access data</div>
                        </div>
                        <Switch
                          checked={aiSettings.roleMining}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, roleMining: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Access Recommendations</div>
                          <div className="text-xs text-muted-foreground mt-1">Suggest access based on peer analysis</div>
                        </div>
                        <Switch
                          checked={aiSettings.accessRecommendations}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, accessRecommendations: v });
                            handleFieldChange();
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <div className="font-medium text-sm">Anomaly Detection</div>
                          <div className="text-xs text-muted-foreground mt-1">Flag unusual access patterns</div>
                        </div>
                        <Switch
                          checked={aiSettings.anomalyDetection}
                          onCheckedChange={v => {
                            setAISettings({ ...aiSettings, anomalyDetection: v });
                            handleFieldChange();
                          }}
                        />
                      </div>
                    </div>
                    <CardMetadata user="Emily Davis" timestamp="1 week ago" onViewAudit={() => setAuditDrawerOpen(true)} />
                  </SectionCard>

                  <SectionCard title="Confidence & Auto-Actions" description="Configure AI decision thresholds">
                    <div className="space-y-6">
                      <FieldGroup
                        label="Confidence Threshold"
                        description={`AI recommendations above ${(aiSettings.confidenceThreshold * 100).toFixed(0)}% will be shown`}
                      >
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[aiSettings.confidenceThreshold * 100]}
                            onValueChange={v => {
                              setAISettings({ ...aiSettings, confidenceThreshold: v[0] / 100 });
                              handleFieldChange();
                            }}
                            min={50}
                            max={90}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium min-w-[50px]">
                            {(aiSettings.confidenceThreshold * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Impact: ~{Math.round((1 - aiSettings.confidenceThreshold) * 40)}% fewer items to review
                        </p>
                      </FieldGroup>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Auto-Actions</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="auto-birthright"
                              checked={aiSettings.autoApproveBirthright}
                              onCheckedChange={v => {
                                setAISettings({ ...aiSettings, autoApproveBirthright: v as boolean });
                                handleFieldChange();
                              }}
                            />
                            <Label htmlFor="auto-birthright" className="text-sm font-normal">
                              Auto-approve low-risk birthright access
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="auto-sod"
                              checked={aiSettings.autoFlagSod}
                              onCheckedChange={v => {
                                setAISettings({ ...aiSettings, autoFlagSod: v as boolean });
                                handleFieldChange();
                              }}
                            />
                            <Label htmlFor="auto-sod" className="text-sm font-normal">
                              Auto-flag SoD conflicts
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardMetadata user="Emily Davis" timestamp="1 week ago" onViewAudit={() => setAuditDrawerOpen(true)} />
                  </SectionCard>
                </TabsContent>
              </Tabs>

              {isDirty && <StickyFooter onCancel={handleDiscard} onSave={handleSave} />}
>>>>>>> 0e13b7ceb1af6a5cf934dc48a93b13a335daf7f4
            </div>
          </div>
        </div>
      </div>

      <Drawer open={ssoDrawerOpen} onOpenChange={setSsoDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Configure {selectedProvider || 'SSO'} Provider</DrawerTitle>
            <DrawerDescription>Set up single sign-on integration</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 space-y-6 overflow-y-auto">
            <SectionCard title="Connection Settings" description="Provider configuration">
              <div className="space-y-4">
                <FieldGroup label="Provider Name" required>
                  <Input placeholder={`${selectedProvider || 'SSO'} Production`} />
                </FieldGroup>

                <FieldGroup label="Issuer URL" required>
                  <Input placeholder="https://provider.com/issuer" />
                </FieldGroup>

                <FieldGroup label="Client ID" required>
                  <Input placeholder="abc123..." />
                </FieldGroup>

                <FieldGroup label="Client Secret" required>
                  <SecretField value="••••••••••••••••" onRotate={() => toast.info('Secret rotated')} />
                </FieldGroup>
              </div>
            </SectionCard>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setSsoDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSsoDrawerOpen(false)} className="gap-2">
              <Play className="w-4 h-4" />
              Test Sign-In
            </Button>
            <Button onClick={() => setSsoDrawerOpen(false)}>Save Provider</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={auditDrawerOpen} onOpenChange={setAuditDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Change History</DrawerTitle>
            <DrawerDescription>View all changes to this setting</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">sarah.johnson@acme.com</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell className="text-xs">Organization Name</TableCell>
                  <TableCell className="text-xs text-muted-foreground">2 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">michael.chen@acme.com</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell className="text-xs">Security Email</TableCell>
                  <TableCell className="text-xs text-muted-foreground">1 week ago</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>You have unsaved changes. What would you like to do?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnsavedDialog(false);
                setPendingNavigation(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={handleDiscard}>
              Discard Changes
            </Button>
            <Button onClick={handleSave}>Save & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
