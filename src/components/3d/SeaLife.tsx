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
  
    const getRandomOuterPosition = () => {
      // Vast oceanic spawning area (radius 150 to 800)
      const angle = Math.random() * Math.PI * 2;
      const radius = 150 + Math.random() * 650;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        -15 + Math.random() * 8, // Swim between y = -15 and -7
        Math.sin(angle) * radius
      );
    };

    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: getRandomOuterPosition(),
        velocity: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        target: getRandomOuterPosition(),
        speed: 0.1 + Math.random() * 0.2, 
        turnSpeed: 0.01 + Math.random() * 0.02, 
        color: new THREE.Color(FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)]),
        // Jumping State
        isJumping: false,
        yVelocity: 0,
        jumpPhase: Math.random() * Math.PI * 2 // Random starting phase for swimming wobble
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

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    fishData.forEach((fish, i) => {
      
      // -- JUMPING PHYSICS --
      if (fish.isJumping) {
        // Apply Gravity
        fish.yVelocity -= 15.0 * delta; // Gravity strength
        fish.position.y += fish.yVelocity * delta;
        
        // Move forward slightly while in the air
        fish.position.addScaledVector(fish.velocity, fish.speed * 1.5);
        
        // Check if splashed back down
        if (fish.position.y < -3.0 && fish.yVelocity < 0) {
          fish.isJumping = false;
          fish.position.y = -5.0 - Math.random() * 10; // Reset depth
          fish.yVelocity = 0;
        }
      } else {
        // -- SWIMMING LOGIC --
        // Random chance to trigger a jump!
        if (Math.random() < 0.001) {
          fish.isJumping = true;
          fish.yVelocity = 10.0 + Math.random() * 5.0; // Burst upwards
          // When jumping, aim slightly upwards
          fish.position.y = -2.0; 
        }
        
        // 1. Waypoint Logic (Get a new target in the outer ocean)
        if (fish.position.distanceTo(fish.target) < 15) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 150 + Math.random() * 650;
          fish.target.set(
            Math.cos(angle) * radius,
            -15 + Math.random() * 8,
            Math.sin(angle) * radius
          );
        }
        
        // 2. Advanced Steering
        _dir.subVectors(fish.target, fish.position).normalize();
        
        fish.velocity.lerp(_dir, fish.turnSpeed).normalize();
        fish.position.addScaledVector(fish.velocity, fish.speed);
      }
      
      const bankAngle = fish.velocity.clone().cross(_dir).y;
      
      // 3. Apply transformations to dummy object
      _dummy.position.copy(fish.position);
      
      // Look where it's going (horizontal trajectory)
      const lookAtTarget = fish.position.clone().add(new THREE.Vector3(fish.velocity.x, 0, fish.velocity.z));
      _dummy.lookAt(lookAtTarget);
      
      if (fish.isJumping) {
        // Point Nose Up/Down based on parabolic arc
        const pitchAngle = Math.atan2(fish.yVelocity, fish.speed * 1.5);
        _dummy.rotateX(-pitchAngle); 
        
        // Barrel roll flip!
        _dummy.rotateZ(time * 15.0);
      } else {
        // Bank/Roll into the horizontal turns!
        _dummy.rotateZ(bankAngle * 5.0); 
        
        // Swimming tail-kick wobble (yaw)
        const wobble = Math.sin(time * 15.0 + fish.jumpPhase) * 0.15;
        _dummy.rotateY(wobble);
      }
      
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
