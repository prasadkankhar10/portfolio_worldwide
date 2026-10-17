import { create } from 'zustand';
import * as THREE from 'three';

export interface RegisteredNPC {
  id: string;
  role: string;
  position: THREE.Vector3;
  state: string;
  groupId?: string;
}

export type GameState = 'menu' | 'playing';
export type PortfolioSection = 'none' | 'about' | 'projects' | 'contact';
export type UITheme = 'forest' | 'obsidian';

interface GameStore {
  currentAtmosphere: string;
  setAtmosphere: (atmosphere: string) => void;
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  activeSection: PortfolioSection;
  setActiveSection: (section: PortfolioSection) => void;
  isFreeCam: boolean;
  toggleFreeCam: () => void;
  hasStarted: boolean;
  setHasStarted: (started: boolean) => void;
  activeDialogId: string | null;
  activeDialogNpcId: string | null;
  setActiveDialog: (dialogId: string | null, npcId?: string | null) => void;
  activeOutlineMesh: THREE.Object3D | null;
  setActiveOutlineMesh: (mesh: THREE.Object3D | null) => void;
  summonedNpcRole: string | null;
  summonNpc: (role: string | null) => void;
  dialogFlags: Record<string, boolean>;
  setDialogFlag: (flag: string, value: boolean) => void;
  // Mobile Controls
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
  isLowPowerGpu: boolean;
  setIsLowPowerGpu: (lowPower: boolean) => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  togglePerformanceMode: () => void;
  virtualJoystick: { x: number, y: number }; // x, y from -1 to 1
  setVirtualJoystick: (x: number, y: number) => void;
  virtualCameraDelta: { x: number, y: number };
  setVirtualCameraDelta: (x: number, y: number) => void;
  virtualButtons: { jump: boolean, run: boolean };
  setVirtualButton: (button: 'jump' | 'run', active: boolean) => void;
  triggerInteractEvent: number; // A counter that increments when tapped
  fireInteractEvent: () => void;
  // Map / Quest Tracker
  isTrackerOpen: boolean;
  toggleTracker: () => void;
  setTrackerOpen: (open: boolean) => void;
  // Farming Logic
  farmPlots: THREE.Vector3[];
  setFarmPlots: (plots: THREE.Vector3[]) => void;
  depositPlots: THREE.Vector3[];
  setDepositPlots: (plots: THREE.Vector3[]) => void;
  // Ritual Event
  activeRitual: boolean;
  setActiveRitual: (active: boolean) => void;
  ritualState: 'idle' | 'gathering' | 'channeling' | 'climax';
  setRitualState: (state: 'idle' | 'gathering' | 'channeling' | 'climax') => void;
  // Story Quest Logic
      // NPC Chat System
  npcRegistry: Record<string, RegisteredNPC>;
  registerNpc: (npc: RegisteredNPC) => void;
  updateNpcState: (id: string, position: THREE.Vector3, state: string) => void;
  unregisterNpc: (id: string) => void;
  npcSpeechBubbles: Record<string, string>;
  setNpcSpeechBubble: (id: string, text: string | null) => void;
  npcChatTargets: Record<string, THREE.Vector3>;
  setNpcChatTarget: (id: string, target: THREE.Vector3 | null) => void;
  occupiedShops: Record<string, boolean>;
  setShopOccupied: (shopType: string, occupied: boolean) => void;
  magicPrompt: string | null;
  setMagicPrompt: (prompt: string | null) => void;
  stonehengeBanner: { title: string; bodyHtml: string } | null;
  setStonehengeBanner: (banner: { title: string; bodyHtml: string } | null) => void;
  stonehengeSolved: boolean;
  setStonehengeSolved: (solved: boolean) => void;
  stonehengeStep: number;
  setStonehengeStep: (step: number) => void;
  teleportTarget: { x: number; y: number; z: number } | null;
  teleportPlayer: (pos: { x: number; y: number; z: number }) => void;
  clearTeleportTarget: () => void;
  // Portfolio Station Triggers & Modal
  activeStationId: string | null;
  setActiveStationId: (id: string | null) => void;
  isStationModalOpen: boolean;
  setStationModalOpen: (open: boolean) => void;
  activeStationPrompt: string | null;
  setActiveStationPrompt: (prompt: string | null) => void;
  // Quick Traditional 2D Portfolio View
  isQuickPortfolioOpen: boolean;
  setQuickPortfolioOpen: (open: boolean) => void;
  // In-World Waypoint / GPS Navigation
  activeWaypointStationId: string | null;
  setActiveWaypointStationId: (id: string | null) => void;
  // Exploration Codex & Badges
  visitedStationIds: string[];
  markStationVisited: (id: string) => void;
  unlockedBadges: string[];
  latestUnlockedBadge: { id: string; title: string; desc: string; icon: string } | null;
  clearLatestBadge: () => void;
  // Guided Tour Mode
  isGuidedTourActive: boolean;
  setIsGuidedTourActive: (active: boolean) => void;
  guidedTourIndex: number;
  setGuidedTourIndex: (index: number) => void;
  // Sound Engine
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
  // Royal Courier Vessel & Message Delivery Simulation
  courierShipState: 'moored' | 'departing' | 'voyaging' | 'delivered';
  courierShipDispatchTime: number;
  courierMessageInfo: { name: string; email: string; subject?: string; message: string; timestamp: number } | null;
  isWatchingVessel: boolean;
  dispatchCourierShip: (info: { name: string; email: string; subject?: string; message: string }) => void;
  setIsWatchingVessel: (watching: boolean) => void;
  resetCourierShip: () => void;
  // UI Theme Switcher (Forest Gold vs Obsidian Cobalt)
  uiTheme: UITheme;
  setUITheme: (theme: UITheme) => void;
  toggleUITheme: () => void;
}

const loadStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveStorage = <T>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const useGameStore = create<GameStore>((set, get) => ({
  // In-World Waypoint / GPS Navigation
  activeWaypointStationId: null,
  setActiveWaypointStationId: (id) => set({ activeWaypointStationId: id }),

  // Exploration Codex & Badges
  visitedStationIds: loadStorage<string[]>('portfolio_visited_stations', []),
  markStationVisited: (id: string) => {
    const current = get().visitedStationIds;
    if (!current.includes(id)) {
      const nextVisited = [...current, id];
      saveStorage('portfolio_visited_stations', nextVisited);

      // Check for unlockable badges
      const currentBadges = get().unlockedBadges;
      const nextBadges = [...currentBadges];
      let newlyUnlockedBadge: { id: string; title: string; desc: string; icon: string } | null = null;

      const tryUnlock = (badgeId: string, title: string, desc: string, icon: string) => {
        if (!nextBadges.includes(badgeId)) {
          nextBadges.push(badgeId);
          newlyUnlockedBadge = { id: badgeId, title, desc, icon };
        }
      };

      if (id === 'TRIGGER_Harbor_Welcome') {
        tryUnlock('harbor_arrival', 'First Port of Call', 'Arrived at Harbor Pier & Welcome Exhibit', '⛵');
      }
      if (id === 'TRIGGER_Hall_Certifications') {
        tryUnlock('harvard_scholar', 'Harvard CS50x Scholar', 'Explored the Harvard CS50 Hall of Rigor', '🎓');
      }
      if (id === 'TRIGGER_Project_ButlerOS' || id === 'TRIGGER_Project_OneMoreMove' || id === 'TRIGGER_Forge_GameDev') {
        tryUnlock('systems_architect', 'Systems Architect', 'Inspected bare-metal engine & autonomous AI projects', '⚡');
      }
      if (id === 'TRIGGER_Citadel_Contact') {
        tryUnlock('summit_conqueror', 'Citadel Apex Climber', 'Scaled to the Citadel Summit summit overlook', '🏔️');
      }
      if (nextVisited.length >= 18) {
        tryUnlock('master_explorer', 'Grand Archipelago Master', 'Discovered all 18 exhibition stations!', '👑');
      }

      saveStorage('portfolio_unlocked_badges', nextBadges);
      set({ 
        visitedStationIds: nextVisited, 
        unlockedBadges: nextBadges,
        ...(newlyUnlockedBadge ? { latestUnlockedBadge: newlyUnlockedBadge } : {})
      });
    }
  },
  unlockedBadges: loadStorage<string[]>('portfolio_unlocked_badges', []),
  latestUnlockedBadge: null,
  clearLatestBadge: () => set({ latestUnlockedBadge: null }),

  // Guided Tour Mode
  isGuidedTourActive: false,
  setIsGuidedTourActive: (active) => {
    if (active && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ isGuidedTourActive: active, guidedTourIndex: 0 });
  },
  guidedTourIndex: 0,
  setGuidedTourIndex: (index) => set({ guidedTourIndex: index }),

  // Sound Engine
  isAudioMuted: loadStorage<boolean>('portfolio_audio_muted', false),
  toggleAudioMute: () => set((state) => {
    const nextMuted = !state.isAudioMuted;
    saveStorage('portfolio_audio_muted', nextMuted);
    return { isAudioMuted: nextMuted };
  }),
  stonehengeBanner: null,
  setStonehengeBanner: (banner) => set({ stonehengeBanner: banner }),
  stonehengeSolved: false,
  setStonehengeSolved: (solved) => set({ stonehengeSolved: solved }),
  stonehengeStep: 0,
  setStonehengeStep: (step) => set({ stonehengeStep: step }),
  currentAtmosphere: 'Cosmic Nebula',
  setAtmosphere: (atmosphere) => set({ currentAtmosphere: atmosphere }),
  isLoaded: false,
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),
  
  isTrackerOpen: false,
  gameState: 'menu',
  setGameState: (state) => set({ gameState: state }),
  activeSection: 'none',
  setActiveSection: (section) => set({ activeSection: section }),
  isFreeCam: false,
  toggleFreeCam: () => set((state) => ({ isFreeCam: !state.isFreeCam })),
  hasStarted: false,
  setHasStarted: (started) => set({ hasStarted: started }),
  activeDialogId: null,
  activeDialogNpcId: null,
  setActiveDialog: (dialogId, npcId = null) => set({ activeDialogId: dialogId, activeDialogNpcId: npcId }),
  activeOutlineMesh: null,
  setActiveOutlineMesh: (mesh) => set({ activeOutlineMesh: mesh }),
  summonedNpcRole: null,
  summonNpc: (role) => set({ summonedNpcRole: role }),
  dialogFlags: {},
  setDialogFlag: (flag, value) => set((state) => ({ dialogFlags: { ...state.dialogFlags, [flag]: value } })),
  isMobile: false,
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  isLowPowerGpu: false,
  setIsLowPowerGpu: (lowPower) => set({ isLowPowerGpu: lowPower }),
  performanceMode: true,
  setPerformanceMode: (enabled) => set({ performanceMode: enabled }),
  togglePerformanceMode: () => set((state) => ({ performanceMode: !state.performanceMode })),
  virtualJoystick: { x: 0, y: 0 },
  setVirtualJoystick: (x, y) => set({ virtualJoystick: { x, y } }),
  virtualCameraDelta: { x: 0, y: 0 },
  setVirtualCameraDelta: (x, y) => set({ virtualCameraDelta: { x, y } }),
  virtualButtons: { jump: false, run: false },
  setVirtualButton: (button, active) => set((state) => ({
    virtualButtons: { ...state.virtualButtons, [button]: active }
  })),
  
  toggleTracker: () => set((state) => ({ isTrackerOpen: !state.isTrackerOpen })),
  setTrackerOpen: (open) => set({ isTrackerOpen: open }),
  
  farmPlots: [],
  setFarmPlots: (plots) => set({ farmPlots: plots }),
  depositPlots: [],
  setDepositPlots: (plots) => set({ depositPlots: plots }),
  
  activeRitual: false,
  setActiveRitual: (active) => set({ activeRitual: active }),
  ritualState: 'idle',
  setRitualState: (state) => set({ ritualState: state }),
  
      
  npcRegistry: {},
  registerNpc: (npc) => set((state) => ({ npcRegistry: { ...state.npcRegistry, [npc.id]: npc } })),
  updateNpcState: (id, position, npcState) => set((state) => {
    const existing = state.npcRegistry[id];
    if (!existing) return state;
    return {
      npcRegistry: {
        ...state.npcRegistry,
        [id]: { ...existing, position: position.clone(), state: npcState }
      }
    };
  }),
  unregisterNpc: (id) => set((state) => {
    const newReg = { ...state.npcRegistry };
    delete newReg[id];
    return { npcRegistry: newReg };
  }),
  
  npcSpeechBubbles: {},
  setNpcSpeechBubble: (id, text) => set((state) => {
    const newBubbles = { ...state.npcSpeechBubbles };
    if (text === null) {
      delete newBubbles[id];
    } else {
      newBubbles[id] = text;
    }
    return { npcSpeechBubbles: newBubbles };
  }),
  npcChatTargets: {},
  setNpcChatTarget: (id, target) => set((state) => {
    const newTargets = { ...state.npcChatTargets };
    if (target === null) {
      delete newTargets[id];
    } else {
      newTargets[id] = target;
    }
    return { npcChatTargets: newTargets };
  }),
  occupiedShops: {},
  setShopOccupied: (shopType, occupied) =>
    set((state) => ({ occupiedShops: { ...state.occupiedShops, [shopType]: occupied } })),
  magicPrompt: null,
  setMagicPrompt: (prompt) => set({ magicPrompt: prompt }),
  teleportTarget: null,
  teleportPlayer: (pos) => set({ teleportTarget: pos }),
  clearTeleportTarget: () => set({ teleportTarget: null }),
  triggerInteractEvent: 0,
  fireInteractEvent: () => set((state) => ({ triggerInteractEvent: state.triggerInteractEvent + 1 })),
  // Portfolio Station Triggers & Modal
  activeStationId: null,
  setActiveStationId: (id) => set({ activeStationId: id }),
  isStationModalOpen: false,
  setStationModalOpen: (open) => {
    if (open && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ isStationModalOpen: open });
  },
  activeStationPrompt: null,
  setActiveStationPrompt: (prompt) => set({ activeStationPrompt: prompt }),
  // Quick Traditional 2D Portfolio View
  isQuickPortfolioOpen: false,
  setQuickPortfolioOpen: (open) => {
    if (open && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ isQuickPortfolioOpen: open });
  },
  // Royal Courier Vessel & Message Delivery Simulation
  courierShipState: 'moored',
  courierShipDispatchTime: 0,
  courierMessageInfo: null,
  isWatchingVessel: false,
  dispatchCourierShip: (info) => {
    set({
      courierShipState: 'departing',
      courierShipDispatchTime: performance.now(),
      courierMessageInfo: { ...info, timestamp: Date.now() },
    });
  },
  setIsWatchingVessel: (watching) => set({ isWatchingVessel: watching }),
  resetCourierShip: () => {
    set({
      courierShipState: 'moored',
      courierShipDispatchTime: 0,
      courierMessageInfo: null,
      isWatchingVessel: false,
    });
  },
  // UI Theme Switcher
  uiTheme: loadStorage<UITheme>('portfolio_ui_theme', 'forest'),
  setUITheme: (theme) => {
    saveStorage('portfolio_ui_theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ uiTheme: theme });
  },
  toggleUITheme: () => {
    const currentTheme = get().uiTheme;
    const nextTheme: UITheme = currentTheme === 'obsidian' ? 'forest' : 'obsidian';
    saveStorage('portfolio_ui_theme', nextTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
    set({ uiTheme: nextTheme });
  },
}));
