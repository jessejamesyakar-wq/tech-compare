'use client';
import { useHomeCopy } from '@/lib/i18n/useHomeCopy';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Gamepad2, Headphones, Info, Laptop, Monitor, PlugZap, Scale, Smartphone, Tablet, Tv, Watch } from 'lucide-react';
import { HomepageHero } from './HomepageHero';
import { Homepage2026Showcase } from './Homepage2026Showcase';
import { HomepageBudget } from './HomepageBudget';
import { HomepageLifecycleSections } from './HomepageLifecycleSections';
import { ProductImage } from '@/components/ui/ProductImage';
import { trackFunnelEvent } from '@/lib/analytics/funnel';
import type { Showcase2026Data } from '@/lib/showcase2026';
import type { PriceSignalResult } from '@/lib/priceSignal';
import type { LifecycleHomeData } from '@/lib/productLifecycle';
import styles from './HomepageV2.module.css';

export interface HomepageDecision {
  id: string;
  name: string;
  image: string;
  href: string;
  signal: Pick<PriceSignalResult, 'status' | 'title' | 'explanation'>;
}

export interface HomePageClientProps {
  showcase2026: Showcase2026Data;
  decisions: HomepageDecision[];
  lifecycleHome: LifecycleHomeData;
  popularComparisons: Array<{ phone1Id: string; phone2Id: string; phone1Name: string; phone2Name: string }>;
  counts: Record<'smartphones' | 'laptops' | 'tvs' | 'appliances' | 'tablets' | 'smartwatches' | 'headphones' | 'consoles' | 'monitors', number>;
}

const categories = [
  { key: 'smartphones', label: 'Telefon', href: '/phones', icon: Smartphone },
  { key: 'laptops', label: 'Laptop', href: '/laptops', icon: Laptop },
  { key: 'tvs', label: 'Televizyon', href: '/tvs', icon: Tv },
  { key: 'tablets', label: 'Tablet', href: '/tablets', icon: Tablet },
  { key: 'smartwatches', label: 'Akıllı saat', href: '/smartwatches', icon: Watch },
  { key: 'headphones', label: 'Kulaklık', href: '/headphones', icon: Headphones },
  { key: 'monitors', label: 'Monitör', href: '/monitors', icon: Monitor },
  { key: 'consoles', label: 'Oyun konsolu', href: '/consoles', icon: Gamepad2 },
  { key: 'appliances', label: 'Ev & yaşam', href: '/appliances', icon: PlugZap },
] as const;

export function HomePageClient({ popularComparisons, counts, showcase2026, decisions, lifecycleHome }: HomePageClientProps) {
  const h = useHomeCopy();
  const supportedDecisions = decisions.filter(product => product.signal.status !== 'insufficient_data');
  useEffect(() => { trackFunnelEvent({ type: 'landing_view', path: '/', referrerSource: document.referrer ? (document.referrer.includes(window.location.hostname) ? 'internal' : 'external') : 'direct' }); }, []);
  return <div data-homepage-v2 className={styles.page}>
    <HomepageHero products={showcase2026.initialProducts} />
    <section className={styles.section} id="kategoriler" aria-labelledby="categories-title">
      <div className={styles.sectionHeading}><div><h2 id="categories-title">{h("Ne keşfetmek istersin?")}</h2></div><Link href="/search" className={styles.quietLink}>{h("Tüm ürünler")}<ArrowRight size={16} /></Link></div>
      <div className={styles.categoryGrid}>{categories.map(({ key, label, href, icon: Icon }) => <Link key={key} href={href} className={styles.categoryCard}><span><Icon size={25} strokeWidth={1.55} /></span><strong>{h(label)}</strong><small>{counts[key].toLocaleString('tr-TR')} {h("ürün")}</small><ArrowUpRight size={15} className={styles.categoryArrow} /></Link>)}</div>
    </section>
    <div className={styles.showcase} id="vitrin"><Homepage2026Showcase initialProducts={showcase2026.initialProducts} rotationPool={showcase2026.rotationPool} /></div>
    <HomepageLifecycleSections data={lifecycleHome} />
    {supportedDecisions.length > 0 ? <section className={styles.section} aria-labelledby="decision-title">
      <div className={styles.sectionHeading}><h2 id="decision-title">{h("Fiyat zamanlaması")}</h2><Link href="/alerts" className={styles.quietLink}>{h("Fiyat hedeflerim")}<ArrowRight size={16} /></Link></div>
      <div className={styles.decisionGrid}>{supportedDecisions.map(product => <article key={product.id} className={styles.decisionCard}>
        <div className={styles.decisionProduct}><div className={styles.decisionImage}><ProductImage src={product.image} alt={product.name} variant="card" /></div><h3>{product.name}</h3></div>
        <span className={styles.signalReady}><Info size={14} />{product.signal.title}</span><p>{product.signal.explanation}</p><Link href={product.href} className={styles.quietLink}>{h("Ürünün verisini incele")}<ArrowRight size={15} /></Link>
      </article>)}</div>
    </section> : <aside className={styles.compactNotice}><Info size={20} aria-hidden="true" /><p>{h("Al / bekle önerisi için yeterli güncel fiyat verisi yok. Fiyat hedefini bu tarayıcıda saklayabilirsin; otomatik bildirim gönderilmez.")}</p><Link href="/alerts">{h("Fiyat hedeflerim")}<ArrowRight size={16} /></Link></aside>}
    {popularComparisons.length > 0 && <section className={styles.section} aria-labelledby="comparisons-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}><Scale size={15} /> {h("Yan yana, daha net")}</p><h2 id="comparisons-title">{h("Popüler karşılaştırmalar")}</h2></div><Link href="/compare" className={styles.quietLink}>{h("Kendi karşılaştırmanı yap")}<ArrowUpRight size={16} /></Link></div>
      <div className={styles.comparisonGrid}>{popularComparisons.slice(0, 4).map(item => <Link key={item.phone1Id+'-'+item.phone2Id} href={'/compare?d1='+encodeURIComponent(item.phone1Id)+'&d2='+encodeURIComponent(item.phone2Id)} className={styles.comparisonCard}><div><span>{item.phone1Name}</span><small>vs</small><span>{item.phone2Name}</span></div><span className={styles.comparisonCta}>{h("Farkları gör")}<ArrowRight size={16} /></span></Link>)}</div>
    </section>}
    <HomepageBudget />
  </div>;
}
export default HomePageClient;
