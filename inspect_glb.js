import fs from 'fs';

function inspectGlb(filePath) {
    // Read the file as buffer
    const buffer = fs.readFileSync(filePath);

    // GLB format: 
    // byte 0-3: magic ('glTF')
    // byte 4-7: version
    // byte 8-11: length
    
    // Chunk 0: JSON chunk
    // byte 12-15: chunk 0 length
    // byte 16-19: chunk 0 type ('JSON')
    // byte 20..20+length: JSON data
    
    const chunk0Length = buffer.readUInt32LE(12);
    const chunk0Type = buffer.toString('utf8', 16, 20);
    
    if (chunk0Type !== 'JSON') {
        console.error('First chunk is not JSON');
        return;
    }
    
    const jsonStr = buffer.toString('utf8', 20, 20 + chunk0Length);
    const gltf = JSON.parse(jsonStr);
    
    const meshes = gltf.meshes ? gltf.meshes.map(m => m.name).filter(n => n && n.toLowerCase().includes('farm')) : [];
    const nodes = gltf.nodes ? gltf.nodes.map(n => n.name).filter(n => n && n.toLowerCase().includes('farm')) : [];
    
    console.log("Found Farm Meshes:", meshes);
    console.log("Found Farm Nodes:", nodes);
}

inspectGlb('./public/models/island_model.glb');
