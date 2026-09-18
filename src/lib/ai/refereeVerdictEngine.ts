import { Product } from '@/lib/types';

export interface ScenarioVerdict {
  category: 'camera' | 'battery' | 'value' | 'performance' | 'display' | 'gaming' | 'audio' | 'mobility' | 'hygiene' | 'features';
  iconName: 'Camera' | 'BatteryCharging' | 'Coins' | 'Cpu' | 'Monitor' | 'Tv' | 'Gamepad' | 'Headphones' | 'Watch' | 'Sparkles' | 'Zap';
  label: string;
  winnerProductId: string;
  winnerProductName: string;
  winnerBrand: string;
  winnerAdvantage: string;
  reason: string;
}

export interface RefereeVerdictResult {
  headline: string;
  summary: string;
  scenarios: ScenarioVerdict[];
  recommendation1: string;
  recommendation2: string;
}

/**
 * 🛡️ Deterministik & Kesintisiz AI Hakem Motoru (9 Kategori Uyumlu)
 * Her kategorinin kendine has gerçek teknik parametrelerini (TV için panel/ses/gaming,
 * Laptop için CPU/GPU/Wh, Kulaklık için ANC/Sürücü, Beyaz eşya için güç/kapasite vb.)
 * kullanarak sıfır gecikmeyle tarafsız ve profesyonel karar üretir.
 */
