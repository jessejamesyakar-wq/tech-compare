import type { BaseProduct } from './types';

export function getProductImageSource(product: BaseProduct, activeImage: string) {
  const source = product.imageSource;
  if (!source || source.imagePath !== activeImage || isProductImagePlaceholder(activeImage)) return null;
  const checked = Date.parse(source.checkedAt);
  if (!Number.isFinite(checked) || checked > Date.now() || !source.scopeNote?.trim()) return null;
  try {
    const url = new URL(source.sourceUrl);
    return url.protocol === 'https:' && !url.username && !url.password ? source : null;
  } catch { return null; }
}

/** These UI placeholders must never be represented as a photograph of a model. */
export function isProductImagePlaceholder(src: unknown): boolean {
  if (typeof src !== 'string' || !src.trim()) return true;
  try {
    const path = new URL(src, 'https://www.aceleetme.tech').pathname;
    return ['/images/product-placeholder.png', '/images/product-unverified.svg'].includes(path);
  } catch { return false; }
}
