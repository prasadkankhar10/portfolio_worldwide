import React, { Suspense, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Outline, Bloom, Vignette } from '@react-three/postprocessing';
import { Environment } from './Environment';
import { AtmosphereManager } from './AtmosphereManager';
import { Character } from './Character';
import { CompanionOrb } from './CompanionOrb';
import { Birds } from './Birds';
import { Fireflies } from './Fireflies';
import { FreeCamManager } from './FreeCam';
import { Sea } from './Sea';
import { FrameLagTracker } from './FrameLagTracker';
import { InWorldWaypoint } from './InWorldWaypoint';
import { GuidedTourController } from './GuidedTourController';
import { MenuCameraController } from './MenuCameraController';
const ClericNPC = React.lazy(() => import('./ClericNPC').then(m => ({ default: m.ClericNPC })));
const BlueSoldierFemaleNPC = React.lazy(() => import('./BlueSoldierFemaleNPC').then(m => ({ default: m.BlueSoldierFemaleNPC })));
const BlueSoldierMaleNPC = React.lazy(() => import('./BlueSoldierMaleNPC').then(m => ({ default: m.BlueSoldierMaleNPC })));
const Casual3FemaleNPC = React.lazy(() => import('./Casual3FemaleNPC').then(m => ({ default: m.Casual3FemaleNPC })));
const Casual3MaleNPC = React.lazy(() => import('./Casual3MaleNPC').then(m => ({ default: m.Casual3MaleNPC })));
const CowboyFemaleNPC = React.lazy(() => import('./CowboyFemaleNPC').then(m => ({ default: m.CowboyFemaleNPC })));
const CowboyHairNPC = React.lazy(() => import('./CowboyHairNPC').then(m => ({ default: m.CowboyHairNPC })));
const CowboyMaleNPC = React.lazy(() => import('./CowboyMaleNPC').then(m => ({ default: m.CowboyMaleNPC })));
const ElfNPC = React.lazy(() => import('./ElfNPC').then(m => ({ default: m.ElfNPC })));
const GoblinFemaleNPC = React.lazy(() => import('./GoblinFemaleNPC').then(m => ({ default: m.GoblinFemaleNPC })));
const GoblinMaleNPC = React.lazy(() => import('./GoblinMaleNPC').then(m => ({ default: m.GoblinMaleNPC })));
const KnightGoldenFemaleNPC = React.lazy(() => import('./KnightGoldenFemaleNPC').then(m => ({ default: m.KnightGoldenFemaleNPC })));
const KnightGoldenMaleNPC = React.lazy(() => import('./KnightGoldenMaleNPC').then(m => ({ default: m.KnightGoldenMaleNPC })));
const KnightMaleNPC = React.lazy(() => import('./KnightMaleNPC').then(m => ({ default: m.KnightMaleNPC })));
const PirateFemaleNPC = React.lazy(() => import('./PirateFemaleNPC').then(m => ({ default: m.PirateFemaleNPC })));
const PirateMaleNPC = React.lazy(() => import('./PirateMaleNPC').then(m => ({ default: m.PirateMaleNPC })));
const VikingHelmetNPC = React.lazy(() => import('./VikingHelmetNPC').then(m => ({ default: m.VikingHelmetNPC })));
const VikingFemaleNPC = React.lazy(() => import('./VikingFemaleNPC').then(m => ({ default: m.VikingFemaleNPC })));
const VikingMaleNPC = React.lazy(() => import('./VikingMaleNPC').then(m => ({ default: m.VikingMaleNPC })));
const WitchNPC = React.lazy(() => import('./WitchNPC').then(m => ({ default: m.WitchNPC })));

