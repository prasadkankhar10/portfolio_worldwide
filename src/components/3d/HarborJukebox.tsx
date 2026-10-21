import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { Disc, Music, Volume2, VolumeX } from 'lucide-react';
import { globalPlayerState } from './Character';

export const HarborJukebox: React.FC = () => {
  const jukeboxTrack = useGameStore((s) => s.jukeboxTrack);
  const setJukeboxTrack = useGameStore((s) => s.setJukeboxTrack);
  const [isNear, setIsNear] = useState(false);
  const discMeshRef = useRef<THREE.Mesh>(null);

  // Exactly on the wooden plank arrival dock (COL_Dock_FirstAge) right beside the main pier walkway
  const JUKEBOX_POS = new THREE.Vector3(107.8, 3.0, 124.0);

  useFrame((_, delta) => {
    // Check distance to player
    const pPos = globalPlayerState.position;
    const distSq = pPos.distanceToSquared(JUKEBOX_POS);
    const near = distSq < 25; // 5 meters
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

  const trackLabels: Record<string, string> = {
    off: 'Muted (Click to Play)',
    celestial: 'Track 1: Celestial Lullaby',
    journey: 'Track 2: Explorer’s Lute',
    lofi: 'Track 3: Midnight Lo-Fi'
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

      {/* Floating Interactive 3D HTML Label */}
      {isNear && (
        <Html position={[0, 1.85, 0]} center distanceFactor={14}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              cycleTrack();
            }}
            className="flex flex-col items-center gap-1 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111916]/95 border-2 border-[#D6BC83] shadow-xl backdrop-blur-md text-[#F0E9DA] hover:scale-105 active:scale-95 transition-all">
              <Disc className={`w-3.5 h-3.5 text-[#D6BC83] ${jukeboxTrack !== 'off' ? 'animate-spin' : ''}`} />
              <span className="font-heading font-black text-xs text-[#D6BC83]">
                Harbor Jukebox
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83]" />
              <span className="text-[10px] font-mono text-[#F0E9DA]/90 font-semibold">
                {trackLabels[jukeboxTrack]}
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#D6BC83]/80 bg-black/75 px-2 py-0.5 rounded shadow">
              Click to cycle soundtracks
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
