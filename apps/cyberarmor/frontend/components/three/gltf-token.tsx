'use client';

import { Component, ReactNode, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TokenParts } from './token-parts';

interface GLTFModelProps {
  url: string;
  reducedMotion?: boolean;
  mouse?: { x: number; y: number };
}

function Model({ url, reducedMotion = false, mouse }: GLTFModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!reducedMotion) {
      groupRef.current.rotation.y += delta * 0.15;
    }

    if (mouse) {
      targetRotation.current.x += (mouse.y * 0.15 - targetRotation.current.x) * 0.05;
      targetRotation.current.y += (mouse.x * 0.15 - targetRotation.current.y) * 0.05;
    }

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotation.current.x,
      0.05
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      -targetRotation.current.y,
      0.05
    );
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(e.object.name || 'component');
      }}
      onPointerOut={() => setHovered(null)}
    >
      <primitive object={scene} scale={1.5} />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="rounded border border-cyan/30 bg-obsidian/90 px-2 py-1 text-xs text-cyan">
            {hovered}
          </div>
        </Html>
      )}
    </group>
  );
}

interface FallbackBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface FallbackBoundaryState {
  hasError: boolean;
}

class FallbackBoundary extends Component<FallbackBoundaryProps, FallbackBoundaryState> {
  constructor(props: FallbackBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): FallbackBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('GLTF loading failed, using procedural fallback:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function GLTFToken({ url, reducedMotion = false, mouse }: GLTFModelProps) {
  return (
    <FallbackBoundary
      fallback={
        <>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} />
          <directionalLight position={[-5, -5, -2]} intensity={0.8} color="#66FCF1" />
          <pointLight position={[0, 2, 3]} intensity={0.6} color="#45A29E" />
          <TokenParts exploded={0} autoRotate={!reducedMotion} mouse={mouse} />
          <ContactShadows position={[0, -2.2, 0]} opacity={0.35} scale={8} blur={2.5} />
        </>
      }
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, -2, -2]} intensity={0.6} color="#66FCF1" />
      <Model url={url} reducedMotion={reducedMotion} mouse={mouse} />
      <ContactShadows position={[0, -2, 0]} opacity={0.3} scale={6} />
    </FallbackBoundary>
  );
}
