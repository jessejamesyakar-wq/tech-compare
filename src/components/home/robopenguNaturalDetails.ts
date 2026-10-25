import type * as Three from 'three';
import { referencePoint } from './robopenguReferenceFit';

type ThreeModule = typeof import('three');

export interface RoboPenguNaturalDetails {
  /** Normalized, already-smoothed attention coordinates; small eye-only travel. */
  setGaze: (x: number, y: number) => void;
  setBlink: (amount: number) => void;
  dispose: () => void;
}

/**
 * Reversible details for the 2026-10-25 Ultra source (271,425 vertices).
 * Its 8K albedo lost the reference's blue irises and cyan power glyph.
 * These layered physical surfaces leave every original GLB/map byte intact.
 * Call in the bind pose, after model transforms and bone discovery.
 */
export function createRoboPenguNaturalDetails(
  THREE: ThreeModule,
  sourceMesh: Three.Mesh,
  head: Three.Object3D | null,
  torso: Three.Object3D | null,
): RoboPenguNaturalDetails | null {
  const positions = sourceMesh.geometry.getAttribute('position');
  sourceMesh.geometry.computeBoundingBox();
  const bounds = sourceMesh.geometry.boundingBox;
  if (positions.count !== 271425 || !bounds ||
    Math.abs(bounds.max.y - 0.948841) > 0.0001 || Math.abs(bounds.min.y + 0.949039) > 0.0001) return null;

  const roots: Three.Group[] = [];
  const eyePivots: Three.Group[] = [];
  const lids: { mesh: Three.Mesh; upper: boolean; positions: Three.BufferAttribute }[] = [];
  const lidEdges: Three.Line[] = [];
  const geometries = new Set<Three.BufferGeometry>();
  const materials = new Set<Three.Material>();
  const forward = new THREE.Vector3(0, 0, 1);

  const material = <T extends Three.Material>(value: T): T => { materials.add(value); return value; };
  const geometry = <T extends Three.BufferGeometry>(value: T): T => { geometries.add(value); return value; };
  const mesh = (shape: Three.BufferGeometry, surface: Three.Material) => {
    const object = new THREE.Mesh(shape, surface);
    object.castShadow = false;
    object.receiveShadow = false;
    return object;
  };

  function anchor(name: string, position: Three.Vector3, normal: Three.Vector3, bone: Three.Object3D | null) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(...referencePoint(position.x, position.y, position.z));
    group.quaternion.setFromUnitVectors(forward, normal.normalize());
    sourceMesh.add(group);
    sourceMesh.updateWorldMatrix(true, true);
    if (bone) { bone.updateWorldMatrix(true, false); bone.attach(group); }
    roots.push(group);
    return group;
  }

  function cap(radius: number, bulge: number, colors?: (r: number, angle: number) => Three.Color) {
    const segments = 96, rings = 16;
    const points: number[] = [0, 0, bulge], rgb: number[] = [];
    if (colors) { const c = colors(0, 0); rgb.push(c.r, c.g, c.b); }
    const triangles: number[] = [];
    for (let ring = 1; ring <= rings; ring++) {
      const r = radius * ring / rings;
      for (let segment = 0; segment <= segments; segment++) {
        const angle = segment / segments * Math.PI * 2;
        points.push(Math.cos(angle) * r, Math.sin(angle) * r, bulge * (1 - (r / radius) ** 2));
        if (colors) { const c = colors(r / radius, angle); rgb.push(c.r, c.g, c.b); }
      }
    }
    for (let segment = 0; segment < segments; segment++) triangles.push(0, 1 + segment, 2 + segment);
    for (let ring = 0; ring < rings - 1; ring++) {
      for (let segment = 0; segment < segments; segment++) {
        const inner = 1 + ring * (segments + 1) + segment, outer = inner + segments + 1;
        triangles.push(inner, outer, outer + 1, inner, outer + 1, inner + 1);
      }
    }
    const shape = new THREE.BufferGeometry();
    shape.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    if (colors) shape.setAttribute('color', new THREE.Float32BufferAttribute(rgb, 3));
    shape.setIndex(triangles); shape.computeVertexNormals();
    return geometry(shape);
  }

  const irisDark = new THREE.Color('#111b2b');
  const irisLight = new THREE.Color('#3f536d');
  const limbus = new THREE.Color('#10202c');
  const irisShape = cap(0.055, 0.0055, (r, angle) => {
    // Radial fibers are geometry vertex colors, not a replacement bitmap.
    const fibers = 0.5 + 0.5 * Math.sin(angle * 93 + Math.sin(angle * 19) * 1.8 + r * 7);
    const radial = 0.2 + 0.35 * Math.sin(Math.min(1, Math.max(0, (r - 0.5) / 0.45)) * Math.PI);
    const color = irisDark.clone().lerp(irisLight, Math.min(0.85, radial + fibers * 0.25));
    if (r > 0.93) color.lerp(limbus, (r - 0.93) / 0.07);
    return color;
  });
  const irisSurface = material(new THREE.MeshPhysicalMaterial({
    vertexColors: true, roughness: 0.28, metalness: 0, clearcoat: 0.12, clearcoatRoughness: 0.12,
    envMapIntensity: 0.2, specularIntensity: 0.25,
  }));
  const pupilShape = cap(0.0375, 0.0038);
  const pupilSurface = material(new THREE.MeshPhysicalMaterial({
    color: '#010203', roughness: 0.12, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.06,
    envMapIntensity: 0.14, specularIntensity: 0.22,
  }));
  const lensShape = cap(0.0558, 0.0145);
  const lensSurface = material(new THREE.MeshPhysicalMaterial({
    color: '#20252b', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.13,
    depthWrite: false, clearcoat: 0.9, clearcoatRoughness: 0.035, envMapIntensity: 0.45, specularIntensity: 0.8,
  }));
  const eyeBackingShape = cap(0.057, 0.0005);
  const eyeBackingSurface = material(new THREE.MeshStandardMaterial({
    color: '#030609', roughness: 0.42, metalness: 0, envMapIntensity: 0.05,
  }));
  const catchlightShape = geometry(new THREE.SphereGeometry(0.0065, 16, 12));
  const catchlightSurface = material(new THREE.MeshBasicMaterial({
    color: '#e6edf3', transparent: true, opacity: 0.58, depthWrite: false,
  }));
  const rimShape = geometry(new THREE.TorusGeometry(0.0563, 0.0013, 8, 96));
  const rimSurface = material(new THREE.MeshStandardMaterial({ color: '#16232e', roughness: 0.22, metalness: 0.3 }));
  const lidSurface = material(new THREE.MeshPhysicalMaterial({
    color: '#c6c2b5', roughness: 0.38, metalness: 0.35,
    clearcoat: 0.12, envMapIntensity: 0.45, side: THREE.DoubleSide,
  }));
  const lidEdgeSurface = material(new THREE.LineBasicMaterial({ color: '#57564f', transparent: true, opacity: 0.7 }));
  function eyelid(upper: boolean) {
    // An oblate shell sweeps over the existing glass aperture. The mesh keeps
    // a fixed topology; only its latitude changes during a blink.
    const shape = geometry(new THREE.BufferGeometry());
    shape.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(13 * 49 * 3), 3));
    const indices: number[] = [];
    for (let row = 0; row < 12; row++) for (let col = 0; col < 48; col++) {
      const a = row * 49 + col, b = a + 49;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    shape.setIndex(indices);
    const object = mesh(shape, lidSurface);
    object.visible = false;
    object.position.z = 0.0025;
    object.frustumCulled = false;
    lids.push({ mesh: object, upper, positions: shape.getAttribute('position') as Three.BufferAttribute });
    return object;
  }
  for (const side of [-1, 1]) {
    // Measured front lens surfaces: the faces point slightly outwards.
    const eye = anchor(`RoboPengu ${side < 0 ? 'left' : 'right'} eye detail`,
      new THREE.Vector3(side < 0 ? -0.200 : 0.202, 0.544, 0.472),
      new THREE.Vector3(side * 0.29, 0.10, 0.951), head);
    eye.scale.multiplyScalar(1.08);
    const pivot = new THREE.Group();
    pivot.position.z = -0.04;
    const layers = new THREE.Group(); layers.position.z = 0.04;
    const iris = mesh(irisShape, irisSurface);
    const pupil = mesh(pupilShape, pupilSurface); pupil.position.z = 0.0032;
    const lens = mesh(lensShape, lensSurface); lens.position.z = 0.001;
    layers.add(iris, pupil, lens);
    const backing = mesh(eyeBackingShape, eyeBackingSurface); backing.position.z = -0.0003;
    pivot.add(layers); eye.add(backing, pivot, mesh(rimShape, rimSurface), eyelid(true), eyelid(false));
    // Small corneal catchlight stays on the outer lens, independent of gaze.
    // The moving opaque eyelids pass in front of it during closure.
    const catchlight = mesh(catchlightShape, catchlightSurface);
    catchlight.position.set(-0.014, 0.019, 0.0135);
    catchlight.scale.set(0.7, 1, 0.2); eye.add(catchlight);
    const edgeShape = geometry(new THREE.BufferGeometry());
    edgeShape.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(49 * 3), 3));
    const edge = new THREE.Line(edgeShape, lidEdgeSurface);
    edge.visible = false; edge.frustumCulled = false; edge.position.z = 0.0033;
    eye.add(edge); lidEdges.push(edge);
    eyePivots.push(pivot);
  }

  // The source's button is recessed behind the silver ring.
  const button = anchor('RoboPengu power detail',
    new THREE.Vector3(0, -0.130, 0.586), new THREE.Vector3(0, 0.227, 0.974), torso);
  button.scale.multiplyScalar(1.1);
  const buttonSurface = material(new THREE.MeshPhysicalMaterial({
    color: '#02060a', roughness: 0.52, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.2,
    envMapIntensity: 0.03, specularIntensity: 0.05,
  }));
  button.add(mesh(cap(0.050, 0.0014), buttonSurface));
  const bezel = mesh(geometry(new THREE.TorusGeometry(0.052, 0.0018, 10, 96)),
    material(new THREE.MeshStandardMaterial({ color: '#c4c2b8', metalness: 0.7, roughness: 0.3 })));
  bezel.position.z = 0.002; button.add(bezel);
  const glow = material(new THREE.MeshStandardMaterial({
    color: '#3fbbe9', emissive: '#139bce', emissiveIntensity: 0.6, roughness: 0.3, metalness: 0,
    envMapIntensity: 0.1,
  }));
  const arcPoints: Three.Vector3[] = [];
  const arcStart = Math.PI / 2 + 0.57, arcLength = Math.PI * 2 - 1.14;
  for (let i = 0; i <= 64; i++) {
    const angle = arcStart + arcLength * i / 64;
    arcPoints.push(new THREE.Vector3(Math.cos(angle) * 0.024, Math.sin(angle) * 0.024, 0.0035));
  }
  const arc = geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPoints), 64, 0.0026, 8, false));
  const bar = geometry(new THREE.TubeGeometry(new THREE.LineCurve3(
    new THREE.Vector3(0, 0.010, 0.0035), new THREE.Vector3(0, 0.034, 0.0035)), 1, 0.0026, 8, false));
  button.add(mesh(arc, glow), mesh(bar, glow));
  const tipShape = geometry(new THREE.SphereGeometry(0.0026, 12, 8));
  for (const point of [arcPoints[0], arcPoints[64], new THREE.Vector3(0, 0.010, 0.0035), new THREE.Vector3(0, 0.034, 0.0035)]) {
    const tip = mesh(tipShape, glow); tip.position.copy(point); button.add(tip);
  }

  // Fine segmented engravings around the power module, fitted to the actual
  // chest surface rather than a floating flat decal. No invented lettering.
  const chestSamples: [number, number, number][] = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    if (Math.abs(x) < 0.22 && y > -0.35 && y < 0.09 && z > 0.43) chestSamples.push([x, y, z]);
  }
  const engravedPoints: number[] = [];
  function onChest(x: number, y: number) {
      // Keep the same four samples, including stable ordering for equal
      // distances, without allocating and sorting the entire chest per mark.
      const nearest: { p: [number, number, number]; d: number }[] = [];
      for (const p of chestSamples) {
        const d = (p[0] - x) ** 2 + (p[1] - y) ** 2;
        if (nearest.length === 4 && d >= nearest[3].d) continue;
        let slot = nearest.length;
        while (slot > 0 && d < nearest[slot - 1].d) slot--;
        nearest.splice(slot, 0, { p, d });
        if (nearest.length > 4) nearest.pop();
      }
    let total = 0, height = 0;
    for (const sample of nearest) {
      const weight = 1 / Math.max(1e-9, sample.d);
      total += weight; height += sample.p[2] * weight;
    }
    return [x, y, height / total + 0.003];
  }
  if (chestSamples.length) {
    for (let i = 0; i < 96; i++) {
      if (i % 24 >= 18) continue;
      const angle = i / 96 * Math.PI * 2;
      for (const radius of [i % 4 === 0 ? 0.145 : 0.154, 0.169]) {
        engravedPoints.push(...onChest(Math.cos(angle) * radius, -0.13 + Math.sin(angle) * radius));
      }
    }
    const markings = new THREE.LineSegments(
      geometry(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(engravedPoints, 3))),
      material(new THREE.LineBasicMaterial({ color: '#57544e', transparent: true, opacity: 0.48, depthWrite: false })),
    );
    markings.name = 'RoboPengu chest engravings';
    const engravingRoot = new THREE.Group(); engravingRoot.add(markings);
    sourceMesh.add(engravingRoot); sourceMesh.updateWorldMatrix(true, true);
    if (torso) { torso.updateWorldMatrix(true, false); torso.attach(engravingRoot); }
    roots.push(engravingRoot);
  }

  return {
    setGaze(x, y) {
      const yaw = Math.max(-1, Math.min(1, x)) * 0.18;
      const pitch = Math.max(-1, Math.min(1, y)) * 0.12;
      for (const eye of eyePivots) eye.rotation.set(pitch, yaw, 0, 'YXZ');
    },
    setBlink(amount) {
      const blink = Math.max(0, Math.min(1, amount));
      for (const edge of lidEdges) {
        edge.visible = blink > 0.08;
        if (!edge.visible) continue;
        const points = edge.geometry.getAttribute('position');
        const theta = blink * Math.PI * 0.55;
        for (let col = 0; col <= 48; col++) {
          const phi = col / 48 * Math.PI;
          points.setXYZ(col, -0.0595 * Math.cos(phi) * Math.sin(theta),
            0.0595 * Math.cos(theta), 0.0195 * Math.sin(phi) * Math.sin(theta));
        }
        points.needsUpdate = true;
      }
      for (const lid of lids) {
        lid.mesh.visible = blink > 0.002;
        if (!lid.mesh.visible) continue;
        const start = lid.upper ? 0 : Math.PI - blink * Math.PI * 0.45;
        const span = blink * Math.PI * (lid.upper ? 0.55 : 0.45);
        for (let row = 0; row <= 12; row++) {
          const theta = start + row / 12 * span;
          for (let col = 0; col <= 48; col++) {
            const phi = col / 48 * Math.PI;
            lid.positions.setXYZ(row * 49 + col,
              -0.0595 * Math.cos(phi) * Math.sin(theta),
              0.0595 * Math.cos(theta),
              0.0195 * Math.sin(phi) * Math.sin(theta));
          }
        }
        lid.positions.needsUpdate = true;
        lid.mesh.geometry.computeVertexNormals();
      }
    },
    dispose() {
      roots.forEach(group => group.removeFromParent());
      geometries.forEach(value => value.dispose());
      materials.forEach(value => value.dispose());
    },
  };
}
