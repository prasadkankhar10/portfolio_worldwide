import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Sparkles } from 'lucide-react';

export const StationHUDPrompt: React.FC = () => {
  const activeStationPrompt = useGameStore((state) => state.activeStationPrompt);
  const isStationModalOpen = useGameStore((state) => state.isStationModalOpen);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const hasStarted = useGameStore((state) => state.hasStarted);

  if (!hasStarted || !activeStationPrompt || isStationModalOpen) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={() => setStationModalOpen(true)}
        className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-stone-950/90 hover:bg-stone-900 border border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.35)] text-stone-100 font-mono text-xs sm:text-sm tracking-wide transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
      >
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="font-bold text-amber-300">{activeStationPrompt}</span>
      </button>
    </div>
  );
};
