import React, { useState, useMemo, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { portfolioData, type StationData } from '../../data/portfolioData';
import { CourierContactForm } from './CourierContactForm';
import { 
  X, ExternalLink, Mail, Download, Search, 
  Sparkles, Code2, Gamepad2, Award, BookOpen, 
  Compass, Binary, ArrowUpRight, Terminal, 
  BrainCircuit, Globe, Layers, CheckCircle2,
  FileText, Briefcase, GraduationCap, ChevronRight,
  ShieldCheck, MapPin, AlertTriangle
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

// Distinct list of 19 projects
const PROJECT_STATION_KEYS = [
  'TRIGGER_Project_ButlerOS',
  'TRIGGER_Project_MaraRAG',
  'TRIGGER_Project_Akshayanidhi',
  'TRIGGER_Project_LifeManager',
  'TRIGGER_Project_Sahaj',
  'TRIGGER_Project_OneMoreMove',
  'TRIGGER_Forge_GameDev',
  'TRIGGER_Project_KnightsAdventure',
  'TRIGGER_Project_RealmWebAR',
  'TRIGGER_Project_TraceMateAR',
  'TRIGGER_Project_ExamPlatform',
  'TRIGGER_Project_CMEDetector',
  'TRIGGER_Project_Sadhana',
  'TRIGGER_Project_Nishtha',
  'TRIGGER_Project_Vyuham',
  'TRIGGER_Project_SmartCampus',
  'TRIGGER_Project_GameStore',
  'TRIGGER_Project_SchoolWebsite',
];

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

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQuickPortfolioOpen) {
        e.preventDefault();
        e.stopPropagation();
        setQuickPortfolioOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isQuickPortfolioOpen, setQuickPortfolioOpen]);

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
      try {
        document.body.requestPointerLock();
      } catch {
        // Silently catch
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#101a18]/85 backdrop-blur-md animate-in fade-in duration-200 select-text"
      onClick={(e) => {
        if (e.target === e.currentTarget) setQuickPortfolioOpen(false);
      }}
    >
      {/* Modal Container: Organic Minimalism + Forest & Gold */}
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#14201d]/98 border border-[#D4B777]/30 rounded-3xl shadow-[0_24px_80px_rgba(10,18,16,0.95)] flex flex-col overflow-hidden text-[#E9E4D7] font-sans">
        
        {/* Sticky Header */}
        <header className="px-5 sm:px-8 py-4 border-b border-[#527C68]/25 bg-[#182522]/95 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#527C68]/20 border border-[#D4B777]/30 flex items-center justify-center text-[#D4B777]">
              <Briefcase className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-heading font-extrabold text-[#E9E4D7] tracking-tight leading-tight">
                Prasad Anil Kankhar
              </h1>
              <p className="text-xs text-[#D4B777] font-heading font-medium">
                Standard Portfolio • Executive Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSwitchTo3D}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#527C68]/20 hover:bg-[#527C68]/35 border border-[#527C68]/40 hover:border-[#D4B777]/40 text-[#E9E4D7] hover:text-[#D4B777] text-xs font-sans font-medium transition-all cursor-pointer"
              title="Launch the 3D interactive island world"
            >
              <Compass className="w-3.5 h-3.5 text-[#D4B777]" />
              <span>Explore 3D Island</span>
            </button>

            {candidate.resume && (
              <a
                href={candidate.resume.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] text-xs font-heading font-bold transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Download</span>
                <span>Resume PDF</span>
              </a>
            )}

            <button
              onClick={() => setQuickPortfolioOpen(false)}
              className="p-2 text-[#E9E4D7]/60 hover:text-[#D4B777] bg-[#101a18]/70 hover:bg-[#101a18] border border-[#527C68]/30 rounded-full transition-all cursor-pointer ml-1"
              title="Close Portfolio (Esc)"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>
        </header>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 md:p-12 space-y-12">
          
          {/* ============================================================= */}
          {/* 1. HERO & IDENTITY BANNER */}
          {/* ============================================================= */}
          <section className="relative p-6 sm:p-10 rounded-3xl border border-[#D4B777]/25 bg-[#182522]/90 backdrop-blur-xl shadow-xl">
            <div className="max-w-4xl space-y-4">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#527C68]/20 border border-[#D4B777]/30 text-[#D4B777] text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Software Development Engineer (SDE) • Systems & 3D Graphics</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#E9E4D7] tracking-tight leading-tight">
                Engineering Zero-Magic Systems, Game Engines & AI Platforms
              </h2>

              <p className="text-sm sm:text-base text-[#E9E4D7]/85 font-sans leading-relaxed max-w-3xl">
                {candidate.shortBio}
              </p>

              {/* Verified Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="p-3.5 rounded-2xl bg-[#101a18]/80 border border-[#527C68]/30">
                  <div className="text-xl sm:text-2xl font-mono font-bold text-[#D4B777]">100,000+</div>
                  <div className="text-xs text-[#E9E4D7]/70 font-sans mt-0.5">Lines of Audited Code</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#101a18]/80 border border-[#527C68]/30">
                  <div className="text-xl sm:text-2xl font-mono font-bold text-[#D4B777]">19</div>
                  <div className="text-xs text-[#E9E4D7]/70 font-sans mt-0.5">Verified Projects Built</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#101a18]/80 border border-[#527C68]/30">
                  <div className="text-xl sm:text-2xl font-mono font-bold text-[#D4B777]">854+</div>
                  <div className="text-xs text-[#E9E4D7]/70 font-sans mt-0.5">Algorithmic Problems Solved</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#101a18]/80 border border-[#527C68]/30">
                  <div className="text-xl sm:text-2xl font-mono font-bold text-[#D4B777]">Harvard CS50x</div>
                  <div className="text-xs text-[#E9E4D7]/70 font-sans mt-0.5">Verified Credential</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <a
                  href="https://github.com/prasadkankhar10"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101a18]/80 hover:bg-[#101a18] border border-[#527C68]/40 hover:border-[#D4B777]/50 text-xs font-heading font-semibold text-[#E9E4D7] transition-all cursor-pointer"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3 h-3 text-[#E9E4D7]/50" />
                </a>

                <a
                  href="https://linkedin.com/in/prasad-kankhar"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101a18]/80 hover:bg-[#101a18] border border-[#527C68]/40 hover:border-[#D4B777]/50 text-xs font-heading font-semibold text-[#E9E4D7] transition-all cursor-pointer"
                >
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3 h-3 text-[#E9E4D7]/50" />
                </a>

                <a
                  href="mailto:prasadkankhar@gmail.com"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#527C68]/20 hover:bg-[#527C68]/35 border border-[#D4B777]/30 text-xs font-heading font-semibold text-[#D4B777] transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>prasadkankhar@gmail.com</span>
                </a>
              </div>

            </div>
          </section>

          {/* ============================================================= */}
          {/* 2. TECHNICAL EXPERTISE & SKILLS MATRIX */}
          {/* ============================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
              <h3 className="text-xl font-heading font-bold text-[#E9E4D7] tracking-tight">
                Core Technical Stack & Engineering Capabilities
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Panel 1 */}
              <div className="p-5 rounded-2xl border border-[#527C68]/25 bg-[#182522]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D4B777] flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Languages & Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['C++ (17/20)', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'C'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#101a18]/80 border border-[#527C68]/30 text-xs font-mono text-[#E9E4D7]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 2 */}
              <div className="p-5 rounded-2xl border border-[#527C68]/25 bg-[#182522]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D4B777] flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Graphics & Engines</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Unreal Engine 5.4', 'Three.js / WebGL', 'SDL3', 'OpenGL', 'Rapier 3D', 'WebAR'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#101a18]/80 border border-[#527C68]/30 text-xs font-mono text-[#E9E4D7]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 3 */}
              <div className="p-5 rounded-2xl border border-[#527C68]/25 bg-[#182522]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D4B777] flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Web & Cloud Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['React 19', 'FastAPI', 'Node.js', 'Next.js', 'Express', 'TailwindCSS', 'PostgreSQL', 'Docker'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#101a18]/80 border border-[#527C68]/30 text-xs font-mono text-[#E9E4D7]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Panel 4 */}
              <div className="p-5 rounded-2xl border border-[#527C68]/25 bg-[#182522]/70 space-y-3">
                <div className="text-xs uppercase font-mono font-bold text-[#D4B777] flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  <span>AI & Autonomous Systems</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Multi-Agent Systems', 'RAG Pipelines', 'LangChain', '512-dim Embeddings', 'NLP', 'Vector Search'].map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-[#101a18]/80 border border-[#527C68]/30 text-xs font-mono text-[#E9E4D7]">
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
                  <Layers className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#E9E4D7] tracking-tight">
                    Featured Systems & Projects ({filteredProjects.length})
                  </h3>
                </div>
                <p className="text-xs text-[#E9E4D7]/70 font-sans mt-0.5">
                  Audited software engineering spanning low-level engines, agentic AI, and scalable cloud architectures.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#E9E4D7]/40 stroke-[1.75]" />
                <input
                  type="text"
                  placeholder="Search by title, tech or architecture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-[#101a18]/70 border border-[#527C68]/30 rounded-xl text-xs text-[#E9E4D7] placeholder-[#E9E4D7]/40 focus:outline-none focus:border-[#D4B777]/50"
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
                      ? 'bg-[#D4B777] text-[#182522] font-heading font-bold shadow-sm'
                      : 'bg-[#101a18]/60 hover:bg-[#101a18] text-[#E9E4D7]/70 hover:text-[#E9E4D7] border border-[#527C68]/25'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((key) => {
                const project = portfolioData[key];
                if (!project) return null;

                const techs = project.primaryTech || project.techStack || [];
                const metrics = project.metrics || [];

                return (
                  <div
                    key={key}
                    className="p-6 rounded-2xl border border-[#527C68]/30 hover:border-[#D4B777]/40 bg-[#182522]/80 hover:bg-[#182522] backdrop-blur-xl flex flex-col justify-between transition-all duration-200 group shadow-lg"
                  >
                    <div>
                      {/* Category Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#527C68]/20 border border-[#527C68]/40 text-[#D4B777]">
                          {project.category}
                        </span>
                        {project.manualActionRequired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-900/40 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Action Pending</span>
                          </span>
                        ) : project.badge ? (
                          <span className="text-[10px] font-mono text-[#E9E4D7]/60">
                            {project.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Project Title */}
                      <h4 className="text-lg font-heading font-bold text-[#E9E4D7] group-hover:text-[#D4B777] transition-colors tracking-tight mb-1">
                        {project.title}
                      </h4>

                      {/* Subtitle */}
                      {project.subtitle && (
                        <p className="text-xs text-[#D4B777]/80 font-heading font-medium mb-3">
                          {project.subtitle}
                        </p>
                      )}

                      {/* Description */}
                      <p className="text-xs text-[#E9E4D7]/80 font-sans leading-relaxed mb-3 line-clamp-3">
                        {project.description || project.shortBio || ''}
                      </p>

                      {/* Pending Action Items Warning */}
                      {project.manualActionRequired && (
                        <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 mb-3 text-[11px] font-mono">
                          <span className="font-bold text-amber-400 block mb-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Pending Manual Addition:</span>
                          </span>
                          <span className="text-amber-200/80 text-[10px] line-clamp-2 leading-relaxed">
                            {project.manualActionRequired.items.join(' • ')}
                          </span>
                        </div>
                      )}

                      {/* Quantified Metrics Ribbon */}
                      {metrics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {metrics.slice(0, 2).map((m, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#101a18]/70 border border-[#D4B777]/25 text-[10px] font-mono text-[#D4B777]">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1 mb-4 pt-2 border-t border-[#527C68]/20">
                        {techs.slice(0, 4).map((tech) => (
                          <span key={tech} className="px-2 py-0.5 rounded bg-[#101a18]/60 text-[10px] font-mono text-[#E9E4D7]/75">
                            {tech}
                          </span>
                        ))}
                        {techs.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#E9E4D7]/50">
                            +{techs.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center justify-between gap-2 pt-2">
                        {project.github ? (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#E9E4D7]/80 hover:text-[#D4B777] transition-colors"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>Code Repository</span>
                          </a>
                        ) : (
                          <span className="text-[11px] font-mono text-[#E9E4D7]/40">Internal Systems</span>
                        )}

                        {project.liveDemo && (
                          <a
                            href={project.liveDemo}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4B777]/15 hover:bg-[#D4B777]/25 border border-[#D4B777]/30 text-xs font-mono font-semibold text-[#D4B777] transition-all"
                          >
                            <span>Live Prototype</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
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
            <section className="p-6 sm:p-8 rounded-3xl border border-[#527C68]/30 bg-[#182522]/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#527C68]/20 pb-4">
                <div className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
                  <h3 className="text-xl font-heading font-bold text-[#E9E4D7] tracking-tight">
                    Algorithmic Foundations & Competitive Problem Solving
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#D4B777]/15 text-[#D4B777] border border-[#D4B777]/35 w-fit">
                  {algorithms.totalSolved}+ Total Problems Solved
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* LeetCode Card */}
                <div className="p-4 rounded-2xl bg-[#101a18]/70 border border-[#527C68]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-heading font-bold text-[#E9E4D7]">LeetCode Platform</span>
                    <a
                      href={algorithms.leetcode.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#D4B777] hover:underline flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#182522] border border-[#527C68]/20">
                      <div className="text-xs text-rose-400 font-bold font-mono">{algorithms.leetcode.hard}</div>
                      <div className="text-[10px] text-[#E9E4D7]/60">Hard Solved</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#182522] border border-[#527C68]/20">
                      <div className="text-xs text-amber-400 font-bold font-mono">{algorithms.leetcode.medium}</div>
                      <div className="text-[10px] text-[#E9E4D7]/60">Medium Solved</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#182522] border border-[#527C68]/20">
                      <div className="text-xs text-emerald-400 font-bold font-mono">{algorithms.leetcode.easy}</div>
                      <div className="text-[10px] text-[#E9E4D7]/60">Easy Solved</div>
                    </div>
                  </div>
                </div>

                {/* GeeksforGeeks Card */}
                <div className="p-4 rounded-2xl bg-[#101a18]/70 border border-[#527C68]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-heading font-bold text-[#E9E4D7]">GeeksforGeeks Community</span>
                    <a
                      href={algorithms.geeksforgeeks.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#D4B777] hover:underline flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#182522] border border-[#527C68]/20">
                      <div className="text-xs text-[#D4B777] font-bold font-mono">{algorithms.geeksforgeeks.total}+</div>
                      <div className="text-[10px] text-[#E9E4D7]/60">Problems Solved</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#182522] border border-[#527C68]/20">
                      <div className="text-xs text-[#527C68] font-bold font-mono">Campus Mantri</div>
                      <div className="text-[10px] text-[#E9E4D7]/60">{algorithms.geeksforgeeks.role}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Topics Covered */}
              <div className="pt-2">
                <span className="text-xs font-mono text-[#E9E4D7]/60 uppercase tracking-wider block mb-2">
                  Specialized Mathematical & Algorithmic Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {algorithms.coreTopics.map((topic) => (
                    <span key={topic} className="px-2.5 py-1 rounded-lg bg-[#101a18] border border-[#527C68]/25 text-xs font-mono text-[#E9E4D7]/85">
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
              <div className="p-6 rounded-3xl border border-[#D4B777]/30 bg-[#182522]/90 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
                  <h3 className="text-lg font-heading font-bold text-[#E9E4D7] tracking-tight">
                    Harvard CS50x Verified Certification
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#101a18]/80 border border-[#527C68]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#D4B777]">{cert.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#527C68]/20 text-[#527C68] font-bold">Verified</span>
                  </div>
                  <div className="text-xs text-[#E9E4D7]/75 font-sans">{cert.issuer}</div>
                  <p className="text-xs text-[#E9E4D7]/80 font-sans leading-relaxed pt-1">
                    {cert.skillsCovered}
                  </p>
                  <div className="pt-2">
                    <a
                      href={cert.verifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4B777]/15 hover:bg-[#D4B777]/25 border border-[#D4B777]/40 text-xs font-mono font-semibold text-[#D4B777] transition-all"
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
              <div className="p-6 rounded-3xl border border-[#527C68]/30 bg-[#182522]/90 space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
                  <h3 className="text-lg font-heading font-bold text-[#E9E4D7] tracking-tight">
                    Academic Background
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-[#101a18]/80 border border-[#527C68]/25 space-y-2">
                  <div className="text-xs font-mono font-bold text-[#D4B777]">{education.degree}</div>
                  <div className="text-xs text-[#E9E4D7]/80 font-sans">{education.college}</div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#E9E4D7]/60 pt-1">
                    <span>Expected Graduation: {education.expectedGraduation}</span>
                    <span>•</span>
                    <span>CGPA: {education.cgpa}</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-[#E9E4D7]/60 mb-1">Core Coursework:</div>
                    <div className="flex flex-wrap gap-1">
                      {education.coursework.slice(0, 5).map((course) => (
                        <span key={course} className="px-2 py-0.5 rounded bg-[#182522] text-[10px] font-mono text-[#E9E4D7]/75 border border-[#527C68]/20">
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

            <div className="p-6 sm:p-8 rounded-3xl border border-[#D4B777]/30 bg-[#101a18]/90 text-center space-y-4">
              <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E9E4D7] tracking-tight">
                Direct Channels & Social Profiles
              </h3>
              <p className="text-xs text-[#E9E4D7]/75 font-sans max-w-lg mx-auto leading-relaxed">
                Open to high-impact Software Development Engineer (SDE), Game Engine, and Distributed Systems roles. Reach out directly via email or LinkedIn.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="mailto:prasadkankhar5@gmail.com"
                  className="px-6 py-2.5 rounded-xl bg-[#D4B777] hover:bg-[#E5CD94] text-[#182522] font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </a>

              <a
                href="https://linkedin.com/in/prasad-kankhar"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-[#182522] hover:bg-[#1f302c] border border-[#527C68]/40 hover:border-[#D4B777]/40 text-[#E9E4D7] font-heading font-semibold text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn Message</span>
              </a>

              <button
                onClick={handleSwitchTo3D}
                className="px-6 py-2.5 rounded-xl bg-[#527C68]/25 hover:bg-[#527C68]/40 border border-[#D4B777]/35 text-[#D4B777] font-heading font-semibold text-xs tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore in 3D Island</span>
              </button>
            </div>

              <div className="pt-6 border-t border-[#527C68]/20 text-[11px] font-mono text-[#E9E4D7]/40">
                Prasad Anil Kankhar • Software Development Engineer • Buldhana, Maharashtra, India
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};
