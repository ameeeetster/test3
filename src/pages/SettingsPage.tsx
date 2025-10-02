import React from 'react';
import { Building2, Shield, FileText, Workflow, Sparkles, Bell, Lock, Code } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';

export function SettingsPage() {
  const [aiEnabled, setAiEnabled] = React.useState(true);
  const [riskThreshold, setRiskThreshold] = React.useState([75]);

  return (
    <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
      <div className="mb-6 lg:mb-8">
        <h1 style={{ 
          fontSize: 'var(--text-display)',
          lineHeight: 'var(--line-height-display)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--text)',
          marginBottom: '8px'
        }}>
          Settings
        </h1>
        <p style={{ 
          fontSize: 'var(--text-body)',
          color: 'var(--muted)'
        }}>
          Configure your IAM platform settings and preferences
        </p>
      </div>

      <Card style={{ 
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <Tabs defaultValue="organization" className="w-full">
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <TabsList className="w-full justify-start rounded-none h-auto p-0 overflow-x-auto" style={{ backgroundColor: 'transparent' }}>
              <TabsTrigger 
                value="organization" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap"
                style={{ padding: '16px 20px' }}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Organization
              </TabsTrigger>
              <TabsTrigger 
                value="authentication"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap"
                style={{ padding: '16px 20px' }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Authentication
              </TabsTrigger>
              <TabsTrigger 
                value="policies"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap"
                style={{ padding: '16px 20px' }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Policies
              </TabsTrigger>
              <TabsTrigger 
                value="lifecycle"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap"
                style={{ padding: '16px 20px' }}
              >
                <Workflow className="w-4 h-4 mr-2" />
                Lifecycle
              </TabsTrigger>
              <TabsTrigger 
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap"
                style={{ padding: '16px 20px' }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold whitespace-nowrap"
                style={{ padding: '16px 20px' }}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="organization" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4" style={{ 
                  fontSize: 'var(--text-h2)',
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
                      defaultValue="Acme Corporation" 
                      className="mt-2"
                      style={{ backgroundColor: 'var(--bg)' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-domain">Domain</Label>
                    <Input 
                      id="org-domain" 
                      defaultValue="acme.com" 
                      className="mt-2"
                      style={{ backgroundColor: 'var(--bg)' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-timezone">Timezone</Label>
                    <Input 
                      id="org-timezone" 
                      defaultValue="UTC-8 (Pacific Time)" 
                      className="mt-2"
                      style={{ backgroundColor: 'var(--bg)' }}
                    />
                  </div>
                </div>
              </div>
              <Button style={{ backgroundColor: 'var(--primary)' }}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="authentication" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4" style={{ 
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Authentication Methods
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Require MFA for all users
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Enable SAML-based SSO
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Allow biometric and hardware key auth
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4" style={{ 
                  fontSize: 'var(--text-h2)',
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
                      defaultValue="12" 
                      className="mt-2"
                      style={{ backgroundColor: 'var(--bg)' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input 
                      id="session-timeout" 
                      type="number" 
                      defaultValue="30" 
                      className="mt-2"
                      style={{ backgroundColor: 'var(--bg)' }}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Automatically escalate high-risk requests
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lifecycle" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4" style={{ 
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  User Lifecycle Automation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Automatically create accounts from HR system
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Disable accounts inactive for 90+ days
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Trigger access review on manager changes
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4" style={{ 
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  AI & Machine Learning
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Enable intelligent recommendations and anomaly detection
                      </div>
                    </div>
                    <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Compare access patterns with similar roles
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Recommend optimal reviewers for access campaigns
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="pt-4">
                    <Label>Risk Score Threshold</Label>
                    <div className="flex items-center gap-4 mt-4">
                      <Slider 
                        value={riskThreshold}
                        onValueChange={setRiskThreshold}
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
                        {riskThreshold[0]}
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)', marginTop: '8px' }}>
                      Requests above this score will be flagged for review
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="mb-4" style={{ 
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Receive email alerts for important events
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Send notifications to Slack channels
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ 
                    backgroundColor: 'var(--bg)',
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
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                        Receive weekly summary of platform activity
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}