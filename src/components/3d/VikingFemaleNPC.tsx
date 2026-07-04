import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useRapier } from '@react-three/rapier';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';

interface VikingFemaleNPCProps {
  colorTint?: string;
  roleName?: string;
  startPosition?: THREE.Vector3;
  maxWanderRadius?: number;
  dialogId?: string;
}

export const VikingFemaleNPC = ({ 
  colorTint, 
  startPosition, 
  roleName = "Viking Female",
  maxWanderRadius,
  dialogId
}: VikingFemaleNPCProps) => {
  const { scene, animations } = useGLTF('./models/NPCs/Viking_Female.glb');
  const containerRef = useRef<THREE.Group>(null);
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
      wave: getAnim(['victory', 'wave', 'spell', 'characterarmature|wave', 'attack', 'cheer']) 
    };
  }, [animations]);

  const stateRef = useRef<'THINKING' | 'WALKING' | 'INTERACTING' | 'SUMMONED'>('THINKING');
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  
  const historyPositions = useRef<THREE.Vector3[]>([]);
  const historyTimer = useRef(0);
  const escapeTimer = useRef(0);
  const interactTimer = useRef(0);
  const idleTimer = useRef(0);

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

    
    const distToPlayer = npcPos.distanceTo(globalPlayerState.position);
    if (distToPlayer < 3.5) {
      if (stateRef.current !== 'INTERACTING') {
        nextState = 'INTERACTING';
        interactTimer.current = 0;
        targetPosRef.current = null; // Fix: Clear previous path on interrupt
        if (!isInteracting) setIsInteracting(true);
      }
    } else if (stateRef.current === 'INTERACTING') {
      nextState = 'THINKING';
      if (isInteracting) setIsInteracting(false);
    }
    
    if (stateRef.current === 'THINKING') {
      nextAnim = anims.idle; // Fix: Always default to idle when thinking
      idleTimer.current += delta;
    } else {
      idleTimer.current = 0;
    }

    // Normal wandering: immediately try to find a target!
    
    // --- 1. SAFE UN-STICKING (The New Escape Plan) ---
    historyTimer.current += delta;
    if (historyTimer.current > 4.0) {
      historyTimer.current = 0;
      if (historyPositions.current.length > 0) {
        const oldestPos = historyPositions.current[0];
        const distMoved = oldestPos.distanceTo(npcPos);
        
        // If stuck for 4 seconds in a corner
        if (distMoved < 1.5 && stateRef.current !== 'INTERACTING') {
          targetPosRef.current = null;
          nextState = 'THINKING';
          
          // Nudge backwards to get out of the corner
          const backwardDir = new THREE.Vector3(0,0,1).applyQuaternion(containerRef.current.quaternion);
          npcPos.addScaledVector(backwardDir, 2.0); // 2 meters backwards!
        }
      }
      historyPositions.current = [npcPos.clone()];
    }

    // --- 2. LINE-OF-SIGHT TARGET PICKING ---
    if (stateRef.current === 'THINKING' && !targetPosRef.current) {
        const dist = 5.0 + Math.random() * 15.0; 
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
        const floorRay = new RAPIER.Ray(testPos, downDir);
        const floorHit = world.castRay(floorRay, 200, true);
        
        if (floorHit && floorHit.timeOfImpact < 200) {
          const hitPoint = testPos.clone().add(downDir.clone().multiplyScalar(floorHit.timeOfImpact));
          
          // Verify Line of Sight
          const distToHit = new THREE.Vector2(hitPoint.x, hitPoint.z).distanceTo(new THREE.Vector2(npcPos.x, npcPos.z));
          const dirToHit = new THREE.Vector3(hitPoint.x - npcPos.x, 0, hitPoint.z - npcPos.z).normalize();
          
          const losOrigin = new THREE.Vector3(npcPos.x, npcPos.y + 1.5, npcPos.z);
          const losHit = world.castRay(new RAPIER.Ray(losOrigin, dirToHit), distToHit, true);
          
          if (!losHit || losHit.timeOfImpact >= distToHit - 1.0) {
            // Path is clear!
            targetPosRef.current = hitPoint;
            nextState = 'WALKING';
          }
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

      // --- 3. DYNAMIC OBSTACLE STEERING ---
      const origin = new THREE.Vector3(npcPos.x, npcPos.y + 1.0, npcPos.z);
      const rightDir = dirToTarget.clone().applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/4);
      const leftDir = dirToTarget.clone().applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/4);

      const fHit = world.castRay(new RAPIER.Ray(origin, dirToTarget), 2.0, true);
      const lHit = world.castRay(new RAPIER.Ray(origin, leftDir), 1.5, true);
      const rHit = world.castRay(new RAPIER.Ray(origin, rightDir), 1.5, true);
      
      if (fHit && fHit.timeOfImpact < 2.0) {
        if (lHit && !rHit) {
          dirToTarget.applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2); // Hard Right
        } else if (rHit && !lHit) {
          dirToTarget.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2); // Hard Left
        } else {
          dirToTarget.applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2); // Fallback Right
        }
      } else if (lHit && lHit.timeOfImpact < 1.5) {
        dirToTarget.applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/6); // Soft Right
      } else if (rHit && rHit.timeOfImpact < 1.5) {
        dirToTarget.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/6); // Soft Left
      }

      if (distToTarget < 1.0) {
        nextState = 'THINKING';
        targetPosRef.current = null;
        nextAnim = anims.idle;
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

  const greetings = useMemo(() => ["The magical winds are strong today.", "I sense a great destiny in you.", "Want to see a magic trick?", "Hello!"], []);
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
      
      {/* Debug Name Tag */}
      <Html position={[0, 4.0, 0]} center zIndexRange={[50, 0]}>
        <div className="bg-black/60 text-white/90 text-[10px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap shadow-sm border border-white/10 pointer-events-none">
          Viking_Female
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
