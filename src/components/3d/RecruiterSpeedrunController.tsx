import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { soundEngine } from '../../utils/soundEngine';

export interface SpeedrunStop {
  id: string;
  title: string;
  category: string;
  metrics: string[];
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  duration: number; // in seconds
}

export const SPEEDRUN_STOPS: SpeedrunStop[] = [
  {
    id: 'intro',
    title: 'Prasad Anil Kankhar',
    category: 'Full-Stack Systems & Game Engine Architect',
    metrics: [
      'B.Tech Computer Science @ MIT (Class of 2026)',
      'Harvard CS50x Certified Scholar · Top 1% Performer',
      'Technical Coordinator @ ACTS · Campus Mantri @ GFG'
    ],
    cameraPos: [95, 12, 138],
    targetPos: [100, 4, 115],
    duration: 10
  },
  {
    id: 'cpp_engine',
    title: 'One More Move (C++17 Engine)',
    category: 'Low-Level Systems & Game Engineering',
    metrics: [
      'Custom 2D Roguelike Engine built from scratch in C++17 & SDL3',
      'Real-time procedural PCM audio waveform synthesis',
      'Deterministic turn loop & zero third-party dependencies'
    ],
    cameraPos: [-88, 16, 18],
    targetPos: [-97, 4, 5],
    duration: 12
  },
  {
    id: 'ai_agents',
    title: 'Butler OS & Akshayanidhi AI',
    category: 'Autonomous Multi-Agent Systems & Deep Learning',
    metrics: [
      'Butler OS: Zero-latency autonomous desktop multi-agent orchestrator',
      'Akshayanidhi: Zero-cost AI photo vault with 512-dim face clustering',
      'Automated candidate evaluation pipeline via NLP embeddings'
    ],
    cameraPos: [-18, 14, -30],
    targetPos: [-5, 4, -17],
    duration: 12
  },
  {
    id: 'citadel_systems',
    title: 'Production Full-Stack Ecosystem',
    category: 'Distributed Web, PWA & Cloud Architecture',
    metrics: [
      '19 Verified production software architectures deployed',
      'Nishtha (RPG habit tracker) & Sadhana (offline-sync PWA)',
      'TraceMate Pro: WebAR camera tracing engine running at 60 FPS'
    ],
    cameraPos: [12, 38, -55],
    targetPos: [2, 30, -68],
    duration: 12
  },
  {
    id: 'executive_cta',
    title: 'Executive Summary & Next Steps',
    category: 'Ready to Deliver High-Signal Impact',
    metrics: [
      'Available for Software Engineering & Game Tech roles',
      'Direct, zero-friction engineering communication style',
      'Schedule a technical interview or download verified dossier'
    ],
    cameraPos: [45, 18, 75],
    targetPos: [45, 4, 4],
    duration: 999
  }
];

export const RecruiterSpeedrunController: React.FC = () => {
  const { camera } = useThree();
  const isRecruiterSpeedrun = useGameStore((s) => s.isRecruiterSpeedrun);
  const speedrunIndex = useGameStore((s) => s.speedrunIndex);
  const setSpeedrunIndex = useGameStore((s) => s.setSpeedrunIndex);
  const stopRecruiterSpeedrun = useGameStore((s) => s.stopRecruiterSpeedrun);

  const currentCamPos = useRef(new THREE.Vector3());
  const currentTargetPos = useRef(new THREE.Vector3());
  const elapsedInStop = useRef(0);
  const activeStopIndex = useRef(0);

  useEffect(() => {
    if (isRecruiterSpeedrun) {
      activeStopIndex.current = speedrunIndex;
      elapsedInStop.current = 0;
      soundEngine.playWaypointTrackSound();
    }
  }, [isRecruiterSpeedrun, speedrunIndex]);

  useFrame((_, delta) => {
    if (!isRecruiterSpeedrun) return;

    const stop = SPEEDRUN_STOPS[speedrunIndex] || SPEEDRUN_STOPS[0];
    const targetCam = new THREE.Vector3(...stop.cameraPos);
    const targetLook = new THREE.Vector3(...stop.targetPos);

    // Smooth spherical dampening towards target
    camera.position.lerp(targetCam, THREE.MathUtils.clamp(delta * 2.5, 0.01, 0.15));
    currentTargetPos.current.lerp(targetLook, THREE.MathUtils.clamp(delta * 3.0, 0.01, 0.18));
    camera.lookAt(currentTargetPos.current);

    // Timer progression
    elapsedInStop.current += delta;
    if (elapsedInStop.current >= stop.duration && speedrunIndex < SPEEDRUN_STOPS.length - 1) {
      elapsedInStop.current = 0;
      setSpeedrunIndex(speedrunIndex + 1);
      soundEngine.playClickSound();
    }
  });

  return null;
};
