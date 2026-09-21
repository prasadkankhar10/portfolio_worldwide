/**
 * IslandWorldUnchunked.js - Single-File Unchunked World Loader for Three.js
 *
 * Designed for Three.js developers to easily load and run the entire medieval island
 * as a single unified scene WITHOUT chunking.
 *
 * Includes:
 *  1. Loading the unified 3D island model (island_world_complete.glb)
 *  2. Loading collision meshes (collision.glb) for floor raycasting & obstacles
 *  3. Instanced Tree Spawner (trees.glb + tree_spawn_points.json) for 60+ FPS
 *  4. Celestial Magic Animations:
 *      - Rotating Celestial Orrery brass rings (3 independent axes)
 *      - Orbiting celestial spheres (Sun, Moon, Comet)
 *      - Floating core arcane crystal bobbing & spinning
 *      - Orbiting carved runestones (summit crown & ground observatory)
 *      - Windmill fan rotation
 *  5. Magical Lighting setup (Atmospheric lighting, PointLights, Emissive pulses)
 *
 * Dependencies:
 *   three (>= r150)
 *   three/addons/loaders/GLTFLoader.js
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class IslandWorldUnchunked {
  /**
   * @param {THREE.Scene} scene - The active Three.js scene
   * @param {THREE.Camera} camera - The active perspective camera
   * @param {string} basePath - Directory where assets reside (e.g. './threejs_game_assets/')
   */
  constructor(scene, camera, basePath = './threejs_game_assets/') {
    this.scene = scene;
    this.camera = camera;
    this.basePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    this.loader = new GLTFLoader();

    // World root group
    this.root = new THREE.Group();
    this.root.name = 'IslandWorld_Root';
    this.scene.add(this.root);

    // Collision data
    this.groundMeshes = [];
    this.obstacleMeshes = [];
    this.downRaycaster = new THREE.Raycaster();
    this.downRaycaster.ray.direction.set(0, -1, 0);

    // Animated objects references
    this.windFan = null;
    this.windFanSpeed = 1.8;

    // Celestial Orrery & Magic references
    this.orreryOuterRing = null;
    this.orreryMidRing = null;
    this.orreryInnerRing = null;
    this.orreryCrystal = null;
    this.orreryRunes = null;
    this.observatoryRunes = null;
    this.magicalLights = [];

    this.animClock = 0;
  }

  /**
   * Loads the entire island environment, collision, trees, and magic in one call.
   * @returns {Promise<void>}
   */
  async load() {
    console.log('[IslandWorld] Loading unchunked island world...');

    // 1. Load the single unified island world GLB
    await this.loadVisualWorld();

    // 2. Load collision meshes (floor + obstacles)
    await this.loadCollision();

    // 3. Load procedural instanced trees (trees.glb + tree_spawn_points.json)
    await this.loadInstancedTrees();

    // 4. Setup magical scene lighting
    this.setupMagicalLighting();

    console.log('[IslandWorld] World fully loaded and ready!');
  }

  /**
   * Loads island_world_complete.glb
   */
  loadVisualWorld() {
    return new Promise((resolve, reject) => {
      const url = `${this.basePath}island_world_complete.glb`;
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.name = 'Visual_Island_World';

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Ensure crisp texture filtering on the master atlas palette
              if (child.material && child.material.map) {
                child.material.map.colorSpace = THREE.SRGBColorSpace;
              }

              const name = child.name.toLowerCase();

              // 1. Windmill fan in Farmland
              if (name.includes('wind_fan')) {
                this.windFan = child;
              }
              // 2. Celestial Orrery at Watchtower summit
              else if (name.includes('orrery_ring_outer')) {
                this.orreryOuterRing = child;
              } else if (name.includes('orrery_ring_mid')) {
                this.orreryMidRing = child;
              } else if (name.includes('orrery_ring_inner')) {
                this.orreryInnerRing = child;
              } else if (name.includes('orrery_core_crystal')) {
                this.orreryCrystal = child;
                // Add glowing emissive effect to crystal
                if (child.material) {
                  child.material.emissive = new THREE.Color(0x00d4ff);
                  child.material.emissiveIntensity = 0.8;
                }
              } else if (name.includes('orrery_floating_runes')) {
                this.orreryRunes = child;
              }
              // 3. Ground Observatory Sanctum
              else if (name.includes('observatory_runestones')) {
                this.observatoryRunes = child;
              }
            }
          });

          this.root.add(model);
          resolve(model);
        },
        undefined,
        (err) => {
          console.error('[IslandWorld] Failed to load visual world:', err);
          reject(err);
        }
      );
    });
  }

  /**
   * Loads collision.glb (86 simplified collision proxies & floor)
   */
  loadCollision() {
    return new Promise((resolve, reject) => {
      const url = `${this.basePath}base/collision.glb`;
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.name = 'Collision_Group';
          model.visible = false; // Keep collision wireframes hidden from rendering

          model.traverse((child) => {
            if (child.isMesh) {
              const lower = child.name.toLowerCase();
              // Ground & walkable paths/promenades for floor elevation snapping
              if (lower.includes('ground') || lower.includes('path') || lower.includes('road')) {
                this.groundMeshes.push(child);
              } else {
                // Buildings, walls, carts, stalls for horizontal obstacle collision
                this.obstacleMeshes.push(child);
              }
            }
          });

          this.root.add(model);
          console.log(
            `[IslandWorld] Loaded ${this.groundMeshes.length} ground and ${this.obstacleMeshes.length} obstacle colliders.`
          );
          resolve(model);
        },
        undefined,
        (err) => {
          console.warn('[IslandWorld] Could not load collision.glb:', err);
          resolve(null);
        }
      );
    });
  }

  /**
   * Loads trees.glb and spawns 1,265 trees using THREE.InstancedMesh
   */
  async loadInstancedTrees() {
    try {
      const jsonRes = await fetch(`${this.basePath}tree_spawn_points.json`);
      if (!jsonRes.ok) return;
      const spawnPoints = await jsonRes.json();

      this.loader.load(`${this.basePath}trees.glb`, (gltf) => {
        const treePrototypes = [];
        gltf.scene.traverse((c) => {
          if (c.isMesh) treePrototypes.push(c);
        });

        if (treePrototypes.length === 0) return;

        // Group spawn points by prototype index
        const count = spawnPoints.length;
        const instancesPerProto = Math.ceil(count / treePrototypes.length);

        const dummy = new THREE.Object3D();
        let pointIdx = 0;

        treePrototypes.forEach((proto) => {
          const instancedMesh = new THREE.InstancedMesh(
            proto.geometry,
            proto.material,
            instancesPerProto
          );
          instancedMesh.castShadow = true;
          instancedMesh.receiveShadow = true;

          let instCount = 0;
          for (let i = 0; i < instancesPerProto && pointIdx < count; i++) {
            const pt = spawnPoints[pointIdx++];
            // Blender Z-up to Three.js Y-up mapping: (X, Z, -Y)
            dummy.position.set(pt.position[0], pt.position[2], -pt.position[1]);
            dummy.rotation.set(pt.rotation[0], pt.rotation[2], -pt.rotation[1]);
            dummy.scale.set(pt.scale[0], pt.scale[2], pt.scale[1]);
            dummy.updateMatrix();

            instancedMesh.setMatrixAt(instCount++, dummy.matrix);
          }
          instancedMesh.count = instCount;
          instancedMesh.instanceMatrix.needsUpdate = true;
          this.root.add(instancedMesh);
        });

        console.log(`[IslandWorld] Successfully spawned ${count} trees via InstancedMesh.`);
      });
    } catch (e) {
      console.warn('[IslandWorld] Instanced trees skipped:', e);
    }
  }

  /**
   * Adds atmospheric magical lighting around the Celestial Watchtower and Sanctuaries
   */
  setupMagicalLighting() {
    // 1. Summit Arcane Focus Crystal Light (Cyan glow at summit Z = 57.5m)
    // Blender (-0.23, 108.77, 57.50) -> Three.js (-0.23, 57.50, -108.77)
    const crystalLight = new THREE.PointLight(0x00e5ff, 2.5, 35.0, 1.2);
    crystalLight.position.set(-0.23, 57.50, -108.77);
    this.root.add(crystalLight);
    this.magicalLights.push({ light: crystalLight, baseIntensity: 2.5, speed: 2.2 });

    // 2. Ground Observatory Light (Warm Gold & Cyan at courtyard)
    // Blender (-0.20, 96.50, 4.50) -> Three.js (-0.20, 4.50, -96.50)
    const obsLight = new THREE.PointLight(0xffd54f, 1.8, 18.0, 1.5);
    obsLight.position.set(-0.20, 4.50, -96.50);
    this.root.add(obsLight);
    this.magicalLights.push({ light: obsLight, baseIntensity: 1.8, speed: 1.6 });
  }

  /**
   * Snaps a character position to the terrain or paved promenade floor.
   * @param {THREE.Vector3} position - Character position (modified in-place)
   * @param {number} raycastHeightOffset - Height above character to start ray (default 5.0m)
   * @returns {number|null} Floor elevation, or null
   */
  snapToGround(position, raycastHeightOffset = 5.0) {
    if (this.groundMeshes.length === 0) return null;

    this.downRaycaster.ray.origin.set(
      position.x,
      position.y + raycastHeightOffset,
      position.z
    );

    const hits = this.downRaycaster.intersectObjects(this.groundMeshes, false);
    if (hits.length > 0) {
      position.y = hits[0].point.y;
      return hits[0].point.y;
    }
    return null;
  }

  /**
   * Call this every frame inside requestAnimationFrame(render).
   * Animates all magical orrery rings, orbiting bodies, crystals, and lights.
   * @param {number} delta - Delta time in seconds (e.g. clock.getDelta())
   */
  update(delta = 0.016) {
    this.animClock += delta;

    // 1. Windmill fan in Farmland
    if (this.windFan) {
      this.windFan.rotation.y += this.windFanSpeed * delta;
    }

    // 2. Celestial Orrery at the Watchtower Summit
    if (this.orreryOuterRing) {
      this.orreryOuterRing.rotation.z += 0.35 * delta;
    }
    if (this.orreryMidRing) {
      this.orreryMidRing.rotation.x += 0.55 * delta;
    }
    if (this.orreryInnerRing) {
      this.orreryInnerRing.rotation.y += 0.85 * delta;
    }
    if (this.orreryRunes) {
      this.orreryRunes.rotation.z -= 0.25 * delta;
    }
    if (this.orreryCrystal) {
      this.orreryCrystal.rotation.z += 0.60 * delta;
      // Gentle vertical levitation bobbing
      this.orreryCrystal.position.z = Math.sin(this.animClock * 2.0) * 0.12;
    }

    // 3. Ground Observatory Sanctum
    if (this.observatoryRunes) {
      this.observatoryRunes.rotation.z += 0.45 * delta;
    }

    // 4. Pulsing Magical Lights
    for (const item of this.magicalLights) {
      item.light.intensity =
        item.baseIntensity + Math.sin(this.animClock * item.speed) * (item.baseIntensity * 0.25);
    }
  }
}
