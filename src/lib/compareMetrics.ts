// src/lib/compareMetrics.ts
/**
 * Shared comparison metrics and resolution utilities.
 * Used by DeepCompareSections, DuelArena, SpecSheet, and automated regression tests.
 */

export interface ComparisonMetricResult {
  winner?: 1 | 2 | 'tie';
  advantage?: string;
  diff?: number;
}

/**
 * Calculates PPI comparison between two displays.
 * e.g. 500 PPI vs 460 PPI -> +40 PPI Daha Keskin, winner 1.
 */
export function calculatePpiComparison(
  ppi1: number | null | undefined,
  ppi2: number | null | undefined
): ComparisonMetricResult {
  if (!ppi1 || !ppi2) return {};
  const diff = Math.abs(ppi1 - ppi2);
  if (ppi1 === ppi2) {
    return { winner: 'tie', advantage: 'Eşit Piksel Yoğunluğu', diff: 0 };
  }
  return {
    winner: ppi1 > ppi2 ? 1 : 2,
    advantage: `+${diff} PPI Daha Keskin`,
    diff,
  };
}

/**
 * Calculates wired charging wattage comparison between two devices.
 * e.g. 45W vs 45W -> Eşit Şarj Gücü, winner 'tie'.
 * e.g. 65W vs 30W -> +35W Daha Yüksek Şarj Gücü, winner 1.
 */
export function calculateWattComparison(
  watt1: number | null | undefined,
  watt2: number | null | undefined
): ComparisonMetricResult {
  if (!watt1 || !watt2) return {};
  const diff = Math.abs(watt1 - watt2);
  if (watt1 === watt2) {
    return { winner: 'tie', advantage: 'Eşit Şarj Gücü', diff: 0 };
  }
  return {
    winner: watt1 > watt2 ? 1 : 2,
    advantage: `+${diff}W Daha Yüksek Şarj Gücü`,
    diff,
  };
}

/**
 * Resolves the display text for wireless charging capability.
 * CRITICAL: undefined does NOT mean false (no support).
 * undefined means unverified data ('Doğrulanmış veri yok').
 * false means verified no support ('Kablosuz Şarj Desteği Yok').
 * true means supported ('Kablosuz Şarj Destekleniyor' or `${watts}W Kablosuz Şarj`).
 */
export function getWirelessChargingText(wc: boolean | undefined, watts?: number): string {
  if (wc === true) return watts ? `${watts}W Kablosuz Şarj` : 'Kablosuz Şarj Destekleniyor';
  if (wc === false) return 'Kablosuz Şarj Desteği Yok';
  return 'Doğrulanmış veri yok';
}

/**
 * Determines winner for wireless charging capability.
 * If either value is undefined (unverified), no winner is declared (undefined).
 */
export function getWirelessWinner(
  w1: boolean | undefined,
  w2: boolean | undefined
): 1 | 2 | 'tie' | undefined {
  if (w1 === undefined || w2 === undefined) return undefined;
  if (w1 === true && w2 === false) return 1;
  if (w2 === true && w1 === false) return 2;
  if (w1 === true && w2 === true) return 'tie';
  if (w1 === false && w2 === false) return 'tie';
  return undefined;
}

/**
 * Calculates normalized product score (out of 100) from verified catalog data only.
 * Returns null if no verified rating or score exists.
 * NEVER assumes or fabricates 4.8 / 4.7.
 */
export function getProductScore(product: {
  rating?: number;
  aceleEtmeScore?: number;
  epeyScore?: number;
}): number | null {
  if (typeof product.rating === 'number' && product.rating > 0) {
    return Math.round(product.rating * 20);
  }
  if (typeof product.aceleEtmeScore === 'number' && product.aceleEtmeScore > 0) {
    return Math.round(product.aceleEtmeScore);
  }
  if (typeof product.epeyScore === 'number' && product.epeyScore > 0) {
    return Math.round(product.epeyScore);
  }
  return null;
}

export type OverallDuelWinnerResult = 1 | 2 | 'tie' | 'insufficient_data';

/**
 * Overall duel winner calculation based on verified scores.
 * If either product lacks verified rating/score data (null), returns 'insufficient_data'.
 * NEVER assumes 4.8 / 4.7 or declares a fake winner/tie when data is missing.
 * Only if BOTH products have verified scores:
 * - score1 === score2 -> 'tie'
 * - score1 > score2 -> 1
 * - score2 > score1 -> 2
 */
export function calculateOverallDuelWinner(
  score1: number | null,
  score2: number | null
): OverallDuelWinnerResult {
  if (score1 === null || score2 === null) {
    return 'insufficient_data';
  }
  if (score1 === score2) {
    return 'tie';
  }
  return score1 > score2 ? 1 : 2;
}

/**
 * Generates the referee verdict text displayed in DuelArena.
 * For 'insufficient_data': Displays 'Genel kazananı belirlemek için yeterli doğrulanmış puan yok'.
 * Does not show trophy, 'başa baş' or 'üstün' when data is insufficient.
 */
export function getDuelRefereeVerdictText(
  winner: OverallDuelWinnerResult,
  p1Name: string,
  p2Name: string
): string {
  if (winner === 'insufficient_data') {
    return 'Genel kazananı belirlemek için yeterli doğrulanmış puan yok';
  }
  if (winner === 1) {
    return `🏆 ${p1Name} doğrulanmış kriterler ve genel puan üstünlüğüyle düelloyu önde götürüyor.`;
  }
  if (winner === 2) {
    return `🏆 ${p2Name} doğrulanmış kriterler ve genel puan üstünlüğüyle düelloyu önde götürüyor.`;
  }
  return '⚖️ İki model de doğrulanmış teknik donanım ve kullanıcı deneyimi açısından başa baş bir mücadele sergiliyor.';
}