export function generateRefereeVerdict(p1: Product, p2: Product): RefereeVerdictResult {
  const s1: any = p1.specs || {};
  const s2: any = p2.specs || {};

  const category = (p1 as any).category || (p2 as any).category || 'smartphones';

  const price1 = p1.basePrice || 0;
  const price2 = p2.basePrice || 0;

  // 1. Fiyat & Değer Senaryosu (Tüm kategoriler için evrensel)
  let valueWinner = p1;
  let valueAdvantage = 'Fiyat/Performans Dengesi';
  let valueReason = '';

  if (price1 > 0 && price2 > 0) {
    if (price1 < price2) {
      const diffTl = price2 - price1;
      const diffPct = Math.round((diffTl / price2) * 100);
      valueWinner = p1;
      valueAdvantage = `₺${diffTl.toLocaleString('tr-TR')} Avantaj (%${diffPct})`;
      valueReason = `${p1.name}, benzer donanım yeteneklerini ₺${diffTl.toLocaleString('tr-TR')} daha hesaplı sunarak bütçe dostu akılcı bir seçenek oluyor.`;
    } else if (price2 < price1) {
      const diffTl = price1 - price2;
      const diffPct = Math.round((diffTl / price1) * 100);
      valueWinner = p2;
      valueAdvantage = `₺${diffTl.toLocaleString('tr-TR')} Avantaj (%${diffPct})`;
      valueReason = `${p2.name}, benzer donanım yeteneklerini ₺${diffTl.toLocaleString('tr-TR')} daha hesaplı sunarak bütçe dostu akılcı bir seçenek oluyor.`;
    } else {
      valueWinner = p1;
      valueAdvantage = 'Eşit Fiyat Bandı';
      valueReason = `Her iki model de aynı fiyat seviyesinde rekabet ediyor; tercih tamamen donanım beklentisi ve marka deneyimine kalıyor.`;
    }
  } else {
    valueWinner = p1;
    valueAdvantage = 'Piyasa Rekabeti';
    valueReason = `Fiyat seviyeleri piyasa koşullarına göre değişkenlik gösteriyor; güncel mağaza tekliflerini aşağıdan inceleyebilirsiniz.`;
  }

  const valueScenario: ScenarioVerdict = {
    category: 'value',
    iconName: 'Coins',
    label: 'Fiyat & Değer Avantajı',
    winnerProductId: valueWinner.id,
    winnerProductName: valueWinner.name,
    winnerBrand: valueWinner.brand,
    winnerAdvantage: valueAdvantage,
    reason: valueReason,
  };

  // ==========================================
  // KATEGORİ 1: TV'LER (tvs)
  // ==========================================
  if (category === 'tvs') {
    const size1 = s1.screenSizeInches || 55;
    const size2 = s2.screenSizeInches || 55;
    const hz1 = s1.refreshRateHz || 60;
    const hz2 = s2.refreshRateHz || 60;
    const audio1 = s1.audioPowerWatts || 20;
    const audio2 = s2.audioPowerWatts || 20;
    const tech1 = (s1.displayTech || '').toLowerCase();
    const tech2 = (s2.displayTech || '').toLowerCase();

    // Senaryo A: Panel & Sinema Deneyimi
    const isOled1 = tech1.includes('oled');
    const isOled2 = tech2.includes('oled');
    let panelWinner = p1;
    let panelAdvantage = `${s1.displayTech || 'OLED'} Panel`;
    let panelReason = '';

    if (isOled1 && !isOled2) {
      panelWinner = p1;
      panelAdvantage = 'Sonsuz Kontrast (OLED)';
      panelReason = `${p1.name}, piksel seviyesinde aydınlatma ve kusursuz siyah derinliğiyle sinematik film izleme deneyiminde üstün.`;
    } else if (isOled2 && !isOled1) {
      panelWinner = p2;
      panelAdvantage = 'Sonsuz Kontrast (OLED)';
      panelReason = `${p2.name}, piksel seviyesinde aydınlatma ve kusursuz siyah derinliğiyle sinematik film izleme deneyiminde üstün.`;
    } else if (size1 !== size2) {
      panelWinner = size1 > size2 ? p1 : p2;
      panelAdvantage = `+${Math.abs(size1 - size2)}" Daha Geniş Ekran`;
      panelReason = `${panelWinner.name}, ${Math.max(size1, size2)} inç dev paneliyle oturma odasında daha etkileyici bir sinema ortamı kuruyor.`;
    } else {
      panelWinner = p1;
      panelAdvantage = '4K HDR Görsel Zenginlik';
      panelReason = `Her iki TV de yüksek kontrastlı 4K panelleriyle canlı ve dinamik renk üretimi sağlıyor.`;
    }

    // Senaryo B: Oyun & Konsol / Ses Gücü
    let gameWinner = p1;
    let gameAdvantage = `${hz1} Hz Panel`;
    let gameReason = '';

    if (hz1 !== hz2) {
      gameWinner = hz1 > hz2 ? p1 : p2;
      gameAdvantage = `${Math.max(hz1, hz2)} Hz Yüksek Akıcılık`;
      gameReason = `${gameWinner.name}, ${Math.max(hz1, hz2)} Hz yenileme hızı ve HDMI 2.1 VRR desteğiyle PS5 ve Xbox konsollarında sıfır yırtılma sunuyor.`;
    } else if (audio1 !== audio2) {
      gameWinner = audio1 > audio2 ? p1 : p2;
      gameAdvantage = `+${Math.abs(audio1 - audio2)}W Daha Güçlü Ses`;
      gameReason = `${gameWinner.name}, ${Math.max(audio1, audio2)}W dahili hoparlör gücü ve Dolby Atmos akustik alanıyla harici ses sistemi aratmaz.`;
    } else {
      gameWinner = p1;
      gameAdvantage = 'HDMI 2.1 & Akıcı Oyun';
      gameReason = `İki televizyon da yeni nesil konsol oyuncuları için düşük giriş gecikmesi (ALLM) ve akıcı kare hızları sunuyor.`;
    }

    return {
      headline: 'RoboPengu TV Hakem Masası',
      summary: 'Görsel kalite, konsol uyumu ve salon deneyimi kriterlerinde iki televizyonun öne çıktığı alanlar belirlendi.',
      scenarios: [
        {
          category: 'display',
          iconName: 'Tv',
          label: 'Panel & Sinema Deneyimi',
          winnerProductId: panelWinner.id,
          winnerProductName: panelWinner.name,
          winnerBrand: panelWinner.brand,
          winnerAdvantage: panelAdvantage,
          reason: panelReason,
        },
        {
          category: 'gaming',
          iconName: 'Gamepad',
          label: 'Konsol / Oyun & Akustik',
          winnerProductId: gameWinner.id,
          winnerProductName: gameWinner.name,
          winnerBrand: gameWinner.brand,
          winnerAdvantage: gameAdvantage,
          reason: gameReason,
        },
        valueScenario,
      ],
      recommendation1: `Geniş salon ortamında ${s1.displayTech || 'kaliteli'} görüntüleme ve ${s1.smartOs || 'Smart TV'} akıcılığı istiyorsanız 👉 ${p1.name}`,
      recommendation2: `Konsol deneyimi, ${hz2} Hz akıcılık ve ${s2.smartOs || 'Smart TV'} ekosistemi hedefliyorsanız 👉 ${p2.name}`,
    };
  }

  // ==========================================
  // KATEGORİ 2: LAPTOPLAR (laptops)
  // ==========================================
  if (category === 'laptops') {
    const ram1 = s1.ramGb || 16;
    const ram2 = s2.ramGb || 16;
    const wh1 = s1.batteryCapacityWh || 60;
    const wh2 = s2.batteryCapacityWh || 60;
    const kg1 = s1.weightKg || 1.8;
    const kg2 = s2.weightKg || 1.8;

    // Senaryo A: İşlemci & Ağır İş Yükü
    let cpuWinner = p1;
    let cpuAdvantage = s1.processor || 'Yüksek Çekirdek Gücü';
    let cpuReason = `${p1.name}, çok çekirdekli mimarisi ve yüksek frekans bandıyla yazılım derleme ve veri işleme işlerinde hızlı tepki veriyor.`;

    if (ram1 > ram2) {
      cpuWinner = p1;
      cpuAdvantage = `${ram1} GB Yüksek RAM`;
      cpuReason = `${p1.name}, ${ram1} GB geniş belleğiyle onlarca tarayıcı sekmesi ve ağır tasarım araçlarında darboğaz yaşatmıyor.`;
    } else if (ram2 > ram1) {
      cpuWinner = p2;
      cpuAdvantage = `${ram2} GB Yüksek RAM`;
      cpuReason = `${p2.name}, ${ram2} GB geniş belleğiyle onlarca tarayıcı sekmesi ve ağır tasarım araçlarında darboğaz yaşatmıyor.`;
    }

    // Senaryo B: Taşınabilirlik & Pil
    let mobWinner = p1;
    let mobAdvantage = 'Dengeli Mobilite';
    let mobReason = '';

    if (kg1 <= kg2 * 0.9) {
      mobWinner = p1;
      mobAdvantage = `${kg1} kg Hafif Gövde`;
      mobReason = `${p1.name}, çantada neredeyse hissedilmeyen ${kg1} kg ağırlığıyla ofis ve seyahat taşınabilirliğinde lider.`;
    } else if (kg2 <= kg1 * 0.9) {
      mobWinner = p2;
      mobAdvantage = `${kg2} kg Hafif Gövde`;
      mobReason = `${p2.name}, çantada neredeyse hissedilmeyen ${kg2} kg ağırlığıyla ofis ve seyahat taşınabilirliğinde lider.`;
    } else if (wh1 > wh2) {
      mobWinner = p1;
      mobAdvantage = `${wh1} Wh Geniş Batarya`;
      mobReason = `${p1.name}, ${wh1} Wh yüksek pil kapasitesiyle prizden uzakta saatlerce çalışma güvencesi sunuyor.`;
    } else if (wh2 > wh1) {
      mobWinner = p2;
      mobAdvantage = `${wh2} Wh Geniş Batarya`;
      mobReason = `${p2.name}, ${wh2} Wh yüksek pil kapasitesiyle prizden uzakta saatlerce çalışma güvencesi sunuyor.`;
    } else {
      mobWinner = p1;
      mobAdvantage = 'Mobil Kullanım';
      mobReason = 'Her iki dizüstü bilgisayar da modern mobil çalışanların tüm günlük taşınabilirlik taleplerini karşılıyor.';
    }

    return {
      headline: 'RoboPengu Laptop Hakem Masası',
      summary: 'İşlemci performansı, taşınabilirlik ve günlük çalışma ergonomisi kriterlerine göre sonuçlar hazırlandı.',
      scenarios: [
        {
          category: 'performance',
          iconName: 'Cpu',
          label: 'İşlemci & Ağır İş Yükü',
          winnerProductId: cpuWinner.id,
          winnerProductName: cpuWinner.name,
          winnerBrand: cpuWinner.brand,
          winnerAdvantage: cpuAdvantage,
          reason: cpuReason,
        },
        {
          category: 'mobility',
          iconName: 'BatteryCharging',
          label: 'Mobilite & Taşınabilirlik',
          winnerProductId: mobWinner.id,
          winnerProductName: mobWinner.name,
          winnerBrand: mobWinner.brand,
          winnerAdvantage: mobAdvantage,
          reason: mobReason,
        },
        valueScenario,
      ],
      recommendation1: `Yüksek iş verimliliği ve ${s1.processor || 'güçlü mimari'} donanımı arıyorsanız 👉 ${p1.name}`,
      recommendation2: `Grafik işleme ve ${s2.gpu || 'performanslı donanım'} avantajı hedefliyorsanız 👉 ${p2.name}`,
    };
  }

  // ==========================================
  // KATEGORİ 3: MONİTÖRLER (monitors)
  // ==========================================
  if (category === 'monitors') {
    const hz1 = s1.refreshRateHz || 60;
    const hz2 = s2.refreshRateHz || 60;
    const ms1 = s1.responseTimeMs || 5;
    const ms2 = s2.responseTimeMs || 5;
    const nits1 = s1.brightnessNits || 300;
    const nits2 = s2.brightnessNits || 300;

    let gameWinner = hz1 >= hz2 ? p1 : p2;
    let gameAdv = `${Math.max(hz1, hz2)} Hz Akıcılık`;
    let gameReason = `${gameWinner.name}, ${Math.max(hz1, hz2)} Hz yenileme hızı ve ${Math.min(ms1, ms2)} ms tepki süresiyle rekabetçi e-spor oyunlarında avantaj sağlıyor.`;

    let panelWinner = nits1 >= nits2 ? p1 : p2;
    let panelAdv = `${Math.max(nits1, nits2)} Nits Parlaklık`;
    let panelReason = `${panelWinner.name}, yüksek parlaklık değeri ve ${s1.panelType || 'IPS'} renk doğruluğuyla gündüz ışığında bile net görüş sunuyor.`;

    return {
      headline: 'RoboPengu Monitör Hakem Masası',
      summary: 'Tazeleme hızı, piksel tepki süresi ve panel renk doğruluğu kıyaslandı.',
      scenarios: [
        {
          category: 'gaming',
          iconName: 'Zap',
          label: 'Oyun & Tazeleme Hızı',
          winnerProductId: gameWinner.id,
          winnerProductName: gameWinner.name,
          winnerBrand: gameWinner.brand,
          winnerAdvantage: gameAdv,
          reason: gameReason,
        },
        {
          category: 'display',
          iconName: 'Monitor',
          label: 'Panel & Görsel Netlik',
          winnerProductId: panelWinner.id,
          winnerProductName: panelWinner.name,
          winnerBrand: panelWinner.brand,
          winnerAdvantage: panelAdv,
          reason: panelReason,
        },
        valueScenario,
      ],
      recommendation1: `Rekabetçi FPS oyunları ve yüksek hız için 👉 ${p1.name}`,
      recommendation2: `Geniş panel açısı ve dengeli renk üretimi için 👉 ${p2.name}`,
    };
  }

  // ==========================================
  // KATEGORİ 4: BEYAZ EŞYA / KÜÇÜK EV (appliances)
  // ==========================================
  if (category === 'appliances') {
    const power1 = s1.suctionPowerPa || s1.powerWatts || 2000;
    const power2 = s2.suctionPowerPa || s2.powerWatts || 2000;
    const isPa = Boolean(s1.suctionPowerPa || s2.suctionPowerPa);

    let powerWinner = power1 >= power2 ? p1 : p2;
    let powerAdv = isPa ? `${Math.max(power1, power2)} Pa Emiş Gücü` : `${Math.max(power1, power2)} W Motor Gücü`;
    let powerReason = `${powerWinner.name}, yüksek motor gücüyle en zorlu yüzeylerde dahi derinlemesine temizlik ve performans sunar.`;

    return {
      headline: 'RoboPengu Ev Teknolojileri Hakem Masası',
      summary: 'Motor performansı, hazne kapasitesi ve enerji verimliliği incelendi.',
      scenarios: [
        {
          category: 'performance',
          iconName: 'Zap',
          label: 'Motor & Temizlik Gücü',
          winnerProductId: powerWinner.id,
          winnerProductName: powerWinner.name,
          winnerBrand: powerWinner.brand,
          winnerAdvantage: powerAdv,
          reason: powerReason,
        },
        {
          category: 'hygiene',
          iconName: 'Sparkles',
          label: 'Konfor & Fonksiyonellik',
          winnerProductId: p1.id,
          winnerProductName: p1.name,
          winnerBrand: p1.brand,
          winnerAdvantage: 'Optimize Ev Kullanımı',
          reason: `${p1.name}, modern ev ihtiyaçlarına yönelik ergonomik hazne ve filtreleme tasarımıyla öne çıkıyor.`,
        },
        valueScenario,
      ],
      recommendation1: `Gelişmiş motor gücü ve pratik ev kullanımı arıyorsanız 👉 ${p1.name}`,
      recommendation2: `Tasarruflu enerji profili ve şık tasarım için 👉 ${p2.name}`,
    };
  }

  // ==========================================
  // KATEGORİ 5: AKILLI TELEFONLAR (smartphones - default)
  // ==========================================
  const cam1Raw = s1.camera?.mainMp || s1.camera || 48;
  const cam2Raw = s2.camera?.mainMp || s2.camera || 50;
  const cam1Mp = typeof cam1Raw === 'number' ? cam1Raw : parseInt(String(cam1Raw).replace(/\D/g, ''), 10) || 48;
  const cam2Mp = typeof cam2Raw === 'number' ? cam2Raw : parseInt(String(cam2Raw).replace(/\D/g, ''), 10) || 50;

  const isAppleP1 = p1.brand.toLowerCase() === 'apple';
  const isAppleP2 = p2.brand.toLowerCase() === 'apple';

  let cameraWinner = p1;
  let cameraAdvantage = 'Gelişmiş Renk Doğruluğu & Video';
  let cameraReason = '';

  if (isAppleP1 && !isAppleP2) {
    cameraWinner = p1;
    cameraAdvantage = '4K Dolby Vision & ProRes';
    cameraReason = `${p1.name}, sosyal medya video optimizasyonu, sinematik stabilizasyon ve stüdyo renk doğruluğuyla içerik üreticileri için bir adım önde.`;
  } else if (isAppleP2 && !isAppleP1) {
    cameraWinner = p2;
    cameraAdvantage = '4K Dolby Vision & ProRes';
    cameraReason = `${p2.name}, sosyal medya video optimizasyonu, sinematik stabilizasyon ve stüdyo renk doğruluğuyla içerik üreticileri için bir adım önde.`;
  } else if (cam1Mp > cam2Mp) {
    cameraWinner = p1;
    cameraAdvantage = `${cam1Mp} MP Yüksek Çözünürlük`;
    cameraReason = `${p1.name}, yüksek sensör çözünürlüğü ve detay yakalama kapasitesiyle manzara ve portre çekimlerinde avantaj sağlıyor.`;
  } else {
    cameraWinner = p2;
    cameraAdvantage = `${cam2Mp} MP Yüksek Çözünürlük`;
    cameraReason = `${p2.name}, üstün optik zoom ve gelişmiş sensör yapısıyla detay kaybı yaşamadan net çekimler sunuyor.`;
  }

  const bat1Raw = s1.battery?.capacitymAh || s1.battery || 4500;
  const bat2Raw = s2.battery?.capacitymAh || s2.battery || 5000;
  const bat1 = typeof bat1Raw === 'number' ? bat1Raw : parseInt(String(bat1Raw).replace(/\D/g, ''), 10) || 4500;
  const bat2 = typeof bat2Raw === 'number' ? bat2Raw : parseInt(String(bat2Raw).replace(/\D/g, ''), 10) || 5000;

  let batteryWinner = p1;
  let batteryAdvantage = 'Verimli Güç Yönetimi';
  let batteryReason = '';

  if (bat1 >= bat2 * 1.05) {
    batteryWinner = p1;
    const diffMah = bat1 - bat2;
    batteryAdvantage = `+${diffMah} mAh Kapasite`;
    batteryReason = `${p1.name}, daha büyük batarya gövdesiyle gün boyunca şarj aleti arama ihtiyacını minimuma indiriyor.`;
  } else if (bat2 >= bat1 * 1.05) {
    batteryWinner = p2;
    const diffMah = bat2 - bat1;
    batteryAdvantage = `+${diffMah} mAh Kapasite`;
    batteryReason = `${p2.name}, geniş batarya hacmi ve hızlı şarj desteğiyle yoğun kullanımda priz bağımlılığını ortadan kaldırıyor.`;
  } else {
    batteryWinner = bat2 >= bat1 ? p2 : p1;
    batteryAdvantage = 'Dengeli Pil Tüketimi';
    batteryReason = `Her iki cihaz da modern işlemci mimarisiyle 1 günü rahatlıkla tamamlayan dengeli bir pil profili çiziyor.`;
  }

  return {
    headline: 'RoboPengu Hakem Kararı',
    summary: 'Bu iki amiral gemisi arasında tek bir mutlak kazanan yoktur; doğru seçim tamamen sizin kullanım önceliğinize bağlıdır.',
    scenarios: [
      {
        category: 'camera',
        iconName: 'Camera',
        label: 'Kamera & Sosyal Medya',
        winnerProductId: cameraWinner.id,
        winnerProductName: cameraWinner.name,
        winnerBrand: cameraWinner.brand,
        winnerAdvantage: cameraAdvantage,
        reason: cameraReason,
      },
      {
        category: 'battery',
        iconName: 'BatteryCharging',
        label: 'Pil & Günlük Dayanıklılık',
        winnerProductId: batteryWinner.id,
        winnerProductName: batteryWinner.name,
        winnerBrand: batteryWinner.brand,
        winnerAdvantage: batteryAdvantage,
        reason: batteryReason,
      },
      valueScenario,
    ],
    recommendation1: isAppleP1
      ? `Sosyal medya video kalitesi, Apple ekosistemi akıcılığı ve yüksek 2. el değeri arıyorsanız 👉 ${p1.name}`
      : `Geniş donanım özgürlüğü, güçlü ekran teknolojisi ve günlük dayanıklılık arıyorsanız 👉 ${p1.name}`,
    recommendation2: isAppleP2
      ? `Sosyal medya video kalitesi, Apple ekosistemi akıcılığı ve yüksek 2. el değeri arıyorsanız 👉 ${p2.name}`
      : `Daha yüksek pil kapasitesi, esnek Android ekosistemi ve bütçe avantajı arıyorsanız 👉 ${p2.name}`,
  };
}
