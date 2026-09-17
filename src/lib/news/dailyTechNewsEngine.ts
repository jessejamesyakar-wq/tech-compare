import fs from 'fs';
import path from 'path';
import {
  DailyTechNewsArticle,
  DailyTechNewsPayload,
  getFormattedTurkishDate,
  generateCuratedDailyArticles
} from './dailyTechNewsTypes';

export * from './dailyTechNewsTypes';

const CACHE_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'daily-tech-news.json');

/**
 * Server-only function that checks cache and provides fresh daily news.
 * If current time is past 09:00 AM on a new day or cache is missing/stale,
 * it refreshes and writes cache to disk.
 */
export async function getDailyTechNews(forceRefresh = false): Promise<DailyTechNewsPayload> {
  const now = new Date();
  const todayDateStr = getFormattedTurkishDate(now);

  try {
    if (!forceRefresh && fs.existsSync(CACHE_FILE_PATH)) {
      const content = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const cached = JSON.parse(content) as DailyTechNewsPayload;

      if (cached && cached.dateStr === todayDateStr && cached.articles && cached.articles.length > 0) {
        return cached;
      }
    }
  } catch {
    // If reading cache fails, proceed to generate fresh
  }

  const freshArticles = generateCuratedDailyArticles(now);
  const payload: DailyTechNewsPayload = {
    success: true,
    dateStr: todayDateStr,
    lastUpdated: now.toISOString(),
    scheduledTime: `${todayDateStr} 09:00:00`,
    count: freshArticles.length,
    articles: freshArticles
  };

  try {
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[dailyTechNewsEngine] Failed to write cache:', err);
  }

  return payload;
}
