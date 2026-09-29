import React, { useRef, useMemo } from 'react';
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

const MAX_LIGHTS = 3; // Strict limit to prevent WebGL from crashing
const CULL_DISTANCE = 25; // How far before light fades out

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

    // 3. Update the 3 PointLights to sit at the closest 3 lamps
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
          
          light.intensity = lampIntensity * easedFade;
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
      {Array.from({ length: MAX_LIGHTS }).map((_, i) => (
        <pointLight
          key={i}
          ref={(el) => (lightRefs.current[i] = el)}
          color={lampColor}
          distance={20}
          castShadow={false}
          visible={false}
          intensity={0}
        />
      ))}
    </group>
  );
};
