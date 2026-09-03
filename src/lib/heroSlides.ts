import { Product } from '@/lib/types';

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
  image: string;
}

export function getDynamicHeroSlides(products: Product[] = []): HeroSlideItem[] {
  const featured = products
    .filter((p) => p.basePrice > 0 && p.image && !p.image.includes('placeholder'))
    .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
    .slice(0, 15);

  if (featured.length === 0) {
    return [
      {
        id: 'default-1',
        category: 'phones',
        slug: 'phones',
        badgeText: '✨ Zirve Performans',
        scriptHighlight: 'gün boyu',
        mainHeadline: 'En Çok Karşılaştırılan Modeller',
        subHeadline: 'Fiyat ve donanım analizleri tek ekranda',
        productName: 'Akıllı Telefonlar',
        productSpec: 'Yapay Zeka & Çoklu Mağaza Karşılaştırma',
        price: '0 ₺',
        image: '/images/phones/apple/apple-iphone-16.jpg'
      }
    ];
  }

  return featured.map((p, idx) => {
    const highlights = p.highlights || [];

    const badges = [
      '⚡ 2026 Zirve Amiral Gemisi',
      '🔥 En Çok Karşılaştırılan',
      '📸 Profesyonel Kamera & Donanım',
      '✨ Yapay Zekâ Destekli',
      '💎 Premium Segment Lideri'
    ];

    const specs = [
      highlights[0] || 'Gelişmiş OLED/AMOLED Panel & 120Hz Akıcılık',
      highlights[1] || 'Üstün Yapay Zekâ NPU İşlemci Performansı',
      highlights[2] || 'Tüm Gün Süren Akıllı Batarya Yönetimi'
    ];

    return {
      id: p.id || `slide-${idx}`,
      category: p.category || 'phones',
      slug: p.slug || p.id,
      badgeText: badges[idx % badges.length],
      scriptHighlight: idx % 2 === 0 ? 'algoritmik kıyasla' : 'canlı fiyat takibi',
      mainHeadline: p.category === 'tvs' ? 'Sinema Kalitesinde Görsel Şölen' : 'Akıllı Teknolojide Zirve Performans',
      subHeadline: '8 farklı mağaza arasında en uygun fiyatı ve gerçek donanım skorunu keşfedin.',
      productName: p.name,
      productSpec: specs.slice(0, 2).join(' • '),
      price: `${p.basePrice.toLocaleString('tr-TR')} ₺`,
      image: p.image || '/images/phones/apple/apple-iphone-16.jpg'
    };
  });
}
