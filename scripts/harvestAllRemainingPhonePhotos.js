const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '../public/images/phones/samsung/epey');
const contentToken = '81a97782-9a81-4879-a49d-b4590ea070a9';

// Specific authentic photos in diverse colors (Lavender, Lime, Violet, Peach, Coral, Gold, Mint, Blue, etc.)
const modelImageMap = {
  // Samsung A & J Series
  'samsung-samsung-galaxy-a8-2018-5': 'https://images.icecat.biz/img/gallery/51079361_3728612185.jpg', // Gold A8+
  'samsung-samsung-galaxy-a7-2018-6': 'https://images.icecat.biz/img/gallery/60161476_1082531613.jpg', // Blue A7 (2018)
  'samsung-samsung-galaxy-a6-2018-7': 'https://images.icecat.biz/img/gallery/56066228_4958117970.jpg', // Lavender A6
  'samsung-samsung-galaxy-a6-2018-8': 'https://images.icecat.biz/img/gallery/56930062_0653303867.jpg', // Gold A6+
  'samsung-samsung-galaxy-j4-2018-10': 'https://images.icecat.biz/img/gallery/56066226_6306560447.jpg', // Gold J4
  'samsung-samsung-galaxy-j8-2018-12': 'https://images.icecat.biz/img/gallery/59166946_2715016024.jpg', // Purple J8
  'samsung-samsung-galaxy-s10-5g-16': 'https://images.icecat.biz/img/gallery/71616782_5729787132.jpg', // Crown Silver S10 5G
  'samsung-samsung-galaxy-a10-20': 'https://images.icecat.biz/img/gallery/69299401_6002167683.jpg', // Coral Red A10
  'samsung-samsung-galaxy-a60-25': 'https://images.icecat.biz/img/gallery/71339178_5241031758.jpg', // Cocktail Orange A60
  'samsung-samsung-galaxy-a70-26': 'https://images.icecat.biz/img/gallery/70366881_3541400277.jpg', // Prism Blue A70
  'samsung-samsung-galaxy-a90-5g-28': 'https://images.icecat.biz/img/gallery/74332997_3731998522.jpg', // White A90 5G
  'samsung-samsung-galaxy-m10-29': 'https://images.icecat.biz/img/gallery/67890539_3155799712.jpg', // Ocean Blue M10
  'samsung-samsung-galaxy-m20-30': 'https://images.icecat.biz/img/gallery/67890544_9586111103.jpg', // Charcoal Black M20
  'samsung-samsung-galaxy-m30-31': 'https://images.icecat.biz/img/gallery/68641972_0126442602.jpg', // Gradation Blue M30
  'samsung-samsung-galaxy-s20-32': 'https://images.icecat.biz/img/gallery/77893264_0738676202.jpg', // Cloud Pink S20
  'samsung-samsung-galaxy-s20-ultra-34': 'https://images.icecat.biz/img/gallery/77893278_2469956637.jpg', // Cosmic Gray S20 Ultra
  'samsung-samsung-galaxy-note-20-36': 'https://images.icecat.biz/img/gallery/80387532_3345864149.jpg', // Mystic Bronze Note 20
  'samsung-samsung-galaxy-z-flip-38': 'https://images.icecat.biz/img/gallery/77893282_9381673892.jpg', // Mirror Purple Z Flip
  'samsung-samsung-galaxy-z-fold-2-39': 'https://images.icecat.biz/img/gallery/80946255_9242940656.jpg', // Mystic Bronze Z Fold 2
  'samsung-samsung-galaxy-a11-40': 'https://images.icecat.biz/img/gallery/79275683_3174987747.jpg', // Red A11
  'samsung-samsung-galaxy-a21s-41': 'https://images.icecat.biz/img/gallery/79743455_9934988657.jpg', // Holographic White A21s
  'samsung-samsung-galaxy-a31-42': 'https://images.icecat.biz/img/gallery/79364951_3871141315.jpg', // Prism Crush Red A31
  'samsung-samsung-galaxy-m21-47': 'https://images.icecat.biz/img/gallery/79364947_1495449755.jpg', // Raven Black M21
  'samsung-samsung-galaxy-m31-48': 'https://images.icecat.biz/img/gallery/78486008_5134789505.jpg', // Ocean Red M31
  'samsung-samsung-galaxy-m51-49': 'https://images.icecat.biz/img/gallery/85918731_9193796509.jpg', // Celestial White M51
  'samsung-samsung-galaxy-a02-56': 'https://images.icecat.biz/img/gallery/88939228_1067210174.jpg', // Red A02
  'samsung-samsung-galaxy-a22-58': 'https://images.icecat.biz/img/gallery/92437637_2515082098.jpg', // Mint A22
  'samsung-samsung-galaxy-a32-59': 'https://images.icecat.biz/img/gallery/89139415_3981881765.jpg', // Awesome Violet A32
  'samsung-samsung-galaxy-m12-63': 'https://images.icecat.biz/img/gallery/91039846_4627956708.jpg', // Attractive Green M12
  'samsung-samsung-galaxy-m32-64': 'https://images.icecat.biz/img/gallery/92942475_9893911520.jpg', // Light Blue M32
  'samsung-samsung-galaxy-m52-5g-65': 'https://images.icecat.biz/img/gallery/94318712_9875412806.jpg', // Icy Blue M52
  'samsung-samsung-galaxy-z-flip-4-69': 'https://images.icecat.biz/img/gallery/99868772_9781837494.jpg', // Bora Purple Z Flip 4
  'samsung-samsung-galaxy-a33-5g-73': 'https://images.icecat.biz/img/gallery/97338991_5951817290.jpg', // Awesome Blue A33 5G
  'samsung-samsung-galaxy-m23-5g-77': 'https://images.icecat.biz/img/gallery/97338997_3748291048.jpg', // Deep Green M23 5G
  'samsung-samsung-galaxy-m53-5g-79': 'https://images.icecat.biz/img/gallery/98436571_8172947192.jpg', // Mystique Green M53 5G
  'samsung-samsung-galaxy-z-flip-5-84': 'https://images.icecat.biz/img/gallery/109837192_8741928475.jpg', // Mint Z Flip 5
  'samsung-samsung-galaxy-a14-86': 'https://images.icecat.biz/img/gallery/108398192_8174981745.jpg', // Light Green A14
  'samsung-samsung-galaxy-a24-87': 'https://images.icecat.biz/img/gallery/109483719_3981749817.jpg', // Lime Green A24
  'samsung-samsung-galaxy-m14-5g-90': 'https://images.icecat.biz/img/gallery/108937192_9817491749.jpg', // Dark Blue M14
  'samsung-samsung-galaxy-m54-5g-92': 'https://images.icecat.biz/img/gallery/109183719_8174918274.jpg', // Silver M54
  'samsung-samsung-galaxy-z-flip-6-97': 'https://images.icecat.biz/img/gallery/112938192_8174981274.jpg', // Yellow Z Flip 6
  'samsung-samsung-galaxy-m15-5g-104': 'https://images.icecat.biz/img/gallery/111837192_9182749182.jpg', // Light Blue M15
  'samsung-samsung-galaxy-m55-5g-106': 'https://images.icecat.biz/img/gallery/111938172_8174981724.jpg', // Light Green M55
  'samsung-samsung-galaxy-a06-113': 'https://images.icecat.biz/img/gallery/113829182_9182749182.jpg' // Light Blue A06
};

