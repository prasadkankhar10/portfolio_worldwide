import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData, type StationData } from '../../data/portfolioData';
import { 
  X, ExternalLink, Mail, Download, 
  MapPin, Sparkles, Code2, Gamepad2, Award, BookOpen, 
  Compass, ChevronRight, CheckCircle2, Search, Cpu, Globe, 
  Layers, Terminal, Trophy, Binary, ArrowUpRight
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
  // 1. Core & Accreditations
  'TRIGGER_Harbor_Welcome',
  'TRIGGER_Village_About',
  'TRIGGER_Hall_Certifications',
  'TRIGGER_Arena_Algorithms',
  'TRIGGER_Leadership_Pavilion',

  // 2. AI & Autonomous Systems
  'TRIGGER_Project_ButlerOS',
  'TRIGGER_Project_MaraRAG',
  'TRIGGER_Project_Akshayanidhi',
  'TRIGGER_Project_LifeManager',
  'TRIGGER_Project_Sahaj',

  // 3. Low-Level Systems & Game Engines
  'TRIGGER_Project_OneMoreMove',
  'TRIGGER_Forge_GameDev',
  'TRIGGER_Project_KnightsAdventure',

  // 4. Spatial Computing & WebAR
  'TRIGGER_Project_RealmWebAR',
  'TRIGGER_Project_TraceMateAR',

  // 5. Full-Stack Web & Cloud Systems
  'TRIGGER_Project_ExamPlatform',
  'TRIGGER_Project_CMEDetector',
  'TRIGGER_Project_Sadhana',
  'TRIGGER_Project_Nishtha',
  'TRIGGER_Project_Vyuham',
  'TRIGGER_Project_SmartCampus',
  'TRIGGER_Project_GameStore',
  'TRIGGER_Project_SchoolWebsite',

  // 6. Landmarks & Finale
  'TRIGGER_Moonwell_Skills',
  'TRIGGER_Stonehenge_Puzzle',
  'TRIGGER_Citadel_Contact',
];

const STATION_TELEPORT_COORDS: Record<string, { x: number; y: number; z: number }> = {
  // 1. Core & Accreditations (Spaced across Harbor & Town)
  TRIGGER_Harbor_Welcome: { x: 107.0, y: 4.0, z: 125.0 },
  TRIGGER_Project_CMEDetector: { x: 85.0, y: 4.0, z: 118.0 },
  TRIGGER_Hall_Certifications: { x: 65.0, y: 4.0, z: 95.0 },
  TRIGGER_Village_About: { x: 45.0, y: 4.0, z: -4.0 },
  TRIGGER_Leadership_Pavilion: { x: 35.0, y: 4.0, z: 12.0 },
  TRIGGER_Arena_Algorithms: { x: 18.0, y: 4.0, z: -30.0 },

  // 2. Village & Marketplace Districts (Spaced along open paths, clear of NPC stalls)
  TRIGGER_Project_ExamPlatform: { x: 8.0, y: 4.0, z: -17.5 },
  TRIGGER_Project_SmartCampus: { x: 22.0, y: 4.0, z: -6.0 },
  TRIGGER_Project_GameStore: { x: 58.0, y: 4.0, z: 8.0 },
  TRIGGER_Project_SchoolWebsite: { x: 48.0, y: 4.0, z: -22.0 },
  TRIGGER_Project_Akshayanidhi: { x: 52.0, y: 6.5, z: -15.0 },
  TRIGGER_Project_Sadhana: { x: -12.0, y: 4.0, z: -12.0 },
  TRIGGER_Project_Vyuham: { x: -5.0, y: 4.0, z: 8.0 },
  TRIGGER_Project_Nishtha: { x: 98.0, y: 4.0, z: 25.0 },

  // 3. Forge & Industrial Quarter
  TRIGGER_Forge_GameDev: { x: -95.0, y: 4.0, z: -6.0 },
  TRIGGER_Project_OneMoreMove: { x: -78.0, y: 4.0, z: -28.0 },

  // 4. Windmill & Highlands
  TRIGGER_Project_KnightsAdventure: { x: -58.0, y: 18.5, z: -58.0 },

  // 5. Nature, Grove & Western Meadows
  TRIGGER_Project_Sahaj: { x: -18.0, y: 4.0, z: 58.0 },
  TRIGGER_Moonwell_Skills: { x: -48.0, y: 4.0, z: 34.0 },
  TRIGGER_Project_RealmWebAR: { x: -32.0, y: 4.0, z: 20.0 },
  TRIGGER_Project_TraceMateAR: { x: -72.0, y: 4.0, z: 12.0 },

  // 6. Historic Megaliths & Cliff Overlook
  TRIGGER_Stonehenge_Puzzle: { x: 35.0, y: 4.0, z: 58.0 },
  TRIGGER_Project_MaraRAG: { x: 72.0, y: 12.5, z: 18.0 },

  // 7. Mountain Pass & High Citadel
  TRIGGER_Project_LifeManager: { x: 0.0, y: 4.0, z: -92.0 },
  TRIGGER_Project_ButlerOS: { x: -30.0, y: 28.5, z: -80.0 },
  TRIGGER_Citadel_Contact: { x: -15.0, y: 58.5, z: -100.0 },
};

