import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { DynamicLamps } from './DynamicLamps';
import { InstancedTrees } from './InstancedTrees';
import { useControls } from 'leva';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';
import { SceneOptimizer } from '../../utils/SceneOptimizer';
import { PortfolioTriggerManager } from './PortfolioTriggerManager';
import { ShipFleetController } from './ShipFleetController';

const STATIC_LAMP_POSITIONS: [number, number, number][] = [
  [-54.45, 6.3, 49], [-79.5, 6.3, -1.47], [-49.39, 6.3, -12.37], [-46.43, 6.3, -23.69], [-63.25, 6.3, -80.27],
  [14.43, 6.27, 12.88], [20.6, 6.27, 21.29], [12.77, 6.21, -14.66], [-15.06, 6.3, -12.71], [-1.79, 6.3, -15.19],
  [15.97, 6.3, -1.6], [-15.75, 6.3, 2.16], [-11.43, 6.3, 14.85], [-0.52, 6.3, -10.5], [27.29, 6.28, 1.98],
  [37.54, 6.28, 1.98], [15.92, 6.28, 1.98], [10.85, 6.29, 14.55], [-41.25, 6.3, -36.71], [34.76, 6.3, -44.4],
  [1.69, 6.3, -72.1], [-30.8, 6.3, -56.04], [-18.14, 6.3, -57.15], [-8.34, 6.3, -57.18], [11.96, 6.3, -57.65],
  [25.45, 6.3, -54.51], [90.26, 6.29, 110.44], [86.06, 6.27, 111.58], [79.89, 6.27, 103.18], [50.46, 6.27, 44.11],
  [57.88, 6.28, 41.62], [59.97, 6.28, 31.56], [59.97, 6.28, 20.63], [61.46, 6.28, 7.17], [69.57, 6.28, 2.16],
  [79.82, 6.28, 2.16], [90.18, 6.28, 2.16], [100.46, 6.28, 2.16], [47.9, 6.28, 1.98], [58.18, 6.28, 1.98],
  [54.77, 6.3, -38.03], [67.32, 6.3, -35.61], [67.96, 6.3, -23.47], [68.29, 6.3, -8.66], [79.6, 6.3, -77.47],
  [73.48, 6.21, -65.16]
];

const STATIC_FARM_PLOTS: [number, number, number][] = [
  [93.73, 3.02, 67.1], [94.44, 3.02, 81.27], [89.76, 3.1, 53.58],
  [107.02, 3.02, 52.3], [107.02, 3.02, 67.1], [107.02, 3.02, 81.27]
];

const STATIC_DEPOSIT_PLOTS: [number, number, number][] = [
  [77.43, 2.99, 73.71], [77.43, 2.99, 73.71], [77.43, 2.99, 73.71],
  [77.43, 2.99, 73.71], [77.43, 2.99, 73.71], [72.88, 10.45, 51.44]
];

const lampPresets: Record<string, { color: string; intensity: number }> = {
  'Warm Vintage': { color: '#ffaa00', intensity: 2.5 },
  'Neon Cyberpunk': { color: '#00ffff', intensity: 4.0 },
  'Ghostly Blue': { color: '#88aaff', intensity: 2.0 },
  'Magical Purple': { color: '#d58be8', intensity: 3.5 },
  'Vampire Red': { color: '#ff0000', intensity: 5.0 },
  'Emerald Magic': { color: '#00ff88', intensity: 3.0 },
  'Pure White': { color: '#ffffff', intensity: 3.0 }
};

// 3.G Stonehenge Sanctuary Megaliths & Riddle Definitions
export const STONEHENGE_ALTAR_POS = new THREE.Vector3(35.0, 3.0, 62.0);

export interface StonehengePillarDef {
  id: number;
  name: string;
  color: string;
  hex: number;
  pos: THREE.Vector3;
}

export const STONEHENGE_PILLARS: StonehengePillarDef[] = [
  { id: 1, name: 'Sun', color: '#ffb300', hex: 0xffb300, pos: new THREE.Vector3(39.2, 3.0, 62.0) },
  { id: 2, name: 'Moon', color: '#80deea', hex: 0x80deea, pos: new THREE.Vector3(37.1, 3.0, 58.36) },
  { id: 3, name: 'Fire', color: '#ff3d00', hex: 0xff3d00, pos: new THREE.Vector3(32.9, 3.0, 58.36) },
  { id: 4, name: 'Water', color: '#00b0ff', hex: 0x00b0ff, pos: new THREE.Vector3(30.8, 3.0, 62.0) },
  { id: 5, name: 'Earth', color: '#00e676', hex: 0x00e676, pos: new THREE.Vector3(32.9, 3.0, 65.64) },
  { id: 6, name: 'Air', color: '#1de9b6', hex: 0x1de9b6, pos: new THREE.Vector3(37.1, 3.0, 65.64) },
];

export const STONEHENGE_SOLUTION = [1, 5, 4, 3, 6, 2];


// 90 Optimized low-poly physics collision proxies
const invisibleColliderMaterial = new THREE.MeshBasicMaterial({ visible: false });

