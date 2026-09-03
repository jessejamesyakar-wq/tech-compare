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
        id: 'oppo-find-x9-pro',
        category: 'phones',
        slug: 'oppo-find-x9-pro',
        badgeText: '✨ ⭐ YILIN ÖNE ÇIKAN MODELİ',
        scriptHighlight: 'kamera şampiyonu',
        mainHeadline: 'Hasselblad Master HyperTone Kamera Sistemi (Sony 1-inç LYT-900 & Çift Periskop)',
        subHeadline: 'MediaTek Dimensity 9500 (3nm TSMC) / Snapdragon 8 Elite Çipi',
        productName: 'OPPO Find X9 Pro (512 GB)',
        productSpec: '6.82 inç 2K 120Hz LTPO AMOLED Ekran (4500 nits)',
        price: '72.999 ₺',
        image: '/images/phones/oppo/oppo-find-x8-pro.jpg'
      },
      {
        id: 'samsung-s26-ultra',
        category: 'phones',
        slug: 'samsung-galaxy-s26-ultra',
        badgeText: '⚡ 2026 AMİRAL GEMİSİ LİDERİ',
        scriptHighlight: 'yapay zekâda zirve',
        mainHeadline: '200 MP UltraSensör & Galaxy AI Destekli Profesyonel Kamera Motoru',
        subHeadline: 'Snapdragon 8 Elite for Galaxy (3nm) • 1-120Hz Dinamik LTPO 2X Panel',
        productName: 'Samsung Galaxy S26 Ultra (512 GB)',
        productSpec: '6.8 inç QHD+ Dynamic AMOLED 2X (3200 nits) • Titanyum Kasa',
        price: '123.589 ₺',
        image: '/images/phones/samsung/epey/samsung-galaxy-s26-ultra.png'
      },
      {
        id: 'apple-iphone-16-pro-max',
        category: 'phones',
        slug: 'apple-iphone-16-pro-max-256gb',
        badgeText: '💎 TİTANYUM AMİRAL GEMİSİ',
        scriptHighlight: 'sinematik performans',
        mainHeadline: 'Apple A18 Pro 3nm Çip & 48 MP Fusion Çift Katmanlı Telefoto Kamera',
        subHeadline: 'Super Retina XDR OLED • Titanyum Gövde & Camera Control Tuşu',
        productName: 'Apple iPhone 16 Pro Max (256 GB)',
        productSpec: '6.9 inç ProMotion 120Hz OLED • 4K 120 fps Dolby Vision',
        price: '109.999 ₺',
        image: '/images/phones/apple/apple-iphone-16-pro-max.jpg'
      }
    ];
  }

  return featured.map((p, idx) => {
    const highlights = p.highlights || [];
    const nameLower = p.name.toLowerCase();

    let mainHeadline = 'Akıllı Teknolojide Zirve Donanım & Performans';
    let subHeadline = '8 farklı mağaza arasında en uygun fiyatı ve gerçek donanım skorunu keşfedin.';
    let specText = highlights.slice(0, 2).join(' • ');

    if (nameLower.includes('oppo') || nameLower.includes('find')) {
      mainHeadline = 'Hasselblad Master HyperTone Kamera Sistemi (Sony 1-inç LYT-900 & Çift Periskop)';
      subHeadline = 'MediaTek Dimensity 9500 (3nm TSMC) / Snapdragon 8 Elite Çipi';
      specText = '6.82 inç 2K 120Hz LTPO AMOLED Ekran (4500 nits)';
    } else if (nameLower.includes('s26') || nameLower.includes('s25')) {
      mainHeadline = '200 MP UltraSensör & Galaxy AI Destekli Profesyonel Görsel Motoru';
      subHeadline = 'Snapdragon 8 Elite for Galaxy (3nm) • 1-120Hz Dinamik LTPO 2X Panel';
      specText = '6.8 inç QHD+ Dynamic AMOLED 2X (3200 nits) • Titanyum Kasa';
    } else if (nameLower.includes('iphone')) {
      mainHeadline = 'Apple A18 Pro 3nm Çip & 48 MP Fusion Çift Katmanlı Telefoto Kamera';
      subHeadline = 'Super Retina XDR OLED • Titanyum Gövde & Camera Control Tuşu';
      specText = '6.9 inç ProMotion 120Hz OLED • 4K 120 fps Dolby Vision';
    } else if (nameLower.includes('vivo') || nameLower.includes('x200')) {
      mainHeadline = 'ZEISS APO 200 MP Periskop Telefoto & 1-inç Sony LYT-900 Sensör';
      subHeadline = 'Dimensity 9400 (3nm) • V3+ Görüntüleme Çipi • 6000 mAh BlueOcean Batarya';
      specText = '6.78 inç 1.5K 120Hz LTPO OLED (4500 nits)';
    } else if (p.category === 'tvs') {
      mainHeadline = 'Kendi Işığını Yayan Piksellerle Sinema Kalitesinde Görsel Şölen';
      subHeadline = 'Yapay Zekâ Destekli Görüntü İşleme & 144Hz Kusursuz Oyun Akıcılığı';
      specText = highlights[0] || '4K Ultra HD • OLED evo / Mini-LED Panel';
    }

    const badges = [
      '✨ ⭐ YILIN ÖNE ÇIKAN MODELİ',
      '⚡ 2026 AMİRAL GEMİSİ LİDERİ',
      '📸 PROFESYONEL KAMERA & DONANIM',
      '✨ YAPAY ZEKÂ DESTEKLİ',
      '💎 PREMİUM SEGMENT LİDERİ'
    ];

    return {
      id: p.id || `slide-${idx}`,
      category: p.category || 'phones',
      slug: p.slug || p.id,
      badgeText: badges[idx % badges.length],
      scriptHighlight: idx % 2 === 0 ? 'kamera lideri' : 'canlı fiyat takibi',
      mainHeadline,
      subHeadline,
      productName: p.name,
      productSpec: specText,
      price: `${p.basePrice.toLocaleString('tr-TR')} ₺`,
      image: p.image || '/images/phones/apple/apple-iphone-16.jpg'
    };
  });
}
