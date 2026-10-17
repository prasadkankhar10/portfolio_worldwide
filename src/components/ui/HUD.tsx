import React, { useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { STATION_MONUMENT_DEFS } from '../3d/StationMonuments';
import { soundEngine } from '../../utils/soundEngine';
import { 
  Compass, BookOpen, Layers, Menu, Navigation, Sparkles, 
  Ship, Eye, X, Volume2, VolumeX, FileText, Award, MapPin 
} from 'lucide-react';

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
  
  // UX Features: Audio, Tour, Waypoint & Exploration Codex
  const isAudioMuted = useGameStore((state) => state.isAudioMuted);
  const toggleAudioMute = useGameStore((state) => state.toggleAudioMute);
  const isGuidedTourActive = useGameStore((state) => state.isGuidedTourActive);
  const setIsGuidedTourActive = useGameStore((state) => state.setIsGuidedTourActive);
  const visitedStationIds = useGameStore((state) => state.visitedStationIds);
  const latestUnlockedBadge = useGameStore((state) => state.latestUnlockedBadge);
  const clearLatestBadge = useGameStore((state) => state.clearLatestBadge);
  const activeWaypointStationId = useGameStore((state) => state.activeWaypointStationId);
  const setActiveWaypointStationId = useGameStore((state) => state.setActiveWaypointStationId);

  // Royal Courier Vessel & Cinematic View State
  const courierShipState = useGameStore((state) => state.courierShipState);
  const isWatchingVessel = useGameStore((state) => state.isWatchingVessel);
  const setIsWatchingVessel = useGameStore((state) => state.setIsWatchingVessel);
  const resetCourierShip = useGameStore((state) => state.resetCourierShip);

  const [isLocked, setIsLocked] = useState(false);

  // Auto-dismiss unlocked milestone badges after 6 seconds
  useEffect(() => {
    if (latestUnlockedBadge) {
      soundEngine.playBadgeFanfareSound();
      const timer = setTimeout(() => {
        clearLatestBadge();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [latestUnlockedBadge, clearLatestBadge]);

  const waypointStation = useMemo(() => {
    if (!activeWaypointStationId) return null;
    return STATION_MONUMENT_DEFS.find((s) => s.id === activeWaypointStationId) || null;
  }, [activeWaypointStationId]);

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
    soundEngine.playClickSound();
    soundEngine.startAmbientAtmosphere();
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
          className="absolute inset-0 bg-[#111916]/45 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-40 select-none animate-in fade-in duration-300 pointer-events-auto"
          onClick={requestLock}
        >
          <div 
            className="bg-[#1B2822]/95 border border-[#D6BC83]/35 p-7 sm:p-8 rounded-2xl max-w-sm text-center shadow-[0_20px_50px_rgba(10,18,16,0.7)] backdrop-blur-xl transition-all hover:scale-[1.02] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              requestLock();
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3.5 rounded-full bg-[#3A4B40]/20 border border-[#D6BC83]/30 flex items-center justify-center text-[#D6BC83]">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <h2 className="text-[#D6BC83] text-lg sm:text-xl font-heading font-bold tracking-tight mb-2">
              Click to Control Camera
            </h2>
            <p className="text-[#F0E9DA]/80 text-xs sm:text-sm font-sans mb-4 leading-relaxed">
              Click anywhere to lock camera control and explore the 3D portfolio.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111916]/80 border border-[#3A4B40]/30 text-[11px] font-mono text-[#F0E9DA]/75">
              <span><kbd className="text-[#D6BC83] font-bold">M</kbd> Journal</span>
              <span>•</span>
              <span><kbd className="text-[#D6BC83] font-bold">N</kbd> Map</span>
              <span>•</span>
              <span><kbd className="text-[#D6BC83] font-bold">E</kbd> Stations</span>
              <span>•</span>
              <span><kbd className="text-[#D6BC83] font-bold">Esc</kbd> Menu</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <div className="relative z-50 p-4 sm:p-6 flex items-start justify-between w-full pointer-events-none">
        
        {/* Left: Understated Key Controls Pill & Exploration Progress */}
        {!isMobile && (
          <div className="pointer-events-auto flex flex-col gap-2 animate-in fade-in duration-500">
            <div className="bg-[#1B2822]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D6BC83]/20 shadow-sm flex items-center gap-2.5 text-xs text-[#F0E9DA]/85 font-sans">
              <span className="flex items-center gap-1 font-mono text-[#D6BC83] text-[11px]">
                <kbd className="bg-[#111916]/80 px-1.5 py-0.5 rounded border border-[#D6BC83]/25 text-[#F0E9DA] font-bold">W A S D</kbd>
                <span>Move</span>
              </span>
              <span className="text-[#3A4B40]/60">·</span>
              <span className="flex items-center gap-1 font-mono text-[#D6BC83] text-[11px]">
                <kbd className="bg-[#111916]/80 px-1.5 py-0.5 rounded border border-[#D6BC83]/25 text-[#F0E9DA] font-bold">Shift</kbd>
                <span>Run</span>
              </span>
              <span className="text-[#3A4B40]/60">·</span>
              <span className="flex items-center gap-1 font-mono text-[#D6BC83] text-[11px]">
                <kbd className="bg-[#111916]/80 px-1.5 py-0.5 rounded border border-[#D6BC83]/25 text-[#F0E9DA] font-bold">M</kbd>
                <span>Journal</span>
              </span>
              <span className="text-[#3A4B40]/60">·</span>
              <span className="flex items-center gap-1 font-mono text-[#D6BC83] text-[11px]">
                <kbd className="bg-[#111916]/80 px-1.5 py-0.5 rounded border border-[#D6BC83]/25 text-[#F0E9DA] font-bold">N</kbd>
                <span>Map</span>
              </span>
            </div>

            {/* Exploration Progress Pill */}
            <button
              onClick={() => {
                soundEngine.playClickSound();
                if (typeof document !== 'undefined' && document.pointerLockElement) {
                  document.exitPointerLock();
                }
                setTrackerOpen(true);
              }}
              className="bg-[#1B2822]/85 hover:bg-[#1B2822] backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 shadow-sm flex items-center gap-2.5 text-xs font-heading font-medium text-[#F0E9DA] transition-all cursor-pointer w-fit"
              title="View Exploration Codex & Badges (M)"
            >
              <Award className="w-3.5 h-3.5 text-[#D6BC83]" />
              <span>Explored:</span>
              <span className="font-mono text-[#D6BC83] font-bold">
                {visitedStationIds.length} / 18
              </span>
              <div className="w-14 h-1.5 bg-[#111916] rounded-full overflow-hidden border border-[#3A4B40]/30">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#D6BC83] transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.round((visitedStationIds.length / 18) * 100))}%` }}
                />
              </div>
            </button>
          </div>
        )}

        {/* Center: Understated Organic Compass & Telemetry */}
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 pointer-events-none animate-in fade-in duration-500">
          <div className="bg-[#1B2822]/85 backdrop-blur-md px-4 sm:px-6 py-2 rounded-full border border-[#D6BC83]/25 shadow-lg flex items-center gap-3.5 text-xs font-mono text-[#F0E9DA]">
            <div className="flex items-center gap-1.5 font-bold border-r border-[#3A4B40]/30 pr-3">
              <span id="hud-fps-dot" className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span id="hud-fps" className="text-[#D6BC83]">60</span>
              <span className="text-[10px] text-[#F0E9DA]/70 font-semibold">FPS</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#D6BC83] font-bold border-r border-[#3A4B40]/30 pr-3">
              <Navigation className="w-3.5 h-3.5" />
              <span>Facing <span id="hud-dir" className="text-[#F0E9DA]">N</span></span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-[#F0E9DA]/80">
              <span>X <span id="hud-x" className="text-[#F0E9DA] font-semibold">0.0</span></span>
              <span className="text-[#3A4B40]/60">·</span>
              <span>Y <span id="hud-y" className="text-[#F0E9DA] font-semibold">0.0</span></span>
              <span className="text-[#3A4B40]/60">·</span>
              <span>Z <span id="hud-z" className="text-[#F0E9DA] font-semibold">0.0</span></span>
            </div>
          </div>
        </div>

        {/* Active Harbor Boat Sailing Notification Pill */}
        {courierShipState !== 'moored' && !isWatchingVessel && (
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 pointer-events-auto animate-in slide-in-from-top-2 duration-500 z-40">
            <div className="bg-[#1B2822]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D6BC83]/40 shadow-lg flex items-center gap-3 text-xs font-sans text-[#F0E9DA]">
              <span className="flex items-center gap-1.5 font-mono text-[#D6BC83] text-[11px] font-bold">
                <Ship className="w-3.5 h-3.5 animate-pulse text-[#D6BC83]" />
                <span>Harbor Boat</span>
              </span>
              <span className="text-[#3A4B40]/60">·</span>
              <span className="text-[11px] text-[#F0E9DA]/85 hidden sm:inline">
                {courierShipState === 'delivered' ? 'Message sent! Boat has reached the open ocean.' : 'Boat is sailing across the harbor'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWatchingVessel(true);
                }}
                className="px-2.5 py-0.5 rounded-full bg-[#D6BC83]/20 hover:bg-[#D6BC83]/35 text-[#D6BC83] font-mono text-[10px] font-bold border border-[#D6BC83]/40 transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Watch Boat</span>
              </button>
              {courierShipState === 'delivered' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCourierShip();
                  }}
                  className="text-[11px] font-mono text-[#F0E9DA]/40 hover:text-[#F0E9DA] ml-0.5"
                  title="Dismiss notice"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Cinematic "Watch Boat" Overlook Controls */}
        {isWatchingVessel && (
          <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 pointer-events-auto animate-in zoom-in-95 duration-300 z-50">
            <div className="bg-[#1B2822]/95 border border-[#D6BC83]/50 px-5 sm:px-6 py-2.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md flex items-center gap-4 text-center">
              <div className="w-7 h-7 rounded-lg bg-[#D6BC83]/20 border border-[#D6BC83]/40 flex items-center justify-center text-[#D6BC83] shrink-0">
                <Ship className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-heading font-bold text-[#D6BC83] tracking-wider uppercase">
                  Observing Harbor Boat
                </h4>
                <p className="text-[11px] text-[#F0E9DA]/80 font-sans">
                  Sailing past Harbor Pier into open waters after delivering your message.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWatchingVessel(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#3A4B40]/30 hover:bg-[#3A4B40]/50 border border-[#D6BC83]/40 text-[#F0E9DA] hover:text-[#D6BC83] text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                Return [ESC]
              </button>
            </div>
          </div>
        )}

        {/* Right: Quick Navigation Hub */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Autopilot Guided Tour Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              soundEngine.playClickSound();
              setIsGuidedTourActive(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D6BC83]/20 hover:bg-[#D6BC83]/35 backdrop-blur-md border border-[#D6BC83]/50 text-[#D6BC83] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Start Autopilot Guided Tour"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D6BC83]" />
            <span className="hidden sm:inline">Tour</span>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              window.dispatchEvent(new CustomEvent('toggle-world-map'));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2822]/90 hover:bg-[#1B2822] backdrop-blur-md border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Expedition Map (N)"
          >
            <Compass className="w-3.5 h-3.5 text-[#D6BC83]" />
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2822]/90 hover:bg-[#1B2822] backdrop-blur-md border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Field Journal (M)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D6BC83]" />
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2822]/90 hover:bg-[#1B2822] backdrop-blur-md border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Stations Directory"
          >
            <Layers className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span className="hidden sm:inline">Stations</span>
          </button>

          {/* Quick Resume PDF Download / Recruiter Access */}
          <a
            href={`${import.meta.env.BASE_URL}assets/Prasad_Kankhar_Resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playClickSound();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2822]/90 hover:bg-[#1B2822] backdrop-blur-md border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Official Resume PDF"
          >
            <FileText className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span className="hidden md:inline">Resume</span>
          </a>

          {/* Audio Mute / Unmute Toggle */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleAudioMute();
              if (isAudioMuted) {
                soundEngine.playClickSound();
                soundEngine.startAmbientAtmosphere();
              } else {
                soundEngine.stopAmbientAtmosphere();
              }
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full backdrop-blur-md border flex items-center gap-1 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 ${
              isAudioMuted 
                ? 'bg-red-950/40 border-red-500/40 text-red-300' 
                : 'bg-[#1B2822]/90 border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83]'
            }`}
            title={isAudioMuted ? 'Unmute Audio (Ocean Breeze & SFX)' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D6BC83]" />}
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.pointerLockElement) {
                document.exitPointerLock();
              }
              setGameState('menu');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2822]/90 hover:bg-[#1B2822] backdrop-blur-md border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83] font-sans font-semibold text-xs rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Main Menu (Esc)"
          >
            <Menu className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span>Menu</span>
          </button>
        </div>

      </div>

      {/* Active GPS Waypoint Navigation Banner */}
      {waypointStation && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 pointer-events-auto animate-in slide-in-from-top-2 duration-300 z-40">
          <div className="bg-[#1B2822]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D6BC83]/50 shadow-xl flex items-center gap-2.5 text-xs font-sans text-[#F0E9DA]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Navigation className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span className="font-heading font-bold text-[#D6BC83]">Waypoint:</span>
            <span className="text-white font-medium">{waypointStation.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playClickSound();
                setActiveWaypointStationId(null);
              }}
              className="p-1 rounded-full hover:bg-white/10 text-[#F0E9DA]/60 hover:text-white transition-colors cursor-pointer ml-1"
              title="Cancel Waypoint"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Milestone Achievement Unlocked Toast Banner */}
      {latestUnlockedBadge && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto animate-in zoom-in-95 duration-300">
          <div className="bg-[#1B2822]/98 border-2 border-[#D6BC83] px-6 py-3.5 rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex items-center gap-4 text-[#F0E9DA]">
            <div className="text-3xl select-none animate-bounce">
              {latestUnlockedBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#D6BC83] font-bold">
                <Sparkles className="w-3 h-3 text-[#D6BC83]" />
                <span>Achievement Unlocked</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-[#F0E9DA] tracking-tight">
                {latestUnlockedBadge.title}
              </h4>
              <p className="text-xs text-[#F0E9DA]/75 font-sans">
                {latestUnlockedBadge.desc}
              </p>
            </div>
            <button
              onClick={() => {
                soundEngine.playClickSound();
                clearLatestBadge();
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Exploration Prompt Bubble */}
      {magicPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce z-40">
          <div className="bg-[#1B2822]/90 backdrop-blur-md px-5 py-2.5 border border-[#D6BC83]/40 rounded-full shadow-lg flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#D6BC83] animate-ping" />
            <p className="text-[#F0E9DA] font-heading text-xs sm:text-sm font-semibold tracking-wide">
              {magicPrompt}
            </p>
          </div>
        </div>
      )}

      {/* Stonehenge Ancient Sanctuary Blessing Plaque */}
      {stonehengeBanner && (
        <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 z-50 max-w-[540px] w-[92%] text-center pointer-events-auto animate-in fade-in zoom-in-95 duration-400">
          <div className="bg-[#1B2822]/95 backdrop-blur-xl border border-[#D6BC83]/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,18,16,0.8)] flex flex-col items-center">
            <div className="w-10 h-0.5 bg-[#D6BC83]/60 mb-3 rounded-full" />
            <div className="flex items-center gap-2 text-[#D6BC83] text-xs font-mono uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ancient Megalith Discovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#F0E9DA] tracking-tight mb-3">
              {stonehengeBanner.title}
            </h2>
            <div 
              className="text-[#F0E9DA]/85 text-xs sm:text-sm leading-relaxed font-sans mb-5"
              dangerouslySetInnerHTML={{ __html: stonehengeBanner.bodyHtml }}
            />
            <button
              onClick={() => setStonehengeBanner(null)}
              className="px-6 py-2.5 bg-[#D6BC83] hover:bg-[#E8D5A7] text-[#1B2822] font-heading font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
            >
              Accept Blessing
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
