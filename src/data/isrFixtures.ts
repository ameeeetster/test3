// ISR Demo Fixtures and Seed Data
// Deterministic mock data for demonstrating ISR capabilities

import {
  IdentitySystemOfRecord, JMLTriggerRule, AttributeDelta, TriggerContext,
  ValidationResult, MappingSuggestion, ConflictDetection, RiskScore
} from '../types/isr';
import { Identity, JmlRequest, JmlType, JmlStatus, RiskLevel } from '../types/jml';

// Sample ISR Configurations
export const sampleISRConfigurations: Partial<IdentitySystemOfRecord>[] = [
  {
    name: 'Workday HRIS',
    description: 'Primary HR system for employee lifecycle management',
    scope: {
      masteredAttributes: [
        'employmentStatus', 'startDate', 'endDate', 'company', 'division',
        'department', 'location', 'managerId', 'title', 'email', 'employeeId'
      ],
      organizationalScope: {
        companies: ['ACME Corp'],
        divisions: ['Product', 'Sales', 'Finance', 'HR', 'IT']
      },
      populationTypes: ['PERMANENT', 'CONTRACTOR'],
      environments: ['PROD']
    },
    attributeMastership: [
      {
        attribute: 'employmentStatus',
        sourceField: 'emp_status',
        mastershipType: 'EXCLUSIVE_MASTER',
        precedence: 1,
        trustLevel: 95,
        nullPolicy: 'REJECT'
      },
      {
        attribute: 'startDate',
        sourceField: 'start_date',
        mastershipType: 'EXCLUSIVE_MASTER',
        precedence: 1,
        trustLevel: 95,
        nullPolicy: 'REJECT'
      },
      {
        attribute: 'department',
        sourceField: 'dept_code',
        mastershipType: 'PREFERRED_MASTER',
        precedence: 1,
        trustLevel: 90,
        nullPolicy: 'ACCEPT'
      }
    ],
    precedenceStrategy: {
      type: 'PRIORITY_NUMBER',
      config: { defaultPriority: 100 },
      conflictResolution: 'HIGHEST_PRIORITY'
    },
    ingestionMode: {
      type: 'POLLING',
      config: {
        interval: 3600,
        watermark: 'last_updated',
        deduplicationKey: 'employeeId',
        idempotencyToken: 'batch_id'
      }
    },
    changeDetection: {
      enabled: true,
      deltaDetection: true,
      batchProcessing: true,
      realTimeProcessing: false
    },
    aiAssistEnabled: true
  },
  {
    name: 'Contractor Management System',
    description: 'System for managing contractor and vendor relationships',
    scope: {
      masteredAttributes: [
        'employmentStatus', 'startDate', 'endDate', 'company', 'department',
        'location', 'managerId', 'title', 'email', 'employeeId'
      ],
      organizationalScope: {
        companies: ['ACME Corp'],
        divisions: ['Product', 'Sales', 'Finance']
      },
      populationTypes: ['CONTRACTOR', 'VENDOR'],
      environments: ['PROD']
    },
    attributeMastership: [
      {
        attribute: 'employmentStatus',
        sourceField: 'contract_status',
        mastershipType: 'PREFERRED_MASTER',
        precedence: 2,
        trustLevel: 85,
        nullPolicy: 'ACCEPT'
      },
      {
        attribute: 'endDate',
        sourceField: 'contract_end_date',
        mastershipType: 'EXCLUSIVE_MASTER',
        precedence: 1,
        trustLevel: 90,
        nullPolicy: 'REJECT'
      }
    ],
    precedenceStrategy: {
      type: 'PRIORITY_NUMBER',
      config: { defaultPriority: 100 },
      conflictResolution: 'HIGHEST_PRIORITY'
    },
    ingestionMode: {
      type: 'WEBHOOK',
      config: {
        endpoint: '/api/webhooks/contractor-updates',
        deduplicationKey: 'contractorId',
        idempotencyToken: 'webhook_id'
      }
    },
    changeDetection: {
      enabled: true,
      deltaDetection: true,
      batchProcessing: false,
      realTimeProcessing: true
    },
    aiAssistEnabled: true
  }
];

