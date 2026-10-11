import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { 
  X, Compass, BookOpen, User, Code, GraduationCap, Gamepad2, 
  BrainCircuit, Users, Paintbrush, Lock, Sparkles, MapPin
} from 'lucide-react';

const PORTFOLIO_SECTIONS = [
  { 
    id: 'profile', 
    flag: 'learned_profile', 
    title: 'Origins & Profile',
    icon: <User className="w-5 h-5 stroke-[1.75]" />,
    hint: 'Seek the Wizard of Origins near the center to learn of his past.',
    content: 'Prasad Anil Kankhar is a creator originating from Buldhana, Maharashtra, building software that blends technology, creativity, emotional storytelling, and personal growth. He is a disciplined practitioner of artistic handwriting and high-performance engineering.'
  },
  { 
    id: 'academics', 
    flag: 'learned_academics', 
    title: 'Academics & Leadership',
    icon: <GraduationCap className="w-5 h-5 stroke-[1.75]" />,
    hint: 'The Golden Knights guard the knowledge of his training.',
    content: 'Pursuing a B.Tech in Computer Science at MIT, Chhatrapati Sambhajinagar (Class of 2026). He serves as Technical Coordinator for ACTS, Campus Mantri for GeeksforGeeks, and is an active Google Student Ambassador.'
  },
  { 
    id: 'tech', 
    flag: 'learned_tech', 
    title: 'Technical Expertise',
    icon: <Code className="w-5 h-5 stroke-[1.75]" />,
    hint: 'Find the Elf of Engineering in the forests for his tools.',
    content: 'Master of C++, JavaScript, TypeScript, React, Node.js, and Three.js. Builds virtual worlds in Unreal Engine 5.4 and is currently expanding into Unity and low-level systems. Prefers direct, high-signal engineering communication.'
  },
  { 
    id: 'web', 
    flag: 'learned_web', 
    title: 'Full-Stack Systems',
    icon: <BookOpen className="w-5 h-5 stroke-[1.75]" />,
    hint: 'The Pirates of the Web sail the southern coasts.',
    content: 'Engineered "Nishtha" (open-source habit-tracking RPG), "Sadhana" (mindful discipline PWA with offline Firestore sync), "Vyuham" (Chrome MV3 productivity extension), and "TraceMate Pro" (WebAR camera tracing PWA).'
  },
  { 
    id: 'ai', 
    flag: 'learned_ai', 
    title: 'Artificial Intelligence',
    icon: <BrainCircuit className="w-5 h-5 stroke-[1.75]" />,
    hint: 'The Cleric of Artificial Intelligence awaits near the ruins.',
    content: 'Engineered a Professional Assessment Platform using NLP for semantic evaluation. Researches multi-agent workflows. Created "Butler OS" (autonomous desktop multi-agent engine) and "Akshayanidhi" (zero-cost AI photo vault with 512-dim facial clustering).'
  },
  { 
    id: 'games', 
    flag: 'learned_games', 
    title: 'Game Development',
    icon: <Gamepad2 className="w-5 h-5 stroke-[1.75]" />,
    hint: 'The Goblin Tinkerers hide in the valleys making games.',
    content: 'Engineered "One More Move" (C++17 & SDL3 turn-based roguelike engine with procedural PCM audio synthesis) and "Courier Express" (UE 5.4 mobile delivery game with Chaos suspension physics).'
  },
  { 
    id: 'events', 
    flag: 'learned_events', 
    title: 'Community Building',
    icon: <Users className="w-5 h-5 stroke-[1.75]" />,
    hint: 'The Community Sheriff patrols the eastern plains.',
    content: 'Organized an AI & ML Career Guidance Session for over 220 students. Orchestrated a massive "Among Us IRL" physical game event for campus festivals.'
  },
  { 
    id: 'creative', 
    flag: 'learned_creative', 
    title: 'Creative Expression',
    icon: <Paintbrush className="w-5 h-5 stroke-[1.75]" />,
    hint: 'The Witch of the Arts resides in the western groves.',
    content: 'A thoughtful blend of technical ambition, creative thinking, and emotional depth. Writes authentic poetry and Hindi/Devanagari Shayari with purpose-driven narrative storytelling.'
  },
];

