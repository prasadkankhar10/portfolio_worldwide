import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { frameProfiler } from '../../utils/frameProfiler';
import { useGameStore } from '../../store/useGameStore';

export const FrameLagTracker: React.FC = () => {
  const { gl, camera } = useThree();
  const dirVecRef = useRef(new THREE.Vector3());
  const lowFpsDuration = useRef(0);
  const frameCount = useRef(0);
  const lastFpsUpdateTime = useRef(performance.now());

  useFrame((_, delta) => {
    // 1. Live In-Theme FPS calculation (refreshed every 250ms for smooth, jitter-free readout)
    frameCount.current++;
    const now = performance.now();
    if (now - lastFpsUpdateTime.current >= 250) {
      const elapsed = (now - lastFpsUpdateTime.current) / 1000;
      const currentFps = Math.min(120, Math.round(frameCount.current / elapsed));
      frameCount.current = 0;
      lastFpsUpdateTime.current = now;

      const fpsEl = document.getElementById('hud-fps');
      const dotEl = document.getElementById('hud-fps-dot');
      if (fpsEl) {
        fpsEl.innerText = String(currentFps);
      }
      if (dotEl) {
        if (currentFps >= 50) {
          dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
        } else if (currentFps >= 30) {
          dotEl.className = 'w-2 h-2 rounded-full bg-[#D4B777]';
        } else {
          dotEl.className = 'w-2 h-2 rounded-full bg-rose-500';
        }
      }
    }
    // Get camera looking direction (N, NE, E, SE, S, SW, W, NW)
    camera.getWorldDirection(dirVecRef.current);
    const angle = Math.atan2(dirVecRef.current.x, -dirVecRef.current.z);
    const deg = (angle * 180) / Math.PI;
    let dir = 'N';
    if (deg >= -22.5 && deg < 22.5) dir = 'N';
    else if (deg >= 22.5 && deg < 67.5) dir = 'NE';
    else if (deg >= 67.5 && deg < 112.5) dir = 'E';
    else if (deg >= 112.5 && deg < 157.5) dir = 'SE';
    else if (deg >= 157.5 || deg < -157.5) dir = 'S';
    else if (deg >= -157.5 && deg < -112.5) dir = 'SW';
    else if (deg >= -112.5 && deg < -67.5) dir = 'W';
    else if (deg >= -67.5 && deg < -22.5) dir = 'NW';

    const store = useGameStore.getState();
    const atmosphere = store.currentAtmosphere || 'day';

    // Adaptive Performance Guard: If FPS stays below 30 for 3 continuous seconds, auto-enable 60 FPS mode
    if (delta > 0.033) {
      lowFpsDuration.current += delta;
      if (lowFpsDuration.current > 3.0 && !store.performanceMode) {
        store.setPerformanceMode(true);
        lowFpsDuration.current = 0;
      }
    } else {
      lowFpsDuration.current = Math.max(0, lowFpsDuration.current - delta * 0.5);
    }

    frameProfiler.recordFrame(
      delta,
      gl.info,
      [camera.position.x, camera.position.y, camera.position.z],
      dir,
      atmosphere
    );
  });

  return null;
};
