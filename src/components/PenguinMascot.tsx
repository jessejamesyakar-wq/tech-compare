"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * TechKıyas Maskot — Penguen
 *
 * Mouse pozisyonu SAYFANIN HERHANGİ BİR YERİNDE olsa da karakter
 * ona göre hafifçe döner/eğilir (spring fizik). Fare hareket etmediğinde
 * karakter yavaşça "nefes alır" (idle animasyonu).
 *
 * Kurulum:
 *   npm install framer-motion
 *
 * Kullanım:
 *   import PenguinMascot from "@/components/PenguinMascot";
 *   <PenguinMascot />
 *
 * public/penguin-mascot.png dosyasını projenizin public klasörüne koyun.
 */

const MAX_ROTATE = 14; // derece
const MAX_TRANSLATE = 14; // px
const MAX_LEAN = 8; // derece
const IDLE_DELAY_MS = 2000; // fare bu kadar süre durursa idle animasyonu başlar

export default function PenguinMascot() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [greeting, setGreeting] = useState("Merhaba! Ben TechKıyas asistanınım 👋");

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 140, damping: 14, mass: 1 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  const rotateY = useTransform(smoothX, [-1, 1], [-MAX_ROTATE, MAX_ROTATE]);
  const rotateX = useTransform(smoothY, [-1, 1], [MAX_ROTATE * 0.55, -MAX_ROTATE * 0.55]);
  const translateX = useTransform(smoothX, [-1, 1], [-MAX_TRANSLATE, MAX_TRANSLATE]);
  const translateY = useTransform(smoothY, [-1, 1], [-MAX_TRANSLATE * 0.5, MAX_TRANSLATE * 0.5]);
  const lean = useTransform(smoothX, [-1, 1], [-MAX_LEAN * 0.4, MAX_LEAN * 0.4]);
  const shadowOpacity = useTransform(smoothX, (v) => 1 - Math.abs(v) * 0.4);

  const scale = useSpring(1, { stiffness: 180, damping: 18 });

  // --- DÜZELTME: mousemove artık tüm pencereyi (window) dinliyor,
  // sadece maskotun kendi kutusunu değil. Böylece fare sayfanın
  // herhangi bir yerinde olsa da karakter tepki verir. ---
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let idleRAF: number;
    let idleAngle = 0;
    let isIdle = false;

    function stopIdle() {
      isIdle = false;
      cancelAnimationFrame(idleRAF);
    }

    function startIdleLoop() {
      isIdle = true;
      const loop = () => {
        if (!isIdle) return;
        idleAngle += 0.045;
        rawX.set(Math.sin(idleAngle) * 0.35);
        rawY.set(Math.cos(idleAngle * 0.6) * 0.18);
        idleRAF = requestAnimationFrame(loop);
      };
      loop();
    }

    function handleMouseMove(e: MouseEvent) {
      stopIdle();
      clearTimeout(idleTimer);

      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.4;

      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);

      rawX.set(Math.max(-1, Math.min(1, dx)));
      rawY.set(Math.max(-1, Math.min(1, dy)));

      idleTimer = setTimeout(startIdleLoop, IDLE_DELAY_MS);
    }

    function handleTouchMove(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    idleTimer = setTimeout(startIdleLoop, IDLE_DELAY_MS);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      clearTimeout(idleTimer);
      stopIdle();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnter() {
    setHovering(true);
    scale.set(1.05);
  }

  function handleLeave() {
    setHovering(false);
    scale.set(1);
  }

  function handleClick() {
    scale.set(0.93);
    setTimeout(() => scale.set(hovering ? 1.05 : 1), 110);
    setGreeting("Sana en iyi fiyatları buldum, gel bak! 🔍");
  }

  return (
    <div className="relative flex flex-col items-center gap-4 select-none">
      <div
        ref={stageRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        className="relative w-[130px] xs:w-[160px] sm:w-[210px] md:w-[250px] cursor-pointer"
        style={{ perspective: 1200 }}
      >
        {/* Gölge */}
        <motion.div
          className="absolute -bottom-3 left-1/2 h-6 w-[56%] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(15,23,42,0.24) 0%, rgba(15,23,42,0) 72%)",
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
          className="relative z-10 drop-shadow-[0_16px_22px_rgba(15,23,42,0.14)]"
        >
          <Image
            src="/penguin-mascot.png"
            alt="TechKıyas Maskot"
            width={1024}
            height={576}
            priority
            draggable={false}
            className="w-full h-auto rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-800"
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
        className="rounded-full border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-md transition-all pointer-events-none"
      >
        {greeting}
      </motion.div>

      <p className="text-[11px] tracking-wide text-slate-400 dark:text-slate-500 font-medium">
        Fareni ekranda gezdir — karakter seni takip edecek ✨
      </p>
    </div>
  );
}