const CollisionWorld: React.FC = () => {
  const { scene } = useGLTF('./models/threejs_game_assets/base/collision.glb');
  const { colliderScene, triggerZones } = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.updateMatrixWorld(true);
    const triggers: THREE.Mesh[] = [];
    const toRemove: THREE.Object3D[] = [];

    c.traverse((child: any) => {
      // Disable raw uncalibrated KHR punctual lights from GLB
      if (child.isLight) {
        child.visible = false;
        child.intensity = 0;
      }

      if (child.isMesh) {
        if (child.name.startsWith('TRIGGER_')) {
          // Proximity volume for portfolio exhibits
          triggers.push(child);
          toRemove.push(child);
        } else {
          // Physical obstacle (COL_...) - physics uses trimesh, keep mesh completely invisible
          child.visible = false;
          child.material = invisibleColliderMaterial;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      }
    });

    // Remove trigger volumes from the physical collider scene so player can walk freely inside them
    toRemove.forEach((t) => {
      if (t.parent) t.parent.remove(t);
    });

    return { colliderScene: c, triggerZones: triggers };
  }, [scene]);

  return (
    <>
      <RigidBody type="fixed" colliders="trimesh" includeInvisible={true}>
        <primitive object={colliderScene} />
      </RigidBody>
      <PortfolioTriggerManager triggerZones={triggerZones} />
    </>
  );
};

interface UnifiedWorldProps {
  lampColor: string;
  lampIntensity: number;
  fanSpeed: number;
  magicSpeed: number;
  crystalGlow: number;
  beaconIntensity: number;
  courtyardIntensity: number;
  waystoneIntensity: number;
  portalIntensity: number;
  moonwellIntensity: number;
}

