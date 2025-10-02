import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FormInput } from './FormInput';
import { FormCombobox } from './FormCombobox';
import { FormTextarea } from './FormTextarea';
import { Calendar, AlertCircle, CheckCircle, Shield, ExternalLink, Loader2, Database, Cloud, Briefcase, DollarSign, Users } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner@2.0.3';

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock users for "Request on behalf of" (for administrators)
const users = [
  { value: 'sarah-chen', label: 'Sarah Chen', sublabel: 'Engineering • sarah.chen@company.com' },
  { value: 'john-smith', label: 'John Smith', sublabel: 'Finance • john.smith@company.com' },
  { value: 'emily-johnson', label: 'Emily Johnson', sublabel: 'Marketing • emily.johnson@company.com' },
  { value: 'michael-brown', label: 'Michael Brown', sublabel: 'Sales • michael.brown@company.com' },
  { value: 'jessica-davis', label: 'Jessica Davis', sublabel: 'HR • jessica.davis@company.com' },
  { value: 'david-wilson', label: 'David Wilson', sublabel: 'Operations • david.wilson@company.com' }
];

// Mock application data with icons and owners
const applications = [
  {
    value: 'oracle-erp',
    label: 'Oracle ERP',
    sublabel: 'Owner: Finance Team',
    icon: <Database className="w-4 h-4" style={{ color: '#E11D48' }} />
  },
  {
    value: 'salesforce',
    label: 'Salesforce',
    sublabel: 'Owner: Sales Operations',
    icon: <Cloud className="w-4 h-4" style={{ color: '#0EA5E9' }} />
  },
  {
    value: 'workday',
    label: 'Workday HCM',
    sublabel: 'Owner: HR Department',
    icon: <Users className="w-4 h-4" style={{ color: '#F59E0B' }} />
  },
  {
    value: 'aws',
    label: 'AWS Console',
    sublabel: 'Owner: DevOps Team',
    icon: <Cloud className="w-4 h-4" style={{ color: '#F97316' }} />
  },
  {
    value: 'sharepoint',
    label: 'SharePoint',
    sublabel: 'Owner: IT Operations',
    icon: <Briefcase className="w-4 h-4" style={{ color: '#6366F1' }} />
  },
  {
    value: 'concur',
    label: 'SAP Concur',
    sublabel: 'Owner: Finance Team',
    icon: <DollarSign className="w-4 h-4" style={{ color: '#10B981' }} />
  }
];

// Mock access levels/roles by application
const accessLevelsByApp: Record<string, Array<{
  value: string;
  label: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  sodConflict?: boolean;
}>> = {
  'oracle-erp': [
    { value: 'ap-read', label: 'Accounts Payable Read', description: 'Read-only access', risk: 'low', sodConflict: false },
    { value: 'ap-write', label: 'Accounts Payable Write', description: 'Read/Write access', risk: 'medium', sodConflict: false },
    { value: 'ar-read', label: 'Accounts Receivable Read', description: 'Read-only access', risk: 'low', sodConflict: false },
    { value: 'gl-write', label: 'General Ledger Write', description: 'Full write access', risk: 'high', sodConflict: true },
    { value: 'admin', label: 'System Administrator', description: 'Full admin access', risk: 'high', sodConflict: true }
  ],
  'salesforce': [
    { value: 'sales-user', label: 'Sales User', description: 'Standard user access', risk: 'low', sodConflict: false },
    { value: 'sales-manager', label: 'Sales Manager', description: 'Manager-level access', risk: 'medium', sodConflict: false },
    { value: 'marketing', label: 'Marketing User', description: 'Marketing cloud access', risk: 'low', sodConflict: false },
    { value: 'system-admin', label: 'System Administrator', description: 'Full admin access', risk: 'high', sodConflict: false }
  ],
  'workday': [
    { value: 'employee', label: 'Employee Self-Service', description: 'Basic employee access', risk: 'low', sodConflict: false },
    { value: 'manager', label: 'Manager', description: 'Team management access', risk: 'low', sodConflict: false },
    { value: 'hr-partner', label: 'HR Business Partner', description: 'HR partner access', risk: 'medium', sodConflict: false },
    { value: 'payroll', label: 'Payroll Specialist', description: 'Payroll processing', risk: 'high', sodConflict: true },
    { value: 'hr-admin', label: 'HR Administrator', description: 'Full HR admin access', risk: 'high', sodConflict: false }
  ],
  'aws': [
    { value: 'dev-read', label: 'Development Read-Only', description: 'View development resources', risk: 'low', sodConflict: false },
    { value: 'dev-write', label: 'Development Full Access', description: 'Full dev environment access', risk: 'medium', sodConflict: false },
    { value: 'prod-read', label: 'Production Read-Only', description: 'View production resources', risk: 'medium', sodConflict: false },
    { value: 'prod-admin', label: 'Production Administrator', description: 'Full production access', risk: 'high', sodConflict: true }
  ],
  'sharepoint': [
    { value: 'viewer', label: 'Site Viewer', description: 'Read-only access', risk: 'low', sodConflict: false },
    { value: 'contributor', label: 'Site Contributor', description: 'Create and edit content', risk: 'low', sodConflict: false },
    { value: 'editor', label: 'Site Editor', description: 'Full editing access', risk: 'medium', sodConflict: false },
    { value: 'admin', label: 'Site Administrator', description: 'Full admin access', risk: 'high', sodConflict: false }
  ],
  'concur': [
    { value: 'user', label: 'Expense User', description: 'Submit expenses', risk: 'low', sodConflict: false },
    { value: 'approver', label: 'Expense Approver', description: 'Approve expenses', risk: 'medium', sodConflict: false },
    { value: 'processor', label: 'Expense Processor', description: 'Process reimbursements', risk: 'high', sodConflict: true },
    { value: 'admin', label: 'System Administrator', description: 'Full admin access', risk: 'high', sodConflict: false }
  ]
};

