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

    // Additional Magical Installations (Waystones, Portal, Moonwell, Ward Shield)
    this.waystoneCrossroadsCrystal = null;
    this.waystoneCrossroadsRunes = null;
    this.waystoneDocksCrystal = null;
    this.waystoneDocksRunes = null;
    this.portalVortex = null;
    this.portalKeystones = null;
    this.moonwellOrbs = null;
    this.wardRuneRing1 = null;
    this.wardRuneRing2 = null;
    this.wardDome = null;

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
              // 4. Arcane Waystones (Crossroads & Docks)
              else if (name.includes('arcane_waystone_crossroads_crystal')) {
                this.waystoneCrossroadsCrystal = child;
              } else if (name.includes('arcane_waystone_crossroads_runes')) {
                this.waystoneCrossroadsRunes = child;
              } else if (name.includes('arcane_waystone_docks_crystal')) {
                this.waystoneDocksCrystal = child;
              } else if (name.includes('arcane_waystone_docks_runes')) {
                this.waystoneDocksRunes = child;
              }
              // 5. Citadel Arcane Portal
              else if (name.includes('citadel_arcane_portal_vortex_disc')) {
                this.portalVortex = child;
              } else if (name.includes('citadel_arcane_portal_floating_keystones')) {
                this.portalKeystones = child;
              }
              // 6. Enchanted Moonwell & Flora
              else if (name.includes('enchanted_moonwell_grove_floating_orbs')) {
                this.moonwellOrbs = child;
              }
              // 7. Arcane Ward Shield (Summit)
              else if (name.includes('citadel_arcane_ward_shield_runering1')) {
                this.wardRuneRing1 = child;
              } else if (name.includes('citadel_arcane_ward_shield_runering2')) {
                this.wardRuneRing2 = child;
              } else if (name.includes('citadel_arcane_ward_shield_dome')) {
                this.wardDome = child;
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

    // 3. Arcane Waystone - Crossroads
    const waystoneCrossLight = new THREE.PointLight(0x00e5ff, 2.2, 16.0, 1.3);
    waystoneCrossLight.position.set(8.0, 5.0, 17.75);
    this.root.add(waystoneCrossLight);
    this.magicalLights.push({ light: waystoneCrossLight, baseIntensity: 2.2, speed: 2.0 });

    // 4. Arcane Waystone - Docks
    const waystoneDocksLight = new THREE.PointLight(0x00e5ff, 2.2, 16.0, 1.3);
    waystoneDocksLight.position.set(102.0, 5.0, 125.0);
    this.root.add(waystoneDocksLight);
    this.magicalLights.push({ light: waystoneDocksLight, baseIntensity: 2.2, speed: 2.0 });

    // 5. Citadel Arcane Portal Gateway
    const portalLight = new THREE.PointLight(0x9d4edd, 2.8, 22.0, 1.4);
    portalLight.position.set(-15.0, 5.5, -105.0);
    this.root.add(portalLight);
    this.magicalLights.push({ light: portalLight, baseIntensity: 2.8, speed: 2.6 });

    // 6. Enchanted Moonwell & Bio Grove
    const moonwellLight = new THREE.PointLight(0x00e5ff, 2.0, 18.0, 1.3);
    moonwellLight.position.set(-50.0, 4.8, 35.0);
    this.root.add(moonwellLight);
    this.magicalLights.push({ light: moonwellLight, baseIntensity: 2.0, speed: 1.8 });
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
    const time = this.animClock;

    // 1. Windmill fan in Farmland (Spins on axle Z)
    if (this.windFan) {
      this.windFan.rotation.z += 1.80 * delta;
    }

    // 2. Celestial Orrery at the Watchtower Summit
    if (this.orreryOuterRing) {
      this.orreryOuterRing.rotation.z += 0.35 * delta;
      this.orreryOuterRing.rotation.y += 0.20 * delta;
    }
    if (this.orreryMidRing) {
      this.orreryMidRing.rotation.x += 0.55 * delta;
    }
    if (this.orreryInnerRing) {
      this.orreryInnerRing.rotation.y += 0.85 * delta;
      this.orreryInnerRing.rotation.z += 0.40 * delta;
    }
    if (this.orreryRunes) {
      this.orreryRunes.rotation.y -= 0.30 * delta;
      this.orreryRunes.rotation.z -= 0.20 * delta;
    }
    if (this.orreryCrystal) {
      this.orreryCrystal.rotation.y += 0.60 * delta;
      this.orreryCrystal.rotation.z += 0.40 * delta;
      // Gentle vertical levitation bobbing centered inside Orrery_Assembly
      this.orreryCrystal.position.y = Math.sin(time * 2.0) * 0.15;
    }

    // 3. Ground Observatory Sanctum
    if (this.observatoryRunes) {
      this.observatoryRunes.rotation.y += 0.45 * delta;
      this.observatoryRunes.position.y = Math.sin(time * 1.8) * 0.08;
    }

    // 4. Arcane Waystones (Crossroads & Docks)
    if (this.waystoneCrossroadsCrystal) {
      this.waystoneCrossroadsCrystal.rotation.y += 0.80 * delta;
      this.waystoneCrossroadsCrystal.position.y = 1.85 + Math.sin(time * 2.2) * 0.12;
    }
    if (this.waystoneCrossroadsRunes) {
      this.waystoneCrossroadsRunes.rotation.y -= 0.50 * delta;
      this.waystoneCrossroadsRunes.position.y = 1.85 + Math.sin(time * 2.2 + 0.6) * 0.05;
    }
    if (this.waystoneDocksCrystal) {
      this.waystoneDocksCrystal.rotation.y += 0.80 * delta;
      this.waystoneDocksCrystal.position.y = 1.85 + Math.sin(time * 2.2 + 1.2) * 0.12;
    }
    if (this.waystoneDocksRunes) {
      this.waystoneDocksRunes.rotation.y -= 0.50 * delta;
      this.waystoneDocksRunes.position.y = 1.85 + Math.sin(time * 2.2 + 1.8) * 0.05;
    }

    // 5. Citadel Arcane Portal Gateway
    if (this.portalVortex) {
      this.portalVortex.rotation.z += 1.20 * delta;
    }
    if (this.portalKeystones) {
      this.portalKeystones.rotation.y -= 0.20 * delta;
      this.portalKeystones.position.y = Math.sin(time * 1.6) * 0.08;
    }

    // 6. Enchanted Moonwell & Floating Orbs
    if (this.moonwellOrbs) {
      this.moonwellOrbs.rotation.y += 0.40 * delta;
      this.moonwellOrbs.position.y = 0.52 + Math.sin(time * 1.8) * 0.08;
    }

    // 7. Arcane Citadel Ward Shield (Summit)
    if (this.wardRuneRing1) {
      this.wardRuneRing1.rotation.y += 0.25 * delta;
    }
    if (this.wardRuneRing2) {
      this.wardRuneRing2.rotation.y -= 0.35 * delta;
    }
    if (this.wardDome && this.wardDome.material) {
      // Subtle celestial energy breathing pulse
      this.wardDome.material.opacity = 0.30 + Math.sin(this.animClock * 2.5) * 0.08;
    }

    // 8. Pulsing Magical Lights
    for (const item of this.magicalLights) {
      item.light.intensity =
        item.baseIntensity + Math.sin(this.animClock * item.speed) * (item.baseIntensity * 0.25);
    }
  }
}
