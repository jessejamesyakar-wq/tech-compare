'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Search, Sparkles, X } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { comparisonPath } from '@/lib/comparisonSelection';
import styles from './HomepageV2.module.css';

export function HomepageNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { compareList } = useCompare();
  const compareHref = compareList.length ? comparisonPath(compareList) : '/compare';

  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    document.addEventListener('keydown', dismiss);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', dismiss); document.removeEventListener('pointerdown', outside); };
  }, [menuOpen]);

  const links = <>
    <Link href="/search" onClick={() => setMenuOpen(false)}>Ürünler</Link>
    <a href="#kategoriler" onClick={() => setMenuOpen(false)}>Kategoriler</a>
    <Link href={compareHref} onClick={() => setMenuOpen(false)}>Karşılaştır{compareList.length > 0 && <span className={styles.compareCount}>{compareList.length}</span>}</Link>
    <Link href="/alerts" onClick={() => setMenuOpen(false)}>Fiyat Takibi</Link>
    <a href="#robopengu-hero" className={styles.navAi} onClick={() => { setMenuOpen(false); document.getElementById('home-assistant-query')?.focus({ preventScroll: true }); }}><Sparkles size={14} aria-hidden="true" />RoboPengu</a>
  </>;

  return <header ref={rootRef} className={styles.header}>
    <div className={styles.headerInner}>
      <Link href="/" aria-label="aceleEtme ana sayfa" className={styles.logo}><Image src="/emblem.png" width={38} height={38} alt="" /><span>acele<span>Etme</span><small>Teknolojide doğru karar.</small></span></Link>
      <nav className={styles.desktopNav} aria-label="Ana menü">{links}</nav>
      <form action="/search" role="search" className={styles.navSearch}><Search size={16} aria-hidden="true" /><input type="search" name="q" aria-label="Ürün ara" placeholder="Ürün ara" maxLength={200} /><button type="submit" aria-label="Aramayı başlat"><Search size={17} aria-hidden="true" /></button></form>
      <Link href="/search" className={styles.mobileSearchLink} aria-label="Ürün arama sayfasını aç"><Search size={20} /></Link>
      <button ref={menuButtonRef} className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-controls="home-mobile-menu" aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {menuOpen && <nav id="home-mobile-menu" className={styles.mobileNav} aria-label="Mobil ana menü">{links}</nav>}
  </header>;
}
