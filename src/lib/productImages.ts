/** These UI placeholders must never be represented as a photograph of a model. */
export function isProductImagePlaceholder(src: unknown): boolean {
  if (typeof src !== 'string' || !src.trim()) return true;
  try {
    const path = new URL(src, 'https://www.aceleetme.tech').pathname;
    return ['/images/product-placeholder.png', '/images/product-unverified.svg'].includes(path);
  } catch { return false; }
}
