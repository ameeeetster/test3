import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Database,
  Cloud,
  Building2,
  Users,
  ShoppingCart,
  Plus,
  Filter,
  X,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { IntegrationCard, Integration } from '../components/IntegrationCard';
import { IntegrationDrawer } from '../components/IntegrationDrawer';
import { FilterChip } from '../components/FilterChip';
import { toast } from 'sonner';
import { IntegrationDetailPage } from './IntegrationDetailPage';
import { mockIntegrationInstances, type IntegrationInstance } from '../data/integration-instances';

// Icon mapping for connector types
const getConnectorIcon = (connectorType: string): typeof Database => {
  const iconMap: Record<string, typeof Database> = {
    'azure-ad': Cloud,
    'active-directory': Database,
    'workday': Building2,
    'microsoft-365': Users,
    'salesforce': ShoppingCart,
    'servicenow': Database,
    'aws': Cloud,
    'okta': Cloud,
    'jira': ShoppingCart,
  };
  return iconMap[connectorType] || Database;
};

// Convert IntegrationInstance to Integration
const instanceToIntegration = (instance: IntegrationInstance): Integration => ({
  id: instance.id,
  name: instance.name,
  connectorName: instance.connectorName,
  connectorType: instance.connectorType, // Add connectorType for brand icons
  icon: getConnectorIcon(instance.connectorType),
  category: instance.connectorCategory.toUpperCase(),
  status: instance.status,
  lastSync: instance.lastSync,
  users: instance.accountsCount || 0,
  syncHealth: instance.health,
  owner: instance.owner,
  environment: instance.environment,
  tenant: instance.tenant,
  domain: instance.domain,
});

const mockIntegrations: Integration[] = mockIntegrationInstances.map(instanceToIntegration);

// Keep old mock for backward compatibility (will remove later)
const _oldMockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Active Directory',
    icon: Database,
    category: 'Directory',
    status: 'connected',
    lastSync: '2 minutes ago',
    users: 1247,
    syncHealth: 98,
    owner: 'IT Team',
  },
  {
    id: '2',
    name: 'Azure AD',
    icon: Cloud,
    category: 'IdP',
    status: 'connected',
    lastSync: '5 minutes ago',
    users: 892,
    syncHealth: 100,
    owner: 'Cloud Team',
  },
  {
    id: '3',
    name: 'Workday',
    icon: Building2,
    category: 'HR',
    status: 'connected',
    lastSync: '1 hour ago',
    users: 1153,
    syncHealth: 95,
    owner: 'HR Team',
  },
  {
    id: '4',
    name: 'Salesforce',
    icon: ShoppingCart,
    category: 'SaaS',
    status: 'syncing',
    lastSync: '10 minutes ago',
    users: 456,
    syncHealth: 100,
    owner: 'Sales Team',
    syncProgress: 34,
  },
  {
    id: '5',
    name: 'Microsoft 365',
    icon: Users,
    category: 'SaaS',
    status: 'connected',
    lastSync: '3 minutes ago',
    users: 1247,
    syncHealth: 97,
    owner: 'IT Team',
  },
  {
    id: '6',
    name: 'Oracle ERP',
    icon: Database,
    category: 'SaaS',
    status: 'warning',
    statusReason: 'Certificate expires in 7 days',
    lastSync: '2 days ago',
    users: 324,
    syncHealth: 65,
    owner: 'Finance Team',
  },
  {
    id: '7',
    name: 'AWS',
    icon: Cloud,
    category: 'Cloud',
    status: 'connected',
    lastSync: '15 minutes ago',
    users: 178,
    syncHealth: 100,
    owner: 'DevOps Team',
  },
  {
    id: '8',
    name: 'Azure',
    icon: Cloud,
    category: 'Cloud',
    status: 'connected',
    lastSync: '8 minutes ago',
    users: 203,
    syncHealth: 99,
    owner: 'Cloud Team',
  },
  {
    id: '9',
    name: 'GCP',
    icon: Cloud,
    category: 'Cloud',
    status: 'disconnected',
    statusReason: 'Authentication failed',
    lastSync: '7 days ago',
    users: 45,
    syncHealth: 0,
    owner: 'DevOps Team',
  },
];

