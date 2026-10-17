import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData } from '../../data/portfolioData';
import { StationMonuments, STATION_MONUMENT_DEFS } from './StationMonuments';
import { soundEngine } from '../../utils/soundEngine';

interface TriggerItem {
  id: string;
  name: string;
  box: THREE.Box3;
  center: THREE.Vector3;
  radius: number;
}

interface PortfolioTriggerManagerProps {
  triggerZones?: THREE.Mesh[];
}

export const PortfolioTriggerManager: React.FC<PortfolioTriggerManagerProps> = ({ triggerZones = [] }) => {
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setActiveStationPrompt = useGameStore((state) => state.setActiveStationPrompt);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const triggerInteractEvent = useGameStore((state) => state.triggerInteractEvent);

  const activeTriggerRef = useRef<string | null>(null);

  // Compute trigger bounding volumes and center coordinates
  const triggerItems = useMemo<TriggerItem[]>(() => {
    const items: TriggerItem[] = [];
    const addedIds = new Set<string>();

    // 1. Authoritative stations from STATION_MONUMENT_DEFS (100% synchronized with 3D pedestals)
    for (const station of STATION_MONUMENT_DEFS) {
      const center = new THREE.Vector3(...station.pos);
      const radius = 6.5;
      const halfR = radius * 0.8;
      const box = new THREE.Box3(
        new THREE.Vector3(center.x - halfR, center.y - 3, center.z - halfR),
        new THREE.Vector3(center.x + halfR, center.y + 4, center.z + halfR)
      );
      items.push({
        id: station.id,
        name: station.name,
        box,
        center,
        radius,
      });
      addedIds.add(station.id);
    }

    // 2. Add any supplementary GLTF trigger zones not in STATION_MONUMENT_DEFS
    if (triggerZones && triggerZones.length > 0) {
      for (const mesh of triggerZones) {
        if (!addedIds.has(mesh.name)) {
          mesh.geometry.computeBoundingBox();
          const box = mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld);
          const center = new THREE.Vector3();
          box.getCenter(center);
          const size = new THREE.Vector3();
          box.getSize(size);
          const radius = Math.max(size.x * 0.7, size.z * 0.7, 5.0);

          items.push({
            id: mesh.name,
            name: mesh.name,
            box,
            center,
            radius,
          });
          addedIds.add(mesh.name);
        }
      }
    }

    return items;
  }, [triggerZones]);

  const triggerCheckFrame = useRef(0);

  // Check player distance to station triggers (throttled to 15 times/sec for max performance)
  useFrame(() => {
    triggerCheckFrame.current++;
    if (triggerCheckFrame.current % 4 !== 0) return;

    const playerPos = globalPlayerState.position;
    if (!playerPos || triggerItems.length === 0) return;

    let nearestTrigger: TriggerItem | null = null;
    let minDistance = Infinity;

    for (const item of triggerItems) {
      // 2D horizontal distance check + vertical tolerance
      const dX = playerPos.x - item.center.x;
      const dZ = playerPos.z - item.center.z;
      const dY = Math.abs(playerPos.y - item.center.y);
      const horizDist = Math.sqrt(dX * dX + dZ * dZ);
      const isInsideBox = item.box.containsPoint(playerPos);

      if ((horizDist < item.radius && dY < 5.0) || isInsideBox) {
        if (horizDist < minDistance) {
          minDistance = horizDist;
          nearestTrigger = item;
        }
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

        // Mark station in exploration progress and trigger soft audio chime
        const store = useGameStore.getState();
        const wasVisited = store.visitedStationIds.includes(nearestTrigger.id);
        store.markStationVisited(nearestTrigger.id);
        if (!wasVisited) {
          soundEngine.playStationDiscoverSound();
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
        const store = useGameStore.getState();
        const currentStation = store.activeStationId;
        if (currentStation && !store.isStationModalOpen) {
          e.preventDefault();
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
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

  return <StationMonuments triggerZones={triggerZones} />;
};
