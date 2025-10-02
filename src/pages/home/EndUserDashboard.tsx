import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useUser } from '../../contexts/UserContext';

export function EndUserDashboard() {
  const { user } = useUser();

  const myRequests = [
    { id: 'REQ-2024-1452', app: 'Salesforce', role: 'Sales Manager', status: 'Approved', date: '2024-09-28', approver: 'Mike Johnson' },
    { id: 'REQ-2024-1398', app: 'Workday', role: 'Employee Self-Service', status: 'Pending', date: '2024-09-25', approver: 'Sarah Chen' },
    { id: 'REQ-2024-1234', app: 'Oracle ERP', role: 'Finance Viewer', status: 'Rejected', date: '2024-09-20', approver: 'David Kim' },
  ];

  const stats = [
    { label: 'Active Access', value: '12', icon: CheckCircle, color: 'var(--success)' },
    { label: 'Pending Requests', value: '1', icon: Clock, color: 'var(--warning)' },
    { label: 'Total Requests', value: '8', icon: FileText, color: 'var(--primary)' },
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
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p style={{ 
          fontSize: '14px',
          color: 'var(--muted-foreground)'
        }}>
          View your access requests and manage your permissions
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

      {/* Quick Actions */}
      <Card style={{ 
        padding: '24px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        marginBottom: '32px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ 
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '4px'
            }}>
              Need Access?
            </h2>
            <p style={{ 
              fontSize: '13px',
              color: 'var(--muted-foreground)'
            }}>
              Request access to applications and resources
            </p>
          </div>
          <Link to="/requests">
            <Button style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white',
              height: '40px',
              padding: '0 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New Request
            </Button>
          </Link>
        </div>
      </Card>

      {/* My Recent Requests */}
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
              My Recent Requests
            </h2>
            <Link to="/requests">
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
          {myRequests.map((request) => (
            <div 
              key={request.id}
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
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    {request.id}
                  </span>
                  <Badge style={{ 
                    backgroundColor: request.status === 'Approved' ? 'var(--success-bg)' : request.status === 'Pending' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                    color: request.status === 'Approved' ? 'var(--success)' : request.status === 'Pending' ? 'var(--warning)' : 'var(--danger)',
                    border: `1px solid ${request.status === 'Approved' ? 'var(--success-border)' : request.status === 'Pending' ? 'var(--warning-border)' : 'var(--danger-border)'}`,
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {request.status}
                  </Badge>
                </div>
                <div style={{ 
                  fontSize: '14px',
                  color: 'var(--text)',
                  marginBottom: '4px'
                }}>
                  {request.app} - {request.role}
                </div>
                <div style={{ 
                  fontSize: '13px',
                  color: 'var(--muted-foreground)'
                }}>
                  Requested on {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Approver: {request.approver}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}