// Sample Trigger Rules
export const sampleTriggerRules: Partial<JMLTriggerRule>[] = [
  {
    name: 'Joiner - Employee Hire',
    description: 'Triggered when employment status changes to ACTIVE',
    isActive: true,
    priority: 1,
    conditions: [
      {
        id: 'cond-1',
        attribute: 'employmentStatus',
        operator: 'TRANSITION',
        beforeValue: 'PENDING',
        afterValue: 'ACTIVE',
        logicalOperator: 'AND'
      },
      {
        id: 'cond-2',
        attribute: 'startDate',
        operator: 'WITHIN_WINDOW',
        windowDays: 14
      }
    ],
    outputs: {
      type: 'JOINER',
      effectiveDate: 'startDate',
      autoSubmit: false,
      requireManagerApproval: true,
      sodPreCheck: true,
      notes: 'New employee onboarding triggered by HRIS status change'
    }
  },
  {
    name: 'Mover - Organizational Change',
    description: 'Triggered when department or location changes',
    isActive: true,
    priority: 2,
    conditions: [
      {
        id: 'cond-1',
        attribute: 'department',
        operator: 'TRANSITION',
        logicalOperator: 'OR'
      },
      {
        id: 'cond-2',
        attribute: 'location',
        operator: 'TRANSITION',
        logicalOperator: 'OR'
      }
    ],
    outputs: {
      type: 'MOVER',
      effectiveDate: 'next_business_day',
      effectiveTime: '08:30',
      autoSubmit: false,
      requireManagerApproval: true,
      sodPreCheck: true,
      notes: 'Organizational change detected - access review required'
    }
  },
  {
    name: 'Leaver - Termination',
    description: 'Triggered when employment status changes to TERMINATED',
    isActive: true,
    priority: 1,
    conditions: [
      {
        id: 'cond-1',
        attribute: 'employmentStatus',
        operator: 'TRANSITION',
        afterValue: 'TERMINATED',
        logicalOperator: 'OR'
      },
      {
        id: 'cond-2',
        attribute: 'endDate',
        operator: 'BEFORE',
        value: 'today'
      }
    ],
    outputs: {
      type: 'LEAVER',
      immediate: true,
      autoSubmit: true,
      requireManagerApproval: false,
      retentionPeriod: 30,
      notes: 'Employee termination - immediate access revocation'
    }
  },
  {
    name: 'Mover - Manager Change',
    description: 'Triggered when manager changes (requires additional approval)',
    isActive: true,
    priority: 3,
    conditions: [
      {
        id: 'cond-1',
        attribute: 'managerId',
        operator: 'TRANSITION'
      }
    ],
    outputs: {
      type: 'MOVER',
      effectiveDate: 'next_business_day',
      autoSubmit: false,
      requireManagerApproval: true,
      sodPreCheck: true,
      riskThreshold: 50,
      notes: 'Manager change detected - additional approval required'
    }
  },
  {
    name: 'Leaver - Contract End',
    description: 'Triggered when contractor contract expires',
    isActive: true,
    priority: 2,
    conditions: [
      {
        id: 'cond-1',
        attribute: 'endDate',
        operator: 'BEFORE',
        value: 'today'
      },
      {
        id: 'cond-2',
        attribute: 'employmentStatus',
        operator: 'EQUALS',
        value: 'ACTIVE',
        logicalOperator: 'AND'
      }
    ],
    outputs: {
      type: 'LEAVER',
      immediate: false,
      autoSubmit: true,
      requireManagerApproval: false,
      retentionPeriod: 7,
      gracePeriod: 1,
      notes: 'Contract expiration - access revocation with grace period'
    }
  }
];

// Sample Attribute Deltas for Testing
export const sampleAttributeDeltas: AttributeDelta[] = [
  {
    identityId: 'identity-001',
    attribute: 'employmentStatus',
    before: 'PENDING',
    after: 'ACTIVE',
    source: 'isr-hris',
    timestamp: '2024-01-15T09:00:00Z',
    correlationId: 'batch-001'
  },
  {
    identityId: 'identity-002',
    attribute: 'department',
    before: 'Sales',
    after: 'Finance',
    source: 'isr-hris',
    timestamp: '2024-01-15T10:30:00Z',
    correlationId: 'batch-001'
  },
  {
    identityId: 'identity-003',
    attribute: 'employmentStatus',
    before: 'ACTIVE',
    after: 'TERMINATED',
    source: 'isr-hris',
    timestamp: '2024-01-15T14:00:00Z',
    correlationId: 'batch-001'
  },
  {
    identityId: 'identity-004',
    attribute: 'managerId',
    before: 'mgr-001',
    after: 'mgr-002',
    source: 'isr-hris',
    timestamp: '2024-01-15T11:15:00Z',
    correlationId: 'batch-001'
  },
  {
    identityId: 'identity-005',
    attribute: 'endDate',
    before: '2024-02-15',
    after: '2024-01-15',
    source: 'isr-contractor',
    timestamp: '2024-01-15T16:00:00Z',
    correlationId: 'webhook-001'
  }
];

