import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';

interface BuildingTriggerProps {
  position: [number, number, number];
  radius?: number;
  dialogId: string;
}

export function BuildingTrigger({ position, radius = 8, dialogId }: BuildingTriggerProps) {
  const triggerPos = new THREE.Vector3(...position);
  const hasTriggered = useRef(false);

  useFrame((state) => {
    const playerPos = state.camera.position;
    const dist = playerPos.distanceTo(triggerPos);

    if (dist < radius) {
      if (!hasTriggered.current) {
        hasTriggered.current = true;
        // Don't trigger if already in a dialog
        if (!useGameStore.getState().activeDialogId) {
          useGameStore.getState().setActiveDialog(dialogId, "system");
        }
      }
    } else {
      if (hasTriggered.current) {
        hasTriggered.current = false;
      }
    }
  });

  return (
    <group position={position}>
      {/* Subtle indicator ring on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <ringGeometry args={[radius - 0.5, radius, 32]} />
        <meshBasicMaterial color="#4ade80" opacity={0.2} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
