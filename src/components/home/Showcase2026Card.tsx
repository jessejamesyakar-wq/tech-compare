'use client';

import Link from 'next/link';
import { ArrowRight, Plus, Info } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { Showcase2026Product } from '@/lib/showcase2026';
import styles from './Showcase2026.module.css';

const categoryNames: Record<string, string> = {
  smartphones: 'Telefon', laptops: 'Bilgisayar', tvs: 'Televizyon',
  tablets: 'Tablet', monitors: 'Monitör',
};

export function Showcase2026Card({ product, isRotating = false }: {
  product: Showcase2026Product; isRotating?: boolean;
}) {
  return <article className={`${styles.card} ${isRotating ? styles.rotating : ''}`}>
    <Link href={product.detailHref} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
      <div className={styles.image} data-category={product.category}>
        <ProductImage src={product.image} alt={product.name} variant="card" />
      </div>
    </Link>
    <div className={styles.cardBody}>
      <p className={styles.category}>{categoryNames[product.category] || 'Teknoloji'} <span>· {product.brand}</span></p>
      <h3><Link href={product.detailHref} title={product.name}>{product.name}</Link></h3>
      <p className={styles.specs} title={product.specs.slice(0, 2).join(' · ')}>{product.specs.slice(0, 2).join(' · ')}</p>
      <div className={styles.cardFooter}>
        <p className={styles.price}><Info size={14} aria-hidden="true" />{product.priceStatusLabel}</p>
        <div className={styles.actions}>
          <Link href={product.detailHref} className={styles.primary}>İncele <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href={product.compareHref} className={styles.secondary} aria-label={`${product.name} modelini karşılaştır`}><Plus size={16} aria-hidden="true" />Karşılaştır</Link>
        </div>
      </div>
    </div>
  </article>;
}
export default Showcase2026Card;
