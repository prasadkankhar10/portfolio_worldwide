import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Sparkles, Cylinder, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const RitualCenter = () => {
  const activeRitual = useGameStore((state) => state.activeRitual);
  const ritualState = useGameStore((state) => state.ritualState);
  const setRitualState = useGameStore((state) => state.setRitualState);
  const setActiveRitual = useGameStore((state) => state.setActiveRitual);

  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const timer = useRef(0);

  // Position is at the center of the library courtyard
  const position = new THREE.Vector3(72, 0, -77);

  useFrame((state, delta) => {
    if (!activeRitual || !groupRef.current) return;

    timer.current += delta;

    if (ritualState === 'gathering') {
      // Wait for 10 seconds for NPCs to arrive at the triangle corners
      if (timer.current > 10.0) {
        setRitualState('channeling');
        timer.current = 0;
      }
    } else if (ritualState === 'channeling') {
      // The massive combined sphere grows for 8 seconds
      if (sphereRef.current) {
        const progress = Math.min(1.0, timer.current / 8.0);
        const scale = progress * 4.0; // Grows very large
        sphereRef.current.scale.setScalar(Math.max(0.01, scale));
        
        if (materialRef.current) {
           // Color shifts violently between arcane, holy, and dark
           const t = state.clock.elapsedTime * 5;
           const r = Math.sin(t) * 0.5 + 0.5;
           const g = Math.cos(t * 1.3) * 0.5 + 0.5;
           const b = Math.sin(t * 1.7) * 0.5 + 0.5;
           materialRef.current.color.setRGB(r, g, b);
        }
      }
      
      groupRef.current.rotation.y += delta;
      
      if (timer.current > 8.0) {
        setRitualState('climax');
        timer.current = 0;
      }
    } else if (ritualState === 'climax') {
      // Huge explosion effect that fades out quickly
      if (sphereRef.current) {
         sphereRef.current.scale.setScalar(4.0 + timer.current * 15.0);
         if (materialRef.current) {
            materialRef.current.opacity = Math.max(0, 1.0 - timer.current * 2.0);
         }
      }
      if (timer.current > 1.5) {
         setRitualState('idle');
         setActiveRitual(false);
         timer.current = 0;
      }
    }
  });

  // Reset timer if ritual is canceled externally
  useEffect(() => {
    if (!activeRitual) {
      timer.current = 0;
    }
  }, [activeRitual]);

  if (!activeRitual || ritualState === 'idle') return null;

  return (
    <group position={position} ref={groupRef}>
      {(ritualState === 'channeling' || ritualState === 'climax') && (
        <>
          <Sphere ref={sphereRef} args={[1, 32, 32]} position={[0, 3, 0]}>
            <meshBasicMaterial ref={materialRef} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
          </Sphere>
          
          {ritualState === 'channeling' && (
             <>
               <Torus args={[4, 0.1, 16, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
               </Torus>
               <Icosahedron args={[3, 1]} position={[0, 3, 0]}>
                 <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} blending={THREE.AdditiveBlending} />
               </Icosahedron>
               <Sparkles count={800} scale={10} size={15} speed={20} opacity={1} color="#ffffff" />
             </>
          )}
        </>
      )}
    </group>
  );
};
