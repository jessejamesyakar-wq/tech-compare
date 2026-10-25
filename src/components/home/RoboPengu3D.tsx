'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play, RotateCcw } from 'lucide-react';
import type { Bone, Group, Object3D, Quaternion, WebGLRenderer } from 'three';
import { createRoboPenguNaturalDetails } from './robopenguNaturalDetails';
import { BlinkTiming, idleAttention } from './robopenguMotion';
import { configureReferenceMaterial, configureReferenceStudio, referenceSurfaceTint } from './robopenguSurface';
import { fitReferenceGeometry } from './robopenguReferenceFit';
import { connectNeckSkin } from './robopenguNeck';
import styles from './RoboPengu3D.module.css';

type ModelState = 'waiting' | 'loading' | 'ready' | 'missing' | 'error';
type TrackingMode = 'body' | 'head' | 'eyes';

interface RoboPengu3DProps {
  modelUrl?: string;
  paused?: boolean;
  suspended?: boolean;
  variant?: 'preview' | 'hero';
}

type GazeSpring = { value: number; velocity: number };

function stepGazeSpring(spring: GazeSpring, target: number, frequency: number, maxSpeed: number, delta: number, limit: number) {
  const dt = Math.min(Math.max(delta, 0), 0.05);
  if (!dt) return;
  const goal = Math.max(-limit, Math.min(limit, target));
  const offset = spring.value - goal;
  const decay = Math.exp(-frequency * dt);
  const coefficient = spring.velocity + frequency * offset;
  // Closed-form critically damped response, followed by speed/anatomical limits.
  const nextValue = goal + (offset + coefficient * dt) * decay;
  const nextVelocity = (spring.velocity - frequency * coefficient * dt) * decay;
  const boundedValue = spring.value + Math.max(-maxSpeed * dt, Math.min(maxSpeed * dt, nextValue - spring.value));
  spring.value = Math.max(-limit, Math.min(limit, boundedValue));
  spring.velocity = spring.value !== boundedValue ? 0 : Math.max(-maxSpeed, Math.min(maxSpeed, nextVelocity));
  if (Math.abs(goal - spring.value) < 0.00001 && Math.abs(spring.velocity) < 0.0001) { spring.value = goal; spring.velocity = 0; }
}

