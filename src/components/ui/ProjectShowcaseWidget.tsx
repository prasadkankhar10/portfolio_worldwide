import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StationTheme } from '../../data/stationThemes';
import { 
  Sparkles, Play, RotateCcw, Volume2, ShieldCheck, Zap, 
  Terminal, Smartphone, Compass, CheckCircle2, AlertTriangle, 
  Search, Sliders, Moon, Sun, Layers, Globe, Eye, BookOpen, 
  Wifi, WifiOff, Award, ChevronRight, Hash, ArrowRight,
  Maximize2, Activity, Clock, Heart, ShoppingBag, UserCheck,
  Send, RefreshCw, BarChart2, CornerDownRight, Check
} from 'lucide-react';

interface ProjectShowcaseWidgetProps {
  stationId: string;
  projectId?: string;
  theme: StationTheme;
  onTeleport?: (stationId: string) => void;
}

// ============================================================================
// SAFE BROWSER WEB AUDIO SYNTHESIZER
// ============================================================================
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

const playWebAudioTone = (
  type: 'sine' | 'square' | 'triangle' | 'noise' | 'chime' | 'fanfare',
  freq = 440,
  duration = 0.2
) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (type === 'noise') {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + duration);
      return;
    }

    if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.1, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type === 'chime' ? 'sine' : type;
    osc.frequency.setValueAtTime(freq, now);

    if (type === 'chime') {
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.6, duration));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + Math.max(0.6, duration));
    } else {
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    }
  } catch {
    // Graceful fallback for strict autoplay rules
  }
};

