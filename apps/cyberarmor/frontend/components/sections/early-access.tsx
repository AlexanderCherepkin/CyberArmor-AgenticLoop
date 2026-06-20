'use client';

import { useState, useRef, FormEvent, Fragment } from 'react';
import { Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { HeroReveal } from '@/components/motion/hero-reveal';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';

export type SegmentIntent = 'B2C' | 'B2B';

export interface EarlyAccessContent {
  label: string;
  placeholder: string;
  submit: string;
  successTitle: string;
  successMessage: string;
  errorInvalid: string;
  errorSubmit: string;
  privacyNote: string;
}

interface EarlyAccessProps {
  lang: Locale;
  content: EarlyAccessContent;
  initialSegment: SegmentIntent | null;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EarlyAccess({ lang, content, initialSegment }: EarlyAccessProps) {
  const isRu = lang === 'ru';
  const [segment, setSegment] = useState<SegmentIntent | null>(initialSegment);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const label = segment === 'B2B' ? 'Request Enterprise Demo' : 'Request Access';
  const isRuLabel = segment === 'B2B' ? 'Запросить демо для бизнеса' : 'Запросить доступ';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMsg(content.errorInvalid);
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          lead_source: 'Web_PreLaunch_Waitlist',
          segment_intent: segment || 'B2C',
          captured_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('submit failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg(content.errorSubmit);
    }
  };

  return (
    <section id="early-access" className="relative border-y border-platinum/10 bg-graphite/10 py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <HeroReveal delay={0.1}>
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">{content.label}</p>
        </HeroReveal>

        <HeroReveal delay={0.2}>
          <div className="mt-6 inline-flex gap-2 border border-platinum/10 p-1 cyber-sharp">
            <button
              type="button"
              onClick={() => {
                setSegment('B2C');
                setStatus('idle');
                setErrorMsg('');
                setTimeout(() => formRef.current?.querySelector('input')?.focus(), 50);
              }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                segment === 'B2C'
                  ? 'bg-cyan text-obsidian'
                  : 'text-platinum/60 hover:text-platinum'
              }`}
            >
              {isRu ? 'Личное' : 'Personal'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSegment('B2B');
                setStatus('idle');
                setErrorMsg('');
                setTimeout(() => formRef.current?.querySelector('input')?.focus(), 50);
              }}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                segment === 'B2B'
                  ? 'bg-cyan text-obsidian'
                  : 'text-platinum/60 hover:text-platinum'
              }`}
            >
              {isRu ? 'Бизнес' : 'Enterprise'}
            </button>
          </div>
        </HeroReveal>

        <HeroReveal delay={0.3}>
          {status === 'success' ? (
            <div className="mx-auto mt-8 inline-flex items-center gap-3 border border-cyan/30 bg-cyan/10 px-6 py-4 text-left cyber-sharp">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-cyan" />
              <div>
                <p className="font-heading text-sm font-semibold text-cyan">{content.successTitle}</p>
                <p className="text-xs text-platinum/70">{content.successMessage}</p>
              </div>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex w-full max-w-lg flex-col items-center gap-3 sm:flex-row"
            >
              <div className="relative w-full">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder={content.placeholder}
                  disabled={status === 'loading'}
                  className="cyber-sharp-input w-full pr-10"
                />
                <Shield className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan/50" />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={status === 'loading'}
                className="cyber-sharp w-full shrink-0 sm:w-auto"
              >
                {status === 'loading' ? (
                  <Fragment>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isRu ? 'Обработка' : 'Processing'}
                  </Fragment>
                ) : (
                  isRu ? isRuLabel : label
                )}
              </Button>
            </form>
          )}
        </HeroReveal>

        {status === 'error' && errorMsg && (
          <HeroReveal delay={0.4}>
            <p className="mt-3 text-xs text-crimson">{errorMsg}</p>
          </HeroReveal>
        )}

        <HeroReveal delay={0.45}>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-platinum/40">
            <Shield className="h-3 w-3" />
            {content.privacyNote}
          </p>
        </HeroReveal>
      </div>
    </section>
  );
}
