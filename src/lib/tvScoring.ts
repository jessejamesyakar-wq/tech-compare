import { TVProduct } from './types';

export interface TVScoreCategory {
  title: string;
  score: number; // 0 - 100
  maxScore: number;
  details: string;
  iconName: string;
}

export interface TVScoreResult {
  totalScore: number; // 0 - 100
  categories: {
    display: TVScoreCategory;
    gaming: TVScoreCategory;
    audio: TVScoreCategory;
    smart: TVScoreCategory;
    design: TVScoreCategory;
  };
}

/**
 * Computes an authoritative 100-point Epey/TechCompare score for any TV model
 */
export function calculateTVScore(tv: TVProduct): TVScoreResult {
  const nameUpper = tv.name.toUpperCase();
  const tech = (tv.specs?.displayTech || '').toUpperCase();
  const refresh = tv.specs?.refreshRateHz || 60;
  const year = tv.releaseYear || 2024;
  const rating = tv.rating || 4.5;
  const price = tv.basePrice || 30000;
  const highlightsStr = (tv.highlights || []).join(' ').toUpperCase();
  const tagsStr = (tv.tags || []).join(' ').toUpperCase();
  const combinedSpecs = `${nameUpper} ${tech} ${highlightsStr} ${tagsStr}`;

  // 1. DISPLAY & PANEL SCORE (Max 100)
  let displayScore = 75;
  if (combinedSpecs.includes('QD-OLED')) {
    displayScore = 99;
  } else if (combinedSpecs.includes('OLED+')) {
    displayScore = 98;
  } else if (combinedSpecs.includes('OLED EX')) {
    displayScore = 97;
  } else if (combinedSpecs.includes('OLED EVO')) {
    displayScore = 96;
  } else if (combinedSpecs.includes('OLED')) {
    displayScore = 95;
  } else if (combinedSpecs.includes('QD-MINI LED') || combinedSpecs.includes('QD-MINILED')) {
    displayScore = 96;
  } else if (combinedSpecs.includes('MINI-LED') || combinedSpecs.includes('MINI LED') || combinedSpecs.includes('NEO QLED')) {
    displayScore = 93;
  } else if (combinedSpecs.includes('QLED')) {
    displayScore = 86;
  } else {
    displayScore = 78;
  }

  if (combinedSpecs.includes('8K')) displayScore = Math.min(100, displayScore + 3);
  if (combinedSpecs.includes('DOLBY VISION') || combinedSpecs.includes('HDR10+')) displayScore = Math.min(100, displayScore + 1);

  // 2. GAMING & MOTION SCORE (Max 100)
  let gamingScore = 70;
  if (refresh >= 144) {
    gamingScore = 99;
  } else if (refresh >= 120) {
    gamingScore = 95;
  } else {
    gamingScore = 74;
  }

  if (combinedSpecs.includes('VRR') || combinedSpecs.includes('ALLM') || combinedSpecs.includes('FREESYNC') || combinedSpecs.includes('HDMI 2.1')) {
    gamingScore = Math.min(100, gamingScore + 4);
  }

  // 3. AUDIO & ACOUSTICS SCORE (Max 100)
  let audioScore = 75;
  if (combinedSpecs.includes('BOWERS & WILKINS') || combinedSpecs.includes('BOWERS') || combinedSpecs.includes('B&W')) {
    audioScore = 98;
  } else if (combinedSpecs.includes('SUBWOOFER') || combinedSpecs.includes('102W') || combinedSpecs.includes('95W') || combinedSpecs.includes('70W')) {
    audioScore = 94;
  } else if (combinedSpecs.includes('DOLBY ATMOS') || combinedSpecs.includes('50W') || combinedSpecs.includes('40W')) {
    audioScore = 88;
  } else {
    audioScore = 78;
  }

  // 4. SMART TV & PROCESSING SCORE (Max 100)
  let smartScore = 80;
  if (combinedSpecs.includes('GOOGLE TV') || combinedSpecs.includes('ANDROID TV') || combinedSpecs.includes('WEBOS') || combinedSpecs.includes('TIZEN')) {
    smartScore = 92;
  } else if (combinedSpecs.includes('SAPHI') || combinedSpecs.includes('ROKU')) {
    smartScore = 82;
  } else {
    smartScore = 85;
  }

  if (combinedSpecs.includes('P5 AI DUAL') || combinedSpecs.includes('NEURAL QUANTUM') || combinedSpecs.includes('AIPQ PRO') || combinedSpecs.includes('P5 AI')) {
    smartScore = Math.min(100, smartScore + 6);
  }

  // 5. DESIGN & AMBILIGHT SCORE (Max 100)
  let designScore = 82;
  if (combinedSpecs.includes('AMBILIGHT 4') || combinedSpecs.includes('4-SIDE') || combinedSpecs.includes('4-TARAFLI')) {
    designScore = 99;
  } else if (combinedSpecs.includes('AMBILIGHT 3') || combinedSpecs.includes('3-SIDE') || combinedSpecs.includes('3-TARAFLI') || combinedSpecs.includes('AMBILIGHT')) {
    designScore = 94;
  } else if (combinedSpecs.includes('ÇERÇEVESİZ') || combinedSpecs.includes('FRAMELESS') || combinedSpecs.includes('THE FRAME')) {
    designScore = 90;
  }

  // Release year adjustment (Newer tech gets small boost)
  const yearBonus = (year - 2020) * 0.5;

  // Weighted Average for overall 100 score
  const weighted = (displayScore * 0.35) + (gamingScore * 0.25) + (audioScore * 0.15) + (smartScore * 0.15) + (designScore * 0.10) + yearBonus;

  // Clamp score between 60 and 99
  const totalScore = Math.min(99, Math.max(60, Math.round(weighted)));

  return {
    totalScore,
    categories: {
      display: {
        title: 'Görüntü ve Panel Kalitesi',
        score: Math.min(100, displayScore),
        maxScore: 100,
        details: `${tech || 'LED'} Panel, 4K Ultra HD, Dolby Vision & HDR10+`,
        iconName: 'Tv'
      },
      gaming: {
        title: 'Yenileme Hızı ve Oyun (Motion & Gaming)',
        score: Math.min(100, gamingScore),
        maxScore: 100,
        details: `${refresh}Hz Yenileme Hızı, VRR, ALLM Düşük Gecikme`,
        iconName: 'Gamepad2'
      },
      audio: {
        title: 'Ses Sistemi ve Akustik (Audio)',
        score: Math.min(100, audioScore),
        maxScore: 100,
        details: combinedSpecs.includes('BOWERS') ? 'Bowers & Wilkins Entegre Soundbar, Dolby Atmos' : 'Dolby Atmos & DTS:X Akustik Ses',
        iconName: 'Volume2'
      },
      smart: {
        title: 'İşlemci ve Akıllı TV (Smart OS)',
        score: Math.min(100, smartScore),
        maxScore: 100,
        details: `${tv.specs?.smartOs || 'Smart TV'} İşletim Sistemi, AI Görsel İşlemci`,
        iconName: 'Cpu'
      },
      design: {
        title: 'Tasarım ve Ambilight Işıklandırma',
        score: Math.min(100, designScore),
        maxScore: 100,
        details: combinedSpecs.includes('AMBILIGHT') ? 'Philips Ambilight Ortam Işıklandırması & Metal Çerçeve' : 'İnce Metal Çerçeve ve Ergonomik Ayak',
        iconName: 'Sparkles'
      }
    }
  };
}
