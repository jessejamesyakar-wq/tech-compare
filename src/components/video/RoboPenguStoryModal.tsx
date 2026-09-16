'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Volume2, VolumeX, Sparkles, Scale, Film, Play } from 'lucide-react';
import Link from 'next/link';

interface RoboPenguStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RoboPenguStoryModal({ isOpen, onClose }: RoboPenguStoryModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Light Frosted Backdrop (NO pitch black or dark blue!) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/25 backdrop-blur-md"
          />

          {/* Modal Container: Matches Site Theme (Light mint/emerald glass, max-w-4xl, strictly within hero dimensions) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-gradient-to-br from-white via-emerald-50/95 to-teal-50/90 border-2 border-emerald-500/35 rounded-3xl shadow-[0_20px_60px_rgba(16,185,129,0.2)] overflow-hidden z-10 flex flex-col my-auto"
          >
            {/* Ambient Mint Glow Orbs */}
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-gradient-to-br from-emerald-400/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header: Clean Light Glass */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-emerald-500/15 bg-white/80 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-2xs shrink-0">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                      SİNEMATİK HİKÂYE
                    </span>
                    <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                      • www.aceleetme.tech
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                    RoboPengu&apos;nun Doğuş Hikayesi
                  </h3>
                </div>
              </div>

              {/* Close Button: Light & Clean */}
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shadow-2xs hover:scale-105"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area: Side-by-Side on Desktop (keeps height within Hero height ~360px), Stacked on Mobile */}
            <div className="relative z-10 p-3 sm:p-4 lg:p-5 grid lg:grid-cols-12 gap-4 items-center">
              
              {/* Left Column: Lore & CTAs (5 cols) */}
              <div className="lg:col-span-5 space-y-3 text-left order-2 lg:order-1">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/80 border border-emerald-300/80 px-2.5 py-0.5 rounded-lg">
                    <Film className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Orijinal 4K Sinematik</span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed">
                    Kutup buzullarındaki antika donanım enkazından, yapay zekâ destekli amiral gemisine...
                  </p>
                  <p className="text-[11px] text-emerald-800 font-bold bg-white/85 p-2 rounded-xl border border-emerald-200/80 shadow-2xs">
                    💎 <span className="text-emerald-950 font-black">Biyonik İşlemci:</span> Acele etme, en doğru teknoloji kararını algoritmalarla ver!
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <Link
                    href="/duello"
                    onClick={onClose}
                    className="flex-1 min-w-[130px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Düello Masasına Git</span>
                  </Link>
                  <button
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>

              {/* Right Column: 16:9 Video Player (7 cols) - Strictly within Hero Section Height! */}
              <div className="lg:col-span-7 relative order-1 lg:order-2 flex items-center justify-center">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg bg-black group max-h-[250px] sm:max-h-[280px]">
                  <video
                    ref={videoRef}
                    src="/videos/robopengu-origin.mp4"
                    poster="/videos/robopengu-poster.png"
                    autoPlay
                    playsInline
                    controls
                    className="w-full h-full object-contain"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Floating Custom Controls */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={toggleMute}
                      title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-all cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleRestart}
                      title="Yeniden Başlat"
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-md border border-slate-200 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default RoboPenguStoryModal;
