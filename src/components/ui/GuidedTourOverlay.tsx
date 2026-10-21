import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TOUR_STOPS } from '../3d/GuidedTourController';
import { soundEngine } from '../../utils/soundEngine';
import { 
  Compass, ChevronLeft, ChevronRight, X, ExternalLink, MapPin, 
  FileText, Mail, Play, Pause 
} from 'lucide-react';

export const GuidedTourOverlay: React.FC = () => {
  const isGuidedTourActive = useGameStore((state) => state.isGuidedTourActive);
  const setIsGuidedTourActive = useGameStore((state) => state.setIsGuidedTourActive);
  const guidedTourIndex = useGameStore((state) => state.guidedTourIndex);
  const setGuidedTourIndex = useGameStore((state) => state.setGuidedTourIndex);
  const teleportPlayer = useGameStore((state) => state.teleportPlayer);
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);

  const [timeLeft, setTimeLeft] = useState(12);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentStop = TOUR_STOPS[guidedTourIndex] || TOUR_STOPS[0];
  const isFinalStop = guidedTourIndex === TOUR_STOPS.length - 1;

  // Auto-progression countdown timer
  useEffect(() => {
    if (!isGuidedTourActive || !isAutoPlaying) return;
    setTimeLeft(12);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (guidedTourIndex < TOUR_STOPS.length - 1) {
            setGuidedTourIndex(guidedTourIndex + 1);
            return 12;
          } else {
            setIsAutoPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isGuidedTourActive, guidedTourIndex, isAutoPlaying, setGuidedTourIndex]);

  // Keyboard navigation for tour: ArrowLeft, ArrowRight, Escape, Space to pause
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
      } else if (e.key === 'Space') {
        e.preventDefault();
        setIsAutoPlaying((p) => !p);
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
      <div className="w-full bg-gradient-to-b from-[#0a1210]/95 to-transparent pt-6 pb-12 px-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D6BC83]/20 border border-[#D6BC83]/50 flex items-center justify-center text-[#D6BC83]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[#D6BC83] font-heading font-bold text-sm tracking-widest uppercase">
                Cinematic Autopilot Tour
              </h2>
              {isAutoPlaying && !isFinalStop && (
                <span className="text-[10px] font-mono text-[#F0E9DA]/60 bg-[#111916]/80 px-2 py-0.5 rounded border border-[#3A4B40]/40">
                  Auto-next in <strong className="text-[#D6BC83]">{timeLeft}s</strong>
                </span>
              )}
            </div>
            <p className="text-[#F0E9DA]/60 text-xs font-sans">
              Autopilot showcase of key software architectures & achievements
            </p>
          </div>
        </div>

        {/* Top Controls: Pause/Play & Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 rounded-full bg-[#1B2822]/90 hover:bg-[#1B2822] border border-[#D6BC83]/40 text-[#F0E9DA] hover:text-[#D6BC83] text-xs transition-all cursor-pointer shadow-lg"
            title={isAutoPlaying ? "Pause Auto-tour" : "Resume Auto-tour"}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playClickSound();
              setIsGuidedTourActive(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B2822]/90 hover:bg-[#1B2822] border border-[#D6BC83]/40 hover:border-[#D6BC83]/80 text-[#F0E9DA] hover:text-[#D6BC83] text-xs font-heading font-semibold transition-all cursor-pointer shadow-lg hover:scale-105"
          >
            <span>Exit Tour</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#111916] text-[10px] text-[#D6BC83] font-mono font-bold">ESC</kbd>
            <X className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Bottom Cinematic Card & Step Controls */}
      <div className="w-full bg-gradient-to-t from-[#0a1210]/95 via-[#0a1210]/80 to-transparent pt-12 pb-8 px-4 sm:px-8 flex flex-col items-center pointer-events-auto">
        
        {/* Main Exhibit Card */}
        <div className="w-full max-w-2xl bg-[#1B2822]/95 border-2 border-[#D6BC83]/50 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all">
          
          {/* Header Pill & Step Dots */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#D6BC83] bg-[#3A4B40]/20 border border-[#D6BC83]/30 px-3 py-1 rounded-full font-bold">
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
                      ? 'w-6 bg-[#D6BC83] shadow-[0_0_8px_#D6BC83]' 
                      : 'w-2 bg-[#3A4B40]/40 hover:bg-[#3A4B40]'
                  }`}
                  title={`Go to ${s.title}`}
                />
              ))}
            </div>
          </div>

          {/* Titles */}
          <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#F0E9DA] tracking-tight mb-1">
            {currentStop.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#D6BC83] font-heading font-medium mb-3">
            {currentStop.tagline}
          </p>
          <p className="text-xs sm:text-sm text-[#F0E9DA]/85 font-sans leading-relaxed mb-6">
            {currentStop.description}
          </p>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#3A4B40]/30">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleInspectStation}
                className="px-3.5 py-1.5 rounded-xl bg-[#D6BC83] hover:bg-[#E8D5A7] text-[#1B2822] font-heading font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Read Full Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExploreHere}
                className="px-3.5 py-1.5 rounded-xl bg-[#3A4B40]/30 hover:bg-[#3A4B40]/50 border border-[#D6BC83]/35 text-[#F0E9DA] font-heading font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#D6BC83]" />
                <span>Explore From Here</span>
              </button>

              <a
                href={`${import.meta.env.BASE_URL}assets/Prasad_Kankhar_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                className="game-btn-tactile game-btn-slate px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#D6BC83]" />
                <span>Resume PDF</span>
              </a>

              <a
                href="mailto:prasadkankhar5@gmail.com?subject=Technical%20Interview%20Invitation%20-%20Prasad%20Kankhar"
                className="game-btn-tactile game-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-bold"
              >
                <Mail className="w-3.5 h-3.5 text-[#17221C]" />
                <span>Interview</span>
              </a>
            </div>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={guidedTourIndex === 0}
                className={`p-2 rounded-xl border border-[#D6BC83]/30 flex items-center justify-center transition-all ${
                  guidedTourIndex === 0
                    ? 'opacity-30 cursor-not-allowed text-[#F0E9DA]/30'
                    : 'hover:bg-[#3A4B40]/30 text-[#F0E9DA] hover:text-[#D6BC83] cursor-pointer'
                }`}
                title="Previous Stop"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-[#D6BC83]/20 hover:bg-[#D6BC83]/35 border border-[#D6BC83]/50 text-[#D6BC83] font-heading font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>{isFinalStop ? 'Finish Tour' : 'Next Stop'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
