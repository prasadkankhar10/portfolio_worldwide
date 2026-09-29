import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

/**
 * Global zero-allocation math and physics pool.
 * Prevents garbage collection (GC) thread-lock freezes during high-frequency useFrame loops.
 */
export const UP_AXIS = new THREE.Vector3(0, 1, 0);
export const DOWN_DIR = new THREE.Vector3(0, -1, 0);

// Scratch vectors for math calculations
export const _poolV3_1 = new THREE.Vector3();
export const _poolV3_2 = new THREE.Vector3();
export const _poolV3_3 = new THREE.Vector3();
export const _poolV3_4 = new THREE.Vector3();
export const _poolV3_5 = new THREE.Vector3();

// 2D distance scratch vectors
export const _poolV2_1 = new THREE.Vector2();
export const _poolV2_2 = new THREE.Vector2();

// Rotations and projections
export const _poolQuat = new THREE.Quaternion();
export const _poolEuler = new THREE.Euler();
export const _poolFrustum = new THREE.Frustum();
export const _poolMat4 = new THREE.Matrix4();

// Reusable Rapier Rays for obstacle and ground hit detection
export const _sharedRayDown = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
export const _sharedRayForward = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
export const _sharedRayLeft = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
export const _sharedRayRight = new RAPIER.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });

/**
 * Configure reusable ray in-place without heap allocation
 */
export function setRapierRay(
  ray: RAPIER.Ray,
  origin: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number }
): RAPIER.Ray {
  ray.origin.x = origin.x;
  ray.origin.y = origin.y;
  ray.origin.z = origin.z;
  ray.dir.x = dir.x;
  ray.dir.y = dir.y;
  ray.dir.z = dir.z;
  return ray;
}
