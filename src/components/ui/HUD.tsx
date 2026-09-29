import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Leva } from 'leva';

export const HUD = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const isMobile = useGameStore((state) => state.isMobile);
  const magicPrompt = useGameStore((state) => state.magicPrompt);
  const stonehengeBanner = useGameStore((state) => state.stonehengeBanner);
  const setStonehengeBanner = useGameStore((state) => state.setStonehengeBanner);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
      if (!document.pointerLockElement && gameState === 'playing' && !useGameStore.getState().debugMenuOpen) {
        setGameState('menu');
      }
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, [gameState, setGameState]);

  const debugMenuOpen = useGameStore((state) => state.debugMenuOpen);
  const setDebugMenuOpen = useGameStore((state) => state.setDebugMenuOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        const willOpen = !useGameStore.getState().debugMenuOpen;
        setDebugMenuOpen(willOpen);
        if (willOpen && document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDebugMenuOpen]);

  const requestLock = () => {
    document.body.requestPointerLock();
  };

  if (gameState !== 'playing') return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between" style={{ pointerEvents: (isLocked || isMobile) ? 'none' : 'auto' }}>
      
      {!isLocked && !debugMenuOpen && !isMobile && (
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer z-50"
          onClick={requestLock}
        >
          <div className="bg-stone-900 border border-amber-500/50 p-8 text-center animate-pulse">
            <p className="text-amber-500 text-xl tracking-widest uppercase font-serif mb-2">Click to Play</p>
            <p className="text-stone-400 text-sm">Lock mouse to look around</p>
          </div>
        </div>
      )}
      
      {!isLocked && debugMenuOpen && !isMobile && (
        <div 
          className="absolute inset-0 cursor-pointer z-0"
          onClick={requestLock}
        >
          {/* Clickable background to re-lock pointer when in debug mode */}
        </div>
      )}

      
      {!isMobile && (
        <div className="p-6 flex flex-col gap-2">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-sm border border-white/10 w-fit">
            <span className="text-stone-300 font-mono text-sm tracking-wider uppercase">
              <span className="text-amber-500 font-bold">W A S D</span> Move
            </span>
          </div>
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-sm border border-white/10 w-fit">
            <span className="text-stone-300 font-mono text-sm tracking-wider uppercase">
              <span className="text-amber-500 font-bold">Shift</span> Run
            </span>
          </div>
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-sm border border-white/10 w-fit">
            <span className="text-stone-300 font-mono text-sm tracking-wider uppercase">
              <span className="text-amber-500 font-bold">Scroll</span> Zoom
            </span>
          </div>
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-sm border border-white/10 w-fit">
            <span className="text-stone-300 font-mono text-sm tracking-wider uppercase">
              <span className="text-amber-500 font-bold">M</span> Map / Journal
            </span>
          </div>
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-sm border border-white/10 w-fit">
            <span className="text-stone-300 font-mono text-sm tracking-wider uppercase">
              <span className="text-amber-500 font-bold">` (Backtick)</span> Debug Menu
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-20 right-6 pointer-events-auto z-50" style={{ display: debugMenuOpen ? 'block' : 'none' }}>
        {/* Leva handles its own styling but we wrap it to control positioning and visibility manually just in case */}
      </div>
      <Leva hidden={!debugMenuOpen} collapsed={false} />

      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 border border-white/20 rounded-md shadow-xl">
          <p className="text-stone-300 font-mono text-sm tracking-widest font-semibold flex gap-3">
            <span className="text-red-400">X <span id="hud-x" className="text-white">0.0</span></span>
            <span className="text-green-400">Y <span id="hud-y" className="text-white">0.0</span></span>
            <span className="text-blue-400">Z <span id="hud-z" className="text-white">0.0</span></span>
            <span className="text-amber-400 ml-2 border-l border-white/20 pl-4">Facing <span id="hud-dir" className="text-white">N</span></span>
          </p>
        </div>
      </div>

      {/* Interactive Celestial Magic Prompt */}
      {magicPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce z-40">
          <div className="bg-stone-950/85 backdrop-blur-md px-6 py-3 border border-cyan-400/80 rounded-full shadow-[0_0_25px_rgba(0,229,255,0.5)] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-cyan-200 font-mono text-sm tracking-wider font-semibold">
              {magicPrompt}
            </p>
          </div>
        </div>
      )}

      {/* 3.G Stonehenge Ancient Sanctuary Completion Banner Modal */}
      {stonehengeBanner && (
        <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 z-50 max-w-[560px] w-[92%] text-center pointer-events-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-gradient-to-b from-stone-950/98 via-slate-950/95 to-stone-950/98 backdrop-blur-xl border-2 border-amber-400/90 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(255,213,79,0.5),0_0_70px_rgba(0,229,255,0.25)] flex flex-col items-center">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-3" />
            <h2 className="text-xl sm:text-2xl font-serif tracking-widest text-amber-300 uppercase font-bold drop-shadow-[0_0_14px_rgba(255,213,79,0.7)] mb-3">
              {stonehengeBanner.title}
            </h2>
            <div 
              className="text-cyan-100 text-sm sm:text-base leading-relaxed font-sans mb-5 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]"
              dangerouslySetInnerHTML={{ __html: stonehengeBanner.bodyHtml }}
            />
            <button
              onClick={() => setStonehengeBanner(null)}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-stone-950 font-bold uppercase tracking-wider text-sm rounded-lg shadow-[0_0_20px_rgba(255,213,79,0.7)] transition-all transform hover:scale-105 cursor-pointer"
            >
              ACCEPT BLESSING
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-6 right-6">
        <button 
          onClick={() => {
            if (document.pointerLockElement) document.exitPointerLock();
            setGameState('menu');
          }}
          className="px-4 py-2 bg-black/60 hover:bg-amber-600/80 backdrop-blur-md border border-white/20 text-white font-semibold uppercase tracking-wider text-sm transition-all pointer-events-auto"
        >
          Menu (Esc)
        </button>
      </div>
    </div>
  );
};

