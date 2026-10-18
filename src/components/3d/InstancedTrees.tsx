import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpawnPoint {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// Lush, vibrant natural foliage palette (Zelda / Studio Ghibli inspired)
const FOLIAGE_PALETTE = [
  new THREE.Color('#2d6a4f'), // Deep forest green
  new THREE.Color('#40916c'), // Rich emerald green
  new THREE.Color('#52b788'), // Vibrant spring green
  new THREE.Color('#74c69d'), // Fresh lime sage
  new THREE.Color('#386641'), // Dark moss green
  new THREE.Color('#6a994e'), // Olive meadow
  new THREE.Color('#a7c957'), // Sunny yellow-green
  new THREE.Color('#bc6c25'), // Warm autumn bronze
  new THREE.Color('#dda15e'), // Golden amber
  new THREE.Color('#283618'), // Alpine pine dark
  new THREE.Color('#606c38'), // Sagebrush green
  new THREE.Color('#4d7c0f'), // Lush woodland lime
  new THREE.Color('#15803d'), // Highland spruce
];

// Deterministic pseudo-random number generator for consistent seeds per tree
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * ForestSpores: Subtle floating luminous pollen / magical spores drifting
 * through the tree canopies across the island in a single draw call.
 */
const ForestSpores: React.FC<{ spawnPoints: SpawnPoint[] }> = ({ spawnPoints }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 160;

  const [geo, mat, initialPos, speeds] = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const posCopy = new Float32Array(count * 3);
    const speedArr = new Float32Array(count * 3);

    // Scatter spores around random tree clusters
    for (let i = 0; i < count; i++) {
      const treeIdx = Math.floor(pseudoRandom(i * 13.7) * spawnPoints.length);
      const tree = spawnPoints[treeIdx] || { position: [0, 0, 0] };
      const offsetX = (pseudoRandom(i * 17.3) - 0.5) * 8.0;
      const offsetZ = (pseudoRandom(i * 23.9) - 0.5) * 8.0;
      const offsetY = 1.8 + pseudoRandom(i * 31.1) * 3.5;

      const px = tree.position[0] + offsetX;
      const py = tree.position[2] + offsetY;
      const pz = -tree.position[1] + offsetZ;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      posCopy[i * 3] = px;
      posCopy[i * 3 + 1] = py;
      posCopy[i * 3 + 2] = pz;

      speedArr[i * 3] = 0.5 + pseudoRandom(i * 41.3) * 0.8; // wave speed
      speedArr[i * 3 + 1] = 0.3 + pseudoRandom(i * 47.9) * 0.5; // drift speed
      speedArr[i * 3 + 2] = pseudoRandom(i * 53.1) * Math.PI * 2; // phase
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color('#bbf7d0'),
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return [geometry, material, posCopy, speedArr];
  }, [spawnPoints]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const spd = speeds[i3];
      const drift = speeds[i3 + 1];
      const phase = speeds[i3 + 2];

      // Gentle floating sine motion in wind direction
      arr[i3] = initialPos[i3] + Math.sin(time * spd + phase) * 0.85 + (time * 0.2 * drift) % 4.0 - 2.0;
      arr[i3 + 1] = initialPos[i3 + 1] + Math.sin(time * 1.2 * spd + phase) * 0.45;
      arr[i3 + 2] = initialPos[i3 + 2] + Math.cos(time * 0.9 * spd + phase) * 0.75;
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geo} material={mat} frustumCulled={false} />;
};

