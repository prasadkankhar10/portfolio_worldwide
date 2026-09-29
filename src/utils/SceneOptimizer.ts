import * as THREE from 'three';

export interface SceneOptimizerOptions {
  enableInstancing?: boolean;
  disableMatrixAutoUpdate?: boolean;
  minInstancesToBatch?: number;
}

export interface SceneOptimizerStats {
  initialMeshCount: number;
  finalMeshCount: number;
  instancedGroupsCreated: number;
  propsInstanced: number;
  staticObjectsFrozen: number;
}

/**
 * SceneOptimizer
 * High-Performance Runtime Optimization Module for Three.js
 * 
 * Features:
 * 1. Automatic Static Instancing (collapses repeated prop draw calls into InstancedMeshes)
 * 2. Static Matrix Auto-Update Disabling (eliminates CPU matrix multiplication overhead)
 */
export class SceneOptimizer {
  static optimize(rootObject: THREE.Object3D, options: SceneOptimizerOptions = {}): SceneOptimizerStats {
    const config = {
      enableInstancing: true,
      disableMatrixAutoUpdate: true,
      minInstancesToBatch: 3,
      ...options
    };

    const stats: SceneOptimizerStats = {
      initialMeshCount: 0,
      finalMeshCount: 0,
      instancedGroupsCreated: 0,
      propsInstanced: 0,
      staticObjectsFrozen: 0
    };

    const meshes: THREE.Mesh[] = [];
    rootObject.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes.push(child as THREE.Mesh);
        stats.initialMeshCount++;
      }
    });

    // 1. Group repeated static props by geometry and material UUID
    if (config.enableInstancing) {
      const geometryGroups = new Map<string, THREE.Mesh[]>();

      for (const mesh of meshes) {
        const lower = (mesh.name || '').toLowerCase();
        // Skip interactive or animated magical objects
        if (
          lower.includes('magic_') ||
          lower.includes('col_') ||
          lower.includes('rune') ||
          lower.includes('crystal') ||
          lower.includes('portal') ||
          lower.includes('moonwell') ||
          lower.includes('ward_shield') ||
          lower.includes('orrery') ||
          lower.includes('mill-wind') ||
          lower.includes('wind_fan') ||
          lower.includes('observatory')
        ) {
          continue;
        }

        const geoKey = mesh.geometry.uuid;
        const matKey = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.uuid).join('_')
          : mesh.material.uuid;
        const groupKey = `${geoKey}__${matKey}`;

        if (!geometryGroups.has(groupKey)) {
          geometryGroups.set(groupKey, []);
        }
        geometryGroups.get(groupKey)!.push(mesh);
      }

      // 2. Convert groups with >= minInstancesToBatch into THREE.InstancedMesh
      for (const [, group] of geometryGroups.entries()) {
        if (group.length >= config.minInstancesToBatch) {
          const sampleMesh = group[0];
          const count = group.length;
          const instancedMesh = new THREE.InstancedMesh(
            sampleMesh.geometry,
            sampleMesh.material,
            count
          );

          instancedMesh.name = `Instanced_${sampleMesh.name.split('.')[0]}_x${count}`;
          instancedMesh.castShadow = false; // Optimized shadow pass
          instancedMesh.receiveShadow = true;

          for (let i = 0; i < count; i++) {
            const src = group[i];
            src.updateWorldMatrix(true, false);
            instancedMesh.setMatrixAt(i, src.matrixWorld);

            // Remove original individual mesh from parent
            if (src.parent) {
              src.parent.remove(src);
            }
          }

          instancedMesh.instanceMatrix.needsUpdate = true;
          rootObject.add(instancedMesh);

          stats.instancedGroupsCreated++;
          stats.propsInstanced += count;
        }
      }
    }

    // 3. Freeze Matrix World updates on all static objects
    if (config.disableMatrixAutoUpdate) {
      rootObject.traverse((child) => {
        const lower = (child.name || '').toLowerCase();
        const isDynamic =
          lower.includes('vortex') ||
          lower.includes('orbs') ||
          lower.includes('crystal') ||
          lower.includes('rune') ||
          lower.includes('orrery') ||
          lower.includes('mill-wind') ||
          lower.includes('wind_fan');

        if (!isDynamic) {
          child.matrixAutoUpdate = false;
          child.updateMatrix();
          child.updateMatrixWorld(true);
          stats.staticObjectsFrozen++;
        }
      });
    }

    // 4. Compute final mesh count
    stats.finalMeshCount = 0;
    rootObject.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) stats.finalMeshCount++;
    });

    console.log(
      `[SceneOptimizer] Optimization complete: ${stats.initialMeshCount} -> ${stats.finalMeshCount} meshes. ` +
      `Instanced ${stats.propsInstanced} props into ${stats.instancedGroupsCreated} batches. ` +
      `Frozen ${stats.staticObjectsFrozen} static matrices.`
    );

    return stats;
  }
}
