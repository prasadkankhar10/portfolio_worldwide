/**
 * IslandWorld.js - Three.js Modular Island World Manager
 *
 * Handles:
 *  1. Persistent Base loading (Island terrain, ocean, unified road network)
 *  2. 3x3 Dynamic Chunk Loading with THREE.LOD (LOD0, LOD1, LOD2)
 *  3. Dynamic windmill fan animation (wind_fan in Chunk 2_0)
 *  4. Chunk streaming and memory disposal
 *
 * Dependencies:
 *   three (>= r150)
 *   three/addons/loaders/GLTFLoader.js
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class IslandWorld {
  /**
   * @param {THREE.Scene} scene - The active Three.js scene
   * @param {THREE.Camera} camera - The active perspective camera
   * @param {string} basePath - Base asset directory URL (e.g., './threejs_game_assets/')
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

    // Sub-groups
    this.persistentGroup = new THREE.Group();
    this.persistentGroup.name = 'PersistentBase_Group';
    this.root.add(this.persistentGroup);

    this.chunksGroup = new THREE.Group();
    this.chunksGroup.name = 'Chunks_LOD_Group';
    this.root.add(this.chunksGroup);

    // Active LOD nodes keyed by 'cx_cy'
    this.chunkLods = new Map();
    this.chunkBoxes = new Map();

    // Animated objects
    this.windFan = null;
    this.windFanSpeed = 1.8; // radians per second

    // Celestial Orrery animated parts (Chunk 1_2)
    this.orreryOuterRing = null;
    this.orreryMidRing = null;
    this.orreryInnerRing = null;
    this.orreryCrystal = null;
    this.orreryRunes = null;
    this.observatoryRunes = null;
    this.animClock = 0;

    // World dimensions & Chunk grid
    this.islandCenter = new THREE.Vector3(0, 0, 0);
    this.chunkSize = 90.0; // 90m per chunk (270m total / 3)
    this.lod1Threshold = 40.0;  // 0 - 40m from chunk edge: LOD0 (100% detail)
    this.lod2Threshold = 100.0; // 40 - 100m from chunk edge: LOD1 (mid detail)
                                // 100m+ from chunk edge: LOD2 (horizon silhouette)
  }

  /**
   * Initializes the entire island: loads persistent base and binds all 9 chunk LODs.
   * @returns {Promise<void>}
   */
  async init() {
    console.log('[IslandWorld] Initializing island world...');

    // 1. Load Persistent Base (Terrain + Ocean + Road Network)
    await this.loadPersistentBase();

    // 2. Load all 9 chunk LODs
    await this.loadAllChunkLODs();

    console.log('[IslandWorld] Island world initialization complete!');
  }

  /**
   * Loads the persistent base (terrain + ocean + roads)
   */
  loadPersistentBase() {
    return new Promise((resolve, reject) => {
      const url = `${this.basePath}base/persistent_base.glb`;
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.receiveShadow = true;
              // Ensure terrain doesn't cast unnecessary self-shadows
              if (child.name.includes('Cube.003') || child.name.includes('Grid')) {
                child.castShadow = false;
              }
            }
          });
          this.persistentGroup.add(model);
          console.log('[IslandWorld] Persistent base loaded successfully.');
          resolve(model);
        },
        undefined,
        (err) => {
          console.error('[IslandWorld] Failed to load persistent base:', err);
          reject(err);
        }
      );
    });
  }

  /**
   * Binds and loads all 9 chunks using THREE.LOD
   */
  loadAllChunkLODs() {
    const promises = [];
    for (let cy = 0; cy < 3; cy++) {
      for (let cx = 0; cx < 3; cx++) {
        promises.push(this.createChunkLOD(cx, cy));
      }
    }
    return Promise.all(promises);
  }

  /**
   * Creates a THREE.LOD object for a single chunk grid cell (cx, cy)
   * and registers LOD0, LOD1, and LOD2 tiers.
   * @param {number} cx - Grid X index (0, 1, 2)
   * @param {number} cy - Grid Y index (0, 1, 2)
   */
  createChunkLOD(cx, cy) {
    return new Promise((resolve) => {
      const key = `${cx}_${cy}`;
      const lod = new THREE.LOD();
      lod.name = `Chunk_LOD_${key}`;
      // Disable Three.js default point-to-point distance check so our
      // boundary-aware Box3 distance updater controls LOD switching
      lod.autoUpdate = false;

      this.chunksGroup.add(lod);
      this.chunkLods.set(key, lod);

      const prefix = `${this.basePath}chunks_lod/`;

      // Helper to load a tier
      const loadTier = (tierName) => {
        return new Promise((res) => {
          const url = `${prefix}${tierName}/chunk_${cx}_${cy}_${tierName}.glb`;
          this.loader.load(
            url,
            (gltf) => {
              const model = gltf.scene;
              model.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;

                  const lowerName = child.name.toLowerCase();
                  // Capture wind_fan in Chunk 2_0
                  if (lowerName.includes('wind_fan')) {
                    this.windFan = child;
                  } else if (lowerName.includes('orrery_ring_outer')) {
                    this.orreryOuterRing = child;
                  } else if (lowerName.includes('orrery_ring_mid')) {
                    this.orreryMidRing = child;
                  } else if (lowerName.includes('orrery_ring_inner')) {
                    this.orreryInnerRing = child;
                  } else if (lowerName.includes('orrery_core_crystal')) {
                    this.orreryCrystal = child;
                  } else if (lowerName.includes('orrery_floating_runes')) {
                    this.orreryRunes = child;
                  } else if (lowerName.includes('observatory_runestones')) {
                    this.observatoryRunes = child;
                  }
                }
              });
              // Distance parameter here is a fallback index
              const distFallback = tierName === 'lod0' ? 0 : (tierName === 'lod1' ? 40 : 100);
              lod.addLevel(model, distFallback);
              res(model);
            },
            undefined,
            (err) => {
              console.warn(`[IslandWorld] Could not load ${url}:`, err);
              res(null);
            }
          );
        });
      };

      // Load all 3 tiers concurrently
      Promise.all([
        loadTier('lod0'),
        loadTier('lod1'),
        loadTier('lod2'),
      ]).then(([lod0Model]) => {
        // Compute world-space AABB bounding box for this chunk
        const box = new THREE.Box3();
        if (lod0Model) {
          box.setFromObject(lod0Model);
        } else {
          // Fallback approximate 90x90m box based on grid coordinates
          const minX = cx * 90 - 135;
          const maxX = minX + 90;
          const minZ = (2 - cy) * 90 - 135; // Blender Y to Three.js -Z
          const maxZ = minZ + 90;
          box.min.set(minX, 0, minZ);
          box.max.set(maxX, 50, maxZ);
        }
        this.chunkBoxes.set(key, box);
        resolve(lod);
      });
    });
  }

  /**
   * Per-frame update loop. Call this inside your requestAnimationFrame callback.
   * Updates windmill blade rotation and evaluates chunk LODs using distance
   * to each chunk's bounding box (AABB).
   * @param {number} delta - Delta time in seconds (e.g. clock.getDelta())
   */
  update(delta = 0.016) {
    // 1. Rotate the windmill blades smoothly
    if (this.windFan) {
      this.windFan.rotation.y += this.windFanSpeed * delta;
    }

    // 2. Animate Celestial Orrery & Floating Runes
    this.animClock += delta;
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
      this.orreryCrystal.position.z = Math.sin(this.animClock * 2.0) * 0.12;
    }
    if (this.observatoryRunes) {
      this.observatoryRunes.rotation.z += 0.45 * delta;
    }

    // 3. Update chunk LODs based on distance to chunk's Bounding Box (AABB)
    // This guarantees that when a player stands right next to a neighboring chunk,
    // distanceToPoint is ~0m and the neighbor stays at crisp, high-detail LOD0!
    const camPos = this.camera.position;
    for (const [key, lod] of this.chunkLods) {
      const box = this.chunkBoxes.get(key);
      if (!box || lod.levels.length < 3) continue;

      // Distance from camera to the closest point of the chunk's box
      const dist = box.distanceToPoint(camPos);

      // Select tier based on distance from the chunk's boundary edge
      let activeIndex = 0;
      if (dist >= this.lod2Threshold) {
        activeIndex = 2; // Far horizon silhouette (100m+)
      } else if (dist >= this.lod1Threshold) {
        activeIndex = 1; // Mid distance (40 - 100m)
      } else {
        activeIndex = 0; // Close range & adjacent boundary (0 - 40m): High Detail
      }

      for (let i = 0; i < lod.levels.length; i++) {
        if (lod.levels[i].object) {
          lod.levels[i].object.visible = (i === activeIndex);
        }
      }
    }
  }

  /**
   * Cleanup and dispose all geometry, textures, and materials from memory.
   */
  dispose() {
    console.log('[IslandWorld] Disposing island world assets...');
    this.root.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => this.disposeMaterial(mat));
          } else {
            this.disposeMaterial(child.material);
          }
        }
      }
    });
    this.scene.remove(this.root);
    this.chunkLods.clear();
    this.windFan = null;
  }

  disposeMaterial(mat) {
    if (!mat) return;
    for (const key of Object.keys(mat)) {
      const val = mat[key];
      if (val && val.isTexture) {
        val.dispose();
      }
    }
    mat.dispose();
  }
}
