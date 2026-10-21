import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SPEEDRUN_STOPS } from '../3d/RecruiterSpeedrunController';
import { soundEngine } from '../../utils/soundEngine';
import { 
  Zap, ChevronRight, ChevronLeft, X, Mail, FileText, 
  ExternalLink, Compass, CheckCircle2, Award
} from 'lucide-react';

export const RecruiterSpeedrunHUD: React.FC = () => {
  const isRecruiterSpeedrun = useGameStore((s) => s.isRecruiterSpeedrun);
  const speedrunIndex = useGameStore((s) => s.speedrunIndex);
  const setSpeedrunIndex = useGameStore((s) => s.setSpeedrunIndex);
  const stopRecruiterSpeedrun = useGameStore((s) => s.stopRecruiterSpeedrun);
  const setQuickPortfolioOpen = useGameStore((s) => s.setQuickPortfolioOpen);

  const [timeLeft, setTimeLeft] = useState<number>(10);

  const currentStop = SPEEDRUN_STOPS[speedrunIndex] || SPEEDRUN_STOPS[0];
  const isFinalStop = speedrunIndex === SPEEDRUN_STOPS.length - 1;

  useEffect(() => {
    if (!isRecruiterSpeedrun) return;
    setTimeLeft(currentStop.duration);

    if (isFinalStop) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return currentStop.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecruiterSpeedrun, speedrunIndex, currentStop.duration, isFinalStop]);

  if (!isRecruiterSpeedrun) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-300 select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#111916]/90 border border-[#D6BC83]/40 shadow-xl backdrop-blur-md">
          <Zap className="w-4 h-4 text-[#fbbf24] animate-pulse" />
          <span className="font-heading font-extrabold text-xs text-[#F0E9DA] tracking-wider uppercase">
            Recruiter Speedrun
          </span>
          <span className="text-[#3A4B40]">·</span>
          <span className="font-mono text-[11px] text-[#D6BC83] font-bold">
            Stop {speedrunIndex + 1} of {SPEEDRUN_STOPS.length}
          </span>
        </div>

        <button
          onClick={() => {
            soundEngine.playClickSound();
            stopRecruiterSpeedrun();
          }}
          className="game-btn-tactile game-btn-crimson px-3 py-1.5 text-xs flex items-center gap-1.5"
          title="Exit Speedrun (Esc)"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Tour</span>
        </button>
      </div>

      {/* Main Feature Highlight Card */}
      <div className="mx-auto w-full max-w-2xl pointer-events-auto">
        <div className="game-frame game-corner-brackets rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#1B2822]/95 via-[#182620]/95 to-[#111916]/95 backdrop-blur-xl border border-[#D6BC83]/50">
          
          {/* Category Tag & Timer */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#3A4B40]/25 border border-[#D6BC83]/40 text-[#D6BC83] font-bold">
              {currentStop.category}
            </span>
            {!isFinalStop && (
              <span className="text-[11px] font-mono text-[#F0E9DA]/60">
                Next stop in <strong className="text-[#D6BC83] font-bold">{timeLeft}s</strong>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#F0E9DA] tracking-tight mb-3">
            {currentStop.title}
          </h2>

          {/* Metrics Bullet List */}
          <div className="space-y-2 mb-6">
            {currentStop.metrics.map((metric, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F0E9DA]/90 font-sans">
                <CheckCircle2 className="w-4 h-4 text-[#D6BC83] shrink-0 mt-0.5" />
                <span>{metric}</span>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#3A4B40]/30">
            {/* Step Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                disabled={speedrunIndex === 0}
                onClick={() => {
                  soundEngine.playClickSound();
                  setSpeedrunIndex(Math.max(0, speedrunIndex - 1));
                }}
                className={`game-btn-tactile px-3 py-1.5 text-xs flex items-center gap-1 ${
                  speedrunIndex === 0 ? 'opacity-40 pointer-events-none' : 'game-btn-slate'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {!isFinalStop ? (
                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    setSpeedrunIndex(speedrunIndex + 1);
                  }}
                  className="game-btn-tactile game-btn-gold px-4 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <span>Next Stop</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playClickSound();
                    stopRecruiterSpeedrun();
                  }}
                  className="game-btn-tactile game-btn-emerald px-4 py-1.5 text-xs flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Free Exploration</span>
                </button>
              )}
            </div>

            {/* Direct Executive Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`${import.meta.env.BASE_URL}assets/Prasad_Kankhar_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                className="game-btn-tactile game-btn-slate px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#D6BC83]" />
                <span>PDF Resume</span>
              </a>

              <a
                href="mailto:prasadkankhar5@gmail.com?subject=Technical%20Interview%20Invitation%20-%20Prasad%20Kankhar"
                className="game-btn-tactile game-btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-bold"
              >
                <Mail className="w-3.5 h-3.5 text-[#17221C]" />
                <span>Schedule Interview</span>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* Progress Dots Bottom Bar */}
      <div className="flex items-center justify-center gap-2 pointer-events-auto">
        {SPEEDRUN_STOPS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              soundEngine.playClickSound();
              setSpeedrunIndex(i);
            }}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              i === speedrunIndex 
                ? 'w-8 bg-[#D6BC83] shadow-[0_0_10px_#D6BC83]' 
                : 'w-2 bg-[#3A4B40]/60 hover:bg-[#D6BC83]/50'
            }`}
            title={`Jump to stop ${i + 1}`}
          />
        ))}
      </div>

    </div>
  );
};
