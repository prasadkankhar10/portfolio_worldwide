import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { DynamicLamps } from './DynamicLamps';
import { useControls } from 'leva';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';

export interface ChunkMetadata {
  id: string;
  name: string;
  center: THREE.Vector3;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  file?: string;
}

// 2D Euclidean distance from point to Axis-Aligned Bounding Box (AABB)
function getDistanceToBox(px: number, pz: number, minX: number, maxX: number, minZ: number, maxZ: number): number {
  const dx = Math.max(minX - px, 0, px - maxX);
  const dz = Math.max(minZ - pz, 0, pz - maxZ);
  return Math.sqrt(dx * dx + dz * dz);
}

// 3x3 Chunk Layout with exact spatial perimeter bounding boxes
export const CHUNKS_METADATA: ChunkMetadata[] = [
  {
    id: 'chunk_0_0',
    name: 'South-West (Fortress)',
    center: new THREE.Vector3(-100, 0, 107),
    bounds: { minX: -135, maxX: -14.8, minZ: 12.4, maxZ: 135 }
  },
  {
    id: 'chunk_1_0',
    name: 'South-Center (Gates)',
    center: new THREE.Vector3(0, 0, 72),
    bounds: { minX: -45, maxX: 45, minZ: 45, maxZ: 135 }
  },
  {
    id: 'chunk_2_0',
    name: 'South-East (Farmlands)',
    center: new THREE.Vector3(77, 0, 72),
    bounds: { minX: -4.1, maxX: 135, minZ: -0.1, maxZ: 142.6 }
  },
  {
    id: 'chunk_0_1',
    name: 'West-Center (Blacksmith)',
    center: new THREE.Vector3(-100, 0, -2),
    bounds: { minX: -135, maxX: -19.9, minZ: -45, maxZ: 45 }
  },
  {
    id: 'chunk_1_1',
    name: 'Town Center (Market & Well)',
    center: new THREE.Vector3(0, 0, -1),
    bounds: { minX: -75.3, maxX: 97.9, minZ: -73.9, maxZ: 96.1 }
  },
  {
    id: 'chunk_2_1',
    name: 'East-Center (Inn & Library)',
    center: new THREE.Vector3(102, 0, 40),
    bounds: { minX: 29.2, maxX: 135, minZ: -45, maxZ: 89.6 }
  },
  {
    id: 'chunk_0_2',
    name: 'North-West (Pine Forest)',
    center: new THREE.Vector3(-85, 0, -83),
    bounds: { minX: -135, maxX: -14.7, minZ: -135, maxZ: -19.1 }
  },
  {
    id: 'chunk_1_2',
    name: 'North-Center (Castle Gates)',
    center: new THREE.Vector3(-4, 0, -83),
    bounds: { minX: -45, maxX: 45, minZ: -135, maxZ: -15.1 }
  },
  {
    id: 'chunk_2_2',
    name: 'North-East (Grand Buildings)',
    center: new THREE.Vector3(98, 0, -75),
    bounds: { minX: 14.6, maxX: 135, minZ: -135, maxZ: -10.5 }
  },
];

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

interface ChunkSectorProps {
  metadata: ChunkMetadata;
  viewDistance: number;
  chunkingEnabled: boolean;
  lodMode: string;
  lod0Distance: number;
  lod1Distance: number;
  showDebugLOD: boolean;
  lampColor: string;
  lampIntensity: number;
  fanSpeed: number;
}