/** A real GLB viewer. Missing geometry always falls back to the original image. */
export function RoboPengu3D({ modelUrl = '/models/robopengu-new-motion.glb', paused = false, suspended = false, variant = 'preview' }: RoboPengu3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const controls = useRef({ paused, suspended, manualPause: false, manualMotionAllowed: false });
  const sync = useRef<() => void>(() => {});
  const pose = useRef<(action: 'left' | 'right' | 'center' | 'greet' | 'blink') => void>(() => {});
  const [state, setState] = useState<ModelState>('waiting');
  const [tracking, setTracking] = useState<TrackingMode>('body');
  const [manualPause, setManualPause] = useState(false);
  const [manualMotionAllowed, setManualMotionAllowed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    controls.current = { paused, suspended, manualPause, manualMotionAllowed };
    sync.current();
  }, [paused, suspended, manualPause, manualMotionAllowed]);

  useEffect(() => {
    const container = mount.current;
    const element = host.current;
    if (!container || !element) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    let disposed = false, visible = false, started = false, ready = false;
    let frame = 0, previousTime = 0, motionTime = 0, lastPointerTime = 0;
    let renderer: WebGLRenderer | null = null;
    let root: Group | null = null;
    let model: Object3D | null = null;
    let resetPose: (() => void) | null = null;
    let draw: (() => void) | null = null;
    let animate: ((time: number) => void) | null = null;
    let updateSize: (() => void) | null = null;
    let targetX = 0, targetY = 0;
    let greetingStarted = -100;
    let blinkRequested = false;
    const blinkTiming = new BlinkTiming();
    const headYaw: GazeSpring = { value: 0, velocity: 0 }, headPitch: GazeSpring = { value: 0, velocity: 0 };
    const bodyYaw: GazeSpring = { value: 0, velocity: 0 }, eyeYaw: GazeSpring = { value: 0, velocity: 0 }, eyePitch: GazeSpring = { value: 0, velocity: 0 };
    const wingStretch: GazeSpring = { value: 0, velocity: 0 };
    const headRoll: GazeSpring = { value: 0, velocity: 0 };
    const springs = [headYaw, headPitch, bodyYaw, eyeYaw, eyePitch, wingStretch, headRoll];
    const resourceCleanup: (() => void)[] = [];

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
    }

    function canAnimate() {
      return !disposed && ready && visible && !document.hidden && (!media.matches || controls.current.manualMotionAllowed) &&
        !controls.current.paused && !controls.current.suspended && !controls.current.manualPause;
    }

    function synchronize() {
      if (disposed) return;
      if (visible && !started && !controls.current.suspended) void load();
      if (!canAnimate()) {
        stop();
        if (media.matches && !controls.current.manualMotionAllowed) { resetPose?.(); draw?.(); }
      } else if (!frame && animate) frame = requestAnimationFrame(animate);
    }

    function onMotionPreference() {
      setReducedMotion(media.matches);
      synchronize();
    }

    function onPointer(event: PointerEvent) {
      if (!canAnimate()) return;
      if (event.pointerType === 'touch' && !element!.contains(event.target as Node)) return;
      const box = element!.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (event.clientX - box.left - box.width / 2) / Math.max(box.width * 0.6, 1)));
      targetY = Math.max(-1, Math.min(1, (event.clientY - box.top - box.height * 0.4) / Math.max(box.height * 0.6, 1)));
      lastPointerTime = motionTime;
    }

    function onPointerLeave() { targetX = 0; targetY = 0; lastPointerTime = motionTime; }

    pose.current = action => {
      if (!canAnimate()) return;
      targetX = action === 'left' ? -1 : action === 'right' ? 1 : 0;
      targetY = 0;
      lastPointerTime = motionTime;
      if (action === 'greet') greetingStarted = motionTime;
      if (action === 'blink' || action === 'greet') blinkRequested = true;
    };

    async function load() {
      started = true;
      setState('loading');
      try {
        const response = await fetch(modelUrl, { signal: controller.signal });
        if (!response.ok) {
          if (!disposed) setState(response.status === 404 ? 'missing' : 'error');
          return;
        }
        const bytes = await response.arrayBuffer();
        if (disposed) return;
        const [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
        ]);
        if (disposed) return;
        const base = new URL('.', new URL(modelUrl, window.location.href)).href;
        const gltf = await new GLTFLoader().parseAsync(bytes, base);
        const geometries = new Set<import('three').BufferGeometry>();
        const materials = new Set<import('three').Material>();
        const textures = new Set<import('three').Texture>();
        const skeletons = new Set<import('three').Skeleton>();
        let detailSource: import('three').Mesh | null = null;
        const referenceMeshes: import('three').Mesh[] = [];
        let surfaceTint: import('three').BufferAttribute | null = null;
        gltf.scene.traverse(object => {
          const mesh = object as import('three').Mesh;
          if (!mesh.isMesh) return;
          if (mesh.geometry.getAttribute('position')?.count === 271425) {
            detailSource ??= mesh;
            referenceMeshes.push(mesh);
            mesh.geometry.setAttribute('referenceSurfacePosition', mesh.geometry.getAttribute('position'));
            surfaceTint ??= referenceSurfaceTint(THREE, mesh.geometry.getAttribute('position'));
            mesh.geometry.setAttribute('color', surfaceTint);
          }
          geometries.add(mesh.geometry);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if ((mesh as import('three').SkinnedMesh).isSkinnedMesh) skeletons.add((mesh as import('three').SkinnedMesh).skeleton);
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            materials.add(material);
            if (surfaceTint && (material as import('three').MeshStandardMaterial).isMeshStandardMaterial) {
              (material as import('three').MeshStandardMaterial).vertexColors = true;
              (material as import('three').MeshStandardMaterial).envMapIntensity = 0.85;
              configureReferenceMaterial(material as import('three').MeshStandardMaterial);
            }
            // Preserve the source PBR maps: eyes, ceramic panels and metal must
            // retain their different surface responses instead of one flat preset.
            for (const value of Object.values(material)) if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) textures.add(value as import('three').Texture);
          }
        });
        const freeModel = () => {
          geometries.forEach(value => value.dispose());
          materials.forEach(value => value.dispose());
          skeletons.forEach(value => value.dispose());
          textures.forEach(value => {
            const image = value.source?.data;
            if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close();
            value.dispose();
          });
        };
        if (disposed) { freeModel(); return; }
        resourceCleanup.push(freeModel);
        fitReferenceGeometry(THREE, referenceMeshes);
        if (referenceMeshes.length && !connectNeckSkin(THREE, referenceMeshes)) {
          throw new Error('The new model neck seam could not be connected');
        }
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
        camera.position.set(0, 0.05, 4.8);
        camera.lookAt(0, 0, 0);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.82;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.domElement.setAttribute('aria-hidden', 'true');
        const canvas = renderer.domElement;
        const onContextLost = (event: Event) => {
          event.preventDefault();
          if (disposed) return;
          ready = false; stop(); setState('error');
        };
        canvas.addEventListener('webglcontextlost', onContextLost);
        resourceCleanup.push(() => canvas.removeEventListener('webglcontextlost', onContextLost));
        container!.appendChild(renderer.domElement);
        const room = new RoomEnvironment();
        configureReferenceStudio(room);
        const environmentGenerator = new THREE.PMREMGenerator(renderer);
        try {
          const environment = environmentGenerator.fromScene(room, 0.04);
          scene.environment = environment.texture;
          scene.environmentIntensity = 1.05;
          resourceCleanup.push(() => environment.dispose());
        } finally { room.dispose(); environmentGenerator.dispose(); }
        scene.add(new THREE.HemisphereLight(0xffffff, 0x65676d, 0.25));
        const key = new THREE.DirectionalLight(0xfff7ec, 1.65);
        key.position.set(-3, 5, 4);
        key.castShadow = true;
        key.shadow.mapSize.set(512, 512);
        key.shadow.camera.left = key.shadow.camera.bottom = -2;
        key.shadow.camera.right = key.shadow.camera.top = 2;
        key.shadow.camera.near = 0.1; key.shadow.camera.far = 16;
        key.shadow.bias = -0.0003; key.shadow.normalBias = 0.015;
        key.shadow.radius = 8; key.shadow.blurSamples = 16;
        scene.add(key);
        resourceCleanup.push(() => key.shadow.dispose());
        const rim = new THREE.DirectionalLight(0xe4edff, 0.75);
        rim.position.set(-3, 2, -2); scene.add(rim);
        model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const largest = Math.max(size.x, size.y, size.z);
        if (!Number.isFinite(largest) || largest <= 0) throw new Error('Empty model');
        const normalized = new THREE.Group();
        normalized.scale.setScalar(2.55 / largest);
        model.position.sub(center);
        normalized.add(model);
        root = new THREE.Group(); root.add(normalized); scene.add(root);
        const floorGeometry = new THREE.PlaneGeometry(5, 5);
        const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.07 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -size.y * normalized.scale.y / 2 - 0.025;
        floor.receiveShadow = true;
        scene.add(floor);
        resourceCleanup.push(() => { floorGeometry.dispose(); floorMaterial.dispose(); });

        // Only bones with recognizable names may receive independent gaze offsets.
        // An arbitrary mesh called "head" need not have a safe rotation pivot.
        let head: Bone | null = null;
        const torsoCandidates: Bone[] = [];
        const eyes: Bone[] = [];
        const wings: Bone[] = [];
        model.traverse(object => {
          const bone = object as Bone;
          if (!bone.isBone) return;
          const name = bone.name.toLowerCase().replace(/^mixamorig\d*[:_]?/, '').replace(/[\s_.:\-]/g, '');
          if (name === 'head') head = bone;
          if (['spine', 'spine2', 'chest', 'upperchest'].includes(name)) torsoCandidates.push(bone);
          if (['lefteye', 'righteye', 'eyel', 'eyer'].includes(name)) eyes.push(bone);
          if (['leftarm', 'rightarm', 'leftwing', 'rightwing'].includes(name)) wings.push(bone);
        });
        const headBone = head as Bone | null;
        const torsoBone = torsoCandidates.find(bone => {
          for (let parent = headBone?.parent; parent; parent = parent.parent) if (parent === bone) return true;
          return false;
        });
        const headRest = headBone?.quaternion.clone();
        const torsoRest = torsoBone?.quaternion.clone();
        const eyeRest = new Map<Bone, Quaternion>(eyes.map(eye => [eye, eye.quaternion.clone()]));
        const wingRest = new Map<Bone, Quaternion>(wings.map(wing => [wing, wing.quaternion.clone()]));
        root.updateMatrixWorld(true);
        const wingSides = new Map<Bone, number>(wings.map(wing => [wing, Math.sign(wing.getWorldPosition(new THREE.Vector3()).x)]));
        const hasEyeRig = !!headBone && eyes.length >= 2;
        const details = detailSource ? createRoboPenguNaturalDetails(THREE, detailSource, headBone, torsoBone ?? null) : null;
        if (details) resourceCleanup.push(() => details.dispose());
        setTracking(headBone ? (hasEyeRig || details ? 'eyes' : 'head') : 'body');
        const gaze = new THREE.Quaternion();
        const parentOrientation = new THREE.Quaternion();
        const localGaze = new THREE.Quaternion();
        const gazeEuler = new THREE.Euler(0, 0, 0, 'YXZ');
        const applyWorldGaze = (bone: Bone, pitch: number, yaw: number, roll = 0) => {
          gazeEuler.set(pitch, yaw, roll); gaze.setFromEuler(gazeEuler);
          if (bone.parent) bone.parent.getWorldQuaternion(parentOrientation);
          else parentOrientation.identity();
          // Imported joint axes can differ. Transform the camera-aligned
          // offset into parent space instead of assuming local Y is upright.
          localGaze.copy(parentOrientation).invert().multiply(gaze).multiply(parentOrientation);
          bone.quaternion.premultiply(localGaze);
          bone.updateMatrixWorld(true);
        };
        const restoreBones = () => {
          if (torsoBone && torsoRest) torsoBone.quaternion.copy(torsoRest);
          if (headBone && headRest) headBone.quaternion.copy(headRest);
          for (const eye of eyes) eye.quaternion.copy(eyeRest.get(eye)!);
          for (const wing of wings) wing.quaternion.copy(wingRest.get(wing)!);
        };
        resetPose = () => {
          restoreBones();
          root!.position.set(0, 0, 0); root!.rotation.set(0, 0, 0);
          targetX = targetY = 0;
          motionTime = lastPointerTime = 0;
          for (const spring of springs) { spring.value = 0; spring.velocity = 0; }
          greetingStarted = -100;
          blinkTiming.reset(); blinkRequested = false;
          details?.setGaze(0, 0); details?.setBlink(0);
        };
        draw = () => { if (!disposed && renderer) renderer.render(scene, camera); };
        updateSize = () => {
          if (disposed || !renderer) return;
          const width = Math.max(container!.clientWidth, 1), height = Math.max(container!.clientHeight, 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          // Fit both dimensions: a narrow phone must retain both wing tips.
          const fit = Math.max(size.y, size.x / camera.aspect) * normalized.scale.y / (2 * halfFov);
          camera.position.z = fit * 1.14 + size.z * normalized.scale.z / 2;
          camera.position.y = camera.position.z * 0.075;
          camera.lookAt(0, -0.11, 0);
          camera.updateProjectionMatrix(); draw?.();
        };
        animate = time => {
          frame = 0;
          if (!canAnimate()) return;
          const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
          previousTime = time; motionTime += delta;
          restoreBones();
          root!.position.set(0, 0, 0);
          root!.rotation.set(0, 0, 0);
          const idleTime = Math.max(0, motionTime - lastPointerTime - 4.5);
          let attentionX = targetX, attentionY = targetY;
          if (idleTime > 0) {
            // Hold each small glance for several seconds; the springs handle
            // transitions without perpetual oscillation or floating feet.
            [attentionX, attentionY] = idleAttention(idleTime);
          }
          if (headBone) {
            // The torso follows the already-moving head more slowly. Only an
            // upper-body bone moves, leaving the hips, legs and feet at rest.
            stepGazeSpring(bodyYaw, torsoBone ? headYaw.value * 0.16 : 0, 3.2, 0.16, delta, 0.045);
            const bodyAngle = torsoBone ? bodyYaw.value : 0;
            const greetingTime = motionTime - greetingStarted;
            const greeting = greetingTime >= 0 && greetingTime < 2.6;
            const nod = greeting ? Math.sin(Math.PI * greetingTime / 2.6) ** 2 * Math.sin(greetingTime * 2 * Math.PI / 1.3) * 0.07 : 0;
            stepGazeSpring(headYaw, attentionX * 0.32 - bodyAngle, 8, 0.9, delta, 0.32);
            stepGazeSpring(headPitch, attentionY * 0.075 + nod, 9, 0.6, delta, 0.09);
            stepGazeSpring(headRoll, idleTime > 0 ? attentionX * -0.025 : 0, 4, 0.08, delta, 0.02);
            root!.updateMatrixWorld(true);
            if (torsoBone) applyWorldGaze(torsoBone,
              Math.sin(motionTime * 1.45) * 0.0035,
              bodyAngle,
              Math.sin(motionTime * 0.57) * 0.004 - bodyAngle * 0.12);
            applyWorldGaze(headBone, headPitch.value, headYaw.value, headRoll.value);
            const blink = blinkTiming.update(motionTime, attentionX, blinkRequested);
            blinkRequested = false;
            if (hasEyeRig || details) {
              // A genuine eye rig can lead the head, then settle as it catches up.
              const microGaze = idleTime > 0 ? Math.sin(Math.floor(idleTime / 2.3) * 2.399) * 0.008 : 0;
              stepGazeSpring(eyeYaw, attentionX * 0.46 - headYaw.value - bodyAngle + microGaze, 24, 2.2, delta, 0.16);
              stepGazeSpring(eyePitch, attentionY * 0.17 - headPitch.value, 24, 1.6, delta, 0.11);
              for (const eye of eyes) applyWorldGaze(eye, eyePitch.value, eyeYaw.value);
              details?.setGaze(eyeYaw.value / 0.18 * (1 - blink * 0.8), eyePitch.value / 0.12 * (1 - blink * 0.8));
            }
            details?.setBlink(blink);
            {
              const gestureTime = idleTime % 19;
              const stretch = gestureTime > 8 && gestureTime < 11.5 ? Math.sin((gestureTime - 8) / 3.5 * Math.PI) ** 2 * 0.05 : 0;
              const salute = greeting ? Math.sin(Math.PI * greetingTime / 2.6) ** 2 * 0.07 : 0;
              stepGazeSpring(wingStretch, Math.max(stretch, salute), 6, 0.12, delta, 0.07);
              for (const wing of wings) {
                const side = wingSides.get(wing) || 0;
                const restingMotion = Math.sin(motionTime * 1.1 + side * 0.7) * 0.003;
                applyWorldGaze(wing, restingMotion, 0, wingStretch.value * side * (greeting && side < 0 ? 0.2 : 1));
              }
            }
          } else {
            // An unrigged model can only turn as a whole; do not imply head/eyes.
            stepGazeSpring(bodyYaw, attentionX * 0.18, 5.5, 0.45, delta, 0.18);
            root!.rotation.y = bodyYaw.value;
          }
          draw?.(); frame = requestAnimationFrame(animate!);
        };
        ready = true;
        updateSize();
        setState('ready');
        synchronize();
      } catch (error) {
        if (!disposed && !(error instanceof DOMException && error.name === 'AbortError')) {
          ready = false; stop();
          resourceCleanup.splice(0).forEach(cleanup => cleanup());
          renderer?.dispose(); renderer?.domElement.remove(); renderer = null;
          setState('error');
        }
      }
    }

    const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; synchronize(); }, { threshold: 0.05 });
    const resize = new ResizeObserver(() => updateSize?.());
    intersection.observe(element); resize.observe(element);
    media.addEventListener('change', onMotionPreference);
    document.addEventListener('visibilitychange', synchronize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    element.addEventListener('pointerdown', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    sync.current = synchronize;
    onMotionPreference();
    return () => {
      disposed = true; controller.abort(); stop(); sync.current = () => {};
      intersection.disconnect(); resize.disconnect();
      media.removeEventListener('change', onMotionPreference);
      document.removeEventListener('visibilitychange', synchronize);
      window.removeEventListener('pointermove', onPointer);
      element.removeEventListener('pointerdown', onPointer);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      pose.current = () => {};
      resourceCleanup.forEach(cleanup => cleanup());
      renderer?.dispose(); renderer?.domElement.remove();
    };
  }, [modelUrl, attempt]);

  const effectiveReducedMotion = reducedMotion && !manualMotionAllowed;
  const stopped = paused || suspended || manualPause || effectiveReducedMotion;
  const status = state === 'ready'
    ? effectiveReducedMotion ? 'Hareket azaltma tercihiniz açık. İsterseniz bu önizlemede hareketi başlatabilirsiniz.'
      : stopped ? 'Hareket duraklatıldı.'
        : tracking === 'eyes' ? 'Bakış, göz kırpma ve beden hareketleri açık.' : tracking === 'head' ? 'Baş takibi açık.' : 'Gövde takibi açık.'
    : state === 'missing' ? '3D model henüz eklenmedi. Mevcut RoboPengu görseli gösteriliyor.'
      : state === 'error' ? '3D model açılamadı. Mevcut RoboPengu görseli gösteriliyor.'
        : '3D model hazırlanıyor…';

  return <div className={`${styles.viewer} ${variant === 'hero' ? styles.hero : ''}`} ref={host} data-model-state={state} data-tracking={state === 'ready' ? tracking : undefined}>
    <div className={styles.stage} role="img" aria-label={state === 'ready' ? 'Etkileşimli üç boyutlu RoboPengu' : 'RoboPengu görseli'} tabIndex={state === 'ready' ? 0 : -1} onKeyDown={event => {
      const action = ({ ArrowLeft: 'left', ArrowRight: 'right', Home: 'center', Enter: 'greet', b: 'blink', B: 'blink' } as const)[event.key as 'ArrowLeft' | 'ArrowRight' | 'Home' | 'Enter' | 'b' | 'B'];
      if (action) { event.preventDefault(); pose.current(action); }
    }}>
      <div className={styles.canvas} ref={mount} />
      {state !== 'ready' && <Image src={variant === 'hero' ? '/assets/robopengu-quantum.webp' : '/models/robopengu-new-reference.png'} alt="" width={640} height={640} className={styles.fallback} sizes="(max-width: 767px) 90vw, 560px" />}
    </div>
    {state === 'ready' && variant === 'preview' && <div className={styles.gestures} role="group" aria-label="RoboPengu hareketleri">
      <button type="button" disabled={stopped} onClick={() => pose.current('left')}>← Sola bak</button>
      <button type="button" disabled={stopped} onClick={() => pose.current('center')}>Ortaya bak</button>
      <button type="button" disabled={stopped} onClick={() => pose.current('right')}>Sağa bak →</button>
      <button type="button" disabled={stopped} onClick={() => pose.current('greet')}>Selam ver</button>
      <button type="button" disabled={stopped} onClick={() => pose.current('blink')}>Göz kırp</button>
    </div>}
    <div className={styles.toolbar}>
      <p role="status" aria-live="polite">{status}</p>
      {state === 'ready' && <button type="button" disabled={paused || suspended} aria-pressed={!stopped} onClick={() => {
        if (effectiveReducedMotion) { setManualMotionAllowed(true); setManualPause(false); }
        else setManualPause(value => !value);
      }}>
        {stopped ? <Play size={16} /> : <Pause size={16} />}{stopped ? 'Hareketi başlat' : 'Hareketi durdur'}
      </button>}
      {(state === 'missing' || state === 'error') && <button type="button" onClick={() => setAttempt(value => value + 1)}><RotateCcw size={16} />Yeniden dene</button>}
    </div>
  </div>;
}
