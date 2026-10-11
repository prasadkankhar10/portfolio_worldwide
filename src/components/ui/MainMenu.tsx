import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Compass, BookOpen, Layers, Sparkles, Mail, FileText, Briefcase } from 'lucide-react';

export const MainMenu: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const hasStarted = useGameStore((state) => state.hasStarted);
  const setHasStarted = useGameStore((state) => state.setHasStarted);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setQuickPortfolioOpen = useGameStore((state) => state.setQuickPortfolioOpen);

  const handleStart = () => {
    if (!hasStarted) setHasStarted(true);
    setGameState('playing');
    if (typeof document !== 'undefined' && !useGameStore.getState().isMobile) {
      try {
        document.body.requestPointerLock();
      } catch {
        // Silently ignore if browser restricts
      }
    }
  };

  const openStation = (stationKey: string) => {
    setActiveStationId(stationKey);
    setStationModalOpen(true);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#101a18]/70 backdrop-blur-md text-[#E9E4D7] p-4 select-none animate-in fade-in duration-300">
      
      {/* Central Glass Card */}
      <div className="bg-[#182522]/90 border border-[#D4B777]/25 rounded-3xl p-8 sm:p-10 shadow-[0_24px_60px_-12px_rgba(10,18,16,0.8)] backdrop-blur-2xl max-w-md w-full text-center flex flex-col items-center">
        
        {/* Subtle Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#527C68]/20 border border-[#D4B777]/25 text-[#D4B777] text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Interactive 3D Portfolio</span>
        </div>

        {/* Headings */}
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#E9E4D7] tracking-tight mb-2">
          Prasad Anil Kankhar
        </h1>
        <p className="text-sm sm:text-base text-[#D4B777] font-heading font-medium tracking-wide mb-1">
          Software & Game Engine Developer
        </p>
        <p className="text-xs text-[#E9E4D7]/65 font-sans mb-8 leading-relaxed max-w-xs">
          Explore a stylized 3D archipelago showcasing full-stack systems, game engines, and autonomous AI architectures.
        </p>

        {/* Menu Actions */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Primary CTA: 3D Exploration */}
          <button 
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 stroke-[2]" />
            <span>{hasStarted ? 'Resume Exploring' : 'Explore 3D Island'}</span>
          </button>

          {/* Quick Traditional 2D Portfolio View (For Quick Review / Recruiters) */}
          <button 
            onClick={() => setQuickPortfolioOpen(true)}
            className="w-full py-2.5 px-5 rounded-xl bg-[#527C68]/20 hover:bg-[#527C68]/35 border border-[#D4B777]/35 hover:border-[#D4B777]/60 text-[#E9E4D7] hover:text-[#D4B777] font-heading font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#D4B777]" />
            <span>Quick 2D Portfolio View (Standard Mode)</span>
          </button>

          {/* Interactive Story Mode (Coming Soon - Non-clickable) */}
          <div 
            className="w-full py-2.5 px-5 rounded-xl bg-[#101a18]/40 border border-[#527C68]/20 text-[#E9E4D7]/50 font-sans text-xs font-medium cursor-not-allowed select-none flex items-center justify-between transition-all"
            title="Interactive Story Mode — Coming Soon"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#527C68]/70" />
              <span>Interactive Story</span>
            </div>
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#527C68]/20 text-[#D4B777]/80 border border-[#D4B777]/25 font-semibold">
              Coming Soon
            </span>
          </div>

          {/* Quick Dossier */}
          <button 
            onClick={() => openStation('TRIGGER_Harbor_Welcome')}
            className="w-full py-2.5 px-5 rounded-xl bg-[#101a18]/70 hover:bg-[#101a18] border border-[#527C68]/30 hover:border-[#D4B777]/40 text-[#E9E4D7] font-sans text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-[#D4B777]" />
            <span>Profile & Harvard Credentials</span>
          </button>

          {/* Software & Systems */}
          <button 
            onClick={() => openStation('TRIGGER_Project_ExamPlatform')}
            className="w-full py-2.5 px-5 rounded-xl bg-[#101a18]/70 hover:bg-[#101a18] border border-[#527C68]/30 hover:border-[#D4B777]/40 text-[#E9E4D7]/85 hover:text-[#E9E4D7] font-sans text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Layers className="w-3.5 h-3.5 text-[#527C68]" />
            <span>19 Project Showcases</span>
          </button>

          {/* Contact */}
          <button 
            onClick={() => openStation('TRIGGER_Harbor_Welcome')}
            className="w-full py-2.5 px-5 rounded-xl bg-[#101a18]/70 hover:bg-[#101a18] border border-[#527C68]/30 hover:border-[#D4B777]/40 text-[#E9E4D7]/85 hover:text-[#E9E4D7] font-sans text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Mail className="w-3.5 h-3.5 text-[#527C68]" />
            <span>Connect & Message Courier</span>
          </button>
        </div>

      </div>
    </div>
  );
};