const ChunkSector: React.FC<ChunkSectorProps> = ({
  metadata,
  viewDistance,
  chunkingEnabled,
  lodMode,
  lod0Distance,
  lod1Distance,
  showDebugLOD,
  lampColor,
  lampIntensity,
  fanSpeed
}) => {
  // Load all 3 pre-built LOD tiers for this chunk
  const lod0 = useGLTF(`./models/threejs_game_assets/chunks_lod/lod0/${metadata.id}_lod0.glb`);
  const lod1 = useGLTF(`./models/threejs_game_assets/chunks_lod/lod1/${metadata.id}_lod1.glb`);
  const lod2 = useGLTF(`./models/threejs_game_assets/chunks_lod/lod2/${metadata.id}_lod2.glb`);

  const groupRef = useRef<THREE.Group>(null);
  const lod0Ref = useRef<THREE.Group>(null);
  const lod1Ref = useRef<THREE.Group>(null);
  const lod2Ref = useRef<THREE.Group>(null);

  const windFansRef = useRef<(THREE.Object3D | null)[]>([]);

  // Setup scenes with shadow, emissive materials, and optional debug tint
  const setupTier = (rawScene: THREE.Group, debugColor?: string) => {
    const clonedScene = SkeletonUtils.clone(rawScene);
    clonedScene.updateMatrixWorld(true);
    let fan: THREE.Object3D | null = null;

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;

        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat: any) => {
          if (!mat) return;
          if (debugColor) {
            mat.color = new THREE.Color(debugColor);
          }
          const matName = (mat.name || '').toLowerCase();
          // Emissive Street Lamps
          if (matName.includes('lamp_material') || matName.includes('lamp')) {
            mat.emissive = new THREE.Color(lampColor);
            mat.emissiveIntensity = lampIntensity;
          }
          // Glowing Windows
          if (matName.includes('window')) {
            mat.emissive = new THREE.Color('#ffcc88');
            mat.emissiveIntensity = 2.0;
          }
        });
      }

      const name = (child.name || '').toLowerCase();
      // Decoupled Windmill Fan (Chunk 2_0)
      if (name.includes('wind_fan') || name.includes('fan')) {
        fan = child;
      }
    });

    return { scene: clonedScene, fan };
  };

  const tier0 = useMemo(() => setupTier(lod0.scene, showDebugLOD ? '#22c55e' : undefined), [lod0.scene, lampColor, lampIntensity, showDebugLOD]);
  const tier1 = useMemo(() => setupTier(lod1.scene, showDebugLOD ? '#eab308' : undefined), [lod1.scene, lampColor, lampIntensity, showDebugLOD]);
  const tier2 = useMemo(() => setupTier(lod2.scene, showDebugLOD ? '#ef4444' : undefined), [lod2.scene, lampColor, lampIntensity, showDebugLOD]);

  useEffect(() => {
    windFansRef.current = [tier0.fan, tier1.fan, tier2.fan];
  }, [tier0.fan, tier1.fan, tier2.fan]);

  // Smooth windmill rotation on Y-axis (DEVELOPER_GUIDE.md)
  useFrame((_, delta) => {
    windFansRef.current.forEach(fan => {
      if (fan) fan.rotation.y += fanSpeed * delta;
    });
  });

  // Dynamic Distance-based LOD switching and Culling using Box3 Perimeter Distance
  const checkTimer = useRef(0);
  const activeTierRef = useRef<number>(0);

  useFrame((state, delta) => {
    checkTimer.current += delta;
    if (checkTimer.current > 0.05) {
      checkTimer.current = 0;
      if (!groupRef.current) return;

      // Measure distance from both Camera and Player to chunk bounding perimeter
      const camPos = state.camera.position;
      const playerPos = globalPlayerState.position;
      const b = metadata.bounds;

      const camDist = getDistanceToBox(camPos.x, camPos.z, b.minX, b.maxX, b.minZ, b.maxZ);
      const playerDist = getDistanceToBox(playerPos.x, playerPos.z, b.minX, b.maxX, b.minZ, b.maxZ);
      // Minimum distance ensures neither player nor camera sees low poly when nearby
      const dist = Math.min(camDist, playerDist);

      // 1. Distance Culling: only cull if outside viewDistance
      if (chunkingEnabled && dist > viewDistance) {
        if (groupRef.current.visible) groupRef.current.visible = false;
        return;
      }
      if (!groupRef.current.visible) groupRef.current.visible = true;

      // 2. Dynamic LOD Selection with Hysteresis (prevents edge flickering)
      let targetTier = activeTierRef.current;
      if (lodMode === 'Force LOD0 (High)') {
        targetTier = 0;
      } else if (lodMode === 'Force LOD1 (Medium)') {
        targetTier = 1;
      } else if (lodMode === 'Force LOD2 (Low)') {
        targetTier = 2;
      } else {
        const HYSTERESIS = 6.0; // 6m buffer prevents border flickering
        if (targetTier === 0) {
          if (dist > lod0Distance + HYSTERESIS) {
            targetTier = dist > lod1Distance + HYSTERESIS ? 2 : 1;
          }
        } else if (targetTier === 1) {
          if (dist < lod0Distance) {
            targetTier = 0;
          } else if (dist > lod1Distance + HYSTERESIS) {
            targetTier = 2;
          }
        } else {
          // targetTier === 2
          if (dist < lod0Distance) {
            targetTier = 0;
          } else if (dist < lod1Distance) {
            targetTier = 1;
          }
        }
      }

      if (activeTierRef.current !== targetTier) {
        activeTierRef.current = targetTier;
        if (lod0Ref.current) lod0Ref.current.visible = targetTier === 0;
        if (lod1Ref.current) lod1Ref.current.visible = targetTier === 1;
        if (lod2Ref.current) lod2Ref.current.visible = targetTier === 2;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={lod0Ref} visible={true}>
        <primitive object={tier0.scene} />
      </group>
      <group ref={lod1Ref} visible={false}>
        <primitive object={tier1.scene} />
      </group>
      <group ref={lod2Ref} visible={false}>
        <primitive object={tier2.scene} />
      </group>
    </group>
  );
};

const PersistentBase: React.FC = () => {
  const { scene } = useGLTF('./models/threejs_game_assets/base/persistent_base.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.updateMatrixWorld(true);
    c.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={cloned} />
    </RigidBody>
  );
};

// Dedicated, lightweight physics colliders from collision.glb (72 simplified convex shapes)
const invisibleColliderMaterial = new THREE.MeshBasicMaterial({ visible: false });

const CollisionWorld: React.FC = () => {
  const { scene } = useGLTF('./models/threejs_game_assets/base/collision.glb');
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene);
    c.updateMatrixWorld(true);
    c.traverse((child: any) => {
      if (child.isMesh) {
        // Keep child.visible = true so Rapier's traverseVisible builds colliders!
        // Material.visible = false ensures WebGL skips rendering it.
        child.visible = true;
        child.material = invisibleColliderMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return c;
  }, [scene]);

  return (
    <RigidBody type="fixed" colliders="trimesh" includeInvisible={true}>
      <primitive object={cloned} />
    </RigidBody>
  );
};

export const Environment: React.FC = () => {
  const { chunkingEnabled, viewDistance } = useControls('3x3 Chunking System', {
    chunkingEnabled: { value: true, label: 'Enable Chunking' },
    viewDistance: { value: 120, min: 60, max: 250, step: 5, label: 'View Distance (m)' }
  });

  const { lodMode, lod0Distance, lod1Distance, showDebugLOD } = useControls('Level of Detail (LOD)', {
    lodMode: {
      value: 'Auto (Distance)',
      options: ['Auto (Distance)', 'Force LOD0 (High)', 'Force LOD1 (Medium)', 'Force LOD2 (Low)'],
      label: 'LOD Mode'
    },
    lod0Distance: { value: 55, min: 20, max: 120, step: 5, label: 'LOD0 Cutoff (0-55m)' },
    lod1Distance: { value: 130, min: 60, max: 220, step: 5, label: 'LOD1 Cutoff (55-130m)' },
    showDebugLOD: { value: false, label: 'Debug Tint (Green/Yellow/Red)' }
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
    lampIntensity: { value: 2.5, min: 0, max: 10, step: 0.1, label: 'Glow Intensity' }
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
      {/* 0. Dedicated, Lightweight Physics Colliders (72 simplified convex shapes) */}
      <CollisionWorld />

      {/* 1. Permanent Base Ground & Ocean Terrain */}
      <PersistentBase />

      {/* 2. 3x3 Dynamic Spatial Chunks with 3-tier distance LOD */}
      {CHUNKS_METADATA.map(metadata => (
        <ChunkSector
          key={metadata.id}
          metadata={metadata}
          viewDistance={viewDistance}
          chunkingEnabled={chunkingEnabled}
          lodMode={lodMode}
          lod0Distance={lod0Distance}
          lod1Distance={lod1Distance}
          showDebugLOD={showDebugLOD}
          lampColor={lampColor}
          lampIntensity={lampIntensity}
          fanSpeed={fanSpeed}
        />
      ))}

      {/* 3. Interactive Well Silhouette / Outline Proxy in Town Square */}
      <mesh ref={wellMeshRef} position={[0, 3.5, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 2.2, 16]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>

      {/* 4. Dynamic Street Lamps (Nearest 3 to player) */}
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

// Preload all chunk LOD models, persistent base, and collision model
useGLTF.preload('./models/threejs_game_assets/base/collision.glb');
useGLTF.preload('./models/threejs_game_assets/base/persistent_base.glb');
['lod0', 'lod1', 'lod2'].forEach(tier => {
  CHUNKS_METADATA.forEach(chunk => {
    useGLTF.preload(`./models/threejs_game_assets/chunks_lod/${tier}/${chunk.id}_${tier}.glb`);
  });
});
