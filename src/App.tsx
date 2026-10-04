import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import type { KeyboardControlsEntry } from '@react-three/drei';
import { Suspense, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Layout } from './components/Layout';
import { Scene } from './components/3d/Scene';
import { useGameStore } from './store/useGameStore';
import { DialogOverlay } from './components/ui/DialogOverlay';
import { MobileControls } from './components/ui/MobileControls';
import { RotateDeviceOverlay } from './components/ui/RotateDeviceOverlay';
import { PortfolioTracker } from './components/ui/PortfolioTracker';
import { PerformanceProfilerHUD } from './components/ui/PerformanceProfilerHUD';
import { StationPortfolioModal } from './components/ui/StationPortfolioModal';
import { StationHUDPrompt } from './components/ui/StationHUDPrompt';

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
      if (e.key.toLowerCase() === 'y') {
        const store = useGameStore.getState();
        if (!store.activeRitual) {
          store.setActiveRitual(true);
          store.setRitualState('gathering');
        } else {
          // Pressing Y again cancels it for testing
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
      <Layout />
      <PerformanceProfilerHUD />
      <StationHUDPrompt />
      <StationPortfolioModal />
      {hasStarted && <DialogOverlay />}
      {hasStarted && <MobileControls />}
      {hasStarted && <PortfolioTracker />}
      {isMobile && <RotateDeviceOverlay />}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows={!performanceMode}
          camera={{ position: [0, 5, 10], fov: 60, near: 0.1, far: 1000 }}
          gl={{ 
            antialias: !performanceMode, 
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.25
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
