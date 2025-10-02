import React from 'react';
import { Users, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';

interface ImpactPreviewBarProps {
  membersAffected: number;
  entitlementsChanged: number;
  riskChange?: 'increase' | 'decrease' | 'none';
  onViewDetails?: () => void;
}

export function ImpactPreviewBar({
  membersAffected,
  entitlementsChanged,
  riskChange = 'none',
  onViewDetails
}: ImpactPreviewBarProps) {
  return (
    <div 
      className="sticky bottom-0 left-0 right-0 p-4 border-t backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--overlay)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 max-w-[1320px] mx-auto">
        <div className="flex items-center gap-6">
          <div>
            <div style={{ 
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--text)'
            }}>
              Impact Preview
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '2px' }}>
              Changes will affect the following
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              <div>
                <div style={{ 
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  {membersAffected.toLocaleString()}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  Members
                </div>
              </div>
            </div>

            <div className="w-px h-8" style={{ backgroundColor: 'var(--border)' }} />

            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--info)' }} />
              <div>
                <div style={{ 
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text)'
                }}>
                  {entitlementsChanged}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
                  Entitlements
                </div>
              </div>
            </div>

            {riskChange !== 'none' && (
              <>
                <div className="w-px h-8" style={{ backgroundColor: 'var(--border)' }} />
                <div className="flex items-center gap-2">
                  {riskChange === 'increase' ? (
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                  ) : (
                    <TrendingDown className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  )}
                  <div>
                    <div style={{ 
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: riskChange === 'increase' ? 'var(--danger)' : 'var(--success)'
                    }}>
                      Risk {riskChange === 'increase' ? 'Increase' : 'Decrease'}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {onViewDetails && (
          <Button onClick={onViewDetails} variant="outline" size="sm">
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}
