import { useGameStore } from '../../store/useGameStore';

export const MainMenu = () => {
  const setGameState = useGameStore((state) => state.setGameState);
  const hasStarted = useGameStore((state) => state.hasStarted);
  const setHasStarted = useGameStore((state) => state.setHasStarted);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const setActiveStationId = useGameStore((state) => state.setActiveStationId);

  const handleStart = () => {
    if (!hasStarted) setHasStarted(true);
    setGameState('playing');
  };

  const openStation = (stationKey: string) => {
    setActiveStationId(stationKey);
    setStationModalOpen(true);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-stone-200">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-serif tracking-widest uppercase mb-3 text-amber-500 drop-shadow-lg">
          Prasad Kankhar
        </h1>
        <p className="text-lg md:text-xl text-stone-300 font-light tracking-wider mb-2">
          Game & Software Developer
        </p>
        <p className="text-xs text-amber-400/80 font-mono uppercase tracking-widest">
          Interactive 3D World Portfolio
        </p>
      </div>

      <div className="flex flex-col gap-3 w-72">
        <button 
          onClick={handleStart}
          className="group relative px-6 py-3.5 border border-amber-500/60 bg-amber-500/10 hover:bg-amber-500/20 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <div className="absolute inset-0 w-0 bg-amber-500/20 group-hover:w-full transition-all duration-500 ease-out" />
          <span className="relative text-base tracking-widest uppercase font-bold text-amber-400 group-hover:text-amber-300">
            {hasStarted ? '▶ Resume Exploring' : '⚔ Start 3D World'}
          </span>
        </button>

        <button 
          onClick={() => openStation('TRIGGER_Harbor_Welcome')}
          className="px-6 py-3 border border-amber-500/30 bg-stone-900/80 hover:bg-stone-800 hover:border-amber-400 text-amber-300 font-semibold transition-all duration-300 rounded-xl tracking-wider text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <span>📄 Quick Resume & Bio</span>
        </button>

        <button 
          onClick={() => openStation('TRIGGER_Project_ExamPlatform')}
          className="px-6 py-2.5 border border-stone-800 bg-stone-900/50 hover:bg-stone-800/80 hover:text-white transition-all duration-300 text-stone-400 tracking-wider uppercase text-xs rounded-xl cursor-pointer"
        >
          Software Projects
        </button>

        <button 
          onClick={() => openStation('TRIGGER_Forge_GameDev')}
          className="px-6 py-2.5 border border-stone-800 bg-stone-900/50 hover:bg-stone-800/80 hover:text-white transition-all duration-300 text-stone-400 tracking-wider uppercase text-xs rounded-xl cursor-pointer"
        >
          Game Development (UE5)
        </button>

        <button 
          onClick={() => openStation('TRIGGER_Citadel_Contact')}
          className="px-6 py-2.5 border border-stone-800 bg-stone-900/50 hover:bg-stone-800/80 hover:text-white transition-all duration-300 text-stone-400 tracking-wider uppercase text-xs rounded-xl cursor-pointer"
        >
          Contact & Connect
        </button>
      </div>
    </div>
  );
};
