'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface TokenPart {
  id: string;
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
      metalness: 0.85,
      roughness: 0.2,
    });

    const innerFrameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#45A29E'),
      metalness: 0.4,
      roughness: 0.35,
      transparent: true,
      opacity: 0.85,
    });

    const pcbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0B3D3D'),
      metalness: 0.1,
      roughness: 0.6,
    });

    const chipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B8860B'),
      metalness: 0.9,
      roughness: 0.25,
    });

    const bioMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0B0C10'),
      metalness: 0.3,
      roughness: 0.4,
    });

    const bioRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#66FCF1'),
      emissive: new THREE.Color('#45A29E'),
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.2,
    });

    const usbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C5C6C7'),
      metalness: 0.95,
      roughness: 0.15,
    });

    return [
      {
        id: 'shell',
        name: 'Hardened Shell',
        nameRu: 'Бронированный корпус',
        geometry: new THREE.CapsuleGeometry(0.62, 2.6, 8, 32),
        material: shellMat,
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, 1.4, -0.6),
        explodedRotation: new THREE.Euler(0.15, 0, 0),
      },
      {
        id: 'frame',
        name: 'Resin Inner Frame',
        nameRu: 'Внутренний каркас',
        geometry: new THREE.CapsuleGeometry(0.52, 2.45, 8, 32),
        material: innerFrameMat,
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, -0.2, 0.2),
        explodedRotation: new THREE.Euler(0, 0, 0),
      },
      {
        id: 'pcb',
        name: 'PCB',
        nameRu: 'Печатная плата',
        geometry: new THREE.BoxGeometry(0.7, 2.2, 0.08),
        material: pcbMat,
        basePosition: new THREE.Vector3(0, -0.05, 0),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, -0.9, 0.9),
        explodedRotation: new THREE.Euler(0.25, 0, 0),
      },
      {
        id: 'chip',
        name: 'Secure Element',
        nameRu: 'Защищённый элемент',
        geometry: new THREE.BoxGeometry(0.35, 0.35, 0.06),
        material: chipMat,
        basePosition: new THREE.Vector3(0, 0.2, 0.08),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, 0.2, 1.2),
        explodedRotation: new THREE.Euler(0, 0, 0),
      },
      {
        id: 'biometric',
        name: 'Biometric Sensor',
        nameRu: 'Биометрический сенсор',
        geometry: new THREE.CylinderGeometry(0.14, 0.14, 0.04, 32),
        material: bioMat,
        basePosition: new THREE.Vector3(0, 0.85, 0.5),
        baseRotation: new THREE.Euler(Math.PI / 2, 0, 0),
        explodedPosition: new THREE.Vector3(0, 1.6, 1.6),
        explodedRotation: new THREE.Euler(Math.PI / 2, 0, 0),
      },
      {
        id: 'bio-ring',
        name: 'Sensor Ring',
        nameRu: 'Кольцо сенсора',
        geometry: new THREE.TorusGeometry(0.18, 0.02, 16, 64),
        material: bioRingMat,
        basePosition: new THREE.Vector3(0, 0.85, 0.52),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, 1.8, 1.75),
        explodedRotation: new THREE.Euler(0, 0, 0),
      },
      {
        id: 'usb',
        name: 'USB-C Connector',
        nameRu: 'Коннектор USB-C',
        geometry: new THREE.BoxGeometry(0.75, 0.32, 0.22),
        material: usbMat,
        basePosition: new THREE.Vector3(0, -1.55, 0),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodedPosition: new THREE.Vector3(0, -2.2, -0.8),
        explodedRotation: new THREE.Euler(0, 0, 0),
      },
    ];
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (autoRotate) {
      groupRef.current.rotation.y += delta * 0.25;
    }

    if (mouse) {
      targetRotation.current.x += (mouse.y * 0.25 - targetRotation.current.x) * 0.05;
      targetRotation.current.y += (mouse.x * 0.25 - targetRotation.current.y) * 0.05;
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
        part.material.emissive.lerp(targetEmissive, 0.15);
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
