import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { globalPlayerState } from './Character';

interface DynamicLampsProps {
  lampPositions: THREE.Vector3[];
  lampColor: string;
  lampIntensity: number;
}

interface LampDistance {
  index: number;
  distSq: number;
}

const MAX_LIGHTS = 4; // Upgraded from 3 to 4 for richer local coverage
const CULL_DISTANCE = 32; // Expanded cull distance

/**
 * VolumetricLightBeams: Renders visible glowing light shafts and ground light pools
 * beneath all 46 street lamps in just 2 draw calls using InstancedMesh.
 */
const VolumetricLightBeams: React.FC<{ lampPositions: THREE.Vector3[]; lampColor: string }> = ({ lampPositions, lampColor }) => {
  const beamMeshRef = useRef<THREE.InstancedMesh>(null);
  const poolMeshRef = useRef<THREE.InstancedMesh>(null);

  const [coneGeo, poolGeo, beamMat, poolMat] = useMemo(() => {
    // Inverted tapered cone geometry: radiusTop: 0.25, radiusBottom: 2.8, height: 5.0
    const cGeo = new THREE.CylinderGeometry(0.25, 2.8, 5.0, 16, 1, true);
    // Offset cone center so its apex attaches directly to the lamp fixture
    cGeo.translate(0, -2.5, 0);

    const pGeo = new THREE.CircleGeometry(2.8, 16);
    pGeo.rotateX(-Math.PI / 2);

    const bMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(lampColor),
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const pMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(lampColor),
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [cGeo, pGeo, bMat, pMat];
  }, [lampColor]);

  useEffect(() => {
    if (!beamMeshRef.current || !poolMeshRef.current || lampPositions.length === 0) return;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < lampPositions.length; i++) {
      const pos = lampPositions[i];
      // Volumetric beam hangs from the lamp fixture
      dummy.position.set(pos.x, pos.y, pos.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      beamMeshRef.current.setMatrixAt(i, dummy.matrix);

      // Light pool sits at ground level beneath the lamp
      dummy.position.set(pos.x, Math.max(0.08, pos.y - 4.95), pos.z);
      dummy.updateMatrix();
      poolMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    beamMeshRef.current.instanceMatrix.needsUpdate = true;
    poolMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [lampPositions]);

  return (
    <group>
      <instancedMesh
        ref={beamMeshRef}
        args={[coneGeo, beamMat, lampPositions.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={poolMeshRef}
        args={[poolGeo, poolMat, lampPositions.length]}
        frustumCulled={false}
      />
    </group>
  );
};

export const DynamicLamps = ({ lampPositions, lampColor, lampIntensity }: DynamicLampsProps) => {
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const frameCount = useRef(0);
  
  // Reusable distances cache array to avoid GC allocations
  const distCache = useMemo<LampDistance[]>(() => {
    return lampPositions.map((_, i) => ({ index: i, distSq: 0 }));
  }, [lampPositions]);

  useFrame(() => {
    if (lampPositions.length === 0) return;
    frameCount.current++;
    // Only recalculate closest lamps every 8 frames (~7-8 times/sec)
    if (frameCount.current % 8 !== 0) return;

    // 1. Calculate distance from player to all lamps into preallocated cache
    const playerPos = globalPlayerState.position;
    for (let i = 0; i < lampPositions.length; i++) {
      distCache[i].index = i;
      distCache[i].distSq = lampPositions[i].distanceToSquared(playerPos);
    }

    // 2. Sort by distance (closest first)
    distCache.sort((a: LampDistance, b: LampDistance) => a.distSq - b.distSq);

    // 3. Update the 4 PointLights to sit at the closest 4 lamps
    for (let i = 0; i < MAX_LIGHTS; i++) {
      const light = lightRefs.current[i];
      if (!light) continue;

      if (i < distCache.length) {
        const closestLamp = distCache[i];
        const dist = Math.sqrt(closestLamp.distSq);
        
        if (dist < CULL_DISTANCE) {
          // Snap light position to the lamp
          light.position.copy(lampPositions[closestLamp.index]);
          
          // Smooth fade in/out based on distance
          const fadeFactor = 1.0 - (dist / CULL_DISTANCE);
          const easedFade = fadeFactor * fadeFactor;
          
          light.intensity = lampIntensity * 2.2 * easedFade;
          light.visible = true;
        } else {
          // Too far, hide it to save GPU
          light.visible = false;
          light.intensity = 0;
        }
      } else {
        light.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Volumetric Light Cones & Ground Light Pools in 2 Draw Calls (Option B) */}
      <VolumetricLightBeams lampPositions={lampPositions} lampColor={lampColor} />

      {/* Dynamic PointLights (Option A: 4 closest to player) */}
      {Array.from({ length: MAX_LIGHTS }).map((_, i) => (
        <pointLight
          key={i}
          ref={(el) => (lightRefs.current[i] = el)}
          color={lampColor}
          distance={30}
          decay={1.5}
          castShadow={false}
          visible={false}
          intensity={0}
        />
      ))}
    </group>
  );
};
