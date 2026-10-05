'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Bell, Check, Clock3, Database, Gamepad2, Headphones, Info, Laptop, Monitor, PlugZap, Scale, ShieldCheck, Smartphone, Sparkles, Tablet, Tv, Watch } from 'lucide-react';
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

function AdPlaceholder({ secondary = false }: { secondary?: boolean }) {
  return <aside className={`${styles.adSlot} ${secondary ? styles.adSecondary : ''}`} aria-label="Reklam alanı, örnek yerleşim">
    <span className={styles.adLabel}>REKLAM</span><span className={styles.adContent}>Örnek reklam yerleşimi</span>
  </aside>;
}

export function HomePageClient({ popularComparisons, counts, showcase2026, decisions, lifecycleHome }: HomePageClientProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const categoryCount = Object.values(counts).filter(count => count > 0).length;
  useEffect(() => { trackFunnelEvent({ type: 'landing_view', path: '/', referrerSource: document.referrer ? (document.referrer.includes(window.location.hostname) ? 'internal' : 'external') : 'direct' }); }, []);

  return <div data-homepage-v2 className={styles.page}>
    <HomepageHero products={showcase2026.initialProducts} />
    <AdPlaceholder />
    <div className={styles.showcase} id="vitrin">
      <Homepage2026Showcase initialProducts={showcase2026.initialProducts} rotationPool={showcase2026.rotationPool} />
    </div>
    <HomepageLifecycleSections data={lifecycleHome} />
    <section className={styles.section} aria-labelledby="decision-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}><Sparkles size={15} /> RoboPengu karar rehberi</p><h2 id="decision-title">Şimdi al, takip et, bekle?</h2><p>Bir fiyat etiketi yetmez. Güncel teklif ve geçmiş gözlemleri birlikte değerlendiririz.</p></div><Link href="/compare" className={styles.quietLink}>Karşılaştırmaya başla <ArrowUpRight size={16} /></Link></div>
      {decisions.length > 0 ? <div className={styles.decisionGrid}>{decisions.map((product, index) => <article key={product.id} className={styles.decisionCard}>
        <div className={styles.decisionTop}><span>Fiyat zamanlaması</span><span className={styles.decisionNumber}>0{index + 1}</span></div>
        <div className={styles.decisionProduct}><div className={styles.decisionImage}><ProductImage src={product.image} alt={product.name} variant="card" /></div><h3>{product.name}</h3></div>
        <span className={product.signal.status === 'insufficient_data' ? styles.insufficient : styles.signalReady}><Info size={14} />{product.signal.status === 'insufficient_data' ? 'Yeterli veri yok' : product.signal.title}</span>
        <p>{product.signal.status === 'insufficient_data' ? 'Güncel doğrulanmış teklif veya yeterli fiyat geçmişi yok. Bu ürün için al / bekle önerisi veremiyoruz.' : product.signal.explanation}</p>
        <Link href={product.href} className={styles.quietLink}>Ürünün verisini incele <ArrowRight size={15} /></Link>
      </article>)}</div> : <p className={styles.emptyState}>Karar kartları için katalog verisi henüz hazır değil. Ürünleri arayarak inceleyebilirsin.</p>}
      <p className={styles.sectionFootnote}><ShieldCheck size={14} /> Fiyat sinyalleri mevcut veri kurallarına dayanır. AI yanıtları ve kayıtlı özellikler hatalar içerebilir.</p>
    </section>
    <section className={styles.radar} aria-labelledby="radar-title">
      <div className={styles.radarIllustration} aria-hidden="true"><div /><div /><span><Bell size={28} /></span><i /><i /></div>
      <div className={styles.radarCopy}><p className={styles.eyebrow}><Clock3 size={15} /> Fiyat radarı</p><h2 id="radar-title">Fiyatın izini kaybetme.</h2><p>İlgilendiğin ürünün teklif durumunu ve varsa kayıtlı fiyat gözlemlerini incele. Kendi fiyat hedefini bu tarayıcıda sakla.</p><p className={styles.radarDisclaimer}>Otomatik takip veya bildirim gönderimi yoktur. Güncel teklif bulunmayan ürünlerde bunu açıkça belirtiriz.</p></div>
      <Link href="/alerts" className={styles.primaryButton}>Fiyat hedeflerim <ArrowRight size={17} /></Link>
    </section>
    <section className={styles.section} id="kategoriler" aria-labelledby="categories-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>İhtiyacından başla</p><h2 id="categories-title">Sen ne keşfetmek istersin?</h2></div><Link href="/search" className={styles.quietLink}>Tüm ürünler <ArrowRight size={16} /></Link></div>
      <div className={styles.categoryGrid}>{categories.map(({ key, label, href, icon: Icon }) => <Link key={key} href={href} className={styles.categoryCard}><span><Icon size={25} strokeWidth={1.55} /></span><strong>{label}</strong><small>{counts[key].toLocaleString('tr-TR')} ürün</small><ArrowUpRight size={15} className={styles.categoryArrow} /></Link>)}</div>
    </section>
    {popularComparisons.length > 0 && <section className={styles.section} aria-labelledby="comparisons-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}><Scale size={15} /> Yan yana, daha net</p><h2 id="comparisons-title">Popüler karşılaştırmalar</h2><p>Katalogdaki modellerin kayıtlı özelliklerini aynı ekranda incele.</p></div><Link href="/compare" className={styles.quietLink}>Kendi karşılaştırmanı yap <ArrowUpRight size={16} /></Link></div>
      <div className={styles.comparisonGrid}>{popularComparisons.slice(0, 4).map(item => <Link key={`${item.phone1Id}-${item.phone2Id}`} href={`/compare?d1=${encodeURIComponent(item.phone1Id)}&d2=${encodeURIComponent(item.phone2Id)}`} className={styles.comparisonCard}><div><span>{item.phone1Name}</span><small>vs</small><span>{item.phone2Name}</span></div><span className={styles.comparisonCta}>Farkları gör <ArrowRight size={16} /></span></Link>)}</div>
    </section>}
    <section className={styles.trustStrip} aria-label="Katalog ve veri yaklaşımı">
      <div><Database size={19} /><span><strong>{total.toLocaleString('tr-TR')} ürün</strong><small>katalogda</small></span></div>
      <div><Scale size={19} /><span><strong>{categoryCount} kategori</strong><small>tek yerde</small></span></div>
      <div><Sparkles size={19} /><span><strong>AI destekli</strong><small>karar rehberliği</small></span></div>
      <div><ShieldCheck size={19} /><span><strong>Kaynak & güncellik</strong><small>fiyat etiketlerinde</small></span></div>
    </section>
    <HomepageBudget />
    <AdPlaceholder secondary />
    <section className={styles.transparency} aria-labelledby="transparency-title"><div><ShieldCheck size={24} /><h2 id="transparency-title">İyi karar, açık bilgiyle başlar.</h2><Link href="/yasal-uyari" className={styles.quietLink}>Veri yaklaşımımız <ArrowUpRight size={15} /></Link></div><ul><li><Check size={16} /><span><strong>Fiyatın türü bellidir.</strong> Güncel teklif, son görülen fiyat ve katalog referansı ayrı etiketlenir.</span></li><li><Check size={16} /><span><strong>Eksik veri gizlenmez.</strong> Kayıtlı özellikler değişebilir; kaynak ve doğrulama durumunu ürün detayında incele.</span></li><li><Check size={16} /><span><strong>Skor, laboratuvar testi değildir.</strong> RoboScore teknik metriklerden hesaplanır; satın alma garantisi vermez.</span></li></ul></section>
  </div>;
}
export default HomePageClient;
