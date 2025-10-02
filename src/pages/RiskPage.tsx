import React from 'react';
import { AlertTriangle, Shield, UserX, Key } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const anomalies = [
  {
    id: 1,
    user: 'R. Kumar',
    type: 'Unusual Login Location',
    severity: 'High',
    detected: '2024-09-30 08:15',
    description: 'Login from unknown location: Singapore (usual: US West)'
  },
  {
    id: 2,
    user: 'M. Chen',
    type: 'After-hours Access',
    severity: 'Medium',
    detected: '2024-09-29 23:45',
    description: 'Accessed sensitive data outside business hours'
  },
  {
    id: 3,
    user: 'A. Johnson',
    type: 'Bulk Data Export',
    severity: 'High',
    detected: '2024-09-29 14:20',
    description: 'Downloaded 500+ records from HR system'
  },
];

const sodConflicts = [
  {
    id: 1,
    user: 'J. Smith',
    conflictType: 'Create & Approve Purchase Orders',
    apps: ['Oracle ERP', 'SAP'],
    severity: 'High',
    detected: '2024-09-28'
  },
  {
    id: 2,
    user: 'S. Patel',
    conflictType: 'Modify & Approve Journal Entries',
    apps: ['Oracle ERP'],
    severity: 'Critical',
    detected: '2024-09-27'
  },
  {
    id: 3,
    user: 'R. Kumar',
    conflictType: 'Create & Delete Users',
    apps: ['Azure AD', 'AWS IAM'],
    severity: 'High',
    detected: '2024-09-26'
  },
];

const dormantAccounts = [
  {
    id: 1,
    user: 'L. Williams',
    lastLogin: '2024-06-15',
    daysDormant: 107,
    roles: 4,
    department: 'Sales'
  },
  {
    id: 2,
    user: 'K. Brown',
    lastLogin: '2024-07-01',
    daysDormant: 91,
    roles: 6,
    department: 'Marketing'
  },
  {
    id: 3,
    user: 'D. Martinez',
    lastLogin: '2024-06-20',
    daysDormant: 102,
    roles: 3,
    department: 'Finance'
  },
];

const privilegedUsers = [
  {
    id: 1,
    user: 'R. Kumar',
    adminRoles: 12,
    criticalSystems: 8,
    lastReview: '2024-09-01',
    risk: 'High'
  },
  {
    id: 2,
    user: 'J. Smith',
    adminRoles: 8,
    criticalSystems: 5,
    lastReview: '2024-08-15',
    risk: 'Medium'
  },
  {
    id: 3,
    user: 'M. Chen',
    adminRoles: 5,
    criticalSystems: 3,
    lastReview: '2024-09-10',
    risk: 'Medium'
  },
];

