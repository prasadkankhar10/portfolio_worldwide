import React, { useState } from 'react';
import { frameProfiler, type ProfilerSummary } from '../../utils/frameProfiler';
import { Download, Copy, Check, AlertTriangle, Activity, X, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRecordAgain: () => void;
}

export const PerformanceProfilerModal: React.FC<Props> = ({ isOpen, onClose, onRecordAgain }) => {
  const [copied, setCopied] = useState(false);
  const summary: ProfilerSummary = frameProfiler.getSummary();

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const text = `=== 3D GAME FRAME PERFORMANCE REPORT ===
Total Recorded Frames: ${summary.totalFrames} (${summary.durationSec.toFixed(1)}s)
Average FPS: ${summary.avgFps} FPS
Minimum FPS: ${summary.minFps} FPS
1% Low FPS: ${summary.onePercentLowFps} FPS
Max Frame Time: ${summary.maxDeltaMs} ms
Average Draw Calls: ${summary.avgDrawCalls} (Peak: ${summary.maxDrawCalls})
Average Triangles: ${summary.avgTriangles.toLocaleString()} (Peak: ${summary.maxTriangles.toLocaleString()})
Total Lag Spikes (<30 FPS): ${summary.totalSpikes}
Severe Freezes (<15 FPS): ${summary.severeFreezes}

--- TOP WORST HITCHES / SPIKES ---
${summary.worstFrames
  .map(
    (f, idx) =>
      `#${idx + 1} Frame ${f.id} @ ${f.timeSec}s: ${f.fps} FPS (${f.deltaMs}ms) | Pos: [${f.camPosition.join(', ')}] Dir: ${f.camDirection} | DrawCalls: ${f.drawCalls} | Tris: ${f.triangles} | Cause: ${f.lagReason || 'CPU hitch'}`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-emerald-400';
    if (fps >= 30) return 'text-amber-400';
    return 'text-rose-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-950/95 border border-amber-500/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.2)] text-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-white uppercase font-mono">
                Frame Performance & Lag Diagnostic
              </h2>
              <p className="text-xs text-stone-400">
                Recorded {summary.totalFrames} frames ({summary.durationSec}s timeline)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {summary.totalFrames === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-3">
              <p className="text-base">No frames recorded yet.</p>
              <p className="text-sm">Click "Start Recording", play or move around the island, then stop to view the frame-by-frame breakdown.</p>
            </div>
          ) : (
            <>
              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-stone-900/90 border border-white/10 p-3.5 rounded-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Average FPS</span>
                  <div className={`text-2xl font-black font-mono mt-1 ${getFpsColor(summary.avgFps)}`}>
                    {summary.avgFps} <span className="text-xs text-stone-500">FPS</span>
                  </div>
                  <span className="text-[11px] text-stone-500">Target: 60 FPS</span>
                </div>

                <div className="bg-stone-900/90 border border-white/10 p-3.5 rounded-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400">1% Low FPS</span>
                  <div className={`text-2xl font-black font-mono mt-1 ${getFpsColor(summary.onePercentLowFps)}`}>
                    {summary.onePercentLowFps} <span className="text-xs text-stone-500">FPS</span>
                  </div>
                  <span className="text-[11px] text-stone-500">Measures stutter</span>
                </div>

                <div className="bg-stone-900/90 border border-white/10 p-3.5 rounded-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Lag Spikes (&lt;30 FPS)</span>
                  <div className={`text-2xl font-black font-mono mt-1 ${summary.totalSpikes > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {summary.totalSpikes} <span className="text-xs text-stone-500">frames</span>
                  </div>
                  <span className="text-[11px] text-stone-500">{summary.severeFreezes} severe (&lt;15 FPS)</span>
                </div>

                <div className="bg-stone-900/90 border border-white/10 p-3.5 rounded-lg">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400">Max Frame Time</span>
                  <div className={`text-2xl font-black font-mono mt-1 ${summary.maxDeltaMs > 33.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {summary.maxDeltaMs} <span className="text-xs text-stone-500">ms</span>
                  </div>
                  <span className="text-[11px] text-stone-500">Min: {summary.minFps} FPS</span>
                </div>
              </div>

              {/* Draw Calls & Geometry Stats */}
              <div className="grid grid-cols-2 gap-3 bg-stone-900/40 border border-white/10 p-3 rounded-lg text-xs font-mono text-stone-300">
                <div className="flex justify-between items-center px-2">
                  <span>Draw Calls (GPU Dispatches):</span>
                  <span className="font-bold text-white">
                    Avg: {summary.avgDrawCalls} | Peak: <span className={summary.maxDrawCalls > 250 ? 'text-amber-400' : 'text-emerald-400'}>{summary.maxDrawCalls}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span>Polygon Triangles:</span>
                  <span className="font-bold text-white">
                    Avg: {summary.avgTriangles.toLocaleString()} | Peak: {summary.maxTriangles.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Worst Lag Spikes Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Worst Frame Hitches & Diagnosed Causes ({summary.worstFrames.length})
                  </h3>
                  <span className="text-xs text-stone-400">Sorted by longest frame delay</span>
                </div>

                {summary.worstFrames.length === 0 ? (
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm text-center">
                    ✨ Perfect performance! No frame hitches exceeded 25ms during this session.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-white/10 rounded-lg bg-stone-900/60 max-h-72">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-stone-950 text-stone-400 border-b border-white/10 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Frame</th>
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">FPS</th>
                          <th className="py-2.5 px-3">Delay</th>
                          <th className="py-2.5 px-3">Camera [X, Y, Z]</th>
                          <th className="py-2.5 px-3">Draw Calls</th>
                          <th className="py-2.5 px-3">Triangles</th>
                          <th className="py-2.5 px-3">Diagnosed Cause</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {summary.worstFrames.map((f) => (
                          <tr key={f.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-2 px-3 text-stone-400">#{f.id}</td>
                            <td className="py-2 px-3">{f.timeSec}s</td>
                            <td className={`py-2 px-3 font-bold ${getFpsColor(f.fps)}`}>
                              {f.fps}
                            </td>
                            <td className="py-2 px-3 text-amber-300 font-bold">{f.deltaMs} ms</td>
                            <td className="py-2 px-3 text-stone-300">
                              [{f.camPosition.join(', ')}] ({f.camDirection})
                            </td>
                            <td className="py-2 px-3 text-stone-300">{f.drawCalls}</td>
                            <td className="py-2 px-3 text-stone-300">{(f.triangles / 1000).toFixed(0)}k</td>
                            <td className="py-2 px-3 text-rose-300">
                              {f.lagReason || 'CPU Scripting Hitch'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-stone-950">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRecordAgain();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Record Again
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              disabled={summary.totalFrames === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase rounded-lg border border-white/10 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>

            <button
              onClick={() => frameProfiler.exportCSV()}
              disabled={summary.totalFrames === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold uppercase rounded-lg border border-amber-500/30 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <button
              onClick={() => frameProfiler.exportJSON()}
              disabled={summary.totalFrames === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON Trace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