const mockJobs = [
  {
    id: '1',
    type: 'Full Sync',
    status: 'success' as const,
    timestamp: '2 minutes ago',
    details: 'Synced 1,247 users',
  },
  {
    id: '2',
    type: 'Delta Sync',
    status: 'success' as const,
    timestamp: '1 hour ago',
    details: 'Updated 12 users',
  },
  {
    id: '3',
    type: 'Full Sync',
    status: 'warning' as const,
    timestamp: '6 hours ago',
    details: '3 users skipped due to validation',
  },
];

type FilterType = 'status' | 'category' | 'owner' | 'environment' | 'type';

interface ActiveFilter {
  type: FilterType;
  value: string;
  label: string;
}

export function IntegrationsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const handleKPIClick = (filterValue: string) => {
    const filterMap: Record<string, ActiveFilter> = {
      connected: { type: 'status', value: 'connected', label: 'Status: Connected' },
      'needs-attention': {
        type: 'status',
        value: 'needs-attention',
        label: 'Status: Needs Attention',
      },
    };

    const filter = filterMap[filterValue];
    if (!filter) return;

    // Toggle filter
    const exists = activeFilters.some((f) => f.type === filter.type && f.value === filter.value);
    if (exists) {
      setActiveFilters(activeFilters.filter((f) => !(f.type === filter.type && f.value === filter.value)));
    } else {
      // Remove any existing filters of the same type
      setActiveFilters([...activeFilters.filter((f) => f.type !== filter.type), filter]);
    }
  };

  const handleChipFilterClick = (type: FilterType, value: string, label: string) => {
    const exists = activeFilters.some((f) => f.type === type && f.value === value);
    if (exists) {
      setActiveFilters(activeFilters.filter((f) => !(f.type === type && f.value === value)));
    } else {
      // For chip filters, allow multiple selections within the same type
      setActiveFilters([...activeFilters, { type, value, label }]);
    }
  };

  const removeFilter = (filter: ActiveFilter) => {
    setActiveFilters(activeFilters.filter((f) => !(f.type === filter.type && f.value === filter.value)));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const filteredIntegrations = useMemo(() => {
    if (activeFilters.length === 0) return mockIntegrations;

    return mockIntegrations.filter((integration) => {
      return activeFilters.every((filter) => {
        if (filter.type === 'status') {
          if (filter.value === 'needs-attention') {
            return integration.status === 'warning' || integration.status === 'disconnected';
          }
          return integration.status === filter.value;
        }
        if (filter.type === 'category') {
          return integration.category === filter.value;
        }
        if (filter.type === 'owner') {
          return integration.owner === filter.value;
        }
        if (filter.type === 'environment') {
          return integration.environment === filter.value;
        }
        if (filter.type === 'type') {
          return integration.connectorName === filter.value;
        }
        return true;
      });
    });
  }, [activeFilters]);

  const stats = {
    total: mockIntegrations.length,
    connected: mockIntegrations.filter((i) => i.status === 'connected').length,
    needsAttention: mockIntegrations.filter((i) => i.status !== 'connected').length,
  };

  const handleCardClick = (integration: Integration) => {
    setSelectedIntegration({
      ...integration,
      nextSync: 'In 4 hours',
      errors: integration.status === 'disconnected' ? 1 : 0,
      warnings: integration.status === 'warning' ? 1 : 0,
      jobs: mockJobs,
    });
    setDrawerOpen(true);
  };

  const handleOpenDetails = () => {
    if (selectedIntegration) {
      setDrawerOpen(false);
      navigate(`/integrations/${selectedIntegration.id}`);
    }
  };

  const statusChips = [
    { value: 'connected', label: 'Connected' },
    { value: 'warning', label: 'Warning' },
    { value: 'disconnected', label: 'Disconnected' },
    { value: 'syncing', label: 'Syncing' },
  ];

  const categoryChips = [
    { value: 'IDP', label: 'IdP' },
    { value: 'HRIS', label: 'HRIS' },
    { value: 'SAAS', label: 'SaaS' },
    { value: 'CLOUD', label: 'Cloud' },
    { value: 'DIRECTORY', label: 'Directory' },
  ];

  const environmentChips = [
    { value: 'prod', label: 'Production' },
    { value: 'sandbox', label: 'Sandbox' },
    { value: 'dev', label: 'Development' },
    { value: 'gov', label: 'Government' },
  ];

  const typeChips = [...new Set(mockIntegrations.map((i) => i.connectorName).filter(Boolean))].map(
    (type) => ({
      value: type!,
      label: type!,
    })
  );

  const ownerChips = [...new Set(mockIntegrations.map((i) => i.owner).filter(Boolean))].map(
    (owner) => ({
      value: owner!,
      label: owner!,
    })
  );

  const activeFilterCount = activeFilters.length;

  // If we have an ID in the URL, show the detail page
  if (id) {
    return <IntegrationDetailPage />;
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1
              style={{
                fontSize: 'var(--text-display)',
                lineHeight: 'var(--line-height-display)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              Integrations
            </h1>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--muted-foreground)' }}>
              Manage connections to your identity sources and applications
            </p>
          </div>
          <Button onClick={() => navigate('/integrations/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {/* KPI Cards (Clickable Filters) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card
            className="p-4 cursor-pointer transition-all duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
            onClick={() => clearAllFilters()}
            tabIndex={0}
            role="button"
            aria-label="Show all integrations"
          >
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              Total Integrations
            </div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
              }}
            >
              {stats.total}
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer transition-all duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: activeFilters.some((f) => f.value === 'connected')
                ? 'var(--success-bg)'
                : 'var(--surface)',
              border: activeFilters.some((f) => f.value === 'connected')
                ? '2px solid var(--success-border)'
                : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
            onClick={() => handleKPIClick('connected')}
            tabIndex={0}
            role="button"
            aria-label="Filter by connected integrations"
          >
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              Connected
            </div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--success)',
              }}
            >
              {stats.connected}
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer transition-all duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundColor: activeFilters.some((f) => f.value === 'needs-attention')
                ? 'var(--danger-bg)'
                : 'var(--surface)',
              border: activeFilters.some((f) => f.value === 'needs-attention')
                ? '2px solid var(--danger-border)'
                : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
            onClick={() => handleKPIClick('needs-attention')}
            tabIndex={0}
            role="button"
            aria-label="Filter by integrations needing attention"
          >
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              Needs Attention
            </div>
            <div
              style={{
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--danger)',
              }}
            >
              {stats.needsAttention}
            </div>
          </Card>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
              Active filters:
            </span>
            {activeFilters.map((filter, index) => (
              <FilterChip
                key={`${filter.type}-${filter.value}-${index}`}
                label={filter.label}
                onRemove={() => removeFilter(filter)}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Facet Filter Bar */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Status:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {statusChips.map((chip) => {
                const isActive = activeFilters.some(
                  (f) => f.type === 'status' && f.value === chip.value
                );
                return (
                  <Badge
                    key={chip.value}
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-120 hover:shadow-sm"
                    onClick={() =>
                      handleChipFilterClick('status', chip.value, `Status: ${chip.label}`)
                    }
                    style={{
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="h-6 w-px" style={{ backgroundColor: 'var(--border)' }} />

          {/* Category Filters */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Category:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categoryChips.map((chip) => {
                const isActive = activeFilters.some(
                  (f) => f.type === 'category' && f.value === chip.value
                );
                return (
                  <Badge
                    key={chip.value}
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-120 hover:shadow-sm"
                    onClick={() =>
                      handleChipFilterClick('category', chip.value, `Category: ${chip.label}`)
                    }
                    style={{
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="h-6 w-px" style={{ backgroundColor: 'var(--border)' }} />

          {/* Environment Filters */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Environment:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {environmentChips.map((chip) => {
                const isActive = activeFilters.some(
                  (f) => f.type === 'environment' && f.value === chip.value
                );
                return (
                  <Badge
                    key={chip.value}
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-120 hover:shadow-sm"
                    onClick={() =>
                      handleChipFilterClick('environment', chip.value, `Env: ${chip.label}`)
                    }
                    style={{
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="h-6 w-px" style={{ backgroundColor: 'var(--border)' }} />

          {/* Type Filters */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Type:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {typeChips.slice(0, 5).map((chip) => {
                const isActive = activeFilters.some(
                  (f) => f.type === 'type' && f.value === chip.value
                );
                return (
                  <Badge
                    key={chip.value}
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-120 hover:shadow-sm"
                    onClick={() =>
                      handleChipFilterClick('type', chip.value, `Type: ${chip.label}`)
                    }
                    style={{
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="h-6 w-px" style={{ backgroundColor: 'var(--border)' }} />

          {/* Owner Filters */}
          <div className="flex items-center gap-2">
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--muted-foreground)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Owner:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ownerChips.slice(0, 4).map((chip) => {
                const isActive = activeFilters.some(
                  (f) => f.type === 'owner' && f.value === chip.value
                );
                return (
                  <Badge
                    key={chip.value}
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer transition-all duration-120 hover:shadow-sm"
                    onClick={() =>
                      handleChipFilterClick('owner', chip.value, `Owner: ${chip.label}`)
                    }
                    style={{
                      fontSize: 'var(--text-xs)',
                    }}
                  >
                    {chip.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <>
              <div className="h-6 w-px" style={{ backgroundColor: 'var(--border)' }} />
              <Badge variant="secondary">
                <Filter className="w-3 h-3 mr-1" />
                {activeFilterCount}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onClick={() => handleCardClick(integration)}
            onSync={() => toast.success(`Syncing ${integration.name}...`)}
            onTest={() => toast.info(`Testing connection to ${integration.name}...`)}
            onSettings={() => navigate(`/integrations/${integration.id}`)}
            onRename={(newName) => {
              toast.success(`Renamed integration to "${newName}"`);
              // In real app: API call to update name
            }}
            onDuplicate={() => {
              toast.success(`Duplicating ${integration.name}...`);
              // In real app: API call to create duplicate
            }}
            onDisable={() => {
              const action = integration.status === 'disconnected' ? 'enabled' : 'disabled';
              toast.success(`Integration ${action}`);
              // In real app: API call to toggle status
            }}
            onDelete={() => {
              toast.success(`Integration "${integration.name}" deleted`);
              // In real app: show confirmation dialog, then API call to delete
            }}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div
          className="text-center py-12"
          style={{
            color: 'var(--muted-foreground)',
          }}
        >
          <p style={{ fontSize: 'var(--text-body)' }}>No integrations match your filters.</p>
          <Button variant="link" onClick={clearAllFilters} className="mt-2">
            Clear all filters
          </Button>
        </div>
      )}

      {/* Quick View Drawer */}
      <IntegrationDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        integration={selectedIntegration}
        onOpenDetails={handleOpenDetails}
        onSync={() => {
          toast.success(`Syncing ${selectedIntegration?.name}...`);
          setDrawerOpen(false);
        }}
        onTest={() => {
          toast.info(`Testing connection to ${selectedIntegration?.name}...`);
        }}
        onReconnect={() => {
          toast.info(`Reconnecting ${selectedIntegration?.name}...`);
          setDrawerOpen(false);
        }}
      />
    </div>
  );
}
