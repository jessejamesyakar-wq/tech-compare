import { TVProduct } from './types';
import { getRecordedProductScore } from './productEvidence';

export interface TVScoreCategory {
  title: string;
  score: number | null;
  maxScore: number;
  details: string;
  iconName: string;
}

export interface TVScoreResult {
  totalScore: number | null;
  categories: Record<'display' | 'gaming' | 'audio' | 'smart' | 'design', TVScoreCategory>;
}

/** Catalog scores are preserved as records, never synthesized from missing specs,
 * a model year, marketing words, or a user star rating. They are not lab results. */
export function calculateTVScore(tv: TVProduct): TVScoreResult {
  const specs = (tv.specs || {}) as unknown as Record<string, unknown>;
  const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
  const refresh = typeof specs.refreshRateHz === 'number' && Number.isFinite(specs.refreshRateHz) && specs.refreshRateHz > 0 ? `${specs.refreshRateHz} Hz` : null;
  const category = (title: string, details: string | null, iconName: string): TVScoreCategory => ({title,score:null,maxScore:100,details:details || 'Katalogda bilgi yok',iconName});
  return {
    totalScore: getRecordedProductScore(tv),
    categories: {
      display: category('Ekran ve Panel', [text(specs.displayTech),text(specs.resolution)].filter(Boolean).join(' • '), 'Tv'),
      gaming: category('Yenileme Hızı',refresh,'Gamepad2'),
      audio: category('Ses Sistemi',text(specs.soundSystem) || text(specs.audioSystem),'Volume2'),
      smart: category('Akıllı TV Sistemi',text(specs.smartOs),'Cpu'),
      design: category('Tasarım',text(specs.design),'Sparkles'),
    },
  };
}
