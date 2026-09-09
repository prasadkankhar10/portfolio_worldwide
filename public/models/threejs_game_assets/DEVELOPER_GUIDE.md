# Medieval Island - Three.js Technical Integration & Developer Guide

Welcome to the **Medieval Island 3D Asset Package**. This guide provides everything a Three.js developer needs to integrate, stream, and render the complete island world with high framerates (60–120+ FPS) on desktop and mobile browsers.

---

## 1. Executive Overview

This environment has been fully restructured, optimized, and packaged for production web games:
- **Draw Call Reduction (99.3% cut)**: 1,551 individual loose mesh models were batched into unified static chunk meshes. Draw calls dropped from **1,500+ down to ~30–50**.
- **Physics Geometry Reduction (93% cut)**: Collision meshes were reduced from **34,535 vertices down to 2,433 vertices**. Fences and walls now use lightweight, convex collision volumes.
- **Level of Detail (THREE.LOD)**: Every chunk has 3 pre-built LOD tiers (`lod0`, `lod1`, `lod2`), reducing far-distance vertex processing by **over 75%**.
- **Repaired Geometry & Shading**: Fixed all backward-facing polygons, missing road sections, and split normals on roads and buildings.

---

## 2. Directory Structure & Asset Inventory

```
threejs_game_assets/
├── base/
│   ├── persistent_base.glb    # (0.66 MB) Island ground (Cube.003), ocean, and paved road network
│   └── collision.glb          # (0.16 MB) 72 simplified collision proxies for physics engines
├── chunks_standard/           # (21.85 MB) Plug-and-play standard batched GLBs (1 per chunk)
│   ├── chunk_0_0.glb          # Northwest Bastion & ramparts
│   ├── chunk_0_1.glb          # Town Center & Blacksmith
│   ├── chunk_0_2.glb          # Northeast Pine Forest
│   ├── chunk_1_0.glb          # West Hillside & Temple Ruins
│   ├── chunk_1_1.glb          # Market Square & Residential District
│   ├── chunk_1_2.glb          # North Watchtower & Cobblestone Courtyard
│   ├── chunk_2_0.glb          # Farmland, Windmill, & Harbor/Port
│   ├── chunk_2_1.glb          # South Residential Housing
│   └── chunk_2_2.glb          # Southeast Outer Gatehouse
├── chunks_lod/                # (37.65 MB) 3-tier LOD assets for dynamic distance streaming
│   ├── lod0/                  # High detail (Player distance: 0 – 55m)
│   ├── lod1/                  # Medium detail (Player distance: 55 – 130m, ~40% geometry)
│   └── lod2/                  # Low detail horizon (Player distance: 130m+, ~15% geometry)
├── code_templates/
│   ├── IslandWorld.js         # Complete Three.js world manager with LOD and windmill rotation
│   └── CollisionManager.js    # Ground snapping & obstacle raycasting physics helper
└── DEVELOPER_GUIDE.md         # This technical documentation
```

---

## 3. World Coordinate System & 3x3 Grid Layout

### Dimensions & Scale
- **Scale**: `1 unit = 1 meter`.
- **World Origin `(0, 0, 0)`**: Located at the center of the island town square.
- **Total Island Footprint**: $270\,\text{m} \times 270\,\text{m}$ ($X \in [-135, +135]$, $Z \in [-135, +135]$ in Three.js).
- **Elevation ($Y$-axis in Three.js)**:
  - Ocean water level: $Y \approx 2.47\,\text{m}$
  - Terrain grass surface: $Y = 3.00\,\text{m}$
  - Paved stone roads: $Y = 3.03\,\text{m}$ (smoothly flush over grass)

### 3x3 Chunk Grid Layout
The island is divided into a $3 \times 3$ grid of $90\,\text{m} \times 90\,\text{m}$ chunks:

