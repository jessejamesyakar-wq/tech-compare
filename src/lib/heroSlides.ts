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
    (p) => p.basePrice > 0 && p.image && !p.image.includes('placeholder')
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

  // Fallback defaults if list is empty or insufficient
  if (selectedProducts.length === 0) {
    return [
      {
        id: 'honor-magic-8-pro',
        category: 'smartphones',
        slug: 'honor-magic-8-pro-5g-12-512-gb',
        badgeText: '📱 AMİRAL GEMİSİ LİDERİ',
        scriptHighlight: 'yapay zeka ve kamera',
        mainHeadline: 'Honor Falcon Kamera Mimarisi & Snapdragon 8 Elite Çipi',
        subHeadline: '200 MP Periskop Telefoto • 1-120Hz LTPO OLED & 5800 mAh Silikon-Karbon Batarya',
        productName: 'Honor Magic 8 Pro 5G (12/512 GB)',
        productSpec: '120Hz LTPO OLED • 200 MP Telefoto • 100W Hızlı Şarj',
        price: '84.999 ₺',
        image: '/images/phones/honor/honor-magic-8-pro.jpg',
        specPills: ['📱 120Hz LTPO OLED', '⚡ Snapdragon 8 Elite', '📸 200 MP Falcon'],
        score: 99
      },
      {
        id: 'samsung-book4-ultra',
        category: 'laptops',
        slug: 'samsung-galaxy-book4-ultra',
        badgeText: '💻 PRO DİZÜSTÜ LİDERİ',
        scriptHighlight: 'profesyonel performans',
        mainHeadline: 'Intel Core Ultra 9 & NVIDIA GeForce RTX 4070 ile Zirve Yaratıcılık',
        subHeadline: 'Dynamic AMOLED 2X Dokunmatik Ekran • AKG Dörtlü Hoparlör & İnce Kasa',
        productName: 'Samsung Galaxy Book4 Ultra (Core Ultra 9 / RTX 4070)',
        productSpec: '16 inç Dynamic AMOLED 2X 120Hz • 32GB RAM / 1TB SSD',
        price: '42.779 ₺',
        image: '/images/products/laptops/samsung-book4-ultra.jpg',
        specPills: ['💻 Dynamic AMOLED 2X', '⚡ RTX 4070 GPU', '🔋 Akıllı Güç Yönetimi'],
        score: 99
      },
      {
        id: 'lg-oled-97m49la',
        category: 'tvs',
        slug: 'lg-oled97m49la-97-4k-ultra-hd-oled-evo',
        badgeText: '📺 DEV KABLOSUZ SİNEMA',
        scriptHighlight: 'sonsuz kontrast',
        mainHeadline: '97 inç Dev OLED evo Panel ve Sıfır Kablo Zero Connect Teknolojisi',
        subHeadline: 'α11 4K AI Görüntü İşlemcisi • 144Hz VRR & Dolby Atmos 4.2 Kanal Ses',
        productName: 'LG OLED97M49LA 97" 4K Ultra HD OLED evo Smart TV',
        productSpec: '97 inç 4K OLED evo Panel • Kablosuz AV Aktarımı • 144Hz',
        price: '596.999 ₺',
        image: '/images/products/tvs/lg-oled97m49la.jpg',
        specPills: ['📺 97" OLED evo', '📡 Zero Connect Kablosuz', '🔊 Dolby Atmos 4.2'],
        score: 99
      },
      {
        id: 'sony-ps5-pro',
        category: 'consoles',
        slug: 'sony-playstation-5-pro',
        badgeText: '🎮 YENİ NESİL KONSOL',
        scriptHighlight: '4k 120fps oyun',
        mainHeadline: 'PlayStation Spectral Super Resolution (PSSR) ile 4K 120Hz & Işın İzleme',
        subHeadline: '2 TB Yüksek Hızlı NVMe SSD • Tempest 3D AudioTech & Gelişmiş GPU Mimarisi',
        productName: 'Sony PlayStation 5 Pro (2 TB SSD)',
        productSpec: '4K 120 fps Ray Tracing • Wi-Fi 7 • DualSense Kablosuz Kontrolcü',
        price: '49.999 ₺',
        image: '/images/products/consoles/ps5-pro.jpg',
        specPills: ['🎮 4K 120Hz & PSSR', '⚡ 2 TB Ultra Hızlı SSD', '🔊 Tempest 3D Audio'],
        score: 98
      },
      {
        id: 'lg-ultragear-540hz',
        category: 'monitors',
        slug: 'lg-ultragear-27gx790b-b',
        badgeText: '🖥️ E-SPOR OYUN MONİTÖRÜ',
        scriptHighlight: 'milimetrik hız',
        mainHeadline: '540Hz Ekstrem Tazeleme Hızı & 0.03ms Tepki Süresiyle WQHD OLED',
        subHeadline: 'DisplayHDR True Black 400 • AMD FreeSync Premium Pro & Kusursuz Piksel Netliği',
        productName: 'LG UltraGear 27GX790B-B 27" 540Hz 0.03ms OLED Monitör',
        productSpec: '27 inç WQHD OLED Panel • 540Hz • 0.03ms GtG',
        price: '44.769 ₺',
        image: '/images/products/monitors/lg-ultragear-27.jpg',
        specPills: ['🖥️ 540Hz OLED Panel', '⚡ 0.03ms Tepki Süresi', '🎨 HDR True Black'],
        score: 99
      },
      {
        id: 'dyson-ontrac-anc',
        category: 'headphones',
        slug: 'dyson-ontrac-anc-copper',
        badgeText: '🎧 Hİ-Fİ KABLOSUZ SES',
        scriptHighlight: 'saf akustik deneyim',
        mainHeadline: 'Gelişmiş 8 Mikrofonlu Aktif Gürültü Engelleme ve 55 Saate Varan Pil',
        subHeadline: '40mm Neodimyum Sürücüler • Özel CNC Alüminyum & Bakır Ergonomik Kapsüller',
        productName: 'Dyson OnTrac™ Aktif Gürültü Engelleyici (ANC) Kulaklık',
        productSpec: 'Gelişmiş ANC • 55 Saat Çalma • Kişiselleştirilebilir Başlık',
        price: '19.899 ₺',
        image: '/images/products/headphones/dyson-ontrac.jpg',
        specPills: ['🎧 Gelişmiş Pro ANC', '⚡ 55 Saat Batarya', '🔊 40mm Neodimyum'],
        score: 97
      },
      {
        id: 'apple-ipad-pro-13-m5',
        category: 'tablets',
        slug: 'apple-ipad-pro-13-m5-cellular',
        badgeText: '🎨 DİJİTAL ÜRETKENLİK',
        scriptHighlight: 'sınırsız yaratıcılık',
        mainHeadline: 'Ultra Retina XDR Tandem OLED Ekran ve Apple M-Serisi Çip Mimarisi',
        subHeadline: 'ProMotion 120Hz • Apple Pencil Pro & Magic Keyboard Desteği',
        productName: 'Apple iPad Pro 13" (M5) Wi-Fi + Cellular (2 TB)',
        productSpec: '13 inç Tandem OLED 120Hz • Nano-texture Cam • 5G Bağlantı',
        price: '75.499 ₺',
        image: '/images/products/tablets/ipad-pro-13.jpg',
        specPills: ['📱 Tandem OLED Panel', '⚡ Apple Silicon Çip', '✏️ Apple Pencil Pro'],
        score: 99
      },
      {
        id: 'huawei-watch-ultimate',
        category: 'smartwatches',
        slug: 'huawei-watch-ultimate-design-gold',
        badgeText: '⌚ LÜKS AKILLI SAAT',
        scriptHighlight: 'prestij ve teknoloji',
        mainHeadline: '18 Ayar Altın Kakma, Zirkonyum Sıvı Metal Kasa ve Keşif Modu',
        subHeadline: '100 Metre Dalış Desteği • Çift Frekanslı Hassas GNSS & 14 Gün Pil Ömrü',
        productName: 'Huawei Watch Ultimate Design (18 Ayar Altın)',
        productSpec: '18K Altın Çerçeve • Zirkonyum Kasa • Safir Cam • 100m Dalış',
        price: '99.499 ₺',
        image: '/images/products/smartwatches/huawei-ultimate.jpg',
        specPills: ['⌚ 18K Altın Kakma', '⚡ 100m Dalış Koruması', '🔋 14 Gün Pil Ömrü'],
        score: 99
      },
      {
        id: 'dreame-x60-max-ultra',
        category: 'appliances',
        slug: 'dreame-x60-max-ultra-complete',
        badgeText: '⚡ AKILLI EV TEKNOLOJİSİ',
        scriptHighlight: 'otonom temizlik',
        mainHeadline: 'Rakipsiz Güç, HEPA Filtrasyon ve Akıllı Lazer Sensör Teknolojisi',
        subHeadline: 'Otomatik Paspas Yıkama & Kurutma İstasyonu • AI Engel Algılama',
        productName: 'Dreame X60 Max Ultra Complete Robot Süpürge',
        productSpec: 'Yüksek Emiş Gücü • Sıcak Suyla Paspas Yıkama • Lidar Haritalama',
        price: '132.609 ₺',
        image: '/images/products/appliances/dreame-x60.jpg',
        specPills: ['⚡ Yüksek Emiş Gücü', '🔬 AI Engel Algılama', '🛡️ Kendi Kendini Temizleme'],
        score: 98
      },
      {
        id: 'apple-iphone-18-pro-max',
        category: 'smartphones',
        slug: 'apple-iphone-18-pro-max-2-tb',
        badgeText: '💎 TİTANYUM AMİRAL GEMİSİ',
        scriptHighlight: 'sinematik performans',
        mainHeadline: 'Apple A18 Pro 3nm Çip & 48 MP Fusion Çift Katmanlı Telefoto Kamera',
        subHeadline: 'Super Retina XDR OLED • Titanyum Gövde & Camera Control Tuşu',
        productName: 'Apple iPhone 18 Pro Max (2 TB)',
        productSpec: '6.9 inç ProMotion 120Hz OLED • 4K 120 fps Dolby Vision',
        price: '255.999 ₺',
        image: '/images/phones/apple/apple-iphone-16-pro-max.jpg',
        specPills: ['📱 ProMotion 120Hz', '⚡ Apple A18 Pro 3nm', '🎥 4K 120fps Dolby'],
        score: 99
      },
      {
        id: 'dell-pro-max-18-plus',
        category: 'laptops',
        slug: 'dell-pro-max-18-plus',
        badgeText: '💻 İŞ İSTASYONU GÜCÜ',
        scriptHighlight: 'maksimum render gücü',
        mainHeadline: 'Intel Core Ultra İşlemci ve Profesyonel İş İstasyonu Mimarisi',
        subHeadline: '18 inç 4K Ultra HD IPS Ekran • Buhar Odalı Çift Fanlı Termal Soğutma',
        productName: 'Dell Pro Max 18 Plus (Core Ultra / RTX)',
        productSpec: '18 inç QHD+ 165Hz • 64GB DDR5 RAM • 2TB NVMe SSD',
        price: '579.569 ₺',
        image: '/images/products/laptops/dell-pro-18.jpg',
        specPills: ['💻 18" Dev Ekran', '⚡ 64GB DDR5 RAM', '❄️ Termal Çift Fan'],
        score: 99
      },
      {
        id: 'tcl-55c655-pro',
        category: 'tvs',
        slug: 'tcl-55c655-pro-55-4k-qled',
        badgeText: '📺 SMART QLED SİNEMA',
        scriptHighlight: 'canlı kuantum renkler',
        mainHeadline: 'Quantum Dot Renk Doğruluğu ve Onkyo 2.1 Subwoofer Ses Sistemi',
        subHeadline: 'Full Array Yerel Karartma • Dolby Vision Atmos & Google TV',
        productName: 'TCL 55C655 Pro 55" 4K QLED Smart TV',
        productSpec: '55 inç 4K QLED • Full Array Local Dimming • Onkyo 2.1',
        price: '32.309 ₺',
        image: '/images/products/tvs/tcl-55c655.jpg',
        specPills: ['📺 4K QLED Panel', '⚡ Onkyo 2.1 Ses', '🔊 Dolby Vision Atmos'],
        score: 96
      },
      {
        id: 'asus-rog-ally-x',
        category: 'consoles',
        slug: 'asus-rog-ally-x-2024',
        badgeText: '🎮 TAŞINABİLİR OYUN GÜCÜ',
        scriptHighlight: 'her yerde AAA oyun',
        mainHeadline: 'AMD Ryzen Z1 Extreme & 24GB LPDDR5X ile Avucundaki Canavar',
        subHeadline: '120Hz 7 inç FHD FreeSync Ekran • 80Wh Dev Batarya & Çift Fanlı Soğutma',
        productName: 'ASUS ROG Ally X (2024 - 1 TB SSD)',
        productSpec: 'AMD Z1 Extreme • 24GB RAM • 1TB SSD • 80Wh Batarya',
        price: '38.999 ₺',
        image: '/images/products/consoles/rog-ally-x.jpg',
        specPills: ['🎮 AMD Z1 Extreme', '⚡ 24GB LPDDR5X', '🔋 80Wh Büyük Pil'],
        score: 98
      },
      {
        id: 'apple-pro-display-xdr',
        category: 'monitors',
        slug: 'apple-pro-display-xdr-32',
        badgeText: '🖥️ 6K REFERANS MONİTÖR',
        scriptHighlight: 'kusursuz renk doğruluğu',
        mainHeadline: '32 inç 6K Retina Ekran ve 1.000.000:1 Kontrast Oranı',
        subHeadline: '1600 Nit Tepe Parlaklık • Nano-Texture Mat Cam & P3 Geniş Renk Gamı',
        productName: 'Apple Pro Display XDR (Nano-Texture Mat Cam 32")',
        productSpec: '32 inç 6K Retina (6016x3384) • 1600 nits • Nano-Texture',
        price: '348.249 ₺',
        image: '/images/products/monitors/apple-pro-display.jpg',
        specPills: ['🖥️ 32" 6K Retina', '⚡ 1600 Nit Parlaklık', '🎨 Nano-Texture Mat'],
        score: 99
      },
      {
        id: 'sony-wh-1000xm5',
        category: 'headphones',
        slug: 'sony-wh-1000xm5-black',
        badgeText: '🎧 SEKTÖR LİDERİ ANC',
        scriptHighlight: 'sessizliğin gücü',
        mainHeadline: 'Entegre İşlemci V1 & HD Gürültü Engelleme İşlemcisi QN1 ile Kusursuz Ses',
        subHeadline: 'Hi-Res Kablosuz LDAC • Speak-to-Chat & 30 Saat Kesintisiz Çalma',
        productName: 'Sony WH-1000XM5 Kablosuz ANC Kulaklık',
        productSpec: 'İkili İşlemci ANC • LDAC Hi-Res Audio • 30 Saat Batarya',
        price: '14.919 ₺',
        image: '/images/products/headphones/sony-wh1000xm5.jpg',
        specPills: ['🎧 HD QN1 & V1 ANC', '⚡ LDAC Hi-Res Audio', '🔋 30 Saat Batarya'],
        score: 98
      },
      {
        id: 'microsoft-surface-pro',
        category: 'tablets',
        slug: 'microsoft-surface-pro-copilot-plus',
        badgeText: '🎨 COPILOT+ YAPAY ZEKA',
        scriptHighlight: 'yeni nesil mobil güç',
        mainHeadline: 'Snapdragon X Elite NPU Destekli Copilot+ PC ve PixelSense Flow Ekran',
        subHeadline: '13 inç OLED 120Hz Dokunmatik • Surface Slim Pen & 14 Saate Varan Pil',
        productName: 'Microsoft Surface Pro Copilot+ PC (32GB / 1TB)',
        productSpec: '13 inç OLED 120Hz • Snapdragon X Elite • 32GB RAM / 1TB SSD',
        price: '166.829 ₺',
        image: '/images/products/tablets/surface-pro.jpg',
        specPills: ['📱 13" OLED 120Hz', '⚡ Snapdragon X Elite', '🤖 Copilot+ NPU'],
        score: 98
      },
      {
        id: 'garmin-fenix-8',
        category: 'smartwatches',
        slug: 'garmin-fenix-8-51mm-amoled',
        badgeText: '⌚ ZİRVE OUTDOOR SAATİ',
        scriptHighlight: 'zorlu koşullara hazır',
        mainHeadline: '51mm AMOLED Safir Titanyum Gövde, Dahili Mikrofon ve Hoparlör',
        subHeadline: '40 Metre Dalış Derecesi • TopoActive Haritalar & 29 Güne Varan Pil Ömrü',
        productName: 'Garmin Fenix 8 (51mm AMOLED Safir Titanyum)',
        productSpec: '51mm AMOLED • Titanyum Kasa • Dahili Fener • 29 Gün Pil',
        price: '54.719 ₺',
        image: '/images/products/smartwatches/garmin-fenix-8.jpg',
        specPills: ['⌚ AMOLED Safir Ekran', '⚡ Dahili Hoparlör & Fener', '🔋 29 Gün Pil'],
        score: 99
      },
      {
        id: 'oppo-find-n5',
        category: 'smartphones',
        slug: 'oppo-find-n5-512-gb',
        badgeText: '📱 KATLANABİLİR AMİRAL',
        scriptHighlight: 'katlanabilir inovasyon',
        mainHeadline: 'Hasselblad Master Kamera & Çift Periskop Telefoto Mimarisi',
        subHeadline: 'Ultra İnce Katlanabilir Gövde • Dimensity 9400 / Snapdragon 8 Elite',
        productName: 'OPPO Find N5 (512 GB - Katlanabilir)',
        productSpec: 'Katlanabilir 120Hz LTPO AMOLED • Hasselblad Optik Motor',
        price: '84.999 ₺',
        image: '/images/phones/oppo/oppo-find-n5.jpg',
        specPills: ['📱 Katlanabilir LTPO', '⚡ Amiral Gemisi Çip', '📸 Hasselblad Kamera'],
        score: 98
      },
      {
        id: 'asus-rog-strix-scar-18',
        category: 'laptops',
        slug: 'asus-rog-strix-scar-18',
        badgeText: '💻 CANAVAR OYUN DİZÜSTÜSÜ',
        scriptHighlight: 'maksimum fps',
        mainHeadline: 'Intel Core i9 & NVIDIA GeForce RTX 4090 ile Rakipsiz Oyun Gücü',
        subHeadline: '18 inç ROG Nebula HDR 240Hz Mini-LED Ekran • Sıvı Metal Soğutma',
        productName: 'Asus ROG Strix Scar 18 (i9 / RTX 4090)',
        productSpec: '18 inç 2.5K 240Hz Mini-LED • 64GB DDR5 • 2TB SSD RAID 0',
        price: '545.189 ₺',
        image: '/images/products/laptops/rog-strix-18.jpg',
        specPills: ['🎮 240Hz Mini-LED', '⚡ NVIDIA RTX 4090', '❄️ Sıvı Metal Termal'],
        score: 99
      },
      {
        id: 'samsung-114-microled',
        category: 'tvs',
        slug: 'samsung-114ms1c-microled',
        badgeText: '📺 MİKRO LED DEV EKRAN',
        scriptHighlight: 'lüksün zirvesi',
        mainHeadline: '114 inç Micro LED Teknolojisi ile Saf Renk ve Kendinden Işıklı Pikseller',
        subHeadline: 'Micro AI İşlemci • 100W 6.2.2 Kanal Dolby Atmos ve Çerçevesiz Tasarım',
        productName: 'Samsung 114" Micro LED 4K Smart TV',
        productSpec: '114 inç Micro LED Panel • Kendinden Işıklı • 100W 6.2.2 Kanal',
        price: '5.223.749 ₺',
        image: '/images/products/tvs/samsung-microled.jpg',
        specPills: ['📺 114" Micro LED', '⚡ Kendinden Işıklı Piksel', '🔊 100W 6.2.2 Ses'],
        score: 99
      },
      {
        id: 'marshall-major-iv',
        category: 'headphones',
        slug: 'marshall-major-iv-black',
        badgeText: '🎧 İKONİK ROCK SESİ',
        scriptHighlight: 'retro ve güçlü',
        mainHeadline: 'İkonik Marshall Tasarımı, Özel Akustik ve 80+ Saat Çalma Süresi',
        subHeadline: 'Kablosuz Şarj Desteği • Ergonomik Katlanabilir Yapı & Çok Yönlü Kontrol Tuşu',
        productName: 'Marshall Major IV Kablosuz Kulaklık Siyah',
        productSpec: '80+ Saat Pil • Kablosuz Şarj • Özel 40mm Dinamik Sürücüler',
        price: '5.369 ₺',
        image: '/images/products/headphones/marshall-major-4.jpg',
        specPills: ['🎧 İkonik Marshall Ses', '⚡ 80+ Saat Batarya', '🔋 Kablosuz Şarj'],
        score: 96
      },
      {
        id: 'oneplus-pad-3-pro',
        category: 'tablets',
        slug: 'oneplus-pad-3-pro-16-512',
        badgeText: '🎨 AMİRAL GEMİSİ TABLET',
        scriptHighlight: 'hız ve çoklu görev',
        mainHeadline: '144Hz 3K Ekran ve Snapdragon 8 Gen Serisi Amiral Gemisi Gücü',
        subHeadline: '7:5 Oranında Okuma & Üretkenlik Ekranı • 67W SUPERVOOC Hızlı Şarj',
        productName: 'OnePlus Pad 3 Pro (16 GB / 512 GB)',
        productSpec: '12.1 inç 3K 144Hz • Snapdragon 8 Gen 3 • 9510 mAh Batarya',
        price: '39.799 ₺',
        image: '/images/products/tablets/oneplus-pad.jpg',
        specPills: ['📱 3K 144Hz Ekran', '⚡ 16 GB LPDDR5X', '🔋 67W SUPERVOOC'],
        score: 97
      },
      {
        id: 'xiaomi-17-ultra',
        category: 'smartphones',
        slug: 'xiaomi-17-ultra-1tb',
        badgeText: '📱 LEICA KAMERA CANAVARI',
        scriptHighlight: 'optik mükemmellik',
        mainHeadline: 'Leica Summilux Dörtlü Optik & 1-inç Sensörlü Profesyonel Kamera',
        subHeadline: 'Snapdragon 8 Elite (3nm) • 2K 120Hz C8 LTPO OLED & 90W HyperCharge',
        productName: 'Xiaomi 17 Ultra (1 TB)',
        productSpec: '2K 120Hz LTPO OLED • 1" Leica Sensör • 90W Kablolu / 50W Kablosuz',
        price: '84.999 ₺',
        image: '/images/phones/xiaomi/xiaomi-17-ultra.jpg',
        specPills: ['📷 Leica Optik Motor', '⚡ Snapdragon 8 Elite', '🔋 90W HyperCharge'],
        score: 99
      },
      {
        id: 'msi-titan-18-hx',
        category: 'laptops',
        slug: 'msi-titan-18-hx-dragon-edition',
        badgeText: '💻 UÇ NOKTA OYUN GÜCÜ',
        scriptHighlight: 'titanyum performans',
        mainHeadline: 'Intel Core i9 14. Nesil & 175W Full Power NVIDIA RTX 4090',
        subHeadline: '18 inç 4K 120Hz Mini-LED Ekran • Cherry MX Mekanik Klavye & 128GB RAM',
        productName: 'MSI Titan 18 HX Dragon Edition (i9 / RTX 4090)',
        productSpec: '18 inç 4K 120Hz Mini-LED • 128GB RAM • 4TB NVMe SSD',
        price: '521.779 ₺',
        image: '/images/products/laptops/msi-titan-18.jpg',
        specPills: ['🎮 4K 120Hz Mini-LED', '⚡ 175W RTX 4090', '⌨️ Cherry MX Mekanik'],
        score: 99
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
      if (nameLower.includes('iphone 18') || nameLower.includes('iphone 17') || nameLower.includes('iphone 16') || nameLower.includes('iphone')) {
        mainHeadline = 'Apple A18 Pro 3nm Çip & 48 MP Fusion Çift Katmanlı Telefoto Kamera';
        subHeadline = 'Super Retina XDR OLED • Titanyum Gövde & Camera Control Tuşu';
        specText = '6.9 inç ProMotion 120Hz OLED • 4K 120 fps Dolby Vision';
        specPills = ['📱 ProMotion 120Hz', '⚡ Apple A-Serisi 3nm', '🎥 4K 120fps Dolby'];
      } else if (nameLower.includes('magic') || nameLower.includes('honor')) {
        mainHeadline = 'Honor Falcon Kamera Mimarisi & Snapdragon 8 Elite Çipi';
        subHeadline = '200 MP Periskop Telefoto • 1-120Hz LTPO OLED & 5800 mAh Silikon-Karbon Batarya';
        specText = '120Hz LTPO OLED • 200 MP Telefoto • 100W Hızlı Şarj';
        specPills = ['📱 120Hz LTPO OLED', '⚡ Snapdragon 8 Elite', '📸 200 MP Falcon'];
      } else if (nameLower.includes('xiaomi')) {
        mainHeadline = 'Leica Summilux Dörtlü Optik & 1-inç Sensörlü Kamera Canavarı';
        subHeadline = 'Snapdragon 8 Elite (3nm) • 2K 120Hz C8 LTPO OLED & 90W HyperCharge';
        specText = 'Leica Optik Sistem • 1-inç Sensör • 120Hz 2K Ekran';
        specPills = ['📷 Leica Optik Motor', '⚡ Snapdragon 8 Elite', '🔋 90W HyperCharge'];
      } else if (nameLower.includes('oppo') || nameLower.includes('find')) {
        mainHeadline = 'Hasselblad Katlanabilir Ekran & Çift Periskop Telefoto Mimarisi';
        subHeadline = 'Ultra İnce Katlanabilir Gövde • Dimensity 9400 / Snapdragon 8 Elite';
        specText = 'Katlanabilir 120Hz LTPO • Hasselblad Optik Motor';
        specPills = ['📱 Katlanabilir LTPO', '⚡ Amiral Gemisi Çip', '📸 Hasselblad Kamera'];
      } else if (nameLower.includes('s26') || nameLower.includes('s25') || nameLower.includes('ultra')) {
        mainHeadline = '200 MP UltraSensör & Galaxy AI Destekli Profesyonel Görsel Motoru';
        subHeadline = 'Snapdragon 8 Elite for Galaxy (3nm) • 1-120Hz Dinamik LTPO 2X Panel';
        specText = '6.8 inç QHD+ Dynamic AMOLED 2X (3200 nits) • Titanyum Kasa';
        specPills = ['📱 QHD+ Dynamic AMOLED', '⚡ Snapdragon 8 Elite', '📸 200 MP Ultra'];
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
      if (nameLower.includes('samsung') || nameLower.includes('book4')) {
        mainHeadline = 'Intel Core Ultra 9 & NVIDIA GeForce RTX 4070 ile Zirve Yaratıcılık';
        subHeadline = 'Dynamic AMOLED 2X Dokunmatik Ekran • AKG Dörtlü Hoparlör & İnce Kasa';
        specText = '16 inç Dynamic AMOLED 2X 120Hz • 32GB RAM / 1TB SSD';
        specPills = ['💻 Dynamic AMOLED 2X', '⚡ RTX 4070 GPU', '🔋 Akıllı Güç Yönetimi'];
      } else if (nameLower.includes('dell') || nameLower.includes('pro max 18')) {
        mainHeadline = 'Intel Core Ultra İşlemci ve Profesyonel İş İstasyonu Mimarisi';
        subHeadline = '18 inç 4K Ultra HD IPS Ekran • Buhar Odalı Çift Fanlı Termal Soğutma';
        specText = '18 inç QHD+ 165Hz • 64GB DDR5 RAM • 2TB NVMe SSD';
        specPills = ['💻 18" Dev Ekran', '⚡ 64GB DDR5 RAM', '❄️ Termal Çift Fan'];
      } else if (nameLower.includes('scar') || nameLower.includes('strix') || nameLower.includes('rog')) {
        mainHeadline = 'Intel Core i9 & NVIDIA GeForce RTX 4090 ile Rakipsiz Oyun Gücü';
        subHeadline = '18 inç ROG Nebula HDR 240Hz Mini-LED Ekran • Sıvı Metal Soğutma';
        specText = '18 inç 2.5K 240Hz Mini-LED • 64GB DDR5 • 2TB SSD RAID 0';
        specPills = ['🎮 240Hz Mini-LED', '⚡ NVIDIA RTX 4090', '❄️ Sıvı Metal Termal'];
      } else if (nameLower.includes('titan') || nameLower.includes('msi')) {
        mainHeadline = 'Intel Core i9 14. Nesil & 175W Full Power NVIDIA RTX 4090';
        subHeadline = '18 inç 4K 120Hz Mini-LED Ekran • Cherry MX Mekanik Klavye & 128GB RAM';
        specText = '18 inç 4K 120Hz Mini-LED • 128GB RAM • 4TB NVMe SSD';
        specPills = ['🎮 4K 120Hz Mini-LED', '⚡ 175W RTX 4090', '⌨️ Cherry MX Mekanik'];
      } else if (nameLower.includes('macbook')) {
        mainHeadline = 'Apple Silicon M-Serisi Çip ile Sektör Lideri Render ve Yapay Zekâ Gücü';
        subHeadline = 'Liquid Retina XDR Mini-LED Ekran • 22+ Saate Varan Pil Ömrü & MagSafe 3';
        specText = 'Liquid Retina XDR • ProMotion 120Hz • Apple Silicon Çip';
        specPills = ['💻 Liquid Retina XDR', '⚡ Apple Silicon M-Çip', '🔋 22+ Saat Batarya'];
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
      if (nameLower.includes('micro') || nameLower.includes('114')) {
        mainHeadline = '114 inç Micro LED Teknolojisi ile Saf Renk ve Kendinden Işıklı Pikseller';
        subHeadline = 'Micro AI İşlemci • 100W 6.2.2 Kanal Dolby Atmos ve Çerçevesiz Tasarım';
        specText = '114 inç Micro LED Panel • Kendinden Işıklı • 100W 6.2.2 Kanal';
        specPills = ['📺 114" Micro LED', '⚡ Kendinden Işıklı Piksel', '🔊 100W 6.2.2 Ses'];
      } else if (nameLower.includes('tcl')) {
        mainHeadline = 'Quantum Dot Renk Doğruluğu ve Onkyo 2.1 Subwoofer Ses Sistemi';
        subHeadline = 'Full Array Yerel Karartma • Dolby Vision Atmos & Google TV';
        specText = '55 inç 4K QLED • Full Array Local Dimming • Onkyo 2.1';
        specPills = ['📺 4K QLED Panel', '⚡ Onkyo 2.1 Ses', '🔊 Dolby Vision Atmos'];
      } else if (nameLower.includes('oled')) {
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
      if (nameLower.includes('surface')) {
        mainHeadline = 'Snapdragon X Elite NPU Destekli Copilot+ PC ve PixelSense Flow Ekran';
        subHeadline = '13 inç OLED 120Hz Dokunmatik • Surface Slim Pen & 14 Saate Varan Pil';
        specText = '13 inç OLED 120Hz • Snapdragon X Elite • 32GB RAM / 1TB SSD';
        specPills = ['📱 13" OLED 120Hz', '⚡ Snapdragon X Elite', '🤖 Copilot+ NPU'];
      } else if (nameLower.includes('oneplus')) {
        mainHeadline = '144Hz 3K Ekran ve Snapdragon 8 Gen Serisi Amiral Gemisi Gücü';
        subHeadline = '7:5 Oranında Okuma & Üretkenlik Ekranı • 67W SUPERVOOC Hızlı Şarj';
        specText = '12.1 inç 3K 144Hz • Snapdragon 8 Gen 3 • 9510 mAh Batarya';
        specPills = ['📱 3K 144Hz Ekran', '⚡ 16 GB LPDDR5X', '🔋 67W SUPERVOOC'];
      } else if (nameLower.includes('ipad')) {
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
      if (nameLower.includes('huawei') || nameLower.includes('ultimate')) {
        mainHeadline = '18 Ayar Altın Kakma, Zirkonyum Sıvı Metal Kasa ve Keşif Modu';
        subHeadline = '100 Metre Dalış Desteği • Çift Frekanslı Hassas GNSS & 14 Gün Pil Ömrü';
        specText = '18K Altın Çerçeve • Zirkonyum Kasa • Safir Cam • 100m Dalış';
        specPills = ['⌚ 18K Altın Kakma', '⚡ 100m Dalış Koruması', '🔋 14 Gün Pil Ömrü'];
      } else if (nameLower.includes('fenix') || nameLower.includes('garmin')) {
        mainHeadline = '51mm AMOLED Safir Titanyum Gövde, Dahili Mikrofon ve Hoparlör';
        subHeadline = '40 Metre Dalış Derecesi • TopoActive Haritalar & 29 Güne Varan Pil Ömrü';
        specText = '51mm AMOLED • Titanyum Kasa • Dahili Fener • 29 Gün Pil';
        specPills = ['⌚ AMOLED Safir Ekran', '⚡ Dahili Hoparlör & Fener', '🔋 29 Gün Pil'];
      } else if (nameLower.includes('ultra') || nameLower.includes('apple watch')) {
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
      if (nameLower.includes('dyson')) {
        mainHeadline = 'Gelişmiş 8 Mikrofonlu Aktif Gürültü Engelleme ve 55 Saate Varan Pil';
        subHeadline = '40mm Neodimyum Sürücüler • Özel CNC Alüminyum & Bakır Ergonomik Kapsüller';
        specText = 'Gelişmiş ANC • 55 Saat Çalma • Kişiselleştirilebilir Başlık';
        specPills = ['🎧 Gelişmiş Pro ANC', '⚡ 55 Saat Batarya', '🔊 40mm Neodimyum'];
      } else if (nameLower.includes('marshall')) {
        mainHeadline = 'İkonik Marshall Tasarımı, Özel Akustik ve 80+ Saat Çalma Süresi';
        subHeadline = 'Kablosuz Şarj Desteği • Ergonomik Katlanabilir Yapı & Çok Yönlü Kontrol Tuşu';
        specText = '80+ Saat Pil • Kablosuz Şarj • Özel 40mm Dinamik Sürücüler';
        specPills = ['🎧 İkonik Marshall Ses', '⚡ 80+ Saat Batarya', '🔋 Kablosuz Şarj'];
      } else if (nameLower.includes('sony') || nameLower.includes('1000xm')) {
        mainHeadline = 'Entegre İşlemci V1 & HD Gürültü Engelleme İşlemcisi QN1 ile Kusursuz Ses';
        subHeadline = 'Hi-Res Kablosuz LDAC • Speak-to-Chat & 30 Saat Kesintisiz Çalma';
        specText = 'İkili İşlemci ANC • LDAC Hi-Res Audio • 30 Saat Batarya';
        specPills = ['🎧 HD QN1 & V1 ANC', '⚡ LDAC Hi-Res Audio', '🔋 30 Saat Batarya'];
      } else {
        mainHeadline = 'Özel Akustik Sürücüler, Hi-Res Kayıpsız Ses ve Sektör Lideri Aktif Gürültü Engelleme';
        subHeadline = 'Dinamik Kafa Takibi ile Uzamsal Ses • 30+ Saat Kesintisiz Çalma Süresi';
        specText = highlights[0] || 'Aktif Gürültü Engelleme (ANC) • Hi-Res Audio';
        specPills = ['🎧 Hi-Res Kayıpsız Ses', '⚡ Pro Düzey ANC', '🔋 30+ Saat Çalma'];
      }
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
      if (nameLower.includes('pro display') || nameLower.includes('apple')) {
        mainHeadline = '32 inç 6K Retina Ekran ve 1.000.000:1 Kontrast Oranı';
        subHeadline = '1600 Nit Tepe Parlaklık • Nano-Texture Mat Cam & P3 Geniş Renk Gamı';
        specText = '32 inç 6K Retina (6016x3384) • 1600 nits • Nano-Texture';
        specPills = ['🖥️ 32" 6K Retina', '⚡ 1600 Nit Parlaklık', '🎨 Nano-Texture Mat'];
      } else if (nameLower.includes('540hz') || nameLower.includes('ultragear')) {
        mainHeadline = '540Hz Ekstrem Tazeleme Hızı & 0.03ms Tepki Süresiyle WQHD OLED';
        subHeadline = 'DisplayHDR True Black 400 • AMD FreeSync Premium Pro & Kusursuz Piksel Netliği';
        specText = '27 inç WQHD OLED Panel • 540Hz • 0.03ms GtG';
        specPills = ['🖥️ 540Hz OLED Panel', '⚡ 0.03ms Tepki Süresi', '🎨 HDR True Black'];
      } else {
        mainHeadline = '0.03ms Tepki Süresi, 240Hz Tazeleme Hızı ve Kuantum Nokta OLED Panel';
        subHeadline = 'DisplayHDR True Black • AMD FreeSync Premium Pro & Kusursuz Renk Doğruluğu';
        specText = highlights[0] || 'OLED Panel • 240Hz • 0.03ms Tepki';
        specPills = ['🖥️ 240Hz QD-OLED', '⚡ 0.03ms Tepki Süresi', '🎨 HDR True Black'];
      }
    }
    // 9. CONSOLES
    else if (cat === 'consoles') {
      badgeText = '🎮 YENİ NESİL OYUN KONSOLU';
      scriptHighlight = 'yeni nesil grafik gücü';
      if (nameLower.includes('ally')) {
        mainHeadline = 'AMD Ryzen Z1 Extreme & 24GB LPDDR5X ile Avucundaki Canavar';
        subHeadline = '120Hz 7 inç FHD FreeSync Ekran • 80Wh Dev Batarya & Çift Fanlı Soğutma';
        specText = 'AMD Z1 Extreme • 24GB RAM • 1TB SSD • 80Wh Batarya';
        specPills = ['🎮 AMD Z1 Extreme', '⚡ 24GB LPDDR5X', '🔋 80Wh Büyük Pil'];
      } else {
        mainHeadline = 'PlayStation Spectral Super Resolution (PSSR) ile 4K 120Hz & Işın İzleme';
        subHeadline = '2 TB Yüksek Hızlı NVMe SSD • Tempest 3D AudioTech & Gelişmiş GPU Mimarisi';
        specText = '4K 120 fps Ray Tracing • Wi-Fi 7 • DualSense Kablosuz Kontrolcü';
        specPills = ['🎮 4K 120Hz & PSSR', '⚡ 2 TB Ultra Hızlı SSD', '🔊 Tempest 3D Audio'];
      }
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
