import type * as Three from 'three';

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Local sculpt corrections on the new Meshy mesh; UVs and source maps stay intact. */
export function referencePoint(x: number, y: number, z: number): [number, number, number] {
  let px = x, py = y, pz = z;
  const trunk = smooth(-0.84, -0.72, y) * (1 - smooth(0.04, 0.18, y))
    * (1 - smooth(0.44, 0.57, Math.abs(x))) * smooth(-0.20, 0, z);
  px *= 1 - trunk * 0.075 * smooth(0.25, 0.43, Math.abs(x));
  // Raise the lower shell without moving the planted feet or belly badge.
  py += 0.025 * smooth(-0.85, -0.74, y) * (1 - smooth(-0.69, -0.48, y))
    * (1 - smooth(0.42, 0.55, Math.abs(x)));
  const front = smooth(0.25, 0.41, z);
  for (const side of [-1, 1]) {
    const cx = side < 0 ? -0.200 : 0.202;
    const dx = x - cx, dy = y - 0.544;
    const weight = (1 - smooth(0.060, 0.115, Math.hypot(dx, dy))) * front;
    px += (dx * 0.08 + side * 0.004) * weight;
    py += (dy * 0.08 + 0.003) * weight;
  }
  // Soften the central mouth notch while retaining the source gold and lip seam.
  const beak = (1 - smooth(0.12, 0.16, Math.abs(x))) * smooth(0.54, 0.60, z)
    * smooth(0.32, 0.36, y) * (1 - smooth(0.53, 0.57, y));
  const lipOffset = y - 0.445;
  const lipClosure = lipOffset * 0.40 * (1 - smooth(0.03, 0.065, Math.abs(lipOffset)));
  py += beak * (-0.008 - lipClosure);
  // Broaden the upper bill's crown instead of leaving a sharp triangular peak.
  const crown = smooth(0.475, 0.515, y) * beak;
  py += crown * (0.006 - 0.010 * (1 - smooth(0, 0.058, Math.abs(x))));
  // A little convexity under the eyes gives the white cheeks a softer rolloff.
  const cheek = (1 - smooth(0.65, 1.3, (x / 0.36) ** 2 + ((y - 0.39) / 0.14) ** 2))
    * smooth(0.25, 0.42, z) * (1 - beak);
  pz += cheek * 0.017;
  return [px, py, pz];
}

export function fitReferenceGeometry(THREE: typeof import('three'), meshes: Three.Mesh[]) {
  if (!meshes.length) return;
  const original = meshes[0].geometry.getAttribute('position');
  if (original.count !== 271425) return;
  const positions = new THREE.Float32BufferAttribute(new Float32Array(original.count * 3), 3);
  for (let i = 0; i < original.count; i++) {
    positions.setXYZ(i, ...referencePoint(original.getX(i), original.getY(i), original.getZ(i)));
  }
  // All five rigid parts share a complete vertex buffer. Calculate normals on
  // the complete surface, not separately on each part (which creates seams).
  const triangles: number[] = [];
  for (const mesh of meshes) {
    const indices = mesh.geometry.getIndex();
    if (indices) for (let i = 0; i < indices.count; i++) triangles.push(indices.getX(i));
  }
  const joined = new THREE.BufferGeometry();
  joined.setAttribute('position', positions); joined.setIndex(triangles); joined.computeVertexNormals();
  const normals = joined.getAttribute('normal');
  for (const mesh of meshes) {
    mesh.geometry.setAttribute('position', positions);
    mesh.geometry.setAttribute('normal', normals);
    mesh.geometry.computeBoundingBox(); mesh.geometry.computeBoundingSphere();
  }
  joined.dispose();
}
