# Three.js Developer Integration Guide: Medieval Fantasy Island & Celestial Magic

This guide explains how to load, render, animate, and handle collisions for the **Medieval Fantasy Island** in Three.js **without chunking** (as a single unified world model), along with the complete **Celestial Magic** system.

---

## 1. File Inventory & Folder Structure

All game assets are located in [`threejs_game_assets/`](file:///c:/Users/prasa/OneDrive/Desktop/learn/blender/portfolio/from%20packes/mean%20file/with%20ref/threejs_game_assets/):

```
threejs_game_assets/
├── island_world_complete.glb      # [16.7 MB] COMPLETE UNCHUNKED WORLD (Terrain, Ocean, Roads, All Buildings, Props, Orrery)
├── island_model_unchunked.glb     # [16.7 MB] Legacy alias to the complete unchunked model
├── trees.glb                      # [114 KB] 6 Optimized Tree Prototypes (Oaks, Pines, Birch)
├── tree_spawn_points.json         # [154 KB] Exact positions & rotations for all 1,265 trees
├── base/
│   ├── collision.glb              # [1.05 MB] 86 Snug Box Colliders & Walkable Floor Meshes
│   └── persistent_base.glb        # [688 KB] Isolated Terrain & Ocean Base (optional)
└── code_templates/
    ├── IslandWorldUnchunked.js     # Ready-to-use Single-File World & Magic Manager class
    ├── IslandWorld.js             # Chunked LOD streaming manager (optional alternative)
    └── CollisionManager.js        # Physics raycaster & floor-snapping handler
```

---

## 2. Quick Start: 30-Second Setup (Unchunked)

Install Three.js (r150+) and import [`IslandWorldUnchunked.js`](file:///c:/Users/prasa/OneDrive/Desktop/learn/blender/portfolio/from%20packes/mean%20file/with%20ref/threejs_game_assets/code_templates/IslandWorldUnchunked.js):

```javascript
import * as THREE from 'three';
import { IslandWorldUnchunked } from './threejs_game_assets/code_templates/IslandWorldUnchunked.js';

// 1. Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Tone Mapping & Color Space (Crucial for authentic vibrant colors)
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 2. Sunlight & Ambient Lighting
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 1.2);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
sunLight.position.set(60, 100, 40);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 300;
sunLight.shadow.camera.left = -150;
sunLight.shadow.camera.right = 150;
sunLight.shadow.camera.top = 150;
sunLight.shadow.camera.bottom = -150;
scene.add(sunLight);

// 3. Load the Unchunked World
const world = new IslandWorldUnchunked(scene, camera, './threejs_game_assets/');
await world.load();

// Position camera overlooking the Citadel Watchtower
camera.position.set(0, 70, 140);
camera.lookAt(0, 30, -50);

// 4. Render Loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  
  // Updates all magic animations (Orrery rings, Runes, Crystal bobbing, Windmill)
  world.update(delta);
  
  renderer.render(scene, camera);
}
animate();
```

---

## 3. Celestial Magic System & Animations

The magical centerpiece of the island is the **51-meter Citadel Watchtower** and its surrounding stone promenade (`Path_Straight.001`).

### A. The Grand Summit Celestial Orrery
Suspended directly above the watchtower roof ridge ($Z = 57.50\,\text{m}$ in Blender / $Y = 57.50\,\text{m}$ in Three.js):

| Object Name in GLB | Description | Three.js Animation Logic |
| :--- | :--- | :--- |
| **`Orrery_Ring_Outer`** | $5.2\,\text{m}$ brass ring with golden Sun sphere | `ringOuter.rotation.z += 0.35 * delta` |
| **`Orrery_Ring_Mid`** | $4.0\,\text{m}$ brass ring angled at $45^\circ$ with silver Moon | `ringMid.rotation.x += 0.55 * delta` |
| **`Orrery_Ring_Inner`** | $2.8\,\text{m}$ brass ring angled at $-45^\circ$ with azure Comet | `ringInner.rotation.y += 0.85 * delta` |
| **`Orrery_Core_Crystal`** | Faceted double-pyramid glowing arcane focus crystal | `crystal.rotation.z += 0.60 * delta`<br>`crystal.position.z = Math.sin(time * 2.0) * 0.12` |
| **`Orrery_Floating_Runes`** | 6 floating stone tablets with glowing inscribed runes | `runes.rotation.z -= 0.25 * delta` (counter-orbit) |

### B. The Ground Observatory Sanctum
Located in the lawn at $(-0.20, 96.50, 3.00)$ inside the circular stone promenade:
* **`Observatory_Dais`**: Stepped octagonal stone pedestal platform ($5.2\,\text{m}$ across) with star-chart carvings.
* **`Observatory_Armillary`**: Fluted stone column mounted with an intricate brass armillary sphere and miniature terrestrial globe.
* **`Observatory_Telescope`**: Polished dark timber tripod holding a brass refractor telescope ($1.8\,\text{m}$ long) pointed upward at $42^\circ$ toward the stars.
* **`Observatory_Runestones`**: 4 floating runestones orbiting the dais at waist height:
  ```javascript
  observatoryRunes.rotation.z += 0.45 * delta;
  ```

### C. Magical Lighting & Emissive Glow
To make the arcane crystal and runestones glow at night, apply soft point lights:
```javascript
// Summit Arcane Crystal PointLight (Cyan Beacon)
const summitLight = new THREE.PointLight(0x00e5ff, 2.5, 40.0, 1.2);
summitLight.position.set(-0.23, 57.50, -108.77); // Three.js Y-up mapping
scene.add(summitLight);

// Ground Observatory Courtyard Light (Warm Gold)
const courtyardLight = new THREE.PointLight(0xffd54f, 1.8, 20.0, 1.5);
courtyardLight.position.set(-0.20, 4.50, -96.50);
scene.add(courtyardLight);

// Subtle pulsing breathing effect in render loop
summitLight.intensity = 2.5 + Math.sin(time * 2.5) * 0.5;
```

---

## 4. Collision & Character Snapping (`collision.glb`)

[`collision.glb`](file:///c:/Users/prasa/OneDrive/Desktop/learn/blender/portfolio/from%20packes/mean%20file/with%20ref/threejs_game_assets/base/collision.glb) contains **86 optimized low-poly collision meshes**:

```javascript
model.traverse((child) => {
  if (child.isMesh) {
    const name = child.name.toLowerCase();
    if (name.includes('ground') || name.includes('path') || name.includes('road')) {
      // Floor elevation raycasting (snaps player feet to ground, roads, and promenade)
      groundMeshes.push(child);
    } else {
      // Horizontal obstacle checking (buildings, snug village square props, walls, fences)
      obstacleMeshes.push(child);
    }
  }
});
```

### Floor Elevation Snapping:
```javascript
function snapPlayerToFloor(playerPos) {
  raycaster.ray.origin.set(playerPos.x, playerPos.y + 5.0, playerPos.z);
  raycaster.ray.direction.set(0, -1, 0);
  const hits = raycaster.intersectObjects(groundMeshes, false);
  if (hits.length > 0) {
    playerPos.y = hits[0].point.y; // Snaps to terrain (Z=3.00) or Promenade (Z=3.025)
  }
}
```

---

## 5. Procedural Trees (`trees.glb` + `tree_spawn_points.json`)

To render all 1,265 trees with **60–120 FPS** in Three.js, spawn them using `THREE.InstancedMesh`:
* `trees.glb` contains 6 distinct low-poly tree models (Oaks, Pines, Birch).
* `tree_spawn_points.json` contains the exact matrix positions, rotations, and scales.
* The included [`IslandWorldUnchunked.js`](file:///c:/Users/prasa/OneDrive/Desktop/learn/blender/portfolio/from%20packes/mean%20file/with%20ref/threejs_game_assets/code_templates/IslandWorldUnchunked.js#L173-L220) automatically handles this in 1 single draw call!

---

## 6. Coordinate System Mapping Note

* **Blender**: $Z$ is Up, $Y$ is North, $X$ is East.
* **Three.js**: $Y$ is Up, $-Z$ is North, $X$ is East.
* Standard GLTF loaders automatically handle node transform conversion. If reading raw coordinates from JSON:
  $$\text{ThreeJS}(x, y, z) = (\text{Blender } x,\; \text{Blender } z,\; -\text{Blender } y)$$
