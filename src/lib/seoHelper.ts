import type { Metadata } from 'next';
import type { Product } from './types';
import { isProductImagePlaceholder } from './productImages';
import { hasUnresolvedSpecField } from './specVerification';

/**
 * Generates standardized SEO Title for Product Detail Pages
 * Preserves exact model name and capacity.
 * Format: {Ürün Adı} Fiyat Karşılaştırması ve Özellikleri - aceleEtme
 */
export function buildProductMetaTitle(product: Product): string {
  const modelName = product.name || `${product.brand || ''} ${product.model || 'Ürün'}`.trim();
  return `${modelName} Fiyat Karşılaştırması ve Özellikleri - aceleEtme`;
}

/**
 * Generates rich, clean 150-160 character SEO Meta Description for Product Detail Pages
 * Contains brand, model, key technical specs (RAM, storage, processor, display, etc.)
 * Strictly avoids [object Object], undefined, or unbacked claim adjectives.
 */
export function buildProductMetaDescription(product: Product): string {
  const name = product.name || 'Ürün';
  const specs = (product as any).specs || {};
  const specParts: string[] = [];

  const safeStr = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val.trim();
    if (typeof val === 'number') return String(val);
    return '';
  };

  const specTextValue = (key: string) => hasUnresolvedSpecField(product, key) ? '' : safeStr(specs[key]);
  const ram = specTextValue('ram');
  const storage = specTextValue('storage');
  const processor = specTextValue('processor');
  const screenSize = specTextValue('screenSize');
  const resolution = specTextValue('resolution');

  if (ram) specParts.push(`${ram} RAM`);
  if (storage) specParts.push(storage);
  if (processor) specParts.push(processor);
  if (screenSize) specParts.push(screenSize);
  if (resolution) specParts.push(resolution);

  if (specParts.length === 0 && product.highlights && Array.isArray(product.highlights) && product.highlights.length > 0) {
    const h = safeStr(product.highlights[0]).replace(/[\n\r]+/g, ' ').trim();
    if (h.length > 0 && h.length < 50) specParts.push(h);
  }

  const specText = specParts.slice(0, 3).join(', ');
  let desc = '';
  if (specText) {
    desc = `${name} teknik özellikleri (${specText}), mağaza fiyat seçenekleri ve detaylı karşılaştırması aceleEtme'de.`;
  } else {
    desc = `${name} teknik özellikleri, mağaza seçenekleri ve detaylı fiyat karşılaştırması aceleEtme'de.`;
  }

  if (desc.length > 160) {
    desc = desc.slice(0, 157) + '...';
  }
  return desc;
}

/**
 * Generates full Next.js Metadata object for a product with valid absolute canonical & OG URLs
 */
export function buildProductMetadata(product: Product | null, categoryPath: string): Metadata {
  if (!product) {
    return {
      title: 'Ürün Bulunamadı | aceleEtme',
      description: 'Aradığınız ürün bulunamadı.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const category = (product.category === 'smartphones' ? 'phones' : product.category) || categoryPath;
  const slug = product.slug || product.id;
  const title = buildProductMetaTitle(product);
  const description = buildProductMetaDescription(product);
  const canonical = `https://www.aceleetme.tech/${category}/${slug}`;

  const hasProductImage = !isProductImagePlaceholder(product.image);
  const absoluteImageUrl = hasProductImage
    ? product.image.startsWith('http')
      ? product.image
      : `https://www.aceleetme.tech${product.image.startsWith('/') ? '' : '/'}${product.image}`
    : 'https://www.aceleetme.tech/icon.png';

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'aceleEtme',
      images: [{ url: absoluteImageUrl, alt: hasProductImage ? product.name : 'aceleEtme' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export interface CategorySEOInfo {
  title: string;
  description: string;
  canonicalPath: string;
}

export const CATEGORY_SEO_DEFINITIONS: Record<string, CategorySEOInfo> = {
  phones: {
    title: 'Akıllı Telefon Fiyat Karşılaştırması - aceleEtme',
    description: 'Akıllı telefon modellerinde mağaza seçenekleri, teknik özellikler ve detaylı fiyat karşılaştırma platformu aceleEtme.',
    canonicalPath: '/phones',
  },
  tvs: {
    title: 'Televizyon Fiyat Karşılaştırması - aceleEtme',
    description: '4K Ultra HD, OLED ve QLED televizyon modellerinde mağaza seçenekleri ve teknik detaylar aceleEtme\'de.',
    canonicalPath: '/tvs',
  },
  laptops: {
    title: 'Laptop & Bilgisayar Fiyat Karşılaştırması - aceleEtme',
    description: 'Dizüstü bilgisayar, gaming laptop ve ultrabook modellerinde mağaza seçenekleri ve performans analizleri aceleEtme\'de.',
    canonicalPath: '/laptops',
  },
  tablets: {
    title: 'Tablet Fiyat Karşılaştırması - aceleEtme',
    description: 'iPad ve Android tablet modellerinde teknik özellikler, mağaza fiyat teklifleri ve karşılaştırmalar aceleEtme\'de.',
    canonicalPath: '/tablets',
  },
  smartwatches: {
    title: 'Akıllı Saat Fiyat Karşılaştırması - aceleEtme',
    description: 'Apple Watch, Galaxy Watch ve popüler akıllı saat modellerinde mağaza seçenekleri aceleEtme\'de.',
    canonicalPath: '/smartwatches',
  },
  headphones: {
    title: 'Kulaklık Fiyat Karşılaştırması - aceleEtme',
    description: 'Bluetooth, TWS ve kulak üstü kulaklık modellerinde mağaza fiyat seçenekleri ve teknik detaylar aceleEtme\'de.',
    canonicalPath: '/headphones',
  },
  appliances: {
    title: 'Beyaz Eşya & Ev Aletleri Fiyat Karşılaştırması - aceleEtme',
    description: 'Robot süpürge, airfryer, kahve makinesi ve ev aletlerinde mağaza fiyat teklifleri aceleEtme\'de.',
    canonicalPath: '/appliances',
  },
  monitors: {
    title: 'Monitör Fiyat Karşılaştırması - aceleEtme',
    description: 'Gaming ve profesyonel monitörlerde yenileme hızı, panel türleri ve mağaza seçenekleri aceleEtme\'de.',
    canonicalPath: '/monitors',
  },
  consoles: {
    title: 'Oyun Konsolu Fiyat Karşılaştırması - aceleEtme',
    description: 'PlayStation, Xbox ve Nintendo konsollarında mağaza seçenekleri ve fiyat karşılaştırmaları aceleEtme\'de.',
    canonicalPath: '/consoles',
  },
};

export function buildCategoryMetadata(categoryKey: string): Metadata {
  const info = CATEGORY_SEO_DEFINITIONS[categoryKey] || {
    title: 'Ürün Fiyat Karşılaştırması - aceleEtme',
    description: 'Türkiye\'nin bağımsız fiyat ve ürün karşılaştırma platformu aceleEtme.',
    canonicalPath: `/${categoryKey}`,
  };

  const canonical = `https://www.aceleetme.tech${info.canonicalPath}`;

  return {
    title: info.title,
    description: info.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: info.title,
      description: info.description,
      url: canonical,
      siteName: 'aceleEtme',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: info.title,
      description: info.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
