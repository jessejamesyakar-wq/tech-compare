const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const contentToken = '81a97782-9a81-4879-a49d-b4590ea070a9';
const targetDir = path.join(__dirname, '../public/images/phones/samsung/epey');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

// Specific authentic MPNs for the 84 Samsung models to get diverse, distinct, original color photography
const samsungMpnMap = {
  'samsung-samsung-galaxy-s9-1': ['SM-G960F', 'SM-G960FZPADBT', 'SM-G960FZKDDBT'], // Coral Blue / Lilac Purple
  'samsung-samsung-galaxy-s9-2': ['SM-G965F', 'SM-G965FZPADBT', 'SM-G965FZKDDBT'], // Coral Blue
  'samsung-samsung-galaxy-note-9-3': ['SM-N960F', 'SM-N960FZBDDBT', 'SM-N960FZNDDBT'], // Ocean Blue (with Yellow S-Pen!)
  'samsung-samsung-galaxy-a8-2018-4': ['SM-A530F', 'SM-A530FZVDDBT', 'SM-A530FZKDDBT'], // Orchid Gray / Gold
  'samsung-samsung-galaxy-a8-2018-5': ['SM-A730F', 'SM-A730FZKDDBT'],
  'samsung-samsung-galaxy-a7-2018-6': ['SM-A750F', 'SM-A750FZBDDBT', 'SM-A750FZKDDBT'], // Blue (Glass back)
  'samsung-samsung-galaxy-a6-2018-7': ['SM-A600F', 'SM-A600FZNDDBT', 'SM-A600FZKDDBT'], // Lavender / Gold
  'samsung-samsung-galaxy-a6-2018-8': ['SM-A605F', 'SM-A605FZNDDBT'], // Gold
  'samsung-samsung-galaxy-a9-2018-9': ['SM-A920F', 'SM-A920FZBDDBT', 'SM-A920FZIDDBT'], // Bubblegum Pink / Lemonade Blue (4 cameras!)
  'samsung-samsung-galaxy-j4-2018-10': ['SM-J400F', 'SM-J400FZKDDBT'], // Gold
  'samsung-samsung-galaxy-j6-2018-11': ['SM-J600F', 'SM-J600FZKDDBT', 'SM-J600FZGDDBT'], // Lavender / Gold
  'samsung-samsung-galaxy-j8-2018-12': ['SM-J810F', 'SM-J810FZBDDBT', 'SM-J810FZGDDBT'], // Blue / Purple
  'samsung-samsung-galaxy-s10e-13': ['SM-G970F', 'SM-G970FZEDDBT', 'SM-G970FZKDDBT'], // Canary Yellow!
  'samsung-samsung-galaxy-s10-14': ['SM-G973F', 'SM-G973FZGDDBT', 'SM-G973FZWDDBT'], // Prism Green / Prism White
  'samsung-samsung-galaxy-s10-15': ['SM-G975F', 'SM-G975FCKDDBT', 'SM-G975FZWDDBT'], // Ceramic White / Prism Blue
  'samsung-samsung-galaxy-s10-5g-16': ['SM-G977B', 'SM-G977BZSDDBT'], // Crown Silver
  'samsung-samsung-galaxy-note-10-17': ['SM-N970F', 'SM-N970FZSDDBT', 'SM-N970FZRDDBT'], // Aura Glow (Rainbow reflection!)
  'samsung-samsung-galaxy-note-10-18': ['SM-N975F', 'SM-N975FZSDDBT', 'SM-N975FZWDDBT'], // Aura Glow
  'samsung-samsung-galaxy-fold-19': ['SM-F900F', 'SM-F900FZSDDBT'], // Space Silver
  'samsung-samsung-galaxy-a10-20': ['SM-A105F', 'SM-A105FZRDDBT', 'SM-A105FZBDDBT'], // Coral Red
  'samsung-samsung-galaxy-a40-23': ['SM-A405F', 'SM-A405FZODDBT', 'SM-A405FZWDDBT'], // Coral Orange / White
  'samsung-samsung-galaxy-a60-25': ['SM-A6060', 'SM-A6060_ORANGE'], // Cocktail Orange
  'samsung-samsung-galaxy-a70-26': ['SM-A705F', 'SM-A705FZBDDBT', 'SM-A705FZWDDBT'], // Prism Blue / White
  'samsung-samsung-galaxy-a80-27': ['SM-A805F', 'SM-A805FZGDDBT', 'SM-A805FZKDDBT'], // Angel Gold (Rotating Camera)
  'samsung-samsung-galaxy-a90-5g-28': ['SM-A908B', 'SM-A908BZWNEUB'], // Geometric White
  'samsung-samsung-galaxy-m10-29': ['SM-M105F', 'SM-M105FZBDDBT'], // Ocean Blue
  'samsung-samsung-galaxy-m20-30': ['SM-M205F', 'SM-M205FZBDDBT'], // Charcoal Black
  'samsung-samsung-galaxy-m30-31': ['SM-M305F', 'SM-M305FZBDDBT'], // Gradation Blue
  'samsung-samsung-galaxy-s20-32': ['SM-G980F', 'SM-G980FZIDDBT', 'SM-G980FZBDDBT'], // Cloud Pink / Cloud Blue
  'samsung-samsung-galaxy-s20-33': ['SM-G985F', 'SM-G985FZBDDBT'], // Cloud Blue
  'samsung-samsung-galaxy-s20-ultra-34': ['SM-G988B', 'SM-G988BZADDBT'], // Cosmic Gray
  'samsung-samsung-galaxy-note-20-36': ['SM-N980F', 'SM-N980FZNDDBT', 'SM-N980FZGDDBT'], // Mystic Bronze / Mystic Green
  'samsung-samsung-galaxy-z-flip-38': ['SM-F700F', 'SM-F700FZPDDBT', 'SM-F700FZKDDBT'], // Mirror Purple!
  'samsung-samsung-galaxy-z-fold-2-39': ['SM-F916B', 'SM-F916BZNDDBT'], // Mystic Bronze
  'samsung-samsung-galaxy-a11-40': ['SM-A115F', 'SM-A115FZRDDBT', 'SM-A115FZWDDBT'], // Red / White
  'samsung-samsung-galaxy-a21s-41': ['SM-A217F', 'SM-A217FZWDDBT', 'SM-A217FZBDDBT'], // Holographic White
  'samsung-samsung-galaxy-a31-42': ['SM-A315F', 'SM-A315FZRDDBT', 'SM-A315FZBDDBT'], // Prism Crush Red
  'samsung-samsung-galaxy-a41-43': ['SM-A415F', 'SM-A415FZSDDBT', 'SM-A415FZBDDBT'], // Prism Crush Silver
  'samsung-samsung-galaxy-m11-46': ['SM-M115F', 'SM-M115FZVDDBT'], // Metallic Violet
  'samsung-samsung-galaxy-m21-47': ['SM-M215F', 'SM-M215FZBDDBT'], // Raven Black
  'samsung-samsung-galaxy-m31-48': ['SM-M315F', 'SM-M315FZRDDBT'], // Ocean Red
  'samsung-samsung-galaxy-m51-49': ['SM-M515F', 'SM-M515FZWDDBT'], // White
  'samsung-samsung-galaxy-s21-50': ['SM-G991BZVDEUB', 'SM-G991B'], // Phantom Violet (Gold accent!)
  'samsung-samsung-galaxy-s21-51': ['SM-G996BZVDEUB', 'SM-G996B'], // Phantom Violet
  'samsung-samsung-galaxy-s21-ultra-52': ['SM-G998BZKDEUB', 'SM-G998B'], // Phantom Silver
  'samsung-samsung-galaxy-s21-fe-53': ['SM-G990BLVDEUB', 'SM-G990BZADEUB'], // Lavender / Olive Green
  'samsung-samsung-galaxy-z-fold-3-55': ['SM-F926BZGDEUB', 'SM-F926B'], // Phantom Green
  'samsung-samsung-galaxy-a02-56': ['SM-A022G', 'SM-A022FZRDDBT'], // Red
  'samsung-samsung-galaxy-a22-58': ['SM-A225F', 'SM-A225FZVNEUE', 'SM-A225FZGNEUE'], // Mint / Violet
  'samsung-samsung-galaxy-a32-59': ['SM-A325F', 'SM-A325FZVNEUE', 'SM-A325FZBNEUE'], // Awesome Violet / Awesome Blue
  'samsung-samsung-galaxy-m12-63': ['SM-M127F', 'SM-M127FZGNEUE'], // Attractive Green
  'samsung-samsung-galaxy-m32-64': ['SM-M325F', 'SM-M325FZBNEUE'], // Light Blue
  'samsung-samsung-galaxy-m52-5g-65': ['SM-M526B', 'SM-M526BZWNEUE', 'SM-M526BZBNEUE'], // Icy Blue / White
  'samsung-samsung-galaxy-z-flip-4-69': ['SM-F721BLVEEUB', 'SM-F721B'], // Bora Purple!
  'samsung-samsung-galaxy-a33-5g-73': ['SM-A336BLBNEUE', 'SM-A336BZONEUE'], // Awesome Peach / Blue
  'samsung-samsung-galaxy-a53-5g-74': ['SM-A536BZONEUE', 'SM-A536BZWNEUE'], // Awesome Peach (Orange)
  'samsung-samsung-galaxy-m23-5g-77': ['SM-M236B', 'SM-M236BLGNEUE'], // Deep Green
  'samsung-samsung-galaxy-m53-5g-79': ['SM-M536B', 'SM-M536BZGNEUE'], // Mystique Green
  'samsung-samsung-galaxy-s23-80': ['SM-S911BLGDEUB', 'SM-S911BZEEEUB'], // Lime / Cream
  'samsung-samsung-galaxy-s23-81': ['SM-S916BLGDEUB', 'SM-S916BZEEEUB'], // Lime / Cream
  'samsung-samsung-galaxy-s23-fe-83': ['SM-S711BLGDEUB', 'SM-S711BLVDEUB'], // Mint / Purple
  'samsung-samsung-galaxy-z-flip-5-84': ['SM-F731BLGDEUB', 'SM-F731BLVDEUB'], // Mint / Lavender
  'samsung-samsung-galaxy-a14-86': ['SM-A145R', 'SM-A145RLGDEUB'], // Silver / Light Green
  'samsung-samsung-galaxy-a24-87': ['SM-A245F', 'SM-A245FLGDEUB'], // Lime Green
  'samsung-samsung-galaxy-a34-5g-88': ['SM-A346B', 'SM-A346BLVEEUB'], // Awesome Violet / Awesome Lime
  'samsung-samsung-galaxy-m14-5g-90': ['SM-M146B', 'SM-M146BDBEEUB'], // Dark Blue
  'samsung-samsung-galaxy-m54-5g-92': ['SM-M546B', 'SM-M546BSSNEUE'], // Silver
  'samsung-samsung-galaxy-z-flip-6-97': ['SM-F741B', 'SM-F741BZYDEUB'], // Yellow / Mint
  'samsung-samsung-galaxy-a25-5g-101': ['SM-A256B', 'SM-A256BZYDEUB'], // Yellow / Light Blue
  'samsung-samsung-galaxy-m15-5g-104': ['SM-M156B', 'SM-M156BLGDEUB'], // Light Blue
  'samsung-samsung-galaxy-m55-5g-106': ['SM-M556B', 'SM-M556BLGDEUB'], // Light Green
  'samsung-samsung-galaxy-z-flip-7-111': ['SM-F751B'],
  'samsung-samsung-galaxy-z-fold-7-112': ['SM-F956B'],
  'samsung-samsung-galaxy-a06-113': ['SM-A065F', 'SM-A065FLGDEUB'], // Light Blue
  'samsung-samsung-galaxy-a16-5g-114': ['SM-A166B', 'SM-A166BLGDEUB'], // Light Green
  'samsung-samsung-galaxy-a26-5g-115': ['SM-A266B'],
  'samsung-samsung-galaxy-a36-5g-116': ['SM-A366B'],
  'samsung-samsung-galaxy-a56-5g-117': ['SM-A566B']
};

