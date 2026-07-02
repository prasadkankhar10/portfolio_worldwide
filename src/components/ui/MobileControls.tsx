import React, { useEffect, useRef } from 'react';
import { Joystick } from 'react-joystick-component';
import { useGameStore } from '../../store/useGameStore';
import { Hand } from 'lucide-react';

export const MobileControls: React.FC = () => {
  const isMobile = useGameStore(state => state.isMobile);
  const setVirtualJoystick = useGameStore(state => state.setVirtualJoystick);
  const setVirtualCameraDelta = useGameStore(state => state.setVirtualCameraDelta);
  const setVirtualButton = useGameStore(state => state.setVirtualButton);
  const fireInteractEvent = useGameStore(state => state.fireInteractEvent);
  const activeOutlineMesh = useGameStore(state => state.activeOutlineMesh);
  
  const lastTouch = useRef<{x: number, y: number} | null>(null);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none user-select-none">
      
      {/* Right Half: Camera Touch Zone */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto touch-none"
        onTouchStart={(e) => {
          lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchMove={(e) => {
          if (lastTouch.current) {
            const dx = e.touches[0].clientX - lastTouch.current.x;
            const dy = e.touches[0].clientY - lastTouch.current.y;
            setVirtualCameraDelta(dx, dy);
            lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        }}
        onTouchEnd={() => {
          lastTouch.current = null;
          setVirtualCameraDelta(0, 0);
        }}
      />

      {/* Left Joystick */}
      <div className="absolute bottom-12 left-12 pointer-events-auto opacity-70">
        <Joystick 
          size={120} 
          sticky={false} 
          baseColor="rgba(255,255,255,0.2)" 
          stickColor="rgba(255,255,255,0.8)" 
          move={(e) => {
            // react-joystick-component gives x and y in pixels from center
            // normalize to roughly -1 to 1 based on size/2
            const max = 60; 
            const nx = (e.x || 0) / max;
            const ny = (e.y || 0) / max;
            // The stick pushes 'forward' when Y is positive in some coordinate systems,
            // but typical screen coords: up is negative Y. 
            // We'll pass it raw and flip in Character.tsx if needed.
            setVirtualJoystick(nx, ny);
          }} 
          stop={() => setVirtualJoystick(0, 0)} 
        />
      </div>

      {/* Right Action Buttons */}
      <div className="absolute bottom-12 right-12 flex flex-col gap-4 pointer-events-auto">
        <button 
          className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 backdrop-blur-md flex items-center justify-center text-white font-bold text-sm active:bg-white/40 active:scale-95 transition-all touch-none"
          onTouchStart={() => setVirtualButton('run', true)}
          onTouchEnd={() => setVirtualButton('run', false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          SPRINT
        </button>
        <button 
          className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 backdrop-blur-md flex items-center justify-center text-white font-bold text-sm active:bg-white/40 active:scale-95 transition-all touch-none"
          onTouchStart={() => setVirtualButton('jump', true)}
          onTouchEnd={() => setVirtualButton('jump', false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          JUMP
        </button>
      </div>

      {/* Center Interact Button */}
      {activeOutlineMesh && (
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 pointer-events-auto">
          <button 
            className="w-20 h-20 rounded-full bg-amber-500/80 border-4 border-amber-300 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.6)] active:scale-95 transition-all touch-none animate-bounce"
            onTouchStart={() => fireInteractEvent()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Hand size={32} />
          </button>
        </div>
      )}
    </div>
  );
};
