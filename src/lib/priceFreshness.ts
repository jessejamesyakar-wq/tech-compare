/**
 * Price Freshness & Store Offer Taxonomy Helper
 * Stage 2 Requirement Compliance
 */

import { parseOfferDateToMs, formatObservedDate } from './dateParsing';

export const PRICE_FRESHNESS_HOURS = 24;
export const MAX_ALLOWED_OFFER_AGE_DAYS = 30;

export interface PriceFreshnessResult {
  status: 'fresh' | 'stale' | 'unverified';
  label: string;
  formattedDate?: string;
}

/**
 * Validates whether a date string is a non-empty, parseable ISO/date string
 */
export function isValidDateString(dateStr?: string): boolean {
  return parseOfferDateToMs(dateStr) > 0;
}

/**
 * Validates whether an offer date is valid, NOT in the future, and within allowed freshness window.
 * Default max age: 30 days.
 */
export function isValidFreshOfferDate(dateStr?: string, maxAgeDays: number = MAX_ALLOWED_OFFER_AGE_DAYS, nowMs = Date.now()): boolean {
  if (!isValidDateString(dateStr)) return false;
  if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0 || !Number.isFinite(nowMs)) return false;
  const diffMs = nowMs - parseOfferDateToMs(dateStr);

  // Rejects future timestamps (diffMs < 0)
  if (diffMs < 0) return false;

  // Rejects stale timestamps older than maxAgeDays
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  if (diffMs > maxAgeMs) return false;

  return true;
}

/**
 * Evaluates price freshness according to Stage 2 requirements:
 * - checked <= 24h: "Güncel Fiyat"
 * - checked > 24h & <= 30d: "Son görülen fiyat: DD.MM.YYYY"
 * - future/invalid/missing or >30d: "Fiyat doğrulanmadı"
 */
export function getPriceFreshness(lastCheckedAt?: string, nowMs = Date.now()): PriceFreshnessResult {
  if (!isValidDateString(lastCheckedAt)) {
    return { status: 'unverified', label: 'Fiyat doğrulanmadı' };
  }

  const checkedTime = parseOfferDateToMs(lastCheckedAt);
  const diffMs = nowMs - checkedTime;

  // Future timestamps are invalid
  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return { status: 'unverified', label: 'Fiyat doğrulanmadı' };
  }

  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= PRICE_FRESHNESS_HOURS) {
    return { status: 'fresh', label: 'Güncel Fiyat' };
  } else if (diffMs <= MAX_ALLOWED_OFFER_AGE_DAYS * 24 * 60 * 60 * 1000) {
    const formattedDate = formatObservedDate(checkedTime);
    return {
      status: 'stale',
      label: `Son görülen fiyat: ${formattedDate}`,
      formattedDate
    };
  } else {
    return { status: 'unverified', label: 'Fiyat doğrulanmadı' };
  }
}

/**
 * Determines whether a URL is a Search Link, Homepage Link, or Direct Offer Link
 */
export function isSearchUrl(url?: string, isSearchLinkFlag?: boolean): boolean {
  if (isSearchLinkFlag === true) return true;
  if (!url || url === '#' || url.trim() === '') return true;

  const trimmed = url.trim();

  // Store homepage roots (e.g. https://www.mediamarkt.com.tr or https://www.vatanbilgisayar.com/)
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return true;
    if (parsed.username || parsed.password) return true;
    const pathname = parsed.pathname.replace(/\/+$/, '');
    if (pathname === '' || pathname === '/') {
      return true; // Store homepage root is NOT a direct product offer!
    }
  } catch {
    return true; // Invalid URL
  }

  // Search URL patterns (Amazon /s?k=, Gaming.Gen ?s=, Hepsiburada /ara?q=, Trendyol /sr?q=, etc.)
  const searchPattern = /\/ara\?|\/sr\?|\/search|search\.html|search_results|\/arama|\/Arama|query=|[?&]q=|[?&]k=|[?&]s=|\/find\?|\/katalog|\/s\?/i;

  if (isSearchLinkFlag === false) {
    if (!searchPattern.test(trimmed)) {
      return false;
    }
  }

  return searchPattern.test(trimmed);
}
