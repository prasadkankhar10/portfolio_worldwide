import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData } from '../../data/portfolioData';
import { StationMonuments } from './StationMonuments';

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

const FALLBACK_STATIONS: { id: string; name: string; pos: [number, number, number]; radius: number }[] = [
  // Core & Accreditations
  { id: 'TRIGGER_Harbor_Welcome', name: 'Harbor Pier Welcome', pos: [107.0, 3.5, 125.0], radius: 6.5 },
  { id: 'TRIGGER_Village_About', name: 'Village Square About', pos: [45.0, 3.5, -4.0], radius: 6.0 },
  { id: 'TRIGGER_Hall_Certifications', name: 'Harvard CS50x Hall', pos: [65.0, 3.5, 95.0], radius: 6.5 },
  { id: 'TRIGGER_Arena_Algorithms', name: 'Algorithmic Arena', pos: [18.0, 3.5, -30.0], radius: 6.5 },
  { id: 'TRIGGER_Leadership_Pavilion', name: 'Leadership Pavilion', pos: [38.0, 3.5, 12.0], radius: 6.0 },

  // AI & Autonomous Systems
  { id: 'TRIGGER_Project_ButlerOS', name: 'Butler OS Spire', pos: [-35.0, 45.0, -85.0], radius: 7.0 },
  { id: 'TRIGGER_Project_MaraRAG', name: 'MaraRAG Library', pos: [75.0, 12.0, 20.0], radius: 6.5 },
  { id: 'TRIGGER_Project_Akshayanidhi', name: 'Akshayanidhi Media Archive', pos: [52.0, 6.0, -15.0], radius: 6.0 },
  { id: 'TRIGGER_Project_LifeManager', name: 'Telegram-to-Notion OS', pos: [10.0, 25.0, -60.0], radius: 6.5 },
  { id: 'TRIGGER_Project_Sahaj', name: 'Sahaj Accessibility Shrine', pos: [-15.0, 3.5, 65.0], radius: 6.5 },

  // Low-Level Systems & Game Engines
  { id: 'TRIGGER_Project_OneMoreMove', name: 'One More Move C++17 Keep', pos: [-85.0, 3.5, -25.0], radius: 6.5 },
  { id: 'TRIGGER_Forge_GameDev', name: 'On The Way UE5 Forge', pos: [-100.0, 3.5, -11.5], radius: 6.5 },
  { id: 'TRIGGER_Project_KnightsAdventure', name: 'Knight Adventure Windmill', pos: [-60.0, 18.0, -60.0], radius: 6.5 },

  // Spatial Computing & WebAR
  { id: 'TRIGGER_Project_RealmWebAR', name: 'WebAR Tabletop Beacon', pos: [-35.0, 3.5, 30.0], radius: 6.5 },
  { id: 'TRIGGER_Project_TraceMateAR', name: 'TraceMate Pro Studio', pos: [-75.0, 3.5, 15.0], radius: 6.5 },

  // Full-Stack Web & Cloud Systems
  { id: 'TRIGGER_Project_ExamPlatform', name: 'AI Exam Platform Plinth', pos: [-2.5, 3.5, -4.0], radius: 5.5 },
  { id: 'TRIGGER_Project_Sadhana', name: 'Sadhana Habit PWA Plinth', pos: [0.5, 3.5, -4.0], radius: 5.5 },
  { id: 'TRIGGER_Project_Vyuham', name: 'Vyuham Chrome Ext Plinth', pos: [3.5, 3.5, -4.0], radius: 5.5 },
  { id: 'TRIGGER_Project_Nishtha', name: 'Nishtha Gamified RPG Bazaar', pos: [125.6, 3.0, 7.4], radius: 6.0 },
  { id: 'TRIGGER_Project_CMEDetector', name: 'CME Space Weather Sun Dial', pos: [95.0, 3.5, 110.0], radius: 6.5 },
  { id: 'TRIGGER_Project_SmartCampus', name: 'Smart Campus QR Registry', pos: [115.0, 3.0, 0.0], radius: 6.0 },
  { id: 'TRIGGER_Project_GameStore', name: 'Game Discovery Arcade', pos: [112.3, 3.0, 7.2], radius: 6.0 },
  { id: 'TRIGGER_Project_SchoolWebsite', name: 'Girls School Civic Hall', pos: [103.8, 3.0, -7.5], radius: 6.0 },

  // Landmarks & Finale
  { id: 'TRIGGER_Moonwell_Skills', name: 'Mana Well Skills Grove', pos: [-45.0, 3.5, 32.0], radius: 6.5 },
  { id: 'TRIGGER_Stonehenge_Puzzle', name: 'Stonehenge Rune Puzzle', pos: [35.0, 3.5, 58.0], radius: 7.0 },
  { id: 'TRIGGER_Citadel_Contact', name: 'Citadel Summit Contact', pos: [-15.0, 58.5, -100.0], radius: 8.0 },
];

export const PortfolioTriggerManager: React.FC<PortfolioTriggerManagerProps> = ({ triggerZones }) => {
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setActiveStationPrompt = useGameStore((state) => state.setActiveStationPrompt);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const triggerInteractEvent = useGameStore((state) => state.triggerInteractEvent);

  const activeTriggerRef = useRef<string | null>(null);

  // Compute trigger bounding volumes and center coordinates
  const triggerItems = useMemo<TriggerItem[]>(() => {
    const items: TriggerItem[] = [];
    const addedIds = new Set<string>();

    // 1. From GLTF trigger meshes if available
    for (const mesh of triggerZones) {
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

    // 2. Add fallback station triggers so detection is guaranteed
    for (const fallback of FALLBACK_STATIONS) {
      if (!addedIds.has(fallback.id)) {
        const center = new THREE.Vector3(...fallback.pos);
        const halfR = fallback.radius * 0.8;
        const box = new THREE.Box3(
          new THREE.Vector3(center.x - halfR, center.y - 3, center.z - halfR),
          new THREE.Vector3(center.x + halfR, center.y + 4, center.z + halfR)
        );
        items.push({
          id: fallback.id,
          name: fallback.name,
          box,
          center,
          radius: fallback.radius,
        });
      }
    }

    return items;
  }, [triggerZones]);

  // Check player distance to all 9 station triggers every frame
  useFrame(() => {
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

  return <StationMonuments />;
};
