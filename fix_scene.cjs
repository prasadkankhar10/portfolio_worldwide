const fs = require('fs');
const file = 'src/components/3d/Scene.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('import { BuildingTrigger }')) {
  c = c.replace(/import { NpcChatSystem } from '.\/NpcChatSystem';/, "import { NpcChatSystem } from './NpcChatSystem';\nimport { BuildingTrigger } from './BuildingTrigger';");
}

if (!c.includes('const isMobile = useGameStore')) {
  c = c.replace(/const activeOutlineMesh = useGameStore[^\n]*\n/, "const activeOutlineMesh = useGameStore((state) => state.activeOutlineMesh);\n  const isMobile = useGameStore((state) => state.isMobile);\n");
}

if (!c.includes('!isMobile && (')) {
  c = c.replace(/<EffectComposer multisampling={0} autoClear={false}>/, "{!isMobile && (\n        <EffectComposer multisampling={0} autoClear={false}>");
  c = c.replace(/<\/EffectComposer>/, "</EffectComposer>\n      )}");
}

if (!c.includes('<BuildingTrigger')) {
  c = c.replace(/<NpcChatSystem \/>/, "<NpcChatSystem />\n      {/* Building Triggers */}\n      <BuildingTrigger position={[115, 3, 0]} radius={15} dialogId=\"building_test_1\" />\n");
}

fs.writeFileSync(file, c);