export const InstancedTrees: React.FC = () => {
  const gltf = useGLTF('./models/threejs_game_assets/trees.glb');
  const [spawnPoints, setSpawnPoints] = useState<SpawnPoint[]>([]);

  // Shared time uniform for GPU vertex wind sway
  const timeUniform = useRef({ value: 0 });

  useFrame((state) => {
    timeUniform.current.value = state.clock.getElapsedTime();
  });

  useEffect(() => {
    fetch('./models/threejs_game_assets/tree_spawn_points.json')
      .then((res) => res.json())
      .then((data: SpawnPoint[]) => {
        setSpawnPoints(data);
      })
      .catch((err) => {
        console.warn('Failed to load tree spawn points:', err);
      });
  }, []);

  const instancedMeshes = useMemo(() => {
    if (!gltf.scene || spawnPoints.length === 0) return [];

    const treePrototypes: THREE.Mesh[] = [];
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        treePrototypes.push(child);
      }
    });

    if (treePrototypes.length === 0) return [];

    // Group spawn points across prototypes so types are evenly and organically mixed
    const numPrototypes = treePrototypes.length;
    const protoBuckets: SpawnPoint[][] = Array.from({ length: numPrototypes }, () => []);

    spawnPoints.forEach((pt, i) => {
      // Spatial hash distribution across island
      const hash = Math.abs(Math.sin(pt.position[0] * 12.9898 + pt.position[1] * 78.233 + i) * 43758.5453);
      const protoIndex = Math.floor(hash % numPrototypes);
      protoBuckets[protoIndex].push(pt);
    });

    const dummy = new THREE.Object3D();
    const meshes: THREE.InstancedMesh[] = [];

    treePrototypes.forEach((proto, pIdx) => {
      const bucket = protoBuckets[pIdx];
      const count = bucket.length;
      if (count === 0) return;

      // Clone material so each tree prototype has custom wind sway and bark protection
      const rawMat = proto.material instanceof THREE.Material
        ? proto.material.clone()
        : proto.material;

      // Upgraded material settings
      const material = rawMat as THREE.MeshStandardMaterial;
      material.roughness = 0.82;
      material.metalness = 0.05;
      material.vertexColors = true; // Enables baked contact AO from Blender
      material.shadowSide = THREE.DoubleSide;

      // Inject GPU Dynamic Wind Sway + Trunk Bark Protection + Foliage Translucency
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = timeUniform.current;

        // 1. Vertex Shader: Add uTime and height-anchored wind sway
        shader.vertexShader = `
          uniform float uTime;
          varying vec2 vTreeUv;
          ${shader.vertexShader}
        `;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <uv_vertex>',
          `
          #include <uv_vertex>
          vTreeUv = uv;
          `
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>

          // Dynamic Wind Sway Physics
          // Calculate height along tree (roots anchored at 0.0, upper canopy sways at 1.0)
          float treeH = clamp((position.y - 0.22) / 3.6, 0.0, 1.0);
          float swayWeight = pow(treeH, 1.35);

          #ifdef USE_INSTANCING
            vec3 worldP = (instanceMatrix * vec4(position, 1.0)).xyz;
          #else
            vec3 worldP = (modelMatrix * vec4(position, 1.0)).xyz;
          #endif

          // Multi-frequency wind simulation (main breeze + secondary gusts)
          float wind1 = sin(uTime * 1.55 + worldP.x * 0.075 + worldP.z * 0.065);
          float wind2 = cos(uTime * 2.15 + worldP.x * 0.11 - worldP.z * 0.085) * 0.42;
          float gust = sin(uTime * 0.65 + worldP.x * 0.028 + worldP.z * 0.038) * 0.35;

          // Micro leaf cluster flutter for foliage only (uv.y > 0.5)
          float flutter = 0.0;
          if (uv.y > 0.5) {
            flutter = sin(uTime * 4.8 + position.x * 3.8 + position.z * 3.8) * 0.055;
          }

          vec3 windSway = vec3(
            (wind1 + wind2 + gust) * 0.28 + flutter,
            -abs(wind1 * 0.045) * swayWeight,
            (wind1 * 0.6 + wind2 * 0.35) * 0.20 + flutter
          ) * swayWeight;

          transformed += windSway;
          `
        );

        // 2. Fragment Shader: Protect trunk bark & add soft moonlit foliage translucency
        shader.fragmentShader = `
          varying vec2 vTreeUv;
          ${shader.fragmentShader}
        `;

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          `
          #if defined( USE_COLOR_ALPHA )
            diffuseColor *= vColor;
          #elif defined( USE_COLOR )
            diffuseColor.rgb *= vColor.rgb;
          #endif

          #if defined( USE_INSTANCING_COLOR )
            // Only tint foliage (uv.y > 0.5); keep authentic dark wood bark on tree trunks (uv.y <= 0.5)
            if (vTreeUv.y > 0.5) {
              diffuseColor.rgb *= vInstanceColor.rgb;
            } else {
              diffuseColor.rgb *= vec3(0.96, 0.92, 0.88);
            }
          #endif
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>
          // Soft moonlit transmission through leaf canopy
          if (vTreeUv.y > 0.5) {
            gl_FragColor.rgb += vec3(0.04, 0.065, 0.045);
          }
          `
        );
      };

      const instMesh = new THREE.InstancedMesh(proto.geometry, material, count);
      instMesh.name = `InstancedTree_${proto.name || pIdx}_x${count}`;
      instMesh.castShadow = false;
      instMesh.receiveShadow = true;

      for (let i = 0; i < count; i++) {
        const pt = bucket[i];
        const seed = pt.position[0] * 31.17 + pt.position[1] * 17.53 + i * 7.91;

        // 1. Organic random yaw rotation (0 to 360 degrees)
        const rotY = pseudoRandom(seed) * Math.PI * 2;
        // Natural wind-leaning tilt
        const tiltX = (pseudoRandom(seed + 1) - 0.5) * 0.07;
        const tiltZ = (pseudoRandom(seed + 2) - 0.5) * 0.07;

        // 2. Organic scale variation (saplings to ancient trees)
        const scaleBase = 0.72 + pseudoRandom(seed + 3) * 0.68; // 0.72 to 1.40
        const heightVariance = 0.88 + pseudoRandom(seed + 4) * 0.28; // 0.88 to 1.16
        const scaleX = scaleBase * (pt.scale[0] || 1);
        const scaleY = scaleBase * heightVariance * (pt.scale[2] || 1);
        const scaleZ = scaleBase * (pt.scale[1] || 1);

        dummy.position.set(pt.position[0], pt.position[2], -pt.position[1]);
        dummy.rotation.set(tiltX, rotY, tiltZ);
        dummy.scale.set(scaleX, scaleY, scaleZ);
        dummy.updateMatrix();

        instMesh.setMatrixAt(i, dummy.matrix);

        // 3. Natural foliage color variation per tree
        const colorIdx = Math.floor(pseudoRandom(seed + 5) * FOLIAGE_PALETTE.length);
        const color = FOLIAGE_PALETTE[colorIdx];
        instMesh.setColorAt(i, color);
      }

      instMesh.count = count;
      instMesh.instanceMatrix.needsUpdate = true;
      if (instMesh.instanceColor) {
        instMesh.instanceColor.needsUpdate = true;
      }
      instMesh.computeBoundingSphere();
      instMesh.matrixAutoUpdate = false;
      meshes.push(instMesh);
    });

    return meshes;
  }, [gltf.scene, spawnPoints]);

  return (
    <group name="InstancedTrees">
      {instancedMeshes.map((mesh, idx) => (
        <primitive key={idx} object={mesh} />
      ))}
      {spawnPoints.length > 0 && <ForestSpores spawnPoints={spawnPoints} />}
    </group>
  );
};

useGLTF.preload('./models/threejs_game_assets/trees.glb');
