import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { globalPlayerState } from './Character';

interface DistanceNameTagProps {
  name: string;
  position?: [number, number, number];
}

const _tagWorldPos = new THREE.Vector3();
const VISIBLE_DISTANCE_SQ = 20 * 20; // 20 meters

export function DistanceNameTag({ name, position = [0, 4.0, 0] }: DistanceNameTagProps) {
  const [visible, setVisible] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const frameCount = useRef(Math.floor(Math.random() * 6)); // Jitter frame checks

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 6 !== 0) return; // Run check only 10 times/sec
    if (!groupRef.current) return;
    
    // Get world position of this tag using static pre-allocated vector (0 allocations)
    groupRef.current.getWorldPosition(_tagWorldPos);
    
    // Fast distance squared to player
    const distSq = _tagWorldPos.distanceToSquared(globalPlayerState.position);
    
    if (distSq < VISIBLE_DISTANCE_SQ && !visible) {
      setVisible(true);
    } else if (distSq >= VISIBLE_DISTANCE_SQ && visible) {
      setVisible(false);
    }
  });

  return (
    <group ref={groupRef}>
      {visible && (
        <Html position={position} center zIndexRange={[50, 0]}>
          <div className="bg-black/60 text-white/90 text-[10px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap shadow-sm border border-white/10 pointer-events-none transition-opacity duration-300">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}
