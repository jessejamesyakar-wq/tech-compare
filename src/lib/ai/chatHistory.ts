import type { AIAssistantRecommendation } from '@/components/ai/AIAssistantModal';

export const CHAT_HISTORY_KEY = 'robopengu_chat_history';
export const MAX_CHAT_HISTORY_BYTES = 1_000_000;
export interface SavedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: AIAssistantRecommendation[];
  isStreaming?: boolean;
}

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max;
const categories = new Set(['smartphones', 'phones', 'tvs', 'laptops', 'appliances', 'tablets', 'smartwatches', 'headphones', 'consoles', 'monitors']);
const identifier = (value: unknown): value is string => text(value, 250) && !/[\s/?#\\\u0000-\u001f]/.test(value);
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

function restoreRecommendation(value: unknown): AIAssistantRecommendation | null {
  if (!record(value) || !identifier(value.productId) || !identifier(value.slug)
    || !text(value.productName, 300) || typeof value.category !== 'string' || !categories.has(value.category)) return null;
  // A saved conversation is no longer evidence of a current offer.
  return {
    productId: value.productId, slug: value.slug, productName: value.productName,
    category: value.category as string, price: positive(value.price) ? value.price : 0,
    currentPrice: null, lastSeenPrice: null, priceStatus: 'unverified',
    statusLabel: 'Önceki sohbet fiyatı • Yeniden doğrulanmadı',
    reason: text(value.reason, 2000) ? value.reason : '',
  };
}

export function decodeChatHistory(raw: string | null): { messages: SavedChatMessage[]; invalidCount: number } {
  if (!raw) return { messages: [], invalidCount: 0 };
  if (new TextEncoder().encode(raw).byteLength > MAX_CHAT_HISTORY_BYTES) return { messages: [], invalidCount: 1 };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return { messages: [], invalidCount: 1 }; }
  if (!Array.isArray(parsed)) return { messages: [], invalidCount: 1 };
  let invalidCount = 0;
  const seen = new Set<string>();
  const messages: SavedChatMessage[] = [];
  for (const value of parsed.slice(-25).reverse()) {
    if (!record(value) || !text(value.id, 128) || seen.has(value.id)
      || (value.role !== 'user' && value.role !== 'assistant') || !text(value.content, 24_000)) {
      invalidCount++; continue;
    }
    seen.add(value.id);
    const recommendations = Array.isArray(value.recommendations)
      ? value.recommendations.slice(0, 12).flatMap(item => {
        const rec = restoreRecommendation(item);
        if (!rec) invalidCount++;
        return rec ? [rec] : [];
      }) : undefined;
    messages.push({ id: value.id, role: value.role as SavedChatMessage['role'], content: value.content,
      ...(recommendations?.length ? { recommendations } : {}), isStreaming: false });
  }
  return { messages: messages.reverse(), invalidCount };
}

export function encodeChatHistory(messages: SavedChatMessage[]): string | null {
  const recent = messages.slice(-25);
  if (recent.some(message => message.isStreaming || !text(message.content, 24_000))) return null;
  const raw = JSON.stringify(recent);
  return new TextEncoder().encode(raw).byteLength <= MAX_CHAT_HISTORY_BYTES ? raw : null;
}
