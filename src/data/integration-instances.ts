import type { ConnectorCategory } from './connectors';

export type IntegrationEnvironment = 'prod' | 'sandbox' | 'dev' | 'gov';

export type IntegrationStatus = 'connected' | 'warning' | 'disconnected' | 'syncing' | 'configuring';

export interface IntegrationInstance {
  id: string;
  name: string; // User-editable, e.g., "Azure AD — Corp Prod"
  slug: string; // Stable identifier derived from name
  connectorType: string; // References connector.id from connectors.ts
  connectorName: string; // Display name of connector type
  connectorCategory: ConnectorCategory;
  environment: IntegrationEnvironment;
  status: IntegrationStatus;
  owner: string;
  tags?: string[];
  
  // Metadata
  tenant?: string;
  domain?: string;
  instanceUrl?: string;
  region?: string;
  
  // Health & Activity
  health: number; // 0-100
  lastSync: string;
  nextSync?: string;
  accountsCount?: number;
  groupsCount?: number;
  errorCount?: number;
  
  // Configuration reference (not stored here in real app - use secrets manager)
  settings?: Record<string, any>;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock data showing multiple instances of same connector types
export const mockIntegrationInstances: IntegrationInstance[] = [
  {
    id: 'int-az-corp-prod',
    name: 'Azure AD — Corp Prod',
    slug: 'azure-ad-corp-prod',
    connectorType: 'azure-ad',
    connectorName: 'Azure AD',
    connectorCategory: 'idp',
    environment: 'prod',
    status: 'connected',
    owner: 'IdM Team',
    tags: ['production', 'critical'],
    tenant: 'contoso.onmicrosoft.com',
    domain: 'contoso.com',
    health: 98,
    lastSync: '2 minutes ago',
    nextSync: 'in 5 hours 58 minutes',
    accountsCount: 12453,
    groupsCount: 487,
    errorCount: 0,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-10-01T14:22:00Z',
    createdBy: 'admin@company.com',
  },
  {
    id: 'int-az-ma-tenant',
    name: 'Azure AD — M&A Tenant',
    slug: 'azure-ad-ma-tenant',
    connectorType: 'azure-ad',
    connectorName: 'Azure AD',
    connectorCategory: 'idp',
    environment: 'prod',
    status: 'warning',
    owner: 'IdM Team',
    tags: ['production', 'acquisition'],
    tenant: 'fabrikam.onmicrosoft.com',
    domain: 'fabrikam.com',
    health: 92,
    lastSync: '1 hour ago',
    nextSync: 'in 5 hours',
    accountsCount: 3421,
    groupsCount: 156,
    errorCount: 12,
    createdAt: '2024-08-22T09:15:00Z',
    updatedAt: '2024-10-01T13:15:00Z',
    createdBy: 'admin@company.com',
  },
  {
    id: 'int-az-sandbox',
    name: 'Azure AD — Dev/Test',
    slug: 'azure-ad-dev-test',
    connectorType: 'azure-ad',
    connectorName: 'Azure AD',
    connectorCategory: 'idp',
    environment: 'sandbox',
    status: 'connected',
    owner: 'DevOps Team',
    tags: ['sandbox', 'testing'],
    tenant: 'contoso-dev.onmicrosoft.com',
    domain: 'dev.contoso.com',
    health: 100,
    lastSync: '15 minutes ago',
    nextSync: 'in 5 hours 45 minutes',
    accountsCount: 234,
    groupsCount: 45,
    errorCount: 0,
    createdAt: '2024-03-10T14:20:00Z',
    updatedAt: '2024-10-01T14:00:00Z',
    createdBy: 'devops@company.com',
  },
  {
    id: 'int-workday-prod',
    name: 'Workday — HR Production',
    slug: 'workday-hr-production',
    connectorType: 'workday',
    connectorName: 'Workday',
    connectorCategory: 'hris',
    environment: 'prod',
    status: 'connected',
    owner: 'HR Tech Team',
    tags: ['production', 'hris', 'critical'],
    tenant: 'acme',
    instanceUrl: 'https://wd5-impl-services1.workday.com',
    health: 100,
    lastSync: '5 minutes ago',
    nextSync: 'in 23 hours 55 minutes',
    accountsCount: 8932,
    groupsCount: 0,
    errorCount: 0,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-10-01T14:20:00Z',
    createdBy: 'hr-admin@company.com',
  },
  {
    id: 'int-workday-sandbox',
    name: 'Workday — Sandbox',
    slug: 'workday-sandbox',
    connectorType: 'workday',
    connectorName: 'Workday',
    connectorCategory: 'hris',
    environment: 'sandbox',
    status: 'connected',
    owner: 'HR Tech Team',
    tags: ['sandbox', 'testing'],
    tenant: 'acme_sbx',
    instanceUrl: 'https://wd5-impl-services1.workday.com',
    health: 95,
    lastSync: '30 minutes ago',
    nextSync: 'in 23 hours 30 minutes',
    accountsCount: 150,
    groupsCount: 0,
    errorCount: 2,
    createdAt: '2024-02-01T08:30:00Z',
    updatedAt: '2024-10-01T13:45:00Z',
    createdBy: 'hr-admin@company.com',
  },
  {
    id: 'int-m365-prod',
    name: 'Microsoft 365 — Production',
    slug: 'microsoft-365-production',
    connectorType: 'microsoft-365',
    connectorName: 'Microsoft 365',
    connectorCategory: 'saas',
    environment: 'prod',
    status: 'connected',
    owner: 'IT Operations',
    tags: ['production', 'licenses'],
    tenant: 'contoso.onmicrosoft.com',
    health: 99,
    lastSync: '10 minutes ago',
    nextSync: 'in 5 hours 50 minutes',
    accountsCount: 12453,
    groupsCount: 342,
    errorCount: 1,
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-10-01T14:05:00Z',
    createdBy: 'it-admin@company.com',
  },
  {
    id: 'int-sf-sales',
    name: 'Salesforce — Sales Cloud',
    slug: 'salesforce-sales-cloud',
    connectorType: 'salesforce',
    connectorName: 'Salesforce',
    connectorCategory: 'saas',
    environment: 'prod',
    status: 'connected',
    owner: 'Sales Ops',
    tags: ['production', 'crm'],
    instanceUrl: 'https://acme.my.salesforce.com',
    health: 97,
    lastSync: '20 minutes ago',
    nextSync: 'in 5 hours 40 minutes',
    accountsCount: 1834,
    groupsCount: 89,
    errorCount: 3,
    createdAt: '2024-03-15T09:30:00Z',
    updatedAt: '2024-10-01T13:55:00Z',
    createdBy: 'sales-admin@company.com',
  },
  {
    id: 'int-sf-service',
    name: 'Salesforce — Service Cloud',
    slug: 'salesforce-service-cloud',
    connectorType: 'salesforce',
    connectorName: 'Salesforce',
    connectorCategory: 'saas',
    environment: 'prod',
    status: 'connected',
    owner: 'Support Ops',
    tags: ['production', 'support'],
    instanceUrl: 'https://acme-service.my.salesforce.com',
    health: 96,
    lastSync: '18 minutes ago',
    nextSync: 'in 5 hours 42 minutes',
    accountsCount: 542,
    groupsCount: 34,
    errorCount: 0,
    createdAt: '2024-04-10T10:00:00Z',
    updatedAt: '2024-10-01T13:57:00Z',
    createdBy: 'support-admin@company.com',
  },
  {
    id: 'int-aws-prod',
    name: 'AWS — Production',
    slug: 'aws-production',
    connectorType: 'aws',
    connectorName: 'AWS',
    connectorCategory: 'cloud',
    environment: 'prod',
    status: 'connected',
    owner: 'Cloud Team',
    tags: ['production', 'cloud', 'iam'],
    region: 'us-east-1',
    health: 98,
    lastSync: '12 minutes ago',
    nextSync: 'in 5 hours 48 minutes',
    accountsCount: 234,
    groupsCount: 67,
    errorCount: 0,
    createdAt: '2024-02-28T13:00:00Z',
    updatedAt: '2024-10-01T14:03:00Z',
    createdBy: 'cloud-admin@company.com',
  },
  {
    id: 'int-okta-prod',
    name: 'Okta — SSO Production',
    slug: 'okta-sso-production',
    connectorType: 'okta',
    connectorName: 'Okta',
    connectorCategory: 'idp',
    environment: 'prod',
    status: 'connected',
    owner: 'Security Team',
    tags: ['production', 'sso'],
    domain: 'acme.okta.com',
    health: 100,
    lastSync: '3 minutes ago',
    nextSync: 'in 5 hours 57 minutes',
    accountsCount: 12453,
    groupsCount: 234,
    errorCount: 0,
    createdAt: '2024-01-05T12:00:00Z',
    updatedAt: '2024-10-01T14:12:00Z',
    createdBy: 'security-admin@company.com',
  },
  {
    id: 'int-ad-onprem',
    name: 'Active Directory — On-Premise',
    slug: 'active-directory-on-premise',
    connectorType: 'active-directory',
    connectorName: 'Active Directory',
    connectorCategory: 'directory',
    environment: 'prod',
    status: 'connected',
    owner: 'Infrastructure Team',
    tags: ['production', 'on-premise', 'critical'],
    domain: 'corp.contoso.com',
    health: 97,
    lastSync: '8 minutes ago',
    nextSync: 'in 5 hours 52 minutes',
    accountsCount: 15234,
    groupsCount: 892,
    errorCount: 5,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-10-01T14:07:00Z',
    createdBy: 'infra-admin@company.com',
  },
  {
    id: 'int-snow-prod',
    name: 'ServiceNow — ITSM Production',
    slug: 'servicenow-itsm-production',
    connectorType: 'servicenow',
    connectorName: 'ServiceNow',
    connectorCategory: 'saas',
    environment: 'prod',
    status: 'connected',
    owner: 'IT Service Management',
    tags: ['production', 'itsm'],
    instanceUrl: 'https://acme.service-now.com',
    health: 99,
    lastSync: '6 minutes ago',
    nextSync: 'in 5 hours 54 minutes',
    accountsCount: 2341,
    groupsCount: 145,
    errorCount: 0,
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-10-01T14:09:00Z',
    createdBy: 'itsm-admin@company.com',
  },
];

// Helper functions
export function getInstanceById(id: string): IntegrationInstance | undefined {
  return mockIntegrationInstances.find((i) => i.id === id);
}

export function getInstancesByConnectorType(connectorType: string): IntegrationInstance[] {
  return mockIntegrationInstances.filter((i) => i.connectorType === connectorType);
}

export function getInstancesByEnvironment(environment: IntegrationEnvironment): IntegrationInstance[] {
  return mockIntegrationInstances.filter((i) => i.environment === environment);
}

export function getInstancesByStatus(status: IntegrationStatus): IntegrationInstance[] {
  return mockIntegrationInstances.filter((i) => i.status === status);
}

export function getInstancesByOwner(owner: string): IntegrationInstance[] {
  return mockIntegrationInstances.filter((i) => i.owner === owner);
}

export function searchInstances(query: string): IntegrationInstance[] {
  const lowerQuery = query.toLowerCase();
  return mockIntegrationInstances.filter(
    (i) =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.connectorName.toLowerCase().includes(lowerQuery) ||
      i.owner.toLowerCase().includes(lowerQuery) ||
      i.tenant?.toLowerCase().includes(lowerQuery) ||
      i.domain?.toLowerCase().includes(lowerQuery) ||
      i.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// Generate instance name suggestions
export function suggestInstanceName(
  connectorName: string,
  tenant?: string,
  domain?: string,
  environment?: IntegrationEnvironment
): string {
  const parts = [connectorName];
  
  if (tenant) {
    parts.push(tenant.split('.')[0]); // e.g., "contoso" from "contoso.onmicrosoft.com"
  } else if (domain) {
    parts.push(domain.split('.')[0]); // e.g., "contoso" from "contoso.com"
  }
  
  if (environment && environment !== 'prod') {
    parts.push(environment.charAt(0).toUpperCase() + environment.slice(1));
  }
  
  return parts.join(' — ');
}

// Validate instance name uniqueness
export function isInstanceNameUnique(name: string, excludeId?: string): boolean {
  return !mockIntegrationInstances.some(
    (i) => i.name.toLowerCase() === name.toLowerCase() && i.id !== excludeId
  );
}