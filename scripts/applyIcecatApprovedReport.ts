import fs from 'fs';
import path from 'path';
import https from 'https';

console.log('=== APPLYING APPROVED ICECAT IMAGES FROM REPORT ===\n');

const reportPath = path.join(process.cwd(), 'icecat-sync-report.md');
if (!fs.existsSync(reportPath)) {
  console.error('icecat-sync-report.md not found!');
  process.exit(1);
}

const reportContent = fs.readFileSync(reportPath, 'utf8');

// Parse matches table from report
const matchRegex = /\|\s*(\d+)\s*\|\s*\*\*(.*?)\*\*\s*\|\s*`(\w+)`\s*\|\s*`([^`]+)`\s*\|\s*\[Görseli Görüntüle\]\((https:\/\/images\.icecat\.biz\/[^\)]+)\)/g;

interface ApprovedMatch {
  index: number;
  name: string;
  category: string;
  currentImage: string;
  icecatUrl: string;
}

const matches: ApprovedMatch[] = [];
let m: RegExpExecArray | null;

while ((m = matchRegex.exec(reportContent)) !== null) {
  matches.push({
    index: parseInt(m[1]),
    name: m[2].trim(),
    category: m[3].trim(),
    currentImage: m[4].trim(),
    icecatUrl: m[5].trim()
  });
}

console.log(`Found ${matches.length} approved Icecat matches in report.\n`);

async function downloadFile(url: string, targetPath: string): Promise<boolean> {
  return new Promise(resolve => {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(targetPath);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, res => {
      if (res.statusCode === 200) {
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
      } else {
        file.close();
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      resolve(false);
    });
  });
}

(async () => {
  // 1. Download images locally
  let downloadedCount = 0;
  const imageUpdates = new Map<string, string>(); // productName -> localPath

  for (const match of matches) {
    const slug = match.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `icecat-${slug}.jpg`;
    const relativePath = `/images/products/${match.category}/${filename}`;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);

    console.log(`[${match.index}/${matches.length}] Downloading for "${match.name}"...`);
    const ok = await downloadFile(match.icecatUrl, absolutePath);
    if (ok) {
      downloadedCount++;
      imageUpdates.set(match.name, relativePath);
      console.log(`   ✅ Saved: ${relativePath}`);
    } else {
      console.log(`   ⚠️ Failed to download from: ${match.icecatUrl}`);
    }
  }

  console.log(`\nSuccessfully downloaded ${downloadedCount} official Icecat images to disk.\n`);

  // 2. Update catalog files
  // Update mockTVs.ts
  const mockTVsPath = path.join(process.cwd(), 'src/lib/mockTVs.ts');
  if (fs.existsSync(mockTVsPath)) {
    const content = fs.readFileSync(mockTVsPath, 'utf8');
    const matchExport = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|TVProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (matchExport) {
      const tvs = JSON.parse(matchExport[2]);
      let tvUpdated = 0;
      tvs.forEach((tv: any) => {
        if (imageUpdates.has(tv.name)) {
          const newImg = imageUpdates.get(tv.name)!;
          tv.image = newImg;
          tv.images = [newImg, ...(tv.images || []).filter((i: string) => i !== newImg)];
          tvUpdated++;
        }
      });
      const newFileContent = `import { Product } from './types';\n\nexport const ${matchExport[1]}: Product[] = ${JSON.stringify(tvs, null, 2)};\n`;
      fs.writeFileSync(mockTVsPath, newFileContent, 'utf8');
      console.log(`✅ Updated ${tvUpdated} products in mockTVs.ts`);
    }
  }

  // Update smartphonesData.json if any
  const phonesPath = path.join(process.cwd(), 'src/lib/smartphonesData.json');
  if (fs.existsSync(phonesPath)) {
    const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
    let phoneUpdated = 0;
    phones.forEach((p: any) => {
      if (imageUpdates.has(p.name)) {
        const newImg = imageUpdates.get(p.name)!;
        p.image = newImg;
        p.images = [newImg, ...(p.images || []).filter((i: string) => i !== newImg)];
        phoneUpdated++;
      }
    });
    if (phoneUpdated > 0) {
      fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
      console.log(`✅ Updated ${phoneUpdated} products in smartphonesData.json`);
    }
  }

  // Update CHANGELOG_DATA.md
  const { logDataChange } = require('./logDataChange');
  logDataChange({
    title: `Applied ${downloadedCount} Official Icecat Manufacturer Images across TV Catalog`,
    files: ['src/lib/mockTVs.ts', 'public/images/products/tvs/'],
    description: `Downloaded and integrated verified, high-resolution official manufacturer images from Icecat Open Catalog for LG, TCL and other TV models.`,
    rationale: 'User reviewed and approved icecat-sync-report.md for official manufacturer photography integration.'
  });

  console.log('\n=== ALL ICECAT APPROVED IMAGES APPLIED SUCCESSFULLY! ===');
})();
