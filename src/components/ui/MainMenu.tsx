import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';
import { 
  Compass, Sparkles, FileText, Briefcase, Download, 
  Gauge, Volume2, VolumeX, ArrowRight, GraduationCap, 
  ExternalLink, Layers, BrainCircuit, Code2, Play
} from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export const MainMenu: React.FC = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const hasStarted = useGameStore((state) => state.hasStarted);
  const setHasStarted = useGameStore((state) => state.setHasStarted);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);
  const setQuickPortfolioOpen = useGameStore((state) => state.setQuickPortfolioOpen);
  const setIsGuidedTourActive = useGameStore((state) => state.setIsGuidedTourActive);
  const performanceMode = useGameStore((state) => state.performanceMode);
  const togglePerformanceMode = useGameStore((state) => state.togglePerformanceMode);
  const isAudioMuted = useGameStore((state) => state.isAudioMuted);
  const toggleAudioMute = useGameStore((state) => state.toggleAudioMute);

  // 1. Enter 3D Exploration
  const handleStart3D = () => {
    soundEngine.playClickSound();
    soundEngine.startAmbientAtmosphere();
    if (!hasStarted) setHasStarted(true);
    setGameState('playing');
    if (typeof document !== 'undefined' && !useGameStore.getState().isMobile) {
      try {
        document.body.requestPointerLock();
      } catch {
        // Silently ignore if restricted
      }
    }
  };

  // 2. Open Executive 2D Dossier (Fast Recruiter View)
  const handleOpen2D = () => {
    soundEngine.playClickSound();
    setQuickPortfolioOpen(true);
  };

  // 3. Start 60s Guided Tour (Autopilot Flythrough)
  const handleStartTour = () => {
    soundEngine.playClickSound();
    soundEngine.startAmbientAtmosphere();
    if (!hasStarted) setHasStarted(true);
    setGameState('playing');
    setIsGuidedTourActive(true);
  };

  const handleOpenStation = (stationKey: string) => {
    soundEngine.playClickSound();
    setActiveStationId(stationKey);
    setStationModalOpen(true);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between bg-[#0a1210]/75 backdrop-blur-md text-[#E9E4D7] p-4 sm:p-8 select-none animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      
      {/* ========================================================================= */}
      {/* 1. TOP BRAND & SOCIAL BAR */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-[#527C68]/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#527C68]/20 border border-[#D4B777]/35 flex items-center justify-center text-[#D4B777]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm tracking-wide text-[#E9E4D7]">
              Prasad Anil Kankhar
            </h2>
            <p className="text-[11px] font-mono text-[#D4B777]">
              Software & Game Engine Developer
            </p>
          </div>
        </div>

        {/* Quick Social & Resume Links */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/prasadkankhar10"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClickSound()}
            className="p-2 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#D4B777]/25 text-[#E9E4D7]/80 hover:text-[#D4B777] transition-all cursor-pointer shadow-sm hover:scale-105"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <a
            href="https://linkedin.com/in/prasad-kankhar-09b910243"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClickSound()}
            className="p-2 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#D4B777]/25 text-[#E9E4D7]/80 hover:text-[#D4B777] transition-all cursor-pointer shadow-sm hover:scale-105"
            title="LinkedIn Profile"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>

          <a
            href={`${import.meta.env.BASE_URL}assets/Prasad_Kankhar_Resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClickSound()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182522]/90 hover:bg-[#182522] border border-[#D4B777]/30 hover:border-[#D4B777]/60 text-[#E9E4D7] hover:text-[#D4B777] text-xs font-heading font-medium transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Download Official Resume PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#D4B777]" />
            <span className="hidden sm:inline">Resume PDF</span>
          </a>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleAudioMute();
              soundEngine.playClickSound();
            }}
            className="p-2 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#D4B777]/25 text-[#E9E4D7]/80 hover:text-[#D4B777] transition-all cursor-pointer"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D4B777]" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTRAL DUAL-INTENT GATEWAY HERO CARDS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto my-auto py-6 sm:py-10 flex flex-col items-center">
        
        {/* Subtle Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#527C68]/20 border border-[#D4B777]/30 text-[#D4B777] text-xs font-mono mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Interactive 3D Portfolio Archipelago & Executive Dossier</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#E9E4D7] tracking-tight text-center mb-3">
          Choose How You Wish to Explore
        </h1>
        <p className="text-xs sm:text-base text-[#E9E4D7]/75 font-sans text-center max-w-xl mb-8 leading-relaxed">
          Step into a fully simulated 3D WebGL world with physics and procedural audio, or immediately review the standard executive 2D dossier.
        </p>

        {/* The Two Equal-Weight Primary Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 w-full">
          
          {/* CARD A: 3D WORLD EXPLORATION */}
          <div 
            onClick={handleStart3D}
            className="group relative bg-[#182522]/90 hover:bg-[#182522] border border-[#D4B777]/40 hover:border-[#D4B777] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,18,16,0.8)] backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4B777]/20 border border-[#D4B777]/35 text-[#D4B777] font-mono text-[11px] font-semibold mb-4">
                <Compass className="w-3 h-3 text-[#D4B777]" />
                <span>Immersive 3D Experience</span>
              </div>

              <h3 className="text-2xl font-heading font-bold text-[#E9E4D7] group-hover:text-[#D4B777] transition-colors mb-2 tracking-tight">
                Explore 3D Island
              </h3>
              <p className="text-xs sm:text-sm text-[#E9E4D7]/75 font-sans leading-relaxed mb-6">
                Freely traverse an interactive 3D archipelago with third-person character physics, 18 architectural district stations, and procedural Web Audio.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 text-xs font-sans text-[#E9E4D7]/80 mb-8 border-t border-[#527C68]/20 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4B777]" />
                  <span><strong>WASD & Sprint</strong> character controls + Rapier 3D physics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4B777]" />
                  <span><strong>18 Stations</strong> with Blender cartography & in-world GPS</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4B777]" />
                  <span><strong>Interactive NPCs</strong>, Stonehenge riddle & Royal Courier vessel</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button 
              className="w-full py-3.5 px-6 rounded-xl bg-[#D4B777] group-hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{hasStarted ? 'Resume 3D World' : 'Enter 3D World'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD B: EXECUTIVE 2D DOSSIER (FAST RECRUITER MODE) */}
          <div 
            onClick={handleOpen2D}
            className="group relative bg-[#182522]/90 hover:bg-[#182522] border border-[#527C68]/40 hover:border-[#D4B777]/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,18,16,0.8)] backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#527C68]/25 border border-[#527C68]/40 text-[#E9E4D7] font-mono text-[11px] font-semibold mb-4">
                <Briefcase className="w-3 h-3 text-[#D4B777]" />
                <span>Executive Recruiter View</span>
              </div>

              <h3 className="text-2xl font-heading font-bold text-[#E9E4D7] group-hover:text-[#D4B777] transition-colors mb-2 tracking-tight">
                Quick 2D Portfolio
              </h3>
              <p className="text-xs sm:text-sm text-[#E9E4D7]/75 font-sans leading-relaxed mb-6">
                Fast, friction-free standard portfolio designed for hiring managers and recruiters. Instant access to case studies, live demos, and credentials.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 text-xs font-sans text-[#E9E4D7]/80 mb-8 border-t border-[#527C68]/20 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#527C68]" />
                  <span><strong>19 Production Projects</strong> (C++ Engine, Autonomous AI, WebAR)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#527C68]" />
                  <span><strong>Harvard CS50x</strong> academic rigor & transcript verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#527C68]" />
                  <span><strong>1-Click PDF Resume</strong> & direct email courier contact</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button 
              className="w-full py-3.5 px-6 rounded-xl bg-[#527C68]/30 group-hover:bg-[#527C68]/50 border border-[#D4B777]/40 text-[#E9E4D7] group-hover:text-[#D4B777] font-heading font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Open Executive 2D Dossier</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D4B777]" />
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTIONS & DIRECT PROJECT ACCESS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto pt-4 border-t border-[#527C68]/20 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Left: Autopilot Guided Tour */}
        <button
          onClick={handleStartTour}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4B777]/20 hover:bg-[#D4B777]/35 border border-[#D4B777]/40 text-[#D4B777] font-heading font-bold text-xs transition-all cursor-pointer shadow-sm hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-[#D4B777]" />
          <span>Watch 60s Autopilot Guided Tour</span>
        </button>

        {/* Center: Direct Flagship Project Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => handleOpenStation('TRIGGER_Hall_Certifications')}
            className="px-3 py-1 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#527C68]/30 text-[#E9E4D7]/80 hover:text-[#D4B777] font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#D4B777]" />
            <span>Harvard CS50x</span>
          </button>

          <button
            onClick={() => handleOpenStation('TRIGGER_Project_OneMoreMove')}
            className="px-3 py-1 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#527C68]/30 text-[#E9E4D7]/80 hover:text-[#D4B777] font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-[#D4B777]" />
            <span>One More Move (C++17)</span>
          </button>

          <button
            onClick={() => handleOpenStation('TRIGGER_Project_ButlerOS')}
            className="px-3 py-1 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#527C68]/30 text-[#E9E4D7]/80 hover:text-[#D4B777] font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#D4B777]" />
            <span>Butler OS (AI)</span>
          </button>
        </div>

        {/* Right: Graphics Quality Preset */}
        <button
          onClick={() => {
            soundEngine.playClickSound();
            togglePerformanceMode();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182522]/80 hover:bg-[#182522] border border-[#527C68]/30 text-[11px] font-mono text-[#E9E4D7]/70 hover:text-[#D4B777] transition-colors cursor-pointer"
          title="Toggle Graphics Performance Mode"
        >
          <Gauge className="w-3.5 h-3.5 text-[#527C68]" />
          <span>Graphics: {performanceMode ? 'Performance (High FPS)' : 'Cinematic (Postprocessing)'}</span>
        </button>

      </div>

    </div>
  );
};
