import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import type { KeyboardControlsEntry } from '@react-three/drei';
import { Suspense, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Scene } from './components/3d/Scene';
import { useGameStore } from './store/useGameStore';
import { DialogOverlay } from './components/ui/DialogOverlay';

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
  const hasStarted = useGameStore((state) => state.hasStarted);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      if (e.key.toLowerCase() === 'v') {
        toggleFreeCam();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFreeCam]);

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
      {hasStarted && <DialogOverlay />}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 5, 10], fov: 60 }}
          gl={{ antialias: true }}
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
