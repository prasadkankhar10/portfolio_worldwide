import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Birds = ({ count = 50 }) => {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const leftWingRef = useRef<THREE.InstancedMesh>(null);
  const rightWingRef = useRef<THREE.InstancedMesh>(null);
  
  // Reusable vectors to prevent Garbage Collection stutters
  const _dir = useMemo(() => new THREE.Vector3(), []);
  const _lookTarget = useMemo(() => new THREE.Vector3(), []);
  
  const skeleton = useMemo(() => {
    const root = new THREE.Object3D();
    
    const leftPivot = new THREE.Object3D();
    leftPivot.position.set(0.15, 0, 0); 
    const leftWing = new THREE.Object3D();
    leftWing.position.set(1.25, 0, 0); 
    leftPivot.add(leftWing);
    root.add(leftPivot);
    
    const rightPivot = new THREE.Object3D();
    rightPivot.position.set(-0.15, 0, 0); 
    const rightWing = new THREE.Object3D();
    rightWing.position.set(-1.25, 0, 0); 
    rightPivot.add(rightWing);
    root.add(rightPivot);
    
    return { root, leftPivot, rightPivot, leftWing, rightWing };
  }, []);

  // Initialize wandering birds
  const birds = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 400,
          60 + Math.random() * 50,
          (Math.random() - 0.5) * 400
        ),
        velocity: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        target: new THREE.Vector3(
          (Math.random() - 0.5) * 400,
          60 + Math.random() * 50,
          (Math.random() - 0.5) * 400
        ),
        speed: 0.15 + Math.random() * 0.2, 
        turnSpeed: 0.005 + Math.random() * 0.015, // How fast they can turn
        flapSpeed: 10 + Math.random() * 10,
        yOffset: Math.random() * Math.PI * 2, 
      });
    }
    return temp;
  }, [count]);

  const bodyGeo = useMemo(() => {
    const geo = new THREE.CapsuleGeometry(0.2, 1.0, 4, 8);
    geo.rotateX(Math.PI / 2); 
    return geo;
  }, []);

  const wingGeo = useMemo(() => {
    const geo = new THREE.BoxGeometry(2.5, 0.05, 0.8);
    geo.translate(0, 0, 0.2); 
    return geo;
  }, []);

  useFrame((state) => {
    if (!bodyRef.current || !leftWingRef.current || !rightWingRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    birds.forEach((bird, i) => {
      // 1. Waypoint Logic: If close to target, pick a new random target in the sky
      if (bird.position.distanceTo(bird.target) < 30) {
        bird.target.set(
          (Math.random() - 0.5) * 500, // Wide X spread
          50 + Math.random() * 80,     // High altitude
          (Math.random() - 0.5) * 500  // Wide Z spread
        );
      }
      
      // 2. Advanced Steering: Calculate direction to target
      _dir.subVectors(bird.target, bird.position).normalize();
      
      // 3. Dynamic Banking: Calculate how sharply the bird is turning to reach its target
      // The cross product Y axis gives us a perfectly accurate banking angle!
      const bankAngle = bird.velocity.clone().cross(_dir).y;
      
      // Steer the velocity vector smoothly towards the target direction
      bird.velocity.lerp(_dir, bird.turnSpeed).normalize();
      
      // Move the bird forward
      bird.position.addScaledVector(bird.velocity, bird.speed);
      
      // Add slight aerodynamic bobbing for visual realism
      const renderY = bird.position.y + Math.sin(time * 3 + bird.yOffset) * 2; 
      
      skeleton.root.position.set(bird.position.x, renderY, bird.position.z);
      
      // Point the bird exactly where its velocity is carrying it
      _lookTarget.copy(bird.position).add(bird.velocity);
      skeleton.root.lookAt(_lookTarget.x, renderY + bird.velocity.y, _lookTarget.z);
      
      // Apply the dynamic aerodynamic banking we calculated earlier!
      skeleton.root.rotateZ(bankAngle * 10.0); 
      
      // Mechanical Flap Algorithm
      const flap = Math.sin(time * bird.flapSpeed + bird.yOffset) * 0.6;
      skeleton.leftPivot.rotation.z = flap;
      skeleton.rightPivot.rotation.z = -flap; 
      
      skeleton.root.updateMatrixWorld(true);
      
      bodyRef.current!.setMatrixAt(i, skeleton.root.matrixWorld);
      leftWingRef.current!.setMatrixAt(i, skeleton.leftWing.matrixWorld);
      rightWingRef.current!.setMatrixAt(i, skeleton.rightWing.matrixWorld);
    });
    
    bodyRef.current.instanceMatrix.needsUpdate = true;
    leftWingRef.current.instanceMatrix.needsUpdate = true;
    rightWingRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodyRef} args={[bodyGeo, undefined, count]}>
        <meshBasicMaterial color="#1a1a1a" />
      </instancedMesh>
      
      <instancedMesh ref={leftWingRef} args={[wingGeo, undefined, count]}>
        <meshBasicMaterial color="#1a1a1a" />
      </instancedMesh>
      
      <instancedMesh ref={rightWingRef} args={[wingGeo, undefined, count]}>
        <meshBasicMaterial color="#1a1a1a" />
      </instancedMesh>
    </group>
  );
};
