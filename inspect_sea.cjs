const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, 'public/models/island_model.glb');
const buffer = fs.readFileSync(glbPath);

const chunkLength = buffer.readUInt32LE(12);
const jsonChunk = buffer.subarray(20, 20 + chunkLength);
const gltf = JSON.parse(jsonChunk.toString('utf8'));

let seaNode = null;
if (gltf.nodes) {
  gltf.nodes.forEach(node => {
    if (node.name && node.name === 'sea') {
      seaNode = node;
    }
  });
}

console.log("Sea Node Details:");
console.log(JSON.stringify(seaNode, null, 2));
