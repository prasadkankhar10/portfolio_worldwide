import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData, type StationData } from '../../data/portfolioData';
import { 
  X, ExternalLink, Mail, Download, 
  MapPin, Sparkles, Code2, Gamepad2, Award, BookOpen, 
  Compass, ChevronRight, CheckCircle2
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

const STATION_KEYS = [
  'TRIGGER_Harbor_Welcome',
  'TRIGGER_Village_About',
  'TRIGGER_Project_ExamPlatform',
  'TRIGGER_Project_Sadhana',
  'TRIGGER_Project_Vyuham',
  'TRIGGER_Forge_GameDev',
  'TRIGGER_Moonwell_Skills',
  'TRIGGER_Stonehenge_Puzzle',
  'TRIGGER_Citadel_Contact',
];

const STATION_TELEPORT_COORDS: Record<string, { x: number; y: number; z: number }> = {
  TRIGGER_Harbor_Welcome: { x: 107.0, y: 4.0, z: 125.0 },
  TRIGGER_Village_About: { x: 45.0, y: 4.0, z: -4.0 },
  TRIGGER_Project_ExamPlatform: { x: -2.5, y: 4.0, z: -4.0 },
  TRIGGER_Project_Sadhana: { x: 0.5, y: 4.0, z: -4.0 },
  TRIGGER_Project_Vyuham: { x: 3.5, y: 4.0, z: -4.0 },
  TRIGGER_Forge_GameDev: { x: -100.0, y: 4.0, z: -11.5 },
  TRIGGER_Moonwell_Skills: { x: -45.0, y: 4.0, z: 32.0 },
  TRIGGER_Stonehenge_Puzzle: { x: 35.0, y: 4.0, z: 58.0 },
  TRIGGER_Citadel_Contact: { x: -15.0, y: 58.5, z: -100.0 },
};

export const StationPortfolioModal: React.FC = () => {
  const isStationModalOpen = useGameStore((state) => state.isStationModalOpen);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const activeStationId = useGameStore((state) => state.activeStationId);
  const teleportPlayer = useGameStore((state) => state.teleportPlayer);

  const [selectedStationKey, setSelectedStationKey] = useState<string>('TRIGGER_Harbor_Welcome');

  // Sync selected station with whichever trigger opened the modal
  useEffect(() => {
    if (activeStationId && portfolioData[activeStationId]) {
      setSelectedStationKey(activeStationId);
    }
  }, [activeStationId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStationModalOpen) {
        setStationModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStationModalOpen, setStationModalOpen]);

  if (!isStationModalOpen) return null;

  const currentData: StationData = portfolioData[selectedStationKey] || portfolioData.TRIGGER_Harbor_Welcome;

  const handleTeleportToStation = (key: string) => {
    const coords = STATION_TELEPORT_COORDS[key];
    if (coords) {
      teleportPlayer(coords);
      setStationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Card Container */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-stone-950/95 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col md:flex-row overflow-hidden text-stone-200 font-sans">
        
        {/* Mobile / Desktop Close Button */}
        <button
          onClick={() => setStationModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10 transition-all cursor-pointer"
          title="Close Modal (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- LEFT SIDEBAR: STATION NAVIGATION --- */}
        <div className="w-full md:w-72 bg-stone-900/70 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col shrink-0">
          <div className="mb-4 flex items-center gap-2 px-2">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">
              Portfolio Stations
            </span>
          </div>

          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto custom-scrollbar flex-1 pb-2">
            {STATION_KEYS.map((key, idx) => {
              const item = portfolioData[key];
              const isSelected = selectedStationKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedStationKey(key)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer shrink-0 md:shrink md:w-full ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
                      : 'hover:bg-white/5 border border-transparent text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] font-mono text-stone-400">
                      {idx + 1}
                    </span>
                    <span className="truncate">{item?.title || key}</span>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 hidden md:block text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quick Teleport Action from Sidebar */}
          <div className="pt-3 border-t border-white/10 mt-auto hidden md:block">
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>Teleport Here In 3D</span>
            </button>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
          
          {/* Header Badge & Category */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {currentData.category}
            </span>
            {currentData.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-stone-800 text-stone-300 border border-white/10">
                {currentData.badge}
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-wide mb-1">
            {currentData.title}
          </h2>
          {currentData.subtitle && (
            <p className="text-sm text-stone-400 font-medium mb-6">
              {currentData.subtitle}
            </p>
          )}

          <div className="space-y-6 flex-1">
            
            {/* 1. HERO / WELCOME SPECIFIC CONTENT */}
            {selectedStationKey === 'TRIGGER_Harbor_Welcome' && (
              <div className="space-y-6 animate-in fade-in">
                <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                  {currentData.shortBio}
                </p>

                {/* Primary Tech Stack Pills */}
                {currentData.primaryTech && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" /> Primary Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentData.primaryTech.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-stone-900 border border-white/10 rounded-lg text-xs font-mono text-stone-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons: Resume & Social Links */}
                <div className="flex flex-wrap items-center gap-3 pt-4">
                  {currentData.resume && (
                    <a
                      href={currentData.resume.fileUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{currentData.resume.label}</span>
                    </a>
                  )}

                  {currentData.quickLinks?.github && (
                    <a
                      href={currentData.quickLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {currentData.quickLinks?.linkedin && (
                    <a
                      href={currentData.quickLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4 text-sky-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>

                {currentData.controlsHint && (
                  <div className="p-3 bg-stone-900/60 border border-white/5 rounded-xl text-xs text-stone-400 font-mono">
                    💡 {currentData.controlsHint}
                  </div>
                )}
              </div>
            )}

            {/* 2. ABOUT ME & CREDENTIALS CONTENT */}
            {selectedStationKey === 'TRIGGER_Village_About' && (
              <div className="space-y-6 animate-in fade-in">
                {currentData.story && (
                  <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                    {currentData.story}
                  </p>
                )}

                {/* Education */}
                {currentData.education && (
                  <div className="p-4 bg-stone-900/80 border border-white/10 rounded-xl">
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Education
                    </h4>
                    <p className="text-sm font-semibold text-stone-100">{currentData.education.degree}</p>
                    <p className="text-xs text-stone-400">{currentData.education.college} • Class of {currentData.education.expectedGraduation}</p>
                  </div>
                )}

                {/* Engineering Principles */}
                {currentData.engineeringPrinciples && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                      Core Engineering Principles
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {currentData.engineeringPrinciples.map((principle, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Leadership & Ambassadorships */}
                {currentData.leadership && (
                  <div className="p-4 bg-stone-900/80 border border-white/10 rounded-xl">
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Leadership • {currentData.leadership.organization}
                    </h4>
                    <p className="text-xs text-amber-300 font-semibold mb-1">{currentData.leadership.role}</p>
                    <p className="text-xs text-stone-400">{currentData.leadership.responsibilities}</p>
                  </div>
                )}

                {currentData.ambassadorships && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                      Campus Ambassadorships
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentData.ambassadorships.map((a, i) => (
                        <span key={i} className="px-2.5 py-1 bg-stone-900 border border-white/10 rounded-lg text-xs text-stone-300">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. SOFTWARE PROJECTS (Exam Platform, Sadhana, Vyuham) */}
            {(selectedStationKey === 'TRIGGER_Project_ExamPlatform' ||
              selectedStationKey === 'TRIGGER_Project_Sadhana' ||
              selectedStationKey === 'TRIGGER_Project_Vyuham') && (
              <div className="space-y-6 animate-in fade-in">
                {currentData.description && (
                  <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                    {currentData.description}
                  </p>
                )}

                {/* Tech Stack Chips */}
                {currentData.techStack && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                      Technologies & Libraries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentData.techStack.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Highlights */}
                {currentData.highlights && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                      Key Engineering Accomplishments
                    </h4>
                    <ul className="space-y-2 text-xs md:text-sm text-stone-300">
                      {currentData.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Project Links */}
                <div className="flex items-center gap-3 pt-3">
                  {currentData.github && (
                    <a
                      href={currentData.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>View GitHub Repository</span>
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 4. GAME DEV FLAGGSHIP (On The Way) */}
            {selectedStationKey === 'TRIGGER_Forge_GameDev' && (
              <div className="space-y-6 animate-in fade-in">
                {currentData.description && (
                  <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                    {currentData.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-stone-900 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-stone-400 font-mono uppercase">Game Engine</span>
                    <p className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4" /> {currentData.engine}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-900 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-stone-400 font-mono uppercase">Architecture</span>
                    <p className="text-sm font-bold text-stone-200">{currentData.developmentMethod}</p>
                  </div>
                </div>

                {currentData.coreSystems && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                      Core Gameplay & Physics Systems
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {currentData.coreSystems.map((sys, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{sys}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentData.gameDevFocus && (
                  <div className="p-4 bg-stone-900/60 border border-white/10 rounded-xl">
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-1">
                      Next Milestones in C++ & Unreal Engine
                    </h4>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {currentData.gameDevFocus.currentPath}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 5. SKILLS MATRIX & LAB */}
            {selectedStationKey === 'TRIGGER_Moonwell_Skills' && (
              <div className="space-y-6 animate-in fade-in">
                {currentData.skills && (
                  <div className="space-y-4">
                    {Object.entries(currentData.skills).map(([category, list]) => (
                      <div key={category}>
                        <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-1.5">
                          {category}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map((skill) => (
                            <span key={skill} className="px-2.5 py-1 bg-stone-900 border border-white/10 rounded-lg text-xs font-mono text-stone-300">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentData.labExperiments && (
                  <div className="p-4 bg-stone-900/80 border border-white/10 rounded-xl">
                    <h4 className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Active R&D / Experiments
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                      {currentData.labExperiments.map((exp, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. STONEHENGE & BEYOND CODE */}
            {selectedStationKey === 'TRIGGER_Stonehenge_Puzzle' && (
              <div className="space-y-6 animate-in fade-in">
                {currentData.miniGame && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-1">
                      {currentData.miniGame.title}
                    </h4>
                    <p className="text-xs text-stone-300 mb-2 leading-relaxed">
                      {currentData.miniGame.instructions}
                    </p>
                    <div className="p-2.5 bg-black/40 rounded-lg font-mono text-xs text-amber-300 border border-amber-500/20">
                      {currentData.miniGame.rewardMessage}
                    </div>
                  </div>
                )}

                {currentData.creativeSide && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-stone-300 font-mono font-bold mb-2">
                      Creative Expression & Shayari
                    </h4>
                    <p className="text-xs text-stone-400 leading-relaxed mb-3">
                      {currentData.creativeSide.philosophy}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentData.creativeSide.themes.map((theme) => (
                        <span key={theme} className="px-3 py-1 bg-stone-900 border border-white/10 rounded-full text-xs text-amber-200/80">
                          #{theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. CITADEL CONTACT PORTAL */}
            {selectedStationKey === 'TRIGGER_Citadel_Contact' && (
              <div className="space-y-6 animate-in fade-in">
                <p className="text-stone-300 leading-relaxed text-sm">
                  {currentData.promptText}
                </p>

                <div className="flex flex-wrap gap-3">
                  {currentData.email && (
                    <a
                      href={`mailto:${currentData.email}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{currentData.email}</span>
                    </a>
                  )}

                  {currentData.linkedin && (
                    <a
                      href={currentData.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-sky-400 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}

                  {currentData.github && (
                    <a
                      href={currentData.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <GithubIcon className="w-4 h-4" />
                      <span>GitHub Portfolio</span>
                    </a>
                  )}
                </div>

                {currentData.collaborationAreas && (
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                      Open for Collaboration
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {currentData.collaborationAreas.map((area, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Teleport Button for Mobile */}
          <div className="pt-6 mt-6 border-t border-white/10 md:hidden flex justify-end">
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold"
            >
              <MapPin className="w-4 h-4" />
              <span>Teleport Here In 3D</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