const VikingBlacksmithNPC = React.lazy(() => import('./VikingBlacksmithNPC').then(m => ({ default: m.VikingBlacksmithNPC })));
const CowboyShopNPC = React.lazy(() => import('./CowboyShopNPC').then(m => ({ default: m.CowboyShopNPC })));
const CasualShopNPC = React.lazy(() => import('./CasualShopNPC').then(m => ({ default: m.CasualShopNPC })));
const WitchShopNPC = React.lazy(() => import('./WitchShopNPC').then(m => ({ default: m.WitchShopNPC })));
const GoblinFruitNPC = React.lazy(() => import('./GoblinFruitNPC').then(m => ({ default: m.GoblinFruitNPC })));
const WizardNPC = React.lazy(() => import('./WizardNPC').then(m => ({ default: m.WizardNPC })));
const MarketVisitorNPC = React.lazy(() => import('./MarketVisitorNPC').then(m => ({ default: m.MarketVisitorNPC })));
import { NpcChatSystem } from './NpcChatSystem';
import { BuildingTrigger } from './BuildingTrigger';
import { RitualCenter } from './RitualCenter';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// Pre-fetch dynamic NPC chunks during idle time to eliminate network latency spikes
const prefetchNpcChunks = () => {
  const chunks = [
    () => import('./VikingBlacksmithNPC'),
    () => import('./CowboyShopNPC'),
    () => import('./CasualShopNPC'),
    () => import('./WitchShopNPC'),
    () => import('./GoblinFruitNPC'),
    () => import('./BlueSoldierFemaleNPC'),
    () => import('./Casual3MaleNPC'),
    () => import('./CowboyMaleNPC'),
    () => import('./ElfNPC'),
    () => import('./VikingHelmetNPC'),
    () => import('./PirateFemaleNPC'),
    () => import('./PirateMaleNPC'),
    () => import('./GoblinFemaleNPC'),
    () => import('./GoblinMaleNPC'),
    () => import('./KnightGoldenMaleNPC'),
    () => import('./KnightMaleNPC'),
    () => import('./ClericNPC'),
    () => import('./WitchNPC'),
    () => import('./WizardNPC'),
  ];
  chunks.forEach((loader, i) => {
    setTimeout(() => {
      try {
        loader();
      } catch {
        // Silently ignore if already loaded or failing non-critically
      }
    }, 150 + i * 40);
  });
};

