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

interface GameStore {
  currentAtmosphere: string;
  setAtmosphere: (atmosphere: string) => void;
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  activeSection: PortfolioSection;
  setActiveSection: (section: PortfolioSection) => void;
  debugMenuOpen: boolean;
  setDebugMenuOpen: (open: boolean) => void;
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
}

export const useGameStore = create<GameStore>((set) => ({
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
  debugMenuOpen: false,
  setDebugMenuOpen: (open) => set({ debugMenuOpen: open }),
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
  performanceMode: false,
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
  setStationModalOpen: (open) => set({ isStationModalOpen: open }),
  activeStationPrompt: null,
  setActiveStationPrompt: (prompt) => set({ activeStationPrompt: prompt }),
}));
