import React, { useEffect, useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SpawnPoint {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// Rich natural color palette for organic foliage variation
const FOLIAGE_PALETTE = [
  new THREE.Color('#2d6a4f'), // Deep forest green
  new THREE.Color('#40916c'), // Rich emerald green
  new THREE.Color('#52b788'), // Vibrant spring green
  new THREE.Color('#74c69d'), // Fresh lime sage
  new THREE.Color('#386641'), // Dark moss green
  new THREE.Color('#6a994e'), // Olive meadow
  new THREE.Color('#a7c957'), // Sunny yellow-green
  new THREE.Color('#bc6c25'), // Rare autumn bronze
  new THREE.Color('#dda15e'), // Golden amber
  new THREE.Color('#283618'), // Alpine pine dark
  new THREE.Color('#606c38'), // Sagebrush green
];

// Deterministic pseudo-random number generator for consistent seeds per tree
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const InstancedTrees: React.FC = () => {
  const gltf = useGLTF('./models/threejs_game_assets/trees.glb');
  const [spawnPoints, setSpawnPoints] = useState<SpawnPoint[]>([]);

  useEffect(() => {
    fetch('./models/threejs_game_assets/tree_spawn_points.json')
      .then((res) => res.json())
      .then((data: SpawnPoint[]) => {
        setSpawnPoints(data);
      })
      .catch((err) => {
        console.warn('Failed to load tree spawn points:', err);
      });
  }, []);

  const instancedMeshes = useMemo(() => {
    if (!gltf.scene || spawnPoints.length === 0) return [];

    const treePrototypes: THREE.Mesh[] = [];
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        treePrototypes.push(child);
      }
    });

    if (treePrototypes.length === 0) return [];

    // Group spawn points across prototypes so types are evenly and organically mixed
    const numPrototypes = treePrototypes.length;
    const protoBuckets: SpawnPoint[][] = Array.from({ length: numPrototypes }, () => []);

    spawnPoints.forEach((pt, i) => {
      // Use spatial hash of X and Z to distribute tree types organically across the island
      const hash = Math.abs(Math.sin(pt.position[0] * 12.9898 + pt.position[1] * 78.233 + i) * 43758.5453);
      const protoIndex = Math.floor(hash % numPrototypes);
      protoBuckets[protoIndex].push(pt);
    });

    const dummy = new THREE.Object3D();
    const meshes: THREE.InstancedMesh[] = [];

    treePrototypes.forEach((proto, pIdx) => {
      const bucket = protoBuckets[pIdx];
      const count = bucket.length;
      if (count === 0) return;

      // Clone material so setColorAt applies instance tinting cleanly
      const material = proto.material instanceof THREE.Material
        ? proto.material.clone()
        : proto.material;

      const instMesh = new THREE.InstancedMesh(proto.geometry, material, count);
      instMesh.name = `InstancedTree_${proto.name || pIdx}_x${count}`;
      instMesh.castShadow = false; // Prevents 1,265 tree shadow map bottleneck
      instMesh.receiveShadow = true;

      for (let i = 0; i < count; i++) {
        const pt = bucket[i];
        const seed = pt.position[0] * 31.17 + pt.position[1] * 17.53 + i * 7.91;

        // 1. Organic random yaw rotation (0 to 360 degrees)
        const rotY = pseudoRandom(seed) * Math.PI * 2;
        // Slight organic tilt (wind-blown nature effect)
        const tiltX = (pseudoRandom(seed + 1) - 0.5) * 0.08;
        const tiltZ = (pseudoRandom(seed + 2) - 0.5) * 0.08;

        // 2. Organic scale variation (0.7x saplings to 1.4x ancient trees)
        const scaleBase = 0.7 + pseudoRandom(seed + 3) * 0.7; // 0.7 to 1.4
        const heightVariance = 0.85 + pseudoRandom(seed + 4) * 0.3; // 0.85 to 1.15
        const scaleX = scaleBase * (pt.scale[0] || 1);
        const scaleY = scaleBase * heightVariance * (pt.scale[2] || 1); // Blender Z is Three Y
        const scaleZ = scaleBase * (pt.scale[1] || 1);

        // Blender Z-up to Three.js Y-up mapping: (X, Z, -Y)
        dummy.position.set(pt.position[0], pt.position[2], -pt.position[1]);
        dummy.rotation.set(tiltX, rotY, tiltZ);
        dummy.scale.set(scaleX, scaleY, scaleZ);
        dummy.updateMatrix();

        instMesh.setMatrixAt(i, dummy.matrix);

        // 3. Natural foliage color variation per tree
        const colorIdx = Math.floor(pseudoRandom(seed + 5) * FOLIAGE_PALETTE.length);
        const color = FOLIAGE_PALETTE[colorIdx];
        instMesh.setColorAt(i, color);
      }

      instMesh.count = count;
      instMesh.instanceMatrix.needsUpdate = true;
      if (instMesh.instanceColor) {
        instMesh.instanceColor.needsUpdate = true;
      }
      meshes.push(instMesh);
    });

    return meshes;
  }, [gltf.scene, spawnPoints]);

  return (
    <group name="InstancedTrees">
      {instancedMeshes.map((mesh, idx) => (
        <primitive key={idx} object={mesh} />
      ))}
    </group>
  );
};

useGLTF.preload('./models/threejs_game_assets/trees.glb');
