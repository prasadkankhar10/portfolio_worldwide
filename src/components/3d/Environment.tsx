import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { InstancedTrees } from './InstancedTrees';
import { useControls } from 'leva';
import { globalPlayerState } from './Character';
import { useGameStore } from '../../store/useGameStore';

export const Environment = () => {
  const { scene } = useGLTF('./models/island_model.glb');
  const windFanRef = useRef<THREE.Object3D | null>(null);
  const wellMeshRef = useRef<THREE.Object3D | null>(null);

  // Safely clone the scene so we don't permanently mutate the useGLTF cache!
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Add interactive debug controls for Forest and Windmill
  const { treeSpacing } = useControls('Forest Generation', {
    treeSpacing: { value: 6, min: 2, max: 20, step: 0.5, label: 'Tree Spacing (m)' }
  });

  const { fanSpeed } = useControls('Windmill', {
    fanSpeed: { value: 2.0, min: 0, max: 10, step: 0.1, label: 'Fan Speed' }
  });

  // Optimize tree placement - run ONLY when spacing changes
  const treeMatrices = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const acceptedPositions: THREE.Vector3[] = [];

    // Force absolute world matrix update on the CLONE
    clonedScene.updateMatrixWorld(true);

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      const name = child.name.toLowerCase();
      
      // Grab the wind fan so we can animate it
      if (name.includes('wind_fan')) {
        windFanRef.current = child;
      }

      // Grab the well so we can make it interactive
      if (name.includes('well')) {
        wellMeshRef.current = child;
      }

      // Find the hidden cubes (handles Blender naming and typos)
      if (name.includes('tree_swapn') || name.includes('tree_spawn') || name.includes('treespawn')) {
        const position = new THREE.Vector3();
        const rotation = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        
        child.matrixWorld.decompose(position, rotation, scale);
        
        // --- SPATIAL DISTANCE FILTER ---
        let isTooClose = false;
        for (const existingPos of acceptedPositions) {
          if (position.distanceTo(existingPos) < treeSpacing) {
            isTooClose = true;
            break;
          }
        }

        // If the tree is far enough away from all other trees, we spawn it!
        if (!isTooClose) {
          acceptedPositions.push(position.clone());

          // Add random rotation on the Y axis so they face different directions
          const randomRotation = Math.random() * Math.PI * 2;
          rotation.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomRotation));

          // Add random scaling so trees range from 100% to 140% of their base size
          const randomScale = 1.0 + Math.random() * 0.4;
          const treeScale = 1.0 * randomScale; 
          scale.set(treeScale, treeScale, treeScale);
          
          const spawnMatrix = new THREE.Matrix4();
          spawnMatrix.compose(position, rotation, scale);
          
          matrices.push(spawnMatrix);
        }

        // CRITICAL: Actually REMOVE the invisible box from the CLONED scene so the physics engine
        // does not build invisible walls that the camera constantly bumps into!
        setTimeout(() => {
          if (child.parent) child.parent.remove(child);
        }, 0);
      }
    });

    return matrices;
  }, [clonedScene, treeSpacing]);

  // Animate the Windmill Fan continuously
  useFrame((state, delta) => {
    if (windFanRef.current) {
      // Rotate locally around Z axis
      windFanRef.current.rotation.z += fanSpeed * delta;
    }
  });

  // --- WELL INTERACTION LOGIC ---
  const [isNearWell, setIsNearWell] = useState(false);
  
  const setActiveDialog = useGameStore(state => state.setActiveDialog);
  const activeDialogNpcId = useGameStore(state => state.activeDialogNpcId);
  const setActiveOutlineMesh = useGameStore(state => state.setActiveOutlineMesh);
  const wellId = useMemo(() => Math.random().toString(), []);

  useFrame(() => {
    if (!wellMeshRef.current) return;
    const wellPos = new THREE.Vector3();
    wellMeshRef.current.getWorldPosition(wellPos);
    
    const distToPlayer = wellPos.distanceTo(globalPlayerState.position);
    
    if (distToPlayer < 4.5) { // Slightly larger radius for the well since it's a big object
      if (!isNearWell) setIsNearWell(true);
    } else {
      if (isNearWell) setIsNearWell(false);
    }
  });

  // Highlight the well when the player is near
  useEffect(() => {
    if (isNearWell && wellMeshRef.current) {
      setActiveOutlineMesh(wellMeshRef.current);
    } else if (!isNearWell) {
      if (useGameStore.getState().activeOutlineMesh === wellMeshRef.current) {
        setActiveOutlineMesh(null);
      }
    }
  }, [isNearWell, setActiveOutlineMesh]);

  // Press E to interact
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNearWell && (e.key === 'e' || e.key === 'E')) {
         setActiveDialog('well_interaction', wellId);
         // Pick a random BlueSoldier to summon!
         const summonRole = Math.random() > 0.5 ? 'BlueSoldier Female' : 'BlueSoldier Male';
         useGameStore.getState().summonNpc(summonRole);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNearWell, setActiveDialog, wellId]);

  // Close dialog if walking away
  useEffect(() => {
    if (!isNearWell && activeDialogNpcId === wellId) {
      setActiveDialog(null);
    }
  }, [isNearWell, activeDialogNpcId, setActiveDialog, wellId]);

  return (
    <>
      <ambientLight intensity={0.6} color="#4a5568" />

      {/* The Directional Light matches the Sky sunPosition exactly */}
      <directionalLight 
        position={[500, 100, 200]} 
        intensity={2.0} 
        color="#ffcf99"
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-camera-far={1000}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-bias={-0.0001}
        shadow-normalBias={0.05}
      />
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={clonedScene} />
      </RigidBody>
      
      {/* Render the hyper-optimized instanced trees */}
      {treeMatrices.length > 0 && <InstancedTrees spawnMatrices={treeMatrices} />}
    </>
  );
};

// Preload the model to avoid pop-in
useGLTF.preload('/models/island_model.glb');
