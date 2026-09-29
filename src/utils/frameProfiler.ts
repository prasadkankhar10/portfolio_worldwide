/**
 * Frame Performance & Lag Profiler
 * Captures per-frame metrics (FPS, delta time, draw calls, triangles, memory, camera position)
 * and automatically analyzes the root cause of lag spikes.
 */

export interface FrameRecord {
  id: number;
  timeSec: number;
  deltaMs: number;
  fps: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  geometries: number;
  textures: number;
  camPosition: [number, number, number];
  camDirection: string;
  isLagSpike: boolean;
  lagSeverity: 'none' | 'minor' | 'spike' | 'freeze';
  lagReason?: string;
  heapMemoryMb?: number;
  atmosphere?: string;
}

export interface ProfilerSummary {
  totalFrames: number;
  durationSec: number;
  avgFps: number;
  minFps: number;
  maxDeltaMs: number;
  onePercentLowFps: number;
  avgDrawCalls: number;
  maxDrawCalls: number;
  avgTriangles: number;
  maxTriangles: number;
  totalSpikes: number;
  severeFreezes: number;
  worstFrames: FrameRecord[];
}

type Subscriber = (state: {
  isRecording: boolean;
  frameCount: number;
  currentFps: number;
  currentDeltaMs: number;
  currentDrawCalls: number;
  currentTriangles: number;
  spikeCount: number;
}) => void;

class FrameProfilerService {
  private recording: boolean = false;
  private records: FrameRecord[] = [];
  private startTime: number = 0;
  private frameCounter: number = 0;
  private prevTextures: number = 0;
  private prevGeometries: number = 0;
  private subscribers: Set<Subscriber> = new Set();

  // Current live values for instant HUD display
  public currentFps: number = 60;
  public currentDeltaMs: number = 16.6;
  public currentDrawCalls: number = 0;
  public currentTriangles: number = 0;
  public spikeCount: number = 0;

