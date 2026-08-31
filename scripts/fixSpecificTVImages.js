const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const contentToken = '81a97782-9a81-4879-a49d-b4590ea070a9';
const tvDir = path.join(__dirname, '../public/images/products/tvs');

function downloadAndOptimize(url, destFilename) {
  return new Promise((resolve) => {
    const fullUrl = url.includes('content_token=') ? url : `${url}${url.includes('?') ? '&' : '?'}content_token=${contentToken}`;
    const destPath = path.join(tvDir, destFilename);
    const tempPath = `${destPath}.tmp.jpg`;

    https.get(fullUrl, (res) => {
      if (res.statusCode === 200) {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', async () => {
          try {
            const buf = Buffer.concat(chunks);
            await sharp(buf)
              .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 82, progressive: true })
              .toFile(tempPath);

            if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 1000) {
              if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
              fs.renameSync(tempPath, destPath);
              console.log(`✅ İndirildi ve Optimize Edildi: ${destFilename}`);
              resolve(true);
            } else {
              resolve(false);
            }
          } catch(e) {
            console.error(`❌ Hata (${destFilename}):`, e.message);
            resolve(false);
          }
        });
      } else {
        console.error(`❌ HTTP ${res.statusCode} (${destFilename})`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(`❌ Bağlantı Hatası (${destFilename}):`, err.message);
      resolve(false);
    });
  });
}

