// Mock data for managed accounts across different connector types

export type AccountStatus = 'Active' | 'Disabled' | 'Orphaned' | 'Pending';

export type LinkStatus = 'Linked' | 'Unlinked' | 'Ambiguous';

export interface Identity {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Account {
  id: string;
  integrationInstanceId: string;
  sourceKey: string; // objectId, workerID, etc - immutable external ID
  username?: string;
  email?: string;
  status: AccountStatus;
  lastSyncAt: string;
  lastLoginAt?: string;
  groupsCount: number;
  identity?: Identity | null;
  linkStatus: LinkStatus;
  attributes: Record<string, any>; // Full connector payload
  createdAt: string;
  updatedAt: string;
}

export interface MatchCandidate {
  identityId: string;
  identity: Identity;
  score: number; // 0-100
  matchReasons: string[];
}

// Azure AD Sample Accounts
export const azureAdAccounts: Account[] = [
  {
    id: 'acc-001',
    integrationInstanceId: 'int-001',
    sourceKey: '8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d',
    username: 'sarah.chen@acme.com',
    email: 'sarah.chen@acme.com',
    status: 'Active',
    lastSyncAt: '2025-10-01T14:32:00Z',
    lastLoginAt: '2025-10-01T09:15:00Z',
    groupsCount: 12,
    linkStatus: 'Linked',
    identity: {
      id: 'usr-001',
      name: 'Sarah Chen',
      email: 'sarah.chen@acme.com',
    },
    attributes: {
      userPrincipalName: 'sarah.chen@acme.com',
      displayName: 'Sarah Chen',
      givenName: 'Sarah',
      surname: 'Chen',
      mail: 'sarah.chen@acme.com',
      objectId: '8a7b6c5d-4e3f-2a1b-0c9d-8e7f6a5b4c3d',
      accountEnabled: true,
      lastSignInDateTime: '2025-10-01T09:15:00Z',
      mfaEnabled: true,
      department: 'Engineering',
      jobTitle: 'Senior Software Engineer',
      officeLocation: 'San Francisco',
      onPremisesSamAccountName: 'schen',
      employeeId: 'EMP-1001',
      companyName: 'Acme Corp',
      usageLocation: 'US',
      preferredLanguage: 'en-US',
      memberOfCount: 12,
      licenseAssignments: ['Microsoft 365 E5', 'Power BI Pro'],
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-10-01T14:32:00Z',
  },
  {
    id: 'acc-002',
    integrationInstanceId: 'int-001',
    sourceKey: '1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
    username: 'michael.torres@acme.com',
    email: 'michael.torres@acme.com',
    status: 'Active',
    lastSyncAt: '2025-10-01T14:32:00Z',
    lastLoginAt: '2025-09-30T16:45:00Z',
    groupsCount: 8,
    linkStatus: 'Linked',
    identity: {
      id: 'usr-002',
      name: 'Michael Torres',
      email: 'michael.torres@acme.com',
    },
    attributes: {
      userPrincipalName: 'michael.torres@acme.com',
      displayName: 'Michael Torres',
      givenName: 'Michael',
      surname: 'Torres',
      mail: 'michael.torres@acme.com',
      objectId: '1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e',
      accountEnabled: true,
      lastSignInDateTime: '2025-09-30T16:45:00Z',
      mfaEnabled: true,
      department: 'Product',
      jobTitle: 'Product Manager',
      officeLocation: 'New York',
      onPremisesSamAccountName: 'mtorres',
      employeeId: 'EMP-1002',
      companyName: 'Acme Corp',
      usageLocation: 'US',
      preferredLanguage: 'en-US',
      memberOfCount: 8,
      licenseAssignments: ['Microsoft 365 E3'],
    },
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2025-10-01T14:32:00Z',
  },
  {
    id: 'acc-003',
    integrationInstanceId: 'int-001',
    sourceKey: '9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
    username: 'contractor@external.com',
    email: 'contractor@external.com',
    status: 'Active',
    lastSyncAt: '2025-10-01T14:32:00Z',
    lastLoginAt: '2025-10-01T08:30:00Z',
    groupsCount: 3,
    linkStatus: 'Unlinked',
    identity: null,
    attributes: {
      userPrincipalName: 'contractor@external.com',
      displayName: 'External Contractor',
      givenName: 'External',
      surname: 'Contractor',
      mail: 'contractor@external.com',
      objectId: '9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f',
      accountEnabled: true,
      lastSignInDateTime: '2025-10-01T08:30:00Z',
      mfaEnabled: false,
      department: 'Consulting',
      jobTitle: 'Consultant',
      officeLocation: null,
      onPremisesSamAccountName: null,
      employeeId: null,
      companyName: 'External Partners Inc',
      usageLocation: 'US',
      preferredLanguage: 'en-US',
      memberOfCount: 3,
      licenseAssignments: ['Microsoft 365 Business Basic'],
    },
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-10-01T14:32:00Z',
  },
  {
    id: 'acc-004',
    integrationInstanceId: 'int-001',
    sourceKey: '7e6d5c4b-3a2f-1e0d-9c8b-7a6f5e4d3c2b',
    username: 'lisa.anderson@acme.com',
    email: 'lisa.anderson@acme.com',
    status: 'Disabled',
    lastSyncAt: '2025-10-01T14:32:00Z',
    lastLoginAt: '2025-08-15T10:00:00Z',
    groupsCount: 0,
    linkStatus: 'Linked',
    identity: {
      id: 'usr-004',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@acme.com',
    },
    attributes: {
      userPrincipalName: 'lisa.anderson@acme.com',
      displayName: 'Lisa Anderson (Terminated)',
      givenName: 'Lisa',
      surname: 'Anderson',
      mail: 'lisa.anderson@acme.com',
      objectId: '7e6d5c4b-3a2f-1e0d-9c8b-7a6f5e4d3c2b',
      accountEnabled: false,
      lastSignInDateTime: '2025-08-15T10:00:00Z',
      mfaEnabled: true,
      department: 'Marketing',
      jobTitle: 'Marketing Director',
      officeLocation: 'Austin',
      onPremisesSamAccountName: 'landerson',
      employeeId: 'EMP-1004',
      companyName: 'Acme Corp',
      usageLocation: 'US',
      preferredLanguage: 'en-US',
      memberOfCount: 0,
      licenseAssignments: [],
      terminationDate: '2025-08-31',
    },
    createdAt: '2023-05-10T10:00:00Z',
    updatedAt: '2025-10-01T14:32:00Z',
  },
  {
    id: 'acc-005',
    integrationInstanceId: 'int-001',
    sourceKey: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    username: 'john.smith@acme.com',
    email: 'john.smith@acme.com',
    status: 'Active',
    lastSyncAt: '2025-10-01T14:32:00Z',
    lastLoginAt: '2025-10-01T13:20:00Z',
    groupsCount: 15,
    linkStatus: 'Ambiguous',
    identity: null,
    attributes: {
      userPrincipalName: 'john.smith@acme.com',
      displayName: 'John Smith',
      givenName: 'John',
      surname: 'Smith',
      mail: 'john.smith@acme.com',
      objectId: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
      accountEnabled: true,
      lastSignInDateTime: '2025-10-01T13:20:00Z',
      mfaEnabled: true,
      department: 'IT',
      jobTitle: 'Systems Administrator',
      officeLocation: 'Seattle',
      onPremisesSamAccountName: 'jsmith',
      employeeId: null,
      companyName: 'Acme Corp',
      usageLocation: 'US',
      preferredLanguage: 'en-US',
      memberOfCount: 15,
      licenseAssignments: ['Microsoft 365 E5', 'Azure AD Premium P2'],
    },
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2025-10-01T14:32:00Z',
  },
];

// Workday Sample Accounts
export const workdayAccounts: Account[] = [
  {
    id: 'acc-101',
    integrationInstanceId: 'int-002',
    sourceKey: 'WD-1001',
    username: null,
    email: 'sarah.chen@acme.com',
    status: 'Active',
    lastSyncAt: '2025-10-01T14:30:00Z',
    groupsCount: 0,
    linkStatus: 'Linked',
    identity: {
      id: 'usr-001',
      name: 'Sarah Chen',
      email: 'sarah.chen@acme.com',
    },
    attributes: {
      workerID: 'WD-1001',
      legalName: 'Sarah Michelle Chen',
      preferredName: 'Sarah Chen',
      primaryWorkEmail: 'sarah.chen@acme.com',
      managerID: 'WD-2001',
      managerName: 'James Wilson',
      costCenter: 'ENG-001',
      location: 'San Francisco, CA',
      organization: 'Engineering',
      department: 'Platform Engineering',
      hireDate: '2024-01-15',
      terminateDate: null,
      status: 'Active',
      timeType: 'Full_Time',
      employeeType: 'Regular',
      jobProfile: 'Senior Software Engineer',
      businessTitle: 'Senior Software Engineer',
      phoneNumber: '+1-415-555-0101',
      dateOfBirth: '1992-03-15',
      personalEmail: 'sarah.personal@gmail.com',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-10-01T14:30:00Z',
  },
  {
    id: 'acc-102',
    integrationInstanceId: 'int-002',
    sourceKey: 'WD-1002',
    username: null,
    email: 'michael.torres@acme.com',
    status: 'Active',
    lastSyncAt: '2025-10-01T14:30:00Z',
    groupsCount: 0,
    linkStatus: 'Linked',
    identity: {
      id: 'usr-002',
      name: 'Michael Torres',
      email: 'michael.torres@acme.com',
    },
    attributes: {
      workerID: 'WD-1002',
      legalName: 'Michael Anthony Torres',
      preferredName: 'Michael Torres',
      primaryWorkEmail: 'michael.torres@acme.com',
      managerID: 'WD-2002',
      managerName: 'Rachel Kim',
      costCenter: 'PROD-001',
      location: 'New York, NY',
      organization: 'Product',
      department: 'Product Management',
      hireDate: '2024-02-20',
      terminateDate: null,
      status: 'Active',
      timeType: 'Full_Time',
      employeeType: 'Regular',
      jobProfile: 'Product Manager',
      businessTitle: 'Product Manager',
      phoneNumber: '+1-212-555-0102',
      dateOfBirth: '1988-07-22',
      personalEmail: 'mtorres88@gmail.com',
    },
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2025-10-01T14:30:00Z',
  },
];

// Identity matching candidates
export const mockMatchCandidates: Record<string, MatchCandidate[]> = {
  'acc-003': [
    {
      identityId: 'usr-103',
      identity: {
        id: 'usr-103',
        name: 'External Contractor',
        email: 'contractor.old@external.com',
      },
      score: 65,
      matchReasons: ['Similar display name', 'Same company domain'],
    },
  ],
  'acc-005': [
    {
      identityId: 'usr-105',
      identity: {
        id: 'usr-105',
        name: 'John A. Smith',
        email: 'john.smith@acme.com',
      },
      score: 85,
      matchReasons: ['Email exact match', 'Name similarity: 90%'],
    },
    {
      identityId: 'usr-106',
      identity: {
        id: 'usr-106',
        name: 'Johnny Smith',
        email: 'j.smith@acme.com',
      },
      score: 72,
      matchReasons: ['Name similarity: 80%', 'Same department'],
    },
    {
      identityId: 'usr-107',
      identity: {
        id: 'usr-107',
        name: 'John M. Smith',
        email: 'johnm.smith@acme.com',
      },
      score: 68,
      matchReasons: ['Name similarity: 85%', 'Similar job title'],
    },
  ],
};

// Column presets
export interface ColumnPreset {
  id: string;
  name: string;
  description: string;
  columns: string[];
}

export const azureAdColumnPresets: ColumnPreset[] = [
  {
    id: 'core',
    name: 'Core',
    description: 'Essential account information',
    columns: [
      'userPrincipalName',
      'displayName',
      'mail',
      'department',
      'jobTitle',
      'accountEnabled',
      'lastSignInDateTime',
    ],
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Technical details for support',
    columns: [
      'objectId',
      'onPremisesSamAccountName',
      'employeeId',
      'mfaEnabled',
      'licenseAssignments',
      'usageLocation',
      'accountEnabled',
    ],
  },
  {
    id: 'identity-matching',
    name: 'Identity Matching',
    description: 'Fields used for identity correlation',
    columns: [
      'userPrincipalName',
      'mail',
      'employeeId',
      'onPremisesSamAccountName',
      'givenName',
      'surname',
    ],
  },
];

export const workdayColumnPresets: ColumnPreset[] = [
  {
    id: 'core',
    name: 'Core',
    description: 'Essential worker information',
    columns: [
      'workerID',
      'legalName',
      'primaryWorkEmail',
      'organization',
      'jobProfile',
      'status',
      'hireDate',
    ],
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Technical details for support',
    columns: [
      'workerID',
      'employeeType',
      'timeType',
      'costCenter',
      'location',
      'managerID',
      'terminateDate',
    ],
  },
  {
    id: 'identity-matching',
    name: 'Identity Matching',
    description: 'Fields used for identity correlation',
    columns: ['workerID', 'primaryWorkEmail', 'legalName', 'preferredName', 'phoneNumber'],
  },
];
