import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FISH_COLORS = [
  '#ff7b00', // Tropical Orange
  '#00ffcc', // Cyan
  '#ffea00', // Yellow
  '#ff0055', // Pinkish Red
  '#9d00ff'  // Deep Purple
];

export const SeaLife = ({ count = 50 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _dummy = useMemo(() => new THREE.Object3D(), []);
  
  const fishData = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 400,
          -15 + Math.random() * 8, // Swim between y = -15 and -7
          (Math.random() - 0.5) * 400
        ),
        velocity: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        target: new THREE.Vector3(
          (Math.random() - 0.5) * 400,
          -15 + Math.random() * 8,
          (Math.random() - 0.5) * 400
        ),
        speed: 0.1 + Math.random() * 0.15, 
        turnSpeed: 0.01 + Math.random() * 0.02, 
        color: new THREE.Color(FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)])
      });
    }
    return temp;
  }, [count]);

  const fishGeo = useMemo(() => {
    // A cone makes a perfect low-poly fish shape!
    const geo = new THREE.ConeGeometry(0.3, 1.5, 4);
    // Rotate so it points forward along the Z axis
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  useEffect(() => {
    if (meshRef.current) {
      fishData.forEach((fish, i) => {
        meshRef.current!.setColorAt(i, fish.color);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [fishData]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    fishData.forEach((fish, i) => {
      // 1. Waypoint Logic
      if (fish.position.distanceTo(fish.target) < 15) {
        fish.target.set(
          (Math.random() - 0.5) * 400,
          -15 + Math.random() * 8,
          (Math.random() - 0.5) * 400
        );
      }
      
      // 2. Advanced Steering
      _dir.subVectors(fish.target, fish.position).normalize();
      const bankAngle = fish.velocity.clone().cross(_dir).y;
      
      fish.velocity.lerp(_dir, fish.turnSpeed).normalize();
      fish.position.addScaledVector(fish.velocity, fish.speed);
      
      // 3. Apply transformations to dummy object
      _dummy.position.copy(fish.position);
      
      // Look where it's going
      const lookAtTarget = fish.position.clone().add(fish.velocity);
      _dummy.lookAt(lookAtTarget);
      
      // Bank/Roll into the turn!
      _dummy.rotateZ(bankAngle * 5.0); 
      
      _dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, _dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[fishGeo, undefined, count]}>
      <meshStandardMaterial flatShading={true} roughness={0.2} metalness={0.1} />
    </instancedMesh>
  );
};
