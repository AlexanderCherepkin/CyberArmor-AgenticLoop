'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html } from '@react-three/drei';
import { TokenParts } from './token-parts';
import { SVGFallback } from './svg-fallback';
import { WebGLBoundary, hasWebGL } from './webgl-boundary';
import { Locale } from '@/lib/i18n/config';

interface ExplodedViewPart {
  title: string;
  description: string;
}

interface ExplodedViewMessages {
  eyebrow: string;
  title: string;
  subtitle: string;
  parts: Record<'shell' | 'resin' | 'chip' | 'biometric', ExplodedViewPart>;
}

interface ExplodedViewProps {
  lang: Locale;
  messages?: ExplodedViewMessages;
}

interface TooltipProps {
  title: string;
  description: string;
}

function Tooltip({ title, description }: TooltipProps) {
  return (
    <Html distanceFactor={10} center className="pointer-events-none">
      <div className="w-56 border border-cyan/40 bg-obsidian/95 p-3 shadow-[0_0_24px_-8px_rgba(102,252,241,0.3)] backdrop-blur-sm cyber-sharp">
        <p className="font-heading text-xs font-semibold uppercase tracking-wide text-cyan">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-platinum/80">{description}</p>
      </div>
    </Html>
  );
}

export function ExplodedView({ lang, messages }: ExplodedViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const isRu = lang === 'ru';

  const t: ExplodedViewMessages = messages || {
    eyebrow: isRu ? 'Внутреннее устройство' : 'Inside SecureKey',
    title: isRu ? 'Четыре слоя физической защиты' : 'Four Layers of Physical Defense',
    subtitle: isRu
      ? 'Прокрутите вниз, чтобы разобрать токен и изучить каждый укреплённый слой.'
      : 'Scroll to disassemble the token and inspect each hardened layer.',
    parts: {
      shell: {
        title: isRu ? 'Титановый корпус' : 'Titanium Alloy Shell',
        description: isRu
          ? 'Корпус из титанового сплава авиационного класса с индикаторами вскрытия и EMI-экранированием.'
          : 'Aerospace-grade titanium casing with tamper-evident seals and EMI shielding.',
      },
      resin: {
        title: isRu ? 'Ударопрочный резиновый слой' : 'Shockproof Resin Layer',
        description: isRu
          ? 'Поглощающая удары резиновая матрица изолирует компоненты от ударов, вибрации и побочных каналов.'
          : 'Impact-absorbing resin matrix isolates components from shock, vibration, and side-channel probing.',
      },
      chip: {
        title: isRu ? 'Защищённый элемент EAL6+' : 'EAL6+ Secure Element',
        description: isRu
          ? 'Сертифицированный по Common Criteria EAL6+ чип хранит ключи в изолированном анклаве.'
          : 'Common Criteria EAL6+ certified chip stores keys in an isolated secure enclave.',
      },
      biometric: {
        title: isRu ? 'Биометрическая матрица' : 'Biometric Scanner Array',
        description: isRu
          ? 'Капацитивный сканер отпечатков выполняет сравнение шаблона прямо на устройстве.'
          : 'Capacitive fingerprint matcher performs on-device template comparison.',
      },
    },
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 767px)');

    setReducedMotion(mq.matches);
    setIsMobile(mobileMq.matches);
    setWebglAvailable(hasWebGL());

    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const onViewportChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mq.addEventListener('change', onMotionChange);
    mobileMq.addEventListener('change', onViewportChange);

    return () => {
      mq.removeEventListener('change', onMotionChange);
      mobileMq.removeEventListener('change', onViewportChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setExploded(0.5);
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
            start: 'top 75%',
            end: 'bottom 25%',
            scrub: 0.6,
          },
          onUpdate: () => setExploded(obj.value),
        });
      });
    });

    return () => {
      trigger?.kill();
    };
  }, [reducedMotion]);

  const activePart = hovered ? t.parts[hovered as keyof typeof t.parts] : null;

  const shouldRenderCanvas = !isMobile && webglAvailable;

  return (
    <div
      ref={containerRef}
      className="relative min-h-[120vh] w-full overflow-hidden border-y border-platinum/10 bg-obsidian py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">{t.eyebrow}</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-platinum md:text-4xl">{t.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-platinum/60">{t.subtitle}</p>
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="relative h-[60vh] min-h-[400px] w-full border border-platinum/10 bg-graphite/20 cyber-sharp">
            {shouldRenderCanvas ? (
              <WebGLBoundary lang={lang} className="h-full w-full">
                <Canvas
                  camera={{ position: [0, 0, 5.6], fov: 45 }}
                  dpr={[1, 2]}
                  gl={{ antialias: true }}
                >
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[5, 5, 5]} intensity={1.8} />
                  <directionalLight position={[-5, -5, -2]} intensity={0.8} color="#66FCF1" />
                  <pointLight position={[0, 2, 3]} intensity={0.6} color="#45A29E" />
                  <pointLight position={[2, -2, 2]} intensity={0.4} color="#FF3333" />
                  <TokenParts
                    exploded={reducedMotion ? 0.5 : exploded}
                    autoRotate={!reducedMotion}
                    hoveredPart={hovered}
                    onPartHover={setHovered}
                  />
                  {hovered && activePart && (
                    <Tooltip title={activePart.title} description={activePart.description} />
                  )}
                  <ContactShadows position={[0, -2.4, 0]} opacity={0.35} scale={8} blur={2.5} />
                </Canvas>
              </WebGLBoundary>
            ) : (
              <SVGFallback lang={lang} className="h-full w-full" />
            )}
          </div>

          <div className="flex flex-col justify-center space-y-3">
            {(['shell', 'resin', 'chip', 'biometric'] as const).map((id) => {
              const label = t.parts[id];
              const active = hovered === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`border p-4 text-left transition cyber-sharp ${
                    active
                      ? 'border-cyan/50 bg-cyan/10'
                      : 'border-platinum/10 bg-graphite/30 hover:border-cyan/30'
                  }`}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(id)}
                  onBlur={() => setHovered(null)}
                >
                  <h3 className="font-heading text-sm font-semibold text-platinum">{label.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-platinum/60">{label.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
