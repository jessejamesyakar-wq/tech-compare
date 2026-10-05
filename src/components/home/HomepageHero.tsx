'use client';

import { FormEvent, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Clock3, Scale, Sparkles, Wallet } from 'lucide-react';
import { HomepageAssistant } from './HomepageAssistant';
import styles from './HomepageV2.module.css';

const shortcuts = [
  { label: 'Ürün öner', icon: Sparkles, prompt: 'İhtiyacıma uygun bir ürün seçmek istiyorum. Önce kullanım amacımı sor.' },
  { label: 'Fiyat zamanı', icon: Clock3, prompt: 'Almayı düşündüğüm ürünün fiyat zamanlamasını incelemek istiyorum. Güncel teklif ve yeterli fiyat geçmişi yoksa bunu açıkça belirt.' },
  { label: 'Karşılaştır', icon: Scale, prompt: 'İki ürünü kayıtlı özellikleri ve kaynaklarıyla karşılaştırmak istiyorum.' },
  { label: 'Bütçeme göre', icon: Wallet, prompt: 'Bütçeme uygun bir ürün arıyorum. Önce bütçemi ve kullanım amacımı sor; katalog referansını güncel teklif olarak gösterme.' },
];

export function HomepageHero() {
  const [query, setQuery] = useState('');
  const [initialQuery, setInitialQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasConversation, setHasConversation] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function openAssistant(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) { inputRef.current?.focus(); return; }
    openerRef.current = document.activeElement as HTMLElement;
    setInitialQuery(query.trim());
    setHasConversation(true);
    setIsOpen(true);
  }

  return (
    <>
      <section id="robopengu-hero" className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" /> Teknoloji seçerken bir adım önde</p>
          <h1 id="home-hero-title">İyi teknoloji.<br /><span>Doğru karar.</span></h1>
          <p className={styles.heroDescription}>Seçenekler çok. Doğru seçim sana özel.<br className={styles.desktopBreak} /> RoboPengu ile ihtiyacını netleştir, ürünleri karşılaştır, fiyatın arkasındaki veriyi gör.</p>
          <form className={styles.heroForm} onSubmit={openAssistant}>
            <label htmlFor="home-assistant-query" className={styles.srOnly}>RoboPengu’ya ne almak istediğini söyle</label>
            <Sparkles className={styles.inputSparkle} size={20} aria-hidden="true" />
            <input id="home-assistant-query" ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} aria-label="RoboPengu mesajı" maxLength={500} placeholder="Ne almak istiyorsun? (örn. iPhone, laptop, TV…)" enterKeyHint="send" autoComplete="off" />
            <button type="submit" aria-label="RoboPengu’ya sor" title="RoboPengu’ya sor"><ArrowRight size={21} aria-hidden="true" /></button>
          </form>
          <div className={styles.shortcuts} aria-label="RoboPengu hızlı başlangıçlar">
            {shortcuts.map(({ label, icon: Icon, prompt }) => <button key={label} type="button" onClick={() => { setQuery(prompt); inputRef.current?.focus(); }}><Icon size={15} aria-hidden="true" />{label}</button>)}
          </div>
          <p className={styles.heroNote}>AI destekli rehberlik. Karar her zaman sende.</p>
          {hasConversation && <button type="button" className={styles.resumeChat} onClick={event => { openerRef.current = event.currentTarget; setInitialQuery(''); setIsOpen(true); }}>Sohbete dön <ArrowRight size={14} /></button>}
          <Link href="/search" className={styles.quietLink}>Ya da tüm ürünleri keşfet <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroOrbit} aria-hidden="true" />
          <div className={styles.heroHello}><span className={styles.helloStar}>✦</span> Merhaba, ben RoboPengu.</div>
          <Image src="/assets/robopengu-hero-wave.png" alt="El sallayan RoboPengu teknoloji asistanı" width={1097} height={1429} sizes="(max-width: 600px) 230px, (max-width: 900px) 290px, 380px" preload className={styles.heroMascot} />
          <div className={`${styles.floatingNote} ${styles.noteNeeds}`}><span className={styles.noteIcon}><Check size={16} /></span><div><strong>Önce ihtiyacın.</strong><span>Sana uygun seçenekler</span></div></div>
          <div className={`${styles.floatingNote} ${styles.noteEvidence}`}><span className={styles.noteIcon}><Scale size={16} /></span><div><strong>Sonra kanıtlar.</strong><span>Açık, anlaşılır karşılaştırma</span></div></div>
          <span className={styles.heroSignature}>Birlikte, acele etmeden.</span>
        </div>
      </section>
      <HomepageAssistant isOpen={isOpen} onClose={() => { setIsOpen(false); requestAnimationFrame(() => (openerRef.current || inputRef.current)?.focus({ preventScroll: true })); }} initialQuery={initialQuery} />
    </>
  );
}
