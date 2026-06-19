'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Locale } from '@/lib/i18n/config';

interface CookieBannerProps {
  lang: Locale;
}

type ConsentStatus = 'undecided' | 'accepted' | 'rejected';

const STORAGE_KEY = 'cyberarmor_cookie_consent';

export function CookieBanner({ lang }: CookieBannerProps) {
  const [status, setStatus] = useState<ConsentStatus>('undecided');
  const [mounted, setMounted] = useState(false);
  const isRu = lang === 'ru';

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null;
      if (saved === 'accepted' || saved === 'rejected') {
        setStatus(saved);
      }
    } catch {
      // localStorage may be blocked
    }
  }, []);

  const save = (value: ConsentStatus) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    setStatus(value);
  };

  if (!mounted || status !== 'undecided') return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={isRu ? 'Согласие на использование cookie' : 'Cookie consent'}
      className={cn(
        'fixed inset-x-4 bottom-4 z-[90] rounded border border-cyan/20 bg-graphite/95 p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md md:left-auto md:right-6 md:bottom-6 md:max-w-md'
      )}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-platinum">
            {isRu ? 'Мы используем cookie' : 'We use cookies'}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-platinum/70">
            {isRu
              ? 'Этот сайт использует только необходимые cookie для корзины, безопасности и выбора языка. Мы не продаём данные и не используем сторонние трекеры.'
              : 'This site only uses essential cookies for cart, security, and language selection. We do not sell data or use third-party trackers.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => save('accepted')}>
            {isRu ? 'Принять' : 'Accept'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => save('rejected')}>
            {isRu ? 'Отклонить' : 'Reject'}
          </Button>
          <a
            href={`/${lang}/privacy`}
            className="ml-auto text-xs text-cyan underline underline-offset-2 hover:text-cyan/80"
          >
            {isRu ? 'Подробнее' : 'Learn more'}
          </a>
        </div>
      </div>
    </div>
  );
}
