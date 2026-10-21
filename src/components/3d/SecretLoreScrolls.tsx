import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { globalPlayerState } from './Character';

export interface LoreScrollDef {
  id: string;
  title: string;
  locationName: string;
  position: [number, number, number];
  loreText: string;
}

export const LORE_SCROLLS: LoreScrollDef[] = [
  {
    id: 'scroll_harbor_blueprint',
    title: 'Architect\'s Harbor Blueprint',
    locationName: 'Harbor Pier Warehouse',
    position: [104, 3.8, 110],
    loreText: '“Every voyage starts with a bold first commit. When building virtual worlds or bare-metal engines, disciplined structure precedes creative freedom.” — Prasad'
  },
  {
    id: 'scroll_megalith_rune',
    title: 'The Megalith Inscription',
    locationName: 'Ancient Stonehenge Altar',
    position: [35, 4.8, -62],
    loreText: '“Algorithms are modern spells. A compiler takes intention and translates it into electricity flowing across silicon at the speed of light.”'
  },
  {
    id: 'scroll_summit_starmap',
    title: 'Citadel Celestial Star-Map',
    locationName: 'High Citadel Summit Peak',
    position: [1, 31.0, -75],
    loreText: '“From the summit, you realize that mastering software engineering is not about memorizing syntax, but having the tenacity to conquer the mountain step by step.”'
  }
];

export const SecretLoreScrolls: React.FC = () => {
  const collectedScrollIds = useGameStore((s) => s.collectedScrollIds);
  const collectScroll = useGameStore((s) => s.collectScroll);
  const [activeScroll, setActiveScroll] = useState<LoreScrollDef | null>(null);

  const scrollGroupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    scrollGroupRefs.current.forEach((grp, i) => {
      if (grp) {
        grp.rotation.y += delta * 1.5;
        grp.position.y += Math.sin(state.clock.elapsedTime * 2.5 + i) * 0.003;
      }
    });

    // Check distance to player
    const pPos = globalPlayerState.position;
    for (const scroll of LORE_SCROLLS) {
      if (collectedScrollIds.includes(scroll.id)) continue;
      const sPos = new THREE.Vector3(...scroll.position);
      if (pPos.distanceToSquared(sPos) < 9) { // 3 meters
        soundEngine.playBadgeFanfareSound();
        collectScroll(scroll.id);
        setActiveScroll(scroll);
        break;
      }
    }
  });

  return (
    <>
      {LORE_SCROLLS.map((scroll, idx) => {
        const isCollected = collectedScrollIds.includes(scroll.id);
        return (
          <group 
            key={scroll.id} 
            position={scroll.position}
            ref={(el) => (scrollGroupRefs.current[idx] = el)}
          >
            {/* Golden Scroll Cylinder */}
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
              <meshStandardMaterial 
                color={isCollected ? '#71717a' : '#fbbf24'} 
                emissive={isCollected ? '#27272a' : '#d97706'} 
                emissiveIntensity={isCollected ? 0.2 : 0.8}
                metalness={0.6}
                roughness={0.3}
              />
            </mesh>

            {/* Glowing Rune Orb above Scroll */}
            {!isCollected && (
              <mesh position={[0, 0.45, 0]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshBasicMaterial color="#fef08a" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Discovered Lore Scroll Modal */}
      {activeScroll && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 pointer-events-auto"
          onClick={() => setActiveScroll(null)}
        >
          <div 
            className="game-frame game-corner-brackets rounded-3xl p-6 sm:p-8 max-w-lg w-full bg-[#1B2822] border-2 border-[#D6BC83] shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-center text-[#F0E9DA]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#D6BC83]/20 border border-[#D6BC83]/50 flex items-center justify-center text-[#D6BC83] text-xl font-bold animate-bounce">
              📜
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#D6BC83] font-bold">
              Secret Ancient Lore Discovered
            </span>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-[#F0E9DA] mt-1 mb-2">
              {activeScroll.title}
            </h3>
            <p className="text-xs font-mono text-[#D6BC83]/80 mb-4">
              Found at: {activeScroll.locationName}
            </p>
            <div className="p-4 rounded-2xl bg-[#111916]/80 border border-[#3A4B40]/30 italic text-sm font-serif leading-relaxed text-[#F0E9DA]/90 mb-6">
              {activeScroll.loreText}
            </div>
            <button
              onClick={() => setActiveScroll(null)}
              className="game-btn-tactile game-btn-gold px-6 py-2 text-xs font-heading font-bold"
            >
              Add to Codex & Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};
