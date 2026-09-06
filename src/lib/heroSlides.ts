import { Product } from '@/lib/types';
import { ACTIVE_STORE_COUNT, ACTIVE_RETAILERS } from '@/lib/activeStores';

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
  specPills?: string[];
  score?: number;
}

export function getDynamicHeroSlides(products: Product[] = []): HeroSlideItem[] {
  // Define categories to sample flagship products from
  const targetCategories = [
    'smartphones',
    'laptops',
    'tvs',
    'tablets',
    'smartwatches',
    'headphones',
    'appliances',
    'monitors',
    'consoles'
  ];

  const validProducts = products.filter(
    (p) => p.basePrice > 0 && p.image && !p.image.includes('placeholder')
  );

  let selectedProducts: Product[] = [];

  if (validProducts.length > 0) {
    // Pick 1-2 top rated/premium flagship models from each category
    for (const cat of targetCategories) {
      const catProducts = validProducts
        .filter((p) => p.category === cat)
        .sort((a, b) => {
          // Sort by highest rating, then highest price (flagships)
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (Math.abs(ratingDiff) > 0.3) return ratingDiff;
          return (b.basePrice || 0) - (a.basePrice || 0);
        });

      if (catProducts.length > 0) {
        // Take the top 1 or 2 flagship products
        selectedProducts.push(catProducts[0]);
        if (catProducts.length > 1 && (cat === 'smartphones' || cat === 'laptops' || cat === 'tvs')) {
          selectedProducts.push(catProducts[1]);
        }
      }
    }
  }

  // Fallback defaults if list is empty
  if (selectedProducts.length === 0) {
    return [
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
        image: '/images/phones/apple/apple-iphone-16-pro-max.jpg',
        specPills: ['📱 ProMotion 120Hz', '⚡ Apple A18 Pro 3nm', '🎥 4K 120fps Dolby'],
        score: 99
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
        image: '/images/phones/samsung/epey/samsung-galaxy-s26-ultra.png',
        specPills: ['📱 QHD+ Dynamic AMOLED', '⚡ Snapdragon 8 Elite', '📸 200 MP Sensör'],
        score: 99
      },
      {
        id: 'macbook-pro-m4-max',
        category: 'laptops',
        slug: 'apple-macbook-pro-16-m4-max',
        badgeText: '💻 PRO DİZÜSTÜ LİDERİ',
        scriptHighlight: 'profesyonel güç',
        mainHeadline: 'Apple M4 Max Çip ile Sektör Lideri Render ve Yapay Zekâ Performansı',
        subHeadline: 'Liquid Retina XDR Mini-LED Ekran • 24 Saate Varan Pil Ömrü & MagSafe 3',
        productName: 'Apple MacBook Pro 16" (M4 Max 36GB / 1TB)',
        productSpec: '16.2 inç Liquid Retina XDR 120Hz • 16 Çekirdek CPU / 40 Çekirdek GPU',
        price: '164.999 ₺',
        image: '/images/products/laptops/macbook-pro-16.jpg',
        specPills: ['💻 Liquid Retina XDR', '⚡ Apple M4 Max Çip', '🔋 24 Saat Pil Ömrü'],
        score: 99
      },
      {
        id: 'lg-oled-g4',
        category: 'tvs',
        slug: 'lg-oled65g45lw-65-4k-oled-evo',
        badgeText: '📺 DEV EKRAN SİNEMA',
        scriptHighlight: 'kusursuz kontrast',
        mainHeadline: 'Kendi Işığını Yayan Piksellerle Sonsuz Kontrast ve Sinematik Dolby Vision',
        subHeadline: 'α11 4K AI Görüntü İşlemcisi • 144Hz VRR & G-Sync ile Kusursuz Akıcılık',
        productName: 'LG OLED G4 65" 4K Ultra HD OLED evo TV',
        productSpec: '65 inç 4K OLED evo Panel • 144Hz • Brightness Booster Max',
        price: '119.999 ₺',
        image: '/images/products/tvs/lg-oled65g4.jpg',
        specPills: ['📺 4K OLED evo Panel', '⚡ 144Hz VRR Oyun', '🔊 Dolby Atmos Sinema'],
        score: 99
      },
      {
        id: 'sony-ps5-pro',
        category: 'consoles',
        slug: 'sony-playstation-5-pro',
        badgeText: '🎮 YENİ NESİL KONSOL',
        scriptHighlight: '4k 120fps oyun',
        mainHeadline: 'PlayStation Spectral Super Resolution (PSSR) ile 4K 120Hz & Işın İzleme',
        subHeadline: '2 TB Yüksek Hızlı NVMe SSD • Tempest 3D AudioTech & Gelişmiş GPU',
        productName: 'Sony PlayStation 5 Pro (2 TB SSD)',
        productSpec: '4K 120 fps Ray Tracing • Wi-Fi 7 • DualSense Kablosuz Kontrolcü',
        price: '49.999 ₺',
        image: '/images/products/consoles/ps5-pro.jpg',
        specPills: ['🎮 4K 120Hz & PSSR', '⚡ 2 TB Ultra Hızlı SSD', '🔊 Tempest 3D Audio'],
        score: 98
      }
    ];
  }

  return selectedProducts.map((p, idx) => {
    const highlights = p.highlights || [];
    const nameLower = p.name.toLowerCase();
    const cat = p.category;

    let mainHeadline = `${p.name} ile Teknolojide Zirve Performans ve Şeffaf Fiyat`;
    let subHeadline = ACTIVE_STORE_COUNT === 1
      ? `${ACTIVE_RETAILERS[0]?.name || 'Hepsiburada'} üzerinde anlık stok, resmi garanti ve en düşük fiyat analizi.`
      : `${ACTIVE_STORE_COUNT} büyük perakende mağazasında anlık stok, resmi garanti ve en düşük fiyat analizi.`;
    let specText = highlights.slice(0, 2).join(' • ') || 'Üst Segment Amiral Gemisi Donanım';
    let specPills: string[] = ['⚡ Zirve Performans', '✨ Resmi Distribütör', '🛡️ %100 Orijinal'];
    let badgeText = '💎 PREMİUM SEGMENT LİDERİ';
    let scriptHighlight = 'doğru tercihi yap';

    // 1. SMARTPHONES
    if (cat === 'smartphones' || (cat as string) === 'phones') {
      badgeText = '📱 AMİRAL GEMİSİ AKILLI TELEFON';
      scriptHighlight = 'kamera ve işlemcide zirve';
      if (nameLower.includes('iphone 16 pro') || nameLower.includes('iphone 16 pro max')) {
        mainHeadline = 'Apple A18 Pro 3nm Çip & 48 MP Fusion Çift Katmanlı Telefoto Kamera';
        subHeadline = 'Super Retina XDR OLED • Titanyum Gövde & Camera Control Tuşu';
        specText = '6.9 inç ProMotion 120Hz OLED • 4K 120 fps Dolby Vision';
        specPills = ['📱 ProMotion 120Hz', '⚡ Apple A18 Pro 3nm', '🎥 4K 120fps Dolby'];
      } else if (nameLower.includes('iphone')) {
        mainHeadline = 'Apple A-Serisi Bionic Çip ile Yüksek Verimlilik ve iOS Ekosistemi';
        subHeadline = 'Super Retina XDR Ekran • Sinematik Mod & Dayanıklı Ceramic Shield Cam';
        specText = highlights[0] || 'OLED Super Retina Ekran • 48 MP Kamera';
        specPills = ['📱 Super Retina XDR', '⚡ Apple Bionic Çip', '🛡️ Ceramic Shield'];
      } else if (nameLower.includes('s26') || nameLower.includes('s25') || nameLower.includes('ultra')) {
        mainHeadline = '200 MP UltraSensör & Galaxy AI Destekli Profesyonel Görsel Motoru';
        subHeadline = 'Snapdragon 8 Elite for Galaxy (3nm) • 1-120Hz Dinamik LTPO 2X Panel';
        specText = '6.8 inç QHD+ Dynamic AMOLED 2X (3200 nits) • Titanyum Kasa';
        specPills = ['📱 QHD+ Dynamic AMOLED', '⚡ Snapdragon 8 Elite', '📸 200 MP Ultra'];
      } else if (nameLower.includes('oppo') || nameLower.includes('find')) {
        mainHeadline = 'Hasselblad Master HyperTone Kamera Sistemi (Sony 1-inç LYT-900 & Çift Periskop)';
        subHeadline = 'MediaTek Dimensity 9500 (3nm TSMC) / Snapdragon 8 Elite Çipi';
        specText = '6.82 inç 2K 120Hz LTPO AMOLED Ekran (4500 nits)';
        specPills = ['📱 2K 120Hz LTPO', '⚡ Dimensity 9500', '📸 Sony LYT-900 1"'];
      } else if (nameLower.includes('vivo') || nameLower.includes('x200') || nameLower.includes('x100')) {
        mainHeadline = 'ZEISS APO 200 MP Periskop Telefoto & 1-inç Sony LYT-900 Sensör';
        subHeadline = 'Dimensity 9400 (3nm) • V3+ Görüntüleme Çipi • 6000 mAh BlueOcean Batarya';
        specText = '6.78 inç 1.5K 120Hz LTPO OLED (4500 nits)';
        specPills = ['📱 1.5K 120Hz LTPO', '⚡ Dimensity 9400', '📸 ZEISS APO 200MP'];
      } else {
        mainHeadline = `${p.name} - Yüksek Performanslı Mobil Deneyim`;
        subHeadline = 'Yüksek çözünürlüklü OLED panel, gelişmiş yapay zekâ işlemci ve hızlı şarj desteği.';
        specPills = ['📱 120Hz Akıcı Ekran', '⚡ Güçlü İşlemci', '🔋 Hızlı Şarj'];
      }
    }
    // 2. LAPTOPS
    else if (cat === 'laptops') {
      badgeText = '💻 PRO DİZÜSTÜ BİLGİSAYAR';
      scriptHighlight = 'üretkenlikte sınır tanıma';
      if (nameLower.includes('macbook')) {
        mainHeadline = 'Apple Silicon M-Serisi Çip ile Sektör Lideri Render ve Yapay Zekâ Gücü';
        subHeadline = 'Liquid Retina XDR Mini-LED Ekran • 22+ Saate Varan Pil Ömrü & MagSafe 3';
        specText = 'Liquid Retina XDR • ProMotion 120Hz • Apple Silicon Çip';
        specPills = ['💻 Liquid Retina XDR', '⚡ Apple Silicon M-Çip', '🔋 22+ Saat Batarya'];
      } else if (nameLower.includes('rog') || nameLower.includes('tuf') || nameLower.includes('geforce') || nameLower.includes('rtx')) {
        mainHeadline = 'NVIDIA GeForce RTX Grafik Gücü ve Yüksek Hızlı Oyun Mimarisi';
        subHeadline = '240Hz OLED / IPS Ekran • Buhar Odalı Termal Soğutma & RGB Aydınlatma';
        specText = highlights[0] || 'NVIDIA RTX GPU • Yüksek Hızlı DDR5 RAM';
        specPills = ['🎮 240Hz Oyun Paneli', '⚡ NVIDIA GeForce RTX', '❄️ Termal Sıvı Soğutma'];
      } else {
        mainHeadline = `${p.name} - Üstün Taşınabilirlik ve Profesyonel Güç`;
        subHeadline = 'Hafif magnezyum-alüminyum alaşımlı gövde, uzun pil ömrü ve canlı ekran paneli.';
        specPills = ['💻 İnce & Hafif Kasa', '⚡ Yeni Nesil CPU', '🔋 Tüm Gün Pil'];
      }
    }
    // 3. TELEVISIONS
    else if (cat === 'tvs') {
      badgeText = '📺 DEV EKRAN SİNEMA SİSTEMİ';
      scriptHighlight = 'sinemayı evine taşı';
      if (nameLower.includes('oled')) {
        mainHeadline = 'Kendi Işığını Yayan Piksellerle Sonsuz Kontrast ve Sinematik Dolby Vision';
        subHeadline = 'Yapay Zekâ Destekli Görüntü Motoru • 144Hz VRR & Dolby Atmos Desteği';
        specText = '4K Ultra HD OLED Panel • 144Hz VRR • Dolby Vision IQ';
        specPills = ['📺 4K OLED evo Panel', '⚡ 144Hz VRR Oyun', '🔊 Dolby Atmos Sinema'];
      } else {
        mainHeadline = 'Dev Ekranda Canlı Renkler ve Kristal Netliğinde 4K Ultra HD';
        subHeadline = 'Quantum Dot / Mini-LED Arka Aydınlatma • HDR10+ & Akıllı Smart TV Arayüzü';
        specText = highlights[0] || '4K Ultra HD • Smart TV • HDR Desteği';
        specPills = ['📺 4K Dev Ekran', '⚡ HDR10+ Renkler', '🔊 Sinematik Ses'];
      }
    }
    // 4. TABLETS
    else if (cat === 'tablets') {
      badgeText = '🎨 DİJİTAL ÜRETKENLİK TABLETİ';
      scriptHighlight = 'her an her yerde üret';
      if (nameLower.includes('ipad')) {
        mainHeadline = 'Ultra Retina XDR Tandem OLED Ekran ve Apple M-Serisi Çip Mimarisi';
        subHeadline = 'ProMotion 120Hz • Apple Pencil Pro & Magic Keyboard Desteği ile Sınırsız Yaratıcılık';
        specText = 'Tandem OLED Ekran • Apple M-Çip • ProMotion 120Hz';
        specPills = ['📱 Tandem OLED Panel', '⚡ Apple M-Serisi Çip', '✏️ Kalem & Klavye'];
      } else {
        mainHeadline = `${p.name} - Yaratıcılık ve Eğlencede Dev Ekran`;
        subHeadline = 'Göz alıcı AMOLED/IPS ekran, stylus kalem desteği ve çoklu görev masaüstü modu.';
        specPills = ['📱 120Hz Canlı Ekran', '⚡ Çoklu Görev Modu', '✏️ Hassas Kalem'];
      }
    }
    // 5. SMARTWATCHES
    else if (cat === 'smartwatches') {
      badgeText = '⌚ AKILLI SAAT & SAĞLIK TAKİBİ';
      scriptHighlight = 'sağlığını anlık takip et';
      if (nameLower.includes('ultra') || nameLower.includes('apple watch')) {
        mainHeadline = 'Titanyum Kasa, 3000 Nit Safir Ekran ve Çift Frekanslı Hassas GPS';
        subHeadline = '100 Metre Suya Dayanıklılık • Derinlik Sensörü & EKG / Nabız Takibi';
        specText = 'Titanyum Gövde • Safir Kristal Cam • 100m Su Dayanımı';
        specPills = ['⌚ Havacılık Titanyumu', '⚡ 3000 Nit Safir Cam', '🌊 100m Su Geçirmezlik'];
      } else {
        mainHeadline = `${p.name} - Profesyonel Spor ve Yaşam Asistanı`;
        subHeadline = 'Gelişmiş biyoaktif sensörler, uyku analizi, kalp ritmi ve uzun pil ömrü.';
        specPills = ['⌚ Biyoaktif Sensörler', '⚡ AMOLED Safir Ekran', '🔋 Uzun Pil Ömrü'];
      }
    }
    // 6. HEADPHONES
    else if (cat === 'headphones') {
      badgeText = '🎧 Hİ-Fİ KABLOSUZ SES LİDERİ';
      scriptHighlight = 'kristal netlikte ses';
      mainHeadline = 'Özel Akustik Sürücüler, Hi-Res Kayıpsız Ses ve Sektör Lideri Aktif Gürültü Engelleme';
      subHeadline = 'Dinamik Kafa Takibi ile Uzamsal Ses • 30+ Saat Kesintisiz Çalma Süresi';
      specText = highlights[0] || 'Aktif Gürültü Engelleme (ANC) • Hi-Res Audio';
      specPills = ['🎧 Hi-Res Kayıpsız Ses', '⚡ Pro Düzey ANC', '🔋 30+ Saat Çalma'];
    }
    // 7. APPLIANCES
    else if (cat === 'appliances') {
      badgeText = '⚡ AKILLI EV & YAŞAM TEKNOLOJİSİ';
      scriptHighlight = 'yaşam kaliteni artır';
      mainHeadline = 'Rakipsiz Güç, HEPA Filtrasyon ve Akıllı Lazer Sensör Teknolojisi';
      subHeadline = 'Mikroskobik Toz Tespiti • Anti-Tangle Başlık & Yüksek Verimli Fırçasız Motor';
      specText = highlights[0] || 'Yüksek Emiş Gücü • Akıllı Toz Sensörü';
      specPills = ['⚡ Yüksek Emiş Gücü', '🔬 Akıllı Lazer Algılama', '🛡️ HEPA Filtrasyon'];
    }
    // 8. MONITORS
    else if (cat === 'monitors') {
      badgeText = '🖥️ PROFESYONEL OYUN & İÇERİK MONİTÖRÜ';
      scriptHighlight = 'milimetrik hız ve renk';
      mainHeadline = '0.03ms Tepki Süresi, 240Hz Tazeleme Hızı ve Kuantum Nokta OLED Panel';
      subHeadline = 'DisplayHDR True Black • AMD FreeSync Premium Pro & Kusursuz Renk Doğruluğu';
      specText = highlights[0] || 'OLED Panel • 240Hz • 0.03ms Tepki';
      specPills = ['🖥️ 240Hz QD-OLED', '⚡ 0.03ms Tepki Süresi', '🎨 HDR True Black'];
    }
    // 9. CONSOLES
    else if (cat === 'consoles') {
      badgeText = '🎮 YENİ NESİL OYUN KONSOLU';
      scriptHighlight = 'yeni nesil grafik gücü';
      mainHeadline = 'Gelişmiş GPU Mimarisi ile 4K 120Hz & Işın İzleme (Ray Tracing)';
      subHeadline = 'Ultra Yüksek Hızlı NVMe SSD • 3D Uzamsal Ses & Haptic Feedback Kontrolcü';
      specText = '4K 120 fps Ray Tracing • NVMe SSD • 3D Ses';
      specPills = ['🎮 4K 120Hz Oyun', '⚡ Ultra Hızlı NVMe SSD', '🔊 3D Uzamsal Ses'];
    }

    const calculatedScore = p.rating ? Math.min(99, Math.max(88, Math.round(p.rating * 10) + 50)) : (96 + (idx % 4));

    return {
      id: p.id || `slide-${idx}`,
      category: p.category || 'phones',
      slug: p.slug || p.id,
      badgeText,
      scriptHighlight,
      mainHeadline,
      subHeadline,
      productName: p.name,
      productSpec: specText,
      price: `${p.basePrice.toLocaleString('tr-TR')} ₺`,
      image: p.image || '/images/phones/apple/apple-iphone-16.jpg',
      specPills,
      score: calculatedScore
    };
  });
}
