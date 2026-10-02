import * as THREE from 'three';

// -------------------------------------------------------------
// 1. FALLBACK PRE-CALCULATED WAYPOINT ARRAY (Exact island coordinates)
// -------------------------------------------------------------
export const BAKED_WAYPOINTS: [number, number, number][] = [
  [48.96, 2.46, 169.17], [69.65, 2.46, 164.87], [83.51, 2.46, 163.39],
  [94.23, 2.46, 164.7], [112.82, 2.46, 162.81], [137.51, 2.46, 159.31],
  [158.82, 2.46, 137.05], [166.92, 2.46, 96.09], [161.86, 2.46, 25.23],
  [158.17, 2.46, -46.13], [150.87, 2.46, -109.68], [140.18, 2.46, -137.52],
  [115.23, 2.46, -147.76], [85.23, 2.46, -155.01], [42.3, 2.46, -156.16],
  [-9.2, 2.46, -156.51], [-73.22, 2.46, -151.17], [-113.92, 2.46, -144.61],
  [-140.87, 2.46, -125.46], [-159.35, 2.46, -100.76], [-166.55, 2.46, -64.66],
  [-167.93, 2.46, -26.71], [-165.04, 2.46, 21.22], [-165.12, 2.46, 61.29],
  [-160.48, 2.46, 98.77], [-153.59, 2.46, 125.92], [-132.22, 2.46, 146.17],
  [-100.07, 2.46, 158.04], [-50.81, 2.46, 160.19], [-12.92, 2.46, 157.52],
  [16.02, 2.46, 149.49], [39.3, 2.46, 149.58], [64.1, 2.46, 150.91],
  [80.15, 2.46, 157.5], [89.66, 2.46, 169.53], [86.9, 2.46, 184.64],
  [75.6, 2.46, 199.93], [55.09, 2.46, 202.93], [34.88, 2.46, 196.37],
  [25.6, 2.46, 183.52], [6.06, 2.46, 180.95], [-18.32, 2.46, 187.55],
  [-35.79, 2.46, 204.14], [-34.13, 2.46, 218.45], [-14.52, 2.46, 210.02],
  [3.75, 2.46, 173.88], [6.05, 2.46, 136.82], [-7.4, 2.46, 127.83],
  [-26.93, 2.46, 142.91], [-21.46, 2.46, 170.31], [22.9, 2.46, 181.66]
];

// -------------------------------------------------------------
// 2. CREATE CLOSED CURVE FROM GLB OBJECT OR PRE-EXTRACTED POINTS
// -------------------------------------------------------------
export function createShipPath(scene: THREE.Object3D): THREE.CatmullRomCurve3 {
  const pathMesh = scene.getObjectByName('ship_path') as THREE.Mesh | undefined;
  if (pathMesh && pathMesh.geometry && pathMesh.geometry.attributes && pathMesh.geometry.attributes.position) {
    pathMesh.visible = false;
    pathMesh.updateMatrixWorld(true);
    const pos = pathMesh.geometry.attributes.position;
    const waypoints: THREE.Vector3[] = [];

    for (let i = 0; i < pos.count; i += 2) {
      const p1 = new THREE.Vector3().fromBufferAttribute(pos, i);
      const p2 = new THREE.Vector3().fromBufferAttribute(pos, Math.min(i + 1, pos.count - 1));
      const mid = p1.add(p2).multiplyScalar(0.5);
      mid.applyMatrix4(pathMesh.matrixWorld);
      waypoints.push(mid);
    }
    if (waypoints.length >= 3) {
      return new THREE.CatmullRomCurve3(waypoints, true);
    }
  }

  const points = BAKED_WAYPOINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  return new THREE.CatmullRomCurve3(points, true);
}

// -------------------------------------------------------------
// 3. SHIP INSTANCE INTERFACE
// -------------------------------------------------------------
export interface ShipInstance {
  name: string;
  object: THREE.Object3D;
  progress: number;
  speed: number;             // Independent cruising speed (m/s)
  lateralOffset: number;     // Sea lane offset to prevent overlapping
  waveFreq: number;          // Unique wave bobbing frequency
  wavePhase: number;         // Wave phase offset
  heaveScale: number;        // Vertical wave heave amplitude
  pitchScale: number;        // Pitch wave tilt amplitude
  rollScale: number;         // Roll wave roll amplitude
  bankMultiplier: number;    // Centrifugal banking multiplier
  lanternLights: THREE.PointLight[];
  lanternMeshes: THREE.Mesh[];
}

