import React from 'react';
import { useGameStore, type UITheme } from '../../store/useGameStore';
import { Sparkles, Palette, Zap, Trees } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
  const uiTheme = useGameStore((state) => state.uiTheme);
  const setUITheme = useGameStore((state) => state.setUITheme);
  const toggleUITheme = useGameStore((state) => state.toggleUITheme);

  if (compact) {
    return (
      <button
        onClick={toggleUITheme}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm text-xs font-mono ${
          uiTheme === 'obsidian'
            ? 'bg-[#1B1E24] hover:bg-[#252932] border-[#5684F5]/40 text-[#8FB0FF]'
            : 'bg-[#182522] hover:bg-[#20302c] border-[#D4B777]/35 text-[#D4B777]'
        } ${className}`}
        title={`Current Theme: ${uiTheme === 'obsidian' ? 'Obsidian Cobalt' : 'Forest Gold'}. Click to toggle!`}
      >
        {uiTheme === 'obsidian' ? (
          <>
            <Zap className="w-3.5 h-3.5 text-[#5684F5] fill-[#5684F5]/30" />
            <span className="hidden sm:inline font-bold">Obsidian</span>
          </>
        ) : (
          <>
            <Trees className="w-3.5 h-3.5 text-[#D4B777]" />
            <span className="hidden sm:inline font-bold">Forest</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 rounded-2xl border bg-[#101a18]/90 backdrop-blur-xl border-[#527C68]/30 shadow-md ${className}`}>
      {/* Forest Gold Button */}
      <button
        onClick={() => setUITheme('forest')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
          uiTheme === 'forest'
            ? 'bg-[#182522] text-[#D4B777] border border-[#D4B777]/50 shadow-sm font-bold'
            : 'text-[#E9E4D7]/60 hover:text-[#E9E4D7]'
        }`}
        title="Classic Emerald Forest & Gold"
      >
        <Trees className="w-3.5 h-3.5 text-[#D4B777]" />
        <span>Forest Gold</span>
      </button>

      {/* Obsidian Cobalt Button */}
      <button
        onClick={() => setUITheme('obsidian')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
          uiTheme === 'obsidian'
            ? 'bg-[#252932] text-[#8FB0FF] border border-[#5684F5]/60 shadow-sm font-bold'
            : 'text-[#E9E4D7]/60 hover:text-[#E9E4D7]'
        }`}
        title="Modern High-Tech Obsidian & Electric Cobalt"
      >
        <Zap className="w-3.5 h-3.5 text-[#5684F5] fill-[#5684F5]/30" />
        <span>Obsidian Cobalt</span>
      </button>
    </div>
  );
};
