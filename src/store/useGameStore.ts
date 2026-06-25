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
}));
