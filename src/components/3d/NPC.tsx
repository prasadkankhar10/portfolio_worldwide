import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useRapier } from '@react-three/rapier';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { globalPlayerState } from './Character';

interface NPCProps {
  colorTint?: string;
  roleName?: string;
  startPosition?: THREE.Vector3;
  modelPath?: string;
}

export const NPC = ({ 
  colorTint, 
  startPosition, 
  roleName = "Wanderer",
  modelPath = '/models/Adventurer.glb' 
}: NPCProps) => {
  const { scene, animations } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const { world } = useRapier(); 
  
  // React state for the dialog box (only triggers ONCE when approached)
  const [isInteracting, setIsInteracting] = useState(false);
  
  // 1. CLONING SYSTEM
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  useMemo(() => {
    if (colorTint) {
      clone.traverse((node: any) => {
        if (node.isMesh && node.material) {
          node.material = node.material.clone();
          if (node.material.color) {
            node.material.color.lerp(new THREE.Color(colorTint), 0.5);
          }
        }
      });
    }
  }, [clone, colorTint]);

  const { actions } = useAnimations(animations, groupRef);

  // Animation Name Resolver (Searches the raw animations array safely)
  const anims = useMemo(() => {
    const hasAnim = (name: string) => animations.some(a => a.name === name);
    
    // Prefer Idle_Weapon if it exists (for the Cleric), otherwise normal Idle
    let idle = '';
    if (hasAnim('Idle_Weapon')) idle = 'Idle_Weapon';
    else if (hasAnim('Idle')) idle = 'Idle';
    else if (hasAnim('CharacterArmature|Idle')) idle = 'CharacterArmature|Idle';

    let walk = '';
    if (hasAnim('Walk')) walk = 'Walk';
    else if (hasAnim('CharacterArmature|Walk')) walk = 'CharacterArmature|Walk';

    let run = '';
    if (hasAnim('Run')) run = 'Run';
    else if (hasAnim('CharacterArmature|Run')) run = 'CharacterArmature|Run';

    let wave = '';
    if (hasAnim('Wave')) wave = 'Wave';
    else if (hasAnim('CharacterArmature|Wave')) wave = 'CharacterArmature|Wave';
    else if (hasAnim('Spell1')) wave = 'Spell1'; // Cleric greeting fallback
    
    // Failsafe so we never crash
    const first = animations.length > 0 ? animations[0].name : '';
    return {
      idle: idle || first,
      walk: walk || first,
      run: run || first,
      wave: wave || first,
    };
  }, [animations]);

  // 3. AI RAYCAST WANDERER BRAIN
  const stateRef = useRef<'THINKING' | 'WALKING' | 'ESCAPING' | 'INTERACTING'>('THINKING');
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  
  // Stuck Detection Variables (History Tracker)
  const historyPositions = useRef<THREE.Vector3[]>([]);
  const historyTimer = useRef(0);
  const escapeTimer = useRef(0);
  const interactTimer = useRef(0);

  // Initialize with dynamic idle animation safely
  const currentAnim = useRef('');
  
  const targetQuaternion = useRef(new THREE.Quaternion());
  const downDir = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useEffect(() => {
    if (anims.idle && !currentAnim.current) {
      currentAnim.current = anims.idle;
      actions[anims.idle]?.reset().fadeIn(0.2).play();
    }
  }, [anims.idle, actions]);

  // Wait a few frames for the scene to load before starting to wander
  const startupTimer = useRef(0);

  useFrame((rootState, delta) => {
    if (!groupRef.current || !currentAnim.current) return;

    if (startupTimer.current < 1.0) {
      startupTimer.current += delta;
      return;
    }

    const npcPos = groupRef.current.position;
    let nextAnim = currentAnim.current;
    let nextState = stateRef.current;

    // --- PROXIMITY SENSOR (PLAYER INTERACTION) ---
    const distToPlayer = npcPos.distanceTo(globalPlayerState.position);
    if (distToPlayer < 3.5) {
      if (stateRef.current !== 'INTERACTING') {
        nextState = 'INTERACTING';
        interactTimer.current = 0; // Reset interaction timer
        if (!isInteracting) setIsInteracting(true);
      }
    } else if (stateRef.current === 'INTERACTING') {
      nextState = 'THINKING';
      if (isInteracting) setIsInteracting(false);
    }

    // --- STUCK / PACING DETECTION SYSTEM (HISTORY TRACKER) ---
    if (stateRef.current === 'WALKING' || stateRef.current === 'ESCAPING') {
      historyTimer.current += delta;
      if (historyTimer.current > 1.0) { // Record position every 1 second
        historyTimer.current = 0;
        historyPositions.current.push(npcPos.clone());
        
        // Keep the last 6 seconds of history
        if (historyPositions.current.length > 6) {
          historyPositions.current.shift();
        }

        // If we have 6 seconds of history, check if we are trapped pacing in a small area
        if (historyPositions.current.length === 6) {
          const oldestPos = historyPositions.current[0];
          // Ignore Y height, only care if X/Z moved
          const p1 = new THREE.Vector2(npcPos.x, npcPos.z);
          const p2 = new THREE.Vector2(oldestPos.x, oldestPos.z);
          
          if (p1.distanceTo(p2) < 2.0) {
            // TELEPORT directly to the target as requested
            if (targetPosRef.current) {
               npcPos.copy(targetPosRef.current);
            }
            
            // Reset brain
            nextState = 'THINKING';
            targetPosRef.current = null;
            historyPositions.current = []; // Flush history
          }
        }
      }
    } else {
      historyPositions.current = []; // Reset history if thinking
    }

    // --- AI THINKING PHASE ---
    if (stateRef.current === 'THINKING') {
      const angle = Math.random() * Math.PI * 2;
      const dist = 5.0 + Math.random() * 15.0; 
      
      const testPos = new THREE.Vector3(
        npcPos.x + Math.cos(angle) * dist,
        100, // Cast from high up to find valid ground
        npcPos.z + Math.sin(angle) * dist
      );

      // 1. DOWNWARD RAYCAST (RAPIER)
      const ray = new RAPIER.Ray(testPos, downDir);
      const hit = world.castRay(ray, 200, true);
      
      if (hit && hit.timeOfImpact < 200) {
        const hitPoint = testPos.clone().add(downDir.clone().multiplyScalar(hit.timeOfImpact));
        targetPosRef.current = hitPoint;
        nextState = 'WALKING';
      }
    } 
    
    // --- AI INTERACTING PHASE ---
    if (stateRef.current === 'INTERACTING') {
      interactTimer.current += delta;
      
      // Turn to face the player smoothly
      const dirToPlayer = new THREE.Vector3().subVectors(globalPlayerState.position, npcPos);
      dirToPlayer.y = 0;
      if (dirToPlayer.lengthSq() > 0.001) {
        dirToPlayer.normalize();
        const angle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        targetQuaternion.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        groupRef.current.quaternion.slerp(targetQuaternion.current, 10 * delta);
      }
      
      // Wave for 2 seconds, then go to Idle
      if (interactTimer.current < 2.0 && anims.wave) {
        nextAnim = anims.wave;
      } else {
        nextAnim = anims.idle;
      }
    }
    // --- AI WALKING & ESCAPING PHASE ---
    else if ((stateRef.current === 'WALKING' || stateRef.current === 'ESCAPING') && targetPosRef.current) {
      const dirToTarget = new THREE.Vector3().subVectors(targetPosRef.current, npcPos);
      dirToTarget.y = 0; 
      const distToTarget = dirToTarget.length();
      
      if (distToTarget > 0.001) {
        dirToTarget.normalize();
      }

      // If we successfully escaped for 2 seconds
      if (stateRef.current === 'ESCAPING') {
        escapeTimer.current += delta;
        if (escapeTimer.current > 2.0) {
          nextState = 'THINKING';
        }
      }

      // 2. FORWARD RAYCAST (WHISKER SYSTEM FOR CORNER AVOIDANCE)
      const forwardRayOrigin = new THREE.Vector3(npcPos.x, npcPos.y + 1.0, npcPos.z);
      
      const leftDir = dirToTarget.clone().applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/6);
      const rightDir = dirToTarget.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/6);

      const forwardHit = world.castRay(new RAPIER.Ray(forwardRayOrigin, dirToTarget), 1.5, true);
      const leftHit = world.castRay(new RAPIER.Ray(forwardRayOrigin, leftDir), 1.0, true);
      const rightHit = world.castRay(new RAPIER.Ray(forwardRayOrigin, rightDir), 1.0, true);
      
      const isBlocked = (forwardHit && forwardHit.timeOfImpact < 1.5) || 
                        (leftHit && leftHit.timeOfImpact < 1.0) || 
                        (rightHit && rightHit.timeOfImpact < 1.0);

      if (isBlocked && stateRef.current !== 'ESCAPING') {
        nextState = 'THINKING';
        targetPosRef.current = null;
        nextAnim = anims.idle;
      } 
      else if (distToTarget < 1.0) {
        nextState = 'THINKING';
        targetPosRef.current = null;
        nextAnim = anims.idle;
      } else {
        // TURN TO FACE TARGET
        const angle = Math.atan2(dirToTarget.x, dirToTarget.z);
        targetQuaternion.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        groupRef.current.quaternion.slerp(targetQuaternion.current, 10 * delta);
        
        // MOVE FORWARD - Speed synced to exact Player values (4 = walk, 8 = run)
        const speed = stateRef.current === 'ESCAPING' ? 8.0 : 4.0;
        npcPos.addScaledVector(dirToTarget, speed * delta);
        
        // 3. TERRAIN SNAPPING (RAPIER)
        const snapRayOrigin = new THREE.Vector3(npcPos.x, npcPos.y + 2.0, npcPos.z);
        const snapRay = new RAPIER.Ray(snapRayOrigin, downDir);
        const snapHit = world.castRay(snapRay, 4.0, true);
        
        if (snapHit && snapHit.timeOfImpact < 4.0) {
          const hitY = snapRayOrigin.y - snapHit.timeOfImpact;
          npcPos.y = THREE.MathUtils.lerp(npcPos.y, hitY, 10 * delta);
        }
        
        nextAnim = stateRef.current === 'ESCAPING' ? anims.run : anims.walk;
      }
    }

    if (stateRef.current !== nextState) {
      stateRef.current = nextState;
    }

    if (currentAnim.current !== nextAnim) {
      actions[currentAnim.current]?.fadeOut(0.2);
      actions[nextAnim]?.reset().fadeIn(0.2).play();
      currentAnim.current = nextAnim;
    }
  });

  // Array of random fun greetings
  const greetings = useMemo(() => [
    "Hello traveler! Lovely day for exploring the island, isn't it?",
    "Hey there! Have you seen the windmill up the hill?",
    "Greetings! I'm just taking a walk to clear my mind.",
    "Hi! This island is full of hidden details if you look closely.",
    "Hey! Be careful near the cliffs, it's a long drop!"
  ], []);

  // Pick a random greeting when interacting starts
  const currentGreeting = useRef(greetings[0]);
  useEffect(() => {
    if (isInteracting) {
      currentGreeting.current = greetings[Math.floor(Math.random() * greetings.length)];
    }
  }, [isInteracting, greetings]);

  return (
    <group ref={groupRef} position={startPosition || new THREE.Vector3(0,0,0)}>
      <primitive object={clone} />

      {/* DIALOG BOX (Only renders when player is nearby and NPC is stopped) */}
      {/* Position elevated to 3.5 so it is cleanly above the NPC's head */}
      {isInteracting && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border-b-4 border-indigo-500 w-64 transform transition-all animate-in zoom-in duration-200 pointer-events-none">
            <p className="text-indigo-600 font-black text-sm mb-1 uppercase tracking-wider">{roleName}</p>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              "{currentGreeting.current}"
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-4 border-r-4 border-indigo-500 transform rotate-45"></div>
          </div>
        </Html>
      )}
    </group>
  );
};
