import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { InstancedTrees } from './InstancedTrees';
import { DynamicLamps } from './DynamicLamps';
import { useControls } from 'leva';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';

export interface ChunkMetadata {
  id: string;
  name: string;
  center: THREE.Vector3;
  file: string;
}

export const CHUNKS_METADATA: ChunkMetadata[] = [
  { id: 'chunk_0_0', name: 'South-West (Fortress)', center: new THREE.Vector3(-90, 0, 90), file: './models/chunks_export/chunk_0_0.glb' },
  { id: 'chunk_1_0', name: 'South-Center (Gates)', center: new THREE.Vector3(0, 0, 90), file: './models/chunks_export/chunk_1_0.glb' },
  { id: 'chunk_2_0', name: 'South-East (Farmlands)', center: new THREE.Vector3(90, 0, 90), file: './models/chunks_export/chunk_2_0.glb' },
  { id: 'chunk_0_1', name: 'West-Center (Blacksmith)', center: new THREE.Vector3(-90, 0, 0), file: './models/chunks_export/chunk_0_1.glb' },
  { id: 'chunk_1_1', name: 'Town Center (Market & Well)', center: new THREE.Vector3(0, 0, 0), file: './models/chunks_export/chunk_1_1.glb' },
  { id: 'chunk_2_1', name: 'East-Center (Inn & Library)', center: new THREE.Vector3(90, 0, 0), file: './models/chunks_export/chunk_2_1.glb' },
  { id: 'chunk_0_2', name: 'North-West (Pine Forest)', center: new THREE.Vector3(-90, 0, -90), file: './models/chunks_export/chunk_0_2.glb' },
  { id: 'chunk_1_2', name: 'North-Center (Castle Gates)', center: new THREE.Vector3(0, 0, -90), file: './models/chunks_export/chunk_1_2.glb' },
  { id: 'chunk_2_2', name: 'North-East (Grand Buildings)', center: new THREE.Vector3(90, 0, -90), file: './models/chunks_export/chunk_2_2.glb' },
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

interface ChunkMarkers {
  lampPositions: THREE.Vector3[];
  treeMatrices: THREE.Matrix4[];
  farmPlots: THREE.Vector3[];
  depositPlots: THREE.Vector3[];
  wellMesh?: THREE.Mesh | null;
  windFan?: THREE.Object3D | null;
}

interface ChunkSectorProps {
  metadata: ChunkMetadata;
  viewDistance: number;
  chunkingEnabled: boolean;
  treeSpacing: number;
  lampColor: string;
  lampIntensity: number;
  fanSpeed: number;
  onMarkersReady: (chunkId: string, markers: ChunkMarkers) => void;
}

const ChunkSector: React.FC<ChunkSectorProps> = ({
  metadata,
  viewDistance,
  chunkingEnabled,
  treeSpacing,
  lampColor,
  lampIntensity,
  fanSpeed,
  onMarkersReady
}) => {
  const { scene } = useGLTF(metadata.file);
  const groupRef = useRef<THREE.Group>(null);
  const windFanRef = useRef<THREE.Object3D | null>(null);

  const { cloned, markers } = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.updateMatrixWorld(true);

    const lampPositions: THREE.Vector3[] = [];
    const treeMatrices: THREE.Matrix4[] = [];
    const farmPlots: THREE.Vector3[] = [];
    const depositPlots: THREE.Vector3[] = [];
    let wellMesh: THREE.Mesh | null = null;
    let windFan: THREE.Object3D | null = null;

    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
      }

      const name = (child.name || '').toLowerCase();
      const materialName = (child.material?.name || '').toLowerCase();

      // Check for Windmill Fan
      if (name.includes('wind_fan') || name.includes('fan')) {
        windFan = child;
      }

      // Check for Interactive Well
      if (name.includes('well')) {
        wellMesh = child;
      }

      // Street Lamps
      if (name.includes('light1111') || name.includes('lamp') || name.includes('lantern') || materialName.includes('lamp_material')) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(lampColor);
          child.material.emissiveIntensity = lampIntensity;
        }
        lampPositions.push(pos);
      }

      // Glowing Windows
      if (name.includes('window') || materialName.includes('window')) {
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color('#ffcc88');
          child.material.emissiveIntensity = 2.0;
        }
      }

      // Farm Plots
      if (name.includes('farm_dirt') || name.includes('farm_secondage')) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        farmPlots.push(pos);
      }

      // Deposit Points
      if (name.includes('bigbarn') || name.includes('mill-wind')) {
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        pos.z += 2.0;
        depositPlots.push(pos);
      }

      // Tree spawn markers
      const isNormalTree = name.includes('tree_swapn') || name.includes('tree_spawn') || name.includes('treespawn');
      const isDenseTree = name.includes('1treetree');
      if (isNormalTree || isDenseTree) {
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        child.matrixWorld.decompose(position, rotation, scale);

        const randomRotation = Math.random() * Math.PI * 2;
        rotation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomRotation));
        const treeScale = 1.0 * (1.0 + Math.random() * 0.4);
        scale.set(treeScale, treeScale, treeScale);

        const matrix = new THREE.Matrix4().compose(position, rotation, scale);
        treeMatrices.push(matrix);

        // Remove dummy cube from scene so camera doesn't bump into it
        setTimeout(() => {
          if (child.parent) child.parent.remove(child);
        }, 0);
      }
    });

    return {
      cloned,
      markers: { lampPositions, treeMatrices, farmPlots, depositPlots, wellMesh, windFan }
    };
  }, [scene, lampColor, lampIntensity, treeSpacing]);

  useEffect(() => {
    onMarkersReady(metadata.id, markers);
    if (markers.windFan) {
      windFanRef.current = markers.windFan;
    }
  }, [metadata.id, markers, onMarkersReady]);

  // Rotate fan if present in this chunk
  useFrame((_, delta) => {
    if (windFanRef.current) {
      windFanRef.current.rotation.z += fanSpeed * delta;
    }
  });

  // Dynamic Distance Culling for this Chunk
  const checkTimer = useRef(0);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!chunkingEnabled) {
      if (!groupRef.current.visible) groupRef.current.visible = true;
      return;
    }
    checkTimer.current += delta;
    if (checkTimer.current > 0.1) {
      checkTimer.current = 0;
      const playerPos = globalPlayerState.position;
      const dx = metadata.center.x - playerPos.x;
      const dz = metadata.center.z - playerPos.z;
      const isVisible = (dx * dx + dz * dz) < (viewDistance * viewDistance);
      if (groupRef.current.visible !== isVisible) {
        groupRef.current.visible = isVisible;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={cloned} />
      </RigidBody>
    </group>
  );
};

