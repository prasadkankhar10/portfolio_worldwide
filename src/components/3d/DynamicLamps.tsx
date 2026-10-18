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

const MAX_LIGHTS = 6; // 6 closest real-time point lights around player
const CULL_DISTANCE = 34; // Distance cull range in meters

export const DynamicLamps = ({ lampPositions, lampColor, lampIntensity }: DynamicLampsProps) => {
  const lightRefs = useRef<(THREE.PointLight | null)[]>([]);
  const frameCount = useRef(0);

  // Reusable distances cache array to avoid garbage collection spikes
  const distCache = useMemo<LampDistance[]>(() => {
    return lampPositions.map((_, i) => ({ index: i, distSq: 0 }));
  }, [lampPositions]);

  useFrame(() => {
    if (lampPositions.length === 0) return;
    frameCount.current++;
    // Recalculate closest lamps every 6 frames (~10 times/sec)
    if (frameCount.current % 6 !== 0) return;

    // 1. Calculate distance from player to all lamps into preallocated cache
    const playerPos = globalPlayerState.position;
    for (let i = 0; i < lampPositions.length; i++) {
      distCache[i].index = i;
      distCache[i].distSq = lampPositions[i].distanceToSquared(playerPos);
    }

    // 2. Sort by distance (closest first)
    distCache.sort((a: LampDistance, b: LampDistance) => a.distSq - b.distSq);

    // 3. Update the PointLights to sit at the closest lamps
    for (let i = 0; i < MAX_LIGHTS; i++) {
      const light = lightRefs.current[i];
      if (!light) continue;

      if (i < distCache.length) {
        const closestLamp = distCache[i];
        const dist = Math.sqrt(closestLamp.distSq);

        if (dist < CULL_DISTANCE) {
          // Snap light position to the lamp lantern fixture
          light.position.copy(lampPositions[closestLamp.index]);

          // Smooth quadratic falloff based on player proximity
          const fadeFactor = 1.0 - (dist / CULL_DISTANCE);
          const easedFade = fadeFactor * fadeFactor;

          light.intensity = lampIntensity * 2.4 * easedFade;
          light.visible = true;
        } else {
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
      {/* Real-time dynamic PointLights at lamps closest to the player */}
      {Array.from({ length: MAX_LIGHTS }).map((_, i) => (
        <pointLight
          key={i}
          ref={(el) => (lightRefs.current[i] = el)}
          color={lampColor}
          distance={28}
          decay={1.4}
          castShadow={false}
          visible={false}
          intensity={0}
        />
      ))}
    </group>
  );
};
