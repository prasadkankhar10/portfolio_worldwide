import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export interface TourStop {
  id: string;
  stationId: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  camPos: [number, number, number];
  lookAt: [number, number, number];
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 'harbor_welcome',
    stationId: 'TRIGGER_Harbor_Welcome',
    badge: 'Stop 1 of 5 • Port of Arrival',
    title: 'Interactive 3D Portfolio Archipelago',
    tagline: 'Prasad Anil Kankhar — Software & Game Engine Developer',
    description: 'A stylized real-time 3D universe built with React Three Fiber, WebGL, custom Rapier physics, and procedural Web Audio. Seamlessly explore projects, credentials, and codebases.',
    camPos: [118.0, 9.0, 134.0],
    lookAt: [108.89, 3.5, 118.04]
  },
  {
    id: 'harvard_cs50',
    stationId: 'TRIGGER_Hall_Certifications',
    badge: 'Stop 2 of 5 • Academic Foundations',
    title: 'Harvard CS50x Hall of Rigor',
    tagline: 'Algorithmic Complexity, Memory Management & Data Structures',
    description: 'Certified through Harvard University’s flagship CS50x program, mastering low-level C memory allocation, pointers, Big-O algorithm efficiency, SQL databases, and web architectures.',
    camPos: [78.0, 9.5, 108.0],
    lookAt: [65.0, 3.8, 95.0]
  },
  {
    id: 'game_engine',
    stationId: 'TRIGGER_Project_OneMoreMove',
    badge: 'Stop 3 of 5 • Low-Level Systems',
    title: 'One More Move • C++17 Bare-Metal Engine',
    tagline: 'Custom Physics, Real-Time PCM Audio & Android NDK',
    description: 'Engineered a bare-metal turn-based puzzle engine in modern C++17 with mathematical procedural chiptune audio synthesis, BFS maze solvers, and custom cross-platform packaging with zero third-party bloat.',
    camPos: [-68.0, 9.0, -18.0],
    lookAt: [-78.0, 4.0, -28.0]
  },
  {
    id: 'autonomous_ai',
    stationId: 'TRIGGER_Project_ButlerOS',
    badge: 'Stop 4 of 5 • Autonomous Architectures',
    title: 'Butler OS • Multi-Agent Orchestration',
    tagline: 'Autonomous AI Workflows, High-Throughput APIs & Vector Stores',
    description: 'Architected distributed AI workflows with tool-calling capabilities, semantic retrieval pipelines, and high-performance asynchronous execution for complex real-world task automation.',
    camPos: [-20.0, 10.5, -68.0],
    lookAt: [-30.0, 4.5, -80.0]
  },
  {
    id: 'citadel_summit',
    stationId: 'TRIGGER_Citadel_Contact',
    badge: 'Stop 5 of 5 • Citadel Summit',
    title: 'The Citadel Apex • Open for Collaboration',
    tagline: 'Ready for High-Impact Software Engineering & Systems Roles',
    description: 'From low-level game engines to full-stack web and autonomous AI systems, Prasad brings end-to-end technical craftsmanship and relentless curiosity to every engineering team.',
    camPos: [-2.0, 22.0, -82.0],
    lookAt: [-15.0, 12.0, -100.0]
  }
];

export const GuidedTourController: React.FC = () => {
  const isGuidedTourActive = useGameStore((state) => state.isGuidedTourActive);
  const guidedTourIndex = useGameStore((state) => state.guidedTourIndex);
  const { camera } = useThree();

  const currentLookAt = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const targetCamPos = useRef(new THREE.Vector3());

  // Initialize lookAt vector on tour start
  useEffect(() => {
    if (isGuidedTourActive) {
      currentLookAt.current.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()));
    }
  }, [isGuidedTourActive, camera]);

  useFrame((state, delta) => {
    if (!isGuidedTourActive) return;

    const stop = TOUR_STOPS[guidedTourIndex] || TOUR_STOPS[0];
    const t = state.clock.getElapsedTime();

    // Subtle drone breathing / pan effect for cinematic feel
    const driftX = Math.sin(t * 0.25) * 1.5;
    const driftY = Math.cos(t * 0.3) * 0.5;

    targetCamPos.current.set(
      stop.camPos[0] + driftX,
      stop.camPos[1] + driftY,
      stop.camPos[2]
    );

    targetLookAt.current.set(
      stop.lookAt[0],
      stop.lookAt[1],
      stop.lookAt[2]
    );

    // Smooth spherical/lerp camera movement
    camera.position.lerp(targetCamPos.current, Math.min(1, 2.8 * delta));
    currentLookAt.current.lerp(targetLookAt.current, Math.min(1, 3.5 * delta));
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