// ============================================================================
// PROJ-01: REALM OF PRASAD 3D ISLAND
// ============================================================================
const Proj01IslandShowcase: React.FC<{ theme: StationTheme; onTeleport?: (id: string) => void }> = ({ theme, onTeleport }) => {
  const [selectedRealm, setSelectedRealm] = useState('Harbor Docks');
  const [dialogueCategory, setDialogueCategory] = useState<'graphics' | 'physics' | 'systems'>('graphics');
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  const realms = [
    { name: 'Harbor Docks', coords: { x: 107.0, y: 4.0, z: 122.5 }, stationId: 'TRIGGER_Harbor_Welcome', tag: 'Arrival & Maritime Gates' },
    { name: 'Stonehenge Altar', coords: { x: 30.0, y: 4.0, z: 54.8 }, stationId: 'TRIGGER_Stonehenge_Puzzle', tag: 'Ancient Algorithmic Megaliths' },
    { name: 'Sunken Citadel', coords: { x: -15.0, y: 4.0, z: -98.0 }, stationId: 'TRIGGER_Citadel_Contact', tag: 'High Mountain Citadel' },
    { name: 'Moonwell Grove', coords: { x: -48.0, y: 4.0, z: 55.4 }, stationId: 'TRIGGER_Moonwell_Skills', tag: 'Bioluminescent Skill Pool' },
  ];

  const dialogues = {
    graphics: [
      {
        q: 'How did you achieve locked 60 FPS with 10,000+ foliage instances?',
        a: 'Engineered GPU instancing via THREE.InstancedMesh collapsing 10,000 foliage objects into a single WebGL draw call, combined with Google Draco compression shrinking 45MB geometry down to 4.2MB.',
        metric: '10,000 to 1 Draw Call'
      },
      {
        q: 'How are ocean waves and water reflections simulated?',
        a: 'Gerstner wave vertex shaders with analytical normals and planar screen-space Fresnel reflectance blending.',
        metric: 'Analytical Gerstner GPU Shaders'
      }
    ],
    physics: [
      {
        q: 'How does the character movement prevent physics clipping?',
        a: 'Integrated Rapier 3D physics engine via WebAssembly using a kinematic character controller with raycast ground-snapping and stair-stepping slope resolution.',
        metric: 'Rapier 3D WASM Kinematics'
      },
      {
        q: 'How does third-person camera occlusion work?',
        a: 'Kinematic spring-damped camera with dynamic spring stiffness and spherical raycast collision preventing the camera from clipping inside castle walls.',
        metric: 'Spring-Damped Spherical Raycast'
      }
    ],
    systems: [
      {
        q: 'What powers the interactive station trigger architecture?',
        a: 'A centralized Zustand store as the Single Source of Truth (SSOT), calculating Euclidean player distances on the WebGL frame loop and dispatching HUD prompt overlays.',
        metric: 'Zustand SSOT Frame Dispatcher'
      },
      {
        q: 'How do you handle audio ambience across different island biomes?',
        a: 'Positional Web Audio nodes that dynamically crossfade ocean shore foam, village market crowds, and high mountain wind based on player 3D coordinates.',
        metric: '3D Positional Biome Crossfade'
      }
    ]
  };

  const activeDialogues = dialogues[dialogueCategory];
  const activeItem = activeDialogues[currentPromptIdx] || activeDialogues[0];

  return (
    <div className="space-y-4">
      {/* Interactive Celestial Viewfinder Bar */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 animate-spin-slow" style={{ color: theme.accentHex }} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-200">
              Interactive Celestial Viewfinder & 3D Teleport Navigator
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            60 FPS Locked • 27 NPCs • Rapier 3D
          </span>
        </div>

        {/* 4 Realm Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {realms.map((r) => {
            const isSelected = selectedRealm === r.name;
            return (
              <button
                key={r.name}
                onClick={() => {
                  setSelectedRealm(r.name);
                  playWebAudioTone('chime', 523, 0.3);
                }}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold text-stone-100 truncate">{r.name}</div>
                <div className="text-[10px] font-mono text-stone-400 truncate mt-0.5">
                  X:{r.coords.x} Z:{r.coords.z}
                </div>
                <div className="text-[10px] text-amber-300/90 truncate mt-1">{r.tag}</div>
              </button>
            );
          })}
        </div>

        {/* Teleport Action Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
          <span className="text-stone-400">
            Selected Target: <strong className="text-amber-300">{selectedRealm}</strong>
          </span>
          <button
            onClick={() => {
              const target = realms.find((r) => r.name === selectedRealm);
              if (target && onTeleport) {
                playWebAudioTone('fanfare');
                onTeleport(target.stationId);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <span>Teleport Character In 3D World</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Dialogue Tree State Machine */}
      <div className="p-4 rounded-xl border bg-black/30" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Architectural Dialogue Simulator</span>
          </div>
          <span className="text-[10px] font-mono text-stone-400">Click topics to inspect engineering choices</span>
        </div>

        {/* Category switcher */}
        <div className="flex gap-2 mb-3">
          {[
            { id: 'graphics', label: '1. Graphics & Shaders' },
            { id: 'physics', label: '2. Physics & Kinematics' },
            { id: 'systems', label: '3. State & Audio' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setDialogueCategory(cat.id as typeof dialogueCategory);
                setCurrentPromptIdx(0);
                playWebAudioTone('sine', 600, 0.1);
              }}
              className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition-all cursor-pointer ${
                dialogueCategory === cat.id 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' 
                  : 'bg-stone-900 border-white/10 text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dialogue Card */}
        <div className="p-3 bg-stone-950/90 rounded-lg border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span>Q: "{activeItem.q}"</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              {activeItem.metric}
            </span>
          </div>
          <div className="text-xs text-stone-300 leading-relaxed font-mono pl-3 border-l-2 border-amber-400/50">
            Prasad's Architecture: {activeItem.a}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => {
                setCurrentPromptIdx((idx) => (idx + 1) % activeDialogues.length);
                playWebAudioTone('sine', 700, 0.1);
              }}
              className="text-[11px] font-mono text-stone-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Next Inquiry</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-02: WEBAR 3D ISLAND TABLETOP
// ============================================================================
const Proj02ARShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [scale, setScale] = useState(0.015);
  const [activeTier, setActiveTier] = useState<'8thwall' | 'webxr' | 'arjs' | 'desktop'>('8thwall');
  const [isHitTesting, setIsHitTesting] = useState(false);
  const [hitDetected, setHitDetected] = useState(true);

  const handleSimulateHitTest = () => {
    setIsHitTesting(true);
    setHitDetected(false);
    playWebAudioTone('sine', 380, 0.15);
    setTimeout(() => {
      setIsHitTesting(false);
      setHitDetected(true);
      playWebAudioTone('chime', 750, 0.3);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* PhysicsScaler Visualizer */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" /> PhysicsScaler Dynamic Tabletop Normalizer
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
            Scale: {scale.toFixed(3)}x
          </span>
        </div>
        <p className="text-xs text-stone-300 mb-3">
          Dynamically normalizes Rapier 3D raycast constants so that a 200m island renders anchored on a 30cm tabletop without jitter.
        </p>

        {/* Dynamic Scale Slider */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-mono text-stone-400">Mini (0.005x)</span>
          <input
            type="range"
            min={0.005}
            max={0.08}
            step={0.005}
            value={scale}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setScale(val);
              playWebAudioTone('sine', 350 + val * 4000, 0.04);
            }}
            className="flex-1 accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-stone-400">Desk (0.080x)</span>
        </div>

        {/* Real-time Math Diagnostics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-cyan-200">
          <div className="p-2 rounded bg-stone-950/80 border border-cyan-500/20">
            <div className="text-[10px] text-stone-400">Physical Bounding Box</div>
            <div className="font-bold text-cyan-300">{(scale * 200).toFixed(1)} cm</div>
          </div>
          <div className="p-2 rounded bg-stone-950/80 border border-cyan-500/20">
            <div className="text-[10px] text-stone-400">Raycast Offset (ΔY)</div>
            <div className="font-bold text-cyan-300">{(0.45 * scale).toFixed(4)} m</div>
          </div>
          <div className="p-2 rounded bg-stone-950/80 border border-cyan-500/20">
            <div className="text-[10px] text-stone-400">Gravity Constant</div>
            <div className="font-bold text-cyan-300">{(9.81 * scale * 10).toFixed(2)} m/s²</div>
          </div>
          <div className="p-2 rounded bg-stone-950/80 border border-cyan-500/20 flex flex-col justify-between">
            <div className="text-[10px] text-stone-400">SLAM Plane Lock</div>
            <div className={`font-bold ${hitDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {hitDetected ? 'LOCKED (6-DOF)' : 'SCANNING...'}
            </div>
          </div>
        </div>

        {/* Trigger Surface Hit-Test */}
        <div className="mt-3 pt-3 border-t border-cyan-500/20 flex justify-between items-center">
          <span className="text-xs text-stone-400">Test Plane Acquisition:</span>
          <button
            onClick={handleSimulateHitTest}
            disabled={isHitTesting}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-stone-950 text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isHitTesting ? 'animate-spin' : ''}`} />
            <span>{isHitTesting ? 'Detecting Tabletop Plane...' : 'Run SLAM Surface Raycast'}</span>
          </button>
        </div>
      </div>

      {/* 4-Tier Spatial Fallback Architecture Tabs */}
      <div className="p-4 rounded-xl border bg-black/30" style={{ borderColor: theme.cardBorder }}>
        <div className="text-xs font-mono uppercase font-bold text-stone-300 mb-2">
          4-Tier Cross-Device Fallback Architecture
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { id: '8thwall', title: 'Tier 1: 8th Wall SLAM', sub: '6-DOF Surface SLAM' },
            { id: 'webxr', title: 'Tier 2: WebXR API', sub: 'Chrome / Quest Hit-Test' },
            { id: 'arjs', title: 'Tier 3: AR.js Hiro', sub: 'Optical Marker Fallback' },
            { id: 'desktop', title: 'Tier 4: Desktop 3D', sub: 'Orbit Controls + QR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTier(tab.id as typeof activeTier);
                playWebAudioTone('sine', 550, 0.08);
              }}
              className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeTier === tab.id ? 'border-cyan-400 bg-cyan-500/20 text-stone-100 font-bold shadow' : 'border-white/10 bg-white/5 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="truncate">{tab.title}</div>
              <div className="text-[10px] text-stone-400 truncate">{tab.sub}</div>
            </button>
          ))}
        </div>
        <div className="p-3 bg-stone-950/90 rounded-lg border border-white/10 text-xs text-stone-300 leading-relaxed font-mono">
          {activeTier === '8thwall' && 'Tier 1 (Primary): Runs zero-app 6-DOF SLAM inside mobile Safari & Chrome using camera feed surface tracking, locking the 3D island to any desk or floor.'}
          {activeTier === 'webxr' && 'Tier 2: Direct hardware floor hit-testing via native WebXR Device API on Android Chrome and Meta Quest headset browsers.'}
          {activeTier === 'arjs' && 'Tier 3: Optical Hiro marker fallback for legacy browsers without WebXR support, identifying printed marker anchors via OpenCV in JS.'}
          {activeTier === 'desktop' && 'Tier 4: Desktop fallback rendering interactive orbit controls with a mobile QR code allowing instant beam to smartphone.'}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-03: ONE MORE MOVE (C++17 & SDL3 BARE-METAL ROGUELIKE)
// ============================================================================
const Proj03RoguelikeShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [crtGlow, setCrtGlow] = useState(true);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [boulderPos, setBoulderPos] = useState({ x: 3, y: 3 });
  const [moveCount, setMoveCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState('Dungeon ready. Push boulder [O] or reach exit [>]. Use WASD or D-pad!');
  const [bfsPath, setBfsPath] = useState<Array<{ x: number; y: number }>>([]);
  const [isSolving, setIsSolving] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // 8x8 Grid Map: 0 = floor, 1 = wall, 2 = exit
  const grid = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const handleMove = useCallback((dx: number, dy: number) => {
    setPlayerPos((curr) => {
      const nx = curr.x + dx;
      const ny = curr.y + dy;

      if (grid[ny][nx] === 1) {
        playWebAudioTone('noise', 100, 0.08);
        setStatusMsg('Blocked by dungeon wall (#)');
        return curr;
      }

      // Check boulder push
      setBoulderPos((bCurr) => {
        if (nx === bCurr.x && ny === bCurr.y) {
          const bx = bCurr.x + dx;
          const by = bCurr.y + dy;
          if (grid[by][bx] === 1) {
            playWebAudioTone('noise', 150, 0.1);
            setStatusMsg('Cannot push boulder into wall!');
            return bCurr;
          }
          playWebAudioTone('square', 240, 0.12);
          setStatusMsg(`Pushed boulder to (${bx}, ${by})`);
          return { x: bx, y: by };
        }
        return bCurr;
      });

      playWebAudioTone('square', 440, 0.08);
      setMoveCount((m) => m + 1);

      if (nx === 6 && ny === 6) {
        playWebAudioTone('fanfare');
        setStatusMsg('🏆 FLOOR CLEARED! Golden Path BFS Solved in 60 FPS!');
      } else {
        setStatusMsg(`Moved to (${nx}, ${ny})`);
      }

      return { x: nx, y: ny };
    });
  }, []);

  // Keyboard controls listener (WASD and Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only capture if terminal or game is actively focused or hovered
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleMove(0, -1);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleMove(0, 1);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleMove(-1, 0);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleMove(1, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Animated BFS Breadcrumb Solver
  const runBfsSolver = () => {
    setIsSolving(true);
    setBfsPath([]);
    const path = [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 },
      { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 },
      { x: 6, y: 5 }, { x: 6, y: 6 }
    ];

    path.forEach((pt, index) => {
      setTimeout(() => {
        setBfsPath((prev) => [...prev, pt]);
        playWebAudioTone('triangle', 500 + index * 40, 0.05);
        if (index === path.length - 1) {
          setIsSolving(false);
          setStatusMsg('✓ BFS Golden Path verified: 100% solvable floor layout.');
        }
      }, index * 120);
    });
  };

  return (
    <div className="space-y-4">
      {/* 8x8 Playable Terminal Grid */}
      <div 
        ref={terminalRef}
        tabIndex={0}
        className={`p-4 rounded-xl border font-mono transition-all outline-none focus:ring-1 focus:ring-emerald-500/50 ${
          crtGlow ? 'bg-stone-950 border-emerald-500/50 shadow-[0_0_30px_rgba(0,255,102,0.15)]' : 'bg-stone-950 border-white/10'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>Bare-Metal C++17 Roguelike (Interactive 8x8 Grid)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runBfsSolver}
              disabled={isSolving}
              className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSolving ? 'Solving...' : 'Run BFS Verifier'}
            </button>
            <button
              onClick={() => setCrtGlow(!crtGlow)}
              className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
            >
              CRT Glow: {crtGlow ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* The Grid Display */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center my-3">
          <div className="p-2.5 bg-black rounded-lg border border-emerald-500/30 select-none shadow-inner">
            {grid.map((row, y) => (
              <div key={y} className="flex leading-none text-base font-bold tracking-widest">
                {row.map((cell, x) => {
                  let char = '.';
                  let color = 'text-stone-700';

                  if (cell === 1) {
                    char = '#';
                    color = 'text-stone-500';
                  } else if (cell === 2) {
                    char = '>';
                    color = 'text-amber-400 animate-pulse';
                  }

                  // BFS Path trail
                  const isBfsNode = bfsPath.some((p) => p.x === x && p.y === y);
                  if (isBfsNode && cell !== 1 && cell !== 2) {
                    char = '·';
                    color = 'text-emerald-300 font-bold';
                  }

                  if (x === boulderPos.x && y === boulderPos.y) {
                    char = 'O';
                    color = 'text-cyan-400 font-bold';
                  }

                  if (x === playerPos.x && y === playerPos.y) {
                    char = '@';
                    color = 'text-emerald-400 font-extrabold animate-pulse';
                  }

                  return (
                    <span key={x} className={`w-5 h-5 flex items-center justify-center ${color}`}>
                      {char}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          {/* D-Pad Controls & Status */}
          <div className="space-y-3 text-center">
            <div className="grid grid-cols-3 gap-1.5 w-32 mx-auto">
              <div />
              <button
                onClick={() => handleMove(0, -1)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                title="Move Up (W / Up Arrow)"
              >
                ▲
              </button>
              <div />
              <button
                onClick={() => handleMove(-1, 0)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                title="Move Left (A / Left Arrow)"
              >
                ◀
              </button>
              <button
                onClick={() => {
                  setPlayerPos({ x: 1, y: 1 });
                  setBoulderPos({ x: 3, y: 3 });
                  setMoveCount(0);
                  setBfsPath([]);
                  setStatusMsg('Reset to starting state.');
                  playWebAudioTone('noise', 120, 0.1);
                }}
                className="p-2 bg-stone-800 hover:bg-stone-700 border border-white/10 text-stone-300 rounded text-[10px] cursor-pointer"
                title="Reset Position"
              >
                <RotateCcw className="w-3 h-3 mx-auto" />
              </button>
              <button
                onClick={() => handleMove(1, 0)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                title="Move Right (D / Right Arrow)"
              >
                ▶
              </button>
              <div />
              <button
                onClick={() => handleMove(0, 1)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded font-bold text-xs cursor-pointer active:scale-95 transition-transform"
                title="Move Down (S / Down Arrow)"
              >
                ▼
              </button>
              <div />
            </div>

            <div className="text-[11px] text-emerald-300 font-mono">
              {statusMsg}
            </div>
            <div className="text-[10px] text-stone-500 font-mono">
              Keyboard: WASD / Arrow Keys active
            </div>
          </div>
        </div>

        {/* Procedural Audio Oscilloscope Synthesizer */}
        <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-stone-400">Zero Audio Files: 100% Math in C++</span>
          <div className="flex gap-2">
            <button
              onClick={() => playWebAudioTone('square', 587, 0.2)}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded text-xs cursor-pointer"
            >
              <Volume2 className="w-3 h-3 inline mr-1" /> Synthesize Jump (Square 587Hz)
            </button>
            <button
              onClick={() => playWebAudioTone('noise', 100, 0.2)}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-xs cursor-pointer"
            >
              <Volume2 className="w-3 h-3 inline mr-1" /> Synthesize Hit (White Noise)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-04: DELIVERY GAME (UNREAL 5.4 CHAOS SUSPENSION)
// ============================================================================
const Proj04DeliveryShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [speed, setSpeed] = useState(65);
  const [stiffness, setStiffness] = useState(70);
  const [friction, setFriction] = useState(85);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [suspensionBounce, setSuspensionBounce] = useState(0);

  const handleAccelerate = () => {
    setIsAccelerating(true);
    setSpeed((s) => Math.min(140, s + 15));
    playWebAudioTone('triangle', 200 + speed * 3, 0.2);
    setTimeout(() => setIsAccelerating(false), 200);
  };

  const handleBrake = () => {
    setIsBraking(true);
    setSpeed((s) => Math.max(0, s - 25));
    playWebAudioTone('noise', 180, 0.25);
    setTimeout(() => setIsBraking(false), 200);
  };

  const handleSpeedBump = () => {
    setSuspensionBounce(12);
    playWebAudioTone('triangle', 140, 0.2);
    setTimeout(() => setSuspensionBounce(-6), 150);
    setTimeout(() => setSuspensionBounce(3), 300);
    setTimeout(() => setSuspensionBounce(0), 450);
  };

  return (
    <div className="space-y-4">
      {/* Diegetic In-Car Smartphone GPS Console */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Diegetic Dashboard GPS Console (UE 5.4 Chaos)
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Adreno GPU: 16.6ms Target
          </span>
        </div>

        {/* Dashboard Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-950 rounded-xl border border-white/10 font-mono mb-3">
          <div className="p-3 bg-black/60 rounded-lg border border-cyan-500/30 text-center">
            <div className="text-[10px] text-stone-400 uppercase">Speedometer</div>
            <div className="text-3xl font-bold text-cyan-300">{speed} <span className="text-xs font-normal">KM/H</span></div>
            <div className="text-[10px] text-cyan-400/80 mt-1">RPM: {Math.floor(2000 + speed * 45)} • Gear 4</div>
          </div>
          <div className="p-3 bg-black/60 rounded-lg border border-amber-500/30 text-center">
            <div className="text-[10px] text-stone-400 uppercase">Active Delivery Waypoint</div>
            <div className="text-sm font-bold text-amber-300 truncate">Delivery Hub 7B</div>
            <div className="text-[10px] text-amber-400/80 mt-1">Distance: 380m • ETA: 14s</div>
          </div>
          <div className="p-3 bg-black/60 rounded-lg border border-emerald-500/30 text-center">
            <div className="text-[10px] text-stone-400 uppercase">Suspension Damping</div>
            <div className="text-sm font-bold text-emerald-300">{(stiffness * 1.4).toFixed(1)} N/m</div>
            <div className="text-[10px] text-emerald-400/80 mt-1">Tire Grip: {(friction * 0.012).toFixed(2)} Mu</div>
          </div>
        </div>

        {/* Driver Pedals & Bump Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="flex gap-2">
            <button
              onClick={handleAccelerate}
              className={`px-3 py-1.5 rounded-lg font-bold font-mono text-xs cursor-pointer transition-all ${
                isAccelerating ? 'bg-cyan-400 text-stone-950 scale-95' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
            >
              Accelerate (Gas Pedal)
            </button>
            <button
              onClick={handleBrake}
              className={`px-3 py-1.5 rounded-lg font-bold font-mono text-xs cursor-pointer transition-all ${
                isBraking ? 'bg-red-500 text-white scale-95' : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
              }`}
            >
              Brake
            </button>
          </div>
          <button
            onClick={handleSpeedBump}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 cursor-pointer"
          >
            Trigger Speed Bump Test
          </button>
        </div>
      </div>

      {/* Chaos Vehicle Suspension Tuning Lab */}
      <div className="p-4 rounded-xl border bg-black/30" style={{ borderColor: theme.cardBorder }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono uppercase font-bold text-stone-300">
            Chaos Vehicle Suspension Physics Simulator
          </span>
          <span 
            className="text-xs font-mono text-cyan-300 transition-transform"
            style={{ transform: `translateY(${suspensionBounce}px)` }}
          >
            Chassis Pitch: {suspensionBounce > 0 ? `+${suspensionBounce}mm` : `${suspensionBounce}mm`}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Suspension Spring Stiffness</span>
              <span className="font-mono text-cyan-400">{stiffness}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={stiffness}
              onChange={(e) => setStiffness(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>Tire Friction Coefficient</span>
              <span className="font-mono text-amber-400">{friction}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={100}
              value={friction}
              onChange={(e) => setFriction(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-05: KNIGHT'S ADVENTURE (GODOT 4 WASM RETRO PLATFORMER)
// ============================================================================
const Proj05KnightShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [knightX, setKnightX] = useState(30);
  const [isJumping, setIsJumping] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [coins, setCoins] = useState(12);
  const [coyoteTimeEnabled, setCoyoteTimeEnabled] = useState(true);
  const [enemyHealth, setEnemyHealth] = useState(100);

  const handleJump = () => {
    if (isJumping) return;
    setIsJumping(true);
    playWebAudioTone('triangle', 480, 0.18);
    setTimeout(() => {
      setIsJumping(false);
    }, 450);
  };

  const handleAttack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    playWebAudioTone('noise', 220, 0.15);
    if (Math.abs(knightX - 180) < 40) {
      setEnemyHealth((h) => Math.max(0, h - 35));
      playWebAudioTone('square', 320, 0.1);
    }
    setTimeout(() => setIsAttacking(false), 250);
  };

  const handleMoveKnight = (dx: number) => {
    setKnightX((x) => Math.max(10, Math.min(220, x + dx)));
    playWebAudioTone('triangle', 300, 0.04);
  };

  return (
    <div className="space-y-4">
      {/* 16-Bit Arcade Canvas Frame */}
      <div className="p-4 rounded-xl border bg-stone-950 border-amber-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
            <Award className="w-4 h-4" /> 16-Bit Super Nintendo Arcade Frame (Godot 4 WASM)
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Cold Boot: &lt; 1.2s WASM
          </span>
        </div>

        {/* Mini 2D Platformer Viewport */}
        <div className="relative h-36 bg-gradient-to-b from-indigo-950 via-purple-950 to-stone-950 rounded-lg overflow-hidden border border-white/10 px-4 pb-3 select-none">
          {/* Ground */}
          <div className="absolute inset-x-0 bottom-0 h-5 bg-amber-950 border-t-2 border-amber-700" />

          {/* Collectible Coin */}
          <button
            onClick={() => {
              setCoins((c) => c + 1);
              playWebAudioTone('chime', 987, 0.2);
            }}
            className="absolute top-8 left-36 w-6 h-6 rounded-full bg-yellow-400 hover:scale-110 active:scale-95 border-2 border-yellow-200 flex items-center justify-center font-bold text-stone-950 text-[10px] shadow-lg animate-bounce cursor-pointer"
            title="Collect Coin"
          >
            ★
          </button>

          {/* Enemy Goblin */}
          {enemyHealth > 0 && (
            <div 
              className="absolute bottom-5 left-[180px] w-7 h-9 bg-red-600 rounded-sm flex items-center justify-center font-bold text-stone-100 text-xs shadow-md"
            >
              👺
            </div>
          )}

          {/* Player Knight */}
          <div 
            className={`absolute bottom-5 w-8 h-10 bg-amber-400 rounded-sm flex items-center justify-center font-bold text-stone-950 text-xs shadow-lg transition-transform duration-150 ${
              isJumping ? '-translate-y-16' : 'translate-y-0'
            }`}
            style={{ left: `${knightX}px` }}
          >
            {isAttacking ? '🗡' : '⚔'}
          </div>
        </div>

        {/* Arcade Controller Actions */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleMoveKnight(-20)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-bold text-xs cursor-pointer"
            >
              ◀ Left
            </button>
            <button
              onClick={() => handleMoveKnight(20)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-bold text-xs cursor-pointer"
            >
              Right ▶
            </button>
            <button
              onClick={handleJump}
              disabled={isJumping}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded text-xs cursor-pointer disabled:opacity-50"
            >
              Jump (Space)
            </button>
            <button
              onClick={handleAttack}
              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded text-xs cursor-pointer"
            >
              Slash Attack
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-amber-300 font-bold">Coins: x{coins}</span>
            <span className="text-stone-400">
              Goblin HP: <strong className={enemyHealth > 0 ? 'text-red-400' : 'text-stone-500'}>{enemyHealth}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-06: BUTLER OS (MULTI-AGENT DESKTOP PLATFORM)
// ============================================================================
const Proj06ButlerShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [selectedAgent, setSelectedAgent] = useState('supervisor');
  const [taskQuery, setTaskQuery] = useState('Inspect latest arXiv AI papers and summarize');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([
    'Supervisor Broker: Initialized with WebSocket heartbeat.',
    'SQLite Vector Memory: 768-dim index loaded.'
  ]);

  const agents = [
    { id: 'supervisor', name: 'Supervisor Broker', role: 'Intent parsing, task decomposition, agent delegation', status: 'Online (Leader)' },
    { id: 'terminal', name: 'Terminal Coder', role: 'Sandboxed Python/Bash execution with stdout pipe', status: 'Idle (Ready)' },
    { id: 'browser', name: 'Browser Agent', role: 'Playwright DOM interaction & research scraping', status: 'Idle (Ready)' },
    { id: 'memory', name: 'Memory Graph', role: '768-dim SQLite BLOB vector embeddings & recall', status: 'Indexed (WAL)' },
  ];

  const handleDispatch = () => {
    setIsDispatching(true);
    setDispatchLogs((l) => [`Dispatching intent: "${taskQuery}"`, ...l]);
    playWebAudioTone('triangle', 450, 0.1);

    setTimeout(() => {
      setDispatchLogs((l) => ['Supervisor: Intent classified as [Research + Summarize]', ...l]);
      setSelectedAgent('browser');
      playWebAudioTone('sine', 580, 0.1);
    }, 400);

    setTimeout(() => {
      setDispatchLogs((l) => ['Browser Agent: Scraping arXiv search endpoint via Playwright...', ...l]);
      setSelectedAgent('terminal');
      playWebAudioTone('sine', 680, 0.1);
    }, 800);

    setTimeout(() => {
      setDispatchLogs((l) => ['Terminal Coder: Executing summarizer Python script with Ollama...', ...l]);
      setSelectedAgent('memory');
      playWebAudioTone('sine', 780, 0.1);
    }, 1200);

    setTimeout(() => {
      setDispatchLogs((l) => ['Memory Graph: Stored 768-dim summary vector in SQLite database (14.2ms).', '✓ Task completed in 184ms total voice turnaround!', ...l]);
      setSelectedAgent('supervisor');
      setIsDispatching(false);
      playWebAudioTone('fanfare');
    }, 1600);
  };

  return (
    <div className="space-y-4">
      {/* Multi-Agent Broker Topology Graph */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> Live Multi-Agent Broker Topology Graph
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Voice Turnaround: 184ms
          </span>
        </div>

        {/* 4 Agent Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {agents.map((a) => {
            const isSelected = selectedAgent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAgent(a.id);
                  playWebAudioTone('sine', 550, 0.08);
                }}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-amber-400 bg-amber-500/20 text-stone-100 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]' 
                    : 'border-white/10 bg-white/5 text-stone-400 hover:text-stone-200'
                }`}
              >
                <div className="truncate">{a.name}</div>
                <div className="text-[10px] text-amber-400/90 truncate mt-0.5">{a.status}</div>
              </button>
            );
          })}
        </div>

        {/* Task Dispatcher Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={taskQuery}
            onChange={(e) => setTaskQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-200"
            placeholder="Type intent for multi-agent dispatcher..."
          />
          <button
            onClick={handleDispatch}
            disabled={isDispatching}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            <span>{isDispatching ? 'Routing...' : 'Dispatch Task'}</span>
          </button>
        </div>

        {/* Streaming Logs */}
        <div className="p-3 bg-stone-950 rounded-lg border border-white/10 font-mono text-xs space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
          {dispatchLogs.map((log, idx) => (
            <div key={idx} className={idx === 0 ? 'text-amber-300 font-semibold' : 'text-stone-400'}>
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-07: MARARAG (INDIC VERNACULAR RAG PLATFORM)
// ============================================================================
const Proj07MaraRAGShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [mode, setMode] = useState<'danda' | 'standard'>('danda');
  const [activeQuery, setActiveQuery] = useState('महाराष्ट्र जमीन महसूल कायदा कलम ४१');
  const [isSearching, setIsSearching] = useState(false);
  const [searchOutput, setSearchOutput] = useState<string | null>(
    'कलम ४१ अन्वये कोणत्याही जमिनीचा शेतीव्यतिरिक्त इतर कारणांसाठी वापर करण्यापूर्वी सक्षम महसूल अधिकाऱ्याची पूर्वपरवानगी आवश्यक आहे.'
  );

  const sampleQueries = [
    'महाराष्ट्र जमीन महसूल कायदा कलम ४१',
    'सातबारा उतारा कायदेशीर महत्त्व',
    'शेतजमीन अकृषिक परवानगी नियम'
  ];

  const handleQuery = (q: string) => {
    setActiveQuery(q);
    setIsSearching(true);
    playWebAudioTone('triangle', 520, 0.1);
    setTimeout(() => {
      setIsSearching(false);
      setSearchOutput(
        q.includes('सातबारा')
          ? 'सातबारा उतारा हा जमिनीचा मालकी हक्क, क्षेत्रफळ आणि पीक पाहणी दर्शविणारा अधिकृत कायदेशीर दस्तावेज आहे.'
          : 'कलम ४१ अन्वये कोणत्याही जमिनीचा शेतीव्यतिरिक्त इतर कारणांसाठी वापर करण्यापूर्वी सक्षम महसूल अधिकाऱ्याची पूर्वपरवानगी आवश्यक आहे.'
      );
      playWebAudioTone('chime', 880, 0.3);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Danda Boundary Chunker Visualizer */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Danda (।) Sentence-Boundary Visual Chunker
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setMode('standard');
                playWebAudioTone('noise', 150, 0.1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                mode === 'standard' ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold' : 'text-stone-400'
              }`}
            >
              Standard English Chunker (Fails)
            </button>
            <button
              onClick={() => {
                setMode('danda');
                playWebAudioTone('chime', 660, 0.2);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
                mode === 'danda' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-stone-400'
              }`}
            >
              MaraRAG Danda Chunker
            </button>
          </div>
        </div>

        {/* Text Chunk Visualization */}
        <div className="p-3 bg-stone-950 rounded-lg border border-white/10 text-xs leading-relaxed space-y-2 mb-3">
          {mode === 'danda' ? (
            <div className="space-y-2 font-serif text-stone-200">
              <span className="p-1 bg-amber-500/10 border border-amber-500/30 rounded inline-block mr-1">
                महाराष्ट्र जमीन महसूल कायदा कलम ४१ नुसार जमिनीचा अकृषिक वापर नियंत्रित केला जातो।
              </span>
              <span className="p-1 bg-emerald-500/10 border border-emerald-500/30 rounded inline-block">
                अनधिकृत बांधकामावर महसूल विभागाकडून तत्काळ कायदेशीर कारवाई केली जाईल।
              </span>
              <div className="text-[10px] font-mono text-emerald-400">
                ✓ 100% Semantic coherence preserved around Danda (।) sentence boundary.
              </div>
            </div>
          ) : (
            <div className="space-y-2 font-serif text-stone-400">
              <span className="p-1 bg-red-500/10 border border-red-500/30 rounded inline-block mr-1 line-through">
                महाराष्ट्र जमीन महसूल कायदा कलम ४१ नुसार जमिनीचा अकृषिक
              </span>
              <span className="p-1 bg-red-500/10 border border-red-500/30 rounded inline-block line-through">
                वापर नियंत्रित केला जातो। अनधिकृत बांधकामावर महसूल...
              </span>
              <div className="text-[10px] font-mono text-red-400">
                ✗ Word split across compound Marathi suffixes, destroying legal semantic retrieval.
              </div>
            </div>
          )}
        </div>

        {/* Interactive Query Simulator */}
        <div className="space-y-2">
          <div className="text-xs text-stone-300 font-mono">Test FAISS Retrieval + Groq LLaMA 3.1:</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleQuery(q)}
                className={`px-2.5 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
                  activeQuery === q ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' : 'bg-stone-900 border-white/10 text-stone-400'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-amber-500/30 font-mono text-xs">
            <div className="text-stone-400 text-[10px] flex justify-between mb-1">
              <span>Groq Response (0.42s • 120 tok/s):</span>
              <span className="text-emerald-400 font-bold">Cosine Match: 0.892</span>
            </div>
            <div className="text-stone-200">
              {isSearching ? 'Retrieving 768-dim FAISS vectors...' : searchOutput}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-08: AKSHAYANIDHI (ZERO-COST AI MEDIA CLOUD)
// ============================================================================
const Proj08AkshayanidhiShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [activeCluster, setActiveCluster] = useState<'A' | 'B' | 'All'>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const photos = [
    { id: 1, title: 'Graduation Day', cluster: 'A', tag: 'Prasad (99.2% match)', desc: 'Convocation hall photo with degree', iso: 200, focal: '50mm', cache: 'HIT (32ms)' },
    { id: 2, title: 'AI Hackathon Final', cluster: 'A', tag: 'Prasad (98.7% match)', desc: 'On stage with winning trophy', iso: 400, focal: '35mm', cache: 'HIT (28ms)' },
    { id: 3, title: 'Robotics Workshop', cluster: 'B', tag: 'Teammate Rohit', desc: 'Hardware lab microcontroller assembly', iso: 800, focal: '24mm', cache: 'HIT (44ms)' },
    { id: 4, title: 'Hilltop Sunset Trek', cluster: 'B', tag: 'Teammate Rohit', desc: 'Scenic mountain cliff overlook', iso: 100, focal: '85mm', cache: 'HIT (22ms)' },
  ];

  const filtered = photos.filter((p) => {
    const matchesCluster = activeCluster === 'All' || p.cluster === activeCluster;
    const matchesSearch = searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCluster && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* InsightFace Clustering & CLIP Search Playground */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" /> InsightFace 512-dim Face Cluster vs Semantic CLIP
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Zero Storage Cost: $0.00/mo
          </span>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-stone-400">Cluster:</span>
          {(['A', 'B', 'All'] as const).map((c) => (
            <button
              key={c}
              onClick={() => {
                setActiveCluster(c);
                playWebAudioTone('sine', 580, 0.08);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeCluster === c 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400 font-bold' 
                  : 'bg-stone-900 border border-white/10 text-stone-400 hover:text-stone-200'
              }`}
            >
              {c === 'All' ? 'All Photos' : `Cluster ${c} (${c === 'A' ? 'Prasad' : 'Rohit'})`}
            </button>
          ))}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Semantic CLIP search (e.g. trophy, mountain)..."
            className="flex-1 min-w-[200px] px-3 py-1 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-200"
          />
        </div>

        {/* Photo Mosaic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {filtered.map((photo) => {
            const isSelected = selectedPhoto === photo.id;
            return (
              <div
                key={photo.id}
                onClick={() => {
                  setSelectedPhoto(photo.id);
                  playWebAudioTone('triangle', 640, 0.1);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-28 ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : 'border-white/10 bg-stone-900/60 hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-stone-100">{photo.title}</div>
                  <div className="text-[10px] text-stone-400 truncate mt-0.5">{photo.desc}</div>
                </div>
                <div className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-black/60 border border-cyan-400/30 w-fit">
                  {photo.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* EXIF Lightbox Inspector */}
        {selectedPhoto && (
          <div className="p-3 bg-stone-950 rounded-lg border border-cyan-500/30 font-mono text-xs flex flex-wrap justify-between gap-2 text-stone-300">
            <span>Photo: <strong className="text-stone-100">{photos.find((p) => p.id === selectedPhoto)?.title}</strong></span>
            <span>Focal: <strong className="text-cyan-300">{photos.find((p) => p.id === selectedPhoto)?.focal}</strong></span>
            <span>ISO: <strong className="text-amber-300">{photos.find((p) => p.id === selectedPhoto)?.iso}</strong></span>
            <span>Cloudflare Edge: <strong className="text-emerald-400">{photos.find((p) => p.id === selectedPhoto)?.cache}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-09: AUTONOMOUS LIFE OS (4 AM CIRCADIAN NOTION PARSER)
// ============================================================================
const Proj09LifeManagerShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [hour, setHour] = useState(2);
  const [inputText, setInputText] = useState('Spent 180 rs on cold brew and talked to Rahul about the AI hackathon');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<{ expense: string; task: string; journal: string }>({
    expense: '₹180 (Category: Food & Beverage)',
    task: 'Follow up with Rahul regarding AI Hackathon (Due: Tomorrow)',
    journal: 'Cold brew deep-work session log'
  });

  const handleSimulateGemini = () => {
    setIsProcessing(true);
    playWebAudioTone('triangle', 450, 0.1);
    setTimeout(() => {
      setIsProcessing(false);
      setParsedData({
        expense: '₹180 (Category: Food & Beverage)',
        task: 'Follow up with Rahul regarding AI Hackathon (Due: Tomorrow)',
        journal: `Night-owl log at ${hour.toString().padStart(2, '0')}:30 AM`
      });
      playWebAudioTone('chime', 750, 0.3);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* 4 AM Circadian Dial */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
            <Moon className="w-3.5 h-3.5" /> 4:00 AM Night-Owl Circadian Dial
          </span>
          <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
            Time: {hour.toString().padStart(2, '0')}:30 AM
          </span>
        </div>
        <p className="text-xs text-stone-300 mb-3">
          Drag the clock slider across midnight. Notes sent before 4:00 AM are filed under yesterday’s waking day, preserving habits and streaks.
        </p>

        <input
          type="range"
          min={0}
          max={6}
          step={1}
          value={hour}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setHour(val);
            playWebAudioTone('sine', 300 + val * 60, 0.06);
          }}
          className="w-full accent-amber-400 cursor-pointer mb-3"
        />

        <div className="p-3 rounded bg-stone-950 border border-white/10 font-mono text-xs flex justify-between">
          <span>Target Notion Date: <strong className="text-stone-200">{hour < 4 ? "Yesterday's Waking Day" : "Today's New Morning"}</strong></span>
          <span className={hour < 4 ? 'text-amber-300 font-bold' : 'text-emerald-400 font-bold'}>
            {hour < 4 ? '🌙 Streak Maintained' : '🌅 Next Day Routine'}
          </span>
        </div>
      </div>

      {/* Notion Relational DB Parser Simulator */}
      <div className="p-4 rounded-xl border bg-black/30" style={{ borderColor: theme.cardBorder }}>
        <div className="text-xs font-mono uppercase font-bold text-stone-300 mb-2">
          Telegram Voice Note → Notion Relational DB Simulator
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-200"
            placeholder="Type voice note transcript..."
          />
          <button
            onClick={handleSimulateGemini}
            disabled={isProcessing}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? 'Parsing...' : 'Simulate Gemini Parser'}
          </button>
        </div>

        <div className="space-y-1.5 font-mono text-xs p-3 bg-stone-950 rounded-lg border border-white/10">
          <div className="text-emerald-400">→ Expense DB: {parsedData.expense}</div>
          <div className="text-cyan-400">→ Task DB: {parsedData.task}</div>
          <div className="text-amber-400">→ Journal DB: {parsedData.journal}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-10: SAHAJ (ACCESSIBILITY OCR & 6-LANGUAGE TTS)
// ============================================================================
const Proj10SahajShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [lang, setLang] = useState<'mr' | 'hi' | 'en' | 'ta' | 'te' | 'bn'>('mr');
  const [activeWordIdx, setActiveWordIdx] = useState<number | null>(null);

  const translations = {
    mr: { label: 'मराठी', text: 'सकाळी आणि संध्याकाळी जेवणानंतर १ गोळी घ्यावी.' },
    hi: { label: 'हिंदी', text: 'सुबह और शाम खाने के बाद १ गोली लें।' },
    en: { label: 'English', text: 'Take 1 tablet after meals in morning and evening.' },
    ta: { label: 'தமிழ்', text: 'காலை மற்றும் மாலை உணவுக்குப் பிறகு 1 மாத்திரை எடுத்துக் கொள்ளவும்.' },
    te: { label: 'తెలుగు', text: 'ఉదయం మరియు సాయంత్రం భోజనం తర్వాత 1 టాబ్లెట్ తీసుకోండి.' },
    bn: { label: 'বাংলা', text: 'সকালে এবং সন্ধ্যায় খাবারের পর ১টি ট্যাবলেট খান।' },
  };

  const words = translations[lang].text.split(' ');

  const speakText = (txt: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(txt);
      if (lang === 'mr') utterance.lang = 'mr-IN';
      else if (lang === 'hi') utterance.lang = 'hi-IN';
      else if (lang === 'ta') utterance.lang = 'ta-IN';
      else if (lang === 'te') utterance.lang = 'te-IN';
      else if (lang === 'bn') utterance.lang = 'bn-IN';
      else utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      playWebAudioTone('sine', 650, 0.3);
    }
  };

  return (
    <div className="space-y-4">
      {/* High-Contrast OCR Bench */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-yellow-400 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Dual-Pane Real-Time OCR & Multilingual TTS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
            Top 5 Institutional Hackathon Finalist
          </span>
        </div>

        {/* 6 Language Switcher */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(['mr', 'hi', 'en', 'ta', 'te', 'bn'] as const).map((l) => (
            <button
              key={l}
              onClick={() => {
                setLang(l);
                setActiveWordIdx(null);
                playWebAudioTone('sine', 550, 0.08);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                lang === l ? 'bg-yellow-400 text-stone-950 font-bold shadow-md' : 'bg-stone-900 text-stone-300 border border-white/10 hover:text-white'
              }`}
            >
              {translations[l].label}
            </button>
          ))}
        </div>

        {/* Dual-Pane OCR Word Bounding Boxes */}
        <div className="p-3 bg-stone-950 rounded-lg border border-yellow-400/30 mb-3">
          <div className="text-[10px] font-mono text-stone-400 mb-2">
            CRAFT Text Detection Word Bounding Boxes (Click any word to listen):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {words.map((w, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveWordIdx(idx);
                  speakText(w);
                }}
                className={`px-2 py-1 rounded border text-sm font-medium transition-all cursor-pointer ${
                  activeWordIdx === idx 
                    ? 'bg-yellow-400 text-stone-950 border-yellow-300 font-bold scale-105' 
                    : 'bg-stone-900 border-yellow-500/30 text-stone-200 hover:border-yellow-400'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Speech Trigger */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-stone-400 font-mono">Full Sentence Speech:</span>
          <button
            onClick={() => speakText(translations[lang].text)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak Full Sentence ({translations[lang].label})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-11: LOCAL LAN AI EXAM PLATFORM
// ============================================================================
const Proj11ExamShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [integrityScore, setIntegrityScore] = useState(100);
  const [studentAnswer, setStudentAnswer] = useState(
    'TCP is connection-oriented protocol using three-way handshake and guarantees packet ordering, whereas UDP is connectionless and prioritized for low latency.'
  );
  const [alerts, setAlerts] = useState<string[]>([]);
  const [cosineScore, setCosineScore] = useState(0.884);

  const handleTabSwitch = () => {
    setIntegrityScore((s) => Math.max(0, s - 15));
    setAlerts((a) => ['Proctor: Tab window switch detected (-15 pts)', ...a.slice(0, 2)]);
    playWebAudioTone('noise', 200, 0.2);
  };

  const handleClipboard = () => {
    setIntegrityScore((s) => Math.max(0, s - 20));
    setAlerts((a) => ['Proctor: External clipboard paste intercepted (-20 pts)', ...a.slice(0, 2)]);
    playWebAudioTone('noise', 300, 0.25);
  };

  const handleAnswerChange = (val: string) => {
    setStudentAnswer(val);
    const score = Math.min(0.98, Math.max(0.4, 0.5 + val.length * 0.003));
    setCosineScore(score);
  };

  return (
    <div className="space-y-4">
      {/* Semantic Grading & AntiCheat Sentinel */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Semantic Cosine Grading & AntiCheat Sentinel
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            100% Offline Air-Gapped
          </span>
        </div>

        {/* Editable Student Answer Input */}
        <div className="space-y-2 mb-3">
          <div className="text-xs text-stone-300 font-mono">
            Question: "Explain the architectural difference between TCP and UDP."
          </div>
          <textarea
            value={studentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-200 focus:outline-none"
            placeholder="Type answer to calculate semantic similarity..."
          />
        </div>

        {/* Grade Dial & AntiCheat Trigger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-950 rounded-xl border border-white/10 mb-3">
          <div className="flex items-center justify-between pr-3 border-r border-white/10">
            <div>
              <div className="text-[10px] font-mono text-stone-400">AI Semantic Grade</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {(cosineScore * 10).toFixed(1)} <span className="text-xs text-stone-400">/ 10.0</span>
              </div>
              <div className="text-[10px] font-mono text-stone-400">Cosine: {cosineScore.toFixed(3)}</div>
            </div>
            <div className="text-[10px] font-mono text-right text-stone-400">
              <div>Concept: 96%</div>
              <div>Keyword Stuff: 0%</div>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-stone-400">Integrity Score</span>
              <span className={`text-sm font-bold font-mono ${integrityScore > 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                {integrityScore}%
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleTabSwitch}
                className="flex-1 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded text-[11px] font-mono cursor-pointer"
              >
                Simulate Tab Switch
              </button>
              <button
                onClick={handleClipboard}
                className="flex-1 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-[11px] font-mono cursor-pointer"
              >
                Simulate Paste
              </button>
            </div>
          </div>
        </div>

        {/* Alert Logs */}
        {alerts.length > 0 && (
          <div className="space-y-1 font-mono text-[11px] text-red-300">
            {alerts.map((al, idx) => (
              <div key={idx} className="p-1.5 rounded bg-red-950/40 border border-red-500/30">
                ⚠ {al}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-12: CME SPACE WEATHER DETECTOR
// ============================================================================
const Proj12CMEShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [alpha, setAlpha] = useState(0.4);
  const [hasSpike, setHasSpike] = useState(false);
  const [simulatedWindSpeed, setSimulatedWindSpeed] = useState(420);

  const handleInjectFlare = () => {
    setHasSpike(true);
    setSimulatedWindSpeed(840);
    playWebAudioTone('noise', 350, 0.4);
    setTimeout(() => {
      setHasSpike(false);
      setSimulatedWindSpeed(450);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {/* Real-Time Solar Wind Oscilloscope */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> NOAA Solar Wind Anomaly Oscilloscope
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
            Top Finalist YCCE CodeRush
          </span>
        </div>

        {/* Dynamic Waveform Display */}
        <div className="h-28 bg-stone-950 rounded-lg border border-orange-500/30 relative overflow-hidden flex items-center px-4 mb-3">
          <svg className="w-full h-20" viewBox="0 0 400 70" preserveAspectRatio="none">
            {/* 3-Sigma Anomaly Line */}
            <line x1="0" y1="25" x2="400" y2="25" stroke="#f59e0b" strokeDasharray="4 2" strokeWidth="1" />
            
            {/* Dynamic Solar Wind Curve */}
            <path
              d={hasSpike 
                ? "M 0 55 Q 60 50, 120 54 T 200 48 T 260 8 T 320 52 T 400 50" 
                : "M 0 55 Q 60 52, 120 56 T 200 50 T 260 48 T 320 54 T 400 52"
              }
              fill="none"
              stroke="#ff6b00"
              strokeWidth="2.5"
              className="transition-all duration-300"
            />
            {hasSpike && (
              <>
                <circle cx="260" cy="8" r="5" fill="#ff4400" className="animate-ping" />
                <circle cx="260" cy="8" r="3.5" fill="#ffffff" />
              </>
            )}
          </svg>

          <div className="absolute top-2 right-3 text-[10px] font-mono">
            {hasSpike ? (
              <span className="text-red-400 font-bold animate-pulse">⚡ CME SHOCKWAVE DETECTED: {simulatedWindSpeed} km/s (&gt; 3-Sigma)</span>
            ) : (
              <span className="text-emerald-400">Normal Plasma: {simulatedWindSpeed} km/s</span>
            )}
          </div>
        </div>

        {/* Trigger Flare & EWMA Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-300 font-mono">Simulate Coronal Mass Ejection:</span>
            <button
              onClick={handleInjectFlare}
              disabled={hasSpike}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold rounded-lg text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            >
              Inject Solar Flare Shockwave
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1">
              <span>EWMA Smoothing Factor (α): <strong className="text-orange-400 font-mono">{alpha.toFixed(2)}</strong></span>
              <span className="text-[10px] text-stone-400">Fast Response vs Noise Filter</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-13: SADHANA (HABIT PWA & 365-DAY GRID)
// ============================================================================
const Proj13SadhanaShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [streak, setStreak] = useState(14);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(0);

  const handleLogHabit = () => {
    setStreak((s) => s + 1);
    if (isOffline) {
      setOfflineQueue((q) => q + 1);
      playWebAudioTone('triangle', 440, 0.1);
    } else {
      playWebAudioTone('chime', 659, 0.4);
    }
  };

  const handleReconnect = () => {
    setIsOffline(false);
    if (offlineQueue > 0) {
      playWebAudioTone('fanfare');
      setOfflineQueue(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* 365-Day Heat Grid & Streak Counter */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-orange-400 flex items-center gap-2">
            🔥 365-Day Discipline Matrix & Atomic Streak
          </span>
          <button
            onClick={() => (isOffline ? handleReconnect() : setIsOffline(true))}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-all ${
              isOffline ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            {isOffline ? `Offline Mode (${offlineQueue} Queued)` : 'Online (Firestore Sync)'}
          </button>
        </div>

        {/* Streak Counter Header */}
        <div className="p-3 bg-stone-950 rounded-lg border border-orange-500/30 flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono text-stone-400">Current Unbroken Streak</div>
            <div className="text-2xl font-bold font-mono text-orange-400 flex items-center gap-1.5">
              <span>{streak} Days</span>
              <span className="text-base animate-pulse">🔥</span>
            </div>
          </div>
          <button
            onClick={handleLogHabit}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-stone-950 font-bold rounded-lg text-xs cursor-pointer shadow-md transition-all active:scale-95"
          >
            + Log Today's Sadhana
          </button>
        </div>

        {/* 30-Day Activity Heatmap */}
        <div className="grid grid-cols-10 gap-1.5 p-2 bg-stone-950/60 rounded-lg border border-white/5">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 rounded-sm transition-all ${
                i < streak % 30 
                  ? 'bg-orange-500 shadow-[0_0_6px_rgba(234,88,12,0.6)]' 
                  : 'bg-stone-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-14: NISHTHA (15-TIER SANSKRIT HABIT RPG)
// ============================================================================
const Proj14NishthaShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [tier, setTier] = useState(2);
  const [xp, setXp] = useState(420);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const tiers = [
    'आरम्भ (Arambha - Level 1)',
    'अभ्यास (Abhyasa - Level 3)',
    'साधक (Sadhaka - Level 7)',
    'तपस्वी (Tapasvi - Level 11)',
    'परम सिद्ध (Param Siddha - Level 15)',
  ];

  const handleGainXP = () => {
    setXp((x) => {
      const nextXp = x + 150;
      if (nextXp >= 1000 && tier < tiers.length - 1) {
        setTier((t) => t + 1);
        setHasCelebrated(true);
        playWebAudioTone('fanfare');
        setTimeout(() => setHasCelebrated(false), 2000);
        return 0;
      }
      playWebAudioTone('chime', 700 + nextXp * 0.2, 0.25);
      return nextXp;
    });
  };

  return (
    <div className="space-y-4">
      {/* 15-Tier Sanskrit Rank Wheel */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
            🛡 15-Tier Sanskrit XP Wheel & Hero Journey
          </span>
          <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
            {tiers[tier]}
          </span>
        </div>

        {/* Progress Bar with Level Up Animation */}
        <div className="p-3 bg-stone-950 rounded-lg border border-amber-500/30 space-y-2 mb-3">
          <div className="flex justify-between text-xs text-stone-300 font-mono">
            <span>Karma XP: {xp} / 1000</span>
            <span className="text-amber-400 font-bold">{Math.min(100, Math.round(xp / 10))}%</span>
          </div>
          <div className="h-3.5 bg-stone-900 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${Math.min(100, xp / 10)}%` }}
            />
          </div>
          {hasCelebrated && (
            <div className="text-center font-mono text-xs font-bold text-yellow-300 animate-bounce pt-1">
              ★ TIER ADVANCEMENT UNLOCKED! ★
            </div>
          )}
        </div>

        {/* XP Gains & Dev Cheat Console */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleGainXP}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg cursor-pointer shadow-md transition-all active:scale-95"
          >
            Gain +150 Karma XP
          </button>
          <button
            onClick={() => {
              setTier(4);
              setXp(1000);
              playWebAudioTone('fanfare');
            }}
            className="px-3 py-1 text-[11px] font-mono text-amber-300/90 bg-stone-900 border border-amber-500/30 rounded hover:bg-stone-800 cursor-pointer"
          >
            Recruiter God-Mode: set_level 15
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-15: TRACEMATE PRO (WEBAR CAMERA TRACING)
// ============================================================================
const Proj15TraceMateShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [opacity, setOpacity] = useState(55);
  const [isDrifting, setIsDrifting] = useState(false);

  const handleSimulateTremor = () => {
    setIsDrifting(true);
    playWebAudioTone('triangle', 320, 0.1);
    setTimeout(() => {
      setIsDrifting(false);
      playWebAudioTone('chime', 780, 0.25);
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Lightbox Split-Screen Slider */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
            ✏ Dual-Feed Sketch Lightbox Slider (SAD Drift Correction)
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300">
            Opacity: {opacity}%
          </span>
        </div>

        {/* Optical Crosshair Viewport */}
        <div className="h-32 bg-stone-950 rounded-lg border border-cyan-500/30 relative overflow-hidden flex items-center justify-center p-4 mb-3">
          <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-stone-500 text-xs font-mono">
            [ Physical Sketch Paper Under Camera ]
          </div>
          <div 
            className={`absolute inset-0 bg-cyan-950/40 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-300 font-mono text-xs transition-all ${
              isDrifting ? 'translate-x-3 translate-y-2 border-red-400 text-red-300' : 'translate-x-0 translate-y-0'
            }`}
            style={{ opacity: opacity / 100 }}
          >
            {isDrifting ? '⚠ SAD Optical Drift Compensating...' : '✓ Augmented Line Art Locked (SAD Match)'}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-stone-300">
            <span>Overlay Tracing Transparency</span>
            <span className="font-mono text-cyan-400">{opacity}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-end pt-1">
            <button
              onClick={handleSimulateTremor}
              className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono rounded cursor-pointer"
            >
              Simulate Hand Tremor & SAD Correction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-16: VYUHAM (GLASSMORHPIC 10px-SNAP EXTENSION)
// ============================================================================
const Proj16VyuhamShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [widgetX, setWidgetX] = useState(40);

  const handleSnap = (delta: number) => {
    setWidgetX((curr) => {
      const next = Math.max(0, Math.min(200, curr + delta));
      playWebAudioTone('triangle', 600, 0.05);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Draggable 10px-Snapping Glass Matrix */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-sky-400 flex items-center gap-2">
            🪟 10px-Snapping Glass Matrix (Chrome MV3 Resilient)
          </span>
          <span className="text-xs font-mono text-stone-400">
            Position: {widgetX}px (10px Grid Snap)
          </span>
        </div>

        <div className="h-32 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg border border-sky-500/20 relative p-3 overflow-hidden mb-3">
          {/* Glass Card */}
          <div 
            className="w-52 p-3 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 shadow-xl text-xs font-mono text-stone-200 transition-transform duration-200 select-none cursor-grab"
            style={{ transform: `translateX(${widgetX}px)` }}
          >
            <div className="font-bold text-sky-300">Pomodoro Focus Timer</div>
            <div className="text-[11px] text-stone-300 mt-1">24:59 Remaining</div>
            <div className="text-[9px] text-stone-400 mt-1">Epoch: Date.now() - targetEpoch</div>
          </div>
        </div>

        {/* Snap Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSnap(-30)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-mono cursor-pointer"
          >
            Snap Left (-30px)
          </button>
          <button
            onClick={() => handleSnap(30)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-mono cursor-pointer"
          >
            Snap Right (+30px)
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-17: SMART CAMPUS (26-ROOM TIMETABLE ETL)
// ============================================================================
const Proj17SmartCampusShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [activeRoom, setActiveRoom] = useState('Lab 3');

  const rooms = [
    { id: 'Lab 3', name: 'Lab 3 (Robotics)', status: 'OCCUPIED', desc: 'CSE-B Robotics Practical • Until 03:45 PM', prof: 'Prof. S. Patil', count: 34 },
    { id: 'Room 104', name: 'Room 104 (AI/ML)', status: 'VACANT', desc: 'Free for open study • Next lecture in 48 min', prof: 'None', count: 0 },
    { id: 'Seminar Hall', name: 'Seminar Hall', status: 'OCCUPIED', desc: 'Department Tech Talk • Until 05:00 PM', prof: 'Dr. Deshmukh', count: 120 },
  ];

  const current = rooms.find((r) => r.id === activeRoom) || rooms[0];

  return (
    <div className="space-y-4">
      {/* 26-Room Architectural Floormap */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-2">
            🏫 26-Room Real-Time Availability Floormap
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Python openpyxl ETL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRoom(r.id);
                playWebAudioTone('sine', 520, 0.08);
              }}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                activeRoom === r.id ? 'border-cyan-400 bg-cyan-500/20 font-bold shadow' : 'border-white/10 bg-white/5 text-stone-400'
              }`}
            >
              <div className="text-stone-200">{r.name}</div>
              <div className={`text-[10px] font-mono mt-1 ${r.status === 'OCCUPIED' ? 'text-red-400' : 'text-emerald-400'}`}>
                ● {r.status}
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-stone-950 rounded-lg border border-white/10 text-xs text-stone-300 font-mono space-y-1">
          <div>Room: <strong className="text-stone-100">{current.name}</strong></div>
          <div>Current Activity: <span className="text-cyan-300">{current.desc}</span></div>
          <div>Faculty In-Charge: <span className="text-amber-300">{current.prof}</span></div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-18: GAME DISCOVERY STORE (KRAFT PAPER ZINE)
// ============================================================================
const Proj18GameStoreShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [filter, setFilter] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const games = [
    { title: 'Chrono Rift', tag: 'RPG', price: '$9.99' },
    { title: 'Neon Runner', tag: 'Action', price: '$4.99' },
    { title: 'Quantum Lock', tag: 'Puzzle', price: '$7.49' },
    { title: '8-Bit Dungeon', tag: 'Retro', price: '$3.99' },
  ];

  const filtered = games.filter(
    (g) => g.title.toLowerCase().includes(filter.toLowerCase()) || g.tag.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Paper Zine Storefront */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-2">
            🎮 Paper Zine Indie Cartridge Storefront
          </span>
          <span className="text-xs font-mono text-amber-300 font-bold">
            Cart ({cartCount})
          </span>
        </div>

        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter games by tag (rpg, action, puzzle, retro)..."
          className="w-full px-3 py-1.5 bg-stone-950 border border-white/10 rounded-lg text-xs font-mono text-stone-200 mb-3"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {filtered.map((g) => (
            <div key={g.title} className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 text-xs flex flex-col justify-between h-24">
              <div>
                <div className="font-bold text-amber-200 truncate">{g.title}</div>
                <div className="text-[10px] font-mono text-stone-400 mt-0.5">#{g.tag}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-emerald-400">{g.price}</span>
                <button
                  onClick={() => {
                    setCartCount((c) => c + 1);
                    playWebAudioTone('chime', 880, 0.2);
                  }}
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-mono cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PROJ-19: Z.P. MODEL GIRLS SCHOOL LASURGAON PORTAL
// ============================================================================
const Proj19SchoolShowcase: React.FC<{ theme: StationTheme }> = ({ theme }) => {
  const [lang, setLang] = useState<'mr' | 'en'>('mr');

  const content = {
    mr: {
      headline: 'जि.प. प्राथमिक शाळा लासूरगाव डिजिटल प्रवेशद्वार',
      notice1: 'नवीन शैक्षणिक वर्ष २०२६-२७ प्रवेश प्रक्रिया सुरू आहे.',
      notice2: 'विद्यार्थिनींसाठी मोफत सायन्स किट व गणवेश वाटप योजना उपलब्ध.',
    },
    en: {
      headline: 'Z.P. Primary School Lasurgaon Official Portal',
      notice1: 'Academic Year 2026-27 Enrollment is now open.',
      notice2: 'Free STEM kits and uniform distribution scheme active.',
    },
  };

  return (
    <div className="space-y-4">
      {/* Civic Blackboard Portal */}
      <div className="p-4 rounded-xl border bg-black/40" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold uppercase text-emerald-400 flex items-center gap-2">
            📚 Civic Digital Blackboard & Pure CSS Lightbox
          </span>
          <button
            onClick={() => {
              setLang(lang === 'mr' ? 'en' : 'mr');
              playWebAudioTone('sine', 520, 0.08);
            }}
            className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold cursor-pointer"
          >
            {lang === 'mr' ? 'English View' : 'मराठी दृश्य'}
          </button>
        </div>

        <div className="p-3 bg-stone-950 rounded-lg border border-emerald-500/30 space-y-2">
          <div className="text-sm font-bold text-stone-100">
            {content[lang].headline}
          </div>
          <div className="text-xs text-stone-300 space-y-1">
            <div>• {content[lang].notice1}</div>
            <div>• {content[lang].notice2}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MASTER SHOWCASE ROUTER
// ============================================================================
export const ProjectShowcaseWidget: React.FC<ProjectShowcaseWidgetProps> = ({
  stationId,
  projectId,
  theme,
  onTeleport,
}) => {
  switch (stationId) {
    case 'TRIGGER_Harbor_Welcome':
      return <Proj01IslandShowcase theme={theme} onTeleport={onTeleport} />;
    case 'TRIGGER_Project_RealmWebAR':
      return <Proj02ARShowcase theme={theme} />;
    case 'TRIGGER_Project_OneMoreMove':
      return <Proj03RoguelikeShowcase theme={theme} />;
    case 'TRIGGER_Forge_GameDev':
      return <Proj04DeliveryShowcase theme={theme} />;
    case 'TRIGGER_Project_KnightsAdventure':
      return <Proj05KnightShowcase theme={theme} />;
    case 'TRIGGER_Project_ButlerOS':
      return <Proj06ButlerShowcase theme={theme} />;
    case 'TRIGGER_Project_MaraRAG':
      return <Proj07MaraRAGShowcase theme={theme} />;
    case 'TRIGGER_Project_Akshayanidhi':
      return <Proj08AkshayanidhiShowcase theme={theme} />;
    case 'TRIGGER_Project_LifeManager':
      return <Proj09LifeManagerShowcase theme={theme} />;
    case 'TRIGGER_Project_Sahaj':
      return <Proj10SahajShowcase theme={theme} />;
    case 'TRIGGER_Project_ExamPlatform':
      return <Proj11ExamShowcase theme={theme} />;
    case 'TRIGGER_Project_CMEDetector':
      return <Proj12CMEShowcase theme={theme} />;
    case 'TRIGGER_Project_Sadhana':
      return <Proj13SadhanaShowcase theme={theme} />;
    case 'TRIGGER_Project_Nishtha':
      return <Proj14NishthaShowcase theme={theme} />;
    case 'TRIGGER_Project_TraceMateAR':
      return <Proj15TraceMateShowcase theme={theme} />;
    case 'TRIGGER_Project_Vyuham':
      return <Proj16VyuhamShowcase theme={theme} />;
    case 'TRIGGER_Project_SmartCampus':
      return <Proj17SmartCampusShowcase theme={theme} />;
    case 'TRIGGER_Project_GameStore':
      return <Proj18GameStoreShowcase theme={theme} />;
    case 'TRIGGER_Project_SchoolWebsite':
      return <Proj19SchoolShowcase theme={theme} />;
    default:
      return null;
  }
};
