import type * as Three from 'three';

/** Weld the head/torso seam through matching skin weights on both sides. */
export function connectNeckSkin(THREE: typeof import('three'), meshes: Three.Mesh[]) {
  const candidates = meshes.filter(mesh => {
    const skin = mesh as Three.SkinnedMesh;
    const indices = mesh.geometry.getAttribute('skinIndex');
    return skin.isSkinnedMesh && skin.skeleton.bones[1]?.name === 'Spine'
      && skin.skeleton.bones[2]?.name === 'Head' && indices
      && (indices.getX(0) === 1 || indices.getX(0) === 2);
  });
  if (candidates.length !== 2) return null;
  const positions = candidates[0].geometry.getAttribute('position');
  const membership = new Uint8Array(positions.count);
  for (const mesh of candidates) {
    const group = mesh.geometry.getAttribute('skinIndex').getX(0);
    const indices = mesh.geometry.getIndex();
    if (!indices) return null;
    for (let i = 0; i < indices.count; i++) membership[indices.getX(i)] |= group === 1 ? 1 : 2;
  }
  const seam: number[] = [];
  for (let i = 0; i < membership.length; i++) if (membership[i] === 3) seam.push(i);
  if (!seam.length) return null;
  const distance = new Float32Array(positions.count).fill(Infinity);
  const width = 0.08;
  for (let i = 0; i < positions.count; i++) {
    if (!membership[i]) continue;
    if (membership[i] === 3) { distance[i] = 0; continue; }
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    if (y < 0.14 || y > 0.35) continue;
    let nearest = width * width;
    for (const j of seam) {
      const dx = x - positions.getX(j), dy = y - positions.getY(j), dz = z - positions.getZ(j);
      nearest = Math.min(nearest, dx * dx + dy * dy + dz * dz);
    }
    if (nearest < width * width) distance[i] = Math.sqrt(nearest);
  }
  let blendedVertices = 0;
  for (const mesh of candidates) {
    const group = mesh.geometry.getAttribute('skinIndex').getX(0);
    const joints = mesh.geometry.getAttribute('skinIndex').clone();
    const weights = new THREE.BufferAttribute(new Float32Array(positions.count * 4), 4);
    for (let i = 0; i < positions.count; i++) {
      weights.setXYZW(i, 1, 0, 0, 0);
      if (!Number.isFinite(distance[i])) continue;
      const t = Math.min(1, distance[i] / width);
      const influence = 0.5 * (1 - t * t * (3 - 2 * t));
      const headWeight = group === 2 ? 1 - influence : influence;
      joints.setXYZW(i, 1, 2, 0, 0);
      weights.setXYZW(i, 1 - headWeight, headWeight, 0, 0);
      blendedVertices++;
    }
    mesh.geometry.setAttribute('skinIndex', joints);
    mesh.geometry.setAttribute('skinWeight', weights);
  }
  return { sharedSeamVertices: seam.length, blendedVertices, transitionWidth: width };
}
