'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLogo } from '@/context/LogoContext';
import {
  Scale,
  Cpu,
  Zap,
  Shield,
  Flame,
  Rocket,
  Crown,
  Sparkles,
  Edit3
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  scale: Scale,
  cpu: Cpu,
  zap: Zap,
  shield: Shield,
  flame: Flame,
  rocket: Rocket,
  crown: Crown,
  sparkles: Sparkles,
};

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showEditBadge?: boolean;
}

export function Logo({ variant = 'light', size = 'md', showEditBadge = true }: LogoProps) {
  const isDarkTheme = variant === 'dark';
  
  // Try to use context safely, or fallback to defaults
  let logoConfig = {
    type: 'presetIcon',
    imageUrl: '/emblem.png',
    presetIcon: 'scale',
    bgGradient: 'from-emerald-600 via-teal-600 to-emerald-500',
    titleText: 'aceleEtme',
    subtitleText: 'Akıllı Karşılaştırma & Fiyat Takip',
  };
  let setIsModalOpen: ((open: boolean) => void) | undefined = undefined;

  try {
    const context = useLogo();
    logoConfig = context.logoConfig;
    setIsModalOpen = context.setIsModalOpen;
  } catch (e) {
    // If rendered outside LogoProvider
  }

  const IconComponent = ICON_MAP[logoConfig.presetIcon] || Scale;

  const handleOpenCustomizer = (e: React.MouseEvent) => {
    if (setIsModalOpen) {
      e.preventDefault();
      e.stopPropagation();
      setIsModalOpen(true);
    }
  };

  return (
    <div
      className="flex items-center gap-3 select-none group cursor-pointer"
      title="Ana Sayfaya Git"
    >
      {/* Emblem Icon / Custom Image Container */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className="relative shrink-0"
      >
        {logoConfig.type === 'image' && logoConfig.imageUrl ? (
          <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 p-0.5 border-2 border-emerald-500/40 shadow-md shadow-emerald-500/10 flex items-center justify-center overflow-hidden ring-2 ring-emerald-400/20">
            <img
              src={logoConfig.imageUrl}
              alt="TechKıyas Penguen Maskotu"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        ) : (
          <div
            className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${
              logoConfig.bgGradient || 'from-emerald-600 via-teal-600 to-emerald-500'
            } text-white flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-400/30`}
          >
            <IconComponent className="w-5 h-5 text-white stroke-[2.2]" />

            {/* Microchip Crown Badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border border-white dark:border-slate-900">
              <Cpu className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          </div>
        )}

        {/* Hover Edit Badge ("Amblem Değiştir") */}
        {showEditBadge && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
            <Edit3 className="w-2.5 h-2.5" />
          </div>
        )}
      </motion.div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <span
          className={`text-xl sm:text-2xl font-black tracking-tight font-sans ${
            isDarkTheme ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          {logoConfig.titleText || 'aceleEtme'}
        </span>
        <span
          className={`text-[9px] tracking-[0.2em] font-black uppercase mt-0.5 ${
            isDarkTheme ? 'text-emerald-400/90' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {logoConfig.subtitleText || 'Akıllı Karşılaştırma & Fiyat Takip'}
        </span>
      </div>
    </div>
  );
}
