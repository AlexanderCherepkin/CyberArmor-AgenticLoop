import { cookies } from 'next/headers';
import { Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/get-messages';
import { HeroContent } from '@/components/sections/hero';
import { EarlyAccessContent } from '@/components/sections/early-access';
import { HomeClient } from '@/components/sections/home-client';

function getHeroVariant(): 'A' | 'B' {
  try {
    const cookieStore = cookies();
    const value = cookieStore.get('hero_variant')?.value;
    return value === 'A' || value === 'B' ? value : 'A';
  } catch {
    return 'A';
  }
}

export default async function HomePage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const messages = await getMessages(lang);
  const variant = getHeroVariant();

  const heroMessages = messages.hero as {
    variants: Record<'A' | 'B', { headline: string; subheadline: string }>;
    ctaPrimary: string;
    ctaSecondary: string;
  };

  const earlyAccessMessages = messages.hero as {
    earlyAccess: EarlyAccessContent;
  };

  const heroContent: HeroContent = {
    headline: heroMessages.variants[variant].headline,
    subheadline: heroMessages.variants[variant].subheadline,
    ctaPrimary: heroMessages.ctaPrimary,
    ctaSecondary: heroMessages.ctaSecondary,
  };

  return (
    <HomeClient
      lang={lang}
      heroContent={heroContent}
      earlyAccessContent={earlyAccessMessages.earlyAccess}
      explodedViewMessages={messages.explodedView}
      testimonialsMessages={messages.testimonials}
    />
  );
}