// Sample Validation Results
export const sampleValidationResults: ValidationResult[] = [
  {
    isValid: true,
    errors: [],
    warnings: [
      {
        field: 'managerId',
        message: 'Manager ID format could be improved',
        suggestion: 'Consider using UUID format for better consistency',
        row: 2
      }
    ],
    sampleResults: [
      {
        row: 0,
        data: {
          employeeId: 'EMP001',
          emp_status: 'ACTIVE',
          dept_code: 'ENG',
          start_date: '2024-01-01',
          manager_id: 'MGR001'
        },
        isValid: true,
        errors: [],
        warnings: []
      },
      {
        row: 1,
        data: {
          employeeId: 'EMP002',
          emp_status: 'PENDING',
          dept_code: 'SALES',
          start_date: '2024-01-15',
          manager_id: 'MGR002'
        },
        isValid: true,
        errors: [],
        warnings: []
      }
    ]
  },
  {
    isValid: false,
    errors: [
      {
        field: 'emp_status',
        message: 'Invalid employment status value',
        severity: 'ERROR',
        row: 1
      },
      {
        field: 'start_date',
        message: 'Start date is required',
        severity: 'ERROR',
        row: 2
      }
    ],
    warnings: [
      {
        field: 'manager_id',
        message: 'Manager ID not found in system',
        suggestion: 'Verify manager exists or use default manager',
        row: 1
      }
    ],
    sampleResults: [
      {
        row: 0,
        data: {
          employeeId: 'EMP001',
          emp_status: 'ACTIVE',
          dept_code: 'ENG',
          start_date: '2024-01-01',
          manager_id: 'MGR001'
        },
        isValid: true,
        errors: [],
        warnings: []
      },
      {
        row: 1,
        data: {
          employeeId: 'EMP002',
          emp_status: 'INVALID',
          dept_code: 'SALES',
          start_date: '2024-01-15',
          manager_id: 'MGR999'
        },
        isValid: false,
        errors: [
          {
            field: 'emp_status',
            message: 'Invalid employment status value',
            severity: 'ERROR',
            row: 1
          }
        ],
        warnings: [
          {
            field: 'manager_id',
            message: 'Manager ID not found in system',
            suggestion: 'Verify manager exists or use default manager',
            row: 1
          }
        ]
      }
    ]
  }
];

// Sample AI Suggestions
export const sampleAISuggestions: MappingSuggestion[] = [
  {
    sourceField: 'emp_id',
    targetAttribute: 'employeeId',
    confidence: 0.95,
    rationale: 'Field name and format match employee ID pattern',
    transform: {
      type: 'DIRECT',
      config: {}
    }
  },
  {
    sourceField: 'dept_name',
    targetAttribute: 'department',
    confidence: 0.85,
    rationale: 'Department name field maps to department attribute',
    transform: {
      type: 'LOOKUP',
      config: { lookupTable: 'departments' }
    }
  },
  {
    sourceField: 'hire_date',
    targetAttribute: 'startDate',
    confidence: 0.90,
    rationale: 'Hire date typically corresponds to start date',
    transform: {
      type: 'FORMAT',
      config: { format: 'YYYY-MM-DD' }
    }
  },
  {
    sourceField: 'supervisor',
    targetAttribute: 'managerId',
    confidence: 0.75,
    rationale: 'Supervisor field likely maps to manager relationship',
    transform: {
      type: 'LOOKUP',
      config: { lookupTable: 'managers' }
    }
  }
];

// Sample Conflict Detections
export const sampleConflictDetections: ConflictDetection[] = [
  {
    type: 'ATTRIBUTE_CONFLICT',
    description: 'Attribute employmentStatus is already mastered by Workday HRIS',
    severity: 'HIGH',
    resolution: 'Consider precedence rules or exclusive mastership'
  },
  {
    type: 'MASTERSHIP_CONFLICT',
    description: 'Multiple ISRs claim exclusive mastership for startDate',
    severity: 'CRITICAL',
    resolution: 'Resolve mastership conflict by adjusting precedence or mastership type'
  },
  {
    type: 'PRECEDENCE_CONFLICT',
    description: 'Circular precedence detected between ISRs',
    severity: 'HIGH',
    resolution: 'Review and fix precedence chain to avoid circular dependencies'
  }
];

