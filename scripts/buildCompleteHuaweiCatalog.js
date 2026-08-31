const fs = require('fs');
const path = require('path');

const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
let phones = JSON.parse(fs.readFileSync(phonePath, 'utf8'));

const huaweiDir = path.join(__dirname, '../public/images/phones/huawei');
const files = fs.readdirSync(huaweiDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));

console.log(`====================================================`);
console.log(`📦 TOPLAM ${files.length} ADET HUAWEI MODELİ ENTEGRE EDİLİYOR`);
console.log(`====================================================\n`);

// Helper to determine price & specs segment based on model name
function getModelDetails(name) {
  const lower = name.toLowerCase();
  
  if (lower.includes('pura 70 ultra') || lower.includes('mate 60 rs') || lower.includes('mate 70 rs') || lower.includes('mate xt') || lower.includes('mate x')) {
    return { price: 69999, ram: '16 GB', storage: '512 GB / 1 TB', camera: '50 MP Ultra Vision XMAGE', battery: '5200 mAh', processor: 'Kirin 9010' };
  }
  if (lower.includes('pura 70 pro') || lower.includes('mate 60 pro') || lower.includes('mate 70 pro') || lower.includes('p60 pro')) {
    return { price: 54999, ram: '12 GB', storage: '512 GB', camera: '50 MP XMAGE OIS', battery: '5000 mAh', processor: 'Kirin 9000S / Snapdragon 8+ Gen 1' };
  }
  if (lower.includes('pura 70') || lower.includes('mate 50 pro') || lower.includes('p50 pro') || lower.includes('mate 40 pro')) {
    return { price: 39999, ram: '8 GB / 12 GB', storage: '256 GB', camera: '50 MP True-Chroma OIS', battery: '4700 mAh', processor: 'Snapdragon 8+ Gen 1' };
  }
  if (lower.includes('p40 pro') || lower.includes('mate 30 pro') || lower.includes('p30 pro')) {
    return { price: 24999, ram: '8 GB', storage: '256 GB', camera: '40 MP / 50 MP Leica Periskop', battery: '4200 mAh', processor: 'Kirin 990 / 980' };
  }
  if (lower.includes('nova 13') || lower.includes('nova 12') || lower.includes('nova 11') || lower.includes('nova 10')) {
    return { price: 19999, ram: '8 GB', storage: '256 GB', camera: '50 MP RYYB Ultra Vision', battery: '4500 mAh', processor: 'Snapdragon 778G' };
  }
  if (lower.includes('p20 pro') || lower.includes('mate 20') || lower.includes('mate 10') || lower.includes('p30 lite')) {
    return { price: 12999, ram: '6 GB', storage: '128 GB', camera: '40 MP Üçlü Leica', battery: '4000 mAh', processor: 'Kirin 970 / 710' };
  }
  if (lower.includes('enjoy 70') || lower.includes('enjoy 60') || lower.includes('nova y90') || lower.includes('nova y70')) {
    return { price: 8999, ram: '6 GB / 8 GB', storage: '128 GB', camera: '50 MP AI Çift Kamera', battery: '6000 mAh', processor: 'Kirin 710A / Snapdragon 680' };
  }
  if (lower.includes('y9') || lower.includes('y7') || lower.includes('y6') || lower.includes('y5') || lower.includes('enjoy')) {
    return { price: 5499, ram: '3 GB / 4 GB', storage: '64 GB', camera: '13 MP / 48 MP AI Kamera', battery: '4000 mAh', processor: 'Mediatek / Kirin' };
  }
  
  // Classic models (Ascend, G series, U series)
  return { price: 2499, ram: '1 GB / 2 GB', storage: '8 GB / 16 GB', camera: '8 MP / 13 MP Kamera', battery: '2100 mAh', processor: 'Dual-core / Quad-core' };
}

let added = 0;
let updated = 0;

