'use client';

import { Locale } from '@/lib/i18n/config';
import { AnimatedSection } from '@/components/motion/animated-section';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';

interface SocialProofProps {
  lang: Locale;
}

const certifications = [
  { id: 'fips', label: 'FIPS 140-3', level: 'Level 4' },
  { id: 'cc', label: 'Common Criteria', level: 'EAL6+' },
  { id: 'nist', label: 'NIST', level: 'SP 800-63B' },
  { id: 'natod', label: 'NATO', level: 'Restricted' },
  { id: 'tsc', label: 'TAA', level: 'Compliant' },
  { id: 'iso', label: 'ISO 27001', level: 'Aligned' },
];

const stats = [
  { value: '<1s', labelEn: 'Unlock time', labelRu: 'Время разблокировки' },
  { value: '0', labelEn: 'Keys in the cloud', labelRu: 'Ключей в облаке' },
  { value: '99.99%', labelEn: 'Tamper response uptime', labelRu: 'Доступность защиты' },
];

export function SocialProof({ lang }: SocialProofProps) {
  const isRu = lang === 'ru';

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <AnimatedSection className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">
            {isRu ? 'Сертификаты и соответствие' : 'Certifications & Compliance'}
          </p>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-platinum md:text-3xl">
            {isRu
              ? 'Стандарты, которым соответствует SecureKey'
              : 'Standards SecureKey is Built to Meet'}
          </h2>
        </AnimatedSection>

        <StaggerContainer className="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {certifications.map((cert) => (
            <StaggerItem key={cert.id}>
              <div className="group rounded border border-platinum/10 bg-graphite/20 p-6 transition duration-300 hover:border-cyan/40 hover:bg-cyan/5">
                <h3 className="font-heading text-lg font-semibold text-platinum transition group-hover:text-cyan">
                  {cert.label}
                </h3>
                <p className="mt-1 text-sm text-platinum/60">{cert.level}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimatedSection direction="up">
          <div className="grid gap-6 border-y border-platinum/10 py-12 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <p className="font-heading text-4xl font-bold text-cyan md:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm text-platinum/60">{isRu ? stat.labelRu : stat.labelEn}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
