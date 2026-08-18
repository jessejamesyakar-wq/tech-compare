'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LogoConfig {
  type: 'image' | 'presetIcon';
  imageUrl: string;
  presetIcon: string;
  bgGradient: string;
  titleText: string;
  subtitleText: string;
}

const DEFAULT_LOGO_CONFIG: LogoConfig = {
  type: 'image',
  imageUrl: '/emblem.png',
  presetIcon: 'scale',
  bgGradient: 'from-emerald-600 via-teal-600 to-emerald-500',
  titleText: 'TechKıyas',
  subtitleText: 'Akıllı Karşılaştırma Portalı',
};

interface LogoContextType {
  logoConfig: LogoConfig;
  updateLogoConfig: (newConfig: Partial<LogoConfig>) => void;
  uploadCustomLogo: (file: File) => Promise<void>;
  resetLogo: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'tech_compare_custom_logo_v1';

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(DEFAULT_LOGO_CONFIG);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      // SSR-safe hydration read from localStorage after mount
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLogoConfig(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom logo config', e);
    }
  }, []);

  const saveConfig = (updated: LogoConfig) => {
    setLogoConfig(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom logo config', e);
    }
  };

  const updateLogoConfig = (newConfig: Partial<LogoConfig>) => {
    const updated = { ...logoConfig, ...newConfig };
    saveConfig(updated);
  };

  const uploadCustomLogo = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          updateLogoConfig({
            type: 'image',
            imageUrl: dataUrl,
          });
          resolve();
        } else {
          reject(new Error('Dosya okunamadı'));
        }
      };
      reader.onerror = () => reject(new Error('Görsel okuma hatası'));
      reader.readAsDataURL(file);
    });
  };

  const resetLogo = () => {
    saveConfig(DEFAULT_LOGO_CONFIG);
  };

  return (
    <LogoContext.Provider
      value={{
        logoConfig,
        updateLogoConfig,
        uploadCustomLogo,
        resetLogo,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (!context) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}
