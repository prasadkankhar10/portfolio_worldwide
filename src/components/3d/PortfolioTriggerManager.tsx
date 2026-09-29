import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData } from '../../data/portfolioData';

interface TriggerItem {
  id: string;
  name: string;
  box: THREE.Box3;
  center: THREE.Vector3;
  radius: number;
}

interface PortfolioTriggerManagerProps {
  triggerZones: THREE.Mesh[];
}

export const PortfolioTriggerManager: React.FC<PortfolioTriggerManagerProps> = ({ triggerZones }) => {
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setActiveStationPrompt = useGameStore((state) => state.setActiveStationPrompt);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const triggerInteractEvent = useGameStore((state) => state.triggerInteractEvent);

  const activeTriggerRef = useRef<string | null>(null);

  // Compute trigger bounding volumes and center coordinates
  const triggerItems = useMemo<TriggerItem[]>(() => {
    return triggerZones.map((mesh) => {
      mesh.geometry.computeBoundingBox();
      const box = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      // Generous interaction radius so player doesn't have to be pixel-perfect
      const radius = Math.max(size.x * 0.7, size.z * 0.7, 4.0);

      return {
        id: mesh.name,
        name: mesh.name,
        box,
        center,
        radius,
      };
    });
  }, [triggerZones]);

  // Check player distance to all 9 station triggers every frame
  useFrame(() => {
    const playerPos = globalPlayerState.position;
    if (!playerPos || triggerItems.length === 0) return;

    let nearestTrigger: TriggerItem | null = null;
    let minDistance = Infinity;

    for (const item of triggerItems) {
      // Fast 2D/3D distance check from center
      const dist = playerPos.distanceTo(item.center);
      const isInsideBox = item.box.containsPoint(playerPos);

      if ((dist < item.radius || isInsideBox) && dist < minDistance) {
        minDistance = dist;
        nearestTrigger = item;
      }
    }

    if (nearestTrigger) {
      if (activeTriggerRef.current !== nearestTrigger.id) {
        activeTriggerRef.current = nearestTrigger.id;
        setActiveStationId(nearestTrigger.id);
        const data = portfolioData[nearestTrigger.id];
        if (data) {
          setActiveStationPrompt(`[E] Inspect ${data.title}`);
        }
      }
    } else if (activeTriggerRef.current) {
      activeTriggerRef.current = null;
      setActiveStationId(null);
      setActiveStationPrompt(null);
    }
  });

  // Handle Desktop [E] key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'e') {
        const currentStation = useGameStore.getState().activeStationId;
        if (currentStation) {
          e.preventDefault();
          setStationModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setStationModalOpen]);

  // Handle Mobile on-screen action tap
  useEffect(() => {
    if (triggerInteractEvent > 0) {
      const currentStation = useGameStore.getState().activeStationId;
      if (currentStation) {
        setStationModalOpen(true);
      }
    }
  }, [triggerInteractEvent, setStationModalOpen]);

  return null;
};
