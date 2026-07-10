import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpellEffect } from './SpellEffect';

interface ProjectileProps {
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  speed?: number;
  type?: 'fire' | 'water' | 'arcane' | 'holy' | 'void';
  onHit?: () => void;
}

export const Projectile: React.FC<ProjectileProps> = ({ startPos, targetPos, speed = 15.0, type = 'fire', onHit }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hasHit, setHasHit] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  
  // Create fixed direction and distance for the projectile
  const direction = useRef(new THREE.Vector3().subVectors(targetPos, startPos).normalize());
  const distance = startPos.distanceTo(targetPos);
  const currentDist = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || hasHit) return;

    // Move forward
    const moveAmt = speed * delta;
    currentDist.current += moveAmt;
    groupRef.current.position.addScaledVector(direction.current, moveAmt);

    // Check hit
    if (currentDist.current >= distance) {
      setHasHit(true);
      setIsExploding(true);
      if (onHit) onHit();
      
      // Cleanup explosion after a short delay
      setTimeout(() => {
        setIsExploding(false);
      }, 500); // Wait 0.5s for explosion visual
    }
  });

  if (hasHit && !isExploding) return null;

  return (
    <group ref={groupRef} position={startPos.clone()}>
      {!hasHit ? (
        // Projectile travelling
        <SpellEffect type={type} scaleMultiplier={0.5} duration={10.0} />
      ) : (
        // Explosion impact
        <group scale={1.5}>
           <SpellEffect type={type} scaleMultiplier={1.0} duration={0.5} />
        </group>
      )}
    </group>
  );
};
