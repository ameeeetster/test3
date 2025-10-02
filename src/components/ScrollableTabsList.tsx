import React, { useRef, useState, useEffect } from 'react';
import { TabsList } from './ui/tabs';

interface ScrollableTabsListProps extends React.ComponentProps<typeof TabsList> {
  children: React.ReactNode;
}

/**
 * Enhanced TabsList with fade edges on mobile to indicate scrollability
 */
export function ScrollableTabsList({ children, className, ...props }: ScrollableTabsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const el = listRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const el = listRef.current;
    if (!el) return;

    // Check initially and on resize
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    // Check on scroll
    el.addEventListener('scroll', checkScroll);

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', checkScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/* Left fade edge */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none
          bg-gradient-to-r from-slate-50/80 dark:from-white/[0.03] to-transparent
          transition-opacity duration-200 md:hidden
          ${showLeftFade ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}
      />
      
      {/* Right fade edge */}
      <div
        className={`
          absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none
          bg-gradient-to-l from-slate-50/80 dark:from-white/[0.03] to-transparent
          transition-opacity duration-200 md:hidden
          ${showRightFade ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}
      />
      
      <TabsList ref={listRef} className={className} {...props}>
        {children}
      </TabsList>
    </div>
  );
}