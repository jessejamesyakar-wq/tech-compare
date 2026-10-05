'use client';

import Link from 'next/link';
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Clock3,
  Gem,
  Sparkles,
} from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import type {
  LifecycleHomeData,
  LifecycleHomeProduct,
} from '@/lib/productLifecycle';
import styles from './HomepageLifecycle.module.css';

interface HomepageLifecycleSectionsProps {
  data: LifecycleHomeData;
}

function ValueCard({ product }: { product: LifecycleHomeProduct }) {
  return (
    <Link href={product.detailHref} className={styles.valueCard}>
      <div className={styles.cardMeta}>
        <span className={styles.valueBadge}><Sparkles size={13} />2025 Akıllı Fırsat</span>
        <span className={styles.categoryTag}>{product.category}</span>
      </div>

      <div className={styles.valueImage}>
        <ProductImage src={product.image} alt={product.name} variant="card" />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.brand}>{product.brand}</p>
        <h3>{product.name}</h3>
        <p className={styles.safePrice}>{product.priceStatusLabel}</p>
        <div className={styles.cardCta}>
          <span>Yeni nesile alternatif</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

function ArchiveCard({ product }: { product: LifecycleHomeProduct }) {
  const nearArchive = product.lifecycleTier === 'ARCHIVE_ACTIVE';

  return (
    <Link href={product.detailHref} className={styles.archiveCard}>
      <div className={styles.archiveTop}>
        <span className={styles.archiveBadge}>
          <Archive size={13} />
          {nearArchive ? 'Yakın Arşiv' : 'Teknoloji Arşivi'}
        </span>
        <span className={styles.year}>{product.releaseYear}</span>
      </div>

      <div className={styles.archiveImage}>
        <ProductImage src={product.image} alt={product.name} variant="card" />
      </div>

      <div className={styles.cardBody}>
        <p className={styles.era}><CalendarDays size={13} />{product.eraLabel}</p>
        <p className={styles.archiveBrand}>{product.brand}</p>
        <h3>{product.name}</h3>
        <p className={styles.archivePrice}>{product.priceStatusLabel}</p>
        <div className={styles.archiveCta}>
          <span>Sergiyi incele</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}

function ProductRail({
  products,
  archive = false,
}: {
  products: LifecycleHomeProduct[];
  archive?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <div className={styles.rail}>
      {products.map((product) =>
        archive
          ? <ArchiveCard key={product.id} product={product} />
          : <ValueCard key={product.id} product={product} />
      )}
    </div>
  );
}

export function HomepageLifecycleSections({ data }: HomepageLifecycleSectionsProps) {
  const archiveProducts = [...data.archive2024, ...data.archiveClassic];
  const hasValue = data.value2025.length > 0;
  const hasArchive = archiveProducts.length > 0;

  if (!hasValue && !hasArchive) return null;

  return (
    <div className={styles.lifecycleStack}>
      {hasValue && (
        <section className={styles.valueSection} aria-labelledby="value-2025-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.valueEyebrow}><Gem size={15} />Geçen neslin güçlü seçimleri</p>
              <h2 id="value-2025-title">2025 Akıllı Fırsatlar</h2>
              <p>Yeni nesile çıkmadan önce fiyat-performans açısından yeniden değerlendirmeye değer modeller.</p>
            </div>
            <span className={styles.freshnessNote}>
              <Clock3 size={14} />Teklif yalnız doğrulandığında güncel kabul edilir
            </span>
          </div>

          <ProductRail products={data.value2025} />
        </section>
      )}

      {hasArchive && (
        <section className={styles.archiveSection} aria-labelledby="archive-title">
          <div className={styles.archiveTexture} aria-hidden="true" />
          <div className={styles.archiveInner}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.archiveEyebrow}><Archive size={15} />RoboPengu Timeline</p>
                <h2 id="archive-title">Teknoloji Arşivi</h2>
                <p>Raf dışı değil, sergide: döneminin önemli modellerini teknoloji tarihinin bir parçası olarak keşfedin.</p>
              </div>
              <span className={styles.archiveLegend}>2024 Yakın Arşiv · 2023 ve öncesi Modern Klasikler</span>
            </div>

            <ProductRail products={archiveProducts} archive />
          </div>
        </section>
      )}
    </div>
  );
}

export default HomepageLifecycleSections;
