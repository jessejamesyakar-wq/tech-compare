import type { Metadata } from 'next';
import type { Product } from './types';

/**
 * Generates standardized SEO Title for Product Detail Pages
 * Format: {Ürün Adı} Fiyat Karşılaştırması - aceleEtme
 */
export function buildProductMetaTitle(product: Product): string {
  return `${product.name} Fiyat Karşılaştırması - aceleEtme`;
}

/**
 * Generates rich, unique 150-160 character SEO Meta Description for Product Detail Pages
 * Contains: brand, model, key technical specs (RAM, storage, display, battery, etc.)
 * and the exact phrase "en güncel fiyat karşılaştırması".
 */
export function buildProductMetaDescription(product: Product): string {
  const name = product.name;
  const specs = (product as any).specs || {};
  const specParts: string[] = [];

  if (specs.ram) specParts.push(`${specs.ram} RAM`);
  if (specs.storage) specParts.push(`${specs.storage}`);
  if (specs.processor) specParts.push(`${specs.processor}`);
  if (specs.screenSize) specParts.push(`${specs.screenSize}`);
  if (specs.resolution) specParts.push(`${specs.resolution}`);
  if (specs.batteryLife) specParts.push(`${specs.batteryLife} pil`);
  if (specs.anc && String(specs.anc).toLowerCase().includes('var')) specParts.push('ANC');
  if (specs.power) specParts.push(`${specs.power}`);

  if (specParts.length === 0 && product.highlights && product.highlights.length > 0) {
    const h = String(product.highlights[0]).replace(/[\n\r]+/g, ' ').trim();
    if (h.length < 40) specParts.push(h);
  }

  const specText = specParts.slice(0, 2).join(', ');
  let desc = '';
  if (specText) {
    desc = `${name} en güncel fiyat karşılaştırması. ${specText} özellikleri ve canlı mağaza fırsatlarını aceleEtme'de hemen inceleyin.`;
  } else {
    desc = `${name} en güncel fiyat karşılaştırması, teknik özellikleri ve canlı mağaza fırsatlarını aceleEtme'de hemen inceleyin.`;
  }

  if (desc.length > 160) {
    desc = desc.slice(0, 157) + '...';
  }
  return desc;
}

/**
 * Generates full Next.js Metadata object for a product
 */
export function buildProductMetadata(product: Product | null, categoryPath: string): Metadata {
  if (!product) {
    return {
      title: 'Ürün Bulunamadı | aceleEtme',
      description: 'Aradığınız ürün bulunamadı.',
    };
  }

  const slug = product.slug || product.id;
  const title = buildProductMetaTitle(product);
  const description = buildProductMetaDescription(product);
  const canonical = `https://www.aceleetme.tech/${categoryPath}/${slug}`;

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
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image ? [product.image] : [],
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
    description: 'En güncel akıllı telefon fiyat karşılaştırması, teknik özellikler, kullanıcı puanları ve indirimli telefon modelleri aceleEtme\'de.',
    canonicalPath: '/phones',
  },
  tvs: {
    title: 'Televizyon Fiyat Karşılaştırması - aceleEtme',
    description: '4K Ultra HD, OLED ve QLED televizyon modellerinde en güncel fiyat karşılaştırması ve teknik detaylar aceleEtme\'de.',
    canonicalPath: '/tvs',
  },
  laptops: {
    title: 'Laptop & Bilgisayar Fiyat Karşılaştırması - aceleEtme',
    description: 'Dizüstü bilgisayar, gaming laptop ve ultrabook modellerinde en güncel fiyat karşılaştırması ve performans analizleri aceleEtme\'de.',
    canonicalPath: '/laptops',
  },
  tablets: {
    title: 'Tablet Fiyat Karşılaştırması - aceleEtme',
    description: 'iPad ve Android tablet modellerinde en güncel fiyat karşılaştırması, ekran boyutları, pil ömrü ve fırsatlar aceleEtme\'de.',
    canonicalPath: '/tablets',
  },
  smartwatches: {
    title: 'Akıllı Saat Fiyat Karşılaştırması - aceleEtme',
    description: 'Apple Watch, Galaxy Watch ve popüler akıllı saat modellerinde en güncel fiyat karşılaştırması ve sağlık takibi özellikleri aceleEtme\'de.',
    canonicalPath: '/smartwatches',
  },
  headphones: {
    title: 'Kulaklık Fiyat Karşılaştırması - aceleEtme',
    description: 'Bluetooth, TWS ve kulak üstü kulaklık modellerinde en güncel fiyat karşılaştırması, ses kalitesi ve aktif gürültü engelleme özellikleri aceleEtme\'de.',
    canonicalPath: '/headphones',
  },
  appliances: {
    title: 'Beyaz Eşya & Ev Aletleri Fiyat Karşılaştırması - aceleEtme',
    description: 'Robot süpürge, airfryer, kahve makinesi ve ev aletlerinde en güncel fiyat karşılaştırması ve kullanıcı incelemeleri aceleEtme\'de.',
    canonicalPath: '/appliances',
  },
  monitors: {
    title: 'Monitör Fiyat Karşılaştırması - aceleEtme',
    description: 'Gaming ve profesyonel monitörlerde en güncel fiyat karşılaştırması, yenileme hızı, panel türleri ve çözünürlük seçenekleri aceleEtme\'de.',
    canonicalPath: '/monitors',
  },
  consoles: {
    title: 'Oyun Konsolu Fiyat Karşılaştırması - aceleEtme',
    description: 'PlayStation, Xbox ve Nintendo konsollarında en güncel fiyat karşılaştırması, paket seçenekleri ve piyasa fırsatları aceleEtme\'de.',
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
  };
}