  public subscribe(callback: Subscriber) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    const state = {
      isRecording: this.recording,
      frameCount: this.records.length,
      currentFps: this.currentFps,
      currentDeltaMs: this.currentDeltaMs,
      currentDrawCalls: this.currentDrawCalls,
      currentTriangles: this.currentTriangles,
      spikeCount: this.spikeCount,
    };
    this.subscribers.forEach((cb) => cb(state));
  }

  public isRecording(): boolean {
    return this.recording;
  }

  public startRecording() {
    this.records = [];
    this.frameCounter = 0;
    this.spikeCount = 0;
    this.startTime = performance.now();
    this.recording = true;
    this.notify();
  }

  public stopRecording() {
    this.recording = false;
    this.notify();
  }

  public clear() {
    this.records = [];
    this.frameCounter = 0;
    this.spikeCount = 0;
    this.notify();
  }

  public getRecords(): FrameRecord[] {
    return this.records;
  }

  /**
   * Called on every animation frame by Three.js useFrame
   */
  public recordFrame(
    delta: number,
    glInfo: {
      render: { calls: number; triangles: number; points: number; lines: number };
      memory: { geometries: number; textures: number };
    },
    camPos: [number, number, number],
    camDir: string,
    atmosphere: string
  ) {
    const deltaMs = Math.max(0.1, delta * 1000);
    const fps = Math.min(240, Math.round(1000 / deltaMs));
    this.currentFps = fps;
    this.currentDeltaMs = Number(deltaMs.toFixed(1));
    this.currentDrawCalls = glInfo.render.calls;
    this.currentTriangles = glInfo.render.triangles;

    if (!this.recording) {
      // Still notify throttled (once every 10 frames) to update HUD when not recording
      if (this.frameCounter++ % 10 === 0) {
        this.notify();
      }
      return;
    }

    const timeSec = Number(((performance.now() - this.startTime) / 1000).toFixed(2));
    this.frameCounter++;

    let isLagSpike = false;
    let lagSeverity: 'none' | 'minor' | 'spike' | 'freeze' = 'none';
    let lagReason: string | undefined = undefined;

    // Diagnose lag severity
    if (deltaMs > 66.6) {
      // < 15 FPS
      isLagSpike = true;
      lagSeverity = 'freeze';
      this.spikeCount++;
    } else if (deltaMs > 33.3) {
      // < 30 FPS
      isLagSpike = true;
      lagSeverity = 'spike';
      this.spikeCount++;
    } else if (deltaMs > 22.2) {
      // < 45 FPS
      lagSeverity = 'minor';
    }

    // Identify root cause if this frame spiked
    if (isLagSpike) {
      const reasons: string[] = [];

      // Check if new assets or textures were allocated in this frame
      const textDiff = glInfo.memory.textures - this.prevTextures;
      const geomDiff = glInfo.memory.geometries - this.prevGeometries;
      if (textDiff > 0 || geomDiff > 0) {
        reasons.push(`Asset Allocation (${textDiff > 0 ? `+${textDiff} textures ` : ''}${geomDiff > 0 ? `+${geomDiff} geoms` : ''})`);
      }

      // Check draw call volume
      if (glInfo.render.calls > 300) {
        reasons.push(`Extreme Draw Calls (${glInfo.render.calls} calls, CPU dispatch overload)`);
      } else if (glInfo.render.calls > 180) {
        reasons.push(`High Draw Calls (${glInfo.render.calls} calls)`);
      }

      // Check geometry/polygon density
      if (glInfo.render.triangles > 600000) {
        reasons.push(`Heavy Poly Density (${(glInfo.render.triangles / 1000).toFixed(0)}k tris)`);
      }

      // Memory GC stall heuristic: long frame time without high draw calls/polys
      if (reasons.length === 0 && deltaMs > 50) {
        reasons.push('Main Thread Stall (Garbage Collection, Raycasting, or Physics Hitch)');
      } else if (reasons.length === 0) {
        reasons.push('CPU Frame Scheduling Hiccup');
      }

      lagReason = reasons.join(' & ');
    }

    this.prevTextures = glInfo.memory.textures;
    this.prevGeometries = glInfo.memory.geometries;

    let heapMemoryMb: number | undefined = undefined;
    if (typeof performance !== 'undefined' && (performance as any).memory?.usedJSHeapSize) {
      heapMemoryMb = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
    }

    const frame: FrameRecord = {
      id: this.frameCounter,
      timeSec,
      deltaMs: Number(deltaMs.toFixed(1)),
      fps,
      drawCalls: glInfo.render.calls,
      triangles: glInfo.render.triangles,
      points: glInfo.render.points,
      lines: glInfo.render.lines,
      geometries: glInfo.memory.geometries,
      textures: glInfo.memory.textures,
      camPosition: [
        Number(camPos[0].toFixed(1)),
        Number(camPos[1].toFixed(1)),
        Number(camPos[2].toFixed(1)),
      ],
      camDirection: camDir,
      isLagSpike,
      lagSeverity,
      lagReason,
      heapMemoryMb,
      atmosphere,
    };

    // Buffer up to 15,000 frames (~4 minutes at 60 FPS)
    if (this.records.length < 15000) {
      this.records.push(frame);
    }

    // Notify UI every 6 frames (~100ms) for smooth responsive HUD during recording
    if (this.frameCounter % 6 === 0) {
      this.notify();
    }
  }

  /**
   * Generates a comprehensive summary with statistics and worst hitch analysis
   */
  public getSummary(): ProfilerSummary {
    const totalFrames = this.records.length;
    if (totalFrames === 0) {
      return {
        totalFrames: 0,
        durationSec: 0,
        avgFps: 0,
        minFps: 0,
        maxDeltaMs: 0,
        onePercentLowFps: 0,
        avgDrawCalls: 0,
        maxDrawCalls: 0,
        avgTriangles: 0,
        maxTriangles: 0,
        totalSpikes: 0,
        severeFreezes: 0,
        worstFrames: [],
      };
    }

    let sumFps = 0;
    let minFps = Infinity;
    let maxDeltaMs = 0;
    let sumDrawCalls = 0;
    let maxDrawCalls = 0;
    let sumTriangles = 0;
    let maxTriangles = 0;
    let totalSpikes = 0;
    let severeFreezes = 0;

    const deltas: number[] = [];

    for (const f of this.records) {
      sumFps += f.fps;
      if (f.fps < minFps) minFps = f.fps;
      if (f.deltaMs > maxDeltaMs) maxDeltaMs = f.deltaMs;
      sumDrawCalls += f.drawCalls;
      if (f.drawCalls > maxDrawCalls) maxDrawCalls = f.drawCalls;
      sumTriangles += f.triangles;
      if (f.triangles > maxTriangles) maxTriangles = f.triangles;
      if (f.isLagSpike) totalSpikes++;
      if (f.lagSeverity === 'freeze') severeFreezes++;
      deltas.push(f.deltaMs);
    }

    // Calculate 1% low FPS (99th percentile highest frame times)
    deltas.sort((a, b) => a - b);
    const onePercentIdx = Math.floor(deltas.length * 0.99);
    const onePercentWorstDelta = deltas[Math.min(onePercentIdx, deltas.length - 1)] || 16.6;
    const onePercentLowFps = Math.max(1, Math.round(1000 / onePercentWorstDelta));

    // Get the top 15 worst lagging frames sorted by longest deltaMs
    const worstFrames = [...this.records]
      .filter((f) => f.deltaMs > 25)
      .sort((a, b) => b.deltaMs - a.deltaMs)
      .slice(0, 15);

    const durationSec = this.records[this.records.length - 1].timeSec;

    return {
      totalFrames,
      durationSec,
      avgFps: Math.round(sumFps / totalFrames),
      minFps: minFps === Infinity ? 0 : minFps,
      maxDeltaMs: Number(maxDeltaMs.toFixed(1)),
      onePercentLowFps,
      avgDrawCalls: Math.round(sumDrawCalls / totalFrames),
      maxDrawCalls,
      avgTriangles: Math.round(sumTriangles / totalFrames),
      maxTriangles,
      totalSpikes,
      severeFreezes,
      worstFrames,
    };
  }

  /**
   * Export all recorded frames as a formatted JSON file
   */
  public exportJSON() {
    const summary = this.getSummary();
    const payload = {
      exportDate: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      summary,
      frames: this.records,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fps_trace_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export all recorded frames as CSV for spreadsheet graphing
   */
  public exportCSV() {
    if (this.records.length === 0) return;

    const headers = [
      'Frame',
      'TimeSec',
      'FPS',
      'DeltaMs',
      'DrawCalls',
      'Triangles',
      'Geometries',
      'Textures',
      'CamX',
      'CamY',
      'CamZ',
      'CamDir',
      'IsSpike',
      'Severity',
      'LagReason',
      'HeapMemoryMb',
      'Atmosphere',
    ];

    const rows = this.records.map((r) => [
      r.id,
      r.timeSec,
      r.fps,
      r.deltaMs,
      r.drawCalls,
      r.triangles,
      r.geometries,
      r.textures,
      r.camPosition[0],
      r.camPosition[1],
      r.camPosition[2],
      `"${r.camDirection}"`,
      r.isLagSpike ? 1 : 0,
      r.lagSeverity,
      `"${(r.lagReason || '').replace(/"/g, '""')}"`,
      r.heapMemoryMb ?? '',
      `"${r.atmosphere || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fps_trace_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const frameProfiler = new FrameProfilerService();