/**
 * Attaches glowing crystal beacons and point lights for long-range night visibility.
 */
function attachGlowBeacons(
  shipObj: THREE.Object3D,
  colorHex: number,
  points: { pos: [number, number, number]; size: number; lightIntensity: number; lightDist: number }[]
): { lights: THREE.PointLight[]; meshes: THREE.Mesh[] } {
  const lights: THREE.PointLight[] = [];
  const meshes: THREE.Mesh[] = [];

  points.forEach((cfg, idx) => {
    // 1. Faceted glowing crystal
    const gemGeo = new THREE.OctahedronGeometry(cfg.size, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: 6.0,
      roughness: 0.1,
      metalness: 0.9,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.name = `${shipObj.name}_BeaconGem_${idx}`;
    gemMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    gemMesh.castShadow = false;
    gemMesh.receiveShadow = false;
    shipObj.add(gemMesh);
    meshes.push(gemMesh);

    // 2. PointLight casting radiant glow across sails and ripples on water
    const light = new THREE.PointLight(colorHex, cfg.lightIntensity, cfg.lightDist, 1.4);
    light.name = `${shipObj.name}_BeaconLight_${idx}`;
    light.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    light.userData.baseIntensity = cfg.lightIntensity;
    shipObj.add(light);
    lights.push(light);
  });

  return { lights, meshes };
}

/**
 * Deep-clones a ship hierarchy with custom scale, material tint, and emissive shading.
 */
function cloneShipWithMaterial(
  source: THREE.Object3D,
  name: string,
  tintColor: THREE.Color,
  emissiveColor: THREE.Color,
  emissiveIntensity: number,
  scale: [number, number, number]
): THREE.Object3D {
  const clone = source.clone(true);
  clone.name = name;
  clone.scale.set(scale[0], scale[1], scale[2]);
  clone.matrixAutoUpdate = true;

  clone.traverse((child) => {
    child.matrixAutoUpdate = true;
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => {
            const cm = m.clone() as THREE.MeshStandardMaterial;
            if (cm.color) cm.color.multiply(tintColor);
            cm.emissive = emissiveColor;
            cm.emissiveIntensity = emissiveIntensity;
            return cm;
          });
        } else {
          const cm = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (cm.color) cm.color.multiply(tintColor);
          cm.emissive = emissiveColor;
          cm.emissiveIntensity = emissiveIntensity;
          mesh.material = cm;
        }
      }
    }
  });

  return clone;
}

// -------------------------------------------------------------
// 4. SHIP FLEET CONTROLLER
// -------------------------------------------------------------
export class ShipFleetController {
  scene: THREE.Object3D;
  curve: THREE.CatmullRomCurve3;
  curveLength: number;
  ships: ShipInstance[] = [];

  // Moored Ships (stay at harbor pier with gentle swell)
  mooredArrival: THREE.Object3D | null = null;
  mooredTender: THREE.Object3D | null = null;
  arrivalBase: THREE.Vector3 = new THREE.Vector3();
  arrivalRot: THREE.Euler = new THREE.Euler();
  tenderBase: THREE.Vector3 = new THREE.Vector3();
  tenderRot: THREE.Euler = new THREE.Euler();

