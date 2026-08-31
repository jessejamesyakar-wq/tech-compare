const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '../public/images/phones/samsung/epey');

// Secondary batch with full GTIN/EAN or Global Part Numbers for remaining models
const secondBatch = {
  'samsung-samsung-galaxy-j8-2018-12': '8801643343360', // J8 Gold/Purple GTIN
  'samsung-samsung-galaxy-a10-20': '8801643854897', // A10 Red GTIN
  'samsung-samsung-galaxy-a60-25': 'SM-A6060',
  'samsung-samsung-galaxy-a70-26': '8801643869273', // A70 Blue GTIN
  'samsung-samsung-galaxy-a90-5g-28': '8806090151125', // A90 5G White
  'samsung-samsung-galaxy-m10-29': 'SM-M105FD',
  'samsung-samsung-galaxy-m20-30': 'SM-M205FN/DS',
  'samsung-samsung-galaxy-m30-31': 'SM-M305FD',
  'samsung-samsung-galaxy-s20-32': '8806090310232', // S20 Cloud Pink
  'samsung-samsung-galaxy-s20-ultra-34': '8806090312649', // S20 Ultra Cosmic Gray
  'samsung-samsung-galaxy-note-20-36': '8806090595301', // Note 20 Mystic Bronze
  'samsung-samsung-galaxy-z-flip-38': '8806090374159', // Z Flip Mirror Purple
  'samsung-samsung-galaxy-z-fold-2-39': '8806090680977', // Z Fold 2 Mystic Bronze
  'samsung-samsung-galaxy-a11-40': '8806090483868', // A11 Red
  'samsung-samsung-galaxy-a21s-41': '8806090509629', // A21s White
  'samsung-samsung-galaxy-a31-42': '8806090479137', // A31 Prism Crush Red
  'samsung-samsung-galaxy-a41-43': '8806090442384', // A41 Prism Crush Blue
  'samsung-samsung-galaxy-m11-46': '8806090558191', // M11 Metallic Blue
  'samsung-samsung-galaxy-m21-47': '8806090506307', // M21 Raven Black
  'samsung-samsung-galaxy-m31-48': '8806090457630', // M31 Ocean Red
  'samsung-samsung-galaxy-m51-49': '8806090696343', // M51 Celestial White
  'samsung-samsung-galaxy-a02-56': '8806092040182', // A02 Red
  'samsung-samsung-galaxy-a22-58': '8806092289659', // A22 Mint
  'samsung-samsung-galaxy-a32-59': '8806092128828', // A32 Awesome Violet
  'samsung-samsung-galaxy-m12-63': '8806092209794', // M12 Attractive Green
  'samsung-samsung-galaxy-m32-64': '8806092601932', // M32 Light Blue
  'samsung-samsung-galaxy-m52-5g-65': '8806092796980', // M52 5G Icy Blue
  'samsung-samsung-galaxy-z-flip-4-69': '8806094508499', // Z Flip 4 Bora Purple
  'samsung-samsung-galaxy-a33-5g-73': '8806094250275', // A33 5G Awesome Peach
  'samsung-samsung-galaxy-m23-5g-77': '8806094334357', // M23 5G Deep Green
  'samsung-samsung-galaxy-m53-5g-79': '8806094364401', // M53 5G Mystique Green
  'samsung-samsung-galaxy-z-flip-5-84': '8806095066929', // Z Flip 5 Mint
  'samsung-samsung-galaxy-a14-86': '8806094895094', // A14 Light Green
  'samsung-samsung-galaxy-a24-87': '8806094979145', // A24 Lime Green
  'samsung-samsung-galaxy-m14-5g-90': '8806094966602', // M14 5G Dark Blue
  'samsung-samsung-galaxy-m54-5g-92': '8806094982633', // M54 5G Silver
  'samsung-samsung-galaxy-z-flip-6-97': '8806095642871', // Z Flip 6 Yellow
  'samsung-samsung-galaxy-m15-5g-104': '8806095537559', // M15 5G Light Blue
  'samsung-samsung-galaxy-m55-5g-106': '8806095544496', // M55 5G Light Green
  'samsung-samsung-galaxy-a06-113': '8806095811772' // A06 Light Blue
};

function queryIcecatGtin(gtinOrMpn) {
  let url = '';
  if (/^\d{12,14}$/.test(gtinOrMpn)) {
    url = `https://live.icecat.biz/api/?UserName=MehmetYakar&Language=tr&GTIN=${gtinOrMpn}`;
  } else {
    url = `https://live.icecat.biz/api/?UserName=MehmetYakar&Language=tr&Brand=Samsung&ProductCode=${encodeURIComponent(gtinOrMpn)}`;
  }

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          let highPic = json.data?.Image?.HighPic || json.data?.Gallery?.[0]?.Pic;
          if (highPic) {
            return resolve({
              title: json.data?.GeneralInfo?.Title || gtinOrMpn,
              highPic: highPic.includes('content_token=') ? highPic : `${highPic}?content_token=81a97782-9a81-4879-a49d-b4590ea070a9`
            });
          }
          resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadAndSave(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
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
  console.log('🌈 SAMSUNG 2. ETAP ORİJİNAL RENKLİ GÖRSEL ENTEGRASYONU 🌈');
  console.log('====================================================\n');

  const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
  const phones = JSON.parse(fs.readFileSync(phonePath, 'utf8'));

  let count = 0;
  for (const [phoneId, gtin] of Object.entries(secondBatch)) {
    const phone = phones.find(p => p.id === phoneId);
    if (!phone) continue;

    const res = await queryIcecatGtin(gtin);
    if (res && res.highPic) {
      const filename = `${phoneId}.png`;
      const destPath = path.join(targetDir, filename);
      const ok = await downloadAndSave(res.highPic, destPath);
      if (ok) {
        phone.image = `/images/phones/samsung/epey/${filename}`;
        phone.images = [phone.image];
        count++;
        console.log(`✅ [${count}] ${phone.name} -> Renk: ${res.title.slice(0, 50)}`);
      }
    } else {
      console.log(`❌ ${phone.name} (${gtin}) bulunamadı`);
    }
  }

  fs.writeFileSync(phonePath, JSON.stringify(phones, null, 2), 'utf8');
  console.log(`\n🎉 2. Etapta ${count} adet model daha orijinal renkleriyle bağlandı!`);
}

run();
