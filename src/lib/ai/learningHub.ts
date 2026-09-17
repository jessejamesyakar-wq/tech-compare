// src/lib/ai/learningHub.ts
import fs from 'fs';
import path from 'path';

export interface LearnedPattern {
  id: string;
  triggerQuery: string;
  normalizedTrigger: string;
  targetCategory?: string;
  recommendedModels?: string[];
  lessonNotes: string;
  status: 'approved' | 'pending' | 'rejected';
  safetyScore: number;
  reportedByIpHash?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface FeedbackSubmission {
  messageId: string;
  userPrompt: string;
  assistantResponse: string;
  rating: 'positive' | 'negative';
  reasonCategory?: 'misunderstood' | 'wrong_products' | 'panel_error' | 'bad_advice' | 'other';
  userComment?: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LEARNING_FILE = path.join(DATA_DIR, 'robopengu_learning_patterns.json');
const ANOMALIES_FILE = path.join(DATA_DIR, 'robopengu_anomalies.json');

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEARNING_FILE)) {
    const initialPatterns: LearnedPattern[] = [
      {
        id: 'seed-dual-budget-watch-phone',
        triggerQuery: 'kız kardeşime hediye apple watch kalan parayla telefon',
        normalizedTrigger: 'kiz kardesime hediye apple watch kalan parayla telefon',
        targetCategory: 'smartphones',
        recommendedModels: ['Apple Watch SE', 'iPhone 16 Pro', 'Xiaomi 17 Ultra'],
        lessonNotes: 'Kullanıcı hediye olarak saat ve kalan bütçeyle kendisi için telefon sorduğunda: Saat fiyatı bütçeden düşülmeli, arta kalan parayla amiral gemisi telefonlar önerilmeli, asla kıyaslama paneli açılmamalı.',
        status: 'approved',
        safetyScore: 100,
        createdAt: '2026-09-17T12:00:00.000Z',
        approvedAt: '2026-09-17T12:00:00.000Z',
      },
      {
        id: 'seed-tavsiye-vs-guard',
        triggerQuery: 'tavsiye',
        normalizedTrigger: 'tavsiye',
        lessonNotes: 'Türkçe tavsiye kelimesi ta vs iye olarak bölünmemeli, açık bir kıyaslama niyeti yoksa Karşılaştırma Paneli asla açılmamalı.',
        status: 'approved',
        safetyScore: 100,
        createdAt: '2026-09-17T12:00:00.000Z',
        approvedAt: '2026-09-17T12:00:00.000Z',
      },
    ];
    fs.writeFileSync(LEARNING_FILE, JSON.stringify(initialPatterns, null, 2), 'utf8');
  }
  if (!fs.existsSync(ANOMALIES_FILE)) {
    fs.writeFileSync(ANOMALIES_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

export function getLearnedPatterns(): LearnedPattern[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(LEARNING_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLearnedPatterns(patterns: LearnedPattern[]) {
  ensureFiles();
  fs.writeFileSync(LEARNING_FILE, JSON.stringify(patterns, null, 2), 'utf8');
}

export function getAnomalies(): FeedbackSubmission[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(ANOMALIES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAnomaly(submission: FeedbackSubmission) {
  ensureFiles();
  const list = getAnomalies();
  list.unshift(submission);
  fs.writeFileSync(ANOMALIES_FILE, JSON.stringify(list.slice(0, 500), null, 2), 'utf8');
}

const POISON_PATTERNS = [
  /\b(?:k[üu]f[üu]r|salak|aptal|orospu|pi[çc]|bok|sik|amk|aq)\b/i,
  /\b(?:hack|jailbreak|ignore\s+all\s+instructions|sistem\s+talimatlar[ıi]n[ıi]\s+unut)\b/i,
  /\b(?:korsan|ka[çc]ak|bedava|crack|keygen)\b/i,
  /\b(?:en\s+iyi\s+telefon\s+casper|casper\s+al|reeder\s+al)\b/i,
];

export function evaluateFeedbackSafety(userPrompt: string, comment?: string): { safe: boolean; score: number; reason?: string } {
  const combined = `${userPrompt} ${comment || ''}`.toLowerCase();

  for (const reg of POISON_PATTERNS) {
    if (reg.test(combined)) {
      return { safe: false, score: 0, reason: 'Manipülatif veya zararlı içerik tespiti' };
    }
  }

  if (combined.length < 5) {
    return { safe: false, score: 30, reason: 'Yetersiz içerik uzunluğu' };
  }

  if (/(.)\1{6,}/.test(combined)) {
    return { safe: false, score: 20, reason: 'Tekrarlayan karakter spam\'i' };
  }

  return { safe: true, score: 95 };
}

export function getRelevantLearnedGuidance(query: string): string {
  if (!query || typeof query !== 'string') return '';
  const patterns = getLearnedPatterns().filter((p) => p.status === 'approved');
  if (patterns.length === 0) return '';

  const lower = query.toLowerCase().replace(/['’]/g, '');

  const matches: LearnedPattern[] = [];

  for (const p of patterns) {
    const triggerWords = p.normalizedTrigger.split(/\s+/).filter((w) => w.length >= 3);
    if (triggerWords.length === 0) continue;

    const matchedWords = triggerWords.filter((w) => lower.includes(w));
    const ratio = matchedWords.length / triggerWords.length;

    if (ratio >= 0.5 || lower.includes(p.normalizedTrigger)) {
      matches.push(p);
    }
  }

  if (matches.length === 0) return '';

  const rules = matches
    .map(
      (m, idx) =>
        `${idx + 1}. [KURAL / TECRÜBE]: "${m.lessonNotes}" (Önceden Onaylanmış Doğru Yaklaşım)`
    )
    .join('\n');

  return `\n[ROBOPENGU ÖĞRENİLMİŞ BİLGİ & DENEYİM REHBERİ]:\n${rules}\n`;
}
