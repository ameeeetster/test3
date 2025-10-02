/**
 * Brand icons mapping for integration connectors
 * Uses Iconify with Simple Icons for scalable, consistent branding
 */

export interface BrandConfig {
  icon: string; // Iconify icon identifier or image URL
  color: string; // Official brand hex color
  label: string; // Display name
  darkColor?: string; // Optional color override for dark mode
  isImage?: boolean; // Whether icon is an image URL instead of an icon identifier
}

export const BRAND_ICONS: Record<string, BrandConfig> = {
  'azure-ad': {
    icon: 'simple-icons:microsoftazure',
    color: '#0078D4',
    label: 'Azure AD',
  },
  'active-directory': {
    icon: 'simple-icons:windows',
    color: '#0078D4',
    label: 'Active Directory',
  },
  'workday': {
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMDc2RDYiIHJ4PSI4Ii8+PHBhdGggZD0iTTI1IDcwIFEyNSA1MCwgNDAgMzUgVDcwIDI1IiBzdHJva2U9IiNGRjkzMDAiIHN0cm9rZS13aWR0aD0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iNTAiIHk9IjYyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5XPC90ZXh0Pjwvc3ZnPg==',
    color: '#0076D6',
    label: 'Workday',
    isImage: true,
  },
  'microsoft-365': {
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIGZpbGw9IiNFQTQzMzUiLz48cmVjdCB4PSIyNiIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiBmaWxsPSIjNENBRjUwIi8+PHJlY3QgeT0iMjYiIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAzQTlGNCIvPjxyZWN0IHg9IjI2IiB5PSIyNiIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiBmaWxsPSIjRkZCQjAwIi8+PC9zdmc+',
    color: '#5E5E5E', // Neutral gray since logo has gradient
    label: 'Microsoft 365',
    isImage: true,
  },
  'm365': {
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIGZpbGw9IiNFQTQzMzUiLz48cmVjdCB4PSIyNiIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiBmaWxsPSIjNENBRjUwIi8+PHJlY3QgeT0iMjYiIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiIgZmlsbD0iIzAzQTlGNCIvPjxyZWN0IHg9IjI2IiB5PSIyNiIgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiBmaWxsPSIjRkZCQjAwIi8+PC9zdmc+',
    color: '#5E5E5E', // Neutral gray since logo has gradient
    label: 'Microsoft 365',
    isImage: true,
  },
  'salesforce': {
    icon: 'simple-icons:salesforce',
    color: '#00A1E0',
    label: 'Salesforce',
  },
  'servicenow': {
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJzbkciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MUI1QTE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjJEMEEwO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMUIzQTM1IiByeD0iOCIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLCA1MCkiPjxwYXRoIGQ9Ik0gLTE4IC0xOCBMIDE4IC0xOCBMIDE4IC04IEwgOCAtOCBMIDggOCBMIDE4IDggTCAxOCAxOCBMIC0xOCAxOCBMIC0xOCA4IEwgLTggOCBMIC04IC04IEwgLTE4IC04IFoiIGZpbGw9InVybCgjc25HKSIvPjwvZz48L3N2Zz4=',
    color: '#1B3A35',
    label: 'ServiceNow',
    isImage: true,
  },
  'jira': {
    icon: 'simple-icons:jira',
    color: '#0052CC',
    label: 'Jira',
  },
  'confluence': {
    icon: 'simple-icons:confluence',
    color: '#172B4D',
    label: 'Confluence',
  },
  'aws': {
    icon: 'simple-icons:amazonaws',
    color: '#FF9900',
    label: 'AWS',
  },
  'azure': {
    icon: 'simple-icons:microsoftazure',
    color: '#0078D4',
    label: 'Azure',
  },
  'gcp': {
    icon: 'simple-icons:googlecloud',
    color: '#4285F4',
    label: 'Google Cloud',
  },
  'okta': {
    icon: 'simple-icons:okta',
    color: '#007DC1',
    label: 'Okta',
  },
  'successfactors': {
    icon: 'simple-icons:sap',
    color: '#0FAAFF',
    label: 'SuccessFactors',
  },
  'sap': {
    icon: 'simple-icons:sap',
    color: '#0FAAFF',
    label: 'SAP',
  },
  'box': {
    icon: 'simple-icons:box',
    color: '#0061D5',
    label: 'Box',
  },
  'github': {
    icon: 'simple-icons:github',
    color: '#181717',
    darkColor: '#F0F6FC', // Light color for dark mode
    label: 'GitHub',
  },
  'gitlab': {
    icon: 'simple-icons:gitlab',
    color: '#FC6D26',
    label: 'GitLab',
  },
  'slack': {
    icon: 'simple-icons:slack',
    color: '#4A154B',
    label: 'Slack',
  },
  'zoom': {
    icon: 'simple-icons:zoom',
    color: '#2D8CFF',
    label: 'Zoom',
  },
  'dropbox': {
    icon: 'simple-icons:dropbox',
    color: '#0061FF',
    label: 'Dropbox',
  },
  'google-workspace': {
    icon: 'simple-icons:google',
    color: '#4285F4',
    label: 'Google Workspace',
  },
  'tableau': {
    icon: 'simple-icons:tableau',
    color: '#E97627',
    label: 'Tableau',
  },
  'databricks': {
    icon: 'simple-icons:databricks',
    color: '#FF3621',
    label: 'Databricks',
  },
  'snowflake': {
    icon: 'simple-icons:snowflake',
    color: '#29B5E8',
    label: 'Snowflake',
  },
  'oracle': {
    icon: 'simple-icons:oracle',
    color: '#F80000',
    label: 'Oracle',
  },
  'atlassian': {
    icon: 'simple-icons:atlassian',
    color: '#0052CC',
    label: 'Atlassian',
  },
  'monday': {
    icon: 'simple-icons:monday',
    color: '#FF3D57',
    label: 'Monday.com',
  },
  'notion': {
    icon: 'simple-icons:notion',
    color: '#000000',
    darkColor: '#FFFFFF',
    label: 'Notion',
  },
  'asana': {
    icon: 'simple-icons:asana',
    color: '#F06A6A',
    label: 'Asana',
  },
  'stripe': {
    icon: 'simple-icons:stripe',
    color: '#008CDD',
    label: 'Stripe',
  },
  'hubspot': {
    icon: 'simple-icons:hubspot',
    color: '#FF7A59',
    label: 'HubSpot',
  },
  'zendesk': {
    icon: 'simple-icons:zendesk',
    color: '#03363D',
    label: 'Zendesk',
  },
  'twilio': {
    icon: 'simple-icons:twilio',
    color: '#F22F46',
    label: 'Twilio',
  },
  'sendgrid': {
    icon: 'simple-icons:sendgrid',
    color: '#1A82E2',
    label: 'SendGrid',
  },
  'airtable': {
    icon: 'simple-icons:airtable',
    color: '#18BFFF',
    label: 'Airtable',
  },
  'figma': {
    icon: 'simple-icons:figma',
    color: '#F24E1E',
    label: 'Figma',
  },
  'adobe': {
    icon: 'simple-icons:adobe',
    color: '#FF0000',
    label: 'Adobe',
  },
  'microsoft': {
    icon: 'simple-icons:microsoft',
    color: '#5E5E5E',
    label: 'Microsoft',
  },
  'apple': {
    icon: 'simple-icons:apple',
    color: '#000000',
    label: 'Apple',
  },
  'google': {
    icon: 'simple-icons:google',
    color: '#4285F4',
    label: 'Google',
  },
  'docker': {
    icon: 'simple-icons:docker',
    color: '#2496ED',
    label: 'Docker',
  },
  'kubernetes': {
    icon: 'simple-icons:kubernetes',
    color: '#326CE5',
    label: 'Kubernetes',
  },
  'terraform': {
    icon: 'simple-icons:terraform',
    color: '#7B42BC',
    label: 'Terraform',
  },
  'ansible': {
    icon: 'simple-icons:ansible',
    color: '#EE0000',
    label: 'Ansible',
  },
  'jenkins': {
    icon: 'simple-icons:jenkins',
    color: '#D24939',
    label: 'Jenkins',
  },
  'circleci': {
    icon: 'simple-icons:circleci',
    color: '#343434',
    label: 'CircleCI',
  },
  'bitbucket': {
    icon: 'simple-icons:bitbucket',
    color: '#0052CC',
    label: 'Bitbucket',
  },
  'pagerduty': {
    icon: 'simple-icons:pagerduty',
    color: '#06AC38',
    label: 'PagerDuty',
  },
  'datadog': {
    icon: 'simple-icons:datadog',
    color: '#632CA6',
    label: 'Datadog',
  },
  'splunk': {
    icon: 'simple-icons:splunk',
    color: '#000000',
    label: 'Splunk',
  },
  'elastic': {
    icon: 'simple-icons:elastic',
    color: '#005571',
    label: 'Elastic',
  },
  'newrelic': {
    icon: 'simple-icons:newrelic',
    color: '#008C99',
    label: 'New Relic',
  },
} as const;

/**
 * Get brand configuration for a connector type
 * Falls back to a generic cloud icon if brand not found
 */
export function getBrandConfig(connectorType: string): BrandConfig {
  const config = BRAND_ICONS[connectorType.toLowerCase()];
  
  if (config) {
    return config;
  }
  
  // Fallback for unknown connectors
  return {
    icon: 'lucide:cloud',
    color: '#64748B',
    label: connectorType,
  };
}

/**
 * Generate a light tinted background color from brand color
 * Uses 10% opacity for subtle brand recognition
 */
export function getBrandBackgroundColor(brandColor: string, opacity: number = 0.1): string {
  // Convert hex to RGB and apply opacity
  const hex = brandColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
