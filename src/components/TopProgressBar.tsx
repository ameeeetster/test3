import React, { useEffect, useRef } from 'react';

/**
 * Lightweight top progress bar.
 * Usage:
 *  <TopProgressBar active={loading} />
 */
export function TopProgressBar({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.style.opacity = '1';
      el.style.transform = 'scaleX(1)';
    } else {
      // fade out smoothly
      el.style.opacity = '0';
      el.style.transform = 'scaleX(0)';
    }
  }, [active]);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        transformOrigin: '0 0',
        transform: 'scaleX(0)',
        background:
          'linear-gradient(90deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 65%, white) 100%)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        opacity: 0,
        transition: 'transform 320ms var(--ease-out), opacity 320ms var(--ease-out)',
        zIndex: 9999,
      }}
    />
  );
}


