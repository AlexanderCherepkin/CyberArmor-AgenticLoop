'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface HeroRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function HeroReveal({ children, className = '', delay = 0 }: HeroRevealProps) {
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

    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 24px, 0)';
    el.style.transition = `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`;

    const t = setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translate3d(0, 0, 0)';
    }, 50);

    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
