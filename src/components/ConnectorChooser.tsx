import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ConnectorTile } from './ConnectorTile';
import { connectors, type ConnectorCategory } from '../data/connectors';

interface ConnectorChooserProps {
  onSelect: (connectorId: string) => void;
  onCancel: () => void;
}

export function ConnectorChooser({ onSelect, onCancel }: ConnectorChooserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ConnectorCategory | 'all'>('all');

  const categories: Array<{ value: ConnectorCategory | 'all'; label: string; count: number }> = [
    { value: 'all', label: 'All', count: connectors.length },
    { value: 'directory', label: 'Directory', count: connectors.filter((c) => c.category === 'directory').length },
    { value: 'idp', label: 'IdP', count: connectors.filter((c) => c.category === 'idp').length },
    { value: 'hris', label: 'HRIS', count: connectors.filter((c) => c.category === 'hris').length },
    { value: 'saas', label: 'SaaS', count: connectors.filter((c) => c.category === 'saas').length },
    { value: 'cloud', label: 'Cloud', count: connectors.filter((c) => c.category === 'cloud').length },
  ];

  const filteredConnectors = useMemo(() => {
    let result = connectors;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.capabilities.some((cap) => cap.label.toLowerCase().includes(query))
      );
    }

    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--text)',
                marginBottom: '8px',
              }}
            >
              Choose a Connector
            </h2>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--muted-foreground)' }}>
              Select the system you want to integrate with your IAM platform
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted-foreground)' }}
          />
          <Input
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Category:</span>
          {categories.map((cat) => (
            <Badge
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              className="cursor-pointer transition-all duration-120 hover:shadow-sm"
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                fontSize: 'var(--text-xs)',
              }}
            >
              {cat.label} ({cat.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Connector Grid */}
      {filteredConnectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConnectors.map((connector) => (
            <ConnectorTile key={connector.id} connector={connector} onClick={() => onSelect(connector.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--muted-foreground)' }}>
            No connectors found matching your criteria.
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
