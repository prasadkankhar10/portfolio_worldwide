import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData, type StationData } from '../../data/portfolioData';
import { getStationTheme } from '../../data/stationThemes';
import { ProjectShowcaseWidget } from './ProjectShowcaseWidget';
import { STATION_MONUMENT_DEFS } from '../3d/StationMonuments';
import { CourierContactForm } from './CourierContactForm';
import { 
  X, ExternalLink, Mail, Download, Search, 
  Sparkles, Code2, Gamepad2, Award, BookOpen, 
  Compass, Binary, ArrowUpRight, Terminal, 
  BrainCircuit, Globe, Layers, CheckCircle2,
  FileText, Briefcase, GraduationCap, ChevronRight,
  ChevronLeft, ShieldCheck, MapPin, AlertTriangle,
  Eye, Cpu
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

// Distinct list of all 18 production & research projects
const PROJECT_STATION_KEYS = [
  'TRIGGER_Project_OneMoreMove',
  'TRIGGER_Project_ButlerOS',
  'TRIGGER_Project_MaraRAG',
  'TRIGGER_Forge_GameDev',
  'TRIGGER_Project_KnightsAdventure',
  'TRIGGER_Project_CMEDetector',
  'TRIGGER_Project_Akshayanidhi',
  'TRIGGER_Project_LifeManager',
  'TRIGGER_Project_Sahaj',
  'TRIGGER_Project_ExamPlatform',
  'TRIGGER_Project_Sadhana',
  'TRIGGER_Project_Nishtha',
  'TRIGGER_Project_Vyuham',
  'TRIGGER_Project_TraceMateAR',
  'TRIGGER_Project_RealmWebAR',
  'TRIGGER_Project_SmartCampus',
  'TRIGGER_Project_GameStore',
  'TRIGGER_Project_SchoolWebsite',
];

const STATION_TELEPORT_COORDS: Record<string, { x: number; y: number; z: number }> = Object.fromEntries(
  STATION_MONUMENT_DEFS.map((s) => [
    s.id,
    { x: s.pos[0], y: s.pos[1] + 1.0, z: s.pos[2] + 2.0 }
  ])
);

const CATEGORIES = [
  'All',
  'AI & Autonomous Systems',
  'Game Engines & Low-Level',
  'Spatial Computing & WebAR',
  'Full-Stack & Cloud Systems',
] as const;

export const QuickPortfolioModal: React.FC = () => {
  const isQuickPortfolioOpen = useGameStore((state) => state.isQuickPortfolioOpen);
  const setQuickPortfolioOpen = useGameStore((state) => state.setQuickPortfolioOpen);
  const setGameState = useGameStore((state) => state.setGameState);
  const setHasStarted = useGameStore((state) => state.setHasStarted);
  const teleportPlayer = useGameStore((state) => state.teleportPlayer);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProjectKey, setSelectedProjectKey] = useState<string | null>(null);

  // Handle ESC key: close selected project detail first if open, else close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedProjectKey) {
          e.preventDefault();
          e.stopPropagation();
          setSelectedProjectKey(null);
        } else if (isQuickPortfolioOpen) {
          e.preventDefault();
          e.stopPropagation();
          setQuickPortfolioOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isQuickPortfolioOpen, selectedProjectKey, setQuickPortfolioOpen]);

  // Release pointer lock whenever quick portfolio opens
  useEffect(() => {
    if (isQuickPortfolioOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isQuickPortfolioOpen]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return PROJECT_STATION_KEYS.filter((key) => {
      const data = portfolioData[key];
      if (!data) return false;

      const categoryMatch = 
        activeCategory === 'All' || 
        (activeCategory === 'AI & Autonomous Systems' && data.category === 'AI & Autonomous Systems') ||
        (activeCategory === 'Game Engines & Low-Level' && data.category === 'Game Engines & Low-Level') ||
        (activeCategory === 'Spatial Computing & WebAR' && data.category === 'Spatial Computing & WebAR') ||
        (activeCategory === 'Full-Stack & Cloud Systems' && data.category === 'Full-Stack & Cloud Systems');

      if (!categoryMatch) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = data.title.toLowerCase().includes(query);
        const subMatch = data.subtitle?.toLowerCase().includes(query) ?? false;
        const descMatch = (data.description || data.shortBio || '').toLowerCase().includes(query);
        const techMatch = (data.primaryTech || data.techStack || []).some((t) => t.toLowerCase().includes(query));
        return titleMatch || subMatch || descMatch || techMatch;
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  if (!isQuickPortfolioOpen) return null;

  const candidate = portfolioData.TRIGGER_Harbor_Welcome;
  const algorithms = portfolioData.TRIGGER_Arena_Algorithms?.competitiveMetrics;
  const cert = portfolioData.TRIGGER_Hall_Certifications?.certifications?.[0];
  const education = portfolioData.TRIGGER_Village_About?.education;

  const handleSwitchTo3D = () => {
    setQuickPortfolioOpen(false);
    setHasStarted(true);
    setGameState('playing');
    if (typeof document !== 'undefined' && !useGameStore.getState().isMobile) {
      setTimeout(() => {
        try {
          document.body.requestPointerLock();
        } catch {
          // Silently catch
        }
      }, 150);
    }
  };

  const handleExploreIn3D = (stationKey: string) => {
    const coords = STATION_TELEPORT_COORDS[stationKey];
    if (coords) {
      teleportPlayer({ x: coords.x, y: coords.y, z: coords.z });
      setGameState('playing');
      setHasStarted(true);
      setQuickPortfolioOpen(false);
      setSelectedProjectKey(null);
      if (typeof document !== 'undefined' && !useGameStore.getState().isMobile) {
        setTimeout(() => {
          try {
            document.body.requestPointerLock();
          } catch {
            // Silently catch
          }
        }, 150);
      }
    }
  };

  // Next and Previous navigation for selected project detail view
  const currentProjectIndex = selectedProjectKey ? PROJECT_STATION_KEYS.indexOf(selectedProjectKey) : -1;
  const prevProjectKey = currentProjectIndex > 0 ? PROJECT_STATION_KEYS[currentProjectIndex - 1] : PROJECT_STATION_KEYS[PROJECT_STATION_KEYS.length - 1];
  const nextProjectKey = currentProjectIndex >= 0 && currentProjectIndex < PROJECT_STATION_KEYS.length - 1 ? PROJECT_STATION_KEYS[currentProjectIndex + 1] : PROJECT_STATION_KEYS[0];

  return (
    <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200">
      
      {/* Main Container Card */}
      <div className="relative w-full max-w-7xl h-[94vh] bg-[#25352D] border border-[#3A4B40]/40 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* ================================================================= */}
        {/* MODAL HEADER BAR */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A4B40]/30 bg-[#111916]/90 backdrop-blur-xl shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#3A4B40]/20 border border-[#D6BC83]/30 text-[#D6BC83]">
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-[#F0E9DA] tracking-tight flex items-center gap-2">
                <span>Fast 2D Recruiter & Systems Portfolio</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#3A4B40]/30 text-[#D6BC83] font-normal border border-[#3A4B40]/50">
                  Quick View
                </span>
              </h2>
              <p className="text-xs text-[#F0E9DA]/60 font-sans hidden sm:block">
                All 19 verified systems, algorithmic achievements, and architecture specs in one responsive view.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch to 3D Button */}
            <button
              onClick={handleSwitchTo3D}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#3A4B40]/25 hover:bg-[#3A4B40]/45 border border-[#D6BC83]/30 text-[#D6BC83] text-xs font-heading font-semibold transition-all cursor-pointer shadow-sm"
              title="Return to the 3D Island World"
            >
              <Compass className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden sm:inline">Explore 3D Island</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setQuickPortfolioOpen(false)}
              className="p-2 rounded-xl bg-[#1B2822] hover:bg-[#20302c] text-[#F0E9DA]/70 hover:text-[#F0E9DA] border border-[#3A4B40]/30 transition-colors cursor-pointer"
              title="Close Portfolio (Esc)"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCROLLABLE MAIN CONTENT BODY */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-10">

          {/* ============================================================= */}
          {/* 1. CANDIDATE HERO & RECRUITER DOSSIER */}
          {/* ============================================================= */}
          <section className="p-6 sm:p-8 rounded-3xl border border-[#3A4B40]/30 bg-gradient-to-br from-[#1B2822] via-[#25352D] to-[#111916] shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#D6BC83]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D6BC83]/15 text-[#D6BC83] border border-[#D6BC83]/30">
                    SDE Candidate
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#3A4B40]/20 text-[#F0E9DA]/80 border border-[#3A4B40]/30 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#3A4B40]" />
                    Buldhana, Maharashtra, India
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Available for SDE Roles
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#F0E9DA] tracking-tight">
                  Prasad Anil Kankhar
                </h1>
                <p className="text-sm sm:text-base font-heading font-medium text-[#D6BC83]">
                  Software Development Engineer (SDE) • Systems, Graphics & Distributed Architectures
                </p>
                <p className="text-xs sm:text-sm text-[#F0E9DA]/80 font-sans leading-relaxed">
                  {candidate?.shortBio || 'Results-driven Software Development Engineer with deep expertise in C++, TypeScript, Python, and scalable distributed architectures.'}
                </p>

                {/* Key Metrics Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  {(candidate?.metrics || [
                    "100,000+ Lines Audited Code",
                    "19 Verified Software Projects",
                    "854+ Algorithmic Solved",
                    "Harvard CS50x Certified"
                  ]).map((metric, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#111916]/70 border border-[#3A4B40]/25 text-center">
                      <div className="text-xs sm:text-sm font-heading font-bold text-[#D6BC83]">{metric}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
                <a
                  href="assets/Prasad_Kankhar_Resume.pdf"
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D6BC83] hover:bg-[#E8D5A7] text-[#1B2822] text-xs font-heading font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resume</span>
                </a>

                <a
                  href="https://github.com/prasadkankhar10"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111916]/80 hover:bg-[#111916] border border-[#3A4B40]/40 hover:border-[#D6BC83]/50 text-xs font-heading font-semibold text-[#F0E9DA] transition-all cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 text-[#F0E9DA]/50" />
                </a>

                <a
                  href="https://linkedin.com/in/prasad-kankhar"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111916]/80 hover:bg-[#111916] border border-[#3A4B40]/40 hover:border-[#D6BC83]/50 text-xs font-heading font-semibold text-[#F0E9DA] transition-all cursor-pointer"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[#F0E9DA]/50" />
                </a>

                <a
                  href="mailto:prasadkankhar5@gmail.com"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A4B40]/20 hover:bg-[#3A4B40]/35 border border-[#D6BC83]/30 text-xs font-heading font-semibold text-[#D6BC83] transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>prasadkankhar5@gmail.com</span>
                </a>
              </div>
            </div>
          </section>

          {/* ============================================================= */}
          {/* 2. TECHNICAL EXPERTISE & SKILLS MATRIX */}
          {/* ============================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#D6BC83] stroke-[1.75]" />
              <h3 className="text-xl font-heading font-bold text-[#F0E9DA] tracking-tight">
                Core Technical Stack & Engineering Capabilities
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Panel 1 */}
              <div className="p-5 rounded-2xl border border-[#3A4B40]/25 bg-[#1B2822]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D6BC83] flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Languages & Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['C++ (17/20)', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'C'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#111916]/80 border border-[#3A4B40]/30 text-xs font-mono text-[#F0E9DA]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 2 */}
              <div className="p-5 rounded-2xl border border-[#3A4B40]/25 bg-[#1B2822]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D6BC83] flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Graphics & Engines</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Unreal Engine 5.4', 'Three.js / WebGL', 'SDL3', 'OpenGL', 'Rapier 3D', 'WebAR'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#111916]/80 border border-[#3A4B40]/30 text-xs font-mono text-[#F0E9DA]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 3 */}
              <div className="p-5 rounded-2xl border border-[#3A4B40]/25 bg-[#1B2822]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D6BC83] flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Web & Cloud Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React 19', 'FastAPI', 'Node.js', 'Next.js', 'Express', 'TailwindCSS', 'PostgreSQL', 'Docker'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#111916]/80 border border-[#3A4B40]/30 text-xs font-mono text-[#F0E9DA]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 4 */}
              <div className="p-5 rounded-2xl border border-[#3A4B40]/25 bg-[#1B2822]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D6BC83] flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  <span>AI & Autonomous Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Multi-Agent Systems', 'RAG Pipelines', 'LangChain', '512-dim Embeddings', 'NLP', 'Vector Search'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#111916]/80 border border-[#3A4B40]/30 text-xs font-mono text-[#F0E9DA]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ============================================================= */}
          {/* 3. 19 PRODUCTION & RESEARCH PROJECTS DIRECTORY */}
          {/* ============================================================= */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D6BC83] stroke-[1.75]" />
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#F0E9DA] tracking-tight">
                    Featured Systems & Projects ({filteredProjects.length})
                  </h3>
                </div>
                <p className="text-xs text-[#F0E9DA]/70 font-sans mt-0.5">
                  Click any project card to open its full architecture spec, interactive sandbox prototype, and Google XYZ metrics.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#F0E9DA]/40 stroke-[1.75]" />
                <input
                  type="text"
                  placeholder="Search by title, tech or architecture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#111916]/70 border border-[#3A4B40]/30 rounded-xl text-xs text-[#F0E9DA] placeholder-[#F0E9DA]/40 focus:outline-none focus:border-[#D6BC83]/50"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs font-mono">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#D6BC83] text-[#1B2822] font-heading font-bold shadow-sm'
                      : 'bg-[#111916]/60 hover:bg-[#111916] text-[#F0E9DA]/70 hover:text-[#F0E9DA] border border-[#3A4B40]/25'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Projects Grid: Clean Quick Look Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((key) => {
                const project = portfolioData[key];
                if (!project) return null;

                const techs = project.primaryTech || project.techStack || [];
                const metrics = project.metrics || [];

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedProjectKey(key)}
                    className="group relative p-6 rounded-2xl border border-[#3A4B40]/30 hover:border-[#D6BC83]/60 bg-[#1B2822]/80 hover:bg-[#1B2822] backdrop-blur-xl flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(212,183,119,0.12)] hover:-translate-y-1"
                  >
                    <div>
                      {/* Category Tag & Quick Look Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#3A4B40]/20 border border-[#3A4B40]/40 text-[#D6BC83]">
                          {project.category}
                        </span>
                        {project.manualActionRequired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-900/40 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Action Pending</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D6BC83]/10 text-[#D6BC83] border border-[#D6BC83]/25 flex items-center gap-1 group-hover:bg-[#D6BC83] group-hover:text-[#1B2822] transition-colors">
                            <Eye className="w-3 h-3" />
                            <span>Quick Look</span>
                          </span>
                        )}
                      </div>

                      {/* Project Title */}
                      <h4 className="text-lg font-heading font-bold text-[#F0E9DA] group-hover:text-[#D6BC83] transition-colors tracking-tight mb-1">
                        {project.title}
                      </h4>

                      {/* Subtitle */}
                      {project.subtitle && (
                        <p className="text-xs text-[#D6BC83]/80 font-heading font-medium mb-3">
                          {project.subtitle}
                        </p>
                      )}

                      {/* Concise Teaser Description */}
                      <p className="text-xs text-[#F0E9DA]/75 font-sans leading-relaxed mb-3 line-clamp-2">
                        {project.shortBio || project.description || ''}
                      </p>

                      {/* Performance Metric Ribbon Chips */}
                      {metrics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {metrics.slice(0, 2).map((m, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#111916]/70 border border-[#D6BC83]/25 text-[10px] font-mono text-[#D6BC83] flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-[#D6BC83] shrink-0" />
                              <span className="truncate max-w-[170px]">{m}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Tech Stack Chips */}
                      <div className="flex flex-wrap gap-1 mb-4 pt-2 border-t border-[#3A4B40]/20">
                        {techs.slice(0, 4).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 rounded bg-[#111916]/60 text-[10px] font-mono text-[#F0E9DA]/75">
                            {tech}
                          </span>
                        ))}
                        {techs.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#F0E9DA]/50">
                            +{techs.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Action Links & Full Info Trigger Button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#3A4B40]/15">
                        <div className="flex items-center gap-2">
                          {project.github && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Open GitHub Repository"
                              className="p-1.5 rounded-lg bg-[#111916]/80 hover:bg-[#111916] border border-[#3A4B40]/30 hover:border-[#D6BC83]/40 text-[#F0E9DA]/80 hover:text-[#D6BC83] transition-colors"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {project.liveDemo && (
                            <a
                              href={project.liveDemo}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Launch Live Prototype"
                              className="p-1.5 rounded-lg bg-[#D6BC83]/15 hover:bg-[#D6BC83]/25 border border-[#D6BC83]/30 text-[#D6BC83] transition-all"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedProjectKey(key)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3A4B40]/20 group-hover:bg-[#D6BC83] border border-[#3A4B40]/40 group-hover:border-[#D6BC83] text-xs font-mono font-semibold text-[#F0E9DA] group-hover:text-[#1B2822] transition-all cursor-pointer shadow-sm"
                        >
                          <span>Full Project Info</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>

          {/* ============================================================= */}
          {/* 4. ALGORITHMIC ARENA & COMPETITIVE PROGRAMMING */}
          {/* ============================================================= */}
          {algorithms && (
            <section className="p-6 sm:p-8 rounded-3xl border border-[#3A4B40]/30 bg-[#1B2822]/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3A4B40]/20 pb-4">
                <div className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-[#D6BC83] stroke-[1.75]" />
                  <h3 className="text-xl font-heading font-bold text-[#F0E9DA] tracking-tight">
                    Algorithmic Foundations & Competitive Problem Solving
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D6BC83]/15 text-[#D6BC83] border border-[#D6BC83]/35 w-fit">
                  {algorithms.totalSolved}+ Total Problems Solved
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* LeetCode Card */}
                <div className="p-4 rounded-2xl bg-[#111916]/70 border border-[#3A4B40]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-heading font-bold text-[#F0E9DA]">LeetCode Platform</span>
                    <a
                      href={algorithms.leetcode.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#D6BC83] hover:underline flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#1B2822] border border-[#3A4B40]/20">
                      <div className="text-xs text-rose-400 font-bold font-mono">{algorithms.leetcode.hard}</div>
                      <div className="text-[10px] text-[#F0E9DA]/60">Hard Solved</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1B2822] border border-[#3A4B40]/20">
                      <div className="text-xs text-amber-400 font-bold font-mono">{algorithms.leetcode.medium}</div>
                      <div className="text-[10px] text-[#F0E9DA]/60">Medium Solved</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1B2822] border border-[#3A4B40]/20">
                      <div className="text-xs text-emerald-400 font-bold font-mono">{algorithms.leetcode.easy}</div>
                      <div className="text-[10px] text-[#F0E9DA]/60">Easy Solved</div>
                    </div>
                  </div>
                </div>

                {/* GeeksforGeeks Card */}
                <div className="p-4 rounded-2xl bg-[#111916]/70 border border-[#3A4B40]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-heading font-bold text-[#F0E9DA]">GeeksforGeeks Community</span>
                    <a
                      href={algorithms.geeksforgeeks.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#D6BC83] hover:underline flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#1B2822] border border-[#3A4B40]/20">
                      <div className="text-xs text-[#D6BC83] font-bold font-mono">{algorithms.geeksforgeeks.total}+</div>
                      <div className="text-[10px] text-[#F0E9DA]/60">Problems Solved</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#1B2822] border border-[#3A4B40]/20">
                      <div className="text-xs text-[#3A4B40] font-bold font-mono">Campus Mantri</div>
                      <div className="text-[10px] text-[#F0E9DA]/60">{algorithms.geeksforgeeks.role}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Topics Covered */}
              <div className="pt-2">
                <span className="text-xs font-mono text-[#F0E9DA]/60 uppercase tracking-wider block mb-2">
                  Specialized Mathematical & Algorithmic Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {algorithms.coreTopics.map((topic) => (
                    <span key={topic} className="px-2.5 py-1 rounded-lg bg-[#111916] border border-[#3A4B40]/25 text-xs font-mono text-[#F0E9DA]/85">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ============================================================= */}
          {/* 5. HARVARD CS50X & ACADEMIC CREDENTIALS */}
          {/* ============================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Harvard CS50x Card */}
            {cert && (
              <div className="p-6 rounded-3xl border border-[#D6BC83]/30 bg-[#1B2822]/90 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D6BC83] stroke-[1.75]" />
                  <h3 className="text-lg font-heading font-bold text-[#F0E9DA] tracking-tight">
                    Harvard CS50x Verified Certification
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#111916]/80 border border-[#3A4B40]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#D6BC83]">{cert.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3A4B40]/20 text-[#3A4B40] font-bold">Verified</span>
                  </div>
                  <div className="text-xs text-[#F0E9DA]/75 font-sans">{cert.issuer}</div>
                  <p className="text-xs text-[#F0E9DA]/80 font-sans leading-relaxed pt-1">
                    {cert.skillsCovered}
                  </p>
                  <div className="pt-2">
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D6BC83]/15 hover:bg-[#D6BC83]/25 border border-[#D6BC83]/40 text-xs font-mono font-semibold text-[#D6BC83] transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Harvard Certificate</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Journey Card */}
            {education && (
              <div className="p-6 rounded-3xl border border-[#3A4B40]/30 bg-[#1B2822]/90 space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#D6BC83] stroke-[1.75]" />
                  <h3 className="text-lg font-heading font-bold text-[#F0E9DA] tracking-tight">
                    Academic Background
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#111916]/80 border border-[#3A4B40]/25 space-y-2">
                  <div className="text-xs font-mono font-bold text-[#D6BC83]">{education.degree}</div>
                  <div className="text-xs text-[#F0E9DA]/80 font-sans">{education.college}</div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F0E9DA]/60 pt-1">
                    <span>Expected Graduation: {education.expectedGraduation}</span>
                    <span>•</span>
                    <span>CGPA: {education.cgpa}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-[#F0E9DA]/60 mb-1">Core Coursework:</div>
                    <div className="flex flex-wrap gap-1">
                      {education.coursework.slice(0, 5).map((course) => (
                        <span key={course} className="px-2 py-0.5 rounded bg-[#1B2822] text-[10px] font-mono text-[#F0E9DA]/75 border border-[#3A4B40]/20">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </section>

          {/* ============================================================= */}
          {/* 6. CONTACT & FINAL CTA */}
          {/* ============================================================= */}
          <section className="space-y-6">
            <CourierContactForm />

            <div className="p-6 sm:p-8 rounded-3xl border border-[#D6BC83]/30 bg-[#111916]/90 text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#F0E9DA] tracking-tight">
                Direct Channels & Social Profiles
              </h3>
              <p className="text-xs text-[#F0E9DA]/75 font-sans max-w-lg mx-auto leading-relaxed">
                Open to high-impact Software Development Engineer (SDE), Game Engine, and Distributed Systems roles. Reach out directly via email or LinkedIn.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="mailto:prasadkankhar5@gmail.com"
                  className="px-6 py-2.5 rounded-xl bg-[#D6BC83] hover:bg-[#E8D5A7] text-[#1B2822] font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>

                <a
                  href="https://linkedin.com/in/prasad-kankhar"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-[#1B2822] hover:bg-[#1f302c] border border-[#3A4B40]/40 hover:border-[#D6BC83]/40 text-[#F0E9DA] font-heading font-semibold text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn Message</span>
                </a>

                <button
                  onClick={handleSwitchTo3D}
                  className="px-6 py-2.5 rounded-xl bg-[#3A4B40]/25 hover:bg-[#3A4B40]/40 border border-[#D6BC83]/35 text-[#D6BC83] font-heading font-semibold text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore in 3D Island</span>
                </button>
              </div>

              <div className="pt-6 border-t border-[#3A4B40]/20 text-[11px] font-mono text-[#F0E9DA]/40">
                Prasad Anil Kankhar • Software Development Engineer • Buldhana, Maharashtra, India
              </div>
            </div>
          </section>

        </div>

      </div>

      {/* ================================================================= */}
      {/* 7. FULL PROJECT DETAIL MODAL (USING EXACT 3D PORTFOLIO TEMPLATE) */}
      {/* ================================================================= */}
      {selectedProjectKey && (() => {
        const project = portfolioData[selectedProjectKey];
        if (!project) return null;
        const theme = getStationTheme(selectedProjectKey);
        const metrics = (theme.metricsRibbon && theme.metricsRibbon.length > 0) ? theme.metricsRibbon : (project.metrics || []);
        const techs = project.primaryTech || project.techStack || [];

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
            onClick={() => setSelectedProjectKey(null)}
          >
            <div 
              className="relative w-full max-w-5xl max-h-[92vh] bg-[#25352D] border border-[#3A4B40]/50 rounded-3xl flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Top Header Navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A4B40]/30 bg-[#111916]/95 backdrop-blur-xl shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedProjectKey(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2822] hover:bg-[#3A4B40]/30 border border-[#3A4B40]/40 text-xs font-mono text-[#F0E9DA] hover:text-[#D6BC83] transition-all cursor-pointer shrink-0"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Projects</span>
                  </button>
                  <div className="h-4 w-[1px] bg-[#3A4B40]/30 shrink-0 hidden sm:block" />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#3A4B40]/20 border border-[#3A4B40]/40 text-[#D6BC83] shrink-0 hidden sm:inline-block">
                    {project.category}
                  </span>
                  <span className="text-xs font-heading font-bold text-[#F0E9DA] truncate hidden md:inline-block">
                    {project.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Prev / Next Project Navigation */}
                  <div className="flex items-center bg-[#1B2822] border border-[#3A4B40]/30 rounded-xl p-0.5">
                    <button
                      onClick={() => setSelectedProjectKey(prevProjectKey)}
                      title="Previous Project"
                      className="p-1.5 rounded-lg hover:bg-[#3A4B40]/30 text-[#F0E9DA]/70 hover:text-[#D6BC83] transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono px-2 text-[#F0E9DA]/50">
                      {currentProjectIndex + 1} / {PROJECT_STATION_KEYS.length}
                    </span>
                    <button
                      onClick={() => setSelectedProjectKey(nextProjectKey)}
                      title="Next Project"
                      className="p-1.5 rounded-lg hover:bg-[#3A4B40]/30 text-[#F0E9DA]/70 hover:text-[#D6BC83] transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Explore in 3D Button */}
                  <button
                    onClick={() => handleExploreIn3D(selectedProjectKey)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3A4B40]/20 hover:bg-[#3A4B40]/40 border border-[#D6BC83]/35 text-xs font-mono font-semibold text-[#D6BC83] transition-all cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore in 3D</span>
                  </button>

                  {/* Close Modal Button */}
                  <button
                    onClick={() => setSelectedProjectKey(null)}
                    className="p-2 rounded-xl bg-[#1B2822] hover:bg-rose-950/40 text-[#F0E9DA]/70 hover:text-rose-400 border border-[#3A4B40]/30 transition-colors cursor-pointer"
                    title="Close Details (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body (Same Template as 3D Portfolio) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
                
                {/* 1. Title & Header Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#3A4B40]/20 border border-[#3A4B40]/40 text-[#D6BC83]">
                      {project.category}
                    </span>
                    {project.badge && (
                      <span className="text-[11px] font-mono text-[#F0E9DA]/60">
                        {project.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#F0E9DA] tracking-tight">
                    {project.title}
                  </h2>
                  {project.subtitle && (
                    <p className="text-sm text-[#D6BC83] font-heading font-semibold mt-1">
                      {project.subtitle}
                    </p>
                  )}
                </div>

                {/* 2. Pending Action Items Warning Banner (Marked Left / To Add Manually) */}
                {project.manualActionRequired && (
                  <div className="p-4 rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/60 via-[#1B2822] to-amber-950/40 text-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider text-amber-400 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Action Required • Pending Manual Addition</span>
                    </div>
                    <p className="text-xs text-amber-200/90 mb-2.5 font-sans leading-relaxed">
                      {project.manualActionRequired.summary}:
                    </p>
                    <ul className="space-y-1.5 text-xs text-amber-300 font-mono">
                      {project.manualActionRequired.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-500/20">
                          <span className="text-amber-400 font-bold shrink-0">⚠️</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Quantified Performance Ribbon */}
                {metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {metrics.map((metric, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 border border-[#3A4B40]/25 bg-[#111916]/70 rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <Sparkles className="w-3 h-3 shrink-0 text-[#D6BC83] stroke-[1.75]" />
                        <span className="text-[11px] font-mono font-medium text-[#F0E9DA]/90 truncate">
                          {metric}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Interactive Prototype Sandbox */}
                <div>
                  <ProjectShowcaseWidget
                    stationId={selectedProjectKey}
                    projectId={theme.projectId}
                    theme={theme}
                    onTeleport={handleExploreIn3D}
                  />
                </div>

                {/* 5. Comprehensive Architectural Narrative & Problem Statement */}
                {(project.problemStatement || project.description || project.shortBio) && (
                  <div className="p-5 rounded-2xl bg-[#111916]/60 border border-[#3A4B40]/25 space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-[#D6BC83] font-mono font-bold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 stroke-[1.75]" /> Architectural Narrative & Problem Statement
                    </h4>
                    <p className="text-xs md:text-sm text-[#F0E9DA]/85 leading-relaxed font-sans">
                      {project.problemStatement || project.description || project.shortBio}
                    </p>
                  </div>
                )}

                {/* 6. Verified Architectural Accomplishments (Google XYZ Format) */}
                {project.highlights && project.highlights.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#111916]/60 border border-[#3A4B40]/25 space-y-3">
                    <h4 className="text-xs uppercase tracking-widest text-[#D6BC83] font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.75]" /> Verified Architectural Accomplishments (Google XYZ)
                    </h4>
                    <ul className="space-y-2 text-xs md:text-sm text-[#F0E9DA]/85">
                      {project.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <span className="w-2 h-2 rounded-full bg-[#D6BC83] shrink-0 mt-1.5" />
                          <span className="leading-relaxed font-sans">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 7. Core Systems, Algorithms, Data Structures & Physics Architecture */}
                {(project.algorithmsAndDataStructures || project.coreSystems || project.architecture) && (
                  <div className="p-5 rounded-2xl bg-[#111916]/60 border border-[#3A4B40]/25 space-y-3">
                    <h4 className="text-xs uppercase tracking-widest text-[#3A4B40] font-mono font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 stroke-[1.75]" /> Core Systems, Data Structures & Physics Architecture
                    </h4>
                    <ul className="space-y-2 text-xs md:text-sm text-[#F0E9DA]/85">
                      {(project.algorithmsAndDataStructures || project.coreSystems || project.architecture)!.map((sys, i) => (
                        <li key={i} className="flex items-start gap-2 bg-[#25352D]/80 p-2.5 rounded-xl border border-[#3A4B40]/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3A4B40] shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-sans">{sys}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 8. Technologies & Core Libraries */}
                {techs.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#111916]/60 border border-[#3A4B40]/25 space-y-2">
                    <h4 className="text-xs uppercase tracking-widest text-[#D6BC83] font-mono font-bold flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 stroke-[1.75]" /> Technologies & Core Libraries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech) => (
                        <span key={tech} className="px-3 py-1 border border-[#3A4B40]/30 bg-[#3A4B40]/15 rounded-lg text-xs font-mono text-[#F0E9DA]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#3A4B40]/25">
                  <div className="flex flex-wrap items-center gap-3">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#111916]/80 hover:bg-[#111916] text-[#F0E9DA] hover:text-[#D6BC83] rounded-xl text-xs font-heading font-semibold border border-[#3A4B40]/30 transition-colors"
                      >
                        <GithubIcon className="w-4 h-4" />
                        <span>View GitHub Repository</span>
                        <ExternalLink className="w-3 h-3 text-[#F0E9DA]/50" />
                      </a>
                    )}
                    {project.liveDemo && (
                      <a
                        href={project.liveDemo}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 font-heading font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md bg-[#D6BC83] hover:bg-[#E8D5A7] text-[#1B2822]"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Launch Live Prototype</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => handleExploreIn3D(selectedProjectKey)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-bold transition-all shadow-md cursor-pointer bg-[#3A4B40] hover:bg-[#689680] text-[#F0E9DA]"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore in 3D Island</span>
                    </button>
                  </div>

                  <a
                    href="mailto:prasadkankhar5@gmail.com"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-heading font-semibold transition-all cursor-pointer border border-[#D6BC83]/35 bg-[#111916]/80 hover:bg-[#111916] text-[#D6BC83]"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Inquire via Email</span>
                  </a>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
