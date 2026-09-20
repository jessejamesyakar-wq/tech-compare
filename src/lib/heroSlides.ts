import { Product } from '@/lib/types';
import { evaluateProductPricing, getPriceHeading } from '@/lib/pricing/unifiedPriceEvaluator';

export interface HeroSlideItem {
  id: string;
  category: string;
  slug: string;
  badgeText: string;
  scriptHighlight: string;
  mainHeadline: string;
  subHeadline: string;
  productName: string;
  productSpec: string;
  price: string;
  priceLabel: string;
  statusLabel: string;
  image: string;
  specPills?: string[];
  score?: number;
}

export function getDynamicHeroSlides(products: Product[] = []): HeroSlideItem[] {
  // Category distribution quotas totaling exactly 24 diverse flagship products
  const categoryQuotas: Record<string, number> = {
    smartphones: 4,
    laptops: 4,
    tvs: 3,
    tablets: 3,
    headphones: 3,
    smartwatches: 2,
    monitors: 2,
    consoles: 2,
    appliances: 1
  };

  const validProducts = products.filter(
    (p) => (p.basePrice ?? 0) > 0 && p.image && !p.image.includes('placeholder') && !p.image.includes('product-unverified')
  );

  const selectedProducts: Product[] = [];
  const usedNames = new Set<string>();
  const usedBrandPerCat = new Set<string>();

  if (validProducts.length > 0) {
    Object.entries(categoryQuotas).forEach(([cat, targetCount]) => {
      const catProducts = validProducts
        .filter((p) => p.category === cat || (cat === 'smartphones' && (p.category as string) === 'phones'))
        .sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.2) return ratingDiff;
          return (b.basePrice || 0) - (a.basePrice || 0);
        });

      let picked = 0;
      for (const p of catProducts) {
        if (picked >= targetCount) break;
        // Clean base name to prevent duplicate storage variants of same model
        const baseName = p.name.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
        const brandKey = `${cat}:${(p.brand || '').toLowerCase()}`;

        if (usedNames.has(baseName)) continue;
        if (usedBrandPerCat.has(brandKey) && catProducts.length > targetCount) continue;

        selectedProducts.push(p);
        usedBrandPerCat.add(brandKey);
        usedNames.add(baseName);
        picked++;
      }
    });

    // Interleave categories so adjacent slides alternate dynamically
    const catBuckets: Record<string, Product[]> = {};
    selectedProducts.forEach((p) => {
      const catStr = p.category as string;
      const c = catStr === 'phones' ? 'smartphones' : catStr;
      if (!catBuckets[c]) catBuckets[c] = [];
      catBuckets[c].push(p);
    });

    const catOrder = [
      'smartphones',
      'laptops',
      'tvs',
      'consoles',
      'monitors',
      'headphones',
      'tablets',
      'smartwatches',
      'appliances'
    ];

    const interleaved: Product[] = [];
    let added = true;
    while (interleaved.length < 24 && added) {
      added = false;
      for (const c of catOrder) {
        if (catBuckets[c] && catBuckets[c].length > 0) {
          interleaved.push(catBuckets[c].shift()!);
          added = true;
          if (interleaved.length === 24) break;
        }
      }
    }

    if (interleaved.length > 0) {
      selectedProducts.length = 0;
      selectedProducts.push(...interleaved);
    }
  }

  // Use the selected product's own data. Brand names cannot prove a chipset,
  // warranty, score or price; an empty catalog must not produce invented products.
  const labels: Record<string, string> = {
    smartphones: '📱 Akıllı Telefon', laptops: '💻 Laptop & Bilgisayar',
    tvs: '📺 Televizyon', tablets: '📱 Tablet', headphones: '🎧 Kulaklık',
    smartwatches: '⌚ Akıllı Saat', monitors: '🖥️ Monitör',
    consoles: '🎮 Oyun Konsolu', appliances: '⚡ Ev ve Yaşam',
  };
  return selectedProducts.map((product) => {
    const pricing = evaluateProductPricing(product);
    const highlights = (product.highlights || []).filter((value) => typeof value === 'string' && value.trim());
    return {
      id: product.id,
      category: product.category,
      slug: product.slug || product.id,
      badgeText: labels[product.category] || 'Ürün Kataloğu',
      scriptHighlight: 'Karar vermeden karşılaştır',
      mainHeadline: product.name,
      subHeadline: highlights[0] || 'Teknik özellikleri ve mağaza seçeneklerini incele.',
      productName: product.name,
      productSpec: highlights.slice(0, 2).join(' • '),
      price: pricing.displayPrice !== null ? pricing.displayPrice.toLocaleString('tr-TR') + ' ₺' : 'Fiyat bilgisi yok',
      priceLabel: getPriceHeading(pricing),
      statusLabel: pricing.statusLabel,
      image: product.image,
      specPills: highlights.slice(0, 3),
    };
  });
}
