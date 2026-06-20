'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface TokenPart {
  id: 'shell' | 'resin' | 'chip' | 'biometric';
  name: string;
  nameRu: string;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  explodedPosition: THREE.Vector3;
  explodedRotation: THREE.Euler;
}

interface TokenPartsProps {
  exploded?: number;
  autoRotate?: boolean;
  hoveredPart?: string | null;
  onPartHover?: (id: string | null) => void;
  mouse?: { x: number; y: number };
}

export function TokenParts({
  exploded = 0,
  autoRotate = true,
  hoveredPart,
  onPartHover,
  mouse,
}: TokenPartsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentExploded = useRef(exploded);
  const targetRotation = useRef({ x: 0, y: 0 });

  const parts = useMemo<TokenPart[]>(() => {
    const shellMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2833'),
      metalness: 0.9,
      roughness: 0.25,
    });

    const resinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2A3542'),
      metalness: 0.2,
      roughness: 0.45,
      transparent: true,
      opacity: 0.9,
    });

    const chipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B8860B'),
      metalness: 0.85,
      roughness: 0.2,
    });

    const biometricMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0B0C10'),
      metalness: 0.4,
      roughness: 0.35,
    });

    return [
      {
        id: 'shell',
        name: 'Titanium Alloy Shell',
        nameRu: 'Титановый корпус',
        geometry: new THREE.BoxGeometry(0.72, 2.6, 0.32),
        material: shellMat,
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, 1.2, -0.8),
        explodedRotation: new THREE.Euler(0.12, 0, 0),
      },
      {
        id: 'resin',
        name: 'Shockproof Resin Layer',
        nameRu: 'Ударопрочный резиновый слой',
        geometry: new THREE.CapsuleGeometry(0.31, 2.2, 4, 16),
        material: resinMat,
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, 0, Math.PI / 2),
        explodedPosition: new THREE.Vector3(0, -0.1, 0.3),
        explodedRotation: new THREE.Euler(-0.05, 0, Math.PI / 2),
      },
      {
        id: 'chip',
        name: 'EAL6+ Secure Element',
        nameRu: 'Защищённый элемент EAL6+',
        geometry: new THREE.BoxGeometry(0.38, 0.42, 0.08),
        material: chipMat,
        basePosition: new THREE.Vector3(0, 0.1, 0.14),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, -0.4, 1.25),
        explodedRotation: new THREE.Euler(0, 0, 0),
      },
      {
        id: 'biometric',
        name: 'Biometric Scanner Array',
        nameRu: 'Биометрическая матрица',
        geometry: new THREE.CylinderGeometry(0.16, 0.16, 0.06, 32),
        material: biometricMat,
        basePosition: new THREE.Vector3(0, 0.95, 0.18),
        baseRotation: new THREE.Euler(Math.PI / 2, 0, 0),
        explodedPosition: new THREE.Vector3(0, 1.6, 1.45),
        explodedRotation: new THREE.Euler(Math.PI / 2, 0, 0),
      },
    ];
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (autoRotate) {
      groupRef.current.rotation.y += delta * 0.2;
    }

    if (mouse) {
      targetRotation.current.x += (mouse.y * 0.2 - targetRotation.current.x) * 0.05;
      targetRotation.current.y += (mouse.x * 0.2 - targetRotation.current.y) * 0.05;
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

    currentExploded.current += (exploded - currentExploded.current) * 0.08;

    groupRef.current.children.forEach((child) => {
      const part = parts.find((p) => p.id === child.userData.partId);
      if (!part) return;

      const t = currentExploded.current;
      child.position.lerpVectors(part.basePosition, part.explodedPosition, t);
      child.rotation.x = THREE.MathUtils.lerp(part.baseRotation.x, part.explodedRotation.x, t);
      child.rotation.y = THREE.MathUtils.lerp(part.baseRotation.y, part.explodedRotation.y, t);
      child.rotation.z = THREE.MathUtils.lerp(part.baseRotation.z, part.explodedRotation.z, t);

      const isHovered = hoveredPart === part.id;
      const targetEmissive = isHovered ? new THREE.Color('#66FCF1') : new THREE.Color('#000000');
      if ('emissive' in part.material) {
        part.material.emissive.lerp(targetEmissive, 0.12);
        part.material.emissiveIntensity = THREE.MathUtils.lerp(
          part.material.emissiveIntensity || 0,
          isHovered ? 0.4 : 0,
          0.12
        );
      }
    });
  });

  return (
    <group ref={groupRef}>
      {parts.map((part) => (
        <mesh
          key={part.id}
          geometry={part.geometry}
          material={part.material}
          userData={{ partId: part.id, partName: part.name, partNameRu: part.nameRu }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onPartHover?.(part.id);
          }}
          onPointerOut={() => onPartHover?.(null)}
        />
      ))}
    </group>
  );
}