const UnifiedWorld: React.FC<UnifiedWorldProps> = ({
  lampColor,
  lampIntensity,
  fanSpeed,
  magicSpeed,
  crystalGlow,
  beaconIntensity,
  courtyardIntensity,
  waystoneIntensity,
  portalIntensity,
  moonwellIntensity
}) => {
  const { scene } = useGLTF('./models/threejs_game_assets/island_world_complete.glb');

  // Animation targets cached directly on scene mount
  const targets = useRef<Record<string, THREE.Object3D>>({});
  const domeMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const orreryCrystalMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Stonehenge Sanctuary references
  const stonehengeRuneGemsRef = useRef<Record<number, THREE.Mesh>>({});
  const stonehengeRelicCrystalRef = useRef<THREE.Mesh | null>(null);
  const stonehengeLightRef = useRef<THREE.PointLight | null>(null);
  const stonehengeSolved = useGameStore((state) => state.stonehengeSolved);
  const stonehengeStep = useGameStore((state) => state.stonehengeStep);

  // Point Light References
  const summitLightRef = useRef<THREE.PointLight | null>(null);
  const courtyardLightRef = useRef<THREE.PointLight | null>(null);
  const wayCrossLightRef = useRef<THREE.PointLight | null>(null);
  const wayDocksLightRef = useRef<THREE.PointLight | null>(null);
  const portalLightRef = useRef<THREE.PointLight | null>(null);
  const moonwellLightRef = useRef<THREE.PointLight | null>(null);
  const shipFleetRef = useRef<ShipFleetController | null>(null);

  // One-time initialization of scene hierarchy, lights & emissives
  useEffect(() => {
    if (!scene) return;

    // Reset targets
    targets.current = {};

    scene.traverse((child: any) => {
      // 1. Disable raw uncalibrated KHR punctual lights from GLB
      if (child.isLight) {
        child.visible = false;
        child.intensity = 0;
      }

      const origName = child.name || '';
      const name = origName.toLowerCase();
      const matName = (child.material?.name || '').toLowerCase();

      if (child.isMesh) {
        // ALWAYS hide any collision proxies, trigger zones, or green debug hulls in visual world
        if (
          origName.startsWith('COL_') ||
          origName.startsWith('TRIGGER_') ||
          name.startsWith('col_') ||
          name.startsWith('trigger_') ||
          matName.includes('collider')
        ) {
          child.visible = false;
          child.castShadow = false;
          child.receiveShadow = false;
          return;
        }

        child.castShadow = false;
        child.receiveShadow = true;

        if (child.material && child.material.map) {
          child.material.map.colorSpace = THREE.SRGBColorSpace;
        }

        // Street lamps emissive
        if (matName.includes('lamp_material') || matName.includes('lamp')) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(lampColor);
          child.material.emissiveIntensity = lampIntensity;
        }
        // Glowing windows
        if (matName.includes('window')) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color('#ffcc88');
          child.material.emissiveIntensity = 2.0;
        }
      }

      // Match all 16 magical objects
      if (name.includes('orrery_ring_outer')) {
        targets.current['orrery_ring_outer'] = child;
      } else if (name.includes('orrery_ring_mid')) {
        targets.current['orrery_ring_mid'] = child;
      } else if (name.includes('orrery_ring_inner')) {
        targets.current['orrery_ring_inner'] = child;
      } else if (name.includes('orrery_core_crystal')) {
        targets.current['orrery_core_crystal'] = child;
        child.position.set(0, 0, 0); // Center inside parent Orrery_Assembly
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x00d4ff);
          child.material.emissiveIntensity = crystalGlow;
          orreryCrystalMaterialRef.current = child.material;
        }
      } else if (name.includes('orrery_floating_runes')) {
        targets.current['orrery_floating_runes'] = child;
      } else if (name.includes('observatory_runestones')) {
        targets.current['observatory_runestones'] = child;
      } else if (name.includes('arcane_waystone_crossroads_crystal')) {
        targets.current['arcane_waystone_crossroads_crystal'] = child;
        child.position.set(0, 1.85, 0);
      } else if (name.includes('arcane_waystone_crossroads_runes')) {
        targets.current['arcane_waystone_crossroads_runes'] = child;
        child.position.set(0, 1.85, 0);
      } else if (name.includes('arcane_waystone_docks_crystal')) {
        targets.current['arcane_waystone_docks_crystal'] = child;
        child.position.set(0, 1.85, 0);
      } else if (name.includes('arcane_waystone_docks_runes')) {
        targets.current['arcane_waystone_docks_runes'] = child;
        child.position.set(0, 1.85, 0);
      } else if (name.includes('citadel_arcane_portal_vortex_disc')) {
        targets.current['citadel_arcane_portal_vortex_disc'] = child;
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x9d4edd);
          child.material.emissiveIntensity = 2.0;
        }
      } else if (name.includes('citadel_arcane_portal_floating_keystones')) {
        targets.current['citadel_arcane_portal_floating_keystones'] = child;
      } else if (name.includes('enchanted_moonwell_grove_floating_orbs')) {
        targets.current['enchanted_moonwell_grove_floating_orbs'] = child;
        child.position.set(0, 0.52, 0);
      } else if (name.includes('citadel_arcane_ward_shield_runering1')) {
        targets.current['citadel_arcane_ward_shield_runering1'] = child;
      } else if (name.includes('citadel_arcane_ward_shield_runering2')) {
        targets.current['citadel_arcane_ward_shield_runering2'] = child;
      } else if (name.includes('citadel_arcane_ward_shield_dome')) {
        targets.current['citadel_arcane_ward_shield_dome'] = child;
        if (child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.35;
          child.material.emissive = new THREE.Color(0x00d4ff);
          child.material.emissiveIntensity = 0.25;
          domeMaterialRef.current = child.material;
        }
      }

      // Stonehenge Sanctuary Megaliths, Child Rune Gems & Relic Crystal
      for (let i = 1; i <= 6; i++) {
        if (name.includes(`magic_megalith_${i}`) || name === `megalith_${i}`) {
          targets.current[`magic_megalith_${i}`] = child;
        }
        if (name.includes(`megalith_rune_${i}`) || (name.includes('rune_') && name.includes(String(i)))) {
          if (child.isMesh) {
            stonehengeRuneGemsRef.current[i] = child;
            const def = STONEHENGE_PILLARS.find((p) => p.id === i);
            child.material = child.material ? child.material.clone() : new THREE.MeshStandardMaterial();
            child.material.color = new THREE.Color(def ? def.hex : 0xffffff);
            child.material.emissive = new THREE.Color(def ? def.hex : 0xffffff);
            child.material.emissiveIntensity = 0.6;
          }
        }
      }

      if (name.includes('stonehenge_altar_relic_crystal')) {
        targets.current['stonehenge_altar_relic_crystal'] = child;
        stonehengeRelicCrystalRef.current = child;
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.color = new THREE.Color(0xa7f3d0);
          child.material.emissive = new THREE.Color(0x00e5ff);
          child.material.emissiveIntensity = 0.8;
        }
      }

      // Windmill fan in Farmland (internal node Mill-wind from unchunked island model)
      if (name.includes('mill-wind') || name.includes('wind_fan') || name === 'mill_wind') {
        targets.current['wind_fan'] = child;
      }
    });

    // Run SceneOptimizer: automatic instancing of repeated props + static matrix freeze
    SceneOptimizer.optimize(scene);

    // Ensure matrixAutoUpdate is true on every animated target
    Object.values(targets.current).forEach((node) => {
      node.matrixAutoUpdate = true;
    });

    // Initialize Ship Fleet Controller (moving Galleons + moored pier vessels)
    shipFleetRef.current = new ShipFleetController(scene);

    return () => {
      shipFleetRef.current?.destroy();
    };
  }, [scene, lampColor, lampIntensity]);

  // Update crystal emissive glow when slider changes
  useEffect(() => {
    if (orreryCrystalMaterialRef.current) {
      orreryCrystalMaterialRef.current.emissiveIntensity = crystalGlow;
    }
  }, [crystalGlow]);

  // Celestial Magic Animation Loop
  const animClockRef = useRef(0);

  useFrame((state, delta) => {
    const fDelta = delta * (fanSpeed || 1.8);
    const mDelta = delta * (magicSpeed || 1.0);
    animClockRef.current += mDelta;
    const time = animClockRef.current;
    const t = targets.current;

    // 1. Windmill Fan (Farmland)
    if (t['wind_fan']) {
      t['wind_fan'].rotation.z += 1.80 * fDelta;
    }

    // 2. Citadel Grand Orrery (Summit, Y ≈ 57.5m)
    if (t['orrery_ring_outer']) {
      t['orrery_ring_outer'].rotation.z += 0.35 * mDelta;
      t['orrery_ring_outer'].rotation.y += 0.20 * mDelta;
    }
    if (t['orrery_ring_mid']) {
      t['orrery_ring_mid'].rotation.x += 0.55 * mDelta;
    }
    if (t['orrery_ring_inner']) {
      t['orrery_ring_inner'].rotation.y += 0.85 * mDelta;
      t['orrery_ring_inner'].rotation.z += 0.40 * mDelta;
    }
    if (t['orrery_floating_runes']) {
      t['orrery_floating_runes'].rotation.y -= 0.30 * mDelta;
      t['orrery_floating_runes'].rotation.z -= 0.20 * mDelta;
    }
    if (t['orrery_core_crystal']) {
      t['orrery_core_crystal'].rotation.y += 0.60 * mDelta;
      t['orrery_core_crystal'].rotation.z += 0.40 * mDelta;
      t['orrery_core_crystal'].position.y = Math.sin(time * 2.0) * 0.15;
    }

    // 3. Ground Observatory Sanctum
    if (t['observatory_runestones']) {
      t['observatory_runestones'].rotation.y += 0.45 * mDelta;
      t['observatory_runestones'].position.y = Math.sin(time * 1.8) * 0.08;
    }

    // 4. Arcane Waystones (Village Crossroads & Harbor Docks)
    // Crossroads:
    if (t['arcane_waystone_crossroads_crystal']) {
      t['arcane_waystone_crossroads_crystal'].rotation.y += 0.80 * mDelta;
      t['arcane_waystone_crossroads_crystal'].position.y = 1.85 + Math.sin(time * 2.2) * 0.12;
    }
    if (t['arcane_waystone_crossroads_runes']) {
      t['arcane_waystone_crossroads_runes'].rotation.y -= 0.50 * mDelta;
      t['arcane_waystone_crossroads_runes'].position.y = 1.85 + Math.sin(time * 2.2 + 0.6) * 0.05;
    }
    // Docks:
    if (t['arcane_waystone_docks_crystal']) {
      t['arcane_waystone_docks_crystal'].rotation.y += 0.80 * mDelta;
      t['arcane_waystone_docks_crystal'].position.y = 1.85 + Math.sin(time * 2.2 + 1.2) * 0.12;
    }
    if (t['arcane_waystone_docks_runes']) {
      t['arcane_waystone_docks_runes'].rotation.y -= 0.50 * mDelta;
      t['arcane_waystone_docks_runes'].position.y = 1.85 + Math.sin(time * 2.2 + 1.8) * 0.05;
    }

    // 5. Citadel Arcane Portal Gateway
    if (t['citadel_arcane_portal_vortex_disc']) {
      t['citadel_arcane_portal_vortex_disc'].rotation.z += 1.20 * mDelta;
    }
    if (t['citadel_arcane_portal_floating_keystones']) {
      t['citadel_arcane_portal_floating_keystones'].position.y = Math.sin(time * 1.6) * 0.08;
      t['citadel_arcane_portal_floating_keystones'].rotation.y -= 0.20 * mDelta;
    }

    // 6. Bioluminescent Enchanted Moonwell
    if (t['enchanted_moonwell_grove_floating_orbs']) {
      t['enchanted_moonwell_grove_floating_orbs'].rotation.y += 0.40 * mDelta;
      t['enchanted_moonwell_grove_floating_orbs'].position.y = 0.52 + Math.sin(time * 1.8) * 0.08;
    }

    // 7. Citadel Arcane Ward Shield (Summit)
    if (t['citadel_arcane_ward_shield_runering1']) {
      t['citadel_arcane_ward_shield_runering1'].rotation.y += 0.25 * mDelta;
    }
    if (t['citadel_arcane_ward_shield_runering2']) {
      t['citadel_arcane_ward_shield_runering2'].rotation.y -= 0.35 * mDelta;
    }
    if (domeMaterialRef.current) {
      domeMaterialRef.current.opacity = 0.30 + Math.sin(time * 2.5) * 0.08;
    }

    // 8. Stonehenge Ancient Sanctuary Relic Crystal & Resonating Runes
    const relic = stonehengeRelicCrystalRef.current;
    if (relic) {
      if (stonehengeSolved) {
        relic.rotation.y += 2.8 * mDelta;
        relic.rotation.z += 1.2 * mDelta;
        relic.position.y = 5.25 + Math.sin(time * 3.5) * 0.12;
        if (relic.material) {
          (relic.material as THREE.MeshStandardMaterial).emissiveIntensity = 4.5 + Math.sin(time * 4.0) * 0.8;
        }
      } else {
        relic.rotation.y += 0.6 * mDelta;
        relic.position.y = 4.45 + Math.sin(time * 1.8) * 0.06;
        if (relic.material) {
          (relic.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(time * 2.0) * 0.2;
        }
      }
    }

    const activePillars = stonehengeSolved
      ? [1, 2, 3, 4, 5, 6]
      : STONEHENGE_SOLUTION.slice(0, stonehengeStep);

    for (let i = 1; i <= 6; i++) {
      const gem = stonehengeRuneGemsRef.current[i];
      if (gem && gem.material) {
        const mat = gem.material as THREE.MeshStandardMaterial;
        if (stonehengeSolved) {
          mat.emissiveIntensity = 4.2 + Math.sin(time * 3.0 + i) * 0.8;
        } else if (activePillars.includes(i)) {
          mat.emissiveIntensity = 3.8 + Math.sin(time * 2.5 + i) * 0.4;
        } else {
          mat.emissiveIntensity = 0.6 + Math.sin(time * 1.5 + i) * 0.2;
        }
      }
    }

    if (stonehengeLightRef.current) {
      const baseStonehenge = stonehengeSolved ? 4.5 : 2.0;
      stonehengeLightRef.current.intensity =
        baseStonehenge + Math.sin(time * 2.2) * (baseStonehenge * 0.2);
    }

    // 9. Dynamic Atmospheric PointLights with breathing pulse animations
    if (summitLightRef.current) {
      summitLightRef.current.intensity =
        beaconIntensity + Math.sin(time * 2.2) * (beaconIntensity * 0.25);
    }
    if (courtyardLightRef.current) {
      courtyardLightRef.current.intensity =
        courtyardIntensity + Math.sin(time * 1.6) * (courtyardIntensity * 0.25);
    }
    if (wayCrossLightRef.current) {
      wayCrossLightRef.current.intensity =
        waystoneIntensity + Math.sin(time * 2.0) * (waystoneIntensity * 0.20);
    }
    if (wayDocksLightRef.current) {
      wayDocksLightRef.current.intensity =
        waystoneIntensity + Math.sin(time * 2.0 + 1.2) * (waystoneIntensity * 0.20);
    }
    if (portalLightRef.current) {
      portalLightRef.current.intensity =
        portalIntensity + Math.sin(time * 2.6) * (portalIntensity * 0.25);
    }
    if (moonwellLightRef.current) {
      moonwellLightRef.current.intensity =
        moonwellIntensity + Math.sin(time * 1.8) * (moonwellIntensity * 0.25);
    }

    // 10. Traveling Ship (Galleon) along island coastline + moored pier vessels
    if (shipFleetRef.current) {
      shipFleetRef.current.update(delta, state.clock.elapsedTime);
    }
  });

  return (
    <group name="Visual_Island_World">
      <primitive object={scene} />

      {/* 1. Summit Arcane Beacon */}
      <pointLight
        ref={summitLightRef}
        position={[-0.23, 57.50, -108.77]}
        color="#00e5ff"
        intensity={beaconIntensity}
        distance={35.0}
        decay={1.2}
      />

      {/* 2. Observatory Courtyard Light */}
      <pointLight
        ref={courtyardLightRef}
        position={[-0.20, 4.50, -96.50]}
        color="#ffd54f"
        intensity={courtyardIntensity}
        distance={18.0}
        decay={1.5}
      />

      {/* 3. Arcane Waystone - Crossroads */}
      <pointLight
        ref={wayCrossLightRef}
        position={[8.0, 5.0, 17.75]}
        color="#00e5ff"
        intensity={waystoneIntensity}
        distance={16.0}
        decay={1.3}
      />

      {/* 4. Arcane Waystone - Harbor Docks */}
      <pointLight
        ref={wayDocksLightRef}
        position={[102.0, 5.0, 125.0]}
        color="#00e5ff"
        intensity={waystoneIntensity}
        distance={16.0}
        decay={1.3}
      />

      {/* 5. Citadel Arcane Portal Gateway */}
      <pointLight
        ref={portalLightRef}
        position={[-15.0, 5.5, -105.0]}
        color="#9d4edd"
        intensity={portalIntensity}
        distance={22.0}
        decay={1.4}
      />

      {/* 6. Enchanted Moonwell */}
      <pointLight
        ref={moonwellLightRef}
        position={[-50.0, 4.8, 35.0]}
        color="#00e5ff"
        intensity={moonwellIntensity}
        distance={18.0}
        decay={1.3}
      />

      {/* 7. Stonehenge Ancient Sanctuary Altar PointLight */}
      <pointLight
        ref={stonehengeLightRef}
        position={[35.0, 5.0, 62.0]}
        color={stonehengeSolved ? '#ffd54f' : '#00e5ff'}
        intensity={stonehengeSolved ? 4.5 : 2.0}
        distance={22.0}
        decay={1.3}
      />
    </group>
  );
};


