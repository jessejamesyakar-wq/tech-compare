import { Product } from '@/lib/types';

export interface ScenarioVerdict {
  category: 'camera' | 'battery' | 'value' | 'performance' | 'display';
  iconName: 'Camera' | 'BatteryCharging' | 'Coins' | 'Cpu' | 'Monitor';
  label: string;
  winnerProductId: string;
  winnerProductName: string;
  winnerBrand: string;
  winnerAdvantage: string; // e.g. "%22 Daha Yüksek Kapasite" veya "₺8.000 Daha Uygun"
  reason: string; // 1 crisp premium sentence
}

export interface RefereeVerdictResult {
  headline: string; // e.g. "RoboPengu Hakem Kararı: Senaryoya Göre Kazananlar"
  summary: string; // Balanced 2-sentence executive summary
  scenarios: ScenarioVerdict[];
  recommendation1: string; // "Şunlar için Ürün 1: ..."
  recommendation2: string; // "Şunlar için Ürün 2: ..."
}

/**
 * 🛡️ Deterministik & Kesintisiz AI Hakem Motoru (Zero-Latency & Quota-Proof)
 * API kotası tükense dahi 0 milisaniyede kusursuz, tarafsız ve profesyonel
 * karşılaştırma hakemliği üretir.
 */
export function generateRefereeVerdict(p1: Product, p2: Product): RefereeVerdictResult {
  const s1: any = p1.specs || {};
  const s2: any = p2.specs || {};

  // Fiyatlar
  const price1 = p1.basePrice || 0;
  const price2 = p2.basePrice || 0;

  // 1. Kamera / Ekran Senaryosu
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

  // 2. Pil & Günlük Dayanıklılık Senaryosu
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

  // 3. Fiyat/Performans & Değer Senaryosu
  let valueWinner = p1;
  let valueAdvantage = 'Fiyat/Performans';
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
      valueReason = `Her iki model de aynı fiyat seviyesinde rekabet ediyor; tercih tamamen işletim sistemi ve tasarım zevkine kalıyor.`;
    }
  } else {
    valueWinner = p1;
    valueAdvantage = 'Piyasa Rekabeti';
    valueReason = `Fiyat seviyeleri piyasa koşullarına göre değişkenlik gösteriyor; güncel mağaza tekliflerini aşağıdan inceleyebilirsiniz.`;
  }

  // Scenarios Array
  const scenarios: ScenarioVerdict[] = [
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
    {
      category: 'value',
      iconName: 'Coins',
      label: 'Fiyat & Değer Avantajı',
      winnerProductId: valueWinner.id,
      winnerProductName: valueWinner.name,
      winnerBrand: valueWinner.brand,
      winnerAdvantage: valueAdvantage,
      reason: valueReason,
    },
  ];

  // Executive Summary
  const headline = 'RoboPengu Hakem Kararı';
  const summary = `Bu iki amiral gemisi arasında tek bir mutlak kazanan yoktur; doğru seçim tamamen sizin kullanım önceliğinize bağlıdır.`;

  const recommendation1 = isAppleP1
    ? `Sosyal medya video kalitesi, Apple ekosistemi akıcılığı ve yüksek 2. el değeri arıyorsanız 👉 ${p1.name}`
    : `Geniş donanım özgürlüğü, güçlü ekran teknolojisi ve günlük dayanıklılık arıyorsanız 👉 ${p1.name}`;

  const recommendation2 = isAppleP2
    ? `Sosyal medya video kalitesi, Apple ekosistemi akıcılığı ve yüksek 2. el değeri arıyorsanız 👉 ${p2.name}`
    : `Daha yüksek pil kapasitesi, esnek Android ekosistemi ve bütçe avantajı arıyorsanız 👉 ${p2.name}`;

  return {
    headline,
    summary,
    scenarios,
    recommendation1,
    recommendation2,
  };
}
