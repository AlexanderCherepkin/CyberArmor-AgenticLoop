'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.12,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const items = el.querySelectorAll('[data-stagger]');

    if (mq.matches) {
      items.forEach((item) => {
        (item as HTMLElement).style.opacity = '1';
        (item as HTMLElement).style.transform = 'none';
      });
      return;
    }

    items.forEach((item, i) => {
      const child = item as HTMLElement;
      child.style.opacity = '0';
      child.style.transform = 'translate3d(0, 24px, 0)';
      child.style.transition = `opacity 0.5s ease-out ${i * stagger}s, transform 0.5s ease-out ${i * stagger}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            items.forEach((item, i) => {
              const child = item as HTMLElement;
              child.style.opacity = '1';
              child.style.transform = 'translate3d(0, 0, 0)';
            });
            if (once) observer.unobserve(el);
          } else if (!once) {
            items.forEach((item) => {
              const child = item as HTMLElement;
              child.style.opacity = '0';
              child.style.transform = 'translate3d(0, 24px, 0)';
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stagger, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-stagger className={className}>
      {children}
    </div>
  );
}
