"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * TechKıyas Maskot — Penguen
 *
 * Mouse pozisyonuna göre tüm karakter hafifçe döner/eğilir (spring fizik).
 * Fare hareket etmediğinde karakter yavaşça "nefes alır" (idle animasyonu).
 */

const MAX_ROTATE = 14; // derece
const MAX_TRANSLATE = 14; // px
const MAX_LEAN = 8; // derece

export default function PenguinMascot() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [greeting, setGreeting] = useState("Merhaba! Ben TechKıyas asistanınım 👋");

  // Ham hedef değerler (mouse konumuna göre -1..1 arası)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring ile yumuşatılmış değerler (Framer Motion yay fiziği)
  const springConfig = { stiffness: 140, damping: 14, mass: 1 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  const rotateY = useTransform(smoothX, [-1, 1], [-MAX_ROTATE, MAX_ROTATE]);
  const rotateX = useTransform(smoothY, [-1, 1], [MAX_ROTATE * 0.55, -MAX_ROTATE * 0.55]);
  const translateX = useTransform(smoothX, [-1, 1], [-MAX_TRANSLATE, MAX_TRANSLATE]);
  const translateY = useTransform(smoothY, [-1, 1], [-MAX_TRANSLATE * 0.5, MAX_TRANSLATE * 0.5]);
  const lean = useTransform(smoothX, [-1, 1], [-MAX_LEAN * 0.4, MAX_LEAN * 0.4]);
  const shadowScaleX = useTransform(smoothX, [-1, 1], [0.85, 0.85]);
  const shadowOpacity = useTransform(smoothX, (v) => 1 - Math.abs(v) * 0.4);

  const scale = useSpring(1, { stiffness: 180, damping: 18 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.4;

    const dx = (e.clientX - cx) / (window.innerWidth / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);

    rawX.set(Math.max(-1, Math.min(1, dx)));
    rawY.set(Math.max(-1, Math.min(1, dy)));
  }

  function handleEnter() {
    setHovering(true);
    scale.set(1.05);
  }

  function handleLeave() {
    setHovering(false);
    scale.set(1);
    rawX.set(0);
    rawY.set(0);
  }

  function handleClick() {
    scale.set(0.93);
    setTimeout(() => scale.set(hovering ? 1.05 : 1), 110);
    setGreeting("Sana en iyi fiyatları buldum, gel bak! 🔍");
  }

  return (
    <div
      className="relative flex flex-col items-center gap-4 select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div
        ref={stageRef}
        onClick={handleClick}
        className="relative w-[180px] sm:w-[220px] md:w-[260px] cursor-pointer group"
        style={{ perspective: 1200 }}
      >
        {/* Gölge */}
        <motion.div
          className="absolute -bottom-3 left-1/2 h-6 w-[56%] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(15,23,42,0.24) 0%, rgba(15,23,42,0) 72%)",
            scaleX: shadowScaleX,
            opacity: shadowOpacity,
          }}
        />

        {/* Karakter */}
        <motion.div
          style={{
            translateX,
            translateY,
            rotateX,
            rotateY,
            rotateZ: lean,
            scale,
            transformStyle: "preserve-3d",
          }}
          className="relative z-10 drop-shadow-[0_16px_24px_rgba(15,23,42,0.18)]"
        >
          <Image
            src="/penguin-mascot.png"
            alt="TechKıyas Maskot"
            width={1048}
            height={1219}
            priority
            draggable={false}
            className="w-full h-auto drop-shadow-md"
          />
        </motion.div>
      </div>

      {/* Konuşma balonu */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={
          hovering
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 8, scale: 0.96 }
        }
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="rounded-full border border-emerald-500/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-lg shadow-emerald-500/10 transition-all pointer-events-none"
      >
        {greeting}
      </motion.div>

      <p className="text-[11px] tracking-wide text-slate-400 dark:text-slate-500 font-medium">
        Fareni gezdirerek maskotla etkileşime geçebilirsin ✨
      </p>
    </div>
  );
}
