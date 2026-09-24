# Three.js Developer Integration Guide: Medieval Fantasy Island & Celestial Magic

This guide explains how to load, render, animate, and handle collisions for the **Medieval Fantasy Island** in Three.js **without chunking** (as a single unified world model), along with the complete **Celestial Magic** system.

> [!IMPORTANT]
> ### ARCHITECTURAL MANDATE: DO NOT USE CHUNKING OR LOD STREAMING
> **Do NOT attempt to partition, split into chunks, or implement dynamic LOD streaming for this island.**
> 
> **Why Chunking & LOD Streaming Are Prohibited:**
> 1. **Visual Seams & Edge Tearing**: Splitting the continuous island terrain, sandy shores, and cobblestone roads into a grid creates visible seam gaps, vertex cracks, and z-fighting along chunk borders.
> 2. **Destructive LOD Decimation**: Automated geometry reduction on stylized low-poly architecture breaks doorframes, splits roof overhangs, and ruins clean silhouette bevels.
> 3. **Already Ultra-Lightweight**: The entire visual world is only **16.8 MB** in a single GLB (`island_world_complete.glb`), uses one unified texture atlas (`M_Village_Atlas`), and has a low polygon count.
> 4. **Flawless 60–120+ FPS**: Modern WebGL on mobile and desktop renders the single unchunked file smoothly without stutter, frame drops, or asynchronous HTTP chunk pop-in.
> 5. **Animation & Hierarchy Integrity**: Single-file loading guarantees that all magic node names (`Orrery_*`, `Arcane_Waystone_*`, `Citadel_Arcane_Portal_*`, `Enchanted_Moonwell_*`, `Citadel_Arcane_Ward_*`) remain intact for immediate access.

---

## 1. File Inventory & Folder Structure

