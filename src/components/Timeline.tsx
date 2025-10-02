import React from 'react';
import { CheckCircle2, Clock, User, Send } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: 'completed' | 'active' | 'pending';
  title: string;
  description: string;
  timestamp?: string;
  user?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'active':
        return Clock;
      default:
        return User;
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'var(--success)';
      case 'active':
        return 'var(--primary)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {events.map((event, index) => {
        const Icon = getIcon(event.status);
        const isLast = index === events.length - 1;
        
        return (
          <div key={event.id} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
            {/* Timeline line */}
            {!isLast && (
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '36px',
                bottom: '-20px',
                width: '2px',
                backgroundColor: event.status === 'completed' ? 'var(--success)' : 'var(--border)',
                opacity: event.status === 'completed' ? 0.3 : 1
              }} />
            )}
            
            {/* Icon */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: event.status === 'pending' ? 'var(--accent)' : event.status === 'completed' ? 'var(--success-bg)' : 'var(--info-bg)',
              border: `2px solid ${getStatusColor(event.status)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1
            }}>
              <Icon 
                className="w-4 h-4" 
                style={{ color: getStatusColor(event.status) }} 
                strokeWidth={2.5} 
              />
            </div>
            
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: 'var(--text)', 
                marginBottom: '2px' 
              }}>
                {event.title}
              </h4>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--text-secondary)', 
                marginBottom: '4px' 
              }}>
                {event.description}
              </p>
              {event.timestamp && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  {event.timestamp}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}