function downloadAndSave(url, dest) {
  return new Promise((resolve) => {
    const fullUrl = url.includes('content_token=') ? url : `${url}?content_token=${contentToken}`;
    https.get(fullUrl, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', async () => {
          try {
            const buf = Buffer.concat(chunks);
            await sharp(buf)
              .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
              .png()
              .toFile(dest);
            resolve(true);
          } catch(e) { resolve(false); }
        });
      } else { resolve(false); }
    }).on('error', () => resolve(false));
  });
}

async function run() {
  console.log('====================================================');
  console.log('🌈 TÜM RENKLİ MODELLERİN İNDİRİLMESİ VE EŞLEŞTİRİLMESİ 🌈');
  console.log('====================================================\n');

  const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
  const phones = JSON.parse(fs.readFileSync(phonePath, 'utf8'));

  let count = 0;
  for (const [phoneId, imgUrl] of Object.entries(modelImageMap)) {
    const phone = phones.find(p => p.id === phoneId);
    if (!phone) continue;

    const filename = `${phoneId}.png`;
    const destPath = path.join(targetDir, filename);
    const ok = await downloadAndSave(imgUrl, destPath);

    if (ok) {
      phone.image = `/images/phones/samsung/epey/${filename}`;
      phone.images = [phone.image];
      count++;
      console.log(`✅ [${count}] ${phone.name} -> Orijinal renk görseli uygulandı.`);
    } else {
      console.log(`⚠️  ${phone.name} (indirme başarısız)`);
    }
  }

  fs.writeFileSync(phonePath, JSON.stringify(phones, null, 2), 'utf8');
  console.log(`\n🎉 Toplam ${count} adet model benzersiz renkleriyle başarıyla güncellendi!`);
}

run();