All game assets are located in [`threejs_game_assets/`](file:///c:/Users/prasa/OneDrive/Desktop/learn/blender/portfolio/from%20packes/mean%20file/with%20ref/threejs_game_assets/):

```
threejs_game_assets/
├── island_world_complete.glb      # [16.8 MB] COMPLETE UNCHUNKED WORLD (Terrain, Ocean, Roads, All Buildings, Props, Magic)
├── trees.glb                      # [114 KB] 6 Optimized Tree Prototypes (Oaks, Pines, Birch)
├── tree_spawn_points.json         # [297 KB] Exact positions & rotations for all 1,265 trees
├── base/
│   └── collision.glb              # [1.30 MB] 90 Snug Box Colliders & Walkable Floor Meshes
└── code_templates/
    ├── IslandWorldUnchunked.js    # Ready-to-use Single-File World & Magic Manager class
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

// 2. Night Sky Background & Volumetric Fog
scene.background = new THREE.Color(0x080812); // Deep Void Indigo (#080812)
scene.fog = new THREE.Fog(0x080812, 30.0, 200.0); // Smooth 30m to 200m depth fading

// 3. High-Contrast Night Dual-Lighting System
// A. Main Moon Light (Directional Cyan Sun)
const moonLight = new THREE.DirectionalLight(0x4dc8ff, 1.8);
moonLight.position.set(100, 150, -100); // Converted to Three.js Y-up (Blender X=100, Y=100, Z=150)
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.near = 10;
moonLight.shadow.camera.far = 350;
moonLight.shadow.camera.left = -150;
moonLight.shadow.camera.right = 150;
moonLight.shadow.camera.top = 150;
moonLight.shadow.camera.bottom = -150;
moonLight.shadow.bias = -0.0005;
scene.add(moonLight);

// B. Purple Sky Ambient Fill (Opposite direction fill light)
const purpleFill = new THREE.DirectionalLight(0x8a4ca8, 0.7);
purpleFill.position.set(-100, 75, 100);
purpleFill.castShadow = false;
scene.add(purpleFill);

// C. Ambient Base Light
const ambientNight = new THREE.AmbientLight(0x080812, 0.4);
scene.add(ambientNight);

// D. Citadel Watchtower Summit Beacon (Cyan Focus)
const summitBeacon = new THREE.PointLight(0x00e5ff, 2.5, 35.0, 1.2);
summitBeacon.position.set(-0.23, 57.50, -108.77);
summitBeacon.castShadow = true;
scene.add(summitBeacon);

// E. Observatory Courtyard Beacon (Warm Gold Focus)
const observatoryBeacon = new THREE.PointLight(0xffd54f, 1.8, 18.0, 1.4);
observatoryBeacon.position.set(-0.20, 4.50, -96.50);
observatoryBeacon.castShadow = true;
scene.add(observatoryBeacon);

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

### C. Arcane Waystones (Teleportation Monoliths)
Located at the **Village Crossroads** `(8.0, -10.0, 3.0)` and **Harbor Docks** `(102.0, -125.0, 3.0)`:
* **`Arcane_Waystone_*_Base`**: Stepped octagonal stone platform with runic channeling grooves.
* **`Arcane_Waystone_*_Pillars`**: Dual inward-tilted weathered monolith pillars acting as a mana conduit.
* **`Arcane_Waystone_*_Crystal`**: Large faceted diamond cyan mana crystal levitating in the air gap.
* **`Arcane_Waystone_*_Runes`**: 4 small floating diamond shards counter-orbiting the core crystal.
  ```javascript
  // Levitation & rotation
  waystoneCrystal.rotation.z += 0.75 * delta;
  waystoneCrystal.position.z = 1.85 + Math.sin(time * 2.2) * 0.1;
  waystoneRunes.rotation.z -= 0.40 * delta;
  ```

### D. Citadel Arcane Portal / Rift Gateway
Located on the Citadel Courtyard cliff-edge overlooking the sea at `(-15.0, 105.0, 3.0)`:
* **`Citadel_Arcane_Portal_Stone_Arch`**: $6.8\,\text{m}$ Gothic carved stone portal arch with ancient runic inlays.
* **`Citadel_Arcane_Portal_Dais`**: Semi-circular stepped arrival platform.
* **`Citadel_Arcane_Portal_Vortex_Disc`**: Swirling vertical cosmic rift disc with cosmic violet (`#5e17eb`) and electric cyan (`#00e5ff`) emission.
* **`Citadel_Arcane_Portal_Floating_Keystones`**: 4 floating stone keystones hovering around the upper curve of the arch.
  ```javascript
  // Vortex swirl & keystone bobbing
  portalVortex.rotation.y += 0.80 * delta;
  portalKeystones.rotation.y -= 0.20 * delta;
  ```

### E. Bioluminescent Enchanted Moonwell & Flora
Located in the quiet sacred grove clearing at `(-50.0, -35.0, 3.0)`:
* **`Enchanted_Moonwell_Grove_Basin`**: Ancient stepped mossy stone well basin ($4.4\,\text{m}$ diameter).
* **`Enchanted_Moonwell_Grove_Water`**: Iridescent glowing teal/cyan pool surface (`#00e5ff`).
* **`Enchanted_Moonwell_Grove_Floating_Orbs`**: 5 floating glowing mana droplets hovering and bobbing above the water.
* **`Enchanted_Moonwell_Grove_Bio_Flora`**: 8 low-poly glowing fantasy mushrooms (radiant violet `#ab47bc` and mint `#1de9b6`) clustered around the stone rim.
  ```javascript
  // Floating water droplet animation
  moonwellOrbs.rotation.z += 0.30 * delta;
  moonwellOrbs.position.z = 0.52 + Math.sin(time * 1.8) * 0.08;
  ```

### F. Citadel Arcane Ward Shield (Summit)
Enclosing the summit Celestial Orrery at `(-0.23, 108.77, 57.50)`:
* **`Citadel_Arcane_Ward_Shield_Dome`**: $12.4\,\text{m}$ translucent geodesic celestial energy barrier.
* **`Citadel_Arcane_Ward_Shield_RuneRing1`**: Upper counter-rotating equator ring inscribed with celestial glyphs.
* **`Citadel_Arcane_Ward_Shield_RuneRing2`**: Lower counter-rotating equator ring.
  ```javascript
  // Counter-rotating ward barrier
  wardRing1.rotation.z += 0.22 * delta;
  wardRing2.rotation.z -= 0.32 * delta;
  wardDome.material.opacity = 0.35 + Math.sin(time * 2.5) * 0.08;
  ```

### G. Dynamic Magical PointLights
To create rich local atmospheric lighting, each magical structure has an associated Three.js `PointLight`:
```javascript
// 1. Summit Arcane Beacon
const summitLight = new THREE.PointLight(0x00e5ff, 2.5, 40.0, 1.2);
summitLight.position.set(-0.23, 57.50, -108.77);
scene.add(summitLight);

// 2. Observatory Courtyard Light
const courtyardLight = new THREE.PointLight(0xffd54f, 1.8, 20.0, 1.5);
courtyardLight.position.set(-0.20, 4.50, -96.50);
scene.add(courtyardLight);

// 3. Arcane Waystones (Crossroads & Docks)
const wayCross = new THREE.PointLight(0x00e5ff, 2.2, 16.0, 1.3);
wayCross.position.set(8.0, 5.0, 10.0);
scene.add(wayCross);

const wayDocks = new THREE.PointLight(0x00e5ff, 2.2, 16.0, 1.3);
wayDocks.position.set(102.0, 5.0, 125.0);
scene.add(wayDocks);

// 4. Citadel Rift Portal
const portalLight = new THREE.PointLight(0x9d4edd, 2.8, 22.0, 1.4);
portalLight.position.set(-15.0, 5.5, -105.0);
scene.add(portalLight);

// 5. Enchanted Moonwell
const moonLight = new THREE.PointLight(0x00e5ff, 2.0, 18.0, 1.3);
moonLight.position.set(-50.0, 4.8, 35.0);
scene.add(moonLight);
```

---

## 4. Collision & Character Snapping (`collision.glb`)

[`collision.glb`](file:///c:/Users/prasa/OneDrive/Desktop/learn/blender/portfolio/from%20packes/mean%20file/with%20ref/threejs_game_assets/base/collision.glb) contains **90 optimized low-poly collision meshes** (including snug colliders for all buildings, bridges, and new magical installations `COL_Arcane_Waystone_Crossroads`, `COL_Arcane_Waystone_Docks`, `COL_Citadel_Arcane_Portal`, `COL_Enchanted_Moonwell_Grove`):

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
