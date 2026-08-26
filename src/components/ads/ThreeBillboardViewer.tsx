'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Image from 'next/image';

interface ThreeBillboardViewerProps {
  modelUrl?: string;
  targetUrl?: string;
}

export function ThreeBillboardViewer({
  modelUrl = '/models/billboard.glb',
  targetUrl = 'https://www.mediamarkt.com.tr',
}: ThreeBillboardViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    // Perspective matching user uploaded low-angle shot
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(-1.2, 0.4, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // 2. Controls - Restrict to only slight left/right rotation & slight vertical pitch
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false; // keep billboard size prominent and fixed
    controls.enablePan = false;
    
    // Restricted angles (only subtle left/right rotation & slight tilt)
    controls.minAzimuthAngle = -Math.PI / 6; // -30 deg
    controls.maxAzimuthAngle = Math.PI / 6;  // +30 deg
    controls.minPolarAngle = Math.PI / 2.3;  // slightly low-angle looking up
    controls.maxPolarAngle = Math.PI / 1.8;  // cannot flip underneath

    // 3. Lighting Setup (Bright Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(6, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    fillLight.position.set(-8, 5, -2);
    scene.add(fillLight);

    // Screen Digital Glow Light
    const screenGlow = new THREE.PointLight(0xff2222, 2.2, 8);
    screenGlow.position.set(0, 1.5, 1.5);
    scene.add(screenGlow);

    // 4. Create High-Resolution Digital MediaMarkt Canvas Texture
    const createDigitalMediaMarktTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Vibrant MediaMarkt Red Background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#E60000');
      gradient.addColorStop(1, '#B30000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fine Digital LED Pixel Matrix Grid
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 1.5);
      }
      for (let x = 0; x < canvas.width; x += 4) {
        ctx.fillRect(x, 0, 1.5, canvas.height);
      }

      // Sponsorlu Reklam Badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(canvas.width - 340, 40, 300, 55, 28);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPONSORLU • MEDIAMARKT', canvas.width - 190, 76);

      // MediaMarkt Big White Title / Logo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 130px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('MediaMarkt', 100, 240);

      // Campaign Subtitle
      ctx.fillStyle = '#FFEB3B'; // Bright Gold Accent
      ctx.font = '900 68px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText('CLUB TEKNOLOJİ GÜNLERİ', 100, 360);

      // Big Discount Offer Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 52px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText('Seçili Telefon, Laptop ve TV\'lerde', 100, 460);

      // Highlight Badge
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(100, 520, 780, 120, 24);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 60px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText('%25\'E VARAN İNDİRİM', 140, 605);

      // Call to action button pill
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(100, 700, 480, 100, 50);
      ctx.fill();
      ctx.fillStyle = '#E60000';
      ctx.font = '900 42px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText('FIRSATLARI YAKALA →', 140, 768);

      // Sub-footer note
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = 'bold 28px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.fillText('Vade Farksız 6 Taksit • Aynı Gün Mağazadan Teslimat', 100, 870);

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      return texture;
    };

    const digitalTexture = createDigitalMediaMarktTexture();

    // 5. Load 3D GLB Model and Apply Digital Texture to Screen Mesh
    const loader = new GLTFLoader();
    let modelRoot: THREE.Group | null = null;

    loader.load(
      modelUrl,
      (gltf) => {
        modelRoot = gltf.scene;

        // Auto-center and auto-scale model to prominent size
        const box = new THREE.Box3().setFromObject(modelRoot);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        // Fill canvas nicely
        const scale = 4.2 / (maxDim || 1);
        modelRoot.scale.setScalar(scale);

        modelRoot.position.x = -center.x * scale;
        modelRoot.position.y = -center.y * scale - 0.1;
        modelRoot.position.z = -center.z * scale;

        // Apply digital texture to the billboard screen mesh
        modelRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const name = mesh.name.toLowerCase();
            const matName = Array.isArray(mesh.material)
              ? mesh.material.map((m) => m.name.toLowerCase()).join(' ')
              : mesh.material?.name?.toLowerCase() || '';

            // Check if mesh represents the billboard screen surface
            if (
              name.includes('screen') ||
              name.includes('board') ||
              name.includes('poster') ||
              name.includes('banner') ||
              name.includes('front') ||
              matName.includes('screen') ||
              matName.includes('board') ||
              matName.includes('poster') ||
              matName.includes('banner') ||
              matName.includes('paper')
            ) {
              if (digitalTexture) {
                mesh.material = new THREE.MeshStandardMaterial({
                  map: digitalTexture,
                  emissive: new THREE.Color(0x330000),
                  emissiveMap: digitalTexture,
                  emissiveIntensity: 0.45,
                  roughness: 0.35,
                  metalness: 0.1,
                });
              }
            }
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

    // 6. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop with Subtle Idle Breathe Sway
    let isUserInteracting = false;
    controls.addEventListener('start', () => { isUserInteracting = true; });
    controls.addEventListener('end', () => { isUserInteracting = false; });

    let reqId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle idle float when user is not dragging
      if (modelRoot && !isUserInteracting) {
        modelRoot.rotation.y = -0.15 + Math.sin(elapsedTime * 0.8) * 0.03;
      }

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
    <section className="w-full min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden bg-white py-6 px-2 sm:px-6 md:px-10 box-border select-none">
      <div className="w-full max-w-[1200px] min-h-[460px] sm:min-h-[520px] relative flex flex-col lg:flex-row items-center justify-between gap-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-3xl border border-slate-200/90 p-4 sm:p-6 md:p-8 shadow-xl">
        
        {/* Left: Prominent 3D WebGL Billboard Stage */}
        <div className="relative flex-1 w-full h-[360px] xs:h-[400px] sm:h-[480px] md:h-[520px] flex items-center justify-center rounded-2xl overflow-hidden">
          
          {/* Loading Spinner */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-xs z-10">
              <div className="w-12 h-12 border-4 border-slate-300 border-t-red-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-800">3D Metal Billboard Yükleniyor...</p>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-xs font-semibold">{error}</div>
          )}

          {/* Three.js Canvas Container */}
          <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Bottom Interactive Bar with Direct Link */}
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 flex flex-wrap items-center gap-2">
            <div className="bg-black/80 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/20 shadow-md flex items-center gap-1.5 pointer-events-none">
              <span>↔️ Sağa sola döndürebilirsiniz</span>
            </div>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-1 cursor-pointer"
            >
              <span>MediaMarkt Kampanyasına Git</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Right: Penguin Companion */}
        <div className="shrink-0 flex flex-col items-center justify-center z-10">
          <div className="relative w-[150px] xs:w-[180px] sm:w-[220px] md:w-[250px] drop-shadow-[0_16px_22px_rgba(0,0,0,0.15)]">
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

          <div className="mt-3 bg-white border border-slate-200/90 shadow-md rounded-full px-4 py-1.5 text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Canlı 3D Metal Billboard</span>
          </div>
        </div>

      </div>
    </section>
  );
}