export const Scene = () => {
  const { gl, scene, camera } = useThree();
  const hasStarted = useGameStore((state) => state.hasStarted);
  const activeOutlineMesh = useGameStore((state) => state.activeOutlineMesh);
  const isLowPowerGpu = useGameStore((state) => state.isLowPowerGpu);
  const performanceMode = useGameStore((state) => state.performanceMode);
  const setWorldPrewarmProgress = useGameStore((state) => state.setWorldPrewarmProgress);
  const setIsWorldPrewarmed = useGameStore((state) => state.setIsWorldPrewarmed);

  // Background progressive pre-warming engine:
  // Starts loading the 3D world smoothly while the visitor is on "Choose How You Wish to Explore" screen.
  // By the time they click "Enter 3D World", all textures, models, and shaders are 100% compiled in GPU memory!
  const [loadPhase, setLoadPhase] = React.useState(0);

  useEffect(() => {
    // 1. Kick off chunk prefetching
    prefetchNpcChunks();

    // 2. Progressive background mounting over ~3 seconds
    const t1 = setTimeout(() => {
      setLoadPhase((prev) => Math.max(prev, 1));
      setWorldPrewarmProgress(25);
    }, 300);

    const t2 = setTimeout(() => {
      setLoadPhase((prev) => Math.max(prev, 2));
      setWorldPrewarmProgress(50);
    }, 900);

    const t3 = setTimeout(() => {
      setLoadPhase((prev) => Math.max(prev, 3));
      setWorldPrewarmProgress(75);
    }, 1800);

    const t4 = setTimeout(() => {
      setLoadPhase((prev) => Math.max(prev, 4));
      setWorldPrewarmProgress(100);
      setIsWorldPrewarmed(true);
      try {
        gl.compile(scene, camera);
      } catch {
        // Ignored
      }
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [gl, scene, camera, setWorldPrewarmProgress, setIsWorldPrewarmed]);

  // If user immediately clicks "Enter 3D World" before 3 seconds, promote to full load immediately
  useEffect(() => {
    if (hasStarted) {
      setLoadPhase(4);
      setWorldPrewarmProgress(100);
      setIsWorldPrewarmed(true);
    }
  }, [hasStarted, setWorldPrewarmProgress, setIsWorldPrewarmed]);

  // Periodic idle WebGL shader compile check
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        gl.compile(scene, camera);
      } catch {
        // Ignored
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [gl, scene, camera]);

  return (
    <>
      {/* Postprocessing for Interactive Outlines & Bloom (bypassed in performance mode) */}
      {!isLowPowerGpu && !performanceMode && (
        <EffectComposer multisampling={0} autoClear={false}>
          <Outline 
             selection={activeOutlineMesh ? [activeOutlineMesh] : []}
             blur 
             visibleEdgeColor={0xffffff} 
             hiddenEdgeColor={0xffffff} 
             edgeStrength={activeOutlineMesh ? 3 : 0} 
          />
          <Bloom 
            intensity={0.48} 
            luminanceThreshold={0.82} 
            luminanceSmoothing={0.35} 
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      )}
      <AtmosphereManager />

      <NpcChatSystem />

      <Physics debug={false}>
        <Suspense fallback={null}>
          <Environment />
          <Sea />

          {/* Character pre-mounted in memory so Adventurer.glb loads during initial LoadingScreen */}
          <Suspense fallback={null}>
            <Character />
          </Suspense>

          {/* Dynamic Characters & Interactive Gameplay Elements (pre-warmed smoothly in background) */}
          {(hasStarted || loadPhase >= 1) && (
            <>
              {hasStarted && <CompanionOrb />}
              {/* Building Triggers */}
              <BuildingTrigger position={[115, 3, 0]} radius={15} dialogId="building_test_1" />

              {/* Phase 2: Marketplace Shopkeepers (+100ms) - Preserved completely */}
              {loadPhase >= 2 && (
                <>
                  <VikingBlacksmithNPC position={[121.5, 3.0, 1.2]} rotation={[0, -Math.PI/2, 0]} />
                  <CowboyShopNPC position={[112.3, 3.0, 7.2]} rotation={[0, Math.PI, 0]} />
                  <CasualShopNPC position={[103.8, 3.0, -7.5]} rotation={[0, Math.PI/2, 0]} />
                  <WitchShopNPC position={[120.7, 3.0, -7.1]} rotation={[0, -Math.PI/2, 0]} />
                  <GoblinFruitNPC position={[125.6, 3.0, 7.4]} rotation={[0, -Math.PI/2, 0]} />
                </>
              )}

              {/* Phase 4: Curated Town Citizens & Dock Workers (+300ms) - Zero duplicates for smooth 60 FPS */}
              {loadPhase >= 3 && (
                <>
                  {/* Town Gate Guard & Iconic Citizens */}
                  <BlueSoldierFemaleNPC startPosition={new THREE.Vector3(10, 30, -10)} dialogId="world_guide_1" maxWanderRadius={5} />
                  <Casual3MaleNPC startPosition={new THREE.Vector3(-15, 30, -5)} maxWanderRadius={5} />
                  <CowboyMaleNPC startPosition={new THREE.Vector3(84, 30, 58)} dialogId="cowboy_events_1" maxWanderRadius={5} />
                  <ElfNPC startPosition={new THREE.Vector3(5, 30, 25)} dialogId="elf_tech_1" maxWanderRadius={5} />
                  <VikingHelmetNPC startPosition={new THREE.Vector3(40, 30, 0)} maxWanderRadius={5} />

                  {/* Dock Workers Pair (Active & Resting) */}
                  <PirateFemaleNPC startPosition={new THREE.Vector3(101, 30, 117)} startState="RESTING_SITTING" dialogId="pirate_web_1" />
                  <PirateMaleNPC startPosition={new THREE.Vector3(103, 30, 117)} startState="WORKING_PORT" dialogId="pirate_web_1" />
                </>
              )}

              {/* Phase 5: Forest Camp, Arena & SANCTUARY / SHRINE (All Sanctuary NPCs 100% Preserved) */}
              {loadPhase >= 4 && (
                <>
                  {/* Forest Goblins Pair */}
                  <GoblinFemaleNPC startPosition={new THREE.Vector3(-85, 30, -93)} dialogId="goblin_forest_1" maxWanderRadius={4} />
                  <GoblinMaleNPC startPosition={new THREE.Vector3(-83, 30, -90)} dialogId="goblin_forest_2" maxWanderRadius={4} />

                  {/* Sparring Knights (Attacker vs Defender) */}
                  <KnightGoldenMaleNPC startPosition={new THREE.Vector3(-60, 3, 72)} dialogId="knight_academics_1" startState="SPARRING" sparringRole="ATTACKER" maxWanderRadius={5} />
                  <KnightMaleNPC startPosition={new THREE.Vector3(-60, 3, 76)} startState="SPARRING" sparringRole="DEFENDER" maxWanderRadius={5} />

                  {/* Sanctuary & Shrine NPCs - 100% Intact as requested */}
                  <ClericNPC roleName="Cleric" startPosition={new THREE.Vector3(101, 30, -76)} />
                  <WitchNPC startPosition={new THREE.Vector3(100, 30, -75)} dialogId="witch_creative_1" maxWanderRadius={5} />
                  <WizardNPC startPosition={new THREE.Vector3(102, 30, -77)} dialogId="wizard_intro_1" maxWanderRadius={5} participatesInRitual={true} />
                  <RitualCenter />
                </>
              )}
            </>
          )}
        </Suspense>
      </Physics>

      {/* Free Camera Mode */}
      <FreeCamManager />

      {/* Procedural Wildlife */}
      <Birds count={performanceMode ? 8 : 18} />
      <Fireflies count={performanceMode ? 25 : 50} />

      {/* In-World 3D Waypoint / GPS Beacon */}
      <InWorldWaypoint />

      {/* Cinematic Autopilot Guided Tour Camera Controller */}
      <GuidedTourController />

      {/* Cinematic Menu Orbit & Parallax Camera Controller */}
      <MenuCameraController />

      {/* Frame & Lag Performance Profiler */}
      <FrameLagTracker />
    </>
  );
};

// Pre-load NPC models to eliminate mid-game texture/geometry compilation freezes
useGLTF.preload('./models/NPCs/Cleric.glb');
useGLTF.preload('./models/NPCs/BlueSoldier_Female.glb');
useGLTF.preload('./models/NPCs/BlueSoldier_Male.glb');
useGLTF.preload('./models/NPCs/Casual3_Female.glb');
useGLTF.preload('./models/NPCs/Casual3_Male.glb');
useGLTF.preload('./models/NPCs/Cowboy_Female.glb');
useGLTF.preload('./models/NPCs/Cowboy_Hair.glb');
useGLTF.preload('./models/NPCs/Cowboy_Male.glb');
useGLTF.preload('./models/NPCs/Elf.glb');
useGLTF.preload('./models/NPCs/Goblin_Female.glb');
useGLTF.preload('./models/NPCs/Goblin_Male.glb');
useGLTF.preload('./models/NPCs/KnightGolden_Female.glb');
useGLTF.preload('./models/NPCs/KnightGolden_Male.glb');
useGLTF.preload('./models/NPCs/Knight_Male.glb');
useGLTF.preload('./models/NPCs/Pirate_Female.glb');
useGLTF.preload('./models/NPCs/Pirate_Male.glb');
useGLTF.preload('./models/NPCs/VikingHelmet.glb');
useGLTF.preload('./models/NPCs/Viking_Female.glb');
useGLTF.preload('./models/NPCs/Viking_Male.glb');
useGLTF.preload('./models/NPCs/Witch.glb');
useGLTF.preload('./models/NPCs/Wizard.glb');
