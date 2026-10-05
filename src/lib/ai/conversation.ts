export type ConversationTurn = { role: 'user' | 'assistant'; content: string };

export function declinesProductSuggestions(prompt: string): boolean {
  return /(?:ürün|model|cihaz)\s+(?:tavsiyesi\s+verme|önerme)|(?:ürün|model|cihaz)\s+önermeden/i.test(prompt);
}

/** Bound untrusted history and preserve user/model turn order for Gemini. */
export function sanitizeConversation(value: unknown): ConversationTurn[] {
  if (!Array.isArray(value)) return [];
  const turns: ConversationTurn[] = [];
  for (const item of value.slice(-20)) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') continue;
    const content = item.content.trim().slice(0, 3000);
    if (!content || content.startsWith('⚠️')) continue;
    if (!turns.length && item.role !== 'user') continue;
    const last = turns.at(-1);
    if (last && last.role === item.role) last.content = `${last.content}\n${content}`.slice(-3000);
    else turns.push({ role: item.role, content });
  }
  return turns;
}

export function providerConfigurationStatus(key: string | undefined): 'ready' | 'missing' | 'invalid' {
  if (!key?.trim()) return 'missing';
  if (key.includes('senin_google_api_anahtarin') || key.trim().length < 20) return 'invalid';
  return 'ready';
}

export function visibleChatText(raw: string): string {
  return raw.replace(/\[VOICE_SUMMARY\][\s\S]*?(?:\[\/VOICE_SUMMARY\]|$)/g, '')
    .replace(/\[\/?(?:SUMMARY_CHAT|DEEP_ANALYSIS)\]/g, '').replace(/\*\*/g, '').trim();
}

/** SSE chunks may split UTF-8 characters, events, and JSON at any boundary. */
export async function consumeChatStream(body: ReadableStream<Uint8Array>, receive: (event: string, data: unknown) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '', doneEvent = false;
  function dispatch(block: string) {
    const lines = block.split('\n');
    const event = lines.find(line => line.startsWith('event:'))?.slice(6).trim() || 'message';
    const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (event === 'done') { doneEvent = true; return; }
    if (!data) return;
    receive(event, JSON.parse(data));
  }
  try {
    for (;;) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) { dispatch(buffer.slice(0, boundary)); buffer = buffer.slice(boundary + 2); }
      if (done) { if (buffer.trim()) dispatch(buffer); break; }
    }
    if (!doneEvent) throw new Error('Yanıt bağlantısı kesildi. Yeniden deneyebilirsin.');
  } finally { reader.releaseLock(); }
}
