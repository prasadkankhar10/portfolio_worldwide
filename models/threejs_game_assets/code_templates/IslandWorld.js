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

    // Animated objects
    this.windFan = null;
    this.windFanSpeed = 1.8; // radians per second

    // World dimensions
    this.islandCenter = new THREE.Vector3(0, 0, 0);
    this.chunkSize = 90.0; // Approx 90m per chunk (270m total / 3)

    // Distance thresholds (meters)
    this.lod0Distance = 0;   // 0 - 55m: Full quality
    this.lod1Distance = 55;  // 55 - 130m: Mid quality (~40% polys)
    this.lod2Distance = 130; // 130m+: Far horizon (~15% polys)
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
      this.chunksGroup.add(lod);
      this.chunkLods.set(key, lod);

      const prefix = `${this.basePath}chunks_lod/`;

      // Helper to load a tier
      const loadTier = (tierName, distance) => {
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

                  // Capture wind_fan in Chunk 2_0
                  if (child.name.toLowerCase().includes('wind_fan')) {
                    this.windFan = child;
                  }
                }
              });
              lod.addLevel(model, distance);
              res();
            },
            undefined,
            (err) => {
              console.warn(`[IslandWorld] Could not load ${url}:`, err);
              res();
            }
          );
        });
      };

      // Load all 3 tiers concurrently
      Promise.all([
        loadTier('lod0', this.lod0Distance),
        loadTier('lod1', this.lod1Distance),
        loadTier('lod2', this.lod2Distance),
      ]).then(() => {
        resolve(lod);
      });
    });
  }

  /**
   * Per-frame update loop. Call this inside your requestAnimationFrame callback.
   * @param {number} delta - Delta time in seconds (e.g. clock.getDelta())
   */
  update(delta = 0.016) {
    // 1. Rotate the windmill blades smoothly
    if (this.windFan) {
      this.windFan.rotation.y += this.windFanSpeed * delta;
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
