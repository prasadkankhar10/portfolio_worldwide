import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import { Compass } from 'lucide-react';

export const QuestTracker: React.FC = () => {
  const questStep = useGameStore((state) => state.questStep);

  const getObjective = (step: number) => {
    switch (step) {
      case 0:
        return "Find the Wizard of Origins near the forest.";
      case 1:
        return "Speak to the Golden Knights in the courtyard.";
      case 2:
        return "Find the Elf of Engineering deep in the woods.";
      case 3:
        return "Seek out the Pirate Captain at the docks.";
      case 4:
        return "Find the Cleric of AI near the glowing runes.";
      case 5:
        return "Talk to the Goblin Tinkerer at the market edge.";
      case 6:
        return "Find the Cowboy Sheriff in the marketplace.";
      case 7:
        return "Speak to the Witch of the Arts at her stall.";
      case 8:
        return "Return to the Wizard of Origins for the Finale!";
      default:
        return "You have gathered all fragments of knowledge!";
    }
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0 md:top-6 md:right-6 pointer-events-none select-none z-50">
      <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-xl p-3 md:p-4 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center gap-3">
        <div className="bg-amber-500/20 p-2 rounded-full hidden md:block">
          <Compass className="w-5 h-5 text-amber-400 animate-[spin_4s_linear_infinite]" />
        </div>
        <div>
          <h3 className="text-amber-500 text-xs md:text-sm font-bold uppercase tracking-widest mb-0.5">
            Quest Objective {questStep < 9 ? `(${questStep}/8)` : ''}
          </h3>
          <p className="text-white text-sm md:text-base font-medium max-w-[200px] md:max-w-[300px] leading-tight">
            {getObjective(questStep)}
          </p>
        </div>
      </div>
    </div>
  );
};
