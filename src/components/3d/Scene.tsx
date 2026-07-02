import { Physics } from '@react-three/rapier';
import { Environment as DreiEnvironment, Stats, Sky } from '@react-three/drei';
import { EffectComposer, Outline, Selection } from '@react-three/postprocessing';
import { Environment } from './Environment';
import { Character } from './Character';
import { Birds } from './Birds';
import { Fireflies } from './Fireflies';
import { FreeCamManager } from './FreeCam';
import { ClericNPC } from './ClericNPC';
import { BlueSoldierFemaleNPC } from './BlueSoldierFemaleNPC';
import { BlueSoldierMaleNPC } from './BlueSoldierMaleNPC';
import { Casual3FemaleNPC } from './Casual3FemaleNPC';
import { Casual3MaleNPC } from './Casual3MaleNPC';
import { CowboyFemaleNPC } from './CowboyFemaleNPC';
import { CowboyHairNPC } from './CowboyHairNPC';
import { CowboyMaleNPC } from './CowboyMaleNPC';
import { ElfNPC } from './ElfNPC';
import { GoblinFemaleNPC } from './GoblinFemaleNPC';
import { GoblinMaleNPC } from './GoblinMaleNPC';
import { KnightGoldenFemaleNPC } from './KnightGoldenFemaleNPC';
import { KnightGoldenMaleNPC } from './KnightGoldenMaleNPC';
import { KnightMaleNPC } from './KnightMaleNPC';
import { PirateFemaleNPC } from './PirateFemaleNPC';
import { PirateMaleNPC } from './PirateMaleNPC';
import { VikingHelmetNPC } from './VikingHelmetNPC';
import { VikingFemaleNPC } from './VikingFemaleNPC';
import { VikingMaleNPC } from './VikingMaleNPC';
import { WitchNPC } from './WitchNPC';
import { WizardNPC } from './WizardNPC';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export const Scene = () => {
  const hasStarted = useGameStore((state) => state.hasStarted);
  const activeOutlineMesh = useGameStore((state) => state.activeOutlineMesh);

  return (
    <>
      {/* Postprocessing for Interactive Outlines */}
      <EffectComposer multisampling={8} autoClear={false}>
        <Outline 
           selection={activeOutlineMesh ? [activeOutlineMesh] : []}
           blur 
           visibleEdgeColor="white" 
           hiddenEdgeColor="white" 
           edgeStrength={3} 
        />
      </EffectComposer>

      {/* Stylized Peach Sky Background */}
      <color attach="background" args={['#ffb07c']} />
      
      {/* Fog to blend the edges of the island smoothly into the horizon */}
      <fog attach="fog" args={['#ffb07c', 150, 600]} />

      {/* HDRI Image-Based Lighting (Invisible) */}
      <DreiEnvironment preset="sunset" background={false} />

      <Physics debug={false}>
        <Environment />
        {hasStarted && <Character />}
        
        {/* AI NPCs */}
        <ClericNPC roleName="Cleric" startPosition={new THREE.Vector3(5, 3.1, 10)} dialogId="cleric_ai_1" />
        
        <BlueSoldierFemaleNPC startPosition={new THREE.Vector3(10, 30, -10)} dialogId="world_guide_1" />
        <BlueSoldierMaleNPC startPosition={new THREE.Vector3(-10, 30, 10)} dialogId="world_guide_1" />
        <Casual3FemaleNPC startPosition={new THREE.Vector3(15, 30, 5)} />
        <Casual3MaleNPC startPosition={new THREE.Vector3(-15, 30, -5)} />
        <CowboyFemaleNPC startPosition={new THREE.Vector3(84, 30, 58)} maxWanderRadius={15} dialogId="cowboy_events_1" />
        <CowboyHairNPC startPosition={new THREE.Vector3(25, 30, 0)} />
        <CowboyMaleNPC startPosition={new THREE.Vector3(84, 30, 58)} maxWanderRadius={15} dialogId="cowboy_events_1" />
        <ElfNPC startPosition={new THREE.Vector3(5, 30, 25)} dialogId="elf_tech_1" />
        <GoblinFemaleNPC startPosition={new THREE.Vector3(-5, 30, -25)} dialogId="goblin_game_1" />
        <GoblinMaleNPC startPosition={new THREE.Vector3(0, 30, -30)} dialogId="goblin_game_1" />
        <KnightGoldenFemaleNPC startPosition={new THREE.Vector3(30, 30, 10)} dialogId="knight_academics_1" />
        <KnightGoldenMaleNPC startPosition={new THREE.Vector3(-30, 30, -10)} dialogId="knight_academics_1" />
        <KnightMaleNPC startPosition={new THREE.Vector3(10, 30, 30)} />
        <PirateFemaleNPC startPosition={new THREE.Vector3(-10, 30, -30)} dialogId="pirate_web_1" />
        <PirateMaleNPC startPosition={new THREE.Vector3(0, 30, 40)} dialogId="pirate_web_1" />
        <VikingHelmetNPC startPosition={new THREE.Vector3(40, 30, 0)} />
        <VikingFemaleNPC startPosition={new THREE.Vector3(-40, 30, 0)} />
        <VikingMaleNPC startPosition={new THREE.Vector3(20, 30, 20)} />
        <WitchNPC startPosition={new THREE.Vector3(-20, 30, -20)} dialogId="witch_creative_1" />
        <WizardNPC startPosition={new THREE.Vector3(0, 30, 15)} dialogId="wizard_intro_1" />
      </Physics>

      {/* Free Camera Mode */}
      <FreeCamManager />

      {/* Procedural Wildlife */}
      <Birds count={50} />
      <Fireflies count={150} />

      {/* Performance Monitor */}
      <Stats />
    </>
  );
};
