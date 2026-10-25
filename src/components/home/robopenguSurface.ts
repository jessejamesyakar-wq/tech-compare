import type * as Three from 'three';

/** Non-destructive vertex tint over the NEW Meshy maps; no replacement textures. */
export function referenceSurfaceTint(THREE: typeof import('three'), positions: Three.BufferAttribute | Three.InterleavedBufferAttribute) {
  const colors = new Float32Array(positions.count * 3);
  const smooth = (a: number, b: number, value: number) => { const t = Math.max(0, Math.min(1, (value - a) / (b - a))); return t * t * (3 - 2 * t); };
  const silver = new THREE.Color('#f2f0ea'), porcelain = new THREE.Color('#e8e3d9');
  const belly = new THREE.Color('#d2c9b8'), shell = new THREE.Color('#dec6a3');
  const neutral = new THREE.Color('#ffffff'), color = new THREE.Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    color.copy(silver);
    const body = smooth(-0.76, -0.63, y) * (1 - smooth(0.12, 0.27, y));
    const bellyArea = (1 - smooth(0.88, 1.18, (x / 0.35) ** 2 + ((y + 0.25) / 0.48) ** 2)) * smooth(0.28, 0.48, z);
    color.lerp(shell, body * (1 - bellyArea));
    color.lerp(belly, body * bellyArea);
    const face = smooth(0.25, 0.33, y) * smooth(0.1, 0.35, z) * (1 - smooth(0.31, 0.4, Math.abs(x)));
    color.lerp(porcelain, face);
    const beak = (1 - smooth(0.10, 0.15, Math.abs(x))) * smooth(0.31, 0.36, y) * (1 - smooth(0.53, 0.57, y)) * smooth(0.53, 0.59, z);
    color.lerp(neutral, Math.max(beak, 1 - smooth(-0.76, -0.72, y)));
    colors.set([color.r, color.g, color.b], i * 3);
  }
  return new THREE.Float32BufferAttribute(colors, 3);
}

/** Keep the original albedo/normal/MR maps, but distinguish coated panels from metal. */
export function configureReferenceMaterial(material: Three.MeshStandardMaterial) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 referenceSurfacePosition;\nvarying vec3 vReferenceSurface;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvReferenceSurface = referenceSurfacePosition;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vReferenceSurface;')
      .replace('#include <map_fragment>', '#include <map_fragment>\nfloat sourceBrightness = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));')
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
        vec3 rp = vReferenceSurface;
        float brightness = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b));
        float faceZone = smoothstep(0.25, 0.34, rp.y) * smoothstep(0.15, 0.32, rp.z)
          * (1.0 - smoothstep(0.34, 0.41, abs(rp.x)));
        float bellyRadius = pow(rp.x / 0.35, 2.0) + pow((rp.y + 0.25) / 0.48, 2.0);
        float bellyZone = (1.0 - smoothstep(0.85, 1.15, bellyRadius)) * smoothstep(0.28, 0.48, rp.z);
        float shoulderRadius = pow((abs(rp.x) - 0.35) / 0.15, 2.0) + pow((rp.y + 0.04) / 0.25, 2.0);
        float shoulderZone = (1.0 - smoothstep(0.8, 1.2, shoulderRadius)) * smoothstep(0.18, 0.38, rp.z);
        float ceramic = max(faceZone, max(bellyZone, shoulderZone)) * smoothstep(0.20, 0.42, sourceBrightness);
        float beakZone = (1.0 - smoothstep(0.10, 0.16, abs(rp.x)))
          * smoothstep(0.31, 0.37, rp.y) * (1.0 - smoothstep(0.53, 0.57, rp.y)) * smoothstep(0.53, 0.59, rp.z);
        float goldZone = max(beakZone, 1.0 - smoothstep(-0.84, -0.76, rp.y))
          * smoothstep(0.015, 0.08, diffuseColor.r - diffuseColor.b);
        ceramic *= 1.0 - goldZone;
        float metalZone = (1.0 - ceramic) * smoothstep(0.02, 0.06, brightness);
        metalnessFactor = mix(metalnessFactor, max(metalnessFactor, 0.78), metalZone);
        metalnessFactor = mix(metalnessFactor, 0.025, ceramic);
        roughnessFactor = mix(roughnessFactor, clamp(roughnessFactor * 0.78, 0.25, 0.36), ceramic);
        roughnessFactor = mix(roughnessFactor, clamp(roughnessFactor, 0.32, 0.48), metalZone * 0.5);
        metalnessFactor = mix(metalnessFactor, 0.94, goldZone);
        roughnessFactor = mix(roughnessFactor, clamp(roughnessFactor * 0.85, 0.25, 0.38), goldZone);
        // Lift the silver midtones while retaining the dark engraved seams.
        float silverZone = metalZone * (1.0 - goldZone);
        diffuseColor.rgb = mix(diffuseColor.rgb, pow(max(diffuseColor.rgb, vec3(0.0)), vec3(0.88)), silverZone * 0.75);
        float helmetZone = smoothstep(0.28, 0.40, rp.y) * silverZone;
        metalnessFactor = mix(metalnessFactor, 0.60, helmetZone);
        roughnessFactor = mix(roughnessFactor, 0.46, helmetZone);
        diffuseColor.rgb *= 1.0 + goldZone * 0.10;
      `)
      .replace('#include <normal_fragment_maps>', `
        vec3 smoothSurfaceNormal = normal;
        #include <normal_fragment_maps>
        // The generated normal map exaggerated dents on the bill and coated panels.
        // Preserve the map, its engraving and wear; soften only those two surfaces.
        normal = normalize(mix(normal, smoothSurfaceNormal, max(ceramic * 0.22, beakZone * 0.55)));
      `);
  };
  material.customProgramCacheKey = () => 'robopengu-reference-surfaces-v3';
  material.needsUpdate = true;
}

/** Bias the studio softbox to the upper left, as in the supplied front view. */
export function configureReferenceStudio(room: Three.Scene) {
  for (const object of room.children) {
    const light = object as Three.PointLight;
    if (light.isPointLight) light.intensity *= 0.72;
    const mesh = object as Three.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) continue;
    const surface = mesh.material as Three.MeshLambertMaterial;
    if (!surface.isMeshLambertMaterial || !surface.emissiveIntensity) continue;
    if (mesh.position.z > 10) {
      mesh.position.x = -5;
      mesh.position.y = 11;
      mesh.scale.x = 6.5;
      surface.emissiveIntensity *= 0.6;
    } else {
      surface.emissiveIntensity *= mesh.position.x > 10 ? 0.5 : 0.72;
    }
  }
}
