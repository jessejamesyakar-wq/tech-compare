export interface ChatStreamEvent { event: string; data: string }

function parseFrame(frame: string): ChatStreamEvent | null {
  let event = 'text';
  const data: string[] = [];
  for (const line of frame.split(/\r\n|\r|\n/)) {
    if (line.startsWith(':')) continue;
    const colon = line.indexOf(':');
    const field = colon < 0 ? line : line.slice(0, colon);
    const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
    if (field === 'event') event = value;
    if (field === 'data') data.push(value);
  }
  return data.length ? { event, data: data.join('\n') } : null;
}

/** Bounded SSE reader, including a stream that stalls after sending its panel. */
export async function* readChatEvents(body: ReadableStream<Uint8Array>, options: {
  signal: AbortSignal; idleMs?: number; totalMs?: number; onChunk?: () => void;
}): AsyncGenerator<ChatStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const deadline = Date.now() + (options.totalMs ?? 90000);
  let buffer = '';
  let bytes = 0;
  try {
    while (true) {
      if (options.signal.aborted) throw new DOMException('Durduruldu', 'AbortError');
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new Error('Yanıt süresi doldu. Lütfen tekrar dene.');
      let timer: ReturnType<typeof setTimeout> | undefined;
      let onAbort: () => void = () => {};
      const interrupted = new Promise<never>((_, reject) => {
        onAbort = () => reject(new DOMException('Durduruldu', 'AbortError'));
        options.signal.addEventListener('abort', onAbort, { once: true });
        timer = setTimeout(() => reject(new Error('Yanıt akışı durdu. Lütfen tekrar dene.')), Math.min(remaining, options.idleMs ?? 30000));
      });
      const chunk = await Promise.race([reader.read(), interrupted]).finally(() => {
        clearTimeout(timer);
        options.signal.removeEventListener('abort', onAbort);
      });
      if (chunk.done) { buffer += decoder.decode(); break; }
      options.onChunk?.();
      bytes += chunk.value.byteLength;
      if (bytes > 2_000_000) throw new Error('Yanıt boyut sınırını aştı.');
      buffer += decoder.decode(chunk.value, { stream: true });
      let separator: RegExpExecArray | null;
      while ((separator = /\r\n\r\n|\n\n|\r\r/.exec(buffer))) {
        const frame = parseFrame(buffer.slice(0, separator.index));
        buffer = buffer.slice(separator.index + separator[0].length);
        if (!frame) continue;
        if (frame.event === 'done' || frame.data === '[DONE]') return;
        yield frame;
      }
    }
    const tail = parseFrame(buffer);
    if (tail && tail.event !== 'done' && tail.data !== '[DONE]') yield tail;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