export function NewRequestDialog({ open, onOpenChange }: NewRequestDialogProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [requestingFor, setRequestingFor] = useState('');
  const [application, setApplication] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [justification, setJustification] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.role === 'administrator';
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Get available access levels for selected application
  const availableAccessLevels = application ? accessLevelsByApp[application] || [] : [];
  
  // Get selected access level details
  const selectedAccessLevel = availableAccessLevels.find(level => level.value === accessLevel);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setRequestingFor('');
      setApplication('');
      setAccessLevel('');
      setDuration('');
      setJustification('');
      setErrors({});
      setTouched({});
    }
  }, [open]);
  
  // Reset access level when application changes
  useEffect(() => {
    setAccessLevel('');
  }, [application]);
  
  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (isAdmin && !requestingFor) {
      newErrors.requestingFor = 'Please select a user';
    }
    
    if (!application) {
      newErrors.application = 'Please select an application';
    }
    
    if (!accessLevel) {
      newErrors.accessLevel = 'Please select an access level';
    }
    
    if (!justification.trim()) {
      newErrors.justification = 'Business justification is required';
    } else if (justification.trim().length < 20) {
      newErrors.justification = 'Justification must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      requestingFor: true,
      application: true,
      accessLevel: true,
      justification: true
    });
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    
    toast.success('Access request submitted successfully', {
      description: 'Your request has been sent for approval'
    });
    
    onOpenChange(false);
  };
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  // Clear error when a value is selected
  const handleChange = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const isFormValid = (!isAdmin || requestingFor) && application && accessLevel && justification.trim().length >= 20;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        style={{ 
          backgroundColor: 'var(--bg)', 
          border: '1px solid var(--border)', 
          borderRadius: '12px',
          maxWidth: '760px',
          width: '100%',
          padding: '0',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <DialogHeader style={{ 
          padding: '24px 24px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0
        }}>
          <DialogTitle style={{ 
            fontSize: '20px', 
            fontWeight: 'var(--font-weight-semibold)', 
            color: 'var(--text)',
            marginBottom: '6px'
          }}>
            New Access Request
          </DialogTitle>
          <DialogDescription style={{ 
            fontSize: 'var(--text-body)', 
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            Request access to applications and resources. All requests are reviewed and approved based on security policies.
          </DialogDescription>
        </DialogHeader>
        
        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ 
            padding: '24px',
            overflowY: 'auto',
            flex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '24px',
              maxWidth: '100%'
            }}>
              {/* 1. Requestor Information */}
              <div style={{ 
                padding: '20px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px'
                }}>
                  Requestor Information
                </h3>
                
                {isAdmin ? (
                  <FormCombobox
                    id="requesting-for"
                    label="Requesting for"
                    required
                    placeholder="Select a user..."
                    searchPlaceholder="Search users..."
                    emptyText="No users found."
                    options={users}
                    value={requestingFor}
                    onChange={(val) => {
                      setRequestingFor(val);
                      handleChange('requestingFor', val);
                    }}
                    error={touched.requestingFor ? errors.requestingFor : undefined}
                    helperText="Select the user you are requesting access for"
                  />
                ) : (
                  <FormInput
                    id="requestor"
                    label="Requesting for"
                    value={user?.name || 'Current User'}
                    disabled
                    helperText="This request will be created on your behalf"
                  />
                )}
              </div>
              
              {/* 2. Application Selection */}
              <div style={{ 
                padding: '20px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px'
                }}>
                  Application & Access
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <FormCombobox
                    id="application"
                    label="Application"
                    required
                    placeholder="Select an application..."
                    searchPlaceholder="Search applications..."
                    emptyText="No applications found."
                    options={applications}
                    value={application}
                    onChange={(val) => {
                      setApplication(val);
                      handleChange('application', val);
                    }}
                    error={touched.application ? errors.application : undefined}
                    helperText="Select the application you need access to"
                  />
                  
                  {application && (
                    <FormCombobox
                      id="access-level"
                      label="Access Level / Role"
                      required
                      placeholder="Select access level..."
                      searchPlaceholder="Search roles..."
                      emptyText="No roles found for this application."
                      options={availableAccessLevels.map(level => ({
                        value: level.value,
                        label: level.label,
                        description: level.description
                      }))}
                      value={accessLevel}
                      onChange={(val) => {
                        setAccessLevel(val);
                        handleChange('accessLevel', val);
                      }}
                      error={touched.accessLevel ? errors.accessLevel : undefined}
                      helperText="Choose the appropriate access level for your needs"
                    />
                  )}
                  
                  {/* Inline Intelligence: Risk & SoD Check */}
                  {selectedAccessLevel && (
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Shield className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                          <span style={{ 
                            fontSize: 'var(--text-sm)', 
                            color: 'var(--text-secondary)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}>
                            Risk Level:
                          </span>
                          <Badge style={{
                            backgroundColor: selectedAccessLevel.risk === 'high' 
                              ? 'var(--danger-bg)' 
                              : selectedAccessLevel.risk === 'medium' 
                              ? 'var(--warning-bg)' 
                              : 'var(--success-bg)',
                            color: selectedAccessLevel.risk === 'high' 
                              ? 'var(--danger)' 
                              : selectedAccessLevel.risk === 'medium' 
                              ? 'var(--warning)' 
                              : 'var(--success)',
                            border: `1px solid ${selectedAccessLevel.risk === 'high' 
                              ? 'var(--danger-border)' 
                              : selectedAccessLevel.risk === 'medium' 
                              ? 'var(--warning-border)' 
                              : 'var(--success-border)'}`,
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-weight-semibold)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            textTransform: 'capitalize'
                          }}>
                            {selectedAccessLevel.risk}
                          </Badge>
                        </div>
                        
                        <div style={{ 
                          height: '16px', 
                          width: '1px', 
                          backgroundColor: 'var(--border)' 
                        }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selectedAccessLevel.sodConflict ? (
                            <>
                              <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                              <span style={{ 
                                fontSize: 'var(--text-sm)', 
                                color: 'var(--warning)',
                                fontWeight: 'var(--font-weight-medium)'
                              }}>
                                1 SoD warning detected
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                              <span style={{ 
                                fontSize: 'var(--text-sm)', 
                                color: 'var(--success)',
                                fontWeight: 'var(--font-weight-medium)'
                              }}>
                                No SoD conflicts
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          toast.info('Approver Path', {
                            description: 'Direct Manager → Department Head → IT Security'
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--primary)',
                          fontWeight: 'var(--font-weight-medium)',
                          background: 'none',
                          border: 'none',
                          padding: '0',
                          cursor: 'pointer',
                          width: 'fit-content'
                        }}
                        className="hover:underline"
                      >
                        View approver path
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 3. Duration (Optional) */}
              <div style={{ 
                padding: '20px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px'
                }}>
                  Access Duration
                </h3>
                
                <FormInput
                  id="duration"
                  label="Duration"
                  type="date"
                  placeholder="Select end date..."
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  helperText="Leave empty for permanent access. Specify an end date for time-bound access."
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {/* 4. Business Justification */}
              <div style={{ 
                padding: '20px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}>
                <h3 style={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)',
                  marginBottom: '12px'
                }}>
                  Business Justification
                </h3>
                
                <FormTextarea
                  id="justification"
                  label="Justification"
                  required
                  placeholder="Provide a clear business reason for this access request (minimum 20 characters)..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  onBlur={() => handleBlur('justification')}
                  error={touched.justification ? errors.justification : undefined}
                  helperText="Explain why you need this access and how it relates to your role"
                  showCharCount
                  maxLength={500}
                  currentLength={justification.length}
                />
              </div>
            </div>
          </div>
          
          {/* Sticky Footer */}
          <DialogFooter style={{ 
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            flexShrink: 0,
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              style={{
                height: '44px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderRadius: '8px',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              style={{
                height: '44px',
                paddingLeft: '24px',
                paddingRight: '24px',
                borderRadius: '8px',
                fontSize: 'var(--text-body)',
                fontWeight: 'var(--font-weight-medium)',
                background: isFormValid && !isSubmitting 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' 
                  : undefined,
                opacity: !isFormValid || isSubmitting ? 0.5 : 1,
                cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}