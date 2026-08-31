const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.join(__dirname, '../public/images/products/tvs'),
  path.join(__dirname, '../public/images/products/monitors'),
  path.join(__dirname, '../public/images/products/appliances'),
  path.join(__dirname, '../public/images/products/laptops'),
  path.join(__dirname, '../public/images/products/tablets'),
  path.join(__dirname, '../public/images/products/headphones'),
  path.join(__dirname, '../public/images/products/consoles')
];

async function optimizeDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
  console.log(`\n⚙️  Optimizasyon Başlatıldı: ${path.basename(dir)} (${files.length} dosya)...`);

  let initialTotal = 0;
  let finalTotal = 0;
  let count = 0;

  for (const f of files) {
    const filePath = path.join(dir, f);
    try {
      const stat = fs.statSync(filePath);
      initialTotal += stat.size;

      // Only resize/compress if file > 100KB
      if (stat.size > 100 * 1024) {
        const buffer = await sharp(filePath)
          .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true })
          .toBuffer();

        fs.writeFileSync(filePath, buffer);
        finalTotal += buffer.length;
      } else {
        finalTotal += stat.size;
      }
      count++;
    } catch (e) {
      // skip corrupted or invalid
    }

    if (count % 200 === 0 || count === files.length) {
      console.log(`⏳ ${path.basename(dir)}: ${count}/${files.length} işlendi.`);
    }
  }

  const savedMB = ((initialTotal - finalTotal) / (1024 * 1024)).toFixed(2);
  const finalMB = (finalTotal / (1024 * 1024)).toFixed(2);
  console.log(`✅ [${path.basename(dir)}] Tamamlandı: Boyut ${finalMB} MB'a düşürüldü (${savedMB} MB tasarruf sağlandı).`);
}

async function run() {
  console.log('====================================================');
  console.log('⚡ SHARP İLE ÜRÜN GÖRSELLERİ ULTRA-HIZLI WEB OPTİMİZASYONU ⚡');
  console.log('====================================================');

  for (const dir of targetDirs) {
    await optimizeDirectory(dir);
  }

  console.log('\n====================================================');
  console.log('🎉 TÜM ÜRÜN GÖRSELLERİ WEB STANDARTLARINA OPTİMİZE EDİLDİ!');
  console.log('====================================================');
}

run();
