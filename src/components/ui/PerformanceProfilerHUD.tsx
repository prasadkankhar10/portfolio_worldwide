import React, { useEffect, useState } from 'react';
import { frameProfiler } from '../../utils/frameProfiler';
import { PerformanceProfilerModal } from './PerformanceProfilerModal';
import { Play, Square, FileText, ChevronDown, ChevronUp, Zap, Sun, Moon } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const PerformanceProfilerHUD: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [currentFps, setCurrentFps] = useState(60);
  const [currentDeltaMs, setCurrentDeltaMs] = useState(16.6);
  const [currentDrawCalls, setCurrentDrawCalls] = useState(0);
  const [currentTriangles, setCurrentTriangles] = useState(0);
  const [spikeCount, setSpikeCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const performanceMode = useGameStore((state) => state.performanceMode);
  const togglePerformanceMode = useGameStore((state) => state.togglePerformanceMode);
  const setStationModalOpen = useGameStore((state) => state.setStationModalOpen);
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const setAtmosphere = useGameStore((state) => state.setAtmosphere);

  useEffect(() => {
    const unsubscribe = frameProfiler.subscribe((state) => {
      setIsRecording(state.isRecording);
      setFrameCount(state.frameCount);
      setCurrentFps(state.currentFps);
      setCurrentDeltaMs(state.currentDeltaMs);
      setCurrentDrawCalls(state.currentDrawCalls);
      setCurrentTriangles(state.currentTriangles);
      setSpikeCount(state.spikeCount);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Global hotkeys: F8 to start/stop recording, Shift+F8 to open report
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'F8' || (e.shiftKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        if (frameProfiler.isRecording()) {
          frameProfiler.stopRecording();
          setIsModalOpen(true);
        } else {
          frameProfiler.startRecording();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleRecord = () => {
    if (isRecording) {
      frameProfiler.stopRecording();
      setIsModalOpen(true);
    } else {
      frameProfiler.startRecording();
    }
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-emerald-400';
    if (fps >= 30) return 'text-amber-400';
    return 'text-rose-500 font-bold';
  };

  return (
    <>
      <div className="fixed top-20 right-4 z-40 pointer-events-auto select-none font-mono text-xs">
        <div className="flex flex-col items-end gap-1.5">
          {/* Main Profiler Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-950/85 backdrop-blur-md border border-white/15 rounded-lg shadow-xl text-stone-200">
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
              title={isCollapsed ? 'Expand Profiler' : 'Collapse Profiler'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Live FPS */}
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] text-stone-400 uppercase">FPS:</span>
              <span className={`text-sm ${getFpsColor(currentFps)}`}>{currentFps}</span>
            </div>

            {!isCollapsed && (
              <>
                <span className="text-white/20">|</span>
                <div className="text-[11px] text-stone-300">
                  <span className="text-stone-400">{currentDeltaMs}ms</span>
                </div>

                <span className="text-white/20">|</span>
                <div className="text-[11px] text-stone-300">
                  <span className="text-stone-400">Calls:</span>{' '}
                  <span className={currentDrawCalls > 200 ? 'text-amber-400 font-bold' : 'text-stone-200'}>
                    {currentDrawCalls}
                  </span>
                </div>

                <span className="text-white/20">|</span>
                <div className="text-[11px] text-stone-300">
                  <span className="text-stone-400">Tris:</span>{' '}
                  <span className="text-stone-200">{(currentTriangles / 1000).toFixed(0)}k</span>
                </div>
              </>
            )}

            {/* Recording Button */}
            <button
              onClick={handleToggleRecord}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
              }`}
              title="Toggle recording (Hotkey: F8 or Shift+P)"
            >
              {isRecording ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              {isRecording ? `STOP (${frameCount})` : 'REC'}
            </button>

            {/* View Report Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded border border-white/10 transition-colors cursor-pointer"
              title="Open Detailed Diagnostic Report"
            >
              <FileText className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">Report</span>
            </button>

            {/* Recruiter / Quick Portfolio View Button */}
            <button
              onClick={() => setStationModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
              title="Open Full Portfolio, Resume & Projects (Recruiter View)"
            >
              <span>📄 Portfolio</span>
            </button>

            {/* 60 FPS Performance Mode Toggle */}
            <button
              onClick={togglePerformanceMode}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                performanceMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-white/10'
              }`}
              title="Toggle 60 FPS Performance Mode (bypasses full-screen bloom & heavy shadow pass for max FPS)"
            >
              <Zap className={`w-3 h-3 ${performanceMode ? 'fill-stone-950 text-stone-950' : 'text-amber-400'}`} />
              <span>{performanceMode ? '60 FPS: ON' : '60 FPS'}</span>
            </button>

            {/* Day / Night Environment Toggle Button */}
            <button
              onClick={() => {
                const nextAtmosphere = currentAtmosphere === 'Sunny Day' ? 'Cosmic Nebula' : 'Sunny Day';
                setAtmosphere(nextAtmosphere);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer border ${
                currentAtmosphere === 'Sunny Day'
                  ? 'bg-amber-400/90 hover:bg-amber-300 text-stone-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : 'bg-stone-800 hover:bg-stone-700 text-cyan-300 border-cyan-500/40'
              }`}
              title={`Switch Environment (Current: ${currentAtmosphere})`}
            >
              {currentAtmosphere === 'Sunny Day' ? (
                <Sun className="w-3.5 h-3.5 text-stone-950 fill-current" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-300 fill-current" />
              )}
              <span>{currentAtmosphere === 'Sunny Day' ? '☀️ Day' : '🌙 Night'}</span>
            </button>
          </div>

          {/* Active Recording Status Banner */}
          {isRecording && (
            <div className="px-3 py-1 bg-rose-950/90 border border-rose-500/40 rounded text-[11px] text-rose-200 flex items-center gap-2 shadow-lg animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>
                Recording frame by frame... <strong className="text-white">{frameCount}</strong> frames |{' '}
                <strong className={spikeCount > 0 ? 'text-amber-300' : 'text-emerald-400'}>
                  {spikeCount}
                </strong>{' '}
                spikes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Full Diagnostic Modal */}
      <PerformanceProfilerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordAgain={() => {
          frameProfiler.startRecording();
        }}
      />
    </>
  );
};
