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
  // Option A: Extract directly from the exported GLB mesh
  const pathMesh = scene.getObjectByName('ship_path') as THREE.Mesh | undefined;
  if (pathMesh && pathMesh.geometry && pathMesh.geometry.attributes && pathMesh.geometry.attributes.position) {
    pathMesh.visible = false; // Hide guide mesh ribbon from rendering
    pathMesh.updateMatrixWorld(true);
    const pos = pathMesh.geometry.attributes.position;
    const waypoints: THREE.Vector3[] = [];

    // Sample centerline points from the ribbon vertices
    for (let i = 0; i < pos.count; i += 2) {
      const p1 = new THREE.Vector3().fromBufferAttribute(pos, i);
      const p2 = new THREE.Vector3().fromBufferAttribute(pos, Math.min(i + 1, pos.count - 1));
      const mid = p1.add(p2).multiplyScalar(0.5);
      mid.applyMatrix4(pathMesh.matrixWorld);
      waypoints.push(mid);
    }
    if (waypoints.length >= 3) {
      return new THREE.CatmullRomCurve3(waypoints, true); // true = closed loop
    }
  }

  // Option B: Fallback pre-calculated waypoint array (Exact island coordinates)
  const points = BAKED_WAYPOINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  return new THREE.CatmullRomCurve3(points, true);
}

// -------------------------------------------------------------
// 3. SHIP VARIANT INTERFACE & HELPERS
// -------------------------------------------------------------
export interface GalleonVariant {
  name: string;
  object: THREE.Object3D;
  progressOffset: number;
  wavePhase: number;
  speed: number;
  primaryColor: number;
  lanternLights: THREE.PointLight[];
  lanternMeshes: THREE.Mesh[];
}

/**
 * Attaches glowing crystal beacons and point lights to the ship
 * (Main Masthead, Bowsprit Tip, and Stern Castle) for long-range night visibility.
 */