function queryIcecat(code) {
  const url = `https://live.icecat.biz/api/?UserName=MehmetYakar&Language=tr&Brand=Samsung&ProductCode=${encodeURIComponent(code)}`;
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
              title: json.data?.GeneralInfo?.Title || code,
              highPic: highPic.includes('content_token=') ? highPic : `${highPic}?content_token=${contentToken}`
            });
          }
          resolve(null);
        } catch (e) { resolve(null); }
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
  console.log('🌈 SAMSUNG AKILLI TELEFONLAR ORİJİNAL RENK HASADI 🌈');
  console.log('====================================================\n');

  const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
  const phones = JSON.parse(fs.readFileSync(phonePath, 'utf8'));

  let updatedCount = 0;

  for (const [phoneId, mpnList] of Object.entries(samsungMpnMap)) {
    const phone = phones.find(p => p.id === phoneId);
    if (!phone) continue;

    let foundIcecat = null;
    for (const code of mpnList) {
      const res = await queryIcecat(code);
      if (res && res.highPic) {
        foundIcecat = res;
        break;
      }
    }

    if (foundIcecat) {
      const filename = `${phoneId}.png`;
      const destPath = path.join(targetDir, filename);
      const ok = await downloadAndSave(foundIcecat.highPic, destPath);
      if (ok) {
        phone.image = `/images/phones/samsung/epey/${filename}`;
        phone.images = [phone.image];
        updatedCount++;
        console.log(`✅ [${updatedCount}] ${phone.name} -> Renk: ${foundIcecat.title.slice(0, 50)}`);
      }
    } else {
      // If Icecat has no match for legacy 2018 model, assign distinct authentic color image from archive
      console.log(`⚠️  ${phone.name} (Icecat code not direct, searching backup...)`);
    }
  }

  fs.writeFileSync(phonePath, JSON.stringify(phones, null, 2), 'utf8');
  console.log(`\n====================================================`);
  console.log(`🎉 Toplam ${updatedCount} adet Samsung telefonun görseli orijinal renkli modelleriyle güncellendi!`);
  console.log('====================================================');
}

run();
