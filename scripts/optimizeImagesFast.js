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

async function optimizeFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size <= 80 * 1024) return; // already lean

    const tempPath = `${filePath}.tmp.jpg`;
    await sharp(filePath)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(tempPath);

    if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 1000) {
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
    }
  } catch (e) {
    if (fs.existsSync(`${filePath}.tmp.jpg`)) {
      try { fs.unlinkSync(`${filePath}.tmp.jpg`); } catch(err) {}
    }
  }
}

async function runFast(concurrency = 25) {
  console.log('====================================================');
  console.log('⚡ SHARP PARALEL WEB OPTİMİZASYONU (25 WORKER)      ⚡');
  console.log('====================================================\n');

  const allFiles = [];
  targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'))
        .map(f => path.join(dir, f));
      allFiles.push(...files);
    }
  });

  console.log(`📦 Toplam ${allFiles.length} görsel dosyası optimize edilecek...`);

  let index = 0;
  let processed = 0;

  async function worker() {
    while (index < allFiles.length) {
      const i = index++;
      await optimizeFile(allFiles[i]);
      processed++;
      if (processed % 250 === 0 || processed === allFiles.length) {
        console.log(`⏳ İlerleme: ${processed}/${allFiles.length} görsel işlendi (%${((processed / allFiles.length) * 100).toFixed(1)})...`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log('\n====================================================');
  console.log('✅ TÜM GÖRSELLER BAŞARIYLA KÜÇÜLTÜLDÜ VE OPTİMİZE EDİLDİ!');
  console.log('====================================================');
}

runFast(25);
