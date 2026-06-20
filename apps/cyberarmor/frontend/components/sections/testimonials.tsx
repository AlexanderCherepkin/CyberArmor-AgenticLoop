'use client';

import { Locale } from '@/lib/i18n/config';
import { AnimatedSection } from '@/components/motion/animated-section';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';
import { Quote } from 'lucide-react';

interface TestimonialItem {
  role: string;
  industry: string;
  quote: string;
}

interface TestimonialsMessages {
  eyebrow: string;
  title: string;
  items: TestimonialItem[];
}

interface TestimonialsProps {
  lang: Locale;
  messages?: TestimonialsMessages;
}

export function Testimonials({ lang, messages }: TestimonialsProps) {
  const isRu = lang === 'ru';

  const t: TestimonialsMessages = messages || {
    eyebrow: isRu ? 'Практическая проверка' : 'Field Validation',
    title: isRu ? 'Что говорят лидеры в области безопасности' : 'What security leaders are saying',
    items: [
      {
        role: isRu ? 'Директор по информационной безопасности' : 'Chief Information Security Officer',
        industry: isRu ? 'Швейцарское управление капиталом' : 'Swiss Wealth Management',
        quote: isRu
          ? 'Единственный аппаратный токен, который мы оценили, где ключи действительно никогда не попадают в операционную систему хоста.'
          : 'The only hardware token we have evaluated where the keys genuinely never enter the host operating system.',
      },
      {
        role: isRu ? 'Руководитель IT-операций' : 'Head of IT Operations',
        industry: isRu ? 'Критическая инфраструктура' : 'Critical Infrastructure',
        quote: isRu
          ? 'Удалённое провижининг и криптографическое уничтожение при вскрытии дают нам чистую историю реагирования на инциденты.'
          : 'Remote provisioning and cryptographic erasure on tamper give us a clean incident-response story.',
      },
      {
        role: isRu ? 'Архитектор кастоди криптоактивов' : 'Crypto Custody Architect',
        industry: isRu ? 'Фонд цифровых активов' : 'Digital Asset Fund',
        quote: isRu
          ? 'Наконец-то потребительский форм-фактор с разделением HSM-уровня между ключевым материалом и пользовательским интерфейсом.'
          : 'Finally a consumer-grade form factor with HSM-like separation between the key material and the user interface.',
      },
    ],
  };

  return (
    <section className="border-y border-platinum/10 bg-graphite/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">{t.eyebrow}</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-platinum md:text-4xl">
            {t.title}
          </h2>
        </AnimatedSection>

        <StaggerContainer
          className="grid gap-6 md:grid-cols-3"
          stagger={0.1}
        >
          {t.items.map((item, index) => (
            <StaggerItem key={index}>
              <div className="cyber-sharp-card group relative flex h-full flex-col justify-between hover:border-cyan/40 hover:bg-cyan/5 hover:shadow-[0_0_30px_-12px_rgba(102,252,241,0.15)]">
                <Quote className="h-6 w-6 text-cyan/30 transition group-hover:text-cyan/60" />
                <p className="my-6 text-sm leading-relaxed text-platinum/80">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-platinum/10 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-platinum/20 bg-obsidian text-xs font-bold uppercase text-platinum cyber-sharp">
                    {item.role
                      .split(' ')
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-platinum">{item.role}</p>
                    <p className="text-xs text-platinum/50">{item.industry}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
