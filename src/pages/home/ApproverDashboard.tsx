import React from 'react';
import { Clock, CheckCircle, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useUser } from '../../contexts/UserContext';

export function ApproverDashboard() {
  const { user } = useUser();

  const pendingApprovals = [
    { id: 'REQ-2024-1489', user: 'Maria Chen', app: 'Salesforce', role: 'Sales Rep', risk: 'Low', submitted: '2024-09-29', department: 'Sales' },
    { id: 'REQ-2024-1476', user: 'Alex Johnson', app: 'Oracle ERP', role: 'AP Processor', risk: 'High', submitted: '2024-09-28', sodHits: 2, department: 'Finance' },
    { id: 'REQ-2024-1465', user: 'Sam Patel', app: 'Workday', role: 'Manager', risk: 'Medium', submitted: '2024-09-27', department: 'IT Operations' },
  ];

  const stats = [
    { label: 'Pending Approvals', value: '3', icon: Clock, color: 'var(--warning)' },
    { label: 'Approved Today', value: '7', icon: CheckCircle, color: 'var(--success)' },
    { label: 'Team Members', value: '24', icon: Users, color: 'var(--primary)' },
    { label: 'High Risk Items', value: '1', icon: AlertTriangle, color: 'var(--danger)' },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '30px',
          fontWeight: '600',
          color: 'var(--text)',
          marginBottom: '8px'
        }}>
          Approvals Dashboard
        </h1>
        <p style={{ 
          fontSize: '14px',
          color: 'var(--muted-foreground)'
        }}>
          Review and approve pending access requests for your team
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} style={{ 
              padding: '24px',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ 
                    fontSize: '28px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    lineHeight: '1.2'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    fontSize: '13px',
                    color: 'var(--muted-foreground)',
                    marginTop: '2px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* High Priority Alert */}
      {pendingApprovals.some(a => a.risk === 'High' || a.sodHits) && (
        <Card style={{ 
          padding: '20px 24px',
          backgroundColor: 'rgb(254 242 242)',
          border: '1px solid var(--danger)',
          borderRadius: '10px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} strokeWidth={2} />
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--danger)',
                marginBottom: '6px'
              }}>
                High-Risk Approval Required
              </h3>
              <p style={{ 
                fontSize: '13px',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                1 request has high-risk access or SoD conflicts requiring immediate review
              </p>
              <Link to="/approvals">
                <Button size="sm" style={{ 
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  height: '32px',
                  padding: '0 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  Review Now
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Pending Approvals */}
      <Card style={{ 
        padding: '0',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          padding: '24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>
              Pending Approvals
            </h2>
            <Link to="/approvals">
              <Button variant="ghost" size="sm" style={{ 
                fontSize: '13px',
                color: 'var(--primary)'
              }}>
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div style={{ padding: '0' }}>
          {pendingApprovals.map((approval) => (
            <div 
              key={approval.id}
              style={{ 
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'background-color 150ms ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    {approval.id}
                  </span>
                  <Badge style={{ 
                    backgroundColor: approval.risk === 'High' ? 'var(--danger-bg)' : approval.risk === 'Medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: approval.risk === 'High' ? 'var(--danger)' : approval.risk === 'Medium' ? 'var(--warning)' : 'var(--success)',
                    border: `1px solid ${approval.risk === 'High' ? 'var(--danger-border)' : approval.risk === 'Medium' ? 'var(--warning-border)' : 'var(--success-border)'}`,
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {approval.risk} Risk
                  </Badge>
                  {approval.sodHits && (
                    <Badge style={{ 
                      backgroundColor: 'rgb(254 242 242)',
                      color: 'var(--danger)',
                      border: '1px solid rgb(254 226 226)',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      {approval.sodHits} SoD Conflict{approval.sodHits > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div style={{ 
                  fontSize: '14px',
                  color: 'var(--text)',
                  marginBottom: '4px'
                }}>
                  {approval.user} - {approval.department}
                </div>
                <div style={{ 
                  fontSize: '13px',
                  color: 'var(--muted-foreground)'
                }}>
                  {approval.app} • {approval.role} • Submitted {new Date(approval.submitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button size="sm" variant="outline" style={{ 
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  borderColor: 'var(--border)'
                }}>
                  Reject
                </Button>
                <Button size="sm" style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  height: '32px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}