  // Zero-allocation reusable math vectors
  private _pos: THREE.Vector3 = new THREE.Vector3();
  private _tangent: THREE.Vector3 = new THREE.Vector3();
  private _nextTangent: THREE.Vector3 = new THREE.Vector3();
  private _normal: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Object3D) {
    this.scene = scene;
    this.curve = createShipPath(scene);
    this.curveLength = this.curve.getLength();

    // 1. Clean up any previous clones or beacon attachments to prevent ghost/frozen duplicates
    this.cleanupOldObjects();

    // 2. Find Base Galleon
    const baseGalleon = scene.getObjectByName('Ship_Sea_Galleon');

    const galleonBeaconPositions = [
      { pos: [0, 10.3, 0.2] as [number, number, number], size: 0.45, lightIntensity: 3.8, lightDist: 36 }, // Masthead
      { pos: [0, 3.4, -7.6] as [number, number, number], size: 0.32, lightIntensity: 2.2, lightDist: 24 }, // Bowsprit
      { pos: [0, 5.2, 7.2] as [number, number, number], size: 0.38, lightIntensity: 2.8, lightDist: 30 },  // Stern
    ];

    if (baseGalleon) {
      baseGalleon.matrixAutoUpdate = true;
      baseGalleon.traverse((c) => { c.matrixAutoUpdate = true; });

      // ---------------------------------------------------------
      // Ship 1: "The Golden Sovereign" (Flagship Galleon)
      // ---------------------------------------------------------
      const flagBeacons = attachGlowBeacons(baseGalleon, 0xffaa22, galleonBeaconPositions);
      this.ships.push({
        name: 'The Golden Sovereign (Flagship)',
        object: baseGalleon,
        progress: 0.05,            // Starts off Harbor bay
        speed: 4.5,               // 4.5 m/s
        lateralOffset: 0.0,       // Center shipping lane
        waveFreq: 2.0,
        wavePhase: 0.0,
        heaveScale: 0.14,
        pitchScale: 0.035,
        rollScale: 0.045,
        bankMultiplier: 18.0,
        lanternLights: flagBeacons.lights,
        lanternMeshes: flagBeacons.meshes,
      });

      // ---------------------------------------------------------
      // Ship 2: "The Celestial Moonwhisper" (Variant 1: Arcane Azure Frigate)
      // ---------------------------------------------------------
      const celestialShip = cloneShipWithMaterial(
        baseGalleon,
        'Ship_Sea_Galleon_Variant1_Celestial',
        new THREE.Color(0.70, 0.95, 1.25),
        new THREE.Color(0x003366),
        0.7,
        [0.86, 0.92, 0.86]        // Sleek, nimble frigate
      );
      scene.add(celestialShip);

      const celestialBeacons = attachGlowBeacons(celestialShip, 0x00e5ff, galleonBeaconPositions);
      this.ships.push({
        name: 'The Celestial Moonwhisper',
        object: celestialShip,
        progress: 0.38,            // Spawns off North Citadel Cape (different side of island)
        speed: 5.2,               // 5.2 m/s (Swift cruising arcane corsair)
        lateralOffset: 8.5,        // Outer deep-water lane (+8.5m)
        waveFreq: 2.3,
        wavePhase: 2.1,
        heaveScale: 0.16,
        pitchScale: 0.040,
        rollScale: 0.055,
        bankMultiplier: 22.0,
        lanternLights: celestialBeacons.lights,
        lanternMeshes: celestialBeacons.meshes,
      });

      // ---------------------------------------------------------
      // Ship 3: "The Crimson Phoenix" (Variant 2: Blazing Ruby Dreadnought)
      // ---------------------------------------------------------
      const crimsonShip = cloneShipWithMaterial(
        baseGalleon,
        'Ship_Sea_Galleon_Variant2_Crimson',
        new THREE.Color(1.25, 0.70, 0.65),
        new THREE.Color(0x661100),
        0.7,
        [1.15, 1.10, 1.15]        // Heavy, broad, stately dreadnought
      );
      scene.add(crimsonShip);

      const crimsonBeacons = attachGlowBeacons(crimsonShip, 0xff2222, galleonBeaconPositions);
      this.ships.push({
        name: 'The Crimson Phoenix',
        object: crimsonShip,
        progress: 0.71,            // Spawns off Western Anvil Cove (third distinct location)
        speed: 3.8,               // 3.8 m/s (Heavy war dreadnought)
        lateralOffset: -7.5,      // Inner coastward lane (-7.5m)
        waveFreq: 1.7,
        wavePhase: 4.2,
        heaveScale: 0.12,
        pitchScale: 0.028,
        rollScale: 0.038,
        bankMultiplier: 15.0,
        lanternLights: crimsonBeacons.lights,
        lanternMeshes: crimsonBeacons.meshes,
      });
    }

    // ---------------------------------------------------------
    // 3. MOORED SHIPS (Do NOT touch their positions - stay at harbor dock)
    // ---------------------------------------------------------
    this.mooredArrival = scene.getObjectByName('Ship_Moored_Arrival') || null;
    this.mooredTender = scene.getObjectByName('Ship_Moored_Tender') || null;

    if (this.mooredArrival) {
      this.mooredArrival.matrixAutoUpdate = true;
      this.arrivalBase = this.mooredArrival.position.clone();
      this.arrivalRot = this.mooredArrival.rotation.clone();
    }

    if (this.mooredTender) {
      this.mooredTender.matrixAutoUpdate = true;
      this.tenderBase = this.mooredTender.position.clone();
      this.tenderRot = this.mooredTender.rotation.clone();
    }
  }

  private cleanupOldObjects() {
    // Remove previously cloned ships if re-initializing
    const v1 = this.scene.getObjectByName('Ship_Sea_Galleon_Variant1_Celestial');
    if (v1 && v1.parent) v1.parent.remove(v1);

    const v2 = this.scene.getObjectByName('Ship_Sea_Galleon_Variant2_Crimson');
    if (v2 && v2.parent) v2.parent.remove(v2);

    // Remove old beacon lights and gems
    const toRemove: THREE.Object3D[] = [];
    this.scene.traverse((child) => {
      if (child.name.includes('_BeaconGem_') || child.name.includes('_BeaconLight_')) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((r) => r.parent?.remove(r));
  }

  destroy() {
    this.cleanupOldObjects();
  }

  update(delta: number, elapsedTime: number) {
    // -----------------------------------------------------------
    // A. SAILING SHIPS (Each moves independently along path)
    // -----------------------------------------------------------
    if (this.curve && this.curveLength > 0) {
      for (const ship of this.ships) {
        // 1. Advance individual ship with its own speed
        const step = (ship.speed * delta) / this.curveLength;
        ship.progress = (ship.progress + step) % 1.0;

        // 2. Sample centerline point and tangent
        this.curve.getPointAt(ship.progress, this._pos);
        this.curve.getTangentAt(ship.progress, this._tangent);

        // 3. Compute perpendicular normal in XZ plane for lateral sea lane separation
        this._normal.set(-this._tangent.z, 0, this._tangent.x).normalize();
        this._pos.addScaledVector(this._normal, ship.lateralOffset);

        // 4. Compute forward heading yaw angle (bow points forward along travel direction)
        const yaw = Math.atan2(this._tangent.x, this._tangent.z) + Math.PI;

        // 5. Centrifugal turn banking
        const lookAheadT = (ship.progress + 0.008) % 1.0;
        this.curve.getTangentAt(lookAheadT, this._nextTangent);
        const turnRate = this._tangent.x * this._nextTangent.z - this._tangent.z * this._nextTangent.x;
        const bank = THREE.MathUtils.clamp(-turnRate * ship.bankMultiplier, -0.10, 0.10);

        // 6. Independent ocean wave dynamics (heave, pitch, roll)
        const heave = Math.sin(elapsedTime * ship.waveFreq + ship.wavePhase + ship.progress * 30.0) * ship.heaveScale;
        const pitch = Math.sin(elapsedTime * ship.waveFreq * 1.1 + ship.wavePhase) * ship.pitchScale;
        const roll = Math.cos(elapsedTime * ship.waveFreq * 0.85 + ship.wavePhase) * ship.rollScale + bank;

        // 7. Apply transform to ship
        ship.object.position.set(this._pos.x, this._pos.y + heave, this._pos.z);
        ship.object.rotation.set(pitch, yaw, roll, 'YXZ');

        // 8. Breathing luminous pulse for long-range night visibility
        const pulse = Math.sin(elapsedTime * 2.8 + ship.wavePhase) * 0.25;
        for (const light of ship.lanternLights) {
          const base = (light.userData.baseIntensity as number) || 2.5;
          light.intensity = base * (1.0 + pulse);
        }
        for (const mesh of ship.lanternMeshes) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 5.5 + pulse * 2.0;
        }
      }
    }

    // -----------------------------------------------------------
    // B. MOORED SHIPS (Remain strictly at their dock pier with gentle harbor swell)
    // -----------------------------------------------------------
    if (this.mooredArrival) {
      const heave = Math.sin(elapsedTime * 1.5) * 0.05;
      const pitch = Math.sin(elapsedTime * 1.1) * 0.015;
      const roll = Math.cos(elapsedTime * 0.9) * 0.02;
      this.mooredArrival.position.y = this.arrivalBase.y + heave;
      this.mooredArrival.rotation.x = this.arrivalRot.x + pitch;
      this.mooredArrival.rotation.z = this.arrivalRot.z + roll;
    }

    if (this.mooredTender) {
      const heave = Math.sin(elapsedTime * 2.2 + 0.8) * 0.04;
      const pitch = Math.sin(elapsedTime * 1.8 + 0.4) * 0.025;
      const roll = Math.cos(elapsedTime * 1.6 + 0.2) * 0.035;
      this.mooredTender.position.y = this.tenderBase.y + heave;
      this.mooredTender.rotation.x = this.tenderRot.x + pitch;
      this.mooredTender.rotation.z = this.tenderRot.z + roll;
    }
  }
}