```
        NORTH (Three.js -Z)
  ┌──────────────┬──────────────┬──────────────┐
  │  Chunk_0_2   │  Chunk_1_2   │  Chunk_2_2   │
  │ (NE Forest)  │(Watch Tower) │  (SE Gate)   │
  ├──────────────┼──────────────┼──────────────┤
W │  Chunk_0_1   │  Chunk_1_1   │  Chunk_2_1   │ E
E │(Town Center) │ (Market Sq.) │(South Houses)│ A
S ├──────────────┼──────────────┼──────────────┤ S
T │  Chunk_0_0   │  Chunk_1_0   │  Chunk_2_0   │ T
  │ (NW Bastion) │ (West Ruins) │(Farm & Port) │
  └──────────────┴──────────────┴──────────────┘
        SOUTH (Three.js +Z)
```

> **Note on Coordinate Axes**:
> In glTF and Three.js, **$+Y$ is UP**, $+X$ is EAST, and $-Z$ is NORTH.
> All assets have their world transforms applied to origin `(0, 0, 0)`. When loading any chunk GLB, simply add it directly to `scene` or a root group without needing to adjust position or rotation.

---

## 4. How to Implement in Three.js

### Approach A: Dynamic Level-of-Detail Streaming (`THREE.LOD`) — Recommended
Use `threejs_game_assets/code_templates/IslandWorld.js`:

```javascript
import * as THREE from 'three';
import { IslandWorld } from './threejs_game_assets/code_templates/IslandWorld.js';

// 1. Setup Three.js scene & camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

// 2. Initialize Island World
const island = new IslandWorld(scene, camera, './threejs_game_assets/');
await island.init();

// 3. Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Updates windmill blade rotation
  island.update(delta);

  // Three.js automatically swaps LOD0 -> LOD1 -> LOD2 based on distance!
  renderer.render(scene, camera);
}
animate();
```

### Approach B: Simple Static Loading (Standard Chunks)
If your game does not need distance LODs, load the pre-batched files from `chunks_standard/`:

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

// Load persistent base
loader.load('./threejs_game_assets/base/persistent_base.glb', (gltf) => {
  scene.add(gltf.scene);
});

// Load the 9 chunks
for (let cy = 0; cy < 3; cy++) {
  for (let cx = 0; cx < 3; cx++) {
    loader.load(`./threejs_game_assets/chunks_standard/chunk_${cx}_${cy}.glb`, (gltf) => {
      scene.add(gltf.scene);
    });
  }
}
```

---

## 5. Collision & Physics Integration (`collision.glb`)

`collision.glb` contains 72 simplified convex colliders covering all buildings, walls, and terrain.

### How to Use with Raycasting
Use `threejs_game_assets/code_templates/CollisionManager.js`:

```javascript
import { CollisionManager } from './threejs_game_assets/code_templates/CollisionManager.js';

const collisions = new CollisionManager(scene, './threejs_game_assets/');
await collisions.load();

// Snapping character to terrain height in your character controller:
function updatePlayer(player) {
  const floorY = collisions.getGroundHeight(player.position);
  if (floorY !== null) {
    player.position.y = floorY; // Player stands cleanly on ground
  }

  // Check horizontal collision ahead:
  const isBlocked = collisions.checkObstacle(player.position, player.moveDirection, 0.6);
  if (!isBlocked) {
    player.position.addScaledVector(player.moveDirection, player.speed);
  }
}
```

---

## 6. Dynamic Objects & Animation

### Windmill Fan Blades (`wind_fan`)
- **Location**: Located in `chunk_2_0.glb` atop the windmill at $(X=72.64, Y=11.83, Z=-52.32)$.
- **Mesh Separation**: Kept as an independent mesh named `wind_fan` (not merged into the static background).
- **Rotation Axis**: Centered on its drive shaft. Rotate on the local $Y$-axis (or $Z$-axis depending on glTF rotation) to spin the sails:
  ```javascript
  // Handled automatically in IslandWorld.js:
  windFanMesh.rotation.y += speed * delta;
  ```

---

## 7. Renderer & Engine Best Practices

To get the best visual quality and performance matching Blender:

```javascript
// Color management
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Sunlight configuration
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(100, 150, 80);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 350;
sunLight.shadow.camera.left = -140;
sunLight.shadow.camera.right = 140;
sunLight.shadow.camera.top = 140;
sunLight.shadow.camera.bottom = -140;
scene.add(sunLight);

// Soft ambient light
const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x443322, 1.2);
scene.add(ambientLight);
```