files.forEach(f => {
  let name = f.replace(/\.jpg$/, '').replace(/\.png$/, '');
  name = name.replace(/^huawei-huawei-/, '').replace(/^huawei-/, '');
  
  const parts = name.split('-');
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) parts.pop();
  
  let cleanWords = parts.map(p => {
    const pl = p.toLowerCase();
    if (['5g', '4g', '3g', '2g', 'lte', 'hd', 'xl', 'ii', 'iii', 'iv', 'rs', 'se'].includes(pl)) return pl.toUpperCase();
    if (pl === 'pro') return 'Pro';
    if (pl === 'ultra') return 'Ultra';
    if (pl === 'max') return 'Max';
    if (pl === 'plus') return 'Plus';
    if (pl === 'lite') return 'Lite';
    if (pl === 'nova') return 'nova';
    if (pl === 'pura') return 'Pura';
    if (pl === 'mate') return 'Mate';
    if (pl === 'enjoy') return 'Enjoy';
    if (pl === 'ascend') return 'Ascend';
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
  
  const fullName = 'Huawei ' + cleanWords.join(' ');
  const rawSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = `huawei-${rawSlug}`;
  
  const details = getModelDetails(fullName);
  const imagePath = `/images/phones/huawei/${f}`;
  
  const existingIdx = phones.findIndex(p => p.id === id || p.image === imagePath);
  
  const productObj = {
    id: id,
    name: fullName,
    brand: 'Huawei',
    category: 'smartphones',
    slug: rawSlug,
    basePrice: details.price,
    rating: Number((4.3 + (Math.random() * 0.6)).toFixed(1)),
    reviewCount: Math.floor(40 + Math.random() * 300),
    image: imagePath,
    images: [imagePath],
    specs: {
      screenSize: details.price > 30000 ? '6.78 inç LTPO OLED' : (details.price > 10000 ? '6.67 inç OLED' : '6.3 inç IPS LCD'),
      processor: details.processor,
      ram: details.ram,
      storage: details.storage,
      battery: details.battery,
      mainCamera: details.camera,
      frontCamera: details.price > 20000 ? '13 MP / 60 MP 4K Portre' : '8 MP / 16 MP Portre',
      os: details.price > 20000 ? 'HarmonyOS / EMUI' : 'EMUI (Android Destekli)',
      chargingSpeed: details.price > 40000 ? '100W SuperCharge' : (details.price > 15000 ? '66W Hızlı Şarj' : '10W - 22.5W Şarj')
    },
    storeOffers: [
      { storeName: 'Hepsiburada', storeLogo: '/images/stores/hepsiburada.svg', price: details.price, inStock: true, deliveryTime: 'Yarın Kargoda', url: 'https://www.hepsiburada.com' },
      { storeName: 'Trendyol', storeLogo: '/images/stores/trendyol.svg', price: Math.round(details.price * 1.02), inStock: true, deliveryTime: '2 Gün İçinde', url: 'https://www.trendyol.com' },
      { storeName: 'MediaMarkt', storeLogo: '/images/stores/mediamarkt.svg', price: Math.round(details.price * 1.04), inStock: true, deliveryTime: 'Aynı Gün Teslimat', url: 'https://www.mediamarkt.com.tr' }
    ]
  };

  if (existingIdx >= 0) {
    phones[existingIdx] = { ...phones[existingIdx], ...productObj };
    updated++;
  } else {
    phones.push(productObj);
    added++;
  }
});

// Ensure no duplicate IDs or Slugs
const seenIds = new Set();
const seenSlugs = new Set();
const finalPhones = [];

phones.forEach(p => {
  let uniqueId = p.id;
  let counter = 1;
  while (seenIds.has(uniqueId)) {
    uniqueId = `${p.id}-${counter}`;
    counter++;
  }
  seenIds.add(uniqueId);
  p.id = uniqueId;

  let uniqueSlug = p.slug || p.id;
  counter = 1;
  while (seenSlugs.has(uniqueSlug)) {
    uniqueSlug = `${p.slug}-${counter}`;
    counter++;
  }
  seenSlugs.add(uniqueSlug);
  p.slug = uniqueSlug;

  finalPhones.push(p);
});

fs.writeFileSync(phonePath, JSON.stringify(finalPhones, null, 2), 'utf8');

console.log(`✅ ${files.length} adet Huawei modelinin tamamı kataloğa eklendi ve doğrulandı!`);
console.log(`Eklenen yeni model: ${added}`);
console.log(`Güncellenen model: ${updated}`);
console.log(`Katalogdaki toplam telefon sayısı: ${finalPhones.length}`);
console.log(`Katalogdaki toplam Huawei telefon sayısı: ${finalPhones.filter(p => p.brand === 'Huawei').length}`);
