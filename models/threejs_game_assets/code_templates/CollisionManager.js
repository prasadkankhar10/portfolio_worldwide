/**
 * CollisionManager.js - Three.js Physics & Collision Handler
 *
 * Handles:
 *  1. Loading collision.glb (simplified 72 collision proxies)
 *  2. Ground raycasting for character elevation / floor snapping
 *  3. Horizontal obstacle checking for walls and fences
 *
 * Can be used with standard THREE.Raycaster or accelerated with three-mesh-bvh.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class CollisionManager {
  /**
   * @param {THREE.Scene} scene - The active Three.js scene
   * @param {string} basePath - Base asset path
   */
  constructor(scene, basePath = './threejs_game_assets/') {
    this.scene = scene;
    this.basePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    this.loader = new GLTFLoader();

    this.collisionGroup = new THREE.Group();
    this.collisionGroup.name = 'Collision_Group';
    // Hidden by default so collision proxies do not render over the visual scene
    this.collisionGroup.visible = false;
    this.scene.add(this.collisionGroup);

    this.groundMeshes = [];
    this.obstacleMeshes = [];

    this.downRaycaster = new THREE.Raycaster();
    this.downRaycaster.ray.direction.set(0, -1, 0);

    this.horizontalRaycaster = new THREE.Raycaster();
  }

  /**
   * Loads collision.glb and separates ground from static obstacles
   * @returns {Promise<void>}
   */
  load() {
    return new Promise((resolve, reject) => {
      const url = `${this.basePath}base/collision.glb`;
      this.loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;

          model.traverse((child) => {
            if (child.isMesh) {
              // Ensure wireframe or invisible
              child.material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
              });

              if (child.name.toLowerCase().includes('ground')) {
                this.groundMeshes.push(child);
              } else {
                this.obstacleMeshes.push(child);
              }
            }
          });

          this.collisionGroup.add(model);
          console.log(
            `[CollisionManager] Loaded ${this.groundMeshes.length} ground and ${this.obstacleMeshes.length} obstacle colliders.`
          );
          resolve();
        },
        undefined,
        (err) => {
          console.error('[CollisionManager] Failed to load collision.glb:', err);
          reject(err);
        }
      );
    });
  }

  /**
   * Snaps a character position to the terrain surface elevation.
   * @param {THREE.Vector3} position - The character world position (modified in-place)
   * @param {number} raycastHeightOffset - Height above player to cast ray downwards (default 5.0m)
   * @returns {number|null} The floor height, or null if no ground was hit
   */
  getGroundHeight(position, raycastHeightOffset = 5.0) {
    if (this.groundMeshes.length === 0) return null;

    this.downRaycaster.ray.origin.set(
      position.x,
      position.y + raycastHeightOffset,
      position.z
    );

    const intersects = this.downRaycaster.intersectObjects(this.groundMeshes, false);
    if (intersects.length > 0) {
      return intersects[0].point.y;
    }
    return null;
  }

  /**
   * Checks if moving in a direction hits an obstacle.
   * @param {THREE.Vector3} origin - Character origin
   * @param {THREE.Vector3} direction - Normalized movement direction
   * @param {number} checkDistance - Distance ahead to check (e.g. 0.5m)
   * @returns {boolean} True if blocked
   */
  checkObstacle(origin, direction, checkDistance = 0.5) {
    if (this.obstacleMeshes.length === 0) return false;

    this.horizontalRaycaster.ray.origin.copy(origin);
    // Cast ray at waist height (e.g. +0.8m)
    this.horizontalRaycaster.ray.origin.y += 0.8;
    this.horizontalRaycaster.ray.direction.copy(direction).normalize();

    const intersects = this.horizontalRaycaster.intersectObjects(this.obstacleMeshes, false);
    if (intersects.length > 0 && intersects[0].distance <= checkDistance) {
      return true; // Collision detected
    }
    return false;
  }

  /**
   * Toggle debug visibility of collision wireframes
   * @param {boolean} visible
   */
  setDebugVisible(visible) {
    this.collisionGroup.visible = visible;
  }
}