async function fixSpecificTVs() {
  console.log('====================================================');
  console.log('🎯 BELİRTİLEN 8 TV MODELİNİN GÖRSELLERİNİN DÜZELTİLMESİ 🎯');
  console.log('====================================================\n');

  // 1. TCL Q7D Pro Series (55", 65", 75")
  const tclMain = 'https://images.icecat.biz/img/gallery/d4049e044ea8997fdb6fbe5437176ba3ba155d2d.jpg';
  const tclGal1 = 'https://images.icecat.biz/img/gallery/40ed40569a8f89e06edd26f884adca0a7d02e660.jpg';
  const tclGal2 = 'https://images.icecat.biz/img/gallery/1e3876ea98366e4569eaab1b42e2aeccc4b8c411.jpg';

  await downloadAndOptimize(tclMain, 'icecat-tcl-55-55q7dpro-55-inc.jpg');
  await downloadAndOptimize(tclGal1, 'icecat-tcl-55-55q7dpro-55-inc-1.jpg');
  await downloadAndOptimize(tclGal2, 'icecat-tcl-55-55q7dpro-55-inc-2.jpg');

  await downloadAndOptimize(tclMain, 'icecat-tcl-65-65q7dpro-65-inc.jpg');
  await downloadAndOptimize(tclGal1, 'icecat-tcl-65-65q7dpro-65-inc-1.jpg');
  await downloadAndOptimize(tclGal2, 'icecat-tcl-65-65q7dpro-65-inc-2.jpg');

  await downloadAndOptimize(tclMain, 'icecat-tcl-75-75q7dpro-75-inc.jpg');
  await downloadAndOptimize(tclGal1, 'icecat-tcl-75-75q7dpro-75-inc-1.jpg');
  await downloadAndOptimize(tclGal2, 'icecat-tcl-75-75q7dpro-75-inc-2.jpg');

  // 2. Philips 65MLED950 (Mini LED Ambilight TV)
  const philips65MiniLED = 'https://images.icecat.biz/img/gallery/50697ee85b16ad40fc2e909aa3ea0eac78147c5e.jpg';
  const philips65Gal1 = 'https://images.icecat.biz/img/gallery/f241a3471f22ef160648782b39422e01.jpg';
  await downloadAndOptimize(philips65MiniLED, 'icecat-philips-65mled950.jpg');
  await downloadAndOptimize(philips65Gal1, 'icecat-philips-65mled950-1.jpg');

  // 3. Philips 85MLED910 (Front TV view instead of box)
  const philips85Front = 'https://images.icecat.biz/img/gallery/4506cc311fbd67e825d5ad678076339521cf04af.jpg';
  const philips85Gal1 = 'https://images.icecat.biz/img/gallery/8ec3228d9d7371e569f6be9078af83da409a88b5.jpg';
  await downloadAndOptimize(philips85Front, 'icecat-philips-85mled910.jpg');
  await downloadAndOptimize(philips85Gal1, 'icecat-philips-85mled910-1.jpg');

  // 4. LG NU900B6LA (55", 65", 75" NANO UHD AI Series)
  const lgNanoFront = 'https://images.icecat.biz/img/gallery/727c0d8cea59dc2c9156e4abaf8b9dff7c0db566.jpg'; // LG AI UHD/NANO front
  await downloadAndOptimize(lgNanoFront, 'icecat-lg-55-55nu900b6la-55-inc.jpg');
  await downloadAndOptimize(lgNanoFront, 'icecat-lg-65-65nu900b6la-65-inc.jpg');
  await downloadAndOptimize(lgNanoFront, 'icecat-lg-75-75nu900b6la-75-inc.jpg');

  // Update mockTVs.ts for ONLY these 8 models
  const tvPath = path.join(__dirname, '../src/lib/mockTVs.ts');
  const tvContent = fs.readFileSync(tvPath, 'utf8');
  const eqIdx = tvContent.indexOf('=');
  const startIdx = tvContent.indexOf('[', eqIdx);
  const endIdx = tvContent.lastIndexOf(']');
  const tvs = JSON.parse(tvContent.substring(startIdx, endIdx + 1));

  let updatedCount = 0;
  tvs.forEach(tv => {
    const slug = tv.slug || '';
    if (slug === 'tcl-55-55q7dpro-55-inc') {
      tv.image = '/images/products/tvs/icecat-tcl-55-55q7dpro-55-inc.jpg';
      tv.images = [
        '/images/products/tvs/icecat-tcl-55-55q7dpro-55-inc.jpg',
        '/images/products/tvs/icecat-tcl-55-55q7dpro-55-inc-1.jpg',
        '/images/products/tvs/icecat-tcl-55-55q7dpro-55-inc-2.jpg'
      ];
      updatedCount++;
    } else if (slug === 'tcl-65-65q7dpro-65-inc') {
      tv.image = '/images/products/tvs/icecat-tcl-65-65q7dpro-65-inc.jpg';
      tv.images = [
        '/images/products/tvs/icecat-tcl-65-65q7dpro-65-inc.jpg',
        '/images/products/tvs/icecat-tcl-65-65q7dpro-65-inc-1.jpg',
        '/images/products/tvs/icecat-tcl-65-65q7dpro-65-inc-2.jpg'
      ];
      updatedCount++;
    } else if (slug === 'tcl-75-75q7dpro-75-inc') {
      tv.image = '/images/products/tvs/icecat-tcl-75-75q7dpro-75-inc.jpg';
      tv.images = [
        '/images/products/tvs/icecat-tcl-75-75q7dpro-75-inc.jpg',
        '/images/products/tvs/icecat-tcl-75-75q7dpro-75-inc-1.jpg',
        '/images/products/tvs/icecat-tcl-75-75q7dpro-75-inc-2.jpg'
      ];
      updatedCount++;
    } else if (slug === 'philips-65mled950') {
      tv.image = '/images/products/tvs/icecat-philips-65mled950.jpg';
      tv.images = [
        '/images/products/tvs/icecat-philips-65mled950.jpg',
        '/images/products/tvs/icecat-philips-65mled950-1.jpg'
      ];
      updatedCount++;
    } else if (slug === 'philips-85mled910') {
      tv.image = '/images/products/tvs/icecat-philips-85mled910.jpg';
      tv.images = [
        '/images/products/tvs/icecat-philips-85mled910.jpg',
        '/images/products/tvs/icecat-philips-85mled910-1.jpg'
      ];
      updatedCount++;
    } else if (slug === 'lg-55-55nu900b6la-55-inc') {
      tv.image = '/images/products/tvs/icecat-lg-55-55nu900b6la-55-inc.jpg';
      tv.images = ['/images/products/tvs/icecat-lg-55-55nu900b6la-55-inc.jpg'];
      updatedCount++;
    } else if (slug === 'lg-65-65nu900b6la-65-inc') {
      tv.image = '/images/products/tvs/icecat-lg-65-65nu900b6la-65-inc.jpg';
      tv.images = ['/images/products/tvs/icecat-lg-65-65nu900b6la-65-inc.jpg'];
      updatedCount++;
    } else if (slug === 'lg-75-75nu900b6la-75-inc') {
      tv.image = '/images/products/tvs/icecat-lg-75-75nu900b6la-75-inc.jpg';
      tv.images = ['/images/products/tvs/icecat-lg-75-75nu900b6la-75-inc.jpg'];
      updatedCount++;
    }
  });

  const updatedTvContent = `import { Product } from './types';\n\nexport const mockTVs: Product[] = ${JSON.stringify(tvs, null, 2)};\n`;
  fs.writeFileSync(tvPath, updatedTvContent, 'utf8');

  console.log(`\n====================================================`);
  console.log(`🎉 ${updatedCount} adet TV kaydı başarıyla güncellendi!`);
  console.log(`Diğer 930 TV'nin hiçbir verisine dokunulmadı.`);
  console.log(`====================================================`);
}

fixSpecificTVs();
