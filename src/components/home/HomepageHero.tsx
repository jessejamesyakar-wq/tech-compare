'use client';
import { useHomeCopy } from '@/lib/i18n/useHomeCopy';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Laptop, Tv, Battery, MapPin, Sparkles, MessageCircle } from 'lucide-react';
import { HomepageConversation } from './HomepageAssistant';
import { RoboPenguPrism } from './RoboPenguPrism';
import { RoboPengu3D } from './RoboPengu3D';
import type { Showcase2026Product } from '@/lib/showcase2026';
import styles from './QuantumHero.module.css';

const shortcuts = [
  { label: 'Sessiz bir laptop', icon: Laptop, prompt: 'Sessiz çalışan bir laptop arıyorum.' },
  { label: 'Film için TV', icon: Tv, prompt: 'Film izlemek için televizyon arıyorum.' },
  { label: 'Uzun pil ömrü', icon: Battery, prompt: 'Uzun pil ömrü benim için önemli.' },
];

export function HomepageHero({ products = [] }: { products?: Showcase2026Product[] }) {
  const h = useHomeCopy();
  const [initialQuery, setInitialQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasConversation, setHasConversation] = useState(false);
  const [group, setGroup] = useState(0);
  const openerRef = useRef<HTMLElement | null>(null);
  const groupCount = Math.min(3, Math.ceil(products.length / 2));
  const picks = products.slice(group * 2, group * 2 + 2);
  useEffect(() => {
    const open = (event: Event) => {
      const query = (event as CustomEvent<{ query?: unknown }>).detail?.query;
      openerRef.current = document.activeElement as HTMLElement;
      setInitialQuery(typeof query === 'string' ? query.slice(0, 500) : '');
      setHasConversation(true);
      setIsOpen(true);
    };
    window.addEventListener('robopengu:open', open);
    return () => window.removeEventListener('robopengu:open', open);
  }, []);
  function preparePrompt(prompt: string) {
    openerRef.current = document.activeElement as HTMLElement;
    setInitialQuery(h(prompt)); setHasConversation(true); setIsOpen(true);
  }
  return <>
    <section id="robopengu-hero" className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.room} aria-hidden="true" />
      <RoboPenguPrism suspended={isOpen} />
      <div className={styles.inner}>
        <header className={styles.heading}>
          <h1 id="home-hero-title">{h("Teknoloji karmaşık.")}<br /><span>{h("Birlikte netleştirelim.")}</span></h1>
          <p>{h("Ne aradığını anlat; seçenekleri birlikte inceleyelim.")}</p>
        </header>
        <div className={styles.stage}>
          <aside className={`${styles.panel} ${styles.products}`} aria-label={h("Katalogdan ürün seçkisi")}>
            <div className={styles.panelHeading}><h2>{h("Birlikte keşfedelim")}</h2><Link href="/search">{h("Tümünü gör")}<ArrowRight size={13} /></Link></div>
            <p className={styles.panelIntro}>{h("Katalogdan bir başlangıç seçkisi.")}</p>
            <div className={styles.productPair}>
              {picks.map(product => <Link key={product.id} href={product.detailHref} className={styles.product}>
                <div className={styles.productImage}><Image src={product.image} alt={product.name} fill sizes="(max-width: 767px) 35vw, 150px" /></div>
                <strong title={product.name}>{product.name}</strong>
                <span>{h(product.priceStatusLabel)}</span>
              </Link>)}
              {!picks.length && <Link href="/search" className={styles.catalogFallback}>{h("Ürün kataloğunu keşfet")}<ArrowRight size={16} /></Link>}
            </div>
            {groupCount > 1 && <div className={styles.dots} role="group" aria-label={h("Ürün seçkisi sayfaları")}>
              {Array.from({ length: groupCount }, (_, index) => <button key={index} type="button" aria-label={`${index + 1}. ${h('ürün grubu')}`} aria-pressed={group === index} onClick={() => setGroup(index)}><span /></button>)}
            </div>}
          </aside>
          <div className={styles.character}>
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.podium} aria-hidden="true" />
            <RoboPengu3D variant="hero" suspended={isOpen} />
          </div>
          <aside className={`${styles.panel} ${styles.guidance}`} aria-labelledby="pengu-guidance-title">
            <div className={styles.panelHeading}><h2 id="pengu-guidance-title">{h("Önce seni anlayalım.")}</h2><span className={styles.aiLabel}><Sparkles size={12} /> AI</span></div>
            <p className={styles.panelIntro}>{h("Daha iyi öneriler için birkaç soruyla başlayalım.")}</p>
            <p className={styles.promptLabel}>{h("Sohbet başlangıçları")}</p>
            <button type="button" className={styles.question} onClick={() => preparePrompt(h("Kullanım amacıma uygun bir cihaz seçmek istiyorum."))}><MapPin size={21} /><span>{h("Nerede kullanacaksın?")}</span><ChevronRight size={16} /></button>
            <button type="button" className={styles.question} onClick={() => preparePrompt(h("Bir cihaz seçerken önceliklerimi netleştirmek istiyorum."))}><Sparkles size={21} /><span>{h("Senin için en önemli özellik ne?")}</span><ChevronRight size={16} /></button>
            <div className={styles.guidanceNote}><MessageCircle size={23} /><p>{h("İhtiyaçlarını anlattıkça, seçenekleri birlikte netleştirelim.")}</p></div>
          </aside>
        </div>
        <div className={styles.conversation}>
          <button type="button" className={styles.conversationTrigger} onClick={() => preparePrompt('')} aria-haspopup="dialog">
            <Image src="/assets/robopengu-quantum.webp" alt="" width={46} height={46} className={styles.avatar} />
            <span>{h("Ne almak istiyorsun? Bana anlat.")}</span><span className={styles.triggerArrow}><ArrowRight size={23} /></span>
          </button>
          <div className={styles.shortcuts} aria-label={h("RoboPengu hızlı başlangıçlar")}>{shortcuts.map(({label,icon:Icon,prompt}) => <button key={label} type="button" onClick={() => preparePrompt(prompt)}><Icon size={16} />{h(label)}</button>)}</div>
          <div className={styles.explore}><Link href="/search">{h("Ürünleri kendim keşfedeceğim")}<ArrowRight size={14} /></Link>{hasConversation && <button type="button" onClick={event => { openerRef.current = event.currentTarget; setInitialQuery(''); setIsOpen(true); }}>{h("Sohbete dön")}<MessageCircle size={14} /></button>}</div>
          <p className={styles.disclaimer}>{h("AI yanıtları hata içerebilir. Kaynakları ve güncel teklif durumunu kontrol et.")}</p>
        </div>
      </div>
    </section>
    <HomepageConversation isOpen={isOpen} onClose={() => setIsOpen(false)} initialQuery={initialQuery} />
  </>;
}
