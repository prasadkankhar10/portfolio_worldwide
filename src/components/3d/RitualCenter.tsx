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
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const pillarRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const shockwave2Ref = useRef<THREE.Mesh>(null);
  
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const pillarMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  
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
      const progress = Math.min(1.0, timer.current / 8.0);
      
      // Calculate dynamic color shifting
      const t = state.clock.elapsedTime * 8;
      const r = Math.sin(t) * 0.5 + 0.5;
      const g = Math.cos(t * 1.3) * 0.5 + 0.5;
      const b = Math.sin(t * 1.7) * 0.5 + 0.5;
      const color = new THREE.Color(r, g, b);

      if (sphereRef.current) {
        const scale = progress * 12.0; // Grows EXTREMELY large (radius 12)
        sphereRef.current.scale.setScalar(Math.max(0.01, scale));
        // Keep the bottom of the sphere roughly near the ground
        sphereRef.current.position.y = scale; 
        
        if (materialRef.current) {
           materialRef.current.color.copy(color);
           materialRef.current.opacity = 0.5 + (Math.sin(t * 3) * 0.2); // Pulsate opacity
        }
      }
      
      if (innerCoreRef.current) {
         innerCoreRef.current.scale.setScalar(Math.max(0.01, progress * 8.0));
         innerCoreRef.current.position.y = progress * 12.0;
         innerCoreRef.current.rotation.x += delta * 5;
         innerCoreRef.current.rotation.y += delta * 7;
      }
      
      if (pillarRef.current) {
         pillarRef.current.scale.set(progress * 15, 100, progress * 15);
         if (pillarMaterialRef.current) {
            pillarMaterialRef.current.color.copy(color);
            pillarMaterialRef.current.opacity = progress * 0.3;
         }
      }

      if (shockwaveRef.current) {
         // Expanding rings on the ground
         shockwaveRef.current.scale.setScalar(1.0 + (timer.current % 1.5) * 20.0);
         shockwaveRef.current.rotation.z += delta * 2;
      }
      if (shockwave2Ref.current) {
         shockwave2Ref.current.scale.setScalar(1.0 + ((timer.current + 0.75) % 1.5) * 20.0);
         shockwave2Ref.current.rotation.z -= delta * 2;
      }
      
      groupRef.current.rotation.y += delta * (1.0 + progress * 5.0); // Spin faster and faster
      
      if (timer.current > 8.0) {
        setRitualState('climax');
        timer.current = 0;
      }
    } else if (ritualState === 'climax') {
      // Huge explosion effect that fades out quickly
      const climaxProgress = timer.current / 2.0; // 2 seconds to fade out
      
      if (sphereRef.current) {
         // Explode outward massively!
         const blastScale = 12.0 + (climaxProgress * 80.0);
         sphereRef.current.scale.setScalar(blastScale);
         sphereRef.current.position.y = blastScale * 0.5;
         
         if (materialRef.current) {
            materialRef.current.opacity = Math.max(0, 1.0 - climaxProgress * 2.0); // Fade to white then out
            materialRef.current.color.setHex(0xffffff);
         }
      }
      
      if (innerCoreRef.current) {
          innerCoreRef.current.scale.setScalar(8.0 + (climaxProgress * 40.0));
      }

      if (pillarRef.current && pillarMaterialRef.current) {
         pillarRef.current.scale.set(15 + climaxProgress * 60, 100, 15 + climaxProgress * 60);
         pillarMaterialRef.current.opacity = Math.max(0, 0.8 - climaxProgress * 1.5);
         pillarMaterialRef.current.color.setHex(0xffffff);
      }
      
      if (shockwaveRef.current) {
          shockwaveRef.current.scale.setScalar(20.0 + climaxProgress * 100.0);
      }

      if (timer.current > 2.0) {
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
          {/* Main Giant Orb */}
          <Sphere ref={sphereRef} args={[1, 64, 64]} position={[0, 12, 0]}>
            <meshBasicMaterial ref={materialRef} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
          </Sphere>
          
          {/* Chaotic Inner Core */}
          <Icosahedron ref={innerCoreRef} args={[1, 2]} position={[0, 12, 0]}>
             <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
          </Icosahedron>
          
          {/* Massive Light Pillar */}
          <Cylinder ref={pillarRef} args={[1, 1, 100, 32]} position={[0, 50, 0]}>
             <meshBasicMaterial ref={pillarMaterialRef} color="#ffffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
          </Cylinder>
          
          {ritualState === 'channeling' && (
             <>
               {/* Ground Shockwaves */}
               <Torus ref={shockwaveRef} args={[1, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
               </Torus>
               <Torus ref={shockwave2Ref} args={[1, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.0, 0]}>
                 <meshBasicMaterial color="#ffffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
               </Torus>

               {/* Extreme Sparkles - More particles, larger area */}
               <Sparkles count={3000} scale={40} size={25} speed={40} opacity={1} color="#ffffff" />
             </>
          )}
        </>
      )}
    </group>
  );
};
