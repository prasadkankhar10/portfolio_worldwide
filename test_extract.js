const fs = require('fs');
// Very naive GLTF parser to check node names
const buffer = fs.readFileSync('public/models/island_model.glb');
const gltfStr = buffer.toString('utf8');

// The JSON chunk is at the beginning of the GLB
const jsonStart = 20; // after header
let jsonStr = '';
for(let i = jsonStart; i < 500000; i++) {
  if (buffer[i] === 0x20 && buffer[i-1] === 0x4E && buffer[i-2] === 0x4F && buffer[i-3] === 0x53 && buffer[i-4] === 0x4A) {
    // found JSON chunk header
  }
}

// Easier: just parse it with a fast string match to find node names with "path" and their translation/matrix
const nodesRegex = /"nodes":\[([^\]]+)\]/;
const match = gltfStr.match(/"nodes":\[(.*?)\]/);
// This is too hard to parse raw GLB in JS. Let's just use `three` if it's installed.
