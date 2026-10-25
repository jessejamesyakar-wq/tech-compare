'use client';
import { useI18n } from '@/lib/i18n/context';
import { useHomeCopy } from '@/lib/i18n/useHomeCopy';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, X, Smartphone, Laptop, Tv, Sparkles, RotateCcw } from 'lucide-react';
import { useModalFocus } from '@/components/ui/useModalFocus';
import { consumeAvailableChatStream, visibleChatText, type ConversationTurn } from '@/lib/ai/conversation';
import styles from './RoboPenguConversation.module.css';

type Message = ConversationTurn & { id: number; failed?: boolean; products?: { name: string; href: string }[] };
const categories = [
  { label: 'Telefon', note: 'Gün boyu yanında', icon: Smartphone, prompt: 'Telefon arıyorum.' },
  { label: 'Bilgisayar', note: 'İş, okul veya oyun', icon: Laptop, prompt: 'Bilgisayar arıyorum.' },
  { label: 'Televizyon', note: 'Evdeki büyük ekran', icon: Tv, prompt: 'Televizyon arıyorum.' },
  { label: 'Henüz emin değilim', note: 'Birlikte netleştirelim', icon: Sparkles, prompt: 'Henüz ne alacağımdan emin değilim.' },
];

export function RoboPenguConversation({ isOpen, onClose, initialQuery = '' }: { isOpen: boolean; onClose: () => void; initialQuery?: string }) {
  const h = useHomeCopy();
  const { language } = useI18n();
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
    if (el) el.scrollTop = messages.length || loading ? el.scrollHeight : 0;
  }, [messages, loading, isOpen]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const dialog = dialogRef.current;
    if (!isOpen || !viewport || !dialog) return;
    // Keep the mobile composer inside the visible area when the keyboard opens.
    const resize = () => {
      dialog.style.setProperty('--pengu-visible-height', `${viewport.height}px`);
      dialog.style.setProperty('--pengu-visible-top', `${viewport.offsetTop}px`);
    };
    resize();
    viewport.addEventListener('resize', resize);
    viewport.addEventListener('scroll', resize);
    return () => {
      viewport.removeEventListener('resize', resize);
      viewport.removeEventListener('scroll', resize);
      dialog.style.removeProperty('--pengu-visible-height');
      dialog.style.removeProperty('--pengu-visible-top');
    };
  }, [isOpen, dialogRef]);

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
        body: JSON.stringify({ prompt, language, history: history.filter(m => !m.failed).map(({ role, content }) => ({ role, content })) }) });
      if (!response.ok || !response.body) throw new Error(response.status === 429 ? h("Çok hızlı ilerledik. Bir dakika sonra yeniden deneyebilirsin.") : h("Bağlantı kurulamadı. Yeniden deneyebilirsin."));
      let isTruncated = false;
      const available = await consumeAvailableChatStream(response.body, (event, data) => {
        if (event === 'text' && typeof data === 'string') { raw += data; update({ content: visibleChatText(raw) }); }
        if (event === 'status' && typeof data === 'object' && data !== null) {
          const statusObj = data as { mode?: string; completed?: boolean; truncated?: boolean; reason?: string };
          if (statusObj.mode === 'unavailable') {
            raw = '';
            setService('');
            update({ failed: true, products: [], content: 'Şu anda AI yanıt hizmetine bağlanamıyorum. Sorunu yeniden deneyebilir veya ürünleri katalogda inceleyebilirsin.' });
          }
          if (statusObj.truncated || (statusObj.completed === false && statusObj.reason === 'max_tokens')) {
            isTruncated = true;
            setService(h("Yanıt tamamlanamadı. Devam et yazarak sürdürebilirsin."));
            update({
              failed: true,
              content: `${visibleChatText(raw)}\n\n${h('Yanıt tamamlanamadı. Devam et yazarak sürdürebilirsin.')}`,
            });
          }
        }
        if (event === 'products' && Array.isArray(data)) {
          const allowed = ['phones', 'laptops', 'tvs', 'tablets', 'smartwatches', 'headphones', 'monitors', 'consoles', 'appliances'];
          update({ products: data.flatMap(p => typeof p?.productName === 'string' && allowed.includes(p.category) && typeof p.slug === 'string' && /^[a-z0-9-]+$/i.test(p.slug)
            ? [{ name: p.productName, href: `/${p.category}/${p.slug}` }] : []) });
        }
      });
      if (!available) return;
      if (isTruncated) {
        update({
          failed: true,
          content: `${visibleChatText(raw)}\n\n${h('Yanıt tamamlanamadı. Devam et yazarak sürdürebilirsin.')}`,
        });
      } else if (!visibleChatText(raw)) {
        throw new Error(h("Yanıt tamamlanamadı. Yeniden deneyebilirsin."));
      }
    } catch (error) {
      update({ failed: true, content: raw ? `${visibleChatText(raw)}\n\n${h('Yanıt kesildi. Yeniden deneyebilirsin.')}` : controller.signal.aborted ? h("Yanıt süresi doldu. Yeniden deneyebilirsin.") : error instanceof Error ? error.message : h("Yanıt alınamadı.") });
    } finally { clearTimeout(timeout); busyRef.current = false; controllerRef.current = null; setLoading(false); }
  }
  function reset() { if (busyRef.current) return; setMessages([]); setDraft(''); setService(''); }
  if (!isOpen) return null;
  const last = messages.at(-1);
  return <div className={styles.overlay} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pengu-dialog-title" tabIndex={-1}>
    <section className={styles.window}>
      <header className={styles.top}><div><strong>acele<span>Etme</span> / RoboPengu</strong><small>{h("SENİN TEKNOLOJİ YOL ARKADAŞIN")}</small></div><div className={styles.actions}><button type="button" onClick={reset} disabled={loading || !messages.length} aria-label={h("Yeni sohbet")}><RotateCcw size={18} /></button><button type="button" onClick={onClose} aria-label={h("Sohbeti kapat")}><X size={22} /></button></div></header>
      <div ref={transcriptRef} className={styles.content}>
        <div className={`${styles.welcome} ${messages.length ? styles.compact : ''}`}><Image src="/assets/robopengu-quantum.webp" alt="RoboPengu" width={180} height={164} /><h2 id="pengu-dialog-title">{messages.length ? h("Birlikte netleştirelim.") : <>{h("Birlikte bulalım.")}<br />{h("Ne arıyorsun?")}</>}</h2>{!messages.length && <p>{h("Her şeyi bilmen gerekmiyor. İhtiyacından başlayalım.")}</p>}</div>
        {!messages.length && <div className={styles.choices}>{categories.map(({ label, note, icon: Icon, prompt }) => <button type="button" key={label} onClick={() => void send(h(prompt))}><Icon size={24} /><span>{h(label)}<small>{h(note)}</small></span></button>)}</div>}
        <div className={styles.transcript} aria-label={h("Sohbet mesajları")}>{messages.map(m => <article key={m.id} className={m.role === 'user' ? styles.user : styles.assistant}><strong>{m.role === 'user' ? h("Sen") : 'RoboPengu'}</strong><p>{m.content ? (m.role === 'assistant' ? h(m.content) : m.content) : h('Yanıt hazırlanıyor…')}</p>{m.products?.map(p => <Link key={p.href} href={p.href}>{p.name} →</Link>)}</article>)}</div>
        <div role="status" className={styles.status}>{loading ? h("RoboPengu yanıtlıyor…") : service}</div>
        {!loading && last?.failed && <div className={styles.recovery}><button type="button" onClick={() => void send(messages.at(-2)?.content || '', true)}>{h("Yeniden dene")}</button><Link href="/search">{h("Kataloğu keşfet →")}</Link></div>}
      </div>
      <footer className={styles.footer}><form onSubmit={e => { e.preventDefault(); void send(draft); }}><label htmlFor="pengu-message" className={styles.srOnly}>{h("RoboPengu mesajı")}</label><input id="pengu-message" value={draft} onChange={e => setDraft(e.target.value)} maxLength={500} placeholder={h("İhtiyacını kendi cümlelerinle anlat…")} autoComplete="off" /><button type="submit" disabled={loading || !draft.trim()} aria-label={h("Mesajı gönder")}><ArrowUp size={22} /></button></form><p>{h("AI yanıtları hata içerebilir. Güncel fiyat ve kaynak durumunu kontrol et.")}</p></footer>
    </section>
  </div>;
}
