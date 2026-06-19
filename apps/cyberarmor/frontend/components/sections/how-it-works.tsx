'use client';

import { useEffect, useRef, useState } from 'react';
import { Locale } from '@/lib/i18n/config';
import { AnimatedSection } from '@/components/motion/animated-section';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';
import { KeyRound, Fingerprint, ShieldCheck } from 'lucide-react';

interface HowItWorksProps {
  lang: Locale;
}

const steps = [
  {
    id: 'insert',
    icon: KeyRound,
    en: { title: 'Insert', desc: 'Plug SecureKey into any USB-C port before boot.' },
    ru: { title: 'Вставьте', desc: 'Подключите SecureKey к USB-C до загрузки системы.' },
  },
  {
    id: 'verify',
    icon: Fingerprint,
    en: { title: 'Verify', desc: 'Authenticate with your fingerprint on the token.' },
    ru: { title: 'Подтвердите', desc: 'Авторизуйтесь отпечатком прямо на токене.' },
  },
  {
    id: 'work',
    icon: ShieldCheck,
    en: { title: 'Work Secure', desc: 'PC unlocks, drive decrypts, keys never leave the device.' },
    ru: { title: 'Работайте', desc: 'ПК разблокируется, диск расшифруется, ключи не покидают токен.' },
  },
];

export function HowItWorks({ lang }: HowItWorksProps) {
  const isRu = lang === 'ru';
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setProgress(1);
      return;
    }

    let trigger: { kill: () => void } | null = null;

    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const obj = { value: 0 };
        trigger = gsap.to(obj, {
          value: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
            end: 'bottom 40%',
            scrub: 0.5,
          },
          onUpdate: () => setProgress(obj.value),
        });
      });
    });

    return () => trigger?.kill();
  }, []);

  return (
    <section className="border-y border-platinum/10 bg-graphite/30 py-24" ref={containerRef}>
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">
            {isRu ? 'Как это работает' : 'How it works'}
          </p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-platinum md:text-4xl">
            {isRu ? 'Три шага до полного контроля' : 'Three Steps to Total Control'}
          </h2>
        </AnimatedSection>

        <StaggerContainer className="relative grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const t = steps.length > 1 ? index / (steps.length - 1) : 0;
            const active = progress >= t;
            const tLabel = isRu ? step.ru : step.en;

            return (
              <StaggerItem key={step.id}>
                <div
                  className={`relative rounded border bg-obsidian p-8 transition duration-500 ${
                    active
                      ? 'border-cyan/50 shadow-[0_0_30px_-10px_rgba(102,252,241,0.15)]'
                      : 'border-platinum/10'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border transition duration-500 ${
                      active ? 'border-cyan bg-cyan/10' : 'border-platinum/20'
                    }`}
                  >
                    <Icon className={`h-6 w-6 transition duration-500 ${active ? 'text-cyan' : 'text-platinum/50'}`} />
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-semibold text-platinum">{tLabel.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-platinum/60">{tLabel.desc}</p>

                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 md:block">
                      <div
                        className="h-full bg-gradient-to-r from-cyan/60 to-transparent transition-all duration-700"
                        style={{ opacity: active ? 1 : 0.2, width: active ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
