import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { frameProfiler } from '../../utils/frameProfiler';
import { useGameStore } from '../../store/useGameStore';

export const FrameLagTracker: React.FC = () => {
  const { gl, camera } = useThree();
  const dirVecRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
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

    const atmosphere = useGameStore.getState().currentAtmosphere || 'day';

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