const WAYSTONE_CROSSROADS_POS = new THREE.Vector3(8.0, 3.5, 10.0);
const WAYSTONE_CROSSROADS_POS2 = new THREE.Vector3(8.0, 3.5, 17.75);
const WAYSTONE_DOCKS_POS = new THREE.Vector3(102.0, 3.5, 125.0);
const CITADEL_PORTAL_POS = new THREE.Vector3(-15.0, 3.5, -105.0);
const WATCHTOWER_SUMMIT_POS = new THREE.Vector3(-0.23, 58.0, -108.77);
const ENCHANTED_MOONWELL_POS = new THREE.Vector3(-50.0, 3.5, 35.0);

const InteractiveMagicLocations: React.FC = () => {
  const setMagicPrompt = useGameStore((state) => state.setMagicPrompt);
  const teleportPlayer = useGameStore((state) => state.teleportPlayer);
  const setActiveDialog = useGameStore((state) => state.setActiveDialog);
  const triggerInteractEvent = useGameStore((state) => state.triggerInteractEvent);

  const stonehengeSolved = useGameStore((state) => state.stonehengeSolved);
  const setStonehengeSolved = useGameStore((state) => state.setStonehengeSolved);
  const stonehengeStep = useGameStore((state) => state.stonehengeStep);
  const setStonehengeStep = useGameStore((state) => state.setStonehengeStep);
  const setStonehengeBanner = useGameStore((state) => state.setStonehengeBanner);

  const activeZoneRef = useRef<string | null>(null);

  const interactPillar = (pillarId: number) => {
    if (useGameStore.getState().stonehengeSolved) return;

    const currentStep = useGameStore.getState().stonehengeStep;
    const expectedId = STONEHENGE_SOLUTION[currentStep];

    if (pillarId === expectedId) {
      const nextStep = currentStep + 1;
      setStonehengeStep(nextStep);

      if (nextStep === STONEHENGE_SOLUTION.length) {
        setStonehengeSolved(true);
        setStonehengeBanner({
          title: '✨ ANCIENT SANCTUARY AWAKENED! ✨',
          bodyHtml:
            'You have deciphered the Rite of the Elements.<br>The Blessing of the Old Gods fills your spirit.<br><br><b>[ +500 Max Mana • Celestial Relic Acquired ]</b>'
        });
      }
    } else {
      // Mistake: reset sequence with prompt feedback
      setStonehengeStep(0);
      setMagicPrompt('❌ The elemental frequency falters... The ritual resets.');
    }
  };

  useFrame(() => {
    const playerPos = globalPlayerState.position;
    if (!playerPos) return;

    const dCrossroads = Math.min(
      playerPos.distanceTo(WAYSTONE_CROSSROADS_POS),
      playerPos.distanceTo(WAYSTONE_CROSSROADS_POS2)
    );
    const dDocks = playerPos.distanceTo(WAYSTONE_DOCKS_POS);
    const dPortal = playerPos.distanceTo(CITADEL_PORTAL_POS);
    const dSummit = playerPos.distanceTo(WATCHTOWER_SUMMIT_POS);
    const dMoonwell = playerPos.distanceTo(ENCHANTED_MOONWELL_POS);

    // Stonehenge proximity
    let nearPillar: StonehengePillarDef | null = null;
    let minPillarDist = Infinity;
    for (const p of STONEHENGE_PILLARS) {
      const dist = playerPos.distanceTo(p.pos);
      if (dist < 3.2 && dist < minPillarDist) {
        minPillarDist = dist;
        nearPillar = p;
      }
    }
    const dStonehengeAltar = playerPos.distanceTo(STONEHENGE_ALTAR_POS);

    let currentZone: string | null = null;
    let prompt: string | null = null;

    if (dCrossroads < 4.0) {
      currentZone = 'crossroads';
      prompt = 'Press [E] to Teleport to Harbor Docks Waystone';
    } else if (dDocks < 4.0) {
      currentZone = 'docks';
      prompt = 'Press [E] to Teleport to Village Crossroads Waystone';
    } else if (dPortal < 4.5) {
      currentZone = 'portal';
      prompt = 'Press [E] to Ascend to Watchtower Summit';
    } else if (dSummit < 5.0) {
      currentZone = 'summit';
      prompt = 'Press [E] to Descend to Citadel Courtyard';
    } else if (dMoonwell < 4.5) {
      currentZone = 'moonwell';
      prompt = 'Press [E] to Commune with Enchanted Moonwell';
    } else if (nearPillar) {
      currentZone = `stonehenge_pillar_${nearPillar.id}`;
      const isAlreadyActive =
        stonehengeSolved || STONEHENGE_SOLUTION.slice(0, stonehengeStep).includes(nearPillar.id);
      if (stonehengeSolved) {
        prompt = `Pillar of ${nearPillar.name} [Awakened ✨]`;
      } else if (isAlreadyActive) {
        prompt = `Pillar of ${nearPillar.name} [Resonating Harmony]`;
      } else {
        prompt = `Press [E] to Commune with Pillar of ${nearPillar.name}`;
      }
    } else if (dStonehengeAltar < 4.0) {
      currentZone = 'stonehenge_altar';
      if (stonehengeSolved) {
        prompt = 'Press [E] to Commune with Awakened Celestial Altar';
      } else {
        const nextExpected = STONEHENGE_PILLARS.find(
          (p) => p.id === STONEHENGE_SOLUTION[stonehengeStep]
        );
        prompt = `Ancient Altar: Decipher Rite of Elements (${stonehengeStep}/6) [Next: ${
          nextExpected?.name || 'Complete'
        }]`;
      }
    }

    if (activeZoneRef.current !== currentZone) {
      activeZoneRef.current = currentZone;
      setMagicPrompt(prompt);
    }
  });

  const handleInteract = () => {
    const zone = activeZoneRef.current;
    if (!zone) return;

    if (zone === 'crossroads') {
      teleportPlayer({ x: 102.0, y: 5.5, z: 125.0 });
    } else if (zone === 'docks') {
      teleportPlayer({ x: 8.0, y: 5.5, z: 10.0 });
    } else if (zone === 'portal') {
      teleportPlayer({ x: -0.23, y: 58.5, z: -108.77 });
    } else if (zone === 'summit') {
      teleportPlayer({ x: -15.0, y: 5.5, z: -100.0 });
    } else if (zone === 'moonwell') {
      setActiveDialog('moonwell_commune', 'moonwell');
    } else if (zone.startsWith('stonehenge_pillar_')) {
      const pillarId = parseInt(zone.replace('stonehenge_pillar_', ''), 10);
      interactPillar(pillarId);
    } else if (zone === 'stonehenge_altar') {
      if (stonehengeSolved) {
        setStonehengeBanner({
          title: '✨ ANCIENT SANCTUARY AWAKENED! ✨',
          bodyHtml:
            'The celestial relic hums in eternal resonance.<br>Your spirit remains blessed by the Old Gods.<br><br><b>[ Celestial Blessing Active ]</b>'
        });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        handleInteract();
      } else if (e.key === '1') {
        teleportPlayer({ x: 8.0, y: 5.5, z: 10.0 }); // Crossroads Waystone
      } else if (e.key === '2') {
        teleportPlayer({ x: 72.6, y: 5.5, z: 56.0 }); // Windmill
      } else if (e.key === '3') {
        teleportPlayer({ x: -15.0, y: 5.5, z: -100.0 }); // Citadel Portal
      } else if (e.key === '4') {
        teleportPlayer({ x: -0.23, y: 58.5, z: -108.77 }); // Summit Watchtower Orrery
      } else if (e.key === '5') {
        teleportPlayer({ x: -50.0, y: 5.5, z: 35.0 }); // Enchanted Moonwell Grove
      } else if (e.key === '6') {
        teleportPlayer({ x: 102.0, y: 5.5, z: 125.0 }); // Harbor Docks Waystone
      } else if (e.key === '7') {
        teleportPlayer({ x: -0.20, y: 5.5, z: -90.0 }); // Ground Observatory Sanctum
      } else if (e.key === '8') {
        teleportPlayer({ x: 35.0, y: 4.5, z: 59.0 }); // Stonehenge Sanctuary Altar
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teleportPlayer, stonehengeSolved, stonehengeStep]);

  useEffect(() => {
    if (triggerInteractEvent > 0) {
      handleInteract();
    }
  }, [triggerInteractEvent]);

  return (
    <group name="InteractiveMagicMarkers">
      {/* Summit Watchtower Floor Collider so player can walk on the summit roof inside Ward Shield */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[-0.23, 57.5, -108.77]}>
          <cylinderGeometry args={[6.5, 6.5, 0.4, 24]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      {/* Indicator rings on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.0, 3.05, 10.0]}>
        <ringGeometry args={[1.5, 2.0, 32]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.35} transparent side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[102.0, 3.05, 125.0]}>
        <ringGeometry args={[1.5, 2.0, 32]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.35} transparent side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15.0, 3.05, -105.0]}>
        <ringGeometry args={[1.8, 2.4, 32]} />
        <meshBasicMaterial color="#9d4edd" opacity={0.35} transparent side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.23, 57.55, -108.77]}>
        <ringGeometry args={[2.0, 2.6, 32]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.4} transparent side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-50.0, 3.05, 35.0]}>
        <ringGeometry args={[2.2, 2.8, 32]} />
        <meshBasicMaterial color="#00e5ff" opacity={0.35} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* 3.G Stonehenge Ancient Sanctuary Altar & Megalith Rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[35.0, 3.05, 62.0]}>
        <ringGeometry args={[2.5, 3.2, 36]} />
        <meshBasicMaterial
          color={stonehengeSolved ? '#ffd54f' : '#00e5ff'}
          opacity={0.4}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {STONEHENGE_PILLARS.map((p) => {
        const isActivated =
          stonehengeSolved || STONEHENGE_SOLUTION.slice(0, stonehengeStep).includes(p.id);
        return (
          <group key={p.id}>
            {/* Ground Rune Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[p.pos.x, 3.05, p.pos.z]}>
              <ringGeometry args={[0.9, 1.3, 24]} />
              <meshBasicMaterial
                color={p.color}
                opacity={isActivated ? 0.75 : 0.25}
                transparent
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Pointer / Click interaction trigger hitbox */}
            <mesh
              position={[p.pos.x, 4.0, p.pos.z]}
              visible={false}
              onClick={(e) => {
                e.stopPropagation();
                interactPillar(p.id);
              }}
            >
              <cylinderGeometry args={[1.5, 1.5, 3.5, 12]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export const Environment: React.FC = () => {
  const {
    magicSpeed,
    crystalGlow,
    beaconIntensity,
    courtyardIntensity,
    waystoneIntensity,
    portalIntensity,
    moonwellIntensity
  } = useControls('Celestial Magic System', {
    magicSpeed: { value: 1.0, min: 0, max: 3.0, step: 0.1, label: 'Animation Speed' },
    crystalGlow: { value: 0.6, min: 0.1, max: 2.5, step: 0.1, label: 'Crystal Emissive' },
    beaconIntensity: { value: 2.5, min: 0, max: 8.0, step: 0.1, label: 'Summit Beacon' },
    courtyardIntensity: { value: 1.8, min: 0, max: 6.0, step: 0.1, label: 'Observatory Light' },
    waystoneIntensity: { value: 2.2, min: 0, max: 6.0, step: 0.1, label: 'Waystones Light' },
    portalIntensity: { value: 2.8, min: 0, max: 8.0, step: 0.1, label: 'Portal Light' },
    moonwellIntensity: { value: 2.0, min: 0, max: 6.0, step: 0.1, label: 'Moonwell Light' }
  });

  const { fanSpeed } = useControls('Windmill', {
    fanSpeed: { value: 1.8, min: 0, max: 10, step: 0.1, label: 'Fan Speed' }
  });

  const [{ lampPreset, lampColor, lampIntensity }, setLamp] = useControls('Street Lamp', () => ({
    lampPreset: {
      options: Object.keys(lampPresets),
      value: 'Warm Vintage',
      onChange: (v: string) => {
        if (v && lampPresets[v]) {
          setLamp({ lampColor: lampPresets[v].color, lampIntensity: lampPresets[v].intensity });
        }
      }
    },
    lampColor: { value: '#ffaa00', label: 'Lamp Color' },
    lampIntensity: { value: 1.5, min: 0, max: 10, step: 0.1, label: 'Glow Intensity' }
  })) as any;

  // Lamps state for dynamic point light illumination
  const [allLamps, setAllLamps] = useState<THREE.Vector3[]>([]);
  const wellMeshRef = useRef<THREE.Mesh | null>(null);

  const setFarmPlots = useGameStore(state => state.setFarmPlots);
  const setDepositPlots = useGameStore(state => state.setDepositPlots);

  // Initialize static markers immediately on mount
  useEffect(() => {
    setFarmPlots(STATIC_FARM_PLOTS.map(p => new THREE.Vector3(...p)));
    setDepositPlots(STATIC_DEPOSIT_PLOTS.map(p => new THREE.Vector3(...p)));
    setAllLamps(STATIC_LAMP_POSITIONS.map(p => new THREE.Vector3(...p)));
  }, [setFarmPlots, setDepositPlots]);

  // Well interaction logic (Town Center Well at (0, 3.98, 0))
  const [isNearWell, setIsNearWell] = useState(false);
  const setActiveDialog = useGameStore(state => state.setActiveDialog);
  const activeDialogNpcId = useGameStore(state => state.activeDialogNpcId);
  const setActiveOutlineMesh = useGameStore(state => state.setActiveOutlineMesh);
  const triggerInteractEvent = useGameStore(state => state.triggerInteractEvent);
  const wellId = useMemo(() => Math.random().toString(), []);

  useFrame(() => {
    if (!wellMeshRef.current) return;
    const distToPlayer = wellMeshRef.current.position.distanceTo(globalPlayerState.position);
    if (distToPlayer < 4.5) {
      if (!isNearWell) setIsNearWell(true);
    } else {
      if (isNearWell) setIsNearWell(false);
    }
  });

  // Highlight well near player
  useEffect(() => {
    if (isNearWell && wellMeshRef.current) {
      setActiveOutlineMesh(wellMeshRef.current);
    } else if (!isNearWell) {
      if (useGameStore.getState().activeOutlineMesh === wellMeshRef.current) {
        setActiveOutlineMesh(null);
      }
    }
  }, [isNearWell, setActiveOutlineMesh]);

  // Well E key interaction
  useEffect(() => {
    const triggerWell = () => {
      setActiveDialog('well_interaction', wellId);
      const summonRole = Math.random() > 0.5 ? 'BlueSoldier Female' : 'BlueSoldier Male';
      useGameStore.getState().summonNpc(summonRole);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNearWell && (e.key === 'e' || e.key === 'E')) {
        triggerWell();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNearWell, setActiveDialog, wellId]);

  // Mobile interaction listener
  useEffect(() => {
    if (isNearWell && triggerInteractEvent > 0) {
      setActiveDialog('well_interaction', wellId);
      const summonRole = Math.random() > 0.5 ? 'BlueSoldier Female' : 'BlueSoldier Male';
      useGameStore.getState().summonNpc(summonRole);
    }
  }, [triggerInteractEvent]);

  // Close dialog on walk away
  useEffect(() => {
    if (!isNearWell && activeDialogNpcId === wellId) {
      setActiveDialog(null);
    }
  }, [isNearWell, activeDialogNpcId, setActiveDialog, wellId]);

  return (
    <group>
      {/* 1. Dedicated, Lightweight Physics Colliders (90 simplified shapes) */}
      <CollisionWorld />

      {/* 2. Unified Visual World & Celestial Magic System */}
      <UnifiedWorld
        lampColor={lampColor}
        lampIntensity={lampIntensity}
        fanSpeed={fanSpeed}
        magicSpeed={magicSpeed}
        crystalGlow={crystalGlow}
        beaconIntensity={beaconIntensity}
        courtyardIntensity={courtyardIntensity}
        waystoneIntensity={waystoneIntensity}
        portalIntensity={portalIntensity}
        moonwellIntensity={moonwellIntensity}
      />

      {/* 3. Procedural Instanced Trees (1,265 trees in 6 draw calls) */}
      <InstancedTrees />

      {/* 3.1 Interactive Celestial Magic Portals & Teleportation Monoliths */}
      <InteractiveMagicLocations />

      {/* 4. Interactive Well Silhouette / Outline Proxy in Town Square */}
      <mesh ref={wellMeshRef} position={[0, 3.5, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 2.2, 16]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>

      {/* 5. Dynamic Street Lamps (Nearest 3 to player) */}
      {allLamps.length > 0 && (
        <DynamicLamps
          lampPositions={allLamps}
          lampColor={lampColor}
          lampIntensity={lampIntensity}
        />
      )}
    </group>
  );
};

// Preload unified complete world, collision proxies, and trees
useGLTF.preload('./models/threejs_game_assets/island_world_complete.glb');
useGLTF.preload('./models/threejs_game_assets/base/collision.glb');
useGLTF.preload('./models/threejs_game_assets/trees.glb');