// Sample Risk Scores
export const sampleRiskScores: RiskScore[] = [
  {
    score: 25,
    level: 'LOW',
    factors: [
      {
        factor: 'JML Type',
        weight: 0.3,
        value: 20,
        contribution: 6
      },
      {
        factor: 'Attribute Change',
        weight: 0.2,
        value: 10,
        contribution: 2
      },
      {
        factor: 'Identity Risk Level',
        weight: 0.3,
        value: 0,
        contribution: 0
      },
      {
        factor: 'SoD Violations',
        weight: 0.2,
        value: 0,
        contribution: 0
      }
    ],
    recommendations: [
      'Standard low-risk change - proceed with normal approval process'
    ]
  },
  {
    score: 65,
    level: 'HIGH',
    factors: [
      {
        factor: 'JML Type',
        weight: 0.3,
        value: 40,
        contribution: 12
      },
      {
        factor: 'Attribute Change',
        weight: 0.2,
        value: 35,
        contribution: 7
      },
      {
        factor: 'Identity Risk Level',
        weight: 0.3,
        value: 40,
        contribution: 12
      },
      {
        factor: 'SoD Violations',
        weight: 0.2,
        value: 30,
        contribution: 6
      }
    ],
    recommendations: [
      'Require additional approval from IAM Admin',
      'Schedule manual review before execution',
      'Review and resolve SoD violations before proceeding'
    ]
  }
];

// Sample JML Requests Generated from Triggers
export const sampleTriggeredJMLRequests: Partial<JmlRequest>[] = [
  {
    id: 'jml-trigger-001',
    type: 'JOINER',
    identityRef: 'identity-001',
    submittedBy: 'system',
    submittedAt: '2024-01-15T09:00:00Z',
    effectiveDate: '2024-01-15T09:00:00Z',
    status: 'DRAFT',
    riskScore: 25,
    justification: 'Automatically triggered by ISR rule: trigger-joiner-hire. New employee onboarding triggered by HRIS status change.',
    correlationId: 'batch-001',
    aiHints: {
      suggestions: [
        {
          type: 'ROLE',
          id: 'role-engineer',
          name: 'Software Engineer',
          confidence: 0.8,
          rationale: 'Assigned based on department: Engineering',
          sodRisk: false
        }
      ],
      anomalies: [],
      explanation: 'This request was automatically triggered when the employmentStatus attribute changed from "PENDING" to "ACTIVE" at 2024-01-15T09:00:00Z. This change was detected by ISR isr-hris and matched the trigger conditions for automatic JML request creation.',
      summary: 'Auto-generated JOINER request from ISR trigger: trigger-joiner-hire'
    },
    changeSet: {
      addedRoles: ['role-engineer'],
      addedEntitlements: ['ent-basic-access'],
      attributeChanges: {
        employmentStatus: {
          oldValue: 'PENDING',
          newValue: 'ACTIVE'
        }
      }
    }
  },
  {
    id: 'jml-trigger-002',
    type: 'MOVER',
    identityRef: 'identity-002',
    submittedBy: 'system',
    submittedAt: '2024-01-15T10:30:00Z',
    effectiveDate: '2024-01-16T08:30:00Z',
    status: 'PENDING_APPROVAL',
    riskScore: 45,
    justification: 'Automatically triggered by ISR rule: trigger-mover-org-change. Organizational change detected - access review required.',
    correlationId: 'batch-001',
    aiHints: {
      suggestions: [
        {
          type: 'ROLE',
          id: 'role-finance',
          name: 'Finance Analyst',
          confidence: 0.85,
          rationale: 'Assigned based on department change: Sales → Finance',
          sodRisk: true
        }
      ],
      anomalies: [
        {
          type: 'SOD_VIOLATION',
          description: 'Finance role conflicts with existing Sales role',
          severity: 'HIGH',
          recommendation: 'Review role assignments to resolve conflict'
        }
      ],
      explanation: 'This request was automatically triggered when the department attribute changed from "Sales" to "Finance" at 2024-01-15T10:30:00Z. This change was detected by ISR isr-hris and matched the trigger conditions for automatic JML request creation.',
      summary: 'Auto-generated MOVER request from ISR trigger: trigger-mover-org-change'
    },
    changeSet: {
      addedRoles: ['role-finance'],
      removedRoles: ['role-sales'],
      addedEntitlements: [],
      removedEntitlements: [],
      attributeChanges: {
        department: {
          oldValue: 'Sales',
          newValue: 'Finance'
        }
      }
    }
  },
  {
    id: 'jml-trigger-003',
    type: 'LEAVER',
    identityRef: 'identity-003',
    submittedBy: 'system',
    submittedAt: '2024-01-15T14:00:00Z',
    effectiveDate: '2024-01-15T14:00:00Z',
    status: 'IN_PROGRESS',
    riskScore: 15,
    justification: 'Automatically triggered by ISR rule: trigger-leaver-termination. Employee termination - immediate access revocation.',
    correlationId: 'batch-001',
    aiHints: {
      suggestions: [],
      anomalies: [],
      explanation: 'This request was automatically triggered when the employmentStatus attribute changed from "ACTIVE" to "TERMINATED" at 2024-01-15T14:00:00Z. This change was detected by ISR isr-hris and matched the trigger conditions for automatic JML request creation.',
      summary: 'Auto-generated LEAVER request from ISR trigger: trigger-leaver-termination'
    },
    changeSet: {
      addedRoles: [],
      removedRoles: ['role-engineer'],
      addedEntitlements: [],
      removedEntitlements: ['ent-basic-access'],
      attributeChanges: {
        employmentStatus: {
          oldValue: 'ACTIVE',
          newValue: 'TERMINATED'
        }
      }
    }
  }
];

