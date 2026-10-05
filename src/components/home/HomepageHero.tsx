'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Laptop, Tv, Battery, MapPin, Sparkles, MessageCircle, Smartphone, House, Pause, Play } from 'lucide-react';
import { HomepageConversation } from './HomepageAssistant';
import { RoboPenguPrism } from './RoboPenguPrism';
import type { Showcase2026Product } from '@/lib/showcase2026';
import styles from './QuantumHero.module.css';

const shortcuts = [
  { label: 'Sessiz bir laptop', icon: Laptop, prompt: 'Sessiz çalışan bir laptop arıyorum. Önce kullanım amacımı ve bütçemi sor.' },
  { label: 'Film için TV', icon: Tv, prompt: 'Film izlemek için televizyon arıyorum. Önce odamı, izleme mesafemi ve bütçemi sor.' },
  { label: 'Uzun pil ömrü', icon: Battery, prompt: 'Uzun pil ömrü benim için önemli. Önce hangi tür cihaz aradığımı sor.' },
];
const discovery = [
  { label: 'Telefon', note: 'Sana uygun modelleri keşfet', href: '/phones', icon: Smartphone },
  { label: 'Bilgisayar', note: 'İş, okul ve oyun için', href: '/laptops', icon: Laptop },
  { label: 'Televizyon', note: 'Daha büyük deneyimler', href: '/tvs', icon: Tv },
  { label: 'Ev & Yaşam', note: 'Daha konforlu bir hayat', href: '/appliances', icon: House },
];

export function HomepageHero({ products = [] }: { products?: Showcase2026Product[] }) {
  const [initialQuery, setInitialQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasConversation, setHasConversation] = useState(false);
  const [group, setGroup] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const groupCount = Math.min(3, Math.ceil(products.length / 2));
  const picks = products.slice(group * 2, group * 2 + 2);
  function preparePrompt(prompt: string) {
    openerRef.current = document.activeElement as HTMLElement;
    setInitialQuery(prompt); setHasConversation(true); setIsOpen(true);
  }
  return <>
    <section id="robopengu-hero" className={styles.hero} aria-labelledby="home-hero-title" data-motion-paused={motionPaused}>
      <div className={styles.room} aria-hidden="true" />
      <RoboPenguPrism suspended={isOpen} />
      <div className={styles.inner}>
        <header className={styles.heading}>
          <h1 id="home-hero-title">Teknoloji karmaşık.<br /><span>Birlikte netleştirelim.</span></h1>
          <p>Ne aradığını anlat; seçenekleri birlikte inceleyelim.</p>
        </header>
        <div className={styles.stage}>
          <aside className={`${styles.panel} ${styles.products}`} aria-label="Katalogdan ürün seçkisi">
            <div className={styles.panelHeading}><h2>Birlikte keşfedelim</h2><Link href="/search">Tümünü gör <ArrowRight size={13} /></Link></div>
            <p className={styles.panelIntro}>Katalogdan bir başlangıç seçkisi.</p>
            <div className={styles.productPair}>
              {picks.map(product => <Link key={product.id} href={product.detailHref} className={styles.product}>
                <div className={styles.productImage}><Image src={product.image} alt={product.name} fill sizes="(max-width: 767px) 35vw, 150px" /></div>
                <strong title={product.name}>{product.name}</strong>
                <span>{product.priceStatusLabel}</span>
              </Link>)}
              {!picks.length && <Link href="/search" className={styles.catalogFallback}>Ürün kataloğunu keşfet <ArrowRight size={16} /></Link>}
            </div>
            {groupCount > 1 && <div className={styles.dots} role="group" aria-label="Ürün seçkisi sayfaları">
              {Array.from({ length: groupCount }, (_, index) => <button key={index} type="button" aria-label={`${index + 1}. ürün grubu`} aria-pressed={group === index} onClick={() => setGroup(index)}><span /></button>)}
            </div>}
          </aside>
          <div className={styles.character}>
            <div className={styles.orbit} aria-hidden="true" />
            <div className={styles.podium} aria-hidden="true" />
            <Image className={styles.mascot} src="/assets/robopengu-quantum.webp" alt="Elinde tabletle seni selamlayan RoboPengu" width={1313} height={1198} sizes="(max-width: 767px) 260px, 390px" preload />
            <button type="button" className={styles.motionControl} aria-label={motionPaused ? 'RoboPengu hareketini başlat' : 'RoboPengu hareketini durdur'} aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? <Play size={13} /> : <Pause size={13} />}<span>Hareket</span></button>
          </div>
          <aside className={`${styles.panel} ${styles.guidance}`} aria-labelledby="pengu-guidance-title">
            <div className={styles.panelHeading}><h2 id="pengu-guidance-title">Önce seni anlayalım.</h2><span className={styles.aiLabel}><Sparkles size={12} /> AI</span></div>
            <p className={styles.panelIntro}>Daha iyi öneriler için birkaç soruyla başlayalım.</p>
            <p className={styles.promptLabel}>Sohbet başlangıçları</p>
            <button type="button" className={styles.question} onClick={() => preparePrompt('Kullanım amacıma uygun bir cihaz seçmek istiyorum. Önce nerede ve nasıl kullanacağımı sor.')}><MapPin size={21} /><span>Nerede kullanacaksın?</span><ChevronRight size={16} /></button>
            <button type="button" className={styles.question} onClick={() => preparePrompt('Bir cihaz seçerken önceliklerimi netleştirmek istiyorum. Önce benim için en önemli özelliği sor.')}><Sparkles size={21} /><span>Senin için en önemli özellik ne?</span><ChevronRight size={16} /></button>
            <div className={styles.guidanceNote}><MessageCircle size={23} /><p>İhtiyaçlarını anlattıkça, seçenekleri birlikte netleştirelim.</p></div>
          </aside>
        </div>
        <div className={styles.conversation}>
          <button type="button" className={styles.conversationTrigger} onClick={() => preparePrompt('')} aria-haspopup="dialog">
            <Image src="/assets/robopengu-quantum.webp" alt="" width={46} height={46} className={styles.avatar} />
            <span>Ne almak istiyorsun? Bana anlat.</span><span className={styles.triggerArrow}><ArrowRight size={23} /></span>
          </button>
          <div className={styles.shortcuts} aria-label="RoboPengu hızlı başlangıçlar">{shortcuts.map(({label,icon:Icon,prompt}) => <button key={label} type="button" onClick={() => preparePrompt(prompt)}><Icon size={16} />{label}</button>)}</div>
          <div className={styles.explore}><Link href="/search">Ürünleri kendim keşfedeceğim <ArrowRight size={14} /></Link>{hasConversation && <button type="button" onClick={event => { openerRef.current = event.currentTarget; setInitialQuery(''); setIsOpen(true); }}>Sohbete dön <MessageCircle size={14} /></button>}</div>
          <p className={styles.disclaimer}>AI yanıtları hata içerebilir. Kaynakları ve güncel teklif durumunu kontrol et.</p>
        </div>
      </div>
    </section>
    <section className={styles.discovery} aria-labelledby="quick-discovery-title"><h2 id="quick-discovery-title">Keşfetmeye buradan başla</h2><div>{discovery.map(({label,note,href,icon:Icon}) => <Link key={href} href={href}><Icon size={30} strokeWidth={1.5} /><span><strong>{label}</strong><small>{note}</small></span><ChevronRight size={17} /></Link>)}</div></section>
    <HomepageConversation isOpen={isOpen} onClose={() => setIsOpen(false)} initialQuery={initialQuery} />
  </>;
}
