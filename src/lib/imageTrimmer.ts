import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export interface TrimImageOptions {
  paddingPercent?: number; // default 6% (0.06)
  threshold?: number;      // default 10
}

/**
 * Trims excess uniform/white/transparent borders from an image using sharp.trim()
 * and reapplies a standard proportional padding (5-10%) so that all products
 * fill their container uniformly.
 */
export async function trimAndPadImage(
  inputPathOrBuffer: string | Buffer,
  outputPath?: string,
  options: TrimImageOptions = {}
): Promise<{ success: boolean; error?: string; trimmed?: boolean }> {
  try {
    const paddingPercent = options.paddingPercent ?? 0.06;
    const threshold = options.threshold ?? 10;

    const inputBuf = typeof inputPathOrBuffer === 'string'
      ? await fs.promises.readFile(inputPathOrBuffer)
      : inputPathOrBuffer;

    const meta = await sharp(inputBuf).metadata();
    if (!meta.width || !meta.height) {
      return { success: false, error: 'Geçersiz görsel boyutları' };
    }

    // 1. Trim redundant single-color border
    let trimmedBuf: Buffer;
    try {
      trimmedBuf = await sharp(inputBuf).trim({ threshold }).toBuffer();
    } catch {
      trimmedBuf = await sharp(inputBuf).trim().toBuffer();
    }

    const metaTrimmed = await sharp(trimmedBuf).metadata();
    if (!metaTrimmed.width || !metaTrimmed.height) {
      return { success: false, error: 'Trim sonrası görsel okunamadı' };
    }

    // Check if trim actually cropped anything
    const didTrim = metaTrimmed.width < meta.width || metaTrimmed.height < meta.height;

    // 2. Add standard proportional padding (default 6%)
    const maxDim = Math.max(metaTrimmed.width, metaTrimmed.height);
    const pad = Math.max(8, Math.round(maxDim * paddingPercent));

    // Preserve transparency if image has alpha, otherwise clean white
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

    if (outputPath) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      await fs.promises.writeFile(outputPath, outputBuf);
    }

    return { success: true, trimmed: didTrim };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
