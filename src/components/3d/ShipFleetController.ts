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
    pathMesh.visible = false; // Hide guide mesh from rendering
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
// 3. SHIP CONTROLLER WITH WAVE PITCH, ROLL, AND TURNING BANK
// -------------------------------------------------------------
export class ShipFleetController {
  curve: THREE.CatmullRomCurve3;
  curveLength: number; // approx total distance in meters
  seaShip: THREE.Object3D | null = null;
  progress: number = 0.0;
  speed: number = 4.5; // sailing speed in meters per second

  // Moored Vessels at Harbor Pier
  mooredArrival: THREE.Object3D | null = null;
  mooredTender: THREE.Object3D | null = null;

  // Cache initial base positions for moored ships
  arrivalBase: THREE.Vector3 = new THREE.Vector3();
  arrivalRot: THREE.Euler = new THREE.Euler();
  tenderBase: THREE.Vector3 = new THREE.Vector3();
  tenderRot: THREE.Euler = new THREE.Euler();

  // Reusable math objects (zero GC pressure)
  private _pos: THREE.Vector3 = new THREE.Vector3();
  private _tangent: THREE.Vector3 = new THREE.Vector3();
  private _nextTangent: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Object3D) {
    this.curve = createShipPath(scene);
    this.curveLength = this.curve.getLength();

    // Moving Galleon
    this.seaShip = scene.getObjectByName('Ship_Sea_Galleon') || null;
    if (this.seaShip) {
      this.seaShip.matrixAutoUpdate = true;
      this.seaShip.traverse((child) => {
        child.matrixAutoUpdate = true;
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
    // -----------------------------------------------------------
    // A. TRAVELING SHIP (Ship_Sea_Galleon)
    // -----------------------------------------------------------
    if (this.seaShip && this.curve && this.curveLength > 0) {
      // 1. Advance progress along closed curve [0, 1)
      const step = (this.speed * delta) / this.curveLength;
      this.progress = (this.progress + step) % 1.0;

      // 2. Sample curve position and tangent vector
      this.curve.getPointAt(this.progress, this._pos);
      this.curve.getTangentAt(this.progress, this._tangent);

      // 3. Compute forward heading yaw angle (bow points in direction of travel)
      // Note: The ship mesh was authored with its bow along -Z (glTF forward convention),
      // so Math.PI is added so the bow (not stern) faces along the curve tangent.
      const yaw = Math.atan2(this._tangent.x, this._tangent.z) + Math.PI;

      // 4. Calculate centrifugal turn banking (ship leans slightly into turns)
      const lookAheadT = (this.progress + 0.008) % 1.0;
      this.curve.getTangentAt(lookAheadT, this._nextTangent);
      const turnRate = this._tangent.x * this._nextTangent.z - this._tangent.z * this._nextTangent.x;
      const bank = THREE.MathUtils.clamp(-turnRate * 18.0, -0.08, 0.08);

      // 5. Ocean wave dynamics (heave, pitch, roll)
      const waveFreq = 2.0;
      const heave = Math.sin(elapsedTime * waveFreq + this.progress * 25.0) * 0.14;
      const pitch = Math.sin(elapsedTime * waveFreq * 1.1) * 0.035;
      const roll = Math.cos(elapsedTime * waveFreq * 0.85) * 0.045 + bank;

      // 6. Apply to ship transform
      this.seaShip.position.set(this._pos.x, this._pos.y + heave, this._pos.z);
      this.seaShip.rotation.set(pitch, yaw, roll, 'YXZ');
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
