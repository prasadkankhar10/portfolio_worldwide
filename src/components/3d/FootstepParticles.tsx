import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { globalPlayerState } from './Character';
import { soundEngine } from '../../utils/soundEngine';

interface DustParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: number;
  life: number;
  maxLife: number;
}

const MAX_PARTICLES = 30;

export const FootstepParticles: React.FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particles = useRef<DustParticle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastEmitTime = useRef(0);
  const lastPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const currentPos = globalPlayerState.position;
    const isMoving = globalPlayerState.isMoving;
    const isRunning = globalPlayerState.isRunning;
    const isGrounded = globalPlayerState.isGrounded ?? true;
    const now = performance.now();

    // Natural responsive stride cadence: ~260ms for sprinting, ~380ms for walking
    const minStepDist = isRunning ? 1.1 : 0.6;
    const minStepInterval = isRunning ? 260 : 380;
    const distMoved = currentPos.distanceTo(lastPos.current);

    if (isGrounded && isMoving && distMoved > minStepDist && now - lastEmitTime.current > minStepInterval) {
      lastEmitTime.current = now;
      lastPos.current.copy(currentPos);

      // Determine surface: Pier is around Z > 80, X > 65, Y < 4.5
      const isWood = currentPos.z > 80 && currentPos.x > 65 && currentPos.y < 4.5;
      const isStone = currentPos.y > 8.0 || (Math.abs(currentPos.x) < 22 && Math.abs(currentPos.z) < 28);
      const surface = isWood ? 'wood' : isStone ? 'stone' : 'grass';
      
      soundEngine.playFootstep(surface);

      // Spawn 2-3 dust puff particles
      for (let i = 0; i < 2; i++) {
        if (particles.current.length < MAX_PARTICLES) {
          particles.current.push({
            position: new THREE.Vector3(
              currentPos.x + (Math.random() - 0.5) * 0.4,
              currentPos.y + 0.08,
              currentPos.z + (Math.random() - 0.5) * 0.4
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.4,
              Math.random() * 0.5 + 0.2,
              (Math.random() - 0.5) * 0.4
            ),
            scale: Math.random() * 0.12 + 0.08,
            life: 0,
            maxLife: 0.45 + Math.random() * 0.2
          });
        }
      }
    }

    // Update active particles
    let activeCount = 0;
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }

      p.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= delta * 0.6; // gravity
      const progress = p.life / p.maxLife;
      const currentScale = p.scale * (1.0 - progress);

      dummy.position.copy(p.position);
      dummy.scale.set(currentScale, currentScale, currentScale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(activeCount, dummy.matrix);
      activeCount++;
    }

    // Hide remaining unused instances
    for (let i = activeCount; i < MAX_PARTICLES; i++) {
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#e5dfd0" transparent opacity={0.35} />
    </instancedMesh>
  );
};
