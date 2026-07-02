import { create } from 'zustand';
import * as THREE from 'three';

export type GameState = 'menu' | 'playing';
export type PortfolioSection = 'none' | 'about' | 'projects' | 'contact';

interface GameStore {
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
}

export const useGameStore = create<GameStore>((set) => ({
  isLoaded: false,
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),
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
}));