export function RiskPage() {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'var(--danger)';
      case 'high':
        return 'var(--danger)';
      case 'medium':
        return 'var(--warning)';
      case 'low':
        return 'var(--success)';
      default:
        return 'var(--muted)';
    }
  };

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
          Risk Dashboard
        </h1>
        <p style={{ 
          fontSize: 'var(--text-body)',
          color: 'var(--muted)'
        }}>
          Monitor and manage identity-related risks across your organization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Anomalies Detected"
          value={8}
          change="+3 from last week"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="var(--danger)"
        />
        <StatCard
          title="SoD Conflicts"
          value={15}
          change="Unchanged"
          changeType="neutral"
          icon={Shield}
          iconColor="var(--warning)"
        />
        <StatCard
          title="Dormant Accounts"
          value={23}
          change="+5 this month"
          changeType="negative"
          icon={UserX}
          iconColor="var(--muted)"
        />
        <StatCard
          title="Privileged Users"
          value={47}
          change="Needs review"
          changeType="neutral"
          icon={Key}
          iconColor="var(--primary)"
        />
      </div>

      <Card style={{ 
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <Tabs defaultValue="anomalies" className="w-full">
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <TabsList className="w-full justify-start rounded-none h-auto p-0" style={{ backgroundColor: 'transparent' }}>
              <TabsTrigger 
                value="anomalies" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold"
                style={{ padding: '16px 24px' }}
              >
                Anomalies
              </TabsTrigger>
              <TabsTrigger 
                value="sod"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold"
                style={{ padding: '16px 24px' }}
              >
                SoD Conflicts
              </TabsTrigger>
              <TabsTrigger 
                value="dormant"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold"
                style={{ padding: '16px 24px' }}
              >
                Dormant Accounts
              </TabsTrigger>
              <TabsTrigger 
                value="privileged"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:font-semibold"
                style={{ padding: '16px 24px' }}
              >
                Privileged Users
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="anomalies" className="p-6">
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div 
                  key={anomaly.id}
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text)'
                        }}>
                          {anomaly.user}
                        </h4>
                        <Badge 
                          className="text-white"
                          style={{ 
                            backgroundColor: getSeverityColor(anomaly.severity),
                            fontSize: 'var(--text-caption)'
                          }}
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p style={{ 
                        fontSize: 'var(--text-body)',
                        color: 'var(--text)',
                        marginBottom: '8px',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {anomaly.type}
                      </p>
                      <p style={{ 
                        fontSize: 'var(--text-body)',
                        color: 'var(--muted)',
                        marginBottom: '8px'
                      }}>
                        {anomaly.description}
                      </p>
                      <p style={{ 
                        fontSize: 'var(--text-caption)',
                        color: 'var(--muted)'
                      }}>
                        Detected: {anomaly.detected}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sod" className="p-6">
            <div className="space-y-4">
              {sodConflicts.map((conflict) => (
                <div 
                  key={conflict.id}
                  className="p-4 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 style={{ 
                          fontSize: 'var(--text-body)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--text)'
                        }}>
                          {conflict.user}
                        </h4>
                        <Badge 
                          className="text-white"
                          style={{ 
                            backgroundColor: getSeverityColor(conflict.severity),
                            fontSize: 'var(--text-caption)'
                          }}
                        >
                          {conflict.severity}
                        </Badge>
                      </div>
                      <p style={{ 
                        fontSize: 'var(--text-body)',
                        color: 'var(--text)',
                        marginBottom: '8px',
                        fontWeight: 'var(--font-weight-medium)'
                      }}>
                        {conflict.conflictType}
                      </p>
                      <div className="flex gap-2 mb-2">
                        {conflict.apps.map((app, idx) => (
                          <Badge 
                            key={idx}
                            variant="outline"
                            style={{ fontSize: 'var(--text-caption)' }}
                          >
                            {app}
                          </Badge>
                        ))}
                      </div>
                      <p style={{ 
                        fontSize: 'var(--text-caption)',
                        color: 'var(--muted)'
                      }}>
                        Detected: {conflict.detected}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Mitigate
                      </Button>
                      <Button size="sm" style={{ backgroundColor: 'var(--danger)' }}>
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dormant" className="p-6">
            <div className="space-y-4">
              {dormantAccounts.map((account) => (
                <div 
                  key={account.id}
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ 
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="flex-1">
                    <h4 style={{ 
                      fontSize: 'var(--text-body)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--text)',
                      marginBottom: '8px'
                    }}>
                      {account.user}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Last Login
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {account.lastLogin}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Days Dormant
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--danger)' }}>
                          {account.daysDormant}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Roles
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {account.roles}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Department
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {account.department}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      Notify
                    </Button>
                    <Button size="sm" style={{ backgroundColor: 'var(--danger)' }}>
                      Disable
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="privileged" className="p-6">
            <div className="space-y-4">
              {privilegedUsers.map((user) => (
                <div 
                  key={user.id}
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ 
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 style={{ 
                        fontSize: 'var(--text-body)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--text)'
                      }}>
                        {user.user}
                      </h4>
                      <Badge 
                        className="text-white"
                        style={{ 
                          backgroundColor: getSeverityColor(user.risk),
                          fontSize: 'var(--text-caption)'
                        }}
                      >
                        {user.risk} Risk
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Admin Roles
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {user.adminRoles}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Critical Systems
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {user.criticalSystems}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--muted)' }}>
                          Last Review
                        </div>
                        <div style={{ fontSize: 'var(--text-body)', color: 'var(--text)' }}>
                          {user.lastReview}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Review Access
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}