const fs = require('fs');
const file = 'src/components/3d/Scene.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('Bvh')) {
  c = c.replace(/import { Environment as DreiEnvironment, Stats, Sky } from '@react-three\/drei';/, "import { Environment as DreiEnvironment, Stats, Sky, Bvh } from '@react-three/drei';");
  c = c.replace(/<Suspense fallback={null}>/, "<Suspense fallback={null}>\n        <Bvh firstHitOnly>");
  c = c.replace(/<\/Suspense>/, "        </Bvh>\n      </Suspense>");
}

fs.writeFileSync(file, c);
