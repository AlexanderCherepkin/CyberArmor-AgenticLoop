'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { TokenParts } from './token-parts';
import { GLTFToken } from './gltf-token';
import { SVGFallback } from './svg-fallback';
import { WebGLBoundary, hasWebGL } from './webgl-boundary';
import { Locale } from '@/lib/i18n/config';

interface HeroTokenProps {
  lang: Locale;
  modelUrl?: string;
}

function HeroScene({ reducedMotion, mouse }: { reducedMotion: boolean; mouse?: { x: number; y: number } }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} />
      <directionalLight position={[-5, -5, -2]} intensity={0.8} color="#66FCF1" />
      <pointLight position={[0, 2, 3]} intensity={0.6} color="#45A29E" />
      <pointLight position={[2, -2, 2]} intensity={0.4} color="#FF3333" />
      <TokenParts exploded={0} autoRotate={!reducedMotion} mouse={mouse} />
      <ContactShadows position={[0, -2.2, 0]} opacity={0.35} scale={8} blur={2.5} />
    </>
  );
}

export function HeroToken({ lang, modelUrl }: HeroTokenProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    setWebglAvailable(hasWebGL());

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);

    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouse({ x, y });
    };

    if (!mq.matches) {
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    return () => {
      mq.removeEventListener('change', handler);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  if (!webglAvailable) {
    return <SVGFallback lang={lang} className="h-[50vh] w-full md:h-[65vh]" />;
  }

  const canvas = (
    <div className="h-[50vh] w-full md:h-[65vh]">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        {modelUrl ? (
          <GLTFToken url={modelUrl} reducedMotion={reducedMotion} mouse={mouse} />
        ) : (
          <HeroScene reducedMotion={reducedMotion} mouse={mouse} />
        )}
      </Canvas>
    </div>
  );

  return <WebGLBoundary lang={lang} className="h-[50vh] w-full md:h-[65vh]">{canvas}</WebGLBoundary>;
}