const CATEGORIES = [
  'All',
  'Core & Accreditations',
  'AI & Autonomous Systems',
  'Game Engines & Low-Level',
  'Spatial Computing & WebAR',
  'Full-Stack & Cloud Systems',
  'Landmarks & Interactive',
] as const;

export const StationPortfolioModal: React.FC = () => {
  const isStationModalOpen = useGameStore((state) => state.isStationModalOpen);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const activeStationId = useGameStore((state) => state.activeStationId);
  const teleportPlayer = useGameStore((state) => state.teleportPlayer);

  const [selectedStationKey, setSelectedStationKey] = useState<string>('TRIGGER_Harbor_Welcome');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync selected station with whichever trigger opened the modal
  useEffect(() => {
    if (activeStationId && portfolioData[activeStationId]) {
      setSelectedStationKey(activeStationId);
    }
  }, [activeStationId]);

  // Ensure pointer lock is exited when modal opens so mouse can interact with UI
  useEffect(() => {
    if (isStationModalOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isStationModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStationModalOpen) {
        e.preventDefault();
        e.stopPropagation();
        setStationModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isStationModalOpen, setStationModalOpen]);

  // Filtered station list based on Category and Search Query
  const filteredStationKeys = useMemo(() => {
    return STATION_KEYS.filter((key) => {
      const item = portfolioData[key];
      if (!item) return false;

      // Category filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSubtitle = item.subtitle?.toLowerCase().includes(query) ?? false;
        const matchesBadge = item.badge?.toLowerCase().includes(query) ?? false;
        const matchesTech = item.techStack?.some(t => t.toLowerCase().includes(query)) ||
                            item.primaryTech?.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesSubtitle || matchesBadge || matchesTech;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-default select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setStationModalOpen(false);
        }
      }}
    >
      {/* Modal Card Container */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-stone-950/95 border border-amber-500/30 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col md:flex-row overflow-hidden text-stone-200 font-sans select-text">
        
        {/* Close Button */}
        <button
          onClick={() => setStationModalOpen(false)}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10 transition-all cursor-pointer shadow-lg"
          title="Close Modal (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- LEFT SIDEBAR: STATION NAVIGATION --- */}
        <div className="w-full md:w-80 bg-stone-900/80 border-b md:border-b-0 md:border-r border-white/10 p-3 md:p-4 flex flex-col shrink-0">
          
          {/* Header & Station Count */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">
                Stations ({STATION_KEYS.length})
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Master SSOT
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search 19 projects, skills, DSA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-950/80 border border-white/10 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-2 custom-scrollbar text-[10px] font-mono shrink-0">
            {CATEGORIES.map((cat) => {
              const isCatActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isCatActive
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-white/5'
                  }`}
                >
                  {cat === 'All' ? 'All' : cat.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Station List */}
          <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto custom-scrollbar flex-1 pb-2">
            {filteredStationKeys.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-500 font-mono">
                No matching stations found.
              </div>
            ) : (
              filteredStationKeys.map((key) => {
                const item = portfolioData[key];
                const isSelected = selectedStationKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedStationKey(key)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer shrink-0 md:shrink md:w-full ${
                      isSelected
                        ? 'bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
                        : 'hover:bg-white/5 border border-transparent text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-stone-800 flex items-center justify-center text-[10px] font-mono text-stone-400 shrink-0">
                        {STATION_KEYS.indexOf(key) + 1}
                      </span>
                      <div className="truncate">
                        <div className="truncate text-stone-200 font-medium">{item?.title}</div>
                        {item?.badge && (
                          <div className="text-[10px] font-mono text-stone-400 truncate">{item.badge}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 hidden md:block text-amber-400 shrink-0 ml-1" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Teleport Action from Sidebar */}
          <div className="pt-3 border-t border-white/10 mt-auto hidden md:block shrink-0">
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>Teleport Character Here</span>
            </button>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto custom-scrollbar flex flex-col">
          
          {/* Header Badges & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {currentData.category}
              </span>
              {currentData.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-stone-800/90 text-stone-300 border border-white/10">
                  {currentData.badge}
                </span>
              )}
            </div>

            {/* In-header Teleport Pill */}
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-amber-400 rounded-lg text-xs font-mono font-semibold border border-amber-500/30 transition-all cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              <span>Teleport</span>
            </button>
          </div>

          {/* Station Title & Subtitle */}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-100 tracking-wide mb-1">
            {currentData.title}
          </h2>
          {currentData.subtitle && (
            <p className="text-sm text-stone-400 font-medium mb-4">
              {currentData.subtitle}
            </p>
          )}

          {/* Quantified Metrics Highlight Bar */}
          {currentData.metrics && currentData.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {currentData.metrics.map((metric, i) => (
                <div key={i} className="p-2.5 bg-stone-900/60 border border-amber-500/20 rounded-xl flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono font-medium text-stone-200 truncate">
                    {metric}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Main Body Content */}
          <div className="space-y-6 flex-1">

            {/* Description / Bio / Story */}
            {(currentData.shortBio || currentData.description || currentData.story) && (
              <p className="text-stone-300 leading-relaxed text-sm md:text-base">
                {currentData.shortBio || currentData.description || currentData.story}
              </p>
            )}

            {/* 1. COMPETITIVE PROGRAMMING / ALGORITHMIC ARENA */}
            {currentData.competitiveMetrics && (
              <div className="space-y-5 p-5 bg-stone-900/80 border border-amber-500/30 rounded-2xl shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold flex items-center gap-2">
                    <Binary className="w-4 h-4" /> Algorithmic Problem Solving Mastery
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {currentData.competitiveMetrics.totalSolved}+ Total Solved
                  </span>
                </div>

                {/* Platform Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* LeetCode Card */}
                  <div className="p-4 bg-stone-950/80 border border-white/10 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone-100">LeetCode</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{currentData.competitiveMetrics.leetcode.total} Solved</span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[11px] font-mono text-red-300 font-bold">
                          Hard: {currentData.competitiveMetrics.leetcode.hard}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono text-amber-300 font-bold">
                          Medium: {currentData.competitiveMetrics.leetcode.medium}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 font-bold">
                          Easy: {currentData.competitiveMetrics.leetcode.easy}
                        </span>
                      </div>
                    </div>
                    <a
                      href={currentData.competitiveMetrics.leetcode.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <span>View LeetCode Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* GeeksforGeeks Card */}
                  <div className="p-4 bg-stone-950/80 border border-white/10 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-stone-100">GeeksforGeeks (GFG)</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{currentData.competitiveMetrics.geeksforgeeks.total}+ Solved</span>
                      </div>
                      <p className="text-xs text-stone-400 mb-3">
                        {currentData.competitiveMetrics.geeksforgeeks.role}
                      </p>
                    </div>
                    <a
                      href={currentData.competitiveMetrics.geeksforgeeks.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      <span>View GFG Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Core Algorithmic Topics */}
                <div>
                  <h5 className="text-[11px] uppercase tracking-wider text-stone-400 font-mono mb-2">Core Pattern Mastery</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {currentData.competitiveMetrics.coreTopics.map((topic) => (
                      <span key={topic} className="px-2.5 py-1 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-300">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. OFFICIAL CERTIFICATIONS (Harvard CS50x) */}
            {currentData.certifications && currentData.certifications.length > 0 && (
              <div className="space-y-4">
                {currentData.certifications.map((cert) => (
                  <div key={cert.credentialId} className="p-5 bg-gradient-to-r from-red-950/30 to-stone-900 border border-red-500/30 rounded-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-red-400" />
                        <h4 className="text-base font-bold text-stone-100">{cert.name}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                        {cert.status}
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 font-mono mb-3">
                      Issuer: <strong className="text-stone-200">{cert.issuer}</strong> • Credential ID: <code className="text-amber-300">{cert.credentialId}</code>
                    </p>

                    <p className="text-xs text-stone-300 leading-relaxed mb-4">
                      {cert.skillsCovered}
                    </p>

                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verify Official Harvard Credential (PDF)</span>
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* 3. EDUCATION & COURSEWORK */}
            {currentData.education && (
              <div className="p-5 bg-stone-900/80 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Degree & University Record
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    CGPA: {currentData.education.cgpa}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-bold text-stone-100">{currentData.education.degree}</p>
                  <p className="text-xs text-stone-400">{currentData.education.college} • Class of {currentData.education.expectedGraduation}</p>
                </div>

                {currentData.education.coursework && (
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider text-stone-400 font-mono mb-2">Core Technical Coursework</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {currentData.education.coursework.map((course) => (
                        <span key={course} className="px-2.5 py-1 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-300">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. LEADERSHIP & MENTORSHIP ROLES */}
            {currentData.leadershipRoles && currentData.leadershipRoles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" /> Positions of Responsibility & Leadership
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentData.leadershipRoles.map((role, i) => (
                    <div key={i} className="p-4 bg-stone-900/80 border border-white/10 rounded-xl space-y-2">
                      <div className="text-sm font-bold text-amber-300">{role.title}</div>
                      <div className="text-xs font-mono text-stone-400">{role.organization}</div>
                      <p className="text-xs text-stone-300 leading-relaxed">{role.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TECH STACK PILLS */}
            {(currentData.techStack || currentData.primaryTech) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Technologies & Core Libraries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(currentData.techStack || currentData.primaryTech)!.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 6. GOOGLE XYZ HIGHLIGHTS / ACCOMPLISHMENTS */}
            {currentData.highlights && currentData.highlights.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Architectural Accomplishments (Google XYZ)
                </h4>
                <ul className="space-y-2.5 text-xs md:text-sm text-stone-300">
                  {currentData.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 7. CORE SYSTEMS / GAME ARCHITECTURE */}
            {currentData.coreSystems && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Core Systems & Physics Architecture
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

            {/* 8. SKILLS MATRIX */}
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

            {/* 9. STONEHENGE MINI-GAME & CREATIVE SIDE */}
            {currentData.miniGame && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">
                  {currentData.miniGame.title}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
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
                  {currentData.creativeSide.title}
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

            {/* 10. CITADEL CONTACT & COLLABORATION */}
            {currentData.collaborationAreas && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold mb-2">
                  Strategic Areas for Immediate Collaboration
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

            {/* ACTION BUTTONS (GitHub, Live Demo, Resume, Email, LinkedIn) */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              {currentData.github && (
                <a
                  href={currentData.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>View GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              )}

              {currentData.liveDemo && (
                <a
                  href={currentData.liveDemo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Launch Live Demo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

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

              {currentData.email && (
                <a
                  href={`mailto:${currentData.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>
              )}

              {currentData.quickLinks?.linkedin && (
                <a
                  href={currentData.quickLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-sky-400 rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
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

          {/* Bottom Teleport Button for Mobile */}
          <div className="pt-4 mt-6 border-t border-white/10 md:hidden flex justify-end">
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold"
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
