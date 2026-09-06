import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import { trimAndPadImage } from './imageTrimmer';

export interface ProductImageFetchOptions {
  id: string;
  name: string;
  category: string;
  brand: string;
  storeUrl?: string;
}

/**
 * Downloads an image from remote URL to a local destination file path.
 */
export function downloadImageToFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(destPath);
      const protocol = url.startsWith('https') ? https : http;

      const request = protocol.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        },
        timeout: 10000
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            return downloadImageToFile(redirectUrl, destPath).then(resolve);
          }
        }
        if (response.statusCode !== 200) {
          file.close();
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          return resolve(false);
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close(async () => {
            // Automatically trim white/transparent borders with uniform 6% padding
            try {
              await trimAndPadImage(destPath, destPath, { paddingPercent: 0.06 });
            } catch {
              // Non-blocking: proceed with original image if trim fails
            }
            resolve(true);
          });
        });
      });

      request.on('error', () => {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      });
      request.on('timeout', () => {
        request.destroy();
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

/**
 * Fetches OpenGraph og:image content from a given HTML product webpage URL.
 */
export function extractOgImageFromPage(pageUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(pageUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const req = protocol.get(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 8000
      }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) return extractOgImageFromPage(redirectUrl).then(resolve);
        }
        if (res.statusCode !== 200) return resolve(null);

        let html = '';
        res.on('data', (chunk) => {
          html += chunk.toString('utf8');
          if (html.length > 600000) res.destroy();
        });

        res.on('end', () => {
          const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
                          html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);

          if (ogMatch && ogMatch[1]) {
            let imgUrl = ogMatch[1].trim();
            if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
            else if (imgUrl.startsWith('/')) imgUrl = parsedUrl.origin + imgUrl;
            return resolve(imgUrl);
          }
          resolve(null);
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

/**
 * Brand-agnostic OpenGraph Product Image Fetcher.
 * Downloads og:image to /public/images/products/{category}/{id}.jpg without random stock fallbacks.
 */
export async function autoFetchAndSaveProductImage(options: ProductImageFetchOptions): Promise<{ localPath: string | null; sourceUrl: string | null; isFallback: boolean }> {
  const { id, storeUrl, category } = options;

  let ogImageUrl: string | null = null;

  if (storeUrl) {
    ogImageUrl = await extractOgImageFromPage(storeUrl);
  }

  if (!ogImageUrl) {
    return { localPath: null, sourceUrl: null, isFallback: true };
  }

  const relativePath = `/images/products/${category}/${id}.jpg`;
  const absolutePath = path.join(process.cwd(), 'public', relativePath);

  const success = await downloadImageToFile(ogImageUrl, absolutePath);

  if (success) {
    return { localPath: relativePath, sourceUrl: ogImageUrl, isFallback: false };
  }

  return { localPath: null, sourceUrl: null, isFallback: true };
}
