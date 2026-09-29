import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const Sea: React.FC = () => {
  // Load the normal map for realistic ripples
  const normalMap = useTexture('./textures/water_normal.jpg');
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(20, 20); 

  // Clone texture for the massive outer ocean so we can tile it differently
  const outerNormalMap = useMemo(() => {
    const tex = normalMap.clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(250, 250); // Tile much more for the 2000m ring
    return tex;
  }, [normalMap]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (normalMap) {
      normalMap.offset.x = time * 0.05;
      normalMap.offset.y = time * 0.03;
      
      outerNormalMap.offset.x = time * 0.05;
      outerNormalMap.offset.y = time * 0.03;
    }
  });

  return (
    <group>
      {/* Infinite Horizon Ocean (Outer Ring) */}
      <mesh 
        position={[0, 1.9, 0]} // Seamlessly beneath shoreline elevation to prevent z-fighting
        rotation={[-Math.PI / 2, 0, 0]} 
      >
        <planeGeometry args={[4000, 4000]} /> 
        <meshStandardMaterial 
          color="#006994"
          normalMap={outerNormalMap}
          normalScale={new THREE.Vector2(1.5, 1.5)}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

useTexture.preload('./textures/water_normal.jpg');

