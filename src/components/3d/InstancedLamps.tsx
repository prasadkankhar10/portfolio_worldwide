import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { globalPlayerState } from './Character';

interface InstancedLampsProps {
  spawnMatrices: THREE.Matrix4[];
}

export const InstancedLamps = ({ spawnMatrices }: InstancedLampsProps) => {
  const { nodes, materials } = useGLTF('./models/lamp.glb') as any;

  // Clone materials so we can make the bulb glow if needed
  const clonedMaterials = useMemo(() => {
    const mats: Record<string, THREE.Material> = {};
    for (const key in materials) {
      mats[key] = materials[key].clone();
      if (mats[key] instanceof THREE.MeshStandardMaterial) {
        if (key === 'Material.005' || key === 'Material.004') {
          (mats[key] as THREE.MeshStandardMaterial).emissive = new THREE.Color('#ffaa00');
          (mats[key] as THREE.MeshStandardMaterial).emissiveIntensity = 2;
        }
      }
    }
    return mats;
  }, [materials]);

  const lampMeshes = useMemo(() => {
    const meshes: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];
    for (const key in nodes) {
      if (nodes[key].isMesh) {
        meshes.push({
          geometry: nodes[key].geometry,
          material: clonedMaterials[nodes[key].material.name] || nodes[key].material
        });
      }
    }
    return meshes;
  }, [nodes, clonedMaterials]);

  // --- Dynamic Light Culling ---
  const lightCount = 3;
  const lightRefs = useRef<(THREE.Group | null)[]>([]);

  const lampPositions = useMemo(() => {
    const positions: THREE.Vector3[] = [];
    const dummy = new THREE.Vector3();
    spawnMatrices.forEach(matrix => {
      dummy.setFromMatrixPosition(matrix);
      positions.push(dummy.clone());
    });
    return positions;
  }, [spawnMatrices]);

  useFrame(() => {
    if (lampPositions.length === 0) return;
    
    const playerPos = globalPlayerState.position;
    
    const distances = lampPositions.map((pos, index) => ({
      index,
      distSq: pos.distanceToSquared(playerPos)
    }));
    
    distances.sort((a, b) => a.distSq - b.distSq);
    
    for (let i = 0; i < lightCount; i++) {
      if (lightRefs.current[i] && i < distances.length) {
        const targetPos = lampPositions[distances[i].index];
        lightRefs.current[i]!.position.set(targetPos.x, targetPos.y + 2.5, targetPos.z);
        
        const lightDist = Math.sqrt(distances[i].distSq);
        const pointLight = lightRefs.current[i]!.children[0] as THREE.PointLight;
        if (pointLight) {
          const targetIntensity = lightDist > 30 ? 0 : 2 * Math.max(0, 1 - (lightDist - 15) / 15);
          pointLight.intensity = THREE.MathUtils.lerp(pointLight.intensity, targetIntensity, 0.1);
        }
      }
    }
  });

  return (
    <group>
      {lampMeshes.map((mesh, index) => (
        <instancedMesh
          key={`lamp-mesh-${index}`}
          args={[mesh.geometry, mesh.material, spawnMatrices.length]}
          castShadow
          receiveShadow
          onUpdate={(self) => {
            spawnMatrices.forEach((matrix, i) => {
              self.setMatrixAt(i, matrix);
            });
            self.instanceMatrix.needsUpdate = true;
          }}
        />
      ))}

      {Array.from({ length: lightCount }).map((_, i) => (
        <group key={`dynamic-light-${i}`} ref={(el) => (lightRefs.current[i] = el)}>
          <pointLight color="#ffaa44" intensity={2} distance={20} castShadow shadow-bias={-0.001} shadow-mapSize={[512, 512]} />
        </group>
      ))}
    </group>
  );
};

useGLTF.preload('./models/lamp.glb');