const PersistentBase: React.FC = () => {
  const { scene } = useGLTF('./models/chunks_export/persistent_base.glb');
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

export const Environment: React.FC = () => {
  const { chunkingEnabled, viewDistance } = useControls('3x3 Chunking System', {
    chunkingEnabled: { value: true, label: 'Enable Chunking' },
    viewDistance: { value: 120, min: 60, max: 250, step: 5, label: 'View Distance (m)' }
  });

  const { treeSpacing } = useControls('Forest Generation', {
    treeSpacing: { value: 6, min: 2, max: 20, step: 0.5, label: 'Tree Spacing (m)' }
  });

  const { fanSpeed } = useControls('Windmill', {
    fanSpeed: { value: 2.0, min: 0, max: 10, step: 0.1, label: 'Fan Speed' }
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

  // Aggregated state from all chunks
  const [allLamps, setAllLamps] = useState<THREE.Vector3[]>([]);
  const [allTrees, setAllTrees] = useState<THREE.Matrix4[]>([]);
  const wellMeshRef = useRef<THREE.Mesh | null>(null);

  const chunkMarkersRef = useRef<Record<string, ChunkMarkers>>({});
  const setFarmPlots = useGameStore(state => state.setFarmPlots);
  const setDepositPlots = useGameStore(state => state.setDepositPlots);

  const handleMarkersReady = useCallback((chunkId: string, markers: ChunkMarkers) => {
    chunkMarkersRef.current[chunkId] = markers;
    if (markers.wellMesh) {
      wellMeshRef.current = markers.wellMesh;
    }

    // Re-aggregate markers across all registered chunks
    const lamps: THREE.Vector3[] = [];
    const trees: THREE.Matrix4[] = [];
    const farms: THREE.Vector3[] = [];
    const deposits: THREE.Vector3[] = [];

    Object.values(chunkMarkersRef.current).forEach(m => {
      lamps.push(...m.lampPositions);
      trees.push(...m.treeMatrices);
      farms.push(...m.farmPlots);
      deposits.push(...m.depositPlots);
    });

    setAllLamps(lamps);
    setAllTrees(trees);
    if (farms.length > 0) setFarmPlots(farms);
    if (deposits.length > 0) setDepositPlots(deposits);
  }, [setFarmPlots, setDepositPlots]);

  // Well interaction logic
  const [isNearWell, setIsNearWell] = useState(false);
  const setActiveDialog = useGameStore(state => state.setActiveDialog);
  const activeDialogNpcId = useGameStore(state => state.activeDialogNpcId);
  const setActiveOutlineMesh = useGameStore(state => state.setActiveOutlineMesh);
  const triggerInteractEvent = useGameStore(state => state.triggerInteractEvent);
  const wellId = useMemo(() => Math.random().toString(), []);

  useFrame(() => {
    if (!wellMeshRef.current) return;
    const wellPos = new THREE.Vector3();
    wellMeshRef.current.getWorldPosition(wellPos);
    const distToPlayer = wellPos.distanceTo(globalPlayerState.position);
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
      {/* 1. Permanent Base Ground & Ocean Terrain */}
      <PersistentBase />

      {/* 2. 3x3 Dynamic Spatial Chunks */}
      {CHUNKS_METADATA.map(metadata => (
        <ChunkSector
          key={metadata.id}
          metadata={metadata}
          viewDistance={viewDistance}
          chunkingEnabled={chunkingEnabled}
          treeSpacing={treeSpacing}
          lampColor={lampColor}
          lampIntensity={lampIntensity}
          fanSpeed={fanSpeed}
          onMarkersReady={handleMarkersReady}
        />
      ))}

      {/* 3. Dynamic Lamps */}
      {allLamps.length > 0 && (
        <DynamicLamps
          lampPositions={allLamps}
          lampColor={lampColor}
          lampIntensity={lampIntensity}
        />
      )}

      {/* 4. Instanced Trees */}
      {allTrees.length > 0 && (
        <InstancedTrees spawnMatrices={allTrees} />
      )}
    </group>
  );
};

// Preload all 10 chunk models (total 2.47MB)
useGLTF.preload('./models/chunks_export/persistent_base.glb');
CHUNKS_METADATA.forEach(chunk => useGLTF.preload(chunk.file));
