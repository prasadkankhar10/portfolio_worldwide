import { useGameStore } from '../store/useGameStore';
import { LoadingScreen } from './ui/LoadingScreen';
import { MainMenu } from './ui/MainMenu';
import { HUD } from './ui/HUD';
import { useEffect } from 'react';

export const Layout = () => {
  const isLoaded = useGameStore((state) => state.isLoaded);
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);

  // Handle escape key to open menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useGameStore.getState();
      if (store.isStationModalOpen || store.isTrackerOpen || store.isQuickPortfolioOpen) {
        return;
      }
      if (e.key === 'Escape' && gameState === 'playing') {
        // If pointer is currently locked, Escape naturally releases the pointer lock
        // so the player can freely click HUD buttons (Journal, Stations, Menu).
        if (typeof document !== 'undefined' && document.pointerLockElement) {
          return;
        }
        setGameState('menu');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, setGameState]);

  return (
    <>
      {!isLoaded && <LoadingScreen />}
      {isLoaded && gameState === 'menu' && <MainMenu />}
      {isLoaded && gameState === 'playing' && <HUD />}
    </>
  );
};
