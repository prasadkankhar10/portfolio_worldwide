import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Compass, BookOpen, Layers, Menu, Navigation, Sparkles, Ship, Eye, X } from 'lucide-react';

export const HUD: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const isMobile = useGameStore((state) => state.isMobile);
  const magicPrompt = useGameStore((state) => state.magicPrompt);
  const stonehengeBanner = useGameStore((state) => state.stonehengeBanner);
  const setStonehengeBanner = useGameStore((state) => state.setStonehengeBanner);
  const isStationModalOpen = useGameStore((state) => state.isStationModalOpen);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const isTrackerOpen = useGameStore((state) => state.isTrackerOpen);
  const setTrackerOpen = useGameStore((state) => state.setTrackerOpen);
  const isQuickPortfolioOpen = useGameStore((state) => state.isQuickPortfolioOpen);
  
  // Royal Courier Vessel & Cinematic View State
  const courierShipState = useGameStore((state) => state.courierShipState);
  const isWatchingVessel = useGameStore((state) => state.isWatchingVessel);
  const setIsWatchingVessel = useGameStore((state) => state.setIsWatchingVessel);
  const resetCourierShip = useGameStore((state) => state.resetCourierShip);

  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handleLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // Escape key handler to exit vessel cinematic mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWatchingVessel) {
        setIsWatchingVessel(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWatchingVessel, setIsWatchingVessel]);

  const requestLock = () => {
    if (typeof document !== 'undefined') {
      try {
        document.body.requestPointerLock();
      } catch (err) {
        console.warn('Pointer lock request error:', err);
      }
    }
  };

  if (gameState !== 'playing') return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between select-none">
      
      {/* Click-to-Play Glass Overlay (Organic Forest & Gold) */}
      {!isLocked && !isMobile && !isStationModalOpen && !isTrackerOpen && !isQuickPortfolioOpen && (
        <div 
          className="absolute inset-0 bg-[#101a18]/45 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-40 select-none animate-in fade-in duration-300 pointer-events-auto"
          onClick={requestLock}
        >
          <div 
            className="bg-[#182522]/95 border border-[#D4B777]/35 p-7 sm:p-8 rounded-2xl max-w-sm text-center shadow-[0_20px_50px_rgba(10,18,16,0.7)] backdrop-blur-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              requestLock();
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3.5 rounded-full bg-[#527C68]/20 border border-[#D4B777]/30 flex items-center justify-center text-[#D4B777]">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <h2 className="text-[#D4B777] text-lg sm:text-xl font-heading font-bold tracking-tight mb-2">
              Click to Control Camera
            </h2>
            <p className="text-[#E9E4D7]/80 text-xs sm:text-sm font-sans mb-4 leading-relaxed">
              Click anywhere to lock camera control and explore the 3D portfolio.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101a18]/80 border border-[#527C68]/30 text-[11px] font-mono text-[#E9E4D7]/75">
              <span><kbd className="text-[#D4B777] font-bold">M</kbd> Journal</span>
              <span>•</span>
              <span><kbd className="text-[#D4B777] font-bold">N</kbd> Map</span>
              <span>•</span>
              <span><kbd className="text-[#D4B777] font-bold">E</kbd> Stations</span>
              <span>•</span>
              <span><kbd className="text-[#D4B777] font-bold">Esc</kbd> Menu</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-50 p-4 sm:p-6 flex items-start justify-between w-full pointer-events-none">
        
        {/* Left: Understated Key Controls Pill */}
        {!isMobile && (
          <div className="pointer-events-auto flex flex-col gap-1.5 animate-in fade-in duration-500">
            <div className="bg-[#182522]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D4B777]/20 shadow-sm flex items-center gap-2.5 text-xs text-[#E9E4D7]/85 font-sans">
              <span className="flex items-center gap-1 font-mono text-[#D4B777] text-[11px]">
                <kbd className="bg-[#101a18]/80 px-1.5 py-0.5 rounded border border-[#D4B777]/25 text-[#E9E4D7] font-bold">W A S D</kbd>
                <span>Move</span>
              </span>
              <span className="text-[#527C68]/60">·</span>
              <span className="flex items-center gap-1 font-mono text-[#D4B777] text-[11px]">
                <kbd className="bg-[#101a18]/80 px-1.5 py-0.5 rounded border border-[#D4B777]/25 text-[#E9E4D7] font-bold">Shift</kbd>
                <span>Run</span>
              </span>
              <span className="text-[#527C68]/60">·</span>
              <span className="flex items-center gap-1 font-mono text-[#D4B777] text-[11px]">
                <kbd className="bg-[#101a18]/80 px-1.5 py-0.5 rounded border border-[#D4B777]/25 text-[#E9E4D7] font-bold">M</kbd>
                <span>Journal</span>
              </span>
              <span className="text-[#527C68]/60">·</span>
              <span className="flex items-center gap-1 font-mono text-[#D4B777] text-[11px]">
                <kbd className="bg-[#101a18]/80 px-1.5 py-0.5 rounded border border-[#D4B777]/25 text-[#E9E4D7] font-bold">N</kbd>
                <span>Map</span>
              </span>
            </div>
          </div>
        )}

        {/* Center: Understated Organic Compass & Telemetry */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 pointer-events-none animate-in fade-in duration-500">
          <div className="bg-[#182522]/85 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-[#D4B777]/25 shadow-lg flex items-center gap-3.5 text-xs font-mono text-[#E9E4D7]">
            <div className="flex items-center gap-1.5 font-bold border-r border-[#527C68]/30 pr-3">
              <span id="hud-fps-dot" className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span id="hud-fps" className="text-[#D4B777]">60</span>
              <span className="text-[10px] text-[#E9E4D7]/70 font-semibold">FPS</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#D4B777] font-bold border-r border-[#527C68]/30 pr-3">
              <Navigation className="w-3.5 h-3.5" />
              <span>Facing <span id="hud-dir" className="text-[#E9E4D7]">N</span></span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-[#E9E4D7]/80">
              <span>X <span id="hud-x" className="text-[#E9E4D7] font-semibold">0.0</span></span>
              <span className="text-[#527C68]/60">·</span>
              <span>Y <span id="hud-y" className="text-[#E9E4D7] font-semibold">0.0</span></span>
              <span className="text-[#527C68]/60">·</span>
              <span>Z <span id="hud-z" className="text-[#E9E4D7] font-semibold">0.0</span></span>
            </div>
          </div>
        </div>

        {/* Active Courier Vessel Sailing Notification Pill */}
        {courierShipState !== 'moored' && !isWatchingVessel && (
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 pointer-events-auto animate-in slide-in-from-top-2 duration-500 z-40">
            <div className="bg-[#182522]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D4B777]/40 shadow-lg flex items-center gap-3 text-xs font-sans text-[#E9E4D7]">
              <span className="flex items-center gap-1.5 font-mono text-[#D4B777] text-[11px] font-bold">
                <Ship className="w-3.5 h-3.5 animate-pulse text-[#D4B777]" />
                <span>Courier Vessel</span>
              </span>
              <span className="text-[#527C68]/60">·</span>
              <span className="text-[11px] text-[#E9E4D7]/85 hidden sm:inline">
                {courierShipState === 'delivered' ? 'Scroll delivered to open ocean!' : 'Voyaging to deliver message'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWatchingVessel(true);
                }}
                className="px-2.5 py-0.5 rounded-full bg-[#D4B777]/20 hover:bg-[#D4B777]/35 text-[#D4B777] font-mono text-[10px] font-bold border border-[#D4B777]/40 transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Watch Depart</span>
              </button>
              {courierShipState === 'delivered' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCourierShip();
                  }}
                  className="text-[11px] font-mono text-[#E9E4D7]/40 hover:text-[#E9E4D7] ml-0.5"
                  title="Dismiss notice"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cinematic "Watch Vessel Depart" Overlook Controls */}
        {isWatchingVessel && (
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 pointer-events-auto animate-in zoom-in-95 duration-300 z-50">
            <div className="bg-[#182522]/95 border border-[#D4B777]/50 px-5 sm:px-6 py-2.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-4 text-center">
              <div className="w-7 h-7 rounded-lg bg-[#D4B777]/20 border border-[#D4B777]/40 flex items-center justify-center text-[#D4B777] shrink-0">
                <Ship className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-heading font-bold text-[#D4B777] tracking-wider uppercase">
                  Observing Royal Courier Vessel
                </h4>
                <p className="text-[11px] text-[#E9E4D7]/80 font-sans">
                  Sailing past Harbor Pier into open waters to deliver your scroll.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWatchingVessel(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#527C68]/30 hover:bg-[#527C68]/50 border border-[#D4B777]/40 text-[#E9E4D7] hover:text-[#D4B777] text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                Return [ESC]
              </button>
            </div>
          </div>
        )}

        {/* Right: Quick Navigation Hub */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              window.dispatchEvent(new CustomEvent('toggle-world-map'));
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#182522]/90 hover:bg-[#182522] backdrop-blur-md border border-[#D4B777]/30 hover:border-[#D4B777]/60 text-[#E9E4D7] hover:text-[#D4B777] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Expedition Map (N)"
          >
            <Compass className="w-3.5 h-3.5 text-[#D4B777]" />
            <span className="hidden sm:inline">Map</span>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              setTrackerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#182522]/90 hover:bg-[#182522] backdrop-blur-md border border-[#D4B777]/30 hover:border-[#D4B777]/60 text-[#E9E4D7] hover:text-[#D4B777] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Field Journal (M)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4B777]" />
            <span className="hidden sm:inline">Journal</span>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              setStationModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#182522]/90 hover:bg-[#182522] backdrop-blur-md border border-[#D4B777]/30 hover:border-[#D4B777]/60 text-[#E9E4D7] hover:text-[#D4B777] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Stations Directory"
          >
            <Layers className="w-3.5 h-3.5 text-[#D4B777]" />
            <span className="hidden sm:inline">Stations</span>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              setGameState('menu');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#182522]/90 hover:bg-[#182522] backdrop-blur-md border border-[#D4B777]/30 hover:border-[#D4B777]/60 text-[#E9E4D7] hover:text-[#D4B777] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Main Menu (Esc)"
          >
            <Menu className="w-3.5 h-3.5 text-[#D4B777]" />
            <span>Menu</span>
          </button>
        </div>

      </div>

      {/* Exploration Prompt Bubble */}
      {magicPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce z-40">
          <div className="bg-[#182522]/90 backdrop-blur-md px-5 py-2.5 border border-[#D4B777]/40 rounded-full shadow-lg flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#D4B777] animate-ping" />
            <p className="text-[#E9E4D7] font-heading text-xs sm:text-sm font-semibold tracking-wide">
              {magicPrompt}
            </p>
          </div>
        </div>
      )}

      {/* Stonehenge Ancient Sanctuary Blessing Plaque */}
      {stonehengeBanner && (
        <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 z-50 max-w-[540px] w-[92%] text-center pointer-events-auto animate-in fade-in zoom-in-95 duration-400">
          <div className="bg-[#182522]/95 backdrop-blur-xl border border-[#D4B777]/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,18,16,0.8)] flex flex-col items-center">
            <div className="w-10 h-0.5 bg-[#D4B777]/60 mb-3 rounded-full" />
            <div className="flex items-center gap-2 text-[#D4B777] text-xs font-mono uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ancient Megalith Discovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#E9E4D7] tracking-tight mb-3">
              {stonehengeBanner.title}
            </h2>
            <div 
              className="text-[#E9E4D7]/85 text-xs sm:text-sm leading-relaxed font-sans mb-5"
              dangerouslySetInnerHTML={{ __html: stonehengeBanner.bodyHtml }}
            />
            <button
              onClick={() => setStonehengeBanner(null)}
              className="px-6 py-2.5 bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              Accept Blessing
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
