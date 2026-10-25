'use client';
import { useI18n } from '@/lib/i18n/context';
import { useHomeCopy } from '@/lib/i18n/useHomeCopy';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ArrowUpRight, X, Smartphone, Laptop, Tv, Sparkles, Plus, Copy, Check, MessageCircle, SlidersHorizontal, Columns2 } from 'lucide-react';
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
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showLatest, setShowLatest] = useState(false);
  const dialogRef = useModalFocus(isOpen, onClose);
  const controllerRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const handledRef = useRef('');
  const sequenceRef = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const followTail = useRef(true);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (!isOpen) { handledRef.current = ''; return; }
    if (initialQuery && handledRef.current !== initialQuery) { handledRef.current = initialQuery; setDraft(initialQuery); }
  }, [isOpen, initialQuery]);
  useEffect(() => {
    const el = transcriptRef.current;
    if (el && followTail.current) el.scrollTop = messages.length || loading ? el.scrollHeight : 0;
  }, [messages, loading, isOpen]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [draft, isOpen]);
  useEffect(() => {
    if (copiedId === null) return;
    const timer = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(timer);
  }, [copiedId]);

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
    followTail.current = true; setShowLatest(false);
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
  function reset() { if (busyRef.current) return; followTail.current = true; setShowLatest(false); setCopiedId(null); setMessages([]); setDraft(''); setService(''); }
  async function copyAnswer(message: Message) {
    try { await navigator.clipboard.writeText(message.content); setCopiedId(message.id); }
    catch { setService(h('Kopyalanamadı. Metni seçerek kopyalayabilirsin.')); }
  }
  if (!isOpen) return null;
  const last = messages.at(-1);
  return <div className={styles.overlay} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pengu-dialog-title" tabIndex={-1}>
    <section className={styles.window}>
      <header className={styles.top}>
        <div className={styles.identity}><span className={styles.avatar}><Image src="/assets/robopengu-quantum.webp" alt="" width={44} height={44} /></span><div><h2 id="pengu-dialog-title">RoboPengu <span>AI</span></h2><small>{h('Senin teknoloji yol arkadaşın')}</small></div></div>
        <div className={styles.actions}><button className={styles.newChat} type="button" onClick={reset} disabled={loading || !messages.length} aria-label={h('Yeni sohbet')} title={h('Yeni sohbet')}><Plus size={17} /><span>{h('Yeni sohbet')}</span></button><button type="button" onClick={onClose} aria-label={h('Sohbeti kapat')} title={h('Sohbeti kapat')}><X size={20} /></button></div>
      </header>
      <div className={styles.body}>
        <aside className={styles.guide} aria-label={h('Birlikte netleştirelim.')}>
          <span className={styles.signature}>acele<span>Etme</span></span>
          <div className={styles.character}><Image src="/assets/robopengu-quantum.webp" alt="" width={180} height={164} /></div>
          <h3>{h('Önce ihtiyacın.')}<br /><span>{h('Sonra seçeneklerin.')}</span></h3>
          <p>{h('Her şeyi bilmen gerekmiyor. İhtiyacından başlayalım.')}</p>
          <ol><li><MessageCircle size={17} /><span>{h('İhtiyacını anlat')}</span></li><li><SlidersHorizontal size={17} /><span>{h('Önceliklerini belirle')}</span></li><li><Columns2 size={17} /><span>{h('Seçenekleri karşılaştır')}</span></li></ol>
          <div className={styles.guideNote}>{h('Karar senin. Birlikte netleştirelim.')}</div>
        </aside>
        <div className={styles.conversation}>
          <div className={styles.scrollArea}>
            <div ref={transcriptRef} className={styles.content} onScroll={event => { const el = event.currentTarget; const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80; followTail.current = nearBottom; setShowLatest(!nearBottom && messages.length > 0); }}>
              {!messages.length && <div className={styles.welcome}><span className={styles.eyebrow}><Sparkles size={15} />{h('Birlikte bulalım.')}</span><h3>{h('Aklında ne var?')}</h3><p>{h('Bir ürün, bir ihtiyaç ya da sadece bir soru. Buradan başlayabiliriz.')}</p><div className={styles.choices}>{categories.map(({ label, note, icon: Icon, prompt }) => <button type="button" key={label} onClick={() => void send(h(prompt))}><span className={styles.choiceIcon}><Icon size={21} /></span><span>{h(label)}<small>{h(note)}</small></span><ArrowUpRight size={16} className={styles.choiceArrow} /></button>)}</div></div>}
              <div className={styles.transcript} role="log" aria-live="off" aria-label={h('Sohbet mesajları')}>{messages.map(m => <article key={m.id} className={m.role === 'user' ? styles.user : styles.assistant}>
                <div className={styles.messageLabel}>{m.role === 'assistant' && <span className={styles.messageAvatar}><Image src="/assets/robopengu-quantum.webp" alt="" width={28} height={28} /></span>}<strong>{m.role === 'user' ? h('Sen') : 'RoboPengu'}</strong>{m.failed && <span className={styles.errorTag}>{h('Yanıt tamamlanamadı')}</span>}</div>
                <div className={styles.messageBody}>{m.content ? <p>{m.role === 'assistant' ? h(m.content) : m.content}</p> : <span className={styles.thinking}><i /><i /><i /><span>{h('Yanıt hazırlanıyor…')}</span></span>}
                  {!!m.products?.length && <div className={styles.products}>{m.products.map(p => <Link key={p.href} href={p.href}><span>{p.name}<small>{h('Katalogda incele')}</small></span><ArrowUpRight size={18} /></Link>)}</div>}
                </div>
                {m.role === 'assistant' && m.content && (!loading || m.id !== last?.id) && <button type="button" className={styles.copyButton} onClick={() => void copyAnswer(m)} aria-label={copiedId === m.id ? h('Kopyalandı') : h('Yanıtı kopyala')}>{copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}{copiedId === m.id ? h('Kopyalandı') : h('Kopyala')}</button>}
              </article>)}</div>
              <div role="status" className={styles.status}>{loading ? h('RoboPengu yanıtlıyor…') : service}</div>
              {!loading && last?.failed && <div className={styles.recovery}><button type="button" onClick={() => void send(messages.at(-2)?.content || '', true)}>{h('Yeniden dene')}</button><Link href="/search">{h('Kataloğu keşfet →')}</Link></div>}
            </div>
            {showLatest && <button type="button" className={styles.latest} onClick={() => { followTail.current = true; setShowLatest(false); if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight; }}><ArrowDown size={16} />{h('Son mesaja git')}</button>}
          </div>
          <footer className={styles.footer}><form onSubmit={e => { e.preventDefault(); void send(draft); }}><label htmlFor="pengu-message" className={styles.srOnly}>{h('RoboPengu mesajı')}</label><textarea ref={inputRef} id="pengu-message" rows={1} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(draft); } }} maxLength={500} placeholder={h('İhtiyacını kendi cümlelerinle anlat…')} autoComplete="off" /><div className={styles.composerBottom}><span className={styles.keyboardHint}>{h('Enter ile gönder · Shift + Enter ile yeni satır')}</span><span className={styles.count}>{draft.length > 400 ? `${draft.length}/500` : ''}</span><button type="submit" disabled={loading || !draft.trim()} aria-label={h('Mesajı gönder')}><ArrowUp size={20} /></button></div></form><p>{h('AI yanıtları hata içerebilir. Güncel fiyat ve kaynak durumunu kontrol et.')}</p></footer>
        </div>
      </div>
    </section>
  </div>;
}
