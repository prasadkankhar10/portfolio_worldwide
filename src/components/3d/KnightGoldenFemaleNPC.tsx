import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SpellEffect } from './SpellEffect';
import { SkeletonUtils } from 'three-stdlib';
import { useRapier } from '@react-three/rapier';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';

interface KnightGoldenFemaleNPCProps {
  colorTint?: string;
  roleName?: string;
  startPosition?: THREE.Vector3;
  maxWanderRadius?: number;
  dialogId?: string;
  startState?: 'THINKING' | 'SPARRING';
  sparringRole?: 'ATTACKER' | 'DEFENDER' | 'NONE';
}

export const KnightGoldenFemaleNPC = ({ 
  colorTint, 
  startPosition, 
  roleName = "Knight Golden Female",
  maxWanderRadius,
  dialogId
,
  startState = "THINKING",
  sparringRole = "NONE"}: KnightGoldenFemaleNPCProps) => {
  const { scene, animations } = useGLTF('./models/NPCs/Knight_Golden_Female.glb');
  const containerRef = useRef<THREE.Group>(null);
  const spellEffectGroupRef = useRef<THREE.Group>(null);
  const swordEffectGroupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const meshGroupRef = useRef<THREE.Group>(null);
  const { world } = useRapier(); 
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasShownDialog, setHasShownDialog] = useState(false);
  const startPosRef = useRef<THREE.Vector3 | null>(null);
  
  const setActiveDialog = useGameStore(state => state.setActiveDialog);
  const activeDialogNpcId = useGameStore(state => state.activeDialogNpcId);
  const setActiveOutlineMesh = useGameStore(state => state.setActiveOutlineMesh);
  const npcId = useMemo(() => Math.random().toString(), []);

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  
  useEffect(() => {
    if (isInteracting && dialogId && !activeDialogNpcId && !hasShownDialog) {
       setActiveDialog(dialogId, npcId);
       setHasShownDialog(true);
    } else if (!isInteracting) {
       if (activeDialogNpcId === npcId) {
         setActiveDialog(null);
       }
       setHasShownDialog(false);
    }

    if (isInteracting && meshGroupRef.current) {
      setActiveOutlineMesh(meshGroupRef.current);
    } else if (!isInteracting) {
      if (useGameStore.getState().activeOutlineMesh === meshGroupRef.current) {
        setActiveOutlineMesh(null);
      }
    }
  }, [isInteracting, dialogId, activeDialogNpcId, setActiveDialog, npcId, hasShownDialog, setActiveOutlineMesh]);
  
  useEffect(() => {
    if (containerRef.current && startPosition) {
      containerRef.current.position.copy(startPosition);
      startPosRef.current = startPosition.clone();
    } else if (containerRef.current) {
      startPosRef.current = containerRef.current.position.clone();
    }
  }, []);

  const { actions } = useAnimations(animations, modelRef);

  // Dynamic animation resolver (Fixes missing animations)
  const anims = useMemo(() => {
    const getAnim = (names: string[]) => {
      for (const n of names) {
        const found = animations.find(a => a.name.toLowerCase() === n || a.name.toLowerCase().includes(n));
        if (found) return found.name;
      }
      return animations.length > 0 ? animations[0].name : '';
    };
    
    return { 
      idle: getAnim(['idle_weapon', 'idle', 'characterarmature|idle']), 
      walk: getAnim(['walk', 'characterarmature|walk']), 
      run: getAnim(['run', 'characterarmature|run', 'fastrun', 'sprint']), 
      swordSlash: getAnim(['swordslash', 'attack', 'punch']),
      roll: getAnim(['roll', 'recievehit']),
      shoot: getAnim(['shoot_onehanded']),
      wave: getAnim(['victory', 'wave', 'spell', 'characterarmature|wave', 'attack', 'cheer']) 
    };
  }, [animations]);

  const stateRef = useRef<'THINKING' | 'WALKING' | 'INTERACTING' | 'SUMMONED' | 'ESCAPING' | 'WALKING_TO_WAYPOINT' | 'SPARRING'>(startState);
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  
  const historyPositions = useRef<THREE.Vector3[]>([]);
  const historyTimer = useRef(0);
  const escapeTimer = useRef(0);
  const interactTimer = useRef(0);
  const idleTimer = useRef(0);
  const failedTargetCount = useRef(0);

  const currentAnim = useRef('');
  const targetQuaternion = useRef(new THREE.Quaternion());
  const downDir = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useEffect(() => {
    if (anims.idle && !currentAnim.current) {
      currentAnim.current = anims.idle;
      actions[anims.idle]?.reset().fadeIn(0.2).play();
    }
  }, [anims.idle, actions]);

  const startupTimer = useRef(0);

  useFrame((rootState, delta) => {
    if (!containerRef.current || !currentAnim.current) return;
    if (startupTimer.current < 1.0) { startupTimer.current += delta; return; }

    const npcPos = containerRef.current.position;
    let nextAnim = currentAnim.current;
    let nextState = stateRef.current;

    
    const store = useGameStore.getState();
    const isSummonedTarget = store.summonedNpcRole === roleName;
    
    if (isSummonedTarget && stateRef.current !== 'SUMMONED' && stateRef.current !== 'INTERACTING') {
      nextState = 'SUMMONED';
      targetPosRef.current = globalPlayerState.position.clone();
      if (isInteracting) setIsInteracting(false);
    }
    
    if (stateRef.current === 'SUMMONED') {
      // Dynamically chase the player
      targetPosRef.current = globalPlayerState.position.clone();
      
      const distToPlayer = npcPos.distanceTo(globalPlayerState.position);
      if (distToPlayer < 3.5) {
        nextState = 'INTERACTING';
        targetPosRef.current = null;
        store.summonNpc(null); // Clear the summon beacon
        if (!isInteracting) setIsInteracting(true);
      }
    }
     // --- SPARRING BEHAVIOR ---
     if (stateRef.current === 'SPARRING') {
       const distToPlayerSparring = npcPos.distanceTo(globalPlayerState.position);
       if (distToPlayerSparring < 3.5) {
         nextState = 'INTERACTING';
         interactTimer.current = 0;
         targetPosRef.current = null;
         if (!isInteracting) setIsInteracting(true);
       } else {
         idleTimer.current += delta;
         
         // Rotate to face the center of the sparring area
         const centerPoint = new THREE.Vector3(-60, npcPos.y, 74);
         const vecToCenter = new THREE.Vector3().subVectors(centerPoint, npcPos);
         vecToCenter.y = 0;
         
         const distToCenter = vecToCenter.length();
         const dirToCenter = vecToCenter.clone();
         if (distToCenter > 0.001) {
           dirToCenter.normalize();
           const angle = Math.atan2(dirToCenter.x, dirToCenter.z);
           targetQuaternion.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
           containerRef.current.quaternion.slerp(targetQuaternion.current, 10 * delta);
         }
         
         // 4-stage Sword + Magic Duel cycle (8 seconds total, 2 seconds per stage)
         const cycle = idleTimer.current % 8.0;
         let targetDist = 2.0; // default distance from center
         
         if (sparringRole === 'ATTACKER') {
           if (cycle < 2.0) {
             nextAnim = anims.swordSlash || anims.idle;
             targetDist = 1.0;
           } else if (cycle >= 2.0 && cycle < 4.0) {
             nextAnim = (cycle > 2.4 && cycle < 3.6) ? (anims.roll || anims.idle) : anims.idle;
             if (cycle > 2.4 && cycle < 3.6) targetDist = 3.5;
           } else if (cycle >= 4.0 && cycle < 6.0) {
             nextAnim = anims.shoot || anims.swordSlash || anims.idle;
           } else {
             nextAnim = (cycle > 6.4 && cycle < 7.6) ? (anims.roll || anims.idle) : anims.idle;
             if (cycle > 6.4 && cycle < 7.6) targetDist = 3.5;
           }
         } else if (sparringRole === 'DEFENDER') {
           if (cycle < 2.0) {
             nextAnim = (cycle > 0.4 && cycle < 1.6) ? (anims.roll || anims.idle) : anims.idle;
             if (cycle > 0.4 && cycle < 1.6) targetDist = 3.5;
           } else if (cycle >= 2.0 && cycle < 4.0) {
             nextAnim = anims.swordSlash || anims.idle;
             targetDist = 1.0;
           } else if (cycle >= 4.0 && cycle < 6.0) {
             nextAnim = (cycle > 4.4 && cycle < 5.6) ? (anims.roll || anims.idle) : anims.idle;
             if (cycle > 4.4 && cycle < 5.6) targetDist = 3.5;
           } else {
             nextAnim = anims.shoot || anims.swordSlash || anims.idle;
           }
         } else {
           nextAnim = anims.idle;
         }
         
         // Apply physical movement for dodging / lunging
         if (distToCenter > 0.001) {
             // To place the NPC `targetDist` away from center, facing the center
             const targetPosition = centerPoint.clone().add(dirToCenter.clone().multiplyScalar(-targetDist));
             targetPosition.y = startPosRef.current ? startPosRef.current.y : 3.0;
             npcPos.lerp(targetPosition, delta * 5.0);
         }
       }
     }
     
     // Update Spell Effect visibility
     if (spellEffectGroupRef.current) {
         const isShooting = (sparringRole === 'ATTACKER' && (idleTimer.current % 8.0) >= 4.0 && (idleTimer.current % 8.0) < 6.0) || 
                            (sparringRole === 'DEFENDER' && (idleTimer.current % 8.0) >= 6.0 && (idleTimer.current % 8.0) < 8.0);
         spellEffectGroupRef.current.visible = stateRef.current === 'SPARRING' && isShooting;
     }
     if (swordEffectGroupRef.current) {
         const isSwording = (sparringRole === 'ATTACKER' && (idleTimer.current % 8.0) < 2.0) || 
                            (sparringRole === 'DEFENDER' && (idleTimer.current % 8.0) >= 2.0 && (idleTimer.current % 8.0) < 4.0);
         swordEffectGroupRef.current.visible = stateRef.current === 'SPARRING' && isSwording;
     }
     
     // --- PATROL BEHAVIOR ---
     const distToPlayer = npcPos.distanceTo(globalPlayerState.position);
     if (distToPlayer < 3.5 && stateRef.current !== 'SUMMONED') {
       if (stateRef.current !== 'INTERACTING') {
         nextState = 'INTERACTING';
         interactTimer.current = 0;
         targetPosRef.current = null; // Fix: Clear previous walking target
         if (!isInteracting) setIsInteracting(true);
       }
     } else if (stateRef.current === 'INTERACTING') {
       nextState = startState === 'SPARRING' ? 'SPARRING' : 'THINKING';
       if (isInteracting) setIsInteracting(false);
     }
     
     if (stateRef.current === 'THINKING') {
        const angle = Math.random() > 0.5 ? 0 : Math.PI;
        const currentYaw = new THREE.Euler().setFromQuaternion(containerRef.current.quaternion).y;
        const moveAngle = currentYaw + angle;
        
        let pickTargetX = npcPos.x + Math.sin(moveAngle) * 8.0;
        let pickTargetZ = npcPos.z + Math.cos(moveAngle) * 8.0;
        
        if (maxWanderRadius && startPosRef.current) {
          const distFromStart = new THREE.Vector2(npcPos.x, npcPos.z).distanceTo(new THREE.Vector2(startPosRef.current.x, startPosRef.current.z));
          if (distFromStart > maxWanderRadius * 0.8) {
             const dirToStart = new THREE.Vector3().subVectors(startPosRef.current, npcPos);
             dirToStart.y = 0;
             if (dirToStart.lengthSq() > 0.001) dirToStart.normalize();
             pickTargetX = npcPos.x + dirToStart.x * 8.0;
             pickTargetZ = npcPos.z + dirToStart.z * 8.0;
          }
        }
        
        const testPos = new THREE.Vector3(pickTargetX, 100, pickTargetZ);
        
        const ray = new RAPIER.Ray(testPos, downDir);
        const hit = world.castRay(ray, 200, true);
        if (hit) {
          targetPosRef.current = testPos.clone().add(downDir.clone().multiplyScalar(hit.timeOfImpact));
          nextState = 'WALKING';
        }
     }
     
    if (stateRef.current === 'THINKING') {
      nextAnim = anims.idle; // Fix: Always default to idle when thinking
      idleTimer.current += delta;
    } else if (stateRef.current !== 'SPARRING') {
      idleTimer.current = 0;
    }

    

    // --- OFF-SCREEN RESET ESCAPE PLAN ---
    if (stateRef.current === 'ESCAPING') {
       nextAnim = anims.idle;
       
       // Check if camera is looking at the NPC
       const frustum = new THREE.Frustum();
       const projScreenMatrix = new THREE.Matrix4();
       projScreenMatrix.multiplyMatrices(rootState.camera.projectionMatrix, rootState.camera.matrixWorldInverse);
       frustum.setFromProjectionMatrix(projScreenMatrix);
       
       if (!frustum.containsPoint(npcPos)) {
          // Player is not looking! Safely reset!
          if (startPosRef.current) {
             npcPos.copy(startPosRef.current);
          }
          nextState = 'THINKING';
          failedTargetCount.current = 0;
       }
       
   
    // SEA / FALL CATCHER: If they wander into the water or fall off the map
    if (npcPos.y < 0.8) {
      if (startPosRef.current) {
         npcPos.copy(startPosRef.current);
      }
      nextState = 'THINKING';
      targetPosRef.current = null;
    }

    if (stateRef.current !== nextState) stateRef.current = nextState;
       if (currentAnim.current !== nextAnim && actions[nextAnim]) {
         actions[currentAnim.current]?.fadeOut(0.2);
         actions[nextAnim]?.reset().fadeIn(0.2).play();
         currentAnim.current = nextAnim;
       }
       return; // Skip all other logic while waiting to reset
    }

    // Normal wandering: immediately try to find a target!
    
    
    // Normal wandering: immediately try to find a target!
    if (stateRef.current === 'THINKING' && !targetPosRef.current) {
        const dist = 5.0 + Math.random() * 10.0; 
        
        let pickTargetX = 0;
        let pickTargetZ = 0;
        let needsToGoHome = false;
        
        if (maxWanderRadius && startPosRef.current) {
          const distFromStart = new THREE.Vector2(npcPos.x, npcPos.z).distanceTo(new THREE.Vector2(startPosRef.current.x, startPosRef.current.z));
          if (distFromStart > maxWanderRadius * 0.8) {
             needsToGoHome = true;
             const dirToStart = new THREE.Vector3().subVectors(startPosRef.current, npcPos);
             dirToStart.y = 0;
             if (dirToStart.lengthSq() > 0.001) dirToStart.normalize();
             pickTargetX = npcPos.x + dirToStart.x * dist;
             pickTargetZ = npcPos.z + dirToStart.z * dist;
          }
        }
        
        if (!needsToGoHome) {
          const angle = Math.random() * Math.PI * 2;
          pickTargetX = npcPos.x + Math.cos(angle) * dist;
          pickTargetZ = npcPos.z + Math.sin(angle) * dist;
        }
        
        const testPos = new THREE.Vector3(pickTargetX, 100, pickTargetZ);
        const ray = new RAPIER.Ray(testPos, downDir);
        const hit = world.castRay(ray, 200, true);
        
        if (hit && hit.timeOfImpact < 200) {
          targetPosRef.current = testPos.clone().add(downDir.clone().multiplyScalar(hit.timeOfImpact));
          nextState = 'WALKING';
        }
    } 
    
    if (stateRef.current === 'INTERACTING') {
      interactTimer.current += delta;
      const dirToPlayer = new THREE.Vector3().subVectors(globalPlayerState.position, npcPos);
      dirToPlayer.y = 0;
      if (dirToPlayer.lengthSq() > 0.001) {
        dirToPlayer.normalize();
        const angle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
        targetQuaternion.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        containerRef.current.quaternion.slerp(targetQuaternion.current, 10 * delta);
      }
      
      if (interactTimer.current < 2.0 && anims.wave) {
        nextAnim = anims.wave;
      } else {
        nextAnim = anims.idle;
      }
    } else if ((stateRef.current === 'WALKING' || stateRef.current === 'SUMMONED') && targetPosRef.current) {
      const dirToTarget = new THREE.Vector3().subVectors(targetPosRef.current, npcPos);
      dirToTarget.y = 0; 
      const distToTarget = dirToTarget.length();
      
      if (distToTarget > 0.001) {
        dirToTarget.normalize();
      }

      
      
      
      // --- WIDE-SHOULDER ROOMBA PATHFINDING ---
      const shoulderWidth = 0.35;
      const forwardRayOrigin = new THREE.Vector3(npcPos.x, npcPos.y + 0.6, npcPos.z);
      const leftShoulder = new THREE.Vector3(npcPos.x - dirToTarget.z * shoulderWidth, npcPos.y + 0.6, npcPos.z + dirToTarget.x * shoulderWidth);
      const rightShoulder = new THREE.Vector3(npcPos.x + dirToTarget.z * shoulderWidth, npcPos.y + 0.6, npcPos.z - dirToTarget.x * shoulderWidth);
      
      const fHit = world.castRayAndGetNormal(new RAPIER.Ray(forwardRayOrigin, dirToTarget), 1.0, true);
      const lHit = world.castRayAndGetNormal(new RAPIER.Ray(leftShoulder, dirToTarget), 1.0, true);
      const rHit = world.castRayAndGetNormal(new RAPIER.Ray(rightShoulder, dirToTarget), 1.0, true);
      
      // Determine if a hit is a steep wall (normal.y < 0.7). Hills/stairs (>= 0.7) are ignored!
      const isWall = (hit: any) => hit && hit.timeOfImpact < 1.0 && hit.normal && hit.normal.y < 0.7;
      const isBlocked = isWall(fHit) || isWall(lHit) || isWall(rHit);
      
      if (isBlocked && stateRef.current !== 'SUMMONED') {
        // Roomba logic: Immediately stop and pick a new target!
        nextState = 'THINKING';
        targetPosRef.current = null;
        nextAnim = anims.idle;
        
        // Count consecutive failures to detect if we are trapped
        failedTargetCount.current += 1;
        if (failedTargetCount.current > 4) {
           nextState = 'ESCAPING';
        }
      } else if (distToTarget < 1.0) {
        nextState = 'THINKING';
        targetPosRef.current = null;
        nextAnim = anims.idle;
        failedTargetCount.current = 0; // Reset failures on success!
      } else {
        const angle = Math.atan2(dirToTarget.x, dirToTarget.z);
        targetQuaternion.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        containerRef.current.quaternion.slerp(targetQuaternion.current, 10 * delta);
        
        const speed = (stateRef.current === 'SUMMONED') ? 5.0 : 2.0;
        npcPos.addScaledVector(dirToTarget, speed * delta);
        
        nextAnim = (stateRef.current === 'SUMMONED') ? anims.run : anims.walk;
      }
    }
    // GRAVITY & GROUND SNAPPING (Runs every frame for EVERY NPC)
    // Cast from slightly above the NPC to prevent them from teleporting onto tree canopies above them!
    const snapRayOrigin = new THREE.Vector3(npcPos.x, npcPos.y + 2.0, npcPos.z);
    const snapRay = new RAPIER.Ray(snapRayOrigin, downDir);
    const snapHit = world.castRay(snapRay, 50.0, true);
    
    if (snapHit && snapHit.timeOfImpact < 50.0) {
      const hitY = snapRayOrigin.y - snapHit.timeOfImpact;
      // CRITICAL FIX: Clamp the lerp t-value to 1.0 to prevent massive overshoot on lag spikes
      npcPos.y = THREE.MathUtils.lerp(npcPos.y, hitY, Math.min(1, 15 * delta));
    }

    if (stateRef.current !== nextState) stateRef.current = nextState;
    if (currentAnim.current !== nextAnim && actions[nextAnim]) {
      actions[currentAnim.current]?.fadeOut(0.2);
      actions[nextAnim]?.reset().fadeIn(0.2).play();
      currentAnim.current = nextAnim;
    }
  });

  const greetings = useMemo(() => ["Halt! Who goes there?", "Keep the peace, citizen.", "I am on duty."], []);
  const currentGreeting = useRef(greetings[0]);
  useEffect(() => {
    if (isInteracting) currentGreeting.current = greetings[Math.floor(Math.random() * greetings.length)];
  }, [isInteracting, greetings]);

  return (
    <group ref={containerRef} scale={0.58}>
      <group ref={modelRef} name={roleName}>
        <group ref={meshGroupRef}>
          <primitive object={clone} />
        </group>
      </group>
      <group ref={spellEffectGroupRef} position={[0, 1.5, 1.5]} visible={false}>
         <SpellEffect type={sparringRole === 'ATTACKER' ? 'fire' : 'arcane'} duration={2.0} scaleMultiplier={0.6} />
      </group>
      <group ref={swordEffectGroupRef} position={[0, 1.0, 1.5]} rotation={[0, Math.PI/2, 0]} visible={false}>
         <SpellEffect type="void" duration={2.0} scaleMultiplier={1.0} />
      </group>
      
      
      {/* Debug Name Tag */}
      <Html position={[0, 4.0, 0]} center zIndexRange={[50, 0]}>
        <div className="bg-black/60 text-white/90 text-[10px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap shadow-sm border border-white/10 pointer-events-none">
          Knight_Golden_Female
        </div>
      </Html>

      {/* Interaction Dialog */}
      {isInteracting && (
        <Html position={[0, 3.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border-b-4 border-emerald-500 w-64 transform transition-all animate-in zoom-in duration-200 pointer-events-none">
            <p className="text-emerald-600 font-black text-sm mb-1 uppercase tracking-wider">{roleName}</p>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">"{currentGreeting.current}"</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-4 border-r-4 border-emerald-500 transform rotate-45"></div>
          </div>
        </Html>
      )}
    </group>
  );
};
