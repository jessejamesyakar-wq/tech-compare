'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Image from 'next/image';

interface ThreeBillboardViewerProps {
  modelUrl?: string;
}

export function ThreeBillboardViewer({
  modelUrl = '/models/billboard.glb',
}: ThreeBillboardViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 2. Controls (Orbit for interactive 3D inspection)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // keep layout stable
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minPolarAngle = Math.PI / 3;
    controls.autoRotate = false;

    // 3. Lighting (Studio Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.0);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    const redAccentLight = new THREE.PointLight(0xef4444, 1.8, 10);
    redAccentLight.position.set(2, 2, 3);
    scene.add(redAccentLight);

    // 4. Load 3D GLB Model
    const loader = new GLTFLoader();
    let modelRoot: THREE.Group | null = null;

    loader.load(
      modelUrl,
      (gltf) => {
        modelRoot = gltf.scene;

        // Auto-center and auto-scale model
        const box = new THREE.Box3().setFromObject(modelRoot);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.8 / (maxDim || 1);
        modelRoot.scale.setScalar(scale);

        // Center on origin
        modelRoot.position.x = -center.x * scale;
        modelRoot.position.y = -center.y * scale - 0.2;
        modelRoot.position.z = -center.z * scale;

        // Slightly angle for optimal hero perspective
        modelRoot.rotation.y = -0.35;

        // Enable shadow casting on all meshes
        modelRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(modelRoot);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading GLB:', err);
        setError('3D Model yüklenirken bir hata oluştu');
        setLoading(false);
      }
    );

    // 5. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <section className="w-full min-h-[460px] sm:min-h-[520px] flex items-center justify-center overflow-hidden bg-white py-6 px-2 sm:px-6 md:px-10 box-border select-none">
      <div className="w-full max-w-[1150px] min-h-[420px] sm:min-h-[480px] relative flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-3xl border border-slate-200/80 p-4 sm:p-6 md:p-8 shadow-xl">
        
        {/* Left: 3D WebGL Canvas Stage */}
        <div className="relative flex-1 w-full h-[320px] xs:h-[360px] sm:h-[420px] md:h-[460px] flex items-center justify-center rounded-2xl overflow-hidden">
          
          {/* Loading Spinner */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-xs z-10">
              <div className="w-10 h-10 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-700">3D Billboard Modeli Yükleniyor...</p>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-xs font-semibold">{error}</div>
          )}

          {/* Three.js Container */}
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Interactive Hint */}
          <div className="absolute bottom-3 left-3 z-10 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-md flex items-center gap-1.5 pointer-events-none">
            <span>🔄 Modeli 3D döndürmek için fareyle sürükleyin</span>
          </div>
        </div>

        {/* Right: Penguin Mascot */}
        <div className="shrink-0 flex flex-col items-center justify-center z-10">
          <div className="relative w-[150px] xs:w-[180px] sm:w-[220px] md:w-[250px] drop-shadow-[0_16px_20px_rgba(0,0,0,0.15)]">
            <Image
              src="/penguin-mascot.png"
              alt="TechKıyas Pengi"
              width={1048}
              height={1219}
              priority
              draggable={false}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="mt-3 bg-white border border-slate-200/90 shadow-md rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-800">
            Gerçek 3D Metal Billboard 🚩
          </div>
        </div>

      </div>
    </section>
  );
}
