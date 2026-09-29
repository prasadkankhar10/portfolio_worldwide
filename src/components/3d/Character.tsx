import { useAnimations, useGLTF, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody, useRapier } from '@react-three/rapier';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { useControls } from 'leva';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ControlsType } from '../../App';
import { useGameStore } from '../../store/useGameStore';

export const globalPlayerState = {
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion()
};


// Static pre-allocated vectors to prevent GC allocations in useFrame
const _groundRay = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
const _cameraRay = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 });
const _charForwardVec = new THREE.Vector3(0, 0, -1);
const _moveDirection = new THREE.Vector3();
const _yawQuat = new THREE.Quaternion();
const _targetQuat = new THREE.Quaternion();
const _currentQuat = new THREE.Quaternion();
const _worldDirection = new THREE.Vector3();
const _headPosition = new THREE.Vector3();
const _baseLookAt = new THREE.Vector3();
const _rightVector = new THREE.Vector3(1, 0, 0);
const _shoulderOffset = new THREE.Vector3();
const _idealLookAt = new THREE.Vector3();
const _idealOffset = new THREE.Vector3();
const _rayOrigin = new THREE.Vector3();
const _rayDirection = new THREE.Vector3();
const _finalCameraPosition = new THREE.Vector3();
const _UP_AXIS = new THREE.Vector3(0, 1, 0);
const _groundOrigins = [
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
];

