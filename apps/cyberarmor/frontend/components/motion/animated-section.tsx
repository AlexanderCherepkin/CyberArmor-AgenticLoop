'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  duration?: number;
  once?: boolean;
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const initial = {
      opacity: 0,
      x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
    };

    el.style.opacity = String(initial.opacity);
    el.style.transform = `translate3d(${initial.x}px, ${initial.y}px, 0)`;
    el.style.transition = `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = '1';
            el.style.transform = 'translate3d(0, 0, 0)';
            if (once) {
              observer.unobserve(el);
            }
          } else if (!once) {
            el.style.opacity = String(initial.opacity);
            el.style.transform = `translate3d(${initial.x}px, ${initial.y}px, 0)`;
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction, duration, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
