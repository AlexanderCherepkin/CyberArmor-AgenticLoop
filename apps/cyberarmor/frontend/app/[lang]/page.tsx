import Link from 'next/link';
import { Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { HeroToken } from '@/components/three/hero-token';
import { ExplodedView } from '@/components/three/exploded-view';
import { HowItWorks } from '@/components/sections/how-it-works';
import { SocialProof } from '@/components/sections/social-proof';
import { HeroReveal } from '@/components/motion/hero-reveal';
import { AnimatedSection } from '@/components/motion/animated-section';
import { Shield, Lock, Zap } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: { lang: Locale };
}) {
  const { lang } = params;
  const isRu = lang === 'ru';

  return (
    <div className="pt-16">
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-quantum-blue/10 via-transparent to-transparent opacity-40" />

        <HeroToken lang={lang} />

        <div className="relative z-10 -mt-12 max-w-4xl">
          <HeroReveal delay={0.1}>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-platinum md:text-6xl lg:text-7xl">
              {isRu ? 'Абсолютный физический контроль' : 'Absolute Physical Control'}
              <br />
              <span className="gradient-text">
                {isRu ? 'над вашим цифровым суверенитетом' : 'Over Your Digital Sovereignty'}
              </span>
            </h1>
          </HeroReveal>

          <HeroReveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-platinum/70 md:text-lg">
              {isRu
                ? 'USB-токен уровня defense-grade блокирует ПК, шифрует данные и уничтожает ключи при взломе. Без облака. Без бэкдоров.'
                : 'A defense-grade USB token that locks your PC, encrypts your data, and wipes keys on tamper. No cloud. No backdoors.'}
            </p>
          </HeroReveal>

          <HeroReveal delay={0.5}>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={`/${lang}/shop`}>
                <Button size="lg">{isRu ? 'Заказать SecureKey' : 'Order SecureKey'}</Button>
              </Link>
              <Link href={`/${lang}/solutions`}>
                <Button size="lg" variant="outline">{isRu ? 'Демо для бизнеса' : 'Request Enterprise Demo'}</Button>
              </Link>
            </div>
          </HeroReveal>
        </div>
      </section>

      <ExplodedView lang={lang} />

      <HowItWorks lang={lang} />

      <section className="border-y border-platinum/10 bg-graphite/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="mb-16 text-center">
            <h2 className="font-heading text-2xl font-semibold text-platinum md:text-3xl">
              {isRu ? 'Почему программных паролей уже недостаточно' : 'Why Software Passwords Are No Longer Enough'}
            </h2>
          </AnimatedSection>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: isRu ? 'Физический барьер' : 'Physical Barrier',
                desc: isRu
                  ? 'Без вставленного токена система не загружается. Удалённый злоумышленник физически не может получить доступ.'
                  : 'Without the inserted token, the system will not boot. Remote attackers are physically locked out.',
              },
              {
                icon: Lock,
                title: isRu ? 'AES-256-XTS' : 'AES-256-XTS Encryption',
                desc: isRu
                  ? 'Диск и каталоги шифруются в реальном времени. Ключи дешифрования хранятся в защищённом элементе.'
                  : 'Real-time drive and directory encryption. Decryption keys live inside the secure element only.',
              },
              {
                icon: Zap,
                title: isRu ? 'Anti-Tamper' : 'Anti-Tamper Response',
                desc: isRu
                  ? 'Физическое или криптографическое вмешательство активирует изоляцию данных и криптографическое уничтожение ключей.'
                  : 'Physical or cryptographic tampering triggers data isolation and cryptographic key erasure.',
              },
            ].map((item) => (
              <AnimatedSection
                key={item.title}
                direction="up"
                className="group rounded border border-platinum/10 bg-obsidian p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:bg-cyan/5 hover:shadow-[0_0_30px_-12px_rgba(102,252,241,0.15)]"
              >
                <item.icon className="h-8 w-8 text-cyan transition-transform duration-300 group-hover:scale-110" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-platinum transition-colors group-hover:text-cyan">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-platinum/60">{item.desc}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <SocialProof lang={lang} />
    </div>
  );
}