export const Character = () => {
  const { scene, animations } = useGLTF('./models/NPCs/Adventurer.glb');
  const { actions } = useAnimations(animations, scene);

  // Live Debugging Controls
  const {
    walkSpeed, runSpeed, rotationSpeed,
    jumpForce, gravityScale, rollThreshold,
    minPitch, maxPitch, cameraCollision
  } = useControls('Character Setup', {
    walkSpeed: { value: 3, min: 1, max: 20 },
    runSpeed: { value: 8, min: 1, max: 30 },
    rotationSpeed: { value: 10, min: 1, max: 50 },
    jumpForce: { value: 6, min: 1, max: 30 },
    gravityScale: { value: 2, min: 0.1, max: 10 },
    rollThreshold: { value: -10, min: -30, max: 0 },
    minPitch: { value: -Math.PI / 2 + 0.1, min: -Math.PI, max: 0 },
    maxPitch: { value: Math.PI / 2 - 0.1, min: 0, max: Math.PI },
    cameraCollision: { value: false, label: 'Camera Wall Collision' },
  });
  
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const characterRef = useRef<THREE.Group>(null);
  const { world } = useRapier();
  const gameState = useGameStore((state) => state.gameState);
  
  const cameraTarget = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const zoomDistance = useRef(12); // Increased default distance
  
  // AAA Camera Refs
  const bobTimer = useRef(0);
  const shakeIntensity = useRef(0);
  const wasGrounded = useRef(true);
  const prevVelY = useRef(0);
  const currentCameraDist = useRef(12);
  
  const [, get] = useKeyboardControls<ControlsType>();
  const [animation, setAnimation] = useState('CharacterArmature|Idle');

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false; // Performance optimization: disable real-time NPC shadows
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.2).play();
    return () => {
      actions[animation]?.fadeOut(0.2);
    };
  }, [animation, actions]);

  const isFreeCam = useGameStore((state) => state.isFreeCam);

  // Mouse input handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Ignore character mouse movement if free cam is active
      if (document.pointerLockElement && gameState === 'playing' && !isFreeCam) {
        yaw.current -= e.movementX * 0.002;
        pitch.current += e.movementY * 0.002; // Moving mouse up looks up (Non-inverted)
        pitch.current = Math.max(minPitch, Math.min(maxPitch, pitch.current));
      }
    };
    
    const handleWheel = (e: WheelEvent) => {
      if (document.pointerLockElement && gameState === 'playing' && !isFreeCam) {
        zoomDistance.current += e.deltaY * 0.01;
        zoomDistance.current = Math.max(2, Math.min(25, zoomDistance.current));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [gameState, isFreeCam, minPitch, maxPitch]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || !characterRef.current) return;

    // Handle instant magical teleportation (Arcane Waystones & Rift Portals)
    const teleportTarget = useGameStore.getState().teleportTarget;
    if (teleportTarget) {
      rigidBodyRef.current.setTranslation(teleportTarget, true);
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      useGameStore.getState().clearTeleportTarget();
      return;
    }

    // Freeze character input if Free Cam is active
    let { forward, back, left, right, run, jump } = get();
    
    // Merge Mobile Virtual Controls
    const { virtualJoystick, virtualButtons, virtualCameraDelta, setVirtualCameraDelta, isMobile } = useGameStore.getState();
    
    if (isMobile) {
      // Fixed: Joystick Y was inverted. Now pushing up (positive Y in react-joystick) = forward
      forward = forward || virtualJoystick.y > 0.1;
      back = back || virtualJoystick.y < -0.1;
      right = right || virtualJoystick.x > 0.1;
      left = left || virtualJoystick.x < -0.1;
      run = run || virtualButtons.run;
      jump = jump || virtualButtons.jump;
      
      // Apply virtual camera delta
      if (virtualCameraDelta.x !== 0 || virtualCameraDelta.y !== 0) {
        yaw.current -= virtualCameraDelta.x * 0.005; // Swipe left = look left
        pitch.current += virtualCameraDelta.y * 0.005; // Fixed: Swipe up = look up
        pitch.current = Math.max(minPitch, Math.min(maxPitch, pitch.current));
        // Reset delta after consumption
        setVirtualCameraDelta(0, 0);
      }
    }

    if (isFreeCam) {
      forward = back = left = right = run = jump = false;
    }

    const charTranslation = rigidBodyRef.current.translation();
    const playerCollider = rigidBodyRef.current.collider(0);

    // Fall protection: If player falls into the sea, respawn at Harbor Pier
    if (charTranslation.y < 1.0) {
      rigidBodyRef.current.setTranslation({ x: 109.45, y: 4.0, z: 133.0 }, true);
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    // 0. Robust Ground Detection (Center + 4 edges to prevent missing ground near walls)
    const yOffset = 0.1;
    const rayLength = 0.4;
    _groundOrigins[0].set(charTranslation.x, charTranslation.y + yOffset, charTranslation.z);
    _groundOrigins[1].set(charTranslation.x + 0.3, charTranslation.y + yOffset, charTranslation.z);
    _groundOrigins[2].set(charTranslation.x - 0.3, charTranslation.y + yOffset, charTranslation.z);
    _groundOrigins[3].set(charTranslation.x, charTranslation.y + yOffset, charTranslation.z + 0.3);
    _groundOrigins[4].set(charTranslation.x, charTranslation.y + yOffset, charTranslation.z - 0.3);

    let isGrounded = false;
    for (let i = 0; i < 5; i++) {
      _groundRay.origin.x = _groundOrigins[i].x;
      _groundRay.origin.y = _groundOrigins[i].y;
      _groundRay.origin.z = _groundOrigins[i].z;
      const hit = world.castRay(_groundRay, rayLength, true, undefined, undefined, playerCollider);
      if (hit !== null) {
        isGrounded = true;
        break;
      }
    }

    // Update HUD Coordinates natively without React re-renders
    const xEl = document.getElementById('hud-x');
    const yEl = document.getElementById('hud-y');
    const zEl = document.getElementById('hud-z');
    const dirEl = document.getElementById('hud-dir');
    if (xEl && yEl && zEl) {
      xEl.innerText = charTranslation.x.toFixed(1);
      yEl.innerText = charTranslation.y.toFixed(1);
      zEl.innerText = charTranslation.z.toFixed(1);
    }
    if (dirEl && state.camera) {
      const forwardVec = _charForwardVec.set(0, 0, -1).applyQuaternion(state.camera.quaternion);
      const angle = Math.atan2(forwardVec.x, forwardVec.z);
      let dir = 'N';
      if (angle >= -Math.PI/4 && angle < Math.PI/4) dir = 'S';
      else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) dir = 'E';
      else if (angle >= -3*Math.PI/4 && angle < -Math.PI/4) dir = 'W';
      dirEl.innerText = dir;
    }
    
    // Export real-time position and rotation for NPCs
    globalPlayerState.position.set(charTranslation.x, charTranslation.y, charTranslation.z);
    if (characterRef.current) {
      globalPlayerState.quaternion.copy(characterRef.current.quaternion);
    }

    // 1. Calculate Movement relative to Camera Yaw
    const moveDirection = _moveDirection.set(0, 0, 0);
    if (forward) moveDirection.z -= 1;
    if (back) moveDirection.z += 1;
    if (left) moveDirection.x -= 1;
    if (right) moveDirection.x += 1;

    const isMoving = moveDirection.lengthSq() > 0;
    const speed = run ? runSpeed : walkSpeed;

    let nextAnimation = 'CharacterArmature|Idle';
    if (isMoving) {
      nextAnimation = run ? 'CharacterArmature|Run' : 'CharacterArmature|Walk';
      moveDirection.normalize();

      // Apply camera yaw to movement
      _yawQuat.setFromAxisAngle(_UP_AXIS, yaw.current);
      const worldDirection = _worldDirection.copy(moveDirection).applyQuaternion(_yawQuat);

      const velocity = rigidBodyRef.current.linvel();
      
      // Apply jump force if grounded
      let newY = velocity.y;
      if (jump && isGrounded) {
        newY = jumpForce;
      }

      rigidBodyRef.current.setLinvel({
        x: worldDirection.x * speed,
        y: newY,
        z: worldDirection.z * speed
      }, true);

      // Rotate character to face movement direction smoothly
      const targetRotation = Math.atan2(worldDirection.x, worldDirection.z);
      _currentQuat.copy(characterRef.current.quaternion);
      _targetQuat.setFromAxisAngle(_UP_AXIS, targetRotation);
      characterRef.current.quaternion.slerpQuaternions(_currentQuat, _targetQuat, rotationSpeed * delta);
    } else {
      const velocity = rigidBodyRef.current.linvel();
      let newY = velocity.y;
      if (jump && isGrounded) {
        newY = jumpForce;
      }
      rigidBodyRef.current.setLinvel({ x: 0, y: newY, z: 0 }, true);
    }

    // Use Roll animation only for big jumps/falls
    if (!isGrounded) {
      const velocity = rigidBodyRef.current.linvel();
      if (velocity.y < rollThreshold) { 
        nextAnimation = 'CharacterArmature|Roll';
      }
    }

    if (nextAnimation !== animation) {
      setAnimation(nextAnimation);
    }

    // --- ONLY UPDATE CAMERA IF FREE CAM IS NOT ACTIVE ---
    if (!isFreeCam) {
      // 2. Camera System Update
      const headPosition = _headPosition.set(charTranslation.x, charTranslation.y + 1.5, charTranslation.z);
      
      // Smooth target follow (Spring/Lerp)
      cameraTarget.current.lerp(headPosition, 10 * delta);

      // AAA: Update previous velocity and grounded state tracking
      const currentVelY = rigidBodyRef.current.linvel().y;
      if (isGrounded && !wasGrounded.current && prevVelY.current < -12) {
        shakeIntensity.current = Math.min(0.8, Math.abs(prevVelY.current) / 30);
      }
      wasGrounded.current = isGrounded;
      prevVelY.current = currentVelY;

      // 3. Update Camera Position & LookAt
      const baseLookAt = _baseLookAt.set(0, 1.5, 0).applyMatrix4(characterRef.current.matrixWorld);
      
      // AAA: Over-the-shoulder offset (1 unit to the right of the camera's yaw)
      const rightVector = _rightVector.set(1, 0, 0).applyAxisAngle(_UP_AXIS, yaw.current);
      const shoulderOffset = _shoulderOffset.copy(rightVector).multiplyScalar(1.2);
      
      // AAA: Camera Bobbing when moving on ground
      if (isGrounded && isMoving) {
        bobTimer.current += delta * (run ? 15 : 10);
      } else if (isGrounded && !isMoving) {
        // Gently return to 0 when stopped
        bobTimer.current = THREE.MathUtils.lerp(bobTimer.current, 0, delta * 5);
      }
      const bobOffset = Math.sin(bobTimer.current) * (run ? 0.08 : 0.04);
      
      // AAA: Screen Shake
      let shakeOffset = 0;
      if (shakeIntensity.current > 0) {
        shakeOffset = (Math.random() - 0.5) * 0.5 * shakeIntensity.current;
        shakeIntensity.current = Math.max(0, shakeIntensity.current - delta * 3);
      }

      const idealLookAt = _idealLookAt.copy(baseLookAt).add(shoulderOffset);
      idealLookAt.y += bobOffset + shakeOffset;
      
      // Calculate spherical coordinates for camera position
      const radius = zoomDistance.current;
      const x = radius * Math.cos(pitch.current) * Math.sin(yaw.current);
      const y = radius * Math.sin(pitch.current);
      const z = radius * Math.cos(pitch.current) * Math.cos(yaw.current);
      const idealOffset = _idealOffset.set(x, y, z);
      
      const rayOrigin = _rayOrigin.copy(idealLookAt);
      const rayDirection = _rayDirection.copy(idealOffset).normalize();
      const maxRayDistance = radius;

      let targetCameraDist = maxRayDistance;

      if (cameraCollision) {
        _cameraRay.origin.x = rayOrigin.x;
        _cameraRay.origin.y = rayOrigin.y;
        _cameraRay.origin.z = rayOrigin.z;
        _cameraRay.dir.x = rayDirection.x;
        _cameraRay.dir.y = rayDirection.y;
        _cameraRay.dir.z = rayDirection.z;

        const hit = world.castRay(
          _cameraRay,
          maxRayDistance,
          true,
          undefined,
          undefined,
          playerCollider
        );

        if (hit && hit.timeOfImpact < maxRayDistance) {
          targetCameraDist = Math.max(0.5, hit.timeOfImpact - 0.2);
        }

        if (targetCameraDist < currentCameraDist.current) {
          currentCameraDist.current = targetCameraDist;
        } else {
          currentCameraDist.current = THREE.MathUtils.lerp(currentCameraDist.current, targetCameraDist, Math.min(1, 5 * delta));
        }
      } else {
        currentCameraDist.current = THREE.MathUtils.lerp(currentCameraDist.current, targetCameraDist, Math.min(1, 8 * delta));
      }

      const finalCameraPosition = _finalCameraPosition.copy(rayOrigin).addScaledVector(rayDirection, currentCameraDist.current);

      // Smooth camera lag
      cameraPosition.current.lerp(finalCameraPosition, Math.min(1, 10 * delta));
      cameraTarget.current.copy(idealLookAt); // Instant lookat tracking to prevent pan wobble
      
      state.camera.position.copy(cameraPosition.current);
      state.camera.lookAt(cameraTarget.current);

      // 4. Dynamic FOV
      const perspectiveCamera = state.camera as THREE.PerspectiveCamera;
      const targetFov = (isMoving && run) ? 75 : 60;
      perspectiveCamera.fov = THREE.MathUtils.lerp(perspectiveCamera.fov, targetFov, Math.min(1, 5 * delta));
      perspectiveCamera.updateProjectionMatrix();
    }
  });

  return (
    <RigidBody 
      ref={rigidBodyRef} 
      colliders={false} 
      type="dynamic" 
      position={[109.45, 4.0, 133.0]} 
      enabledRotations={[false, false, false]} 
      gravityScale={gravityScale}
    >
      <CapsuleCollider 
        args={[0.5, 0.4]} 
        position={[0, 0.9, 0]} 
        friction={0} 
        frictionCombineRule={RAPIER.CoefficientCombineRule.Min}
        restitution={0} 
      />
      <group ref={characterRef}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  );
};

useGLTF.preload('./models/NPCs/Adventurer.glb');
