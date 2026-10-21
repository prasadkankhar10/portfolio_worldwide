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
  const worldPrewarmProgress = useGameStore((state) => state.worldPrewarmProgress);
  const isWorldPrewarmed = useGameStore((state) => state.isWorldPrewarmed);

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
    <div className="absolute inset-0 z-40 flex flex-col justify-between bg-gradient-to-b from-[#0a1210]/75 via-[#0a1210]/30 to-[#0a1210]/80 text-[#F0E9DA] p-4 sm:p-8 select-none animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
      
      {/* ========================================================================= */}
      {/* 1. TOP BRAND & SOCIAL BAR */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between p-3 sm:p-3.5 px-4 sm:px-5 rounded-2xl bg-[#0a1210]/60 backdrop-blur-md border border-[#3A4B40]/30 shadow-lg shrink-0 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#3A4B40]/20 border border-[#D6BC83]/35 flex items-center justify-center text-[#D6BC83] shrink-0">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading font-bold text-xs sm:text-sm tracking-wide text-[#F0E9DA] truncate">
              Prasad Anil Kankhar
            </h2>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#D6BC83] truncate">
              Software & Game Engine Developer
            </p>
          </div>
        </div>

        {/* Quick Social & Resume Links */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href="https://github.com/prasadkankhar10"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClickSound()}
            className="p-1.5 sm:p-2 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#D6BC83]/25 text-[#F0E9DA]/80 hover:text-[#D6BC83] transition-all cursor-pointer shadow-sm hover:scale-105"
            title="GitHub Profile"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          <a
            href="https://linkedin.com/in/prasad-kankhar-09b910243"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClickSound()}
            className="p-1.5 sm:p-2 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#D6BC83]/25 text-[#F0E9DA]/80 hover:text-[#D6BC83] transition-all cursor-pointer shadow-sm hover:scale-105"
            title="LinkedIn Profile"
          >
            <LinkedinIcon className="w-4 h-4" />
          </a>

          <a
            href={`${import.meta.env.BASE_URL}assets/Prasad_Kankhar_Resume.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundEngine.playClickSound()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1B2822]/90 hover:bg-[#1B2822] border border-[#D6BC83]/30 hover:border-[#D6BC83]/60 text-[#F0E9DA] hover:text-[#D6BC83] text-xs font-heading font-medium transition-all cursor-pointer shadow-sm hover:scale-105"
            title="Download Official Resume PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span className="hidden sm:inline">Resume PDF</span>
          </a>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              toggleAudioMute();
              soundEngine.playClickSound();
            }}
            className="p-1.5 sm:p-2 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#D6BC83]/25 text-[#F0E9DA]/80 hover:text-[#D6BC83] transition-all cursor-pointer"
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#D6BC83]" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CENTRAL DUAL-INTENT GATEWAY HERO CARDS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto my-auto py-5 sm:py-8 flex flex-col items-center">
        
        {/* Live 3D Pre-warming & Orbit Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#1B2822]/90 backdrop-blur-md border border-[#D6BC83]/40 text-[#D6BC83] text-[11px] sm:text-xs font-mono mb-3 shadow-md max-w-full">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isWorldPrewarmed ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isWorldPrewarmed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="truncate">
            {isWorldPrewarmed 
              ? 'Live 3D World 100% Ready (Zero Lag) · Move Cursor to Orbit'
              : `Loading 3D World in Background (${worldPrewarmProgress}%) · Smooth Entry Ready`}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold text-[#F0E9DA] tracking-tight text-center mb-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] px-2">
          Choose How You Wish to Explore
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[#F0E9DA]/85 font-sans text-center max-w-xl mb-5 sm:mb-6 leading-relaxed drop-shadow-sm px-2">
          Immerse yourself in a real-time WebGL island with physics and procedural sound, or jump straight to the executive 2D dossier.
        </p>

        {/* The Two Equal-Weight Primary Choice Cards (Game UI Styled) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-7 w-full">
          
          {/* CARD A: 3D WORLD EXPLORATION */}
          <div 
            onClick={handleStart3D}
            className="group relative game-frame game-corner-brackets rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="absolute top-4 sm:top-5 right-4 sm:right-5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${isWorldPrewarmed ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse shadow-[0_0_6px_#34d399]`} />
              <span>{isWorldPrewarmed ? '3D ENGINE READY' : `PRE-WARMING ${worldPrewarmProgress}%`}</span>
            </div>

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#8B2020] to-[#591010] border border-[#D6BC83]/60 text-[#FFF2D1] font-mono text-[11px] font-bold mb-4 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-[#D6BC83]" />
                <span>Immersive 3D Experience</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#F0E9DA] group-hover:text-[#D6BC83] transition-colors mb-2 tracking-tight drop-shadow">
                Explore 3D Island
              </h3>
              <p className="text-xs sm:text-sm text-[#F0E9DA]/85 font-sans leading-relaxed mb-5 sm:mb-6">
                Freely traverse an interactive 3D archipelago with third-person character physics, 18 architectural district stations, and procedural Web Audio.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 text-xs font-sans text-[#F0E9DA]/90 mb-6 sm:mb-8 border-t border-[#3A4B40]/40 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83] shadow-sm shrink-0" />
                  <span><strong>WASD & Sprint</strong> character controls + Rapier 3D physics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83] shadow-sm shrink-0" />
                  <span><strong>18 Stations</strong> with Blender cartography & in-world GPS</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83] shadow-sm shrink-0" />
                  <span><strong>Interactive Guides</strong>, logic puzzle & direct messaging boat</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button 
              className="w-full py-3.5 px-6 game-btn-tactile game-btn-gold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{hasStarted ? 'Resume 3D World' : (isWorldPrewarmed ? 'Enter 3D World (Zero Lag)' : 'Enter 3D World')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD B: EXECUTIVE 2D DOSSIER (FAST RECRUITER MODE) */}
          <div 
            onClick={handleOpen2D}
            className="group relative game-frame game-corner-brackets rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D6BC83]/20 border border-[#D6BC83]/40 text-[#D6BC83] text-[10px] font-mono font-bold">
              <span>ZERO WAIT TIME</span>
            </div>

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111916] border border-[#D6BC83]/40 text-[#D6BC83] font-mono text-[11px] font-bold mb-4 shadow-sm">
                <Briefcase className="w-3.5 h-3.5 text-[#D6BC83]" />
                <span>Executive Recruiter View</span>
              </div>

              <h3 className="text-2xl font-heading font-extrabold text-[#F0E9DA] group-hover:text-[#D6BC83] transition-colors mb-2 tracking-tight drop-shadow">
                Quick 2D Portfolio
              </h3>
              <p className="text-xs sm:text-sm text-[#F0E9DA]/85 font-sans leading-relaxed mb-6">
                Fast, friction-free standard portfolio designed for hiring managers and recruiters. Instant access to case studies, live demos, and credentials.
              </p>

              {/* Feature Highlights */}
              <ul className="space-y-2 text-xs font-sans text-[#F0E9DA]/90 mb-8 border-t border-[#3A4B40]/40 pt-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83] shadow-sm" />
                  <span><strong>19 Production Projects</strong> (C++ Engine, Autonomous AI, WebAR)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83] shadow-sm" />
                  <span><strong>Harvard CS50x</strong> academic rigor & transcript verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6BC83] shadow-sm" />
                  <span><strong>1-Click PDF Resume</strong> & direct email courier contact</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <button 
              className="w-full py-3.5 px-6 game-btn-tactile game-btn-emerald text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Open Executive 2D Dossier</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTIONS & DIRECT PROJECT ACCESS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto p-3 px-5 rounded-2xl bg-[#0a1210]/60 backdrop-blur-md border border-[#3A4B40]/30 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 mt-3">
        
        {/* Left: Autopilot Guided Tour */}
        <button
          onClick={handleStartTour}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D6BC83]/20 hover:bg-[#D6BC83]/35 border border-[#D6BC83]/40 text-[#D6BC83] font-heading font-bold text-xs transition-all cursor-pointer shadow-sm hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-[#D6BC83]" />
          <span>Watch 60s Autopilot Guided Tour</span>
        </button>

        {/* Center: Direct Flagship Project Pills */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => handleOpenStation('TRIGGER_Hall_Certifications')}
            className="px-3 py-1 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#3A4B40]/30 text-[#F0E9DA]/80 hover:text-[#D6BC83] font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span>Harvard CS50x</span>
          </button>

          <button
            onClick={() => handleOpenStation('TRIGGER_Project_OneMoreMove')}
            className="px-3 py-1 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#3A4B40]/30 text-[#F0E9DA]/80 hover:text-[#D6BC83] font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span>One More Move (C++17)</span>
          </button>

          <button
            onClick={() => handleOpenStation('TRIGGER_Project_ButlerOS')}
            className="px-3 py-1 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#3A4B40]/30 text-[#F0E9DA]/80 hover:text-[#D6BC83] font-sans text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#D6BC83]" />
            <span>Butler OS (AI)</span>
          </button>
        </div>

        {/* Right: Graphics Quality Preset */}
        <button
          onClick={() => {
            soundEngine.playClickSound();
            togglePerformanceMode();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B2822]/80 hover:bg-[#1B2822] border border-[#3A4B40]/30 text-[11px] font-mono text-[#F0E9DA]/70 hover:text-[#D6BC83] transition-colors cursor-pointer"
          title="Toggle Graphics Performance Mode"
        >
          <Gauge className="w-3.5 h-3.5 text-[#3A4B40]" />
          <span>Graphics: {performanceMode ? 'Performance (High FPS)' : 'Cinematic (Postprocessing)'}</span>
        </button>

      </div>

    </div>
  );
};
