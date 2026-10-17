import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData, type StationData } from '../../data/portfolioData';
import { getStationTheme, type StationTheme } from '../../data/stationThemes';
import { ProjectShowcaseWidget } from './ProjectShowcaseWidget';
import { CourierContactForm } from './CourierContactForm';
import { STATION_MONUMENT_DEFS } from '../3d/StationMonuments';
import { 
  X, ExternalLink, Mail, Download, 
  MapPin, Sparkles, Code2, Gamepad2, Award, BookOpen, 
  Compass, ChevronRight, CheckCircle2, Search, Cpu, Globe, 
  Layers, Terminal, Trophy, Binary, ArrowUpRight, AlertTriangle
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

const STATION_TELEPORT_COORDS: Record<string, { x: number; y: number; z: number }> = Object.fromEntries(
  STATION_MONUMENT_DEFS.map((s) => [
    s.id,
    { x: s.pos[0], y: s.pos[1] + 1.0, z: s.pos[2] + 2.0 }
  ])
);

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

  // Ensure pointer lock is exited when modal opens
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

  // Teleport handler
  const handleTeleportToStation = (stationKey: string) => {
    const coords = STATION_TELEPORT_COORDS[stationKey];
    if (coords) {
      teleportPlayer({ x: coords.x, y: coords.y, z: coords.z });
      setStationModalOpen(false);
      if (typeof document !== 'undefined' && document.body) {
        setTimeout(() => {
          document.body.requestPointerLock();
        }, 100);
      }
    }
  };

  // Filter stations based on Category and Search Query
  const filteredStationKeys = useMemo(() => {
    return STATION_KEYS.filter((key) => {
      const item = portfolioData[key];
      if (!item) return false;

      // Category matching
      if (activeCategory !== 'All') {
        if (activeCategory === 'Core & Accreditations' && ![
          'TRIGGER_Harbor_Welcome', 'TRIGGER_Village_About', 'TRIGGER_Hall_Certifications', 
          'TRIGGER_Arena_Algorithms', 'TRIGGER_Leadership_Pavilion'
        ].includes(key)) return false;

        if (activeCategory === 'AI & Autonomous Systems' && ![
          'TRIGGER_Project_ButlerOS', 'TRIGGER_Project_MaraRAG', 'TRIGGER_Project_Akshayanidhi', 
          'TRIGGER_Project_LifeManager', 'TRIGGER_Project_Sahaj'
        ].includes(key)) return false;

        if (activeCategory === 'Game Engines & Low-Level' && ![
          'TRIGGER_Project_OneMoreMove', 'TRIGGER_Forge_GameDev', 'TRIGGER_Project_KnightsAdventure'
        ].includes(key)) return false;

        if (activeCategory === 'Spatial Computing & WebAR' && ![
          'TRIGGER_Project_RealmWebAR', 'TRIGGER_Project_TraceMateAR'
        ].includes(key)) return false;

        if (activeCategory === 'Full-Stack & Cloud Systems' && ![
          'TRIGGER_Project_ExamPlatform', 'TRIGGER_Project_CMEDetector', 'TRIGGER_Project_Sadhana', 
          'TRIGGER_Project_Nishtha', 'TRIGGER_Project_Vyuham', 'TRIGGER_Project_SmartCampus', 
          'TRIGGER_Project_GameStore', 'TRIGGER_Project_SchoolWebsite'
        ].includes(key)) return false;

        if (activeCategory === 'Landmarks & Interactive' && ![
          'TRIGGER_Moonwell_Skills', 'TRIGGER_Stonehenge_Puzzle', 'TRIGGER_Citadel_Contact'
        ].includes(key)) return false;
      }

      // Search matching
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const subMatch = item.subtitle?.toLowerCase().includes(query) || false;
        const descMatch = item.description?.toLowerCase().includes(query) || false;
        const bioMatch = item.shortBio?.toLowerCase().includes(query) || false;
        const techMatch = item.techStack?.some(t => t.toLowerCase().includes(query)) || false;
        return titleMatch || subMatch || descMatch || bioMatch || techMatch;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  if (!isStationModalOpen) return null;

  const currentData: StationData = portfolioData[selectedStationKey] || portfolioData.TRIGGER_Harbor_Welcome;
  const theme = getStationTheme(selectedStationKey);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#101a18]/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setStationModalOpen(false);
      }}
    >
      {/* Modal Card Container (Organic Minimalism + Forest & Gold) */}
      <div 
        className="relative w-full max-w-6xl h-[92vh] border rounded-3xl flex flex-col md:flex-row overflow-hidden text-[#E9E4D7] font-sans select-text shadow-[0_24px_60px_-12px_rgba(10,18,16,0.85)] transition-all duration-300"
        style={{
          borderColor: theme.modalBorder,
          boxShadow: theme.modalGlow,
          background: theme.modalBgGradient
        }}
      >
        
        {/* Refined Close Button */}
        <button
          onClick={() => setStationModalOpen(false)}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#101a18]/80 hover:bg-[#182522] text-[#E9E4D7]/70 hover:text-[#D4B777] border border-[#527C68]/30 transition-all cursor-pointer shadow-md"
          title="Close Modal (Esc)"
        >
          <X className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* --- LEFT SIDEBAR: STATIONS OF DISCOVERY --- */}
        <div 
          className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#527C68]/25 p-4 flex flex-col shrink-0 bg-[#14201d]/90"
        >
          
          {/* Header & Station Count */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D4B777] stroke-[1.75]" />
              <span className="text-xs uppercase tracking-widest font-heading font-bold text-[#D4B777]">
                Stations ({STATION_KEYS.length})
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#D4B777]/30 bg-[#D4B777]/10 text-[#D4B777]">
              Master Dossier
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#E9E4D7]/40 stroke-[1.75]" />
            <input
              type="text"
              placeholder="Search 19 projects, algorithms, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#101a18]/70 border border-[#527C68]/30 rounded-xl text-xs text-[#E9E4D7] placeholder-[#E9E4D7]/40 focus:outline-none focus:border-[#D4B777]/50"
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
                      ? 'bg-[#D4B777] text-[#182522] font-heading font-bold shadow-sm'
                      : 'bg-[#101a18]/60 hover:bg-[#101a18] text-[#E9E4D7]/65 hover:text-[#E9E4D7] border border-[#527C68]/20'
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
              <div className="p-4 text-center text-xs text-[#E9E4D7]/40 font-mono">
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
                        ? 'bg-[#527C68]/20 border border-[#D4B777]/35 text-[#D4B777] font-semibold shadow-sm'
                        : 'hover:bg-[#101a18]/60 border border-transparent text-[#E9E4D7]/75 hover:text-[#E9E4D7]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-[#101a18] border border-[#527C68]/25 flex items-center justify-center text-[10px] font-mono text-[#D4B777] shrink-0">
                        {STATION_KEYS.indexOf(key) + 1}
                      </span>
                      <div className="truncate">
                        <div className="truncate font-heading font-medium text-[#E9E4D7]">{item?.title}</div>
                        {item?.badge && (
                          <div className="text-[10px] font-mono text-[#E9E4D7]/50 truncate">{item.badge}</div>
                        )}
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 hidden md:block shrink-0 ml-1 text-[#D4B777] stroke-[1.75]" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Teleport Action from Sidebar */}
          <div className="pt-3 border-t border-[#527C68]/20 mt-auto hidden md:block shrink-0">
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-heading font-bold bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] shadow-md transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 fill-current" />
              <span>Teleport Character Here</span>
            </button>
          </div>
        </div>

        {/* --- RIGHT CONTENT AREA --- */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar flex flex-col bg-[#182522]/90">
          
          {/* Header Badges & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider border font-bold bg-[#527C68]/20 border-[#527C68]/40 text-[#E9E4D7]">
                {currentData.category}
              </span>
              {currentData.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#101a18]/70 text-[#E9E4D7]/80 border border-[#527C68]/30">
                  {currentData.badge}
                </span>
              )}
              {theme.projectId && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-[#D4B777]/35 bg-[#D4B777]/10 text-[#D4B777] hidden sm:inline-flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4B777] animate-pulse" />
                  <span>{theme.projectId}</span>
                </span>
              )}
            </div>

            {/* In-header Teleport Pill */}
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#101a18]/70 hover:bg-[#101a18] rounded-lg text-xs font-mono font-semibold border border-[#D4B777]/30 text-[#D4B777] transition-all cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              <span>Teleport</span>
            </button>
          </div>

          {/* Station Title & Subtitle */}
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-[#E9E4D7] tracking-tight mb-1">
            {currentData.title}
          </h2>
          {currentData.subtitle && (
            <p className="text-sm text-[#D4B777] font-heading font-medium mb-3">
              {currentData.subtitle}
            </p>
          )}

          {/* Thematic Persona & Tactile Metaphor Card (Section A) */}
          {(theme.persona || theme.metaphor) && (
            <div className="p-4 rounded-2xl border border-[#D4B777]/25 bg-[#101a18]/60 mb-4 transition-all">
              <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider text-xs mb-1 text-[#D4B777]">
                <Sparkles className="w-3.5 h-3.5 shrink-0 stroke-[1.75]" />
                <span>Thematic Persona: {theme.persona}</span>
              </div>
              {theme.metaphor && (
                <p className="text-[#E9E4D7]/85 text-xs italic font-serif leading-relaxed mt-1">
                  "{theme.metaphor}"
                </p>
              )}
            </div>
          )}

          {/* Theme Tagline Banner */}
          <div className="px-4 py-2 rounded-xl border border-[#527C68]/25 bg-[#101a18]/40 text-xs font-sans text-[#E9E4D7]/80 mb-4 flex items-center gap-2">
            <span>{theme.tagline}</span>
          </div>

          {/* Pending Action Items Warning Banner (Marked Left / To Add Manually) */}
          {currentData.manualActionRequired && (
            <div className="p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-[#182522] to-amber-950/40 text-amber-200 mb-5 shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
              <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Action Required • Pending Manual Addition</span>
              </div>
              <p className="text-xs text-amber-200/90 mb-2.5 font-sans leading-relaxed">
                {currentData.manualActionRequired.summary}:
              </p>
              <ul className="space-y-1.5 text-xs text-amber-300 font-mono">
                {currentData.manualActionRequired.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantified Performance Ribbon (Section D from Blueprint) */}
          {((theme.metricsRibbon && theme.metricsRibbon.length > 0) || (currentData.metrics && currentData.metrics.length > 0)) && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
              {(theme.metricsRibbon || currentData.metrics)!.map((metric, i) => (
                <div 
                  key={i} 
                  className="p-2.5 border border-[#527C68]/25 bg-[#101a18]/70 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Sparkles className="w-3 h-3 shrink-0 text-[#D4B777] stroke-[1.75]" />
                  <span className="text-[11px] font-mono font-medium text-[#E9E4D7]/90 truncate">
                    {metric}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Prototype Sandbox (Section B from Blueprint) */}
          <div className="mb-6">
            <ProjectShowcaseWidget
              stationId={selectedStationKey}
              projectId={theme.projectId}
              theme={theme}
              onTeleport={handleTeleportToStation}
            />
          </div>

          {/* Main Body Content */}
          <div className="space-y-6 flex-1 text-[#E9E4D7]/90 font-sans leading-relaxed text-sm md:text-base">

            {/* Description / Bio / Story */}
            {(currentData.shortBio || currentData.description || currentData.story) && (
              <p className="text-[#E9E4D7]/85 leading-relaxed text-sm md:text-base">
                {currentData.shortBio || currentData.description || currentData.story}
              </p>
            )}

            {/* 1. COMPETITIVE PROGRAMMING / ALGORITHMIC ARENA */}
            {currentData.competitiveMetrics && (
              <div className="space-y-4 p-5 bg-[#101a18]/70 border border-[#527C68]/30 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-[#D4B777] font-mono font-bold flex items-center gap-2">
                    <Binary className="w-4 h-4 stroke-[1.75]" /> Algorithmic Problem Solving Mastery
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D4B777]/15 text-[#D4B777] border border-[#D4B777]/35">
                    {currentData.competitiveMetrics.totalSolved}+ Total Solved
                  </span>
                </div>

                {/* Platform Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* LeetCode Card */}
                  <div className="p-4 bg-[#14201d]/90 border border-[#527C68]/25 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-heading font-bold text-[#E9E4D7]">LeetCode</span>
                        <span className="text-xs font-mono font-bold text-[#D4B777]">{currentData.competitiveMetrics.leetcode.total} Solved</span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-red-900/30 border border-red-500/40 text-[11px] font-mono text-red-300 font-bold">
                          Hard: {currentData.competitiveMetrics.leetcode.hard}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#D4B777]/20 border border-[#D4B777]/40 text-[11px] font-mono text-[#D4B777] font-bold">
                          Medium: {currentData.competitiveMetrics.leetcode.medium}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#527C68]/30 border border-[#527C68]/50 text-[11px] font-mono text-[#E9E4D7] font-bold">
                          Easy: {currentData.competitiveMetrics.leetcode.easy}
                        </span>
                      </div>
                    </div>
                    <a
                      href={currentData.competitiveMetrics.leetcode.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#D4B777] hover:underline font-semibold"
                    >
                      <span>View LeetCode Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* GeeksforGeeks Card */}
                  <div className="p-4 bg-[#14201d]/90 border border-[#527C68]/25 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-heading font-bold text-[#E9E4D7]">GeeksforGeeks</span>
                        <span className="text-xs font-mono font-bold text-[#527C68]">{currentData.competitiveMetrics.geeksforgeeks.total}+ Solved</span>
                      </div>
                      <p className="text-xs text-[#E9E4D7]/70 mb-3">
                        {currentData.competitiveMetrics.geeksforgeeks.role}
                      </p>
                    </div>
                    <a
                      href={currentData.competitiveMetrics.geeksforgeeks.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#527C68] hover:underline font-semibold"
                    >
                      <span>View GFG Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Core Algorithmic Topics */}
                <div>
                  <h5 className="text-[11px] uppercase tracking-wider text-[#E9E4D7]/60 font-mono mb-2">Core Pattern Mastery</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {currentData.competitiveMetrics.coreTopics.map((topic) => (
                      <span key={topic} className="px-2.5 py-1 bg-[#101a18] border border-[#527C68]/25 rounded-lg text-xs font-mono text-[#E9E4D7]/85">
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
                  <div key={cert.credentialId} className="p-5 bg-[#101a18]/70 border border-[#D4B777]/30 rounded-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
                        <h4 className="text-base font-heading font-bold text-[#E9E4D7]">{cert.name}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#D4B777]/15 text-[#D4B777] border border-[#D4B777]/35">
                        {cert.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#E9E4D7]/60 font-mono mb-3">
                      Issuer: <strong className="text-[#E9E4D7]">{cert.issuer}</strong> • Credential ID: <code className="text-[#D4B777]">{cert.credentialId}</code>
                    </p>

                    <p className="text-xs text-[#E9E4D7]/85 leading-relaxed mb-4">
                      {cert.skillsCovered}
                    </p>

                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] rounded-xl text-xs font-heading font-bold transition-all shadow-md"
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
              <div className="p-5 bg-[#101a18]/70 border border-[#527C68]/25 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-widest text-[#D4B777] font-mono font-bold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 stroke-[1.75]" /> Degree & University Record
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#527C68]/20 text-[#E9E4D7] border border-[#527C68]/40">
                    CGPA: {currentData.education.cgpa}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-heading font-bold text-[#E9E4D7]">{currentData.education.degree}</p>
                  <p className="text-xs text-[#E9E4D7]/70">{currentData.education.college} • Class of {currentData.education.expectedGraduation}</p>
                </div>

                {currentData.education.coursework && (
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider text-[#E9E4D7]/60 font-mono mb-2">Core Technical Coursework</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {currentData.education.coursework.map((course) => (
                        <span key={course} className="px-2.5 py-1 bg-[#14201d] border border-[#527C68]/25 rounded-lg text-xs font-mono text-[#E9E4D7]/85">
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
                <h4 className="text-xs uppercase tracking-widest text-[#D4B777] font-mono font-bold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 stroke-[1.75]" /> Positions of Responsibility & Leadership
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentData.leadershipRoles.map((role, i) => (
                    <div key={i} className="p-4 bg-[#101a18]/70 border border-[#527C68]/25 rounded-xl space-y-2">
                      <div className="text-sm font-heading font-bold text-[#D4B777]">{role.title}</div>
                      <div className="text-xs font-mono text-[#E9E4D7]/60">{role.organization}</div>
                      <p className="text-xs text-[#E9E4D7]/85 leading-relaxed">{role.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. TECH STACK PILLS */}
            {(currentData.techStack || currentData.primaryTech) && (
              <div>
                <h4 className="text-xs uppercase tracking-widest font-mono font-bold mb-2 flex items-center gap-1.5 text-[#D4B777]">
                  <Code2 className="w-3.5 h-3.5 stroke-[1.75]" /> Technologies & Core Libraries
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(currentData.techStack || currentData.primaryTech)!.map((tech) => (
                    <span 
                      key={tech} 
                      className="px-3 py-1 border border-[#527C68]/30 bg-[#527C68]/15 rounded-lg text-xs font-mono text-[#E9E4D7] transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 6. GOOGLE XYZ HIGHLIGHTS / ACCOMPLISHMENTS */}
            {currentData.highlights && currentData.highlights.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#D4B777] font-mono font-bold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" /> Verified Architectural Accomplishments (Google XYZ)
                </h4>
                <ul className="space-y-2 text-xs md:text-sm text-[#E9E4D7]/85">
                  {currentData.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#D4B777] shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 7. CORE SYSTEMS / GAME ARCHITECTURE */}
            {currentData.coreSystems && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#527C68] font-mono font-bold mb-2 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 stroke-[1.75]" /> Core Systems & Physics Architecture
                </h4>
                <ul className="space-y-1.5 text-xs text-[#E9E4D7]/85">
                  {currentData.coreSystems.map((sys, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#527C68] shrink-0 mt-0.5" />
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
                    <h4 className="text-xs uppercase tracking-widest text-[#D4B777] font-mono font-bold mb-1.5">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-[#101a18] border border-[#527C68]/25 rounded-lg text-xs font-mono text-[#E9E4D7]/85">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 9. CITADEL CONTACT & COLLABORATION */}
            {currentData.collaborationAreas && (
              <div>
                <h4 className="text-xs uppercase tracking-widest text-[#D4B777] font-mono font-bold mb-2">
                  Strategic Areas for Immediate Collaboration
                </h4>
                <ul className="space-y-1.5 text-xs text-[#E9E4D7]/85">
                  {currentData.collaborationAreas.map((area, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4B777]" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Direct Message Scroll & Courier Vessel Dispatch */}
            {(selectedStationKey === 'TRIGGER_Citadel_Contact' || selectedStationKey === 'TRIGGER_Harbor_Welcome') && (
              <div className="pt-3">
                <CourierContactForm />
              </div>
            )}

            {/* ACTION BUTTONS (GitHub, Live Demo, Resume, Email, LinkedIn) */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#527C68]/25">
              {currentData.github && (
                <a
                  href={currentData.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#101a18]/80 hover:bg-[#101a18] text-[#E9E4D7] hover:text-[#D4B777] rounded-xl text-xs font-heading font-semibold border border-[#527C68]/30 transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>View GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-[#E9E4D7]/50" />
                </a>
              )}

              {currentData.liveDemo && (
                <a
                  href={currentData.liveDemo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 font-heading font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522]"
                >
                  <Globe className="w-4 h-4" />
                  <span>Launch Live Prototype</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {currentData.resume && (
                <a
                  href={currentData.resume.fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shadow-md cursor-pointer bg-[#527C68] hover:bg-[#689680] text-[#E9E4D7]"
                >
                  <Download className="w-4 h-4" />
                  <span>{currentData.resume.label}</span>
                </a>
              )}

              {currentData.email && (
                <a
                  href={`mailto:${currentData.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer border border-[#D4B777]/35 bg-[#101a18]/80 hover:bg-[#101a18] text-[#D4B777]"
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
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#101a18]/80 hover:bg-[#101a18] text-[#E9E4D7] rounded-xl text-xs font-heading font-semibold border border-[#527C68]/30 transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

            {currentData.controlsHint && (
              <div className="p-3 bg-[#101a18]/60 border border-[#527C68]/20 rounded-xl text-xs text-[#E9E4D7]/60 font-mono">
                💡 {currentData.controlsHint}
              </div>
            )}

          </div>

          {/* Bottom Teleport Button for Mobile */}
          <div className="pt-4 mt-6 border-t border-[#527C68]/20 md:hidden flex justify-end">
            <button
              onClick={() => handleTeleportToStation(selectedStationKey)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-bold bg-[#D4B777] text-[#182522] shadow-md"
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
