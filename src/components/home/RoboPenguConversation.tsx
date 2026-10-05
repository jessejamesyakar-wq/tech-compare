'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, X, Smartphone, Laptop, Tv, Sparkles, RotateCcw } from 'lucide-react';
import { useModalFocus } from '@/components/ui/useModalFocus';
import { consumeChatStream, visibleChatText, type ConversationTurn } from '@/lib/ai/conversation';
import styles from './RoboPenguConversation.module.css';

type Message = ConversationTurn & { id: number; failed?: boolean; products?: { name: string; href: string }[] };
const categories = [
  { label: 'Telefon', note: 'Gün boyu yanında', icon: Smartphone, prompt: 'Telefon arıyorum. İhtiyacımı anlamak için tek bir soruyla başlayalım.' },
  { label: 'Bilgisayar', note: 'İş, okul veya oyun', icon: Laptop, prompt: 'Bilgisayar arıyorum. İhtiyacımı anlamak için tek bir soruyla başlayalım.' },
  { label: 'Televizyon', note: 'Evdeki büyük ekran', icon: Tv, prompt: 'Televizyon arıyorum. İhtiyacımı anlamak için tek bir soruyla başlayalım.' },
  { label: 'Henüz emin değilim', note: 'Birlikte netleştirelim', icon: Sparkles, prompt: 'Hangi cihazı alacağımdan emin değilim. Önce ne yapmak istediğimi sor.' },
];

export function RoboPenguConversation({ isOpen, onClose, initialQuery = '' }: { isOpen: boolean; onClose: () => void; initialQuery?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState('');
  const dialogRef = useModalFocus(isOpen, onClose);
  const controllerRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const handledRef = useRef('');
  const sequenceRef = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (!isOpen) { handledRef.current = ''; return; }
    if (initialQuery && handledRef.current !== initialQuery) { handledRef.current = initialQuery; setDraft(initialQuery); }
  }, [isOpen, initialQuery]);
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, isOpen]);

  async function send(text: string, retry = false) {
    const prompt = text.trim();
    if (!prompt || prompt.length > 500 || busyRef.current) return;
    busyRef.current = true; setLoading(true); setService(''); setDraft('');
    const history = retry ? messages.slice(0, -2) : messages;
    const userId = ++sequenceRef.current, answerId = ++sequenceRef.current;
    setMessages([...history, { id: userId, role: 'user', content: prompt }, { id: answerId, role: 'assistant', content: '' }]);
    const controller = new AbortController(); controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 35_000);
    let raw = '';
    const update = (patch: Partial<Message>) => setMessages(current => current.map(m => m.id === answerId ? { ...m, ...patch } : m));
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({ prompt, history: history.filter(m => !m.failed).map(({ role, content }) => ({ role, content })) }) });
      if (!response.ok || !response.body) throw new Error(response.status === 429 ? 'Çok hızlı ilerledik. Bir dakika sonra yeniden deneyebilirsin.' : 'Bağlantı kurulamadı. Yeniden deneyebilirsin.');
      await consumeChatStream(response.body, (event, data) => {
        if (event === 'text' && typeof data === 'string') { raw += data; update({ content: visibleChatText(raw) }); }
        if (event === 'status' && typeof data === 'object' && data !== null && 'mode' in data && data.mode === 'unavailable') {
          setService('AI yanıt hizmeti şu anda kullanılamıyor. Katalogda keşfetmeye devam edebilirsin.'); update({ failed: true });
        }
        if (event === 'products' && Array.isArray(data)) {
          const allowed = ['phones', 'laptops', 'tvs', 'tablets', 'smartwatches', 'headphones', 'monitors', 'consoles', 'appliances'];
          update({ products: data.flatMap(p => typeof p?.productName === 'string' && allowed.includes(p.category) && typeof p.slug === 'string' && /^[a-z0-9-]+$/i.test(p.slug)
            ? [{ name: p.productName, href: `/${p.category}/${p.slug}` }] : []) });
        }
      });
      if (!visibleChatText(raw)) throw new Error('Yanıt tamamlanamadı. Yeniden deneyebilirsin.');
    } catch (error) {
      update({ failed: true, content: raw ? `${visibleChatText(raw)}\n\nYanıt kesildi. Yeniden deneyebilirsin.` : controller.signal.aborted ? 'Yanıt süresi doldu. Yeniden deneyebilirsin.' : error instanceof Error ? error.message : 'Yanıt alınamadı.' });
    } finally { clearTimeout(timeout); busyRef.current = false; controllerRef.current = null; setLoading(false); }
  }
  function reset() { if (busyRef.current) return; setMessages([]); setDraft(''); setService(''); }
  if (!isOpen) return null;
  const last = messages.at(-1);
  return <div className={styles.overlay} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pengu-dialog-title" tabIndex={-1}>
    <section className={styles.window}>
      <header className={styles.top}><div><strong>acele<span>Etme</span> / RoboPengu</strong><small>SENİN TEKNOLOJİ YOL ARKADAŞIN</small></div><div className={styles.actions}><button type="button" onClick={reset} disabled={loading || !messages.length} aria-label="Yeni sohbet"><RotateCcw size={18} /></button><button type="button" onClick={onClose} aria-label="Sohbeti kapat"><X size={22} /></button></div></header>
      <div ref={transcriptRef} className={styles.content}>
        <div className={`${styles.welcome} ${messages.length ? styles.compact : ''}`}><Image src="/assets/robopengu-quantum.webp" alt="RoboPengu" width={180} height={164} /><h2 id="pengu-dialog-title">{messages.length ? 'Birlikte netleştirelim.' : <>Birlikte bulalım.<br />Ne arıyorsun?</>}</h2>{!messages.length && <p>Her şeyi bilmen gerekmiyor. İhtiyacından başlayalım.</p>}</div>
        {!messages.length && <div className={styles.choices}>{categories.map(({ label, note, icon: Icon, prompt }) => <button type="button" key={label} onClick={() => void send(prompt)}><Icon size={24} /><span>{label}<small>{note}</small></span></button>)}</div>}
        <div className={styles.transcript} aria-label="Sohbet mesajları">{messages.map(m => <article key={m.id} className={m.role === 'user' ? styles.user : styles.assistant}><strong>{m.role === 'user' ? 'Sen' : 'RoboPengu'}</strong><p>{m.content || 'Yanıt hazırlanıyor…'}</p>{m.products?.map(p => <Link key={p.href} href={p.href}>{p.name} →</Link>)}</article>)}</div>
        <div role="status" className={styles.status}>{loading ? 'RoboPengu yanıtlıyor…' : service}</div>
        {!loading && last?.failed && <div className={styles.recovery}><button type="button" onClick={() => void send(messages.at(-2)?.content || '', true)}>Yeniden dene</button><Link href="/search">Kataloğu keşfet →</Link></div>}
      </div>
      <footer className={styles.footer}><form onSubmit={e => { e.preventDefault(); void send(draft); }}><label htmlFor="pengu-message" className={styles.srOnly}>RoboPengu mesajı</label><input id="pengu-message" value={draft} onChange={e => setDraft(e.target.value)} maxLength={500} placeholder="İhtiyacını kendi cümlelerinle anlat…" autoComplete="off" /><button type="submit" disabled={loading || !draft.trim()} aria-label="Mesajı gönder"><ArrowUp size={22} /></button></form><p>AI yanıtları hata içerebilir. Güncel fiyat ve kaynak durumunu kontrol et.</p></footer>
    </section>
  </div>;
}
