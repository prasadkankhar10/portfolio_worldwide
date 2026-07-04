import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const Sea: React.FC = () => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Load the model and extract the 'sea' node
  const { nodes } = useGLTF('./models/island_model.glb') as any;
  const seaNode = nodes['sea']; 
  
  // Load the normal map for realistic ripples
  const normalMap = useTexture('./textures/water_normal.jpg');
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  // Repeat the texture so it scales appropriately across the massive 100x scaled mesh
  normalMap.repeat.set(20 * 100, 20 * 100); 

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (normalMap) {
      // Slowly scroll the normal map texture diagonally to simulate water currents
      normalMap.offset.x = time * 0.05;
      normalMap.offset.y = time * 0.03;
    }
  });

  if (!seaNode) return null;

  return (
    <mesh 
      geometry={seaNode.geometry} 
      position={seaNode.position} 
      rotation={seaNode.rotation} 
      scale={[
        seaNode.scale.x * 100, 
        seaNode.scale.y, 
        seaNode.scale.z * 100
      ]}
    >
      <meshStandardMaterial 
        ref={materialRef}
        color="#006994" // Deep blue ocean base
        normalMap={normalMap}
        normalScale={new THREE.Vector2(1.5, 1.5)} // Enhance the ripple intensity
        transparent={true} 
        opacity={0.85}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
};

useGLTF.preload('./models/island_model.glb');
useTexture.preload('./textures/water_normal.jpg');
