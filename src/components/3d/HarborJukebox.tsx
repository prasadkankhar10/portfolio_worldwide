import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { Disc, Music } from 'lucide-react';
import { globalPlayerState } from './Character';

export const HarborJukebox: React.FC = () => {
  const jukeboxTrack = useGameStore((s) => s.jukeboxTrack);
  const setJukeboxTrack = useGameStore((s) => s.setJukeboxTrack);
  const [isNear, setIsNear] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const discMeshRef = useRef<THREE.Mesh>(null);

  // Exact arrival dock walkway placement requested by user: x=88, y=3.2, z=102.5
  const JUKEBOX_POS = new THREE.Vector3(88.0, 3.2, 102.5);

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

  // Keyboard interaction: Press [E] when near the vinyl to cycle music
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if ((e.key === 'e' || e.key === 'E') && isNear) {
        cycleTrack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNear, jukeboxTrack]);

  useFrame((_, delta) => {
    // Check distance to player (trigger radius 4.5m)
    const pPos = globalPlayerState.position;
    const distSq = pPos.distanceToSquared(JUKEBOX_POS);
    const near = distSq < 20.25; // 4.5 meters
    if (near !== isNear) setIsNear(near);

    // Rotate spinning vinyl disc if playing
    if (discMeshRef.current && jukeboxTrack !== 'off') {
      discMeshRef.current.rotation.y += delta * 2.8;
    }
  });

  const trackLabels: Record<string, string> = {
    off: 'Muted (Press E to Play)',
    celestial: 'Track 1: Celestial Lullaby',
    journey: 'Track 2: Explorer’s Lute',
    lofi: 'Track 3: Midnight Lo-Fi'
  };

  return (
    <group 
      position={JUKEBOX_POS}
      onClick={(e) => {
        e.stopPropagation();
        cycleTrack();
      }}
      onPointerOver={() => {
        setIsHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'default';
      }}
    >
      {/* Wooden Table / Stand */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.8, 0.9]} />
        <meshStandardMaterial color={isHovered ? '#3d2817' : '#2d1d11'} roughness={0.7} />
      </mesh>

      {/* Brass Gramophone Base */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.65, 0.1, 0.65]} />
        <meshStandardMaterial color={isHovered ? '#b8943f' : '#8C6F2D'} metalness={0.8} roughness={0.3} />
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

      {/* Warm Antique Lamp Glow above the gramophone */}
      <pointLight position={[0, 1.5, 0]} color="#ffdd99" intensity={1.2} distance={4} decay={2} />

      {/* Floating Interactive 3D HTML Label */}
      {isNear && (
        <Html position={[0, 1.95, 0]} center distanceFactor={14}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              cycleTrack();
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer select-none group"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111916]/95 border-2 border-[#D6BC83] shadow-[0_8px_24px_rgba(0,0,0,0.6)] backdrop-blur-md text-[#F0E9DA] hover:scale-105 active:scale-95 transition-all">
              <Disc className={`w-4 h-4 text-[#D6BC83] ${jukeboxTrack !== 'off' ? 'animate-spin' : ''}`} />
              <span className="font-heading font-black text-xs text-[#D6BC83]">
                Harbor Vinyl Jukebox
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83]" />
              <span className="text-[10px] font-mono text-[#F0E9DA]/90 font-semibold">
                {trackLabels[jukeboxTrack]}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#D6BC83] text-[#111916] text-[10px] font-mono font-black shadow">
                E
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#D6BC83]/90 bg-black/80 border border-[#D6BC83]/30 px-2 py-0.5 rounded shadow">
              Press [E] or Click to change track
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