function attachShipGlowBeacons(
  shipObj: THREE.Object3D,
  colorHex: number
): { lights: THREE.PointLight[]; meshes: THREE.Mesh[] } {
  const lights: THREE.PointLight[] = [];
  const meshes: THREE.Mesh[] = [];

  const beaconConfigs = [
    { pos: [0, 10.3, 0.2] as const, size: 0.45, lightIntensity: 3.8, lightDist: 35 }, // Main Masthead Beacon
    { pos: [0, 3.4, -7.6] as const, size: 0.32, lightIntensity: 2.2, lightDist: 24 }, // Bowsprit Lantern
    { pos: [0, 5.2, 7.2] as const, size: 0.38, lightIntensity: 2.8, lightDist: 30 },  // Stern Castle Lantern
  ];

  beaconConfigs.forEach((cfg, idx) => {
    // 1. Faceted glowing arcane crystal core
    const gemGeo = new THREE.OctahedronGeometry(cfg.size, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: 5.5,
      roughness: 0.15,
      metalness: 0.85,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    gemMesh.name = `${shipObj.name}_BeaconGem_${idx}`;
    gemMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    gemMesh.castShadow = false;
    gemMesh.receiveShadow = false;
    shipObj.add(gemMesh);
    meshes.push(gemMesh);

    // 2. PointLight illuminating sails, deck, and reflecting across water at night
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
 * Deep-clones the galleon mesh with tinted palette and custom emissive highlights.
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
  clone.scale.set(...scale);
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
// 4. SHIP FLEET CONTROLLER (Multi-Ship Convoy + Night Beacons)
// -------------------------------------------------------------
export class ShipFleetController {
  curve: THREE.CatmullRomCurve3;
  curveLength: number; // approx total distance in meters
  progress: number = 0.0;
  baseSpeed: number = 4.5; // sailing speed in meters per second

  // 3 Traveling Ships (Flagship + 2 Unique Variants spaced out on the loop)
  variants: GalleonVariant[] = [];

  // Moored Vessels at Harbor Pier
  mooredArrival: THREE.Object3D | null = null;
  mooredTender: THREE.Object3D | null = null;

  // Cache initial base positions for moored ships
  arrivalBase: THREE.Vector3 = new THREE.Vector3();
  arrivalRot: THREE.Euler = new THREE.Euler();
  tenderBase: THREE.Vector3 = new THREE.Vector3();
  tenderRot: THREE.Euler = new THREE.Euler();

  // Reusable math objects (zero GC allocations per frame)
  private _pos: THREE.Vector3 = new THREE.Vector3();
  private _tangent: THREE.Vector3 = new THREE.Vector3();
  private _nextTangent: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Object3D) {
    this.curve = createShipPath(scene);
    this.curveLength = this.curve.getLength();

    // Base Galleon from 3D Model
    const baseGalleon = scene.getObjectByName('Ship_Sea_Galleon');

    if (baseGalleon) {
      baseGalleon.matrixAutoUpdate = true;
      baseGalleon.traverse((child) => {
        child.matrixAutoUpdate = true;
      });

      // ---------------------------------------------------------
      // Ship 1: "The Golden Sovereign" (Flagship, Warm Golden Amber)
      // ---------------------------------------------------------
      const flagBeacons = attachShipGlowBeacons(baseGalleon, 0xffaa22);
      this.variants.push({
        name: 'The Golden Sovereign (Flagship)',
        object: baseGalleon,
        progressOffset: 0.0,
        wavePhase: 0.0,
        speed: this.baseSpeed,
        primaryColor: 0xffaa22,
        lanternLights: flagBeacons.lights,
        lanternMeshes: flagBeacons.meshes,
      });

      // ---------------------------------------------------------
      // Ship 2: "The Celestial Moonwhisper" (Variant 1: Ethereal Cyan / Azure)
      // ---------------------------------------------------------
      const celestialShip = cloneShipWithMaterial(
        baseGalleon,
        'Ship_Sea_Galleon_Variant1_Celestial',
        new THREE.Color(0.7, 0.95, 1.25), // Luminous azure tint
        new THREE.Color(0x003366),
        0.6,
        [0.92, 0.95, 0.92] // Sleek, nimble arcane frigate
      );
      scene.add(celestialShip);

      const celestialBeacons = attachShipGlowBeacons(celestialShip, 0x00e5ff); // Radiant neon cyan beacons
      this.variants.push({
        name: 'The Celestial Moonwhisper',
        object: celestialShip,
        progressOffset: 0.3333, // Spaced 1/3 ahead on the island loop
        wavePhase: 2.1,
        speed: this.baseSpeed,
        primaryColor: 0x00e5ff,
        lanternLights: celestialBeacons.lights,
        lanternMeshes: celestialBeacons.meshes,
      });

      // ---------------------------------------------------------
      // Ship 3: "The Crimson Phoenix" (Variant 2: Blazing Ruby / Molten Ember)
      // ---------------------------------------------------------
      const crimsonShip = cloneShipWithMaterial(
        baseGalleon,
        'Ship_Sea_Galleon_Variant2_Crimson',
        new THREE.Color(1.25, 0.72, 0.68), // Fiery crimson warmth
        new THREE.Color(0x661100),
        0.6,
        [1.10, 1.08, 1.10] // Stately, heavy dreadnought
      );
      scene.add(crimsonShip);

      const crimsonBeacons = attachShipGlowBeacons(crimsonShip, 0xff2828); // Blazing ruby red beacons
      this.variants.push({
        name: 'The Crimson Phoenix',
        object: crimsonShip,
        progressOffset: 0.6667, // Spaced 2/3 ahead on the island loop
        wavePhase: 4.2,
        speed: this.baseSpeed,
        primaryColor: 0xff2828,
        lanternLights: crimsonBeacons.lights,
        lanternMeshes: crimsonBeacons.meshes,
      });
    }

    // Moored Vessels at Harbor Pier
    this.mooredArrival = scene.getObjectByName('Ship_Moored_Arrival') || null;
    this.mooredTender = scene.getObjectByName('Ship_Moored_Tender') || null;

    if (this.mooredArrival) {
      this.mooredArrival.matrixAutoUpdate = true;
      this.mooredArrival.traverse((child) => {
        child.matrixAutoUpdate = true;
      });
      this.arrivalBase = this.mooredArrival.position.clone();
      this.arrivalRot = this.mooredArrival.rotation.clone();
      // Add subtle dock lanterns to moored ship as well
      attachShipGlowBeacons(this.mooredArrival, 0xffaa33);
    }

    if (this.mooredTender) {
      this.mooredTender.matrixAutoUpdate = true;
      this.mooredTender.traverse((child) => {
        child.matrixAutoUpdate = true;
      });
      this.tenderBase = this.mooredTender.position.clone();
      this.tenderRot = this.mooredTender.rotation.clone();
    }
  }

  update(delta: number, elapsedTime: number) {
    if (!this.curve || this.curveLength <= 0) return;

    // 1. Advance master convoy progress along closed curve [0, 1)
    const step = (this.baseSpeed * delta) / this.curveLength;
    this.progress = (this.progress + step) % 1.0;

    // -----------------------------------------------------------
    // A. TRAVELING FLEET (Flagship + 2 Unique Variants)
    // -----------------------------------------------------------
    for (const v of this.variants) {
      const shipProgress = (this.progress + v.progressOffset) % 1.0;

      // Sample curve position and tangent vector
      this.curve.getPointAt(shipProgress, this._pos);
      this.curve.getTangentAt(shipProgress, this._tangent);

      // Compute forward heading yaw angle (bow points in direction of travel)
      // Note: The ship mesh was authored with its bow along -Z (glTF forward convention),
      // so Math.PI is added so the bow (not stern) faces along the curve tangent.
      const yaw = Math.atan2(this._tangent.x, this._tangent.z) + Math.PI;

      // Calculate centrifugal turn banking (ship leans slightly into turns)
      const lookAheadT = (shipProgress + 0.008) % 1.0;
      this.curve.getTangentAt(lookAheadT, this._nextTangent);
      const turnRate = this._tangent.x * this._nextTangent.z - this._tangent.z * this._nextTangent.x;
      const bank = THREE.MathUtils.clamp(-turnRate * 18.0, -0.08, 0.08);

      // Ocean wave dynamics (heave, pitch, roll) with unique phase per ship
      const waveFreq = 2.0;
      const heave = Math.sin(elapsedTime * waveFreq + v.wavePhase + shipProgress * 25.0) * 0.14;
      const pitch = Math.sin(elapsedTime * waveFreq * 1.1 + v.wavePhase) * 0.035;
      const roll = Math.cos(elapsedTime * waveFreq * 0.85 + v.wavePhase) * 0.045 + bank;

      // Apply to ship transform
      v.object.position.set(this._pos.x, this._pos.y + heave, this._pos.z);
      v.object.rotation.set(pitch, yaw, roll, 'YXZ');

      // Breathing luminous pulse for night visibility
      const pulse = Math.sin(elapsedTime * 2.8 + v.wavePhase) * 0.25;
      for (const light of v.lanternLights) {
        const base = (light.userData.baseIntensity as number) || 3.0;
        light.intensity = base * (1.0 + pulse);
      }
      for (const mesh of v.lanternMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 5.0 + pulse * 2.0;
      }
    }

    // -----------------------------------------------------------
    // B. MOORED SHIPS (Gentle harbor swell at the dock)
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
