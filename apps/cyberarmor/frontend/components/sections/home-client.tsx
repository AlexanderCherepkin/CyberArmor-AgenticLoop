'use client';

import { useState } from 'react';
import { Locale } from '@/lib/i18n/config';
import { Hero, HeroContent } from '@/components/sections/hero';
import { EarlyAccess, EarlyAccessContent } from '@/components/sections/early-access';
import { ExplodedView } from '@/components/three/exploded-view';
import { HowItWorks } from '@/components/sections/how-it-works';
import { SocialProof } from '@/components/sections/social-proof';
import { Testimonials } from '@/components/sections/testimonials';

interface HomeClientProps {
  lang: Locale;
  heroContent: HeroContent;
  earlyAccessContent: EarlyAccessContent;
  explodedViewMessages: unknown;
  testimonialsMessages: unknown;
}

export function HomeClient({
  lang,
  heroContent,
  earlyAccessContent,
  explodedViewMessages,
  testimonialsMessages,
}: HomeClientProps) {
  const [segment, setSegment] = useState<'B2C' | 'B2B' | null>(null);

  const handleSelectSegment = (selected: 'B2C' | 'B2B') => {
    setSegment(selected);
    setTimeout(() => {
      document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="pt-16">
      <Hero lang={lang} content={heroContent} onSelectSegment={handleSelectSegment} />

      <EarlyAccess lang={lang} content={earlyAccessContent} initialSegment={segment} />

      <ExplodedView lang={lang} messages={explodedViewMessages as never} />

      <HowItWorks lang={lang} />

      <SocialProof lang={lang} />

      <Testimonials lang={lang} messages={testimonialsMessages as never} />
    </div>
  );
}
