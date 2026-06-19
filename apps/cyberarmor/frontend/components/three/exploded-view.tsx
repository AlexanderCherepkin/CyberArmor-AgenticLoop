'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { TokenParts } from './token-parts';
import { Locale } from '@/lib/i18n/config';

interface ExplodedViewProps {
  lang: Locale;
}

export function ExplodedView({ lang }: ExplodedViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isRu = lang === 'ru';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

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
            start: 'top 80%',
            end: 'bottom 20%',
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

  const labels: Record<
    string,
    {
      title: string;
      desc: string;
    }
  > = {
    shell: {
      title: isRu ? 'Бронированный корпус' : 'Hardened Shell',
      desc: isRu
        ? 'Алюминиевый сплав с защитой от вскрытия и EMI-экранированием.'
        : 'Aerospace aluminum with tamper-evident seals and EMI shielding.',
    },
    frame: {
      title: isRu ? 'Внутренний каркас' : 'Inner Frame',
      desc: isRu
        ? 'Эпоксидный каркас фиксирует компоненты при ударе и вибрации.'
        : 'Epoxy frame locks components in place under shock and vibration.',
    },
    pcb: {
      title: isRu ? 'Печатная плата' : 'PCB',
      desc: isRu
        ? 'Многослойная плата с защитой от побочных электромагнитных излучений.'
        : 'Multi-layer board with side-channel emission countermeasures.',
    },
    chip: {
      title: isRu ? 'Защищённый элемент' : 'Secure Element',
      desc: isRu
        ? 'FIPS 140-3 Level 4 чип хранит ключи в изолированной среде.'
        : 'FIPS 140-3 Level 4 chip stores keys in an isolated secure enclave.',
    },
    biometric: {
      title: isRu ? 'Биометрический сенсор' : 'Biometric Sensor',
      desc: isRu
        ? 'Капацитивный сканер с локальным сравнением шаблона.'
        : 'Capacitive matcher with on-device template comparison.',
    },
    'bio-ring': {
      title: isRu ? 'Индикатор статуса' : 'Status Ring',
      desc: isRu
        ? 'Светодиодное кольцо отображает состояние аутентификации.'
        : 'LED ring shows authentication and lock state at a glance.',
    },
    usb: {
      title: isRu ? 'USB-C коннектор' : 'USB-C Connector',
      desc: isRu
        ? 'Полноскоростной USB-C с защитой от перенапряжения и ESD.'
        : 'Full-speed USB-C with over-voltage and ESD protection.',
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-[150vh] w-full overflow-hidden border-y border-platinum/10 bg-obsidian py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-cyan">
            {isRu ? 'Внутреннее устройство' : 'Inside SecureKey'}
          </p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-platinum md:text-4xl">
            {isRu ? 'Семь слоёв физической защиты' : 'Seven Layers of Physical Defense'}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-platinum/60">
            {isRu
              ? 'Прокрутите вниз, чтобы разобрать токен и увидеть, как устроена защита.'
              : 'Scroll down to disassemble the token and see how the defense is built.'}
          </p>
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="h-[60vh] min-h-[400px] w-full rounded border border-platinum/10 bg-graphite/20">
            <Canvas camera={{ position: [0, 0, 5.8], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true }}>
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
              <ContactShadows position={[0, -2.8, 0]} opacity={0.35} scale={8} blur={2.5} />
            </Canvas>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            {Object.entries(labels).map(([id, label]) => {
              const active = hovered === id || (reducedMotion && id === 'chip');
              return (
                <button
                  key={id}
                  type="button"
                  className={`rounded border p-4 text-left transition ${
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
                  <p className="mt-1 text-xs leading-relaxed text-platinum/60">{label.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
