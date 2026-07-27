import React, { useEffect, useRef } from 'react';
import { Joystick } from 'react-joystick-component';
import { useGameStore } from '../../store/useGameStore';
import { Hand, Map, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const MobileControls: React.FC = () => {
  const isMobile = useGameStore(state => state.isMobile);
  const setVirtualJoystick = useGameStore(state => state.setVirtualJoystick);
  const setVirtualCameraDelta = useGameStore(state => state.setVirtualCameraDelta);
  const setVirtualButton = useGameStore(state => state.setVirtualButton);
  const fireInteractEvent = useGameStore(state => state.fireInteractEvent);
  const activeOutlineMesh = useGameStore(state => state.activeOutlineMesh);
  const toggleTracker = useGameStore(state => state.toggleTracker);
  
  const cameraTouchId = useRef<number | null>(null);
  const lastTouch = useRef<{x: number, y: number} | null>(null);
  
  const dpadState = useRef({ up: false, down: false, left: false, right: false });

  const updateDPad = () => {
    let x = 0;
    let y = 0;
    if (dpadState.current.up) y += 1;
    if (dpadState.current.down) y -= 1;
    if (dpadState.current.right) x += 1;
    if (dpadState.current.left) x -= 1;
    setVirtualJoystick(x, y);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none user-select-none">
      
      {/* Right Half: Camera Touch Zone */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-auto touch-none"
        onTouchStart={(e) => {
          // Only register a new touch if we aren't already tracking one
          if (cameraTouchId.current === null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
              const touch = e.changedTouches[i];
              cameraTouchId.current = touch.identifier;
              lastTouch.current = { x: touch.clientX, y: touch.clientY };
              break; // Track the first valid touch in this zone
            }
          }
        }}
        onTouchMove={(e) => {
          if (cameraTouchId.current !== null && lastTouch.current) {
            for (let i = 0; i < e.changedTouches.length; i++) {
              const touch = e.changedTouches[i];
              if (touch.identifier === cameraTouchId.current) {
                const dx = touch.clientX - lastTouch.current.x;
                const dy = touch.clientY - lastTouch.current.y;
                setVirtualCameraDelta(dx, dy);
                lastTouch.current = { x: touch.clientX, y: touch.clientY };
                break;
              }
            }
          }
        }}
        onTouchEnd={(e) => {
          if (cameraTouchId.current !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
              if (e.changedTouches[i].identifier === cameraTouchId.current) {
                cameraTouchId.current = null;
                lastTouch.current = null;
                setVirtualCameraDelta(0, 0);
                break;
              }
            }
          }
        }}
        onTouchCancel={(e) => {
          if (cameraTouchId.current !== null) {
            for (let i = 0; i < e.changedTouches.length; i++) {
              if (e.changedTouches[i].identifier === cameraTouchId.current) {
                cameraTouchId.current = null;
                lastTouch.current = null;
                setVirtualCameraDelta(0, 0);
                break;
              }
            }
          }
        }}
      />

      {/* Map / Journal Button (Top Left) */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <button
          onClick={toggleTracker}
          className="w-12 h-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-400 shadow-xl active:scale-95 active:bg-slate-800 transition-all"
        >
          <Map className="w-6 h-6" />
        </button>
      </div>

      {/* Left 8-Way D-Pad */}
      <div className="absolute bottom-12 left-8 w-40 h-40 grid grid-cols-3 grid-rows-3 gap-1 pointer-events-auto opacity-70 touch-none">
        
        {/* Top-Left */}
        <button
          className="bg-white/10 border border-white/30 rounded-tl-xl flex items-center justify-center text-white active:bg-white/40 touch-none shadow-sm"
          onTouchStart={() => { dpadState.current.up = true; dpadState.current.left = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.up = false; dpadState.current.left = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.up = false; dpadState.current.left = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ></button>
        
        {/* UP */}
        <button
          className="bg-white/20 border-2 border-white/50 rounded-t flex items-center justify-center text-white active:bg-white/40 touch-none shadow-lg"
          onTouchStart={() => { dpadState.current.up = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.up = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.up = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ><ChevronUp size={24} /></button>

        {/* Top-Right */}
        <button
          className="bg-white/10 border border-white/30 rounded-tr-xl flex items-center justify-center text-white active:bg-white/40 touch-none shadow-sm"
          onTouchStart={() => { dpadState.current.up = true; dpadState.current.right = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.up = false; dpadState.current.right = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.up = false; dpadState.current.right = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ></button>
        
        {/* LEFT */}
        <button
          className="bg-white/20 border-2 border-white/50 rounded-l flex items-center justify-center text-white active:bg-white/40 touch-none shadow-lg"
          onTouchStart={() => { dpadState.current.left = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.left = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.left = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ><ChevronLeft size={24} /></button>
        
        {/* Center (Empty) */}
        <div className="bg-black/10 rounded-full shadow-inner"></div>

        {/* RIGHT */}
        <button
          className="bg-white/20 border-2 border-white/50 rounded-r flex items-center justify-center text-white active:bg-white/40 touch-none shadow-lg"
          onTouchStart={() => { dpadState.current.right = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.right = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.right = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ><ChevronRight size={24} /></button>

        {/* Bottom-Left */}
        <button
          className="bg-white/10 border border-white/30 rounded-bl-xl flex items-center justify-center text-white active:bg-white/40 touch-none shadow-sm"
          onTouchStart={() => { dpadState.current.down = true; dpadState.current.left = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.down = false; dpadState.current.left = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.down = false; dpadState.current.left = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ></button>
        
        {/* DOWN */}
        <button
          className="bg-white/20 border-2 border-white/50 rounded-b flex items-center justify-center text-white active:bg-white/40 touch-none shadow-lg"
          onTouchStart={() => { dpadState.current.down = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.down = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.down = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ><ChevronDown size={24} /></button>

        {/* Bottom-Right */}
        <button
          className="bg-white/10 border border-white/30 rounded-br-xl flex items-center justify-center text-white active:bg-white/40 touch-none shadow-sm"
          onTouchStart={() => { dpadState.current.down = true; dpadState.current.right = true; updateDPad(); }}
          onTouchEnd={() => { dpadState.current.down = false; dpadState.current.right = false; updateDPad(); }}
          onTouchCancel={() => { dpadState.current.down = false; dpadState.current.right = false; updateDPad(); }}
          onContextMenu={(e) => e.preventDefault()}
        ></button>
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