// Demo Scenarios
export const demoScenarios = {
  joinerScenario: {
    name: 'New Employee Onboarding',
    description: 'Demonstrates automatic JML request creation when a new employee is hired',
    steps: [
      '1. HR updates employment status from PENDING to ACTIVE in Workday',
      '2. ISR detects the change and evaluates trigger rules',
      '3. Joiner trigger rule matches the conditions',
      '4. JML request is automatically created with birthright access',
      '5. Request is submitted for manager approval',
      '6. Upon approval, access provisioning tasks are executed'
    ],
    expectedOutcome: 'New employee receives appropriate access based on department and role'
  },
  
  moverScenario: {
    name: 'Department Transfer',
    description: 'Demonstrates automatic JML request creation when an employee changes departments',
    steps: [
      '1. HR updates department from Sales to Finance in Workday',
      '2. ISR detects the change and evaluates trigger rules',
      '3. Mover trigger rule matches the conditions',
      '4. JML request is created with delta access plan',
      '5. SoD check identifies potential conflicts',
      '6. Request requires additional approval due to risk level',
      '7. Upon approval, access is updated accordingly'
    ],
    expectedOutcome: 'Employee access is updated to reflect new department while maintaining compliance'
  },
  
  leaverScenario: {
    name: 'Employee Termination',
    description: 'Demonstrates automatic JML request creation when an employee is terminated',
    steps: [
      '1. HR updates employment status to TERMINATED in Workday',
      '2. ISR detects the change and evaluates trigger rules',
      '3. Leaver trigger rule matches the conditions',
      '4. JML request is automatically created and submitted',
      '5. Access revocation tasks are executed immediately',
      '6. Accounts are disabled and access is removed',
      '7. Data retention policies are applied'
    ],
    expectedOutcome: 'Employee access is immediately revoked while preserving necessary data'
  }
};

// Utility Functions for Demo Data
export const createMockTriggerContext = (delta: AttributeDelta): TriggerContext => ({
  identityId: delta.identityId,
  delta,
  isrId: delta.source,
  correlationId: delta.correlationId,
  timestamp: delta.timestamp
});

export const generateSampleData = (type: 'joiner' | 'mover' | 'leaver') => {
  switch (type) {
    case 'joiner':
      return {
        delta: sampleAttributeDeltas[0],
        jmlRequest: sampleTriggeredJMLRequests[0],
        riskScore: sampleRiskScores[0]
      };
    case 'mover':
      return {
        delta: sampleAttributeDeltas[1],
        jmlRequest: sampleTriggeredJMLRequests[1],
        riskScore: sampleRiskScores[1]
      };
    case 'leaver':
      return {
        delta: sampleAttributeDeltas[2],
        jmlRequest: sampleTriggeredJMLRequests[2],
        riskScore: sampleRiskScores[0]
      };
    default:
      return null;
  }
};

export const getDemoScenarioSteps = (scenario: keyof typeof demoScenarios) => {
  return demoScenarios[scenario]?.steps || [];
};

export const getDemoScenarioOutcome = (scenario: keyof typeof demoScenarios) => {
  return demoScenarios[scenario]?.expectedOutcome || '';
};














