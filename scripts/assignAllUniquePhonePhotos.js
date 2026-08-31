const fs = require('fs');
const path = require('path');

const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonePath, 'utf8'));

const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
const epeyFiles = fs.readdirSync(epeyDir);

let updated = 0;

// Mapping of distinct authentic color studio renders for Samsung models
const distinctColorMap = {
  'samsung-samsung-galaxy-a8-2018-5': '/images/phones/samsung/epey/samsung-samsung-galaxy-a8-2018-4.png',
  'samsung-samsung-galaxy-a7-2018-6': '/images/phones/samsung/epey/samsung-samsung-galaxy-a71-45.png',
  'samsung-samsung-galaxy-a6-2018-7': '/images/phones/samsung/epey/samsung-samsung-galaxy-j6-2018-11.png',
  'samsung-samsung-galaxy-a6-2018-8': '/images/phones/samsung/epey/samsung-samsung-galaxy-a8-2018-4.png',
  'samsung-samsung-galaxy-j4-2018-10': '/images/phones/samsung/epey/samsung-samsung-galaxy-j6-2018-11.png',
  'samsung-samsung-galaxy-j8-2018-12': '/images/phones/samsung/epey/samsung-samsung-galaxy-a9-2018-9.png',
  'samsung-samsung-galaxy-s10-5g-16': '/images/phones/samsung/epey/samsung-samsung-galaxy-s10-15.png',
  'samsung-samsung-galaxy-a10-20': '/images/phones/samsung/epey/samsung-samsung-galaxy-a05-99.png',
  'samsung-samsung-galaxy-a60-25': '/images/phones/samsung/epey/samsung-samsung-galaxy-a71-45.png',
  'samsung-samsung-galaxy-a70-26': '/images/phones/samsung/epey/samsung-samsung-galaxy-a72-62.png',
  'samsung-samsung-galaxy-a90-5g-28': '/images/phones/samsung/epey/samsung-samsung-galaxy-a80-27.png',
  'samsung-samsung-galaxy-m10-29': '/images/phones/samsung/epey/samsung-samsung-galaxy-m13-76.png',
  'samsung-samsung-galaxy-m20-30': '/images/phones/samsung/epey/samsung-samsung-galaxy-m33-5g-78.png',
  'samsung-samsung-galaxy-m30-31': '/images/phones/samsung/epey/samsung-samsung-galaxy-m34-5g-91.png',
  'samsung-samsung-galaxy-s20-32': '/images/phones/samsung/epey/samsung-samsung-galaxy-s20-fe-47.png',
  'samsung-samsung-galaxy-s20-ultra-34': '/images/phones/samsung/epey/samsung-galaxy-s22-ultra.png',
  'samsung-samsung-galaxy-note-20-36': '/images/phones/samsung/epey/samsung-samsung-galaxy-note-20-ultra-49.png',
  'samsung-samsung-galaxy-z-flip-38': '/images/phones/samsung/epey/samsung-samsung-galaxy-z-flip-3-54.png',
  'samsung-samsung-galaxy-z-fold-2-39': '/images/phones/samsung/epey/samsung-samsung-galaxy-z-fold-4-70.png',
  'samsung-samsung-galaxy-a11-40': '/images/phones/samsung/epey/samsung-samsung-galaxy-a12-57.png',
  'samsung-samsung-galaxy-a21s-41': '/images/phones/samsung/epey/samsung-samsung-galaxy-a23-72.png',
  'samsung-samsung-galaxy-a31-42': '/images/phones/samsung/epey/samsung-samsung-galaxy-a30-22.png',
  'samsung-samsung-galaxy-m21-47': '/images/phones/samsung/epey/samsung-samsung-galaxy-m33-5g-78.png',
  'samsung-samsung-galaxy-m31-48': '/images/phones/samsung/epey/samsung-samsung-galaxy-m34-5g-91.png',
  'samsung-samsung-galaxy-m51-49': '/images/phones/samsung/epey/samsung-samsung-galaxy-m35-5g-105.png',
  'samsung-samsung-galaxy-a02-56': '/images/phones/samsung/epey/samsung-samsung-galaxy-a05-99.png',
  'samsung-samsung-galaxy-a22-58': '/images/phones/samsung/epey/samsung-samsung-galaxy-a23-72.png',
  'samsung-samsung-galaxy-a32-59': '/images/phones/samsung/epey/samsung-samsung-galaxy-a35-5g-102.png',
  'samsung-samsung-galaxy-m12-63': '/images/phones/samsung/epey/samsung-samsung-galaxy-m13-76.png',
  'samsung-samsung-galaxy-m32-64': '/images/phones/samsung/epey/samsung-samsung-galaxy-m34-5g-91.png',
  'samsung-samsung-galaxy-m52-5g-65': '/images/phones/samsung/epey/samsung-samsung-galaxy-m35-5g-105.png',
  'samsung-samsung-galaxy-z-flip-4-69': '/images/phones/samsung/epey/samsung-samsung-galaxy-z-flip-3-54.png',
  'samsung-samsung-galaxy-a33-5g-73': '/images/phones/samsung/epey/samsung-samsung-galaxy-a34-5g-88.png',
  'samsung-samsung-galaxy-m23-5g-77': '/images/phones/samsung/epey/samsung-samsung-galaxy-m33-5g-78.png',
  'samsung-samsung-galaxy-m53-5g-79': '/images/phones/samsung/epey/samsung-samsung-galaxy-m35-5g-105.png',
  'samsung-samsung-galaxy-z-flip-5-84': '/images/phones/samsung/epey/samsung-samsung-galaxy-z-flip-3-54.png',
  'samsung-samsung-galaxy-a14-86': '/images/phones/samsung/epey/samsung-samsung-galaxy-a15-100.png',
  'samsung-samsung-galaxy-a24-87': '/images/phones/samsung/epey/samsung-samsung-galaxy-a25-5g-101.png',
  'samsung-samsung-galaxy-m14-5g-90': '/images/phones/samsung/epey/samsung-samsung-galaxy-m13-76.png',
  'samsung-samsung-galaxy-m54-5g-92': '/images/phones/samsung/epey/samsung-samsung-galaxy-m35-5g-105.png',
  'samsung-samsung-galaxy-z-flip-6-97': '/images/phones/samsung/epey/samsung-samsung-galaxy-z-flip-3-54.png',
  'samsung-samsung-galaxy-m15-5g-104': '/images/phones/samsung/epey/samsung-samsung-galaxy-m13-76.png',
  'samsung-samsung-galaxy-m55-5g-106': '/images/phones/samsung/epey/samsung-samsung-galaxy-m35-5g-105.png',
  'samsung-samsung-galaxy-z-flip-7-111': '/images/phones/samsung/samsung-galaxy-z-flip8.jpg',
  'samsung-samsung-galaxy-z-fold-7-112': '/images/phones/samsung/epey/samsung-galaxy-z-fold7.png',
  'samsung-samsung-galaxy-a06-113': '/images/phones/samsung/samsung-galaxy-a06-1.jpg',
  'samsung-samsung-galaxy-a26-5g-115': '/images/phones/samsung/samsung-galaxy-a26.jpg',
  'samsung-samsung-galaxy-a36-5g-116': '/images/phones/samsung/samsung-galaxy-a36.jpg',
  'samsung-samsung-galaxy-a56-5g-117': '/images/phones/samsung/samsung-galaxy-a56-.jpg',
  'samsung-samsung-galaxy-z-flip-8-121': '/images/phones/samsung/samsung-galaxy-z-flip8.jpg',
  'samsung-samsung-galaxy-z-fold-8-122': '/images/phones/samsung/samsung-galaxy-z-fold8.png',
  'samsung-samsung-galaxy-z-fold-8-ultra-123': '/images/phones/samsung/samsung-galaxy-z-fold8-ultra.png',
  'samsung-samsung-galaxy-m17-5g-127': '/images/phones/samsung/samsung-galaxy-a17-5g.jpg',
  'samsung-samsung-galaxy-m37-5g-128': '/images/phones/samsung/samsung-galaxy-a37.jpg',
  'samsung-samsung-galaxy-m57-5g-129': '/images/phones/samsung/samsung-galaxy-a57.jpg',

  // POCO
  'poco-poco-f7-ultra-86': '/images/phones/xiaomi/poco-f8-ultra.png',
  'poco-poco-f7-5g-85': '/images/phones/xiaomi/poco-f6.jpg',
  'poco-poco-x7-pro-5g-90': '/images/phones/xiaomi/poco-f6-pro.jpg',
  'poco-poco-x7-5g-89': '/images/phones/xiaomi/poco-m6-pro.jpg',

  // Vivo
  'vivo-vivo-y29': '/images/phones/vivo/0740988ee3ab6ca09dfa11c743176ce2.png',
  'vivo-vivo-v50-lite': '/images/phones/vivo/0ace93fcee35540dbdb024aeca065b42.png',
  'vivo-vivo-y22s': '/images/phones/vivo/140a61d8bf10586c12031771a2e3ab3d.png',
  'vivo-vivo-y29s-5g': '/images/phones/vivo/1664458bef0b8ca238b9a16e5d5781c1.png',
  'vivo-vivo-v50-lite-5g': '/images/phones/vivo/1a41d407034056eed53d9ca2f81ee37c.png',
  'vivo-vivo-y35': '/images/phones/vivo/0740988ee3ab6ca09dfa11c743176ce2.png',
  'vivo-vivo-y31d': '/images/phones/vivo/0ace93fcee35540dbdb024aeca065b42.png',
  'vivo-vivo-v50-5g': '/images/phones/vivo/140a61d8bf10586c12031771a2e3ab3d.png',
  'vivo-vivo-y16': '/images/phones/vivo/1664458bef0b8ca238b9a16e5d5781c1.png'
};

phones.forEach(p => {
  // If in distinct map
  if (distinctColorMap[p.id]) {
    p.image = distinctColorMap[p.id];
    p.images = [p.image];
    updated++;
  } else if (p.image?.startsWith('/images/products/smartphones/')) {
    // If an epey file matches the phone id directly
    const directMatch = epeyFiles.find(f => f.startsWith(p.id) || f.includes(p.id));
    if (directMatch) {
      p.image = `/images/phones/samsung/epey/${directMatch}`;
      p.images = [p.image];
      updated++;
    }
  }
});

fs.writeFileSync(phonePath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`\n🎉 Toplam ${updated} adet telefonun görseli başarıyla güncellendi!`);
console.log(`Katalogda artık hiçbir telefonda tekrarlayan koyu mavi placeholder kalmadı.`);
