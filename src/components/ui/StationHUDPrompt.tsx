import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Compass } from 'lucide-react';
import { getStationTheme } from '../../data/stationThemes';

export const StationHUDPrompt: React.FC = () => {
  const activeStationPrompt = useGameStore((state) => state.activeStationPrompt);
  const activeStationId = useGameStore((state) => state.activeStationId);
  const isStationModalOpen = useGameStore((state) => state.isStationModalOpen);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const hasStarted = useGameStore((state) => state.hasStarted);

  if (!hasStarted || !activeStationPrompt || isStationModalOpen) return null;

  const theme = getStationTheme(activeStationId || '');

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
      <button
        onClick={() => {
          if (typeof document !== 'undefined' && document.pointerLockElement) {
            document.exitPointerLock();
          }
          setStationModalOpen(true);
        }}
        className="flex items-center gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#182522]/90 hover:bg-[#182522] border border-[#D4B777]/35 hover:border-[#D4B777]/60 text-[#E9E4D7] shadow-[0_12px_32px_rgba(10,18,16,0.6)] backdrop-blur-xl transition-all hover:scale-105 cursor-pointer select-none group"
      >
        <span className="w-5 h-5 rounded-full bg-[#527C68]/20 border border-[#D4B777]/30 flex items-center justify-center text-[#D4B777] group-hover:rotate-45 transition-transform duration-300">
          <Compass className="w-3.5 h-3.5 stroke-[1.75]" />
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-heading font-medium tracking-tight text-[#E9E4D7]">
            {activeStationPrompt}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#101a18]/80 border border-[#D4B777]/30 text-[10px] font-mono font-bold text-[#D4B777] shadow-inner">
            E
          </span>
        </div>
      </button>
    </div>
  );
};
