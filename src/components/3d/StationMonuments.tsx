import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData } from '../../data/portfolioData';

export interface StationMonumentDef {
  id: string;
  name: string;
  pos: [number, number, number];
  type: 
    | 'astrolabe'
    | 'chronicler'
    | 'harvard'
    | 'arena'
    | 'leadership'
    | 'game_engine'
    | 'ai_project'
    | 'spatial_project'
    | 'web_project'
    | 'mana_well'
    | 'stonehenge'
    | 'citadel_rift';
  color: string;
  secondaryColor: string;
}

export const STATION_MONUMENT_DEFS: StationMonumentDef[] = [
  // 1. Core & Accreditations
  { id: 'TRIGGER_Harbor_Welcome', name: 'Harbor Welcome', pos: [107.0, 3.5, 125.0], type: 'astrolabe', color: '#fbbf24', secondaryColor: '#38bdf8' },
  { id: 'TRIGGER_Village_About', name: 'Village Journey', pos: [45.0, 3.5, -4.0], type: 'chronicler', color: '#f59e0b', secondaryColor: '#fef08a' },
  { id: 'TRIGGER_Hall_Certifications', name: 'Harvard CS50x Hall', pos: [65.0, 3.5, 95.0], type: 'harvard', color: '#ef4444', secondaryColor: '#f59e0b' },
  { id: 'TRIGGER_Arena_Algorithms', name: 'Algorithmic Arena', pos: [18.0, 3.5, -30.0], type: 'arena', color: '#f43f5e', secondaryColor: '#f97316' },
  { id: 'TRIGGER_Leadership_Pavilion', name: 'Leadership Pavilion', pos: [38.0, 3.5, 12.0], type: 'leadership', color: '#eab308', secondaryColor: '#ca8a04' },

  // 2. AI & Autonomous Systems
  { id: 'TRIGGER_Project_ButlerOS', name: 'Butler OS Spire', pos: [-35.0, 45.0, -85.0], type: 'ai_project', color: '#a855f7', secondaryColor: '#c084fc' },
  { id: 'TRIGGER_Project_MaraRAG', name: 'MaraRAG Library', pos: [75.0, 12.0, 20.0], type: 'ai_project', color: '#8b5cf6', secondaryColor: '#6366f1' },
  { id: 'TRIGGER_Project_Akshayanidhi', name: 'Akshayanidhi Media Archive', pos: [52.0, 6.0, -15.0], type: 'ai_project', color: '#9333ea', secondaryColor: '#38bdf8' },
  { id: 'TRIGGER_Project_LifeManager', name: 'Telegram-to-Notion OS', pos: [10.0, 25.0, -60.0], type: 'ai_project', color: '#7c3aed', secondaryColor: '#a78bfa' },
  { id: 'TRIGGER_Project_Sahaj', name: 'Sahaj Accessibility Shrine', pos: [-15.0, 3.5, 65.0], type: 'ai_project', color: '#8b5cf6', secondaryColor: '#10b981' },

  // 3. Low-Level Systems & Game Engines
  { id: 'TRIGGER_Project_OneMoreMove', name: 'One More Move Keep', pos: [-85.0, 3.5, -25.0], type: 'game_engine', color: '#f97316', secondaryColor: '#fbbf24' },
  { id: 'TRIGGER_Forge_GameDev', name: 'On The Way Forge', pos: [-100.0, 3.5, -11.5], type: 'game_engine', color: '#ea580c', secondaryColor: '#f59e0b' },
  { id: 'TRIGGER_Project_KnightsAdventure', name: 'Knight Adventure Windmill', pos: [-60.0, 18.0, -60.0], type: 'game_engine', color: '#d97706', secondaryColor: '#fb923c' },

  // 4. Spatial Computing & WebAR
  { id: 'TRIGGER_Project_RealmWebAR', name: 'WebAR Beacon', pos: [-35.0, 3.5, 30.0], type: 'spatial_project', color: '#06b6d4', secondaryColor: '#38bdf8' },
  { id: 'TRIGGER_Project_TraceMateAR', name: 'TraceMate Pro Studio', pos: [-75.0, 3.5, 15.0], type: 'spatial_project', color: '#0ea5e9', secondaryColor: '#67e8f9' },

  // 5. Full-Stack Web & Cloud Systems
  { id: 'TRIGGER_Project_ExamPlatform', name: 'AI Exam Platform Plinth', pos: [-2.5, 3.5, -4.0], type: 'web_project', color: '#14b8a6', secondaryColor: '#2dd4bf' },
  { id: 'TRIGGER_Project_CMEDetector', name: 'CME Space Weather Sun Dial', pos: [95.0, 3.5, 110.0], type: 'web_project', color: '#f59e0b', secondaryColor: '#ef4444' },
  { id: 'TRIGGER_Project_Sadhana', name: 'Sadhana Habit PWA Plinth', pos: [0.5, 3.5, -4.0], type: 'web_project', color: '#10b981', secondaryColor: '#34d399' },
  { id: 'TRIGGER_Project_Nishtha', name: 'Nishtha Gamified RPG Bazaar', pos: [125.6, 3.0, 7.4], type: 'web_project', color: '#84cc16', secondaryColor: '#eab308' },
  { id: 'TRIGGER_Project_Vyuham', name: 'Vyuham Chrome Ext Plinth', pos: [3.5, 3.5, -4.0], type: 'web_project', color: '#06b6d4', secondaryColor: '#0ea5e9' },
  { id: 'TRIGGER_Project_SmartCampus', name: 'Smart Campus QR Registry', pos: [115.0, 3.0, 0.0], type: 'web_project', color: '#3b82f6', secondaryColor: '#60a5fa' },
  { id: 'TRIGGER_Project_GameStore', name: 'Game Discovery Arcade', pos: [112.3, 3.0, 7.2], type: 'web_project', color: '#f97316', secondaryColor: '#e11d48' },
  { id: 'TRIGGER_Project_SchoolWebsite', name: 'Girls School Civic Hall', pos: [103.8, 3.0, -7.5], type: 'web_project', color: '#0284c7', secondaryColor: '#38bdf8' },

  // 6. Landmarks & Finale
  { id: 'TRIGGER_Moonwell_Skills', name: 'Mana Well Skills Grove', pos: [-45.0, 3.5, 32.0], type: 'mana_well', color: '#10b981', secondaryColor: '#06b6d4' },
  { id: 'TRIGGER_Stonehenge_Puzzle', name: 'Stonehenge Rune Puzzle', pos: [35.0, 3.5, 58.0], type: 'stonehenge', color: '#d97706', secondaryColor: '#8b5cf6' },
  { id: 'TRIGGER_Citadel_Contact', name: 'Citadel Summit Contact', pos: [-15.0, 58.5, -100.0], type: 'citadel_rift', color: '#06b6d4', secondaryColor: '#a855f7' },
];

