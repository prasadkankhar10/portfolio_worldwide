import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import type { KeyboardControlsEntry } from '@react-three/drei';
import { Suspense, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Layout } from './components/Layout';
import { Scene } from './components/3d/Scene';
import { useGameStore } from './store/useGameStore';
import { DialogOverlay } from './components/ui/DialogOverlay';
import { MobileControls } from './components/ui/MobileControls';
import { RotateDeviceOverlay } from './components/ui/RotateDeviceOverlay';
import { PortfolioTracker } from './components/ui/PortfolioTracker';
import { StationPortfolioModal } from './components/ui/StationPortfolioModal';
import { StationHUDPrompt } from './components/ui/StationHUDPrompt';
import { QuickPortfolioModal } from './components/ui/QuickPortfolioModal';
import { MiniMap } from './components/ui/MiniMap';
import { GuidedTourOverlay } from './components/ui/GuidedTourOverlay';
import { RecruiterSpeedrunHUD } from './components/ui/RecruiterSpeedrunHUD';
import { AITerminalModal } from './components/ui/AITerminalModal';
import { MiniGameModal } from './components/ui/MiniGameModal';
import { HarborGuestbookModal } from './components/ui/HarborGuestbookModal';
import { PhotoModeModal } from './components/ui/PhotoModeModal';
import { Leva } from 'leva';

export const Controls = {
  forward: 'forward',
  back: 'back',
  left: 'left',
  right: 'right',
  jump: 'jump',
  run: 'run',
} as const;

export type ControlsType = keyof typeof Controls;

function App() {
  const toggleFreeCam = useGameStore((state) => state.toggleFreeCam);
  const toggleTracker = useGameStore((state) => state.toggleTracker);
  const hasStarted = useGameStore((state) => state.hasStarted);
  const setIsMobile = useGameStore((state) => state.setIsMobile);
  const setIsLowPowerGpu = useGameStore((state) => state.setIsLowPowerGpu);
  const isMobile = useGameStore((state) => state.isMobile);
  const performanceMode = useGameStore((state) => state.performanceMode);
  const uiTheme = useGameStore((state) => state.uiTheme);
  const gameState = useGameStore((state) => state.gameState);
  const isQuickPortfolioOpen = useGameStore((state) => state.isQuickPortfolioOpen);
  const isStationModalOpen = useGameStore((state) => state.isStationModalOpen);
  const isTrackerOpen = useGameStore((state) => state.isTrackerOpen);
  const isWorldMapOpen = useGameStore((state) => state.isWorldMapOpen);

  // Synchronize UI Theme attribute on document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', uiTheme);
    }
  }, [uiTheme]);

  // Auto-pause Three.js render loop when tab is hidden to prevent Chrome background tab lag and GPU resource starvation
  const [isTabVisible, setIsTabVisible] = useState<boolean>(
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // 1. Is this definitely a Desktop OS (Windows, Mac, Linux desktop)?
    // Touchscreen laptops (e.g. Surface, Yoga, touch monitors) MUST use desktop controls, not mobile virtual joysticks!
    const isDesktopOS = /Windows NT|Macintosh|X11; Linux x86_64/i.test(navigator.userAgent) && !/Android|Quest|OculusBrowser/i.test(navigator.userAgent);
    
    // 2. Is this an actual mobile phone or tablet (Android phone/tablet, iPhone, iPad)?
    const isMobileDevice = !isDesktopOS && (
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024)
    );

    // On any PC / laptop, isMobile is strictly FALSE so desktop keyboard WASD & mouse controls are active
    setIsMobile(isMobileDevice);

    // 3. Low-power GPU detection (standalone VR headsets like Quest 3 or mobile phones) for postprocessing
    const isLowPowerGpu = isMobileDevice || /Quest|OculusBrowser/i.test(navigator.userAgent);
    setIsLowPowerGpu(isLowPowerGpu);
  }, [setIsMobile, setIsLowPowerGpu]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      if (e.key.toLowerCase() === 'v') {
        toggleFreeCam();
      }
      if (e.key.toLowerCase() === 'm' || e.key === 'Tab') {
        e.preventDefault();
        const willOpen = !useGameStore.getState().isTrackerOpen;
        if (willOpen && document.pointerLockElement) {
          document.exitPointerLock();
        }
        toggleTracker();
      }
      if (e.key.toLowerCase() === 'n') {
        const store = useGameStore.getState();
        if (!store.isStationModalOpen && !store.isTrackerOpen && !store.isQuickPortfolioOpen) {
          e.preventDefault();
          const willOpen = !store.isWorldMapOpen;
          if (willOpen && document.pointerLockElement) {
            document.exitPointerLock();
          }
          store.toggleWorldMap();
        }
      }
      if (e.key.toLowerCase() === 'p') {
        const store = useGameStore.getState();
        if (!store.isStationModalOpen && !store.isTrackerOpen && !store.isQuickPortfolioOpen && !store.isWorldMapOpen) {
          e.preventDefault();
          store.togglePhotoMode();
        }
      }
      if (e.key.toLowerCase() === 'y') {
        const store = useGameStore.getState();
        if (!store.activeRitual) {
          store.setActiveRitual(true);
          store.setRitualState('gathering');
        } else {
          store.setActiveRitual(false);
          store.setRitualState('idle');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFreeCam, toggleTracker]);

  const map = useMemo<KeyboardControlsEntry<ControlsType>[]>(() => [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.jump, keys: ['Space'] },
    { name: Controls.run, keys: ['Shift'] },
  ], []);

  return (
    <KeyboardControls map={map}>
      <Leva hidden />
      <Layout />
      <StationHUDPrompt />
      <StationPortfolioModal />
      <QuickPortfolioModal />
      {hasStarted && <DialogOverlay />}
      {hasStarted && <MobileControls />}
      {hasStarted && <PortfolioTracker />}
      {isMobile && hasStarted && gameState === 'playing' && !isQuickPortfolioOpen && !isStationModalOpen && !isWorldMapOpen && !isTrackerOpen && <RotateDeviceOverlay />}
      <MiniMap />
      <GuidedTourOverlay />
      <RecruiterSpeedrunHUD />
      <AITerminalModal />
      <MiniGameModal />
      <HarborGuestbookModal />
      <PhotoModeModal />
      <div className="absolute inset-0 z-0">
        <Canvas
          frameloop={isTabVisible ? 'always' : 'never'}
          shadows={!performanceMode}
          camera={{ position: [0, 5, 10], fov: 60, near: 0.1, far: 1000 }}
          gl={{ 
            antialias: !performanceMode, 
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.55
          }}
          dpr={performanceMode ? 1 : [1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.2)]}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default App;
