import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { STATION_MONUMENT_DEFS } from './StationMonuments';
import { globalPlayerState } from './Character';
import { Compass, X } from 'lucide-react';

export const InWorldWaypoint: React.FC = () => {
  const activeWaypointStationId = useGameStore((state) => state.activeWaypointStationId);
  const setActiveWaypointStationId = useGameStore((state) => state.setActiveWaypointStationId);

  const beaconMeshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const diamondRef = useRef<THREE.Group>(null);

  // Find target station definition
  const targetStation = useMemo(() => {
    if (!activeWaypointStationId) return null;
    return STATION_MONUMENT_DEFS.find((s) => s.id === activeWaypointStationId) || null;
  }, [activeWaypointStationId]);

  useFrame((state, delta) => {
    if (!targetStation) return;
    const t = state.clock.getElapsedTime();

    // Rotate beam & gem
    if (beaconMeshRef.current) {
      beaconMeshRef.current.rotation.y += delta * 0.4;
    }
    if (diamondRef.current) {
      diamondRef.current.rotation.y += delta * 1.2;
      diamondRef.current.position.y = 6.8 + Math.sin(t * 2.5) * 0.35;
    }

    // Expand ground ripple rings
    if (ringRef1.current) {
      const s1 = (t * 0.8) % 1;
      ringRef1.current.scale.set(1 + s1 * 3.5, 1 + s1 * 3.5, 1);
      (ringRef1.current.material as THREE.MeshBasicMaterial).opacity = (1 - s1) * 0.7;
    }
    if (ringRef2.current) {
      const s2 = (t * 0.8 + 0.5) % 1;
      ringRef2.current.scale.set(1 + s2 * 3.5, 1 + s2 * 3.5, 1);
      (ringRef2.current.material as THREE.MeshBasicMaterial).opacity = (1 - s2) * 0.7;
    }
  });

  if (!targetStation) return null;

  const [x, y, z] = targetStation.pos;
  const dist = Math.round(
    Math.hypot(x - globalPlayerState.position.x, z - globalPlayerState.position.z)
  );

  return (
    <group position={[x, y, z]}>
      {/* 1. Tall Golden Volumetric Beacon Beam */}
      <mesh ref={beaconMeshRef} position={[0, 40, 0]}>
        <cylinderGeometry args={[0.5, 1.8, 80, 16, 1, true]} />
        <meshBasicMaterial 
          color="#D4B777" 
          transparent 
          opacity={0.35} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>

      {/* Internal Core Laser Beam */}
      <mesh position={[0, 45, 0]}>
        <cylinderGeometry args={[0.1, 0.25, 90, 8, 1, true]} />
        <meshBasicMaterial 
          color="#fef08a" 
          transparent 
          opacity={0.7} 
          side={THREE.DoubleSide} 
          depthWrite={false} 
        />
      </mesh>

      {/* 2. Expanding Ground Ripple Rings */}
      <mesh ref={ringRef1} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial color="#D4B777" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef2} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* 3. Floating Beacon Crystal Diamond */}
      <group ref={diamondRef} position={[0, 6.8, 0]}>
        <mesh>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial 
            color="#D4B777" 
            emissive="#D4B777" 
            emissiveIntensity={1.2} 
            roughness={0.2} 
            metalness={0.8} 
          />
        </mesh>
        <pointLight color="#D4B777" intensity={2.5} distance={15} />
      </group>

      {/* 4. Overhead In-World Floating Distance Pill */}
      <Html position={[0, 8.5, 0]} center distanceFactor={22} zIndexRange={[100, 0]}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#182522]/90 border border-[#D4B777]/60 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md text-[#E9E4D7] text-xs font-heading font-semibold whitespace-nowrap select-none pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <Compass className="w-3.5 h-3.5 text-[#D4B777]" />
          <span>{targetStation.name}</span>
          <span className="font-mono text-[#D4B777] font-bold">[{dist}m]</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveWaypointStationId(null);
            }}
            className="p-0.5 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Clear Waypoint"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </Html>
    </group>
  );
};
