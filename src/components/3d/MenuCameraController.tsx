import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/**
 * MenuCameraController:
 * Provides a stunning high-elevation cinematic camera orbit over the entire 3D island
 * while the visitor is on the landing menu.
 * Includes natural mouse/touch parallax so visitors immediately recognize this is an active 3D world.
 */
export const MenuCameraController: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const isGuidedTourActive = useGameStore((state) => state.isGuidedTourActive);
  const { camera } = useThree();

  const currentLookAt = useRef(new THREE.Vector3(0, 10, 0));
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (gameState !== 'menu' || isGuidedTourActive) return;

    const t = state.clock.getElapsedTime();
    const pointer = state.pointer; // Mouse normalized coordinates [-1, 1]

    // Slow majestic orbit around the archipelago with real-time mouse parallax
    const orbitAngle = t * 0.045 + (pointer.x * 0.25);
    const orbitRadius = 165;

    const targetX = Math.sin(orbitAngle) * orbitRadius;
    const targetZ = Math.cos(orbitAngle) * orbitRadius;
    const targetY = 48 + Math.sin(t * 0.1) * 3 + (pointer.y * 12);

    targetCamPos.current.set(targetX, targetY, targetZ);
    targetLookAt.current.set(0, 8 - (pointer.y * 6), 0);

    // Smooth cinematic camera motion
    camera.position.lerp(targetCamPos.current, Math.min(1, 2.6 * delta));
    currentLookAt.current.lerp(targetLookAt.current, Math.min(1, 3.5 * delta));
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
