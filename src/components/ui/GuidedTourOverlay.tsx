import React, { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TOUR_STOPS } from '../3d/GuidedTourController';
import { soundEngine } from '../../utils/soundEngine';
import { Compass, ChevronLeft, ChevronRight, X, ExternalLink, MapPin } from 'lucide-react';

export const GuidedTourOverlay: React.FC = () => {
  const isGuidedTourActive = useGameStore((state) => state.isGuidedTourActive);
  const setIsGuidedTourActive = useGameStore((state) => state.setIsGuidedTourActive);
  const guidedTourIndex = useGameStore((state) => state.guidedTourIndex);
  const setGuidedTourIndex = useGameStore((state) => state.setGuidedTourIndex);
  const teleportPlayer = useGameStore((state) => state.teleportPlayer);
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);

  const currentStop = TOUR_STOPS[guidedTourIndex] || TOUR_STOPS[0];

  // Keyboard navigation for tour: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!isGuidedTourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playClickSound();
        setIsGuidedTourActive(false);
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        if (guidedTourIndex < TOUR_STOPS.length - 1) {
          soundEngine.playClickSound();
          setGuidedTourIndex(guidedTourIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        if (guidedTourIndex > 0) {
          soundEngine.playClickSound();
          setGuidedTourIndex(guidedTourIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGuidedTourActive, guidedTourIndex, setIsGuidedTourActive, setGuidedTourIndex]);

  if (!isGuidedTourActive) return null;

  const handleNext = () => {
    soundEngine.playClickSound();
    if (guidedTourIndex < TOUR_STOPS.length - 1) {
      setGuidedTourIndex(guidedTourIndex + 1);
    } else {
      setIsGuidedTourActive(false);
    }
  };

  const handlePrev = () => {
    soundEngine.playClickSound();
    if (guidedTourIndex > 0) {
      setGuidedTourIndex(guidedTourIndex - 1);
    }
  };

  const handleExploreHere = () => {
    soundEngine.playTeleportSound();
    const [x, y, z] = currentStop.lookAt;
    teleportPlayer({ x, y: y + 0.5, z: z + 2.0 });
    setIsGuidedTourActive(false);
  };

  const handleInspectStation = () => {
    soundEngine.playClickSound();
    setActiveStationId(currentStop.stationId);
    setStationModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between select-none animate-in fade-in duration-500">
      
      {/* Top Letterbox Bar */}
      <div className="w-full bg-gradient-to-b from-[#0a1210]/90 to-transparent pt-6 pb-12 px-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4B777]/20 border border-[#D4B777]/50 flex items-center justify-center text-[#D4B777]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-[#D4B777] font-heading font-bold text-sm tracking-widest uppercase">
              Cinematic Guided Tour
            </h2>
            <p className="text-[#E9E4D7]/60 text-xs font-sans">
              Autopilot showcase of key software architectures & achievements
            </p>
          </div>
        </div>

        {/* Exit Tour Button */}
        <button
          onClick={() => {
            soundEngine.playClickSound();
            setIsGuidedTourActive(false);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#182522]/90 hover:bg-[#182522] border border-[#D4B777]/40 hover:border-[#D4B777]/80 text-[#E9E4D7] hover:text-[#D4B777] text-xs font-heading font-semibold transition-all cursor-pointer shadow-lg hover:scale-105"
        >
          <span>Exit Tour</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#101a18] text-[10px] text-[#D4B777] font-mono font-bold">ESC</kbd>
          <X className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* Bottom Cinematic Card & Step Controls */}
      <div className="w-full bg-gradient-to-t from-[#0a1210]/95 via-[#0a1210]/80 to-transparent pt-12 pb-8 px-4 sm:px-8 flex flex-col items-center pointer-events-auto">
        
        {/* Main Exhibit Card */}
        <div className="w-full max-w-2xl bg-[#182522]/95 border border-[#D4B777]/40 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all">
          
          {/* Header Pill & Step Dots */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#D4B777] bg-[#527C68]/20 border border-[#D4B777]/30 px-3 py-1 rounded-full">
              {currentStop.badge}
            </span>

            {/* Navigation Dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STOPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    soundEngine.playClickSound();
                    setGuidedTourIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === guidedTourIndex 
                      ? 'w-6 bg-[#D4B777] shadow-[0_0_8px_#D4B777]' 
                      : 'w-2 bg-[#527C68]/40 hover:bg-[#527C68]'
                  }`}
                  title={`Go to ${s.title}`}
                />
              ))}
            </div>
          </div>

          {/* Titles */}
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#E9E4D7] tracking-tight mb-1">
            {currentStop.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#D4B777] font-heading font-medium mb-3">
            {currentStop.tagline}
          </p>
          <p className="text-xs sm:text-sm text-[#E9E4D7]/80 font-sans leading-relaxed mb-6">
            {currentStop.description}
          </p>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#527C68]/25">
            <div className="flex items-center gap-2">
              <button
                onClick={handleInspectStation}
                className="px-3.5 py-1.5 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Read Full Exhibit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExploreHere}
                className="px-3.5 py-1.5 rounded-xl bg-[#527C68]/30 hover:bg-[#527C68]/50 border border-[#D4B777]/35 text-[#E9E4D7] font-heading font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D4B777]" />
                <span>Explore From Here</span>
              </button>
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={guidedTourIndex === 0}
                className={`p-2 rounded-xl border border-[#D4B777]/30 flex items-center justify-center transition-all ${
                  guidedTourIndex === 0
                    ? 'opacity-30 cursor-not-allowed text-[#E9E4D7]/30'
                    : 'hover:bg-[#527C68]/30 text-[#E9E4D7] hover:text-[#D4B777] cursor-pointer'
                }`}
                title="Previous Stop"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-[#D4B777]/20 hover:bg-[#D4B777]/35 border border-[#D4B777]/50 text-[#D4B777] font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>{guidedTourIndex === TOUR_STOPS.length - 1 ? 'Finish Tour' : 'Next Stop'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
