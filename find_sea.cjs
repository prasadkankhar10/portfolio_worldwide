const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, 'public/models/island_model.glb');
const buffer = fs.readFileSync(glbPath);

// The GLB format starts with a 12-byte header.
// After the header, the JSON chunk starts.
const chunkLength = buffer.readUInt32LE(12);
const jsonChunk = buffer.subarray(20, 20 + chunkLength);

const gltf = JSON.parse(jsonChunk.toString('utf8'));

console.log("Searching for 'sea' in GLTF nodes/meshes...");

const matches = [];

if (gltf.nodes) {
  gltf.nodes.forEach(node => {
    if (node.name && node.name.toLowerCase().includes('sea')) {
      matches.push(node.name);
    }
  });
}

if (gltf.meshes) {
  gltf.meshes.forEach(mesh => {
    if (mesh.name && mesh.name.toLowerCase().includes('sea')) {
      matches.push('Mesh: ' + mesh.name);
    }
  });
}

console.log("Found:", matches);
