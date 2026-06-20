'use client';

import { Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { HeroToken } from '@/components/three/hero-token';
import { HeroReveal } from '@/components/motion/hero-reveal';
import { Shield } from 'lucide-react';

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

interface HeroProps {
  lang: Locale;
  content: HeroContent;
  onSelectSegment: (segment: 'B2C' | 'B2B') => void;
}

export function Hero({ lang, content, onSelectSegment }: HeroProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-quantum-blue/10 via-transparent to-transparent opacity-40" />

      <HeroToken lang={lang} />

      <div className="relative z-10 -mt-12 max-w-4xl">
        <HeroReveal delay={0.1}>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-platinum md:text-6xl lg:text-7xl">
            {content.headline}
          </h1>
        </HeroReveal>

        <HeroReveal delay={0.3}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-platinum/70 md:text-lg">
            {content.subheadline}
          </p>
        </HeroReveal>

        <HeroReveal delay={0.5}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="cyber-sharp min-w-[220px]"
              onClick={() => onSelectSegment('B2C')}
            >
              {content.ctaPrimary}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cyber-sharp min-w-[220px]"
              onClick={() => onSelectSegment('B2B')}
            >
              {content.ctaSecondary}
            </Button>
          </div>
        </HeroReveal>

        <HeroReveal delay={0.7}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-y border-platinum/10 py-3 text-xs text-platinum/50 cyber-sharp">
            <span>FIPS 140-3 Level 4</span>
            <span className="hidden h-3 w-px bg-platinum/20 sm:block" />
            <span>Common Criteria EAL6+</span>
            <span className="hidden h-3 w-px bg-platinum/20 sm:block" />
            <span>NATO Restricted</span>
          </div>
        </HeroReveal>
      </div>
    </section>
  );
}
