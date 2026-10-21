import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { Disc, Music } from 'lucide-react';
import { globalPlayerState } from './Character';

export const HarborJukebox: React.FC = () => {
  const jukeboxTrack = useGameStore((s) => s.jukeboxTrack);
  const setJukeboxTrack = useGameStore((s) => s.setJukeboxTrack);
  const [isNear, setIsNear] = useState(false);
  const discMeshRef = useRef<THREE.Mesh>(null);

  const JUKEBOX_POS = new THREE.Vector3(98.5, 3.2, 122.5);

  useFrame((_, delta) => {
    // Check distance to player
    const pPos = globalPlayerState.position;
    const distSq = pPos.distanceToSquared(JUKEBOX_POS);
    const near = distSq < 16; // 4 meters
    if (near !== isNear) setIsNear(near);

    // Rotate spinning vinyl disc if playing
    if (discMeshRef.current && jukeboxTrack !== 'off') {
      discMeshRef.current.rotation.y += delta * 2.5;
    }
  });

  const cycleTrack = () => {
    soundEngine.playClickSound();
    const tracks: Array<'off' | 'celestial' | 'journey' | 'lofi'> = ['off', 'celestial', 'journey', 'lofi'];
    const nextIdx = (tracks.indexOf(jukeboxTrack) + 1) % tracks.length;
    const next = tracks[nextIdx];
    setJukeboxTrack(next);

    if (next === 'off') {
      soundEngine.stopJukebox();
    } else {
      soundEngine.playJukeboxTrack(next);
    }
  };

  return (
    <group position={JUKEBOX_POS}>
      {/* Wooden Table / Stand */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial color="#2d1d11" roughness={0.7} />
      </mesh>

      {/* Brass Gramophone Base */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.65, 0.1, 0.65]} />
        <meshStandardMaterial color="#8C6F2D" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Spinning Vinyl Record */}
      <mesh ref={discMeshRef} position={[0, 0.92, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.02, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Golden Brass Horn / Speaker */}
      <mesh position={[0.1, 1.25, 0.1]} rotation={[0.4, -0.6, 0.2]} castShadow>
        <coneGeometry args={[0.35, 0.65, 32, 1, true]} />
        <meshStandardMaterial color="#D6BC83" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Interactive Prompt */}
      {isNear && (
        <group position={[0, 2.0, 0]}>
          {/* Billboard HTML-like visual representation */}
          <mesh onClick={cycleTrack} position={[0, 0, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial 
              color={jukeboxTrack !== 'off' ? '#10b981' : '#D6BC83'} 
              emissive={jukeboxTrack !== 'off' ? '#059669' : '#8C6F2D'} 
              emissiveIntensity={0.8} 
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
