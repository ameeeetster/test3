import { 
  Database, 
  Cloud, 
  Building2, 
  Users, 
  ShoppingCart,
  Shield,
  FileText,
  Zap
} from 'lucide-react';

export type FieldType = 'text' | 'select' | 'file' | 'toggle' | 'multiselect' | 'textarea';

export interface Field {
  type: FieldType;
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  secret?: boolean;
  helper?: string;
  options?: { label: string; value: string }[];
  accept?: string;
  defaultValue?: any;
  validation?: (value: any) => string | null;
}

export type StepRenderType = 'fields' | 'mapping' | 'scope' | 'schedule' | 'preflight' | 'summary';

export interface Step {
  id: string;
  title: string;
  description?: string;
  fields?: Field[];
  render?: StepRenderType;
  optional?: boolean;
}

export type ConnectorCategory = 'directory' | 'idp' | 'hris' | 'saas' | 'cloud' | 'pam';

export interface Capability {
  id: string;
  label: string;
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  icon: any;
  capabilities: Capability[];
  steps: Step[];
  defaults?: Record<string, any>;
  docsUrl?: string;
}

// Connector definitions
export const connectors: ConnectorDefinition[] = [
  {
    id: 'azure-ad',
    name: 'Azure AD',
    description: 'Microsoft Azure Active Directory identity provider with Graph API support',
    category: 'idp',
    icon: Cloud,
    capabilities: [
      { id: 'oauth', label: 'OAuth2' },
      { id: 'graph', label: 'Graph API' },
      { id: 'provisioning', label: 'Provisioning' },
      { id: 'delta', label: 'Delta Sync' },
    ],
    docsUrl: 'https://learn.microsoft.com/en-us/azure/active-directory/',
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        description: 'Configure your Azure AD tenant connection',
        fields: [
          {
            type: 'text',
            key: 'tenantId',
            label: 'Tenant ID',
            required: true,
            placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            helper: 'Your Azure AD tenant identifier (GUID)',
          },
          {
            type: 'text',
            key: 'primaryDomain',
            label: 'Primary Domain',
            required: true,
            placeholder: 'contoso.onmicrosoft.com',
            helper: 'Primary verified domain for your tenant',
          },
          {
            type: 'select',
            key: 'environment',
            label: 'Azure Environment',
            required: true,
            defaultValue: 'public',
            options: [
              { label: 'Azure Public Cloud', value: 'public' },
              { label: 'Azure US Government', value: 'gov' },
              { label: 'Azure China (21Vianet)', value: 'china' },
            ],
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        description: 'Configure app registration and credentials',
        fields: [
          {
            type: 'text',
            key: 'clientId',
            label: 'Application (Client) ID',
            required: true,
            placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            helper: 'From your Azure AD App Registration',
          },
          {
            type: 'text',
            key: 'directoryId',
            label: 'Directory (Tenant) ID',
            required: true,
            placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          },
          {
            type: 'text',
            key: 'clientSecret',
            label: 'Client Secret',
            secret: true,
            placeholder: 'Enter client secret or upload certificate below',
            helper: 'Client secret from app registration (or use certificate)',
          },
          {
            type: 'file',
            key: 'certificate',
            label: 'Certificate (Optional)',
            accept: '.pfx,.pem,.cer',
            helper: 'Upload X.509 certificate as alternative to client secret',
          },
          {
            type: 'multiselect',
            key: 'permissions',
            label: 'Required Permissions',
            required: true,
            helper: 'Ensure these are granted in Azure portal',
            options: [
              { label: 'User.Read.All', value: 'User.Read.All' },
              { label: 'Group.Read.All', value: 'Group.Read.All' },
              { label: 'Directory.Read.All', value: 'Directory.Read.All' },
              { label: 'Directory.ReadWrite.All', value: 'Directory.ReadWrite.All' },
            ],
            defaultValue: ['User.Read.All', 'Group.Read.All'],
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        description: 'Define what to sync from Azure AD',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        description: 'Map Azure AD attributes to your identity model',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        description: 'Configure user lifecycle management',
        fields: [
          {
            type: 'toggle',
            key: 'createUsers',
            label: 'Create Users',
            defaultValue: true,
            helper: 'Automatically create new users discovered in Azure AD',
          },
          {
            type: 'toggle',
            key: 'updateUsers',
            label: 'Update Users',
            defaultValue: true,
            helper: 'Update existing user attributes on sync',
          },
          {
            type: 'toggle',
            key: 'disableUsers',
            label: 'Disable Users (Soft Delete)',
            defaultValue: true,
            helper: 'Disable users removed from Azure AD instead of deleting',
          },
          {
            type: 'toggle',
            key: 'groupWriteback',
            label: 'Group Writeback',
            defaultValue: false,
            helper: 'Write group memberships back to Azure AD',
          },
          {
            type: 'select',
            key: 'conflictPolicy',
            label: 'Conflict Resolution',
            defaultValue: 'source-wins',
            options: [
              { label: 'Source Wins (Azure AD)', value: 'source-wins' },
              { label: 'Target Wins (IAM)', value: 'target-wins' },
              { label: 'Manual Review', value: 'manual' },
            ],
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        description: 'Configure sync frequency and options',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        description: 'Validate connection and permissions',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        description: 'Review configuration and create integration',
        render: 'summary',
      },
    ],
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'Workday HCM system with SOAP/RaaS integration',
    category: 'hris',
    icon: Building2,
    capabilities: [
      { id: 'soap', label: 'SOAP/RaaS' },
      { id: 'effective-dated', label: 'Effective-dated' },
      { id: 'org-data', label: 'Org Data' },
    ],
    docsUrl: 'https://community.workday.com/integration',
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        description: 'Configure Workday tenant connection',
        fields: [
          {
            type: 'text',
            key: 'tenant',
            label: 'Tenant Name',
            required: true,
            placeholder: 'acme_d',
            helper: 'Your Workday tenant identifier',
          },
          {
            type: 'text',
            key: 'host',
            label: 'Workday Host',
            required: true,
            placeholder: 'services1.myworkday.com',
            helper: 'Workday services hostname',
          },
          {
            type: 'select',
            key: 'environment',
            label: 'Environment',
            required: true,
            defaultValue: 'prod',
            options: [
              { label: 'Production', value: 'prod' },
              { label: 'Sandbox', value: 'sbx' },
              { label: 'Implementation', value: 'impl' },
            ],
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        description: 'Configure ISU or OAuth credentials',
        fields: [
          {
            type: 'select',
            key: 'authMethod',
            label: 'Authentication Method',
            required: true,
            defaultValue: 'oauth',
            options: [
              { label: 'OAuth 2.0 (Recommended)', value: 'oauth' },
              { label: 'ISU (Integration System User)', value: 'isu' },
            ],
          },
          {
            type: 'text',
            key: 'clientId',
            label: 'Client ID',
            placeholder: 'For OAuth authentication',
          },
          {
            type: 'text',
            key: 'clientSecret',
            label: 'Client Secret',
            secret: true,
            placeholder: 'For OAuth authentication',
          },
          {
            type: 'text',
            key: 'isuUsername',
            label: 'ISU Username',
            placeholder: 'For ISU authentication',
          },
          {
            type: 'text',
            key: 'isuPassword',
            label: 'ISU Password',
            secret: true,
            placeholder: 'For ISU authentication',
          },
          {
            type: 'text',
            key: 'raasPeopleUrl',
            label: 'RaaS People Report URL',
            placeholder: 'https://[tenant].workday.com/ccx/service/...',
            helper: 'Custom report URL for worker data',
          },
          {
            type: 'text',
            key: 'raasOrgUrl',
            label: 'RaaS Organization Report URL',
            placeholder: 'https://[tenant].workday.com/ccx/service/...',
            helper: 'Custom report URL for org structure',
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        description: 'Define organizational scope and filters',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        description: 'Map Workday worker attributes',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        description: 'Configure worker lifecycle handling',
        fields: [
          {
            type: 'toggle',
            key: 'preHire',
            label: 'Create Pre-hire Identities',
            defaultValue: false,
            helper: 'Create identities for workers with future start dates',
          },
          {
            type: 'toggle',
            key: 'rehire',
            label: 'Detect and Merge Rehires',
            defaultValue: true,
            helper: 'Reactivate existing identities for rehired workers',
          },
          {
            type: 'toggle',
            key: 'futureTerminate',
            label: 'Honor Future-dated Terminations',
            defaultValue: true,
            helper: 'Schedule deactivation based on termination date',
          },
          {
            type: 'text',
            key: 'effectiveDateWindow',
            label: 'Effective Date Window (Days)',
            defaultValue: '90',
            helper: 'Look ahead/behind for effective-dated changes',
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        description: 'Configure sync frequency',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        description: 'Validate connection and permissions',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        description: 'Review configuration',
        render: 'summary',
      },
    ],
  },
  {
    id: 'active-directory',
    name: 'Active Directory',
    description: 'On-premises Active Directory via LDAP/LDAPS',
    category: 'directory',
    icon: Database,
    capabilities: [
      { id: 'ldap', label: 'LDAP' },
      { id: 'ldaps', label: 'LDAPS' },
      { id: 'agent', label: 'Agent-based' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'host',
            label: 'LDAP Host',
            required: true,
            placeholder: 'ldap.company.com',
          },
          {
            type: 'text',
            key: 'port',
            label: 'Port',
            required: true,
            defaultValue: '389',
            placeholder: '389 (LDAP) or 636 (LDAPS)',
          },
          {
            type: 'toggle',
            key: 'useSSL',
            label: 'Use SSL/TLS (LDAPS)',
            defaultValue: true,
            helper: 'Recommended for secure connections',
          },
          {
            type: 'text',
            key: 'baseDN',
            label: 'Base DN',
            required: true,
            placeholder: 'DC=company,DC=com',
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        fields: [
          {
            type: 'text',
            key: 'bindDN',
            label: 'Bind DN',
            required: true,
            placeholder: 'CN=Service Account,OU=Users,DC=company,DC=com',
          },
          {
            type: 'text',
            key: 'bindPassword',
            label: 'Bind Password',
            required: true,
            secret: true,
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'createUsers',
            label: 'Create Users',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'updateUsers',
            label: 'Update Users',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'disableUsers',
            label: 'Disable Users',
            defaultValue: true,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Microsoft 365 tenant with license management',
    category: 'saas',
    icon: Users,
    capabilities: [
      { id: 'graph', label: 'Graph API' },
      { id: 'licenses', label: 'License Mgmt' },
      { id: 'provisioning', label: 'Provisioning' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'tenantId',
            label: 'Tenant ID',
            required: true,
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        fields: [
          {
            type: 'text',
            key: 'clientId',
            label: 'Application (Client) ID',
            required: true,
          },
          {
            type: 'text',
            key: 'clientSecret',
            label: 'Client Secret',
            required: true,
            secret: true,
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'assignLicenses',
            label: 'Auto-assign Licenses',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'createMailboxes',
            label: 'Create Exchange Mailboxes',
            defaultValue: true,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Salesforce CRM with profiles and permission sets',
    category: 'saas',
    icon: ShoppingCart,
    capabilities: [
      { id: 'rest', label: 'REST API' },
      { id: 'oauth', label: 'OAuth' },
      { id: 'profiles', label: 'Profiles/PermSets' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'instanceUrl',
            label: 'Instance URL',
            required: true,
            placeholder: 'https://yourinstance.my.salesforce.com',
          },
          {
            type: 'select',
            key: 'environment',
            label: 'Environment',
            defaultValue: 'production',
            options: [
              { label: 'Production', value: 'production' },
              { label: 'Sandbox', value: 'sandbox' },
            ],
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        fields: [
          {
            type: 'text',
            key: 'clientId',
            label: 'Consumer Key',
            required: true,
          },
          {
            type: 'text',
            key: 'clientSecret',
            label: 'Consumer Secret',
            required: true,
            secret: true,
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'assignProfiles',
            label: 'Manage Profiles',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'assignPermissionSets',
            label: 'Manage Permission Sets',
            defaultValue: true,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Amazon Web Services with IAM role assumption',
    category: 'cloud',
    icon: Cloud,
    capabilities: [
      { id: 'assume-role', label: 'AssumeRole' },
      { id: 'iam', label: 'IAM' },
      { id: 'multi-account', label: 'Multi-account' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'roleArn',
            label: 'IAM Role ARN',
            required: true,
            placeholder: 'arn:aws:iam::123456789012:role/IAMIntegrationRole',
            helper: 'Role ARN to assume for API access',
          },
          {
            type: 'text',
            key: 'externalId',
            label: 'External ID',
            required: true,
            placeholder: 'Unique identifier for secure role assumption',
          },
          {
            type: 'select',
            key: 'region',
            label: 'Primary Region',
            defaultValue: 'us-east-1',
            options: [
              { label: 'US East (N. Virginia)', value: 'us-east-1' },
              { label: 'US West (Oregon)', value: 'us-west-2' },
              { label: 'EU (Ireland)', value: 'eu-west-1' },
              { label: 'Asia Pacific (Singapore)', value: 'ap-southeast-1' },
            ],
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'manageIAMUsers',
            label: 'Manage IAM Users',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'manageIAMGroups',
            label: 'Manage IAM Groups',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'timeBoundElevation',
            label: 'Enable Time-bound Elevation',
            defaultValue: false,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
  {
    id: 'okta',
    name: 'Okta',
    description: 'Okta identity platform with SCIM provisioning',
    category: 'idp',
    icon: Shield,
    capabilities: [
      { id: 'scim', label: 'SCIM' },
      { id: 'oauth', label: 'OAuth' },
      { id: 'groups', label: 'Groups' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'domain',
            label: 'Okta Domain',
            required: true,
            placeholder: 'dev-123456.okta.com',
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        fields: [
          {
            type: 'text',
            key: 'apiToken',
            label: 'API Token',
            required: true,
            secret: true,
            helper: 'Create an API token in Okta Admin Console',
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'createUsers',
            label: 'Create Users',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'updateUsers',
            label: 'Update Users',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'deactivateUsers',
            label: 'Deactivate Users',
            defaultValue: true,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'ServiceNow ITSM platform with roles and groups',
    category: 'saas',
    icon: FileText,
    capabilities: [
      { id: 'rest', label: 'REST API' },
      { id: 'roles', label: 'Roles/Groups' },
      { id: 'itsm', label: 'ITSM' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'instanceUrl',
            label: 'Instance URL',
            required: true,
            placeholder: 'https://dev12345.service-now.com',
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        fields: [
          {
            type: 'text',
            key: 'username',
            label: 'Username',
            required: true,
          },
          {
            type: 'text',
            key: 'password',
            label: 'Password',
            required: true,
            secret: true,
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'manageRoles',
            label: 'Manage Roles',
            defaultValue: true,
          },
          {
            type: 'toggle',
            key: 'manageGroups',
            label: 'Manage Groups',
            defaultValue: true,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Atlassian Jira with project and role management',
    category: 'saas',
    icon: Zap,
    capabilities: [
      { id: 'rest', label: 'REST API' },
      { id: 'projects', label: 'Projects/Roles' },
    ],
    steps: [
      {
        id: 'connection',
        title: 'Connection Details',
        fields: [
          {
            type: 'text',
            key: 'siteUrl',
            label: 'Jira Site URL',
            required: true,
            placeholder: 'https://yourcompany.atlassian.net',
          },
        ],
      },
      {
        id: 'authentication',
        title: 'Authentication',
        fields: [
          {
            type: 'text',
            key: 'email',
            label: 'Email',
            required: true,
          },
          {
            type: 'text',
            key: 'apiToken',
            label: 'API Token',
            required: true,
            secret: true,
          },
        ],
      },
      {
        id: 'scope',
        title: 'Scope & Discovery',
        render: 'scope',
      },
      {
        id: 'mapping',
        title: 'Attribute Mapping',
        render: 'mapping',
      },
      {
        id: 'provisioning',
        title: 'Provisioning Options',
        fields: [
          {
            type: 'toggle',
            key: 'manageProjects',
            label: 'Manage Project Access',
            defaultValue: true,
          },
        ],
      },
      {
        id: 'schedule',
        title: 'Sync & Scheduling',
        render: 'schedule',
      },
      {
        id: 'preflight',
        title: 'Test & Preflight',
        render: 'preflight',
      },
      {
        id: 'summary',
        title: 'Review & Create',
        render: 'summary',
      },
    ],
  },
];

// Helper functions
export function getConnectorById(id: string): ConnectorDefinition | undefined {
  return connectors.find((c) => c.id === id);
}

export function getConnectorsByCategory(category: ConnectorCategory): ConnectorDefinition[] {
  return connectors.filter((c) => c.category === category);
}

export function searchConnectors(query: string): ConnectorDefinition[] {
  const lowerQuery = query.toLowerCase();
  return connectors.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery)
  );
}

// Default attribute mappings by connector type
export const defaultMappings: Record<string, Array<{ source: string; target: string; transform?: string }>> = {
  'azure-ad': [
    { source: 'userPrincipalName', target: 'username' },
    { source: 'givenName', target: 'firstName' },
    { source: 'surname', target: 'lastName' },
    { source: 'mail', target: 'email' },
    { source: 'displayName', target: 'displayName' },
    { source: 'department', target: 'department' },
    { source: 'jobTitle', target: 'jobTitle' },
    { source: 'manager', target: 'managerId' },
  ],
  workday: [
    { source: 'WorkerID', target: 'employeeId' },
    { source: 'PrimaryWorkEmail', target: 'email' },
    { source: 'LegalFirstName', target: 'firstName' },
    { source: 'LegalLastName', target: 'lastName' },
    { source: 'PreferredName', target: 'displayName' },
    { source: 'ManagerReference', target: 'managerId' },
    { source: 'CostCenter', target: 'costCenter' },
    { source: 'Location', target: 'location' },
    { source: 'JobProfile', target: 'jobTitle' },
  ],
  'active-directory': [
    { source: 'sAMAccountName', target: 'username' },
    { source: 'mail', target: 'email' },
    { source: 'givenName', target: 'firstName' },
    { source: 'sn', target: 'lastName' },
    { source: 'displayName', target: 'displayName' },
    { source: 'department', target: 'department' },
    { source: 'title', target: 'jobTitle' },
    { source: 'manager', target: 'managerId' },
  ],
};
