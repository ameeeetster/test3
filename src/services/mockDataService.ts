// Mock Data Service with Seed Data for JML Demo
// Provides realistic demo data for all JML entities

import {
  Identity,
  Role,
  Entitlement,
  Application,
  JmlRequest,
  Approval,
  TaskRun,
  Policy,
  SodConflict,
  AuditEvent,
  JmlMetrics,
  TrendData,
  RiskLevel,
  JmlType,
  JmlStatus,
  EmploymentType,
  TerminationType
} from '../types/jml';

// Seed Data
export const SEED_IDENTITIES: Identity[] = [
  {
    id: 'identity-1',
    employeeId: 'EMP00123',
    email: 'john.smith@acme.com',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    managerId: 'identity-5',
    managerName: 'Sarah Johnson',
    company: 'ACME Corp',
    division: 'Technology',
    department: 'Engineering',
    location: 'San Francisco',
    employmentType: 'PERMANENT',
    startDate: '2023-01-15',
    status: 'ACTIVE',
    riskScore: 25,
    riskLevel: 'LOW',
    attributes: { clearance: 'Standard', badge: 'A123' },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-2',
    employeeId: 'EMP00124',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane Doe',
    managerId: 'identity-6',
    managerName: 'Mike Chen',
    company: 'ACME Corp',
    division: 'Finance',
    department: 'Finance',
    location: 'New York',
    employmentType: 'PERMANENT',
    startDate: '2023-03-01',
    status: 'ACTIVE',
    riskScore: 35,
    riskLevel: 'MEDIUM',
    attributes: { clearance: 'Financial', badge: 'F456' },
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-3',
    employeeId: 'EMP00125',
    email: 'bob.wilson@acme.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    displayName: 'Bob Wilson',
    managerId: 'identity-7',
    managerName: 'Lisa Brown',
    company: 'ACME Corp',
    division: 'Sales',
    department: 'Sales',
    location: 'Chicago',
    employmentType: 'PERMANENT',
    startDate: '2023-06-15',
    status: 'ACTIVE',
    riskScore: 20,
    riskLevel: 'LOW',
    attributes: { clearance: 'Standard', badge: 'S789' },
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-4',
    employeeId: 'EMP00126',
    email: 'alice.garcia@acme.com',
    firstName: 'Alice',
    lastName: 'Garcia',
    displayName: 'Alice Garcia',
    managerId: 'identity-5',
    managerName: 'Sarah Johnson',
    company: 'ACME Corp',
    division: 'Technology',
    department: 'Engineering',
    location: 'San Francisco',
    employmentType: 'INTERN',
    startDate: '2024-01-01',
    status: 'ACTIVE',
    riskScore: 15,
    riskLevel: 'LOW',
    attributes: { clearance: 'Limited', badge: 'I012' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-5',
    employeeId: 'EMP00127',
    email: 'sarah.johnson@acme.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    displayName: 'Sarah Johnson',
    managerId: 'identity-8',
    managerName: 'David Lee',
    company: 'ACME Corp',
    division: 'Technology',
    department: 'Engineering',
    location: 'San Francisco',
    employmentType: 'PERMANENT',
    startDate: '2022-08-01',
    status: 'ACTIVE',
    riskScore: 45,
    riskLevel: 'MEDIUM',
    attributes: { clearance: 'Manager', badge: 'M345' },
    createdAt: '2022-08-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-6',
    employeeId: 'EMP00128',
    email: 'mike.chen@acme.com',
    firstName: 'Mike',
    lastName: 'Chen',
    displayName: 'Mike Chen',
    managerId: 'identity-9',
    managerName: 'Jennifer Wang',
    company: 'ACME Corp',
    division: 'Finance',
    department: 'Finance',
    location: 'New York',
    employmentType: 'PERMANENT',
    startDate: '2022-05-15',
    status: 'ACTIVE',
    riskScore: 55,
    riskLevel: 'HIGH',
    attributes: { clearance: 'Financial Manager', badge: 'FM678' },
    createdAt: '2022-05-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-7',
    employeeId: 'EMP00129',
    email: 'lisa.brown@acme.com',
    firstName: 'Lisa',
    lastName: 'Brown',
    displayName: 'Lisa Brown',
    managerId: 'identity-10',
    managerName: 'Robert Taylor',
    company: 'ACME Corp',
    division: 'Sales',
    department: 'Sales',
    location: 'Chicago',
    employmentType: 'PERMANENT',
    startDate: '2022-11-01',
    status: 'ACTIVE',
    riskScore: 30,
    riskLevel: 'MEDIUM',
    attributes: { clearance: 'Sales Manager', badge: 'SM901' },
    createdAt: '2022-11-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-8',
    employeeId: 'EMP00130',
    email: 'david.lee@acme.com',
    firstName: 'David',
    lastName: 'Lee',
    displayName: 'David Lee',
    managerId: 'identity-11',
    managerName: 'CEO Office',
    company: 'ACME Corp',
    division: 'Technology',
    department: 'Engineering',
    location: 'San Francisco',
    employmentType: 'PERMANENT',
    startDate: '2021-03-01',
    status: 'ACTIVE',
    riskScore: 65,
    riskLevel: 'HIGH',
    attributes: { clearance: 'Director', badge: 'D234' },
    createdAt: '2021-03-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-9',
    employeeId: 'EMP00131',
    email: 'jennifer.wang@acme.com',
    firstName: 'Jennifer',
    lastName: 'Wang',
    displayName: 'Jennifer Wang',
    managerId: 'identity-11',
    managerName: 'CEO Office',
    company: 'ACME Corp',
    division: 'Finance',
    department: 'Finance',
    location: 'New York',
    employmentType: 'PERMANENT',
    startDate: '2021-06-01',
    status: 'ACTIVE',
    riskScore: 70,
    riskLevel: 'HIGH',
    attributes: { clearance: 'CFO', badge: 'CFO567' },
    createdAt: '2021-06-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-10',
    employeeId: 'EMP00132',
    email: 'robert.taylor@acme.com',
    firstName: 'Robert',
    lastName: 'Taylor',
    displayName: 'Robert Taylor',
    managerId: 'identity-11',
    managerName: 'CEO Office',
    company: 'ACME Corp',
    division: 'Sales',
    department: 'Sales',
    location: 'Chicago',
    employmentType: 'PERMANENT',
    startDate: '2021-09-01',
    status: 'ACTIVE',
    riskScore: 60,
    riskLevel: 'HIGH',
    attributes: { clearance: 'VP Sales', badge: 'VS890' },
    createdAt: '2021-09-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-11',
    employeeId: 'EMP00133',
    email: 'ceo@acme.com',
    firstName: 'CEO',
    lastName: 'Office',
    displayName: 'CEO Office',
    company: 'ACME Corp',
    division: 'Executive',
    department: 'Executive',
    location: 'San Francisco',
    employmentType: 'PERMANENT',
    startDate: '2020-01-01',
    status: 'ACTIVE',
    riskScore: 90,
    riskLevel: 'CRITICAL',
    attributes: { clearance: 'Executive', badge: 'CEO123' },
    createdAt: '2020-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'identity-12',
    employeeId: 'EMP00134',
    email: 'contractor@acme.com',
    firstName: 'Contractor',
    lastName: 'Smith',
    displayName: 'Contractor Smith',
    managerId: 'identity-5',
    managerName: 'Sarah Johnson',
    company: 'ACME Corp',
    division: 'Technology',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'CONTRACTOR',
    startDate: '2023-12-01',
    endDate: '2024-06-01',
    status: 'ACTIVE',
    riskScore: 40,
    riskLevel: 'MEDIUM',
    attributes: { clearance: 'Contractor', badge: 'C456' },
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const SEED_ROLES: Role[] = [
  {
    id: 'role-1',
    name: 'Software Engineer',
    description: 'Standard engineering role with development tools access',
    criticality: 'MEDIUM',
    isBirthright: true,
    category: 'Engineering',
    owner: 'identity-5',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'role-2',
    name: 'Senior Software Engineer',
    description: 'Advanced engineering role with production access',
    criticality: 'HIGH',
    isBirthright: false,
    category: 'Engineering',
    owner: 'identity-5',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'role-3',
    name: 'Finance Analyst',
    description: 'Financial systems and reporting access',
    criticality: 'HIGH',
    isBirthright: true,
    category: 'Finance',
    owner: 'identity-6',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'role-4',
    name: 'Sales Representative',
    description: 'CRM and sales tools access',
    criticality: 'MEDIUM',
    isBirthright: true,
    category: 'Sales',
    owner: 'identity-7',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'role-5',
    name: 'Manager',
    description: 'Management tools and team oversight access',
    criticality: 'HIGH',
    isBirthright: false,
    category: 'Management',
    owner: 'identity-8',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'role-6',
    name: 'System Administrator',
    description: 'System administration and infrastructure access',
    criticality: 'CRITICAL',
    isBirthright: false,
    category: 'IT',
    owner: 'identity-8',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

export const SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    name: 'GitHub',
    type: 'Development',
    owner: 'identity-5',
    description: 'Code repository and collaboration platform',
    isActive: true,
    connectorType: 'OAuth2',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'app-2',
    name: 'Salesforce',
    type: 'CRM',
    owner: 'identity-7',
    description: 'Customer relationship management platform',
    isActive: true,
    connectorType: 'SAML',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'app-3',
    name: 'Workday',
    type: 'HRIS',
    owner: 'identity-9',
    description: 'Human resources information system',
    isActive: true,
    connectorType: 'SCIM',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'app-4',
    name: 'AWS',
    type: 'Cloud',
    owner: 'identity-8',
    description: 'Amazon Web Services cloud platform',
    isActive: true,
    connectorType: 'API',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'app-5',
    name: 'Microsoft 365',
    type: 'Productivity',
    owner: 'identity-8',
    description: 'Office productivity suite',
    isActive: true,
    connectorType: 'Azure AD',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

export const SEED_ENTITLEMENTS: Entitlement[] = [
  {
    id: 'ent-1',
    applicationId: 'app-1',
    applicationName: 'GitHub',
    name: 'Developer Access',
    path: '/repos/read',
    description: 'Read access to repositories',
    riskLevel: 'LOW',
    category: 'Development',
    owner: 'identity-5',
    isPrivileged: false,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-2',
    applicationId: 'app-1',
    applicationName: 'GitHub',
    name: 'Admin Access',
    path: '/repos/admin',
    description: 'Administrative access to repositories',
    riskLevel: 'HIGH',
    category: 'Development',
    owner: 'identity-5',
    isPrivileged: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-3',
    applicationId: 'app-2',
    applicationName: 'Salesforce',
    name: 'Sales User',
    path: '/sales/user',
    description: 'Standard sales user access',
    riskLevel: 'MEDIUM',
    category: 'Sales',
    owner: 'identity-7',
    isPrivileged: false,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-4',
    applicationId: 'app-2',
    applicationName: 'Salesforce',
    name: 'Sales Admin',
    path: '/sales/admin',
    description: 'Salesforce administrator access',
    riskLevel: 'HIGH',
    category: 'Sales',
    owner: 'identity-7',
    isPrivileged: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-5',
    applicationId: 'app-3',
    applicationName: 'Workday',
    name: 'Employee Self Service',
    path: '/ess',
    description: 'Employee self-service portal',
    riskLevel: 'LOW',
    category: 'HR',
    owner: 'identity-9',
    isPrivileged: false,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-6',
    applicationId: 'app-3',
    applicationName: 'Workday',
    name: 'HR Admin',
    path: '/hr/admin',
    description: 'HR administrative access',
    riskLevel: 'HIGH',
    category: 'HR',
    owner: 'identity-9',
    isPrivileged: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-7',
    applicationId: 'app-4',
    applicationName: 'AWS',
    name: 'Developer Access',
    path: '/dev',
    description: 'AWS developer environment access',
    riskLevel: 'MEDIUM',
    category: 'Cloud',
    owner: 'identity-8',
    isPrivileged: false,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-8',
    applicationId: 'app-4',
    applicationName: 'AWS',
    name: 'Production Admin',
    path: '/prod/admin',
    description: 'AWS production environment admin access',
    riskLevel: 'CRITICAL',
    category: 'Cloud',
    owner: 'identity-8',
    isPrivileged: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-9',
    applicationId: 'app-5',
    applicationName: 'Microsoft 365',
    name: 'Standard User',
    path: '/office/user',
    description: 'Standard Office 365 user access',
    riskLevel: 'LOW',
    category: 'Productivity',
    owner: 'identity-8',
    isPrivileged: false,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-10',
    applicationId: 'app-5',
    applicationName: 'Microsoft 365',
    name: 'Global Admin',
    path: '/office/admin',
    description: 'Microsoft 365 global administrator access',
    riskLevel: 'CRITICAL',
    category: 'Productivity',
    owner: 'identity-8',
    isPrivileged: true,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-11',
    applicationId: 'app-2',
    applicationName: 'Salesforce',
    name: 'Finance User',
    path: '/finance/user',
    description: 'Financial reporting access in Salesforce',
    riskLevel: 'HIGH',
    category: 'Finance',
    owner: 'identity-6',
    isPrivileged: false,
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 'ent-12',
    applicationId: 'app-4',
    applicationName: 'AWS',
    name: 'Security Auditor',
    path: '/security/audit',
    description: 'AWS security auditing access',
    riskLevel: 'HIGH',
    category: 'Security',
    owner: 'identity-8',
    isPrivileged: true,
    createdAt: '2023-01-01T00:00:00Z'
  }
];

// Generate JML Requests with various states
export const SEED_JML_REQUESTS: JmlRequest[] = [
  {
    id: 'jml-1',
    type: 'JOINER',
    identityRef: 'identity-1',
    identity: SEED_IDENTITIES[0],
    submittedBy: 'identity-5',
    submittedByName: 'Sarah Johnson',
    submittedAt: '2024-01-15T09:00:00Z',
    effectiveDate: '2024-01-20',
    effectiveTime: '09:00',
    status: 'COMPLETED',
    riskScore: 25,
    riskLevel: 'LOW',
    approvals: [
      {
        id: 'approval-1',
        step: 1,
        approverId: 'identity-5',
        approverName: 'Sarah Johnson',
        approverRole: 'Manager',
        state: 'APPROVED',
        comments: 'Approved for standard engineering access',
        submittedAt: '2024-01-15T10:30:00Z',
        dueDate: '2024-01-17T17:00:00Z',
        escalationLevel: 0,
        isRequired: true,
        createdAt: '2024-01-15T09:00:00Z'
      }
    ],
    tasks: [
      {
        id: 'task-1',
        connectorId: 'app-1',
        connectorName: 'GitHub',
        action: 'CREATE_USER',
        target: 'john.smith@acme.com',
        state: 'COMPLETED',
        message: 'User created successfully',
        retryCount: 0,
        maxRetries: 3,
        startedAt: '2024-01-20T09:00:00Z',
        completedAt: '2024-01-20T09:05:00Z',
        correlationId: 'corr-1',
        createdAt: '2024-01-20T09:00:00Z'
      }
    ],
    aiHints: {
      suggestions: [],
      anomalies: [],
      explanation: 'Standard joiner process completed successfully',
      confidence: 0.95,
      generatedAt: '2024-01-15T09:00:00Z'
    },
    changeSet: {
      addedRoles: ['role-1'],
      removedRoles: [],
      addedEntitlements: ['ent-1', 'ent-9'],
      removedEntitlements: [],
      modifiedAttributes: {}
    },
    comments: 'New engineering hire onboarding',
    correlationId: 'corr-1',
    slaDueDate: '2024-01-22T17:00:00Z',
    slaBreached: false,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T09:05:00Z'
  },
  {
    id: 'jml-2',
    type: 'MOVER',
    identityRef: 'identity-2',
    identity: SEED_IDENTITIES[1],
    submittedBy: 'identity-6',
    submittedByName: 'Mike Chen',
    submittedAt: '2024-01-16T14:00:00Z',
    effectiveDate: '2024-01-22',
    effectiveTime: '08:00',
    status: 'IN_PROGRESS',
    riskScore: 45,
    riskLevel: 'MEDIUM',
    approvals: [
      {
        id: 'approval-2',
        step: 1,
        approverId: 'identity-6',
        approverName: 'Mike Chen',
        approverRole: 'Manager',
        state: 'APPROVED',
        comments: 'Approved department transfer',
        submittedAt: '2024-01-16T15:30:00Z',
        dueDate: '2024-01-18T17:00:00Z',
        escalationLevel: 0,
        isRequired: true,
        createdAt: '2024-01-16T14:00:00Z'
      }
    ],
    tasks: [
      {
        id: 'task-2',
        connectorId: 'app-2',
        connectorName: 'Salesforce',
        action: 'REMOVE_ACCESS',
        target: 'jane.doe@acme.com',
        state: 'COMPLETED',
        message: 'Sales access removed',
        retryCount: 0,
        maxRetries: 3,
        startedAt: '2024-01-22T08:00:00Z',
        completedAt: '2024-01-22T08:03:00Z',
        correlationId: 'corr-2',
        createdAt: '2024-01-22T08:00:00Z'
      },
      {
        id: 'task-3',
        connectorId: 'app-3',
        connectorName: 'Workday',
        action: 'UPDATE_DEPARTMENT',
        target: 'jane.doe@acme.com',
        state: 'IN_PROGRESS',
        message: 'Updating department information',
        retryCount: 0,
        maxRetries: 3,
        startedAt: '2024-01-22T08:05:00Z',
        correlationId: 'corr-2',
        createdAt: '2024-01-22T08:05:00Z'
      }
    ],
    aiHints: {
      suggestions: [],
      anomalies: [
        {
          id: 'anomaly-1',
          type: 'PEER_DEVIATION',
          severity: 'MEDIUM',
          title: 'Cross-functional department transfer',
          description: 'Unusual transfer between Finance and Engineering departments',
          signal: 'Departments with different access patterns and controls',
          recommendation: 'Verify transfer legitimacy and review access requirements',
          confidence: 0.65
        }
      ],
      explanation: 'Department transfer requires careful access review',
      confidence: 0.78,
      generatedAt: '2024-01-16T14:00:00Z'
    },
    changeSet: {
      addedRoles: ['role-1'],
      removedRoles: ['role-3'],
      addedEntitlements: ['ent-1'],
      removedEntitlements: ['ent-3'],
      modifiedAttributes: {
        department: { before: 'Finance', after: 'Engineering' }
      }
    },
    comments: 'Department transfer from Finance to Engineering',
    correlationId: 'corr-2',
    slaDueDate: '2024-01-24T17:00:00Z',
    slaBreached: false,
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-22T08:05:00Z'
  },
  {
    id: 'jml-3',
    type: 'LEAVER',
    identityRef: 'identity-3',
    identity: SEED_IDENTITIES[2],
    submittedBy: 'identity-7',
    submittedByName: 'Lisa Brown',
    submittedAt: '2024-01-17T16:00:00Z',
    effectiveDate: '2024-01-19',
    effectiveTime: '17:00',
    status: 'COMPLETED',
    riskScore: 20,
    riskLevel: 'LOW',
    approvals: [
      {
        id: 'approval-3',
        step: 1,
        approverId: 'identity-7',
        approverName: 'Lisa Brown',
        approverRole: 'Manager',
        state: 'APPROVED',
        comments: 'Approved voluntary termination',
        submittedAt: '2024-01-17T17:30:00Z',
        dueDate: '2024-01-19T17:00:00Z',
        escalationLevel: 0,
        isRequired: true,
        createdAt: '2024-01-17T16:00:00Z'
      }
    ],
    tasks: [
      {
        id: 'task-4',
        connectorId: 'app-2',
        connectorName: 'Salesforce',
        action: 'DISABLE_USER',
        target: 'bob.wilson@acme.com',
        state: 'COMPLETED',
        message: 'User disabled successfully',
        retryCount: 0,
        maxRetries: 3,
        startedAt: '2024-01-19T17:00:00Z',
        completedAt: '2024-01-19T17:02:00Z',
        correlationId: 'corr-3',
        createdAt: '2024-01-19T17:00:00Z'
      },
      {
        id: 'task-5',
        connectorId: 'app-5',
        connectorName: 'Microsoft 365',
        action: 'REMOVE_LICENSE',
        target: 'bob.wilson@acme.com',
        state: 'COMPLETED',
        message: 'License removed successfully',
        retryCount: 0,
        maxRetries: 3,
        startedAt: '2024-01-19T17:05:00Z',
        completedAt: '2024-01-19T17:07:00Z',
        correlationId: 'corr-3',
        createdAt: '2024-01-19T17:05:00Z'
      }
    ],
    aiHints: {
      suggestions: [],
      anomalies: [],
      explanation: 'Standard leaver process completed successfully',
      confidence: 0.92,
      generatedAt: '2024-01-17T16:00:00Z'
    },
    changeSet: {
      addedRoles: [],
      removedRoles: ['role-4'],
      addedEntitlements: [],
      removedEntitlements: ['ent-3', 'ent-9'],
      modifiedAttributes: {
        status: { before: 'ACTIVE', after: 'TERMINATED' }
      }
    },
    comments: 'Voluntary termination - standard offboarding',
    correlationId: 'corr-3',
    slaDueDate: '2024-01-21T17:00:00Z',
    slaBreached: false,
    createdAt: '2024-01-17T16:00:00Z',
    updatedAt: '2024-01-19T17:07:00Z'
  },
  {
    id: 'jml-4',
    type: 'JOINER',
    identityRef: 'identity-4',
    identity: SEED_IDENTITIES[3],
    submittedBy: 'identity-5',
    submittedByName: 'Sarah Johnson',
    submittedAt: '2024-01-18T10:00:00Z',
    effectiveDate: '2024-01-22',
    effectiveTime: '09:00',
    status: 'PENDING_APPROVAL',
    riskScore: 15,
    riskLevel: 'LOW',
    approvals: [
      {
        id: 'approval-4',
        step: 1,
        approverId: 'identity-5',
        approverName: 'Sarah Johnson',
        approverRole: 'Manager',
        state: 'PENDING',
        dueDate: '2024-01-20T17:00:00Z',
        escalationLevel: 0,
        isRequired: true,
        createdAt: '2024-01-18T10:00:00Z'
      }
    ],
    tasks: [],
    aiHints: {
      suggestions: [
        {
          id: 'suggest-1',
          type: 'ROLE',
          title: 'Intern Developer Role',
          description: 'Limited development access for intern',
          confidence: 0.88,
          rationale: 'Intern-specific role with restricted access',
          riskLevel: 'LOW',
          peerComparison: {
            similarIdentities: 8,
            averageAccess: ['GitHub Read', 'Jira Basic']
          }
        }
      ],
      anomalies: [],
      explanation: 'Intern onboarding with limited access',
      confidence: 0.88,
      generatedAt: '2024-01-18T10:00:00Z'
    },
    changeSet: {
      addedRoles: ['role-1'],
      removedRoles: [],
      addedEntitlements: ['ent-1'],
      removedEntitlements: [],
      modifiedAttributes: {}
    },
    comments: 'Intern onboarding for engineering department',
    correlationId: 'corr-4',
    slaDueDate: '2024-01-24T17:00:00Z',
    slaBreached: false,
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 'jml-5',
    type: 'JOINER',
    identityRef: 'identity-12',
    identity: SEED_IDENTITIES[11],
    submittedBy: 'identity-5',
    submittedByName: 'Sarah Johnson',
    submittedAt: '2024-01-19T11:00:00Z',
    effectiveDate: '2024-01-25',
    effectiveTime: '09:00',
    status: 'FAILED',
    riskScore: 40,
    riskLevel: 'MEDIUM',
    approvals: [
      {
        id: 'approval-5',
        step: 1,
        approverId: 'identity-5',
        approverName: 'Sarah Johnson',
        approverRole: 'Manager',
        state: 'APPROVED',
        comments: 'Approved contractor access',
        submittedAt: '2024-01-19T12:30:00Z',
        dueDate: '2024-01-21T17:00:00Z',
        escalationLevel: 0,
        isRequired: true,
        createdAt: '2024-01-19T11:00:00Z'
      }
    ],
    tasks: [
      {
        id: 'task-6',
        connectorId: 'app-1',
        connectorName: 'GitHub',
        action: 'CREATE_USER',
        target: 'contractor@acme.com',
        state: 'FAILED',
        message: 'Failed to create user: Email domain not authorized',
        retryCount: 2,
        maxRetries: 3,
        startedAt: '2024-01-25T09:00:00Z',
        errorDetails: 'Contractor email domain not in allowed list',
        correlationId: 'corr-5',
        createdAt: '2024-01-25T09:00:00Z'
      }
    ],
    aiHints: {
      suggestions: [],
      anomalies: [
        {
          id: 'anomaly-2',
          type: 'ACCESS_RISK',
          severity: 'MEDIUM',
          title: 'Contractor with elevated access',
          description: 'Contractor requesting access typically reserved for permanent employees',
          signal: 'Employment type vs. requested access mismatch',
          recommendation: 'Review contractor access policies',
          confidence: 0.75
        }
      ],
      explanation: 'Contractor onboarding requires special approval',
      confidence: 0.75,
      generatedAt: '2024-01-19T11:00:00Z'
    },
    changeSet: {
      addedRoles: ['role-1'],
      removedRoles: [],
      addedEntitlements: ['ent-1'],
      removedEntitlements: [],
      modifiedAttributes: {}
    },
    comments: 'Contractor onboarding - requires special handling',
    correlationId: 'corr-5',
    slaDueDate: '2024-01-27T17:00:00Z',
    slaBreached: false,
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-25T09:15:00Z'
  }
];

export const SEED_POLICIES: Policy[] = [
  {
    id: 'policy-1',
    name: 'Engineering Birthright',
    type: 'BIRTHRIGHT',
    description: 'Standard access for engineering department employees',
    rule: {
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'Engineering' },
        { field: 'employmentType', operator: 'EQUALS', value: 'PERMANENT', logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'GRANT_ROLE', target: 'role-1' },
        { type: 'GRANT_ENTITLEMENT', target: 'ent-1' }
      ],
      priority: 1
    },
    isActive: true,
    owner: 'identity-5',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'policy-2',
    name: 'Finance Birthright',
    type: 'BIRTHRIGHT',
    description: 'Standard access for finance department employees',
    rule: {
      conditions: [
        { field: 'department', operator: 'EQUALS', value: 'Finance' },
        { field: 'employmentType', operator: 'EQUALS', value: 'PERMANENT', logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'GRANT_ROLE', target: 'role-3' },
        { type: 'GRANT_ENTITLEMENT', target: 'ent-5' }
      ],
      priority: 1
    },
    isActive: true,
    owner: 'identity-6',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'policy-3',
    name: 'SoD - Finance Approver + Payment Processor',
    type: 'SOD',
    description: 'Prevent finance approvers from processing payments',
    rule: {
      conditions: [
        { field: 'roles', operator: 'CONTAINS', value: 'Finance Approver' },
        { field: 'entitlements', operator: 'CONTAINS', value: 'Payment Processor', logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'DENY_ACCESS', target: 'Payment Processor' }
      ],
      priority: 1
    },
    isActive: true,
    owner: 'identity-9',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'policy-4',
    name: 'SoD - Production Admin + Security Auditor',
    type: 'SOD',
    description: 'Prevent production admins from auditing their own changes',
    rule: {
      conditions: [
        { field: 'entitlements', operator: 'CONTAINS', value: 'Production Admin' },
        { field: 'entitlements', operator: 'CONTAINS', value: 'Security Auditor', logicalOperator: 'AND' }
      ],
      actions: [
        { type: 'DENY_ACCESS', target: 'Security Auditor' }
      ],
      priority: 1
    },
    isActive: true,
    owner: 'identity-8',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

export const SEED_SOD_CONFLICTS: SodConflict[] = [
  {
    id: 'sod-1',
    ruleId: 'policy-3',
    ruleName: 'SoD - Finance Approver + Payment Processor',
    conflictingRoles: ['Finance Approver'],
    conflictingEntitlements: ['Payment Processor'],
    severity: 'HIGH',
    description: 'Finance approvers cannot process payments',
    mitigationOptions: ['Require additional approval', 'Implement dual control', 'Use automated approval'],
    isActive: true
  },
  {
    id: 'sod-2',
    ruleId: 'policy-4',
    ruleName: 'SoD - Production Admin + Security Auditor',
    conflictingRoles: [],
    conflictingEntitlements: ['Production Admin', 'Security Auditor'],
    severity: 'CRITICAL',
    description: 'Production admins cannot audit their own changes',
    mitigationOptions: ['Separate audit role', 'Implement automated auditing', 'Require external review'],
    isActive: true
  }
];

// Generate metrics and trends
export const DEMO_METRICS: JmlMetrics = {
  totalRequests: 47,
  pendingApprovals: 8,
  inProgressTasks: 12,
  averageCycleTime: 2.3,
  openFailures: 3,
  highRiskJoiners: 2,
  slaBreaches: 1,
  sodViolations: 2
};

export const DEMO_TRENDS: TrendData[] = [
  { date: '2024-01-08', joiners: 3, movers: 2, leavers: 1, riskDistribution: { LOW: 4, MEDIUM: 2, HIGH: 0, CRITICAL: 0 }, slaBreaches: 0 },
  { date: '2024-01-09', joiners: 2, movers: 1, leavers: 2, riskDistribution: { LOW: 3, MEDIUM: 2, HIGH: 0, CRITICAL: 0 }, slaBreaches: 0 },
  { date: '2024-01-10', joiners: 4, movers: 3, leavers: 1, riskDistribution: { LOW: 5, MEDIUM: 3, HIGH: 0, CRITICAL: 0 }, slaBreaches: 0 },
  { date: '2024-01-11', joiners: 1, movers: 2, leavers: 3, riskDistribution: { LOW: 4, MEDIUM: 2, HIGH: 0, CRITICAL: 0 }, slaBreaches: 0 },
  { date: '2024-01-12', joiners: 3, movers: 1, leavers: 2, riskDistribution: { LOW: 4, MEDIUM: 2, HIGH: 0, CRITICAL: 0 }, slaBreaches: 0 },
  { date: '2024-01-13', joiners: 2, movers: 4, leavers: 1, riskDistribution: { LOW: 5, MEDIUM: 2, HIGH: 0, CRITICAL: 0 }, slaBreaches: 0 },
  { date: '2024-01-14', joiners: 5, movers: 2, leavers: 2, riskDistribution: { LOW: 6, MEDIUM: 3, HIGH: 0, CRITICAL: 0 }, slaBreaches: 1 }
];

// Mock Data Service
export class MockDataService {
  private identities: Identity[] = [...SEED_IDENTITIES];
  private roles: Role[] = [...SEED_ROLES];
  private entitlements: Entitlement[] = [...SEED_ENTITLEMENTS];
  private applications: Application[] = [...SEED_APPLICATIONS];
  private jmlRequests: JmlRequest[] = [...SEED_JML_REQUESTS];
  private policies: Policy[] = [...SEED_POLICIES];
  private sodConflicts: SodConflict[] = [...SEED_SOD_CONFLICTS];

  // Identity methods
  getIdentities(): Identity[] {
    return this.identities;
  }

  getIdentity(id: string): Identity | undefined {
    return this.identities.find(i => i.id === id);
  }

  // Role methods
  getRoles(): Role[] {
    return this.roles;
  }

  getRole(id: string): Role | undefined {
    return this.roles.find(r => r.id === id);
  }

  // Entitlement methods
  getEntitlements(): Entitlement[] {
    return this.entitlements;
  }

  getEntitlement(id: string): Entitlement | undefined {
    return this.entitlements.find(e => e.id === id);
  }

  // Application methods
  getApplications(): Application[] {
    return this.applications;
  }

  getApplication(id: string): Application | undefined {
    return this.applications.find(a => a.id === id);
  }

  // JML Request methods
  getJmlRequests(): JmlRequest[] {
    return this.jmlRequests;
  }

  getJmlRequest(id: string): JmlRequest | undefined {
    return this.jmlRequests.find(r => r.id === id);
  }

  createJmlRequest(request: Omit<JmlRequest, 'id' | 'createdAt' | 'updatedAt'>): JmlRequest {
    const newRequest: JmlRequest = {
      ...request,
      id: `jml-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.jmlRequests.push(newRequest);
    return newRequest;
  }

  updateJmlRequest(id: string, updates: Partial<JmlRequest>): JmlRequest | undefined {
    const index = this.jmlRequests.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    this.jmlRequests[index] = {
      ...this.jmlRequests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.jmlRequests[index];
  }

  // Policy methods
  getPolicies(): Policy[] {
    return this.policies;
  }

  getPolicy(id: string): Policy | undefined {
    return this.policies.find(p => p.id === id);
  }

  // SoD methods
  getSodConflicts(): SodConflict[] {
    return this.sodConflicts;
  }

  // Metrics methods
  getMetrics(): JmlMetrics {
    return DEMO_METRICS;
  }

  getTrends(): TrendData[] {
    return DEMO_TRENDS;
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();






