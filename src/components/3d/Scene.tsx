import { Physics } from '@react-three/rapier';
import { Environment as DreiEnvironment, Stats, Sky } from '@react-three/drei';
import { Environment } from './Environment';
import { Character } from './Character';
import { Birds } from './Birds';
import { Fireflies } from './Fireflies';
import { FreeCam } from './FreeCam';
import { NPC } from './NPC';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const Scene = () => {
  const gameState = useGameStore((state) => state.gameState);
  const isFreeCam = useGameStore((state) => state.isFreeCam);

  return (
    <>
      {/* Stylized Peach Sky Background */}
      <color attach="background" args={['#ffb07c']} />
      
      {/* Fog to blend the edges of the island smoothly into the horizon */}
      <fog attach="fog" args={['#ffb07c', 150, 600]} />

      {/* HDRI Image-Based Lighting (Invisible) */}
      <DreiEnvironment preset="sunset" background={false} />

      <Physics debug={false}>
        <Environment />
        {gameState === 'playing' && <Character />}
        
        {/* AI NPCs */}
        <NPC 
          roleName="Free Roamer"
          colorTint="#ff4444" // Red tinted clothing
          startPosition={new THREE.Vector3(0, 3.1, 13)}
        />
        <NPC 
          roleName="Cleric" 
          startPosition={new THREE.Vector3(5, 3.1, 10)} 
          modelPath="/models/Cleric.gltf" 
        />
      </Physics>

      {/* Free Camera Mode */}
      {isFreeCam && <FreeCam />}

      {/* Procedural Wildlife */}
      <Birds count={50} />
      <Fireflies count={150} />

      {/* Performance Monitor */}
      <Stats />
    </>
  );
};
