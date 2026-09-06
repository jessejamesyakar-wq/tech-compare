import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface ProcessStats {
  total: number;
  processed: number;
  trimmed: number;
  skipped: number;
  errors: number;
}

const datasets = [
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
];

async function collectCatalogImages(): Promise<string[]> {
  const images = new Set<string>();

  for (const d of datasets) {
    const filePath = path.join(process.cwd(), 'src/lib', d.file);
    if (!fs.existsSync(filePath)) continue;

    let products: any[] = [];
    if (d.type === 'json') {
      products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
      if (match) {
        products = JSON.parse(match[2]);
      }
    }

    for (const p of products) {
      if (p.image) images.add(p.image);
      if (Array.isArray(p.images)) {
        p.images.forEach((i: string) => images.add(i));
      }
      if (Array.isArray(p.colors)) {
        p.colors.forEach((c: any) => {
          if (c.image) images.add(c.image);
          if (Array.isArray(c.images)) c.images.forEach((i: string) => images.add(i));
        });
      }
    }
  }

  return Array.from(images);
}

async function trimAndRePadFile(
  fullPath: string,
  paddingPercent: number = 0.06,
  threshold: number = 10
): Promise<{ success: boolean; trimmed: boolean; error?: string }> {
  try {
    const inputBuf = await fs.promises.readFile(fullPath);
    const meta = await sharp(inputBuf).metadata();
    if (!meta.width || !meta.height) {
      return { success: false, trimmed: false, error: 'invalid dimensions' };
    }

    // 1. Trim redundant background border
    let trimmedBuf: Buffer;
    try {
      trimmedBuf = await sharp(inputBuf).trim({ threshold }).toBuffer();
    } catch {
      trimmedBuf = await sharp(inputBuf).trim().toBuffer();
    }

    const metaTrimmed = await sharp(trimmedBuf).metadata();
    if (!metaTrimmed.width || !metaTrimmed.height) {
      return { success: false, trimmed: false, error: 'trim produced zero size' };
    }

    const didTrim = metaTrimmed.width < meta.width || metaTrimmed.height < meta.height;

    // 2. Add uniform 6% proportional padding
    const maxDim = Math.max(metaTrimmed.width, metaTrimmed.height);
    const pad = Math.max(8, Math.round(maxDim * paddingPercent));

    const bg = meta.hasAlpha
      ? { r: 0, g: 0, b: 0, alpha: 0 }
      : { r: 255, g: 255, b: 255, alpha: 1 };

    let pipeline = sharp(trimmedBuf).extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: bg,
    });

    if (meta.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 92 });
    } else if (meta.format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 8 });
    } else if (meta.format === 'webp') {
      pipeline = pipeline.webp({ quality: 92 });
    }

    const outputBuf = await pipeline.toBuffer();
    await fs.promises.writeFile(fullPath, outputBuf);

    return { success: true, trimmed: didTrim };
  } catch (err: any) {
    return { success: false, trimmed: false, error: err.message };
  }
}

async function run() {
  console.log('====================================================');
  console.log('✂️   BATCH PRODUCT IMAGE TRIM & PAD PIPELINE  ✂️');
  console.log('====================================================\n');

  const catalogImages = await collectCatalogImages();
  console.log(`[INFO] Found ${catalogImages.length} unique catalog image references.`);

  const existingFiles = catalogImages
    .filter(rel => typeof rel === 'string' && rel.startsWith('/'))
    .map(rel => ({
      rel,
      abs: path.join(process.cwd(), 'public', rel)
    }))
    .filter(item => fs.existsSync(item.abs));

  console.log(`[INFO] Found ${existingFiles.length} local images on disk to process.\n`);

  const stats: ProcessStats = {
    total: existingFiles.length,
    processed: 0,
    trimmed: 0,
    skipped: 0,
    errors: 0
  };

  const CONCURRENCY = 16;
  const queue = [...existingFiles];

  async function worker(workerId: number) {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const res = await trimAndRePadFile(item.abs, 0.06, 10);
      stats.processed++;

      if (res.success) {
        if (res.trimmed) {
          stats.trimmed++;
        } else {
          stats.skipped++;
        }
      } else {
        stats.errors++;
      }

      if (stats.processed % 500 === 0 || stats.processed === stats.total) {
        const pct = ((stats.processed / stats.total) * 100).toFixed(1);
        console.log(`[PROGRESS] ${stats.processed}/${stats.total} (${pct}%) | Trimmed: ${stats.trimmed} | Untrimmed: ${stats.skipped} | Errors: ${stats.errors}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
  await Promise.all(workers);

  console.log('\n====================================================');
  console.log('✅  IMAGE TRIMMING PIPELINE COMPLETED');
  console.log(`   - Total Processed : ${stats.processed}`);
  console.log(`   - Margins Trimmed : ${stats.trimmed}`);
  console.log(`   - Already Optimal : ${stats.skipped}`);
  console.log(`   - Errors          : ${stats.errors}`);
  console.log('====================================================\n');
}

run().catch(console.error);
