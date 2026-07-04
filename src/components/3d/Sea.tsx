import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SeaProps {
  position?: [number, number, number];
}

// Helper to generate a stylized wave texture in code!
const generateWaveTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep Blue Base
  ctx.fillStyle = '#005f8c';
  ctx.fillRect(0, 0, 512, 512);

  // Stylized wave lines (light cyan)
  ctx.strokeStyle = '#008bbf';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  // Draw 80 random wave swooshes
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const width = 30 + Math.random() * 50;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + width / 2, y - 15, x + width, y);
    ctx.stroke();
    
    // Draw duplicate on the edges for seamless tiling
    if (x + width > 512) {
      ctx.beginPath();
      ctx.moveTo(x - 512, y);
      ctx.quadraticCurveTo((x - 512) + width / 2, y - 15, (x - 512) + width, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Repeat the texture many times across the massive 1000x1000 block
  texture.repeat.set(20, 20); 
  return texture;
};

export const Sea: React.FC<SeaProps> = ({ position = [0, -25, 0] }) => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const waveTexture = useMemo(() => generateWaveTexture(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (waveTexture) {
      // Slowly scroll the texture diagonally to simulate water currents
      waveTexture.offset.x = time * 0.05;
      waveTexture.offset.y = time * 0.03;
    }
  });

  return (
    <mesh position={new THREE.Vector3(...position)}>
      {/* Massive Solid Block: 1000 width, 50 depth, 1000 height */}
      <boxGeometry args={[1000, 50, 1000]} />
      <meshStandardMaterial 
        ref={materialRef}
        map={waveTexture}
        color="#008bbf" // Slightly tint the whole block
        transparent={true} 
        opacity={0.9}
        roughness={0.1}
        metalness={0.4}
      />
    </mesh>
  );
};
