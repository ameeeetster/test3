import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { ConnectorDefinition } from '../data/connectors';
import { BrandLogo } from './BrandLogo';

interface ConnectorTileProps {
  connector: ConnectorDefinition;
  onClick: () => void;
}

export function ConnectorTile({ connector, onClick }: ConnectorTileProps) {
  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    directory: { bg: 'var(--info-bg)', border: 'var(--info-border)', text: 'var(--info)' },
    idp: { bg: 'var(--primary)', border: 'var(--primary-light)', text: 'var(--primary)' },
    hris: { bg: 'var(--success-bg)', border: 'var(--success-border)', text: 'var(--success)' },
    saas: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', text: 'var(--warning)' },
    cloud: { bg: 'var(--info-bg)', border: 'var(--info-border)', text: 'var(--info)' },
    pam: { bg: 'var(--danger-bg)', border: 'var(--danger-border)', text: 'var(--danger)' },
  };

  const categoryConfig = categoryColors[connector.category];

  return (
    <Card
      className="p-5 cursor-pointer transition-all duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Configure ${connector.name} integration`}
    >
      {/* Icon & Category */}
      <div className="flex items-start justify-between mb-4">
        <BrandLogo
          connectorType={connector.id}
          fallbackIcon={connector.icon}
          size="xl"
          backgroundOpacity={0.12}
          showBorder={true}
          borderOpacity={0.2}
          className="transition-transform duration-150 group-hover:scale-105"
        />
        <Badge
          variant="outline"
          style={{
            backgroundColor: categoryConfig.bg,
            borderColor: categoryConfig.border,
            color: categoryConfig.text,
            fontSize: 'var(--text-xs)',
            textTransform: 'uppercase',
          }}
        >
          {connector.category}
        </Badge>
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <h3
          style={{
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--text)',
            marginBottom: '4px',
          }}
        >
          {connector.name}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--muted-foreground)',
            lineHeight: 'var(--line-height-normal)',
          }}
        >
          {connector.description}
        </p>
      </div>

      {/* Capability Chips */}
      <div className="flex flex-wrap gap-1.5">
        {connector.capabilities.map((cap) => (
          <Badge
            key={cap.id}
            variant="secondary"
            style={{
              fontSize: 'var(--text-xs)',
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)',
            }}
          >
            {cap.label}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
