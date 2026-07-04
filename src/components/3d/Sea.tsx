import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SeaProps {
  position?: [number, number, number];
}

export const Sea: React.FC<SeaProps> = ({ position = [0, -1, 0] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Store initial vertex positions to calculate waves relative to the original flat shape
  const { geometry, positions, initialPositions } = useMemo(() => {
    // 1000x1000 size, 32x32 segments (drastically reduced for chunkier, distinct triangles)
    const geom = new THREE.PlaneGeometry(1000, 1000, 32, 32);
    geom.rotateX(-Math.PI / 2); // Lay flat
    
    const pos = geom.attributes.position;
    const initPos = new Float32Array(pos.count * 3);
    
    // Copy the flat positions to serve as a baseline for the wave math
    for (let i = 0; i < pos.count; i++) {
      initPos[i * 3] = pos.getX(i);
      initPos[i * 3 + 1] = pos.getY(i);
      initPos[i * 3 + 2] = pos.getZ(i);
    }
    
    return { geometry: geom, positions: pos, initialPositions: initPos };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      for (let i = 0; i < positions.count; i++) {
        const x = initialPositions[i * 3];
        const z = initialPositions[i * 3 + 2];
        
        // Complex wave math - drastically increased amplitude for distinct low-poly look
        const wave1 = Math.sin(x * 0.05 + time) * 3.0;
        const wave2 = Math.cos(z * 0.05 + time * 0.8) * 3.0;
        const wave3 = Math.sin((x + z) * 0.02 - time * 1.2) * 2.5;
        
        // Apply height (Y-axis)
        positions.setY(i, initialPositions[i * 3 + 1] + wave1 + wave2 + wave3);
      }
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals(); // Crucial for dynamic flat shading catching the light
    }
  });

  return (
    <mesh ref={meshRef} position={new THREE.Vector3(...position)} geometry={geometry}>
      <meshStandardMaterial 
        color="#006994" 
        flatShading={true} 
        transparent={true} 
        opacity={0.8}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
};