/**
 * Individual Station 3D Monument with distinct thematic visual model
 */
const SingleStationMonument: React.FC<{
  station: StationMonumentDef;
  onSelect: (id: string) => void;
}> = ({ station, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const floatingRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const runesRef = useRef<THREE.Group>(null);

  const activeStationId = useGameStore((state) => state.activeStationId);
  const isNearPlayer = activeStationId === station.id;
  const [hovered, setHovered] = useState(false);

  // Dynamic Phase offset based on coordinates to break synchronization
  const phaseOffset = useMemo(() => {
    return (station.pos[0] * 0.17 + station.pos[2] * 0.31) % (Math.PI * 2);
  }, [station.pos]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Floating bobbing & rotation
    if (floatingRef.current) {
      const bobHeight = Math.sin(time * 2.2 + phaseOffset) * (isNearPlayer ? 0.22 : 0.12);
      floatingRef.current.position.y = 1.35 + bobHeight;
      floatingRef.current.rotation.y = time * (isNearPlayer ? 1.4 : 0.8) + phaseOffset;
    }

    // Counter-rotating energy rings
    if (ringsRef.current) {
      ringsRef.current.rotation.x = Math.sin(time * 1.5 + phaseOffset) * 0.25;
      ringsRef.current.rotation.z = time * (isNearPlayer ? -1.8 : -1.0);
    }

    // Orbiting rune nodes
    if (runesRef.current) {
      runesRef.current.rotation.y = time * 0.6;
    }
  });

  const baseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8, metalness: 0.2 }),
    []
  );

  const trimMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5, metalness: 0.6 }),
    []
  );

  const activeColor = hovered || isNearPlayer ? '#ffffff' : station.color;

  return (
    <group 
      ref={groupRef} 
      position={station.pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(station.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 1. SOLID STONE PEDESTAL BASE (Thematic to fantasy island) */}
      <mesh position={[0, 0.4, 0]} material={baseMaterial}>
        <cylinderGeometry args={[0.65, 0.85, 0.8, 8]} />
      </mesh>
      <mesh position={[0, 0.82, 0]} material={trimMaterial}>
        <cylinderGeometry args={[0.72, 0.72, 0.08, 8]} />
      </mesh>

      {/* 2. GROUND RUNIC CIRCLE (Pulsates brighter when player approaches) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.0, isNearPlayer ? 1.5 : 1.25, 32]} />
        <meshBasicMaterial 
          color={station.color} 
          transparent 
          opacity={isNearPlayer ? 0.65 : 0.25} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </mesh>

      {/* 3. FLOATING ARTIFACT / MONUMENT (Unique 3D Geometry per Info Type) */}
      <group ref={floatingRef}>
        
        {/* A. SOFTWARE / AI PROJECTS: Arcane Floating Crystal & Holo Rings */}
        {(station.type === 'ai_project' || station.type === 'web_project' || station.type === 'spatial_project') && (
          <>
            <mesh>
              <octahedronGeometry args={[0.42, 0]} />
              <meshStandardMaterial
                color={activeColor}
                emissive={station.color}
                emissiveIntensity={isNearPlayer ? 1.2 : 0.6}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Inner Glowing Core */}
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Orbiting Holographic Rings */}
            <group ref={ringsRef}>
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[0.65, 0.025, 8, 32]} />
                <meshBasicMaterial color={station.secondaryColor} transparent opacity={0.85} />
              </mesh>
              <mesh rotation={[-Math.PI / 4, 0, Math.PI / 2]}>
                <torusGeometry args={[0.78, 0.02, 8, 32]} />
                <meshBasicMaterial color={station.color} transparent opacity={0.6} />
              </mesh>
            </group>
          </>
        )}

        {/* B. LOW-LEVEL C++ & GAME ENGINES: Mechanical Gear Core */}
        {station.type === 'game_engine' && (
          <>
            {/* Fiery Core */}
            <mesh>
              <dodecahedronGeometry args={[0.38]} />
              <meshStandardMaterial
                color="#f97316"
                emissive="#ea580c"
                emissiveIntensity={isNearPlayer ? 1.4 : 0.8}
                roughness={0.3}
                metalness={0.7}
              />
            </mesh>

            {/* Brass Intersecting Cogs */}
            <group ref={ringsRef}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.62, 0.045, 8, 24]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 3]}>
                <torusGeometry args={[0.72, 0.035, 8, 24]} />
                <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Gear Teeth Spikes */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh 
                  key={i} 
                  position={[
                    Math.cos((i * Math.PI) / 3) * 0.64,
                    Math.sin((i * Math.PI) / 3) * 0.64,
                    0
                  ]}
                >
                  <boxGeometry args={[0.08, 0.08, 0.08]} />
                  <meshBasicMaterial color="#fef08a" />
                </mesh>
              ))}
            </group>
          </>
        )}

        {/* C. HARVARD CS50x: The Scholar's Golden Tome & Crimson Seal */}
        {station.type === 'harvard' && (
          <group>
            {/* Open Book Pages */}
            <mesh position={[-0.2, 0, 0]} rotation={[0, 0.3, -0.2]}>
              <boxGeometry args={[0.35, 0.04, 0.5]} />
              <meshStandardMaterial color="#fef08a" roughness={0.6} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, -0.3, 0.2]}>
              <boxGeometry args={[0.35, 0.04, 0.5]} />
              <meshStandardMaterial color="#fef08a" roughness={0.6} />
            </mesh>
            {/* Book Spine */}
            <mesh position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.52, 8]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.4} />
            </mesh>
            {/* Levitating Crimson Harvard Crest Seal */}
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.04, 16]} />
              <meshStandardMaterial 
                color="#ef4444" 
                emissive="#dc2626" 
                emissiveIntensity={isNearPlayer ? 1.0 : 0.5} 
                metalness={0.5} 
              />
            </mesh>
            {/* Golden Star Glyph */}
            <mesh position={[0, 0.38, 0.03]}>
              <octahedronGeometry args={[0.08, 0]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
          </group>
        )}

        {/* D. ALGORITHMIC ARENA: Crossed Rune Blades & Data Crystals */}
        {station.type === 'arena' && (
          <group>
            {/* Dual Crossed Blades */}
            <group rotation={[0, 0, Math.PI / 4]}>
              {/* Blade 1 */}
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.08, 0.85, 0.03]} />
                <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={0.8} />
              </mesh>
              {/* Crossguard */}
              <mesh position={[0, -0.15, 0]}>
                <boxGeometry args={[0.28, 0.05, 0.06]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
              {/* Blade 2 */}
              <group rotation={[0, 0, Math.PI / 2]}>
                <mesh position={[0, 0.2, 0]}>
                  <boxGeometry args={[0.08, 0.85, 0.03]} />
                  <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.8} />
                </mesh>
                <mesh position={[0, -0.15, 0]}>
                  <boxGeometry args={[0.28, 0.05, 0.06]} />
                  <meshStandardMaterial color="#334155" metalness={0.9} />
                </mesh>
              </group>
            </group>

            {/* Orbiting Binary Nodes */}
            <group ref={runesRef}>
              {[0, 1, 2, 3].map((i) => (
                <mesh 
                  key={i} 
                  position={[
                    Math.cos((i * Math.PI) / 2) * 0.55,
                    Math.sin(i * 1.5) * 0.15,
                    Math.sin((i * Math.PI) / 2) * 0.55
                  ]}
                >
                  <boxGeometry args={[0.09, 0.09, 0.09]} />
                  <meshBasicMaterial color="#fb7185" />
                </mesh>
              ))}
            </group>
          </group>
        )}

        {/* E. LEADERSHIP: Royal Solar Crest */}
        {station.type === 'leadership' && (
          <group>
            {/* Radiant Sunburst Core */}
            <mesh>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial 
                color="#fbbf24" 
                emissive="#f59e0b" 
                emissiveIntensity={isNearPlayer ? 1.5 : 0.8} 
              />
            </mesh>
            {/* Crowned Spikes */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <mesh 
                key={i} 
                rotation={[0, 0, (i * Math.PI) / 4]} 
                position={[Math.cos((i * Math.PI) / 4) * 0.42, Math.sin((i * Math.PI) / 4) * 0.42, 0]}
              >
                <coneGeometry args={[0.06, 0.22, 6]} />
                <meshStandardMaterial color="#fef08a" metalness={0.8} roughness={0.2} />
              </mesh>
            ))}
          </group>
        )}

        {/* F. HARBOR WELCOME: Navigational Astrolabe */}
        {station.type === 'astrolabe' && (
          <group ref={ringsRef}>
            <mesh>
              <torusGeometry args={[0.55, 0.035, 8, 32]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.55, 0.035, 8, 32]} />
              <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.55, 0.035, 8, 32]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* North Star Core */}
            <mesh>
              <octahedronGeometry args={[0.22, 0]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        )}

        {/* G. CHRONICLER JOURNEY: Floating Mystic Lantern & Scroll */}
        {station.type === 'chronicler' && (
          <group>
            {/* Lantern Housing */}
            <mesh>
              <cylinderGeometry args={[0.2, 0.25, 0.45, 6]} />
              <meshStandardMaterial color="#78350f" roughness={0.7} />
            </mesh>
            {/* Glowing Lantern Glass Core */}
            <mesh>
              <cylinderGeometry args={[0.15, 0.18, 0.35, 6]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            {/* Spiral Scroll Parchment Ribbon */}
            <mesh rotation={[0.4, 0, 0.4]}>
              <torusGeometry args={[0.48, 0.04, 6, 24]} />
              <meshStandardMaterial color="#fde68a" roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* H. SACRED MANA WELL: Levitating Lotus Prism */}
        {station.type === 'mana_well' && (
          <group>
            <mesh>
              <octahedronGeometry args={[0.45, 0]} />
              <meshStandardMaterial 
                color="#10b981" 
                emissive="#059669" 
                emissiveIntensity={isNearPlayer ? 1.4 : 0.8} 
                roughness={0.1} 
                metalness={0.9} 
              />
            </mesh>
            {/* Surrounding Lotus Petals */}
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh 
                key={i} 
                rotation={[0.4, (i * Math.PI * 2) / 5, 0]}
                position={[Math.sin((i * Math.PI * 2) / 5) * 0.35, -0.15, Math.cos((i * Math.PI * 2) / 5) * 0.35]}
              >
                <coneGeometry args={[0.14, 0.38, 4]} />
                <meshStandardMaterial color="#34d399" roughness={0.3} transparent opacity={0.85} />
              </mesh>
            ))}
          </group>
        )}

        {/* I. CITADEL SUMMIT: Celestial Rift Gateway */}
        {station.type === 'citadel_rift' && (
          <group ref={ringsRef}>
            <mesh>
              <torusGeometry args={[0.85, 0.07, 12, 36]} />
              <meshStandardMaterial color="#06b6d4" emissive="#0284c7" emissiveIntensity={1.2} metalness={0.8} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[0.7, 0.05, 12, 36]} />
              <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={1.2} metalness={0.8} />
            </mesh>
            {/* Dimensional Event Horizon Core */}
            <mesh>
              <sphereGeometry args={[0.4, 24, 24]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        )}

        {/* J. STONEHENGE: Ancient Rune Monolith */}
        {station.type === 'stonehenge' && (
          <group>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.45, 0.9, 0.28]} />
              <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            {/* Glowing Engraved Rune Lines */}
            <mesh position={[0, 0.1, 0.15]}>
              <planeGeometry args={[0.3, 0.7]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.7} />
            </mesh>
          </group>
        )}

        {/* 4. HOVERING INFO BEACON GLYPH ABOVE THE ARTIFACT */}
        <group position={[0, 0.85, 0]}>
          <mesh>
            <octahedronGeometry args={[0.15, 0]} />
            <meshBasicMaterial color={isNearPlayer ? '#ffffff' : station.color} />
          </mesh>
          {/* Subtle Beacon Light Beam if nearby */}
          {isNearPlayer && (
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.04, 0.22, 2.4, 16]} />
              <meshBasicMaterial 
                color={station.color} 
                transparent 
                opacity={0.3} 
                side={THREE.DoubleSide} 
                depthWrite={false} 
              />
            </mesh>
          )}
        </group>

      </group>
    </group>
  );
};

/**
 * StationMonuments: Renders all 26 distinct 3D monuments across the island
 */
export const StationMonuments: React.FC = () => {
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);

  const handleSelectStation = (id: string) => {
    setActiveStationId(id);
    setStationModalOpen(true);
  };

  return (
    <group name="StationMonuments">
      {STATION_MONUMENT_DEFS.map((station) => (
        <SingleStationMonument
          key={station.id}
          station={station}
          onSelect={handleSelectStation}
        />
      ))}
    </group>
  );
};