export const PortfolioTracker: React.FC = () => {
  const isTrackerOpen = useGameStore((state) => state.isTrackerOpen);
  const setTrackerOpen = useGameStore((state) => state.setTrackerOpen);
  const dialogFlags = useGameStore((state) => state.dialogFlags);
  
  const [activeTab, setActiveTab] = useState<'map' | 'journal'>('journal');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('profile');

  // Automatically release pointer lock whenever tracker opens so cursor is free
  useEffect(() => {
    if (isTrackerOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isTrackerOpen]);

  // Handle ESC key to close tracker
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isTrackerOpen) {
        e.preventDefault();
        e.stopPropagation();
        setTrackerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isTrackerOpen, setTrackerOpen]);

  if (!isTrackerOpen) return null;

  const discoveredCount = PORTFOLIO_SECTIONS.filter((s) => dialogFlags[s.flag]).length;
  const progressPercent = Math.round((discoveredCount / PORTFOLIO_SECTIONS.length) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#101a18]/75 backdrop-blur-md"
        onClick={() => setTrackerOpen(false)}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[88vh] bg-[#182522]/95 backdrop-blur-2xl border border-[#D4B777]/25 rounded-3xl shadow-[0_24px_60px_-12px_rgba(10,18,16,0.8)] overflow-hidden flex flex-col md:flex-row text-[#E9E4D7]">
        
        {/* Close Button */}
        <button 
          onClick={() => setTrackerOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#E9E4D7]/60 hover:text-[#D4B777] bg-[#101a18]/70 hover:bg-[#101a18] border border-[#527C68]/30 rounded-full transition-all z-20 cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-5 h-5 stroke-[1.75]" />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#527C68]/25 flex flex-col bg-[#14201d]/90 shrink-0">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#527C68]/20">
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-[#D4B777] stroke-[1.75]" />
              <h2 className="text-lg font-heading font-bold text-[#E9E4D7] tracking-tight">
                Field Journal
              </h2>
            </div>
            <p className="text-xs text-[#E9E4D7]/60 font-sans mb-4">
              Island Discovery & Memorabilia
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-[#D4B777]">
                <span>Exploration Index</span>
                <span>{discoveredCount} / {PORTFOLIO_SECTIONS.length} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-1.5 bg-[#101a18] rounded-full overflow-hidden border border-[#527C68]/30">
                <div 
                  className="h-full bg-[#D4B777] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {PORTFOLIO_SECTIONS.map((section) => {
              const isDiscovered = dialogFlags[section.flag];
              const isSelected = selectedSectionId === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => { 
                    setActiveTab('journal'); 
                    setSelectedSectionId(section.id); 
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 border flex items-center gap-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#527C68]/20 border-[#D4B777]/35 shadow-sm' 
                      : 'bg-[#101a18]/40 border-transparent hover:bg-[#101a18]/70 hover:border-[#527C68]/25'
                  }`}
                >
                  <div className={`p-2 rounded-lg border ${
                    isDiscovered 
                      ? (isSelected ? 'bg-[#D4B777]/20 border-[#D4B777]/40 text-[#D4B777]' : 'bg-[#527C68]/20 border-[#527C68]/30 text-[#D4B777]')
                      : 'bg-[#101a18] border-white/5 text-[#E9E4D7]/30'
                  }`}>
                    {isDiscovered ? section.icon : <Lock className="w-4 h-4 stroke-[1.75]" />}
                  </div>
                  <div className="flex-1 truncate">
                    <h3 className={`text-xs font-heading font-semibold truncate ${isDiscovered ? 'text-[#E9E4D7]' : 'text-[#E9E4D7]/40'}`}>
                      {isDiscovered ? section.title : 'Undiscovered Station'}
                    </h3>
                    <p className="text-[10px] text-[#E9E4D7]/50 truncate mt-0.5 font-sans">
                      {isDiscovered ? 'Read Dossier' : 'Speak with Island NPCs'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#182522]/80">
          
          {/* Tabs */}
          <div className="flex p-3 sm:p-4 gap-2 border-b border-[#527C68]/20 bg-[#101a18]/50">
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-5 py-2 rounded-xl font-heading font-bold text-xs tracking-wide transition-all cursor-pointer ${
                activeTab === 'journal' 
                  ? 'bg-[#D4B777] text-[#182522] shadow-sm' 
                  : 'bg-[#101a18]/60 text-[#E9E4D7]/65 hover:text-[#E9E4D7] border border-[#527C68]/20'
              }`}
            >
              Journal View
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-5 py-2 rounded-xl font-heading font-bold text-xs tracking-wide transition-all cursor-pointer ${
                activeTab === 'map' 
                  ? 'bg-[#D4B777] text-[#182522] shadow-sm' 
                  : 'bg-[#101a18]/60 text-[#E9E4D7]/65 hover:text-[#E9E4D7] border border-[#527C68]/20'
              }`}
            >
              Island Cartography
            </button>
          </div>

          {/* Details Panel */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
            {activeTab === 'journal' ? (
              <div className="h-full flex flex-col justify-center max-w-xl mx-auto">
                {PORTFOLIO_SECTIONS.map((section) => {
                  if (section.id !== selectedSectionId) return null;
                  const isDiscovered = dialogFlags[section.flag];
                  
                  if (!isDiscovered) {
                    return (
                      <div key={section.id} className="text-center space-y-4 py-8">
                        <div className="w-16 h-16 mx-auto bg-[#101a18] rounded-2xl border border-[#527C68]/30 flex items-center justify-center text-[#E9E4D7]/40">
                          <Lock className="w-7 h-7 stroke-[1.5]" />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-[#E9E4D7]/50 tracking-tight">
                          Entry Not Yet Discovered
                        </h3>
                        <p className="text-sm text-[#D4B777]/80 font-sans italic max-w-sm mx-auto leading-relaxed">
                          "{section.hint}"
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div key={section.id} className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-[#527C68]/20 text-[#D4B777] rounded-2xl border border-[#D4B777]/30 shadow-sm">
                          {section.icon}
                        </div>
                        <div>
                          <div className="text-[11px] font-mono text-[#527C68] uppercase tracking-wider">
                            Verified Log Entry
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#E9E4D7] tracking-tight">
                            {section.title}
                          </h2>
                        </div>
                      </div>

                      <div className="h-px w-full bg-[#527C68]/25" />

                      <p className="text-base sm:text-lg text-[#E9E4D7]/85 leading-relaxed font-sans">
                        {section.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center flex-col gap-4 animate-in zoom-in-95 duration-300">
                <div className="relative w-full max-w-md aspect-square bg-[#101a18]/80 rounded-3xl border border-[#D4B777]/25 overflow-hidden shadow-2xl p-6 flex flex-col items-center justify-center">
                  <div className="text-xs font-mono text-[#D4B777] mb-4 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Archipelago Landmark Compass</span>
                  </div>

                  <div className="grid grid-cols-3 grid-rows-3 gap-6 w-full h-full relative z-10 p-2">
                    <div className="col-start-2 row-start-1 flex flex-col items-center justify-end">
                      <div className="w-3 h-3 rounded-full bg-[#527C68] shadow-[0_0_10px_#527c68]" />
                      <span className="text-[10px] font-mono text-[#E9E4D7]/80 mt-1">Highlands</span>
                    </div>
                    
                    <div className="col-start-1 row-start-2 flex flex-col items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#D4B777] shadow-[0_0_10px_#d4b777]" />
                      <span className="text-[10px] font-mono text-[#E9E4D7]/80 mt-1">Western Grove</span>
                    </div>

                    <div className="col-start-2 row-start-2 flex flex-col items-center justify-center relative">
                      <div className="w-7 h-7 rounded-full border border-[#D4B777] bg-[#527C68]/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D4B777]" />
                      </div>
                      <span className="text-[10px] font-mono text-[#D4B777] font-bold mt-1">Moonwell</span>
                    </div>

                    <div className="col-start-3 row-start-2 flex flex-col items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#D4B777] shadow-[0_0_10px_#d4b777]" />
                      <span className="text-[10px] font-mono text-[#E9E4D7]/80 mt-1">Market Square</span>
                    </div>

                    <div className="col-start-2 row-start-3 flex flex-col items-center justify-start">
                      <div className="w-3 h-3 rounded-full bg-[#527C68] shadow-[0_0_10px_#527c68]" />
                      <span className="text-[10px] font-mono text-[#E9E4D7]/80 mt-1">Harbor Docks</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#E9E4D7]/50 font-mono">
                  Realm of Prasad • Interactive Coordinate Grid
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
