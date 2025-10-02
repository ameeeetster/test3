import React from 'react';
import { Shield, Key, Package } from 'lucide-react';
import { Badge } from './ui/badge';

interface ImpactItem {
  type: 'role' | 'entitlement' | 'application';
  name: string;
  scope?: string;
}

interface ImpactPreviewProps {
  items: ImpactItem[];
}

export const ImpactPreview = React.memo(function ImpactPreview({ items }: ImpactPreviewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'role': return Shield;
      case 'entitlement': return Key;
      default: return Package;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'role': return 'Role';
      case 'entitlement': return 'Entitlement';
      default: return 'Application';
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const Icon = getIcon(item.type);
        return (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-md transition-colors duration-150"
            style={{
              backgroundColor: 'var(--accent)',
              border: '1px solid var(--border)'
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--primary)', opacity: 0.1 }}
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text)'
                  }}
                >
                  {item.name}
                </div>
                {item.scope && (
                  <div
                    className="truncate"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Scope: {item.scope}
                  </div>
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className="ml-2 flex-shrink-0"
              style={{
                fontSize: 'var(--text-xs)',
                borderColor: 'var(--border)',
                color: 'var(--muted-foreground)'
              }}
            >
              {getTypeLabel(item.type)}
            </Badge>
          </div>
        );
      })}
    </div>
  );
});