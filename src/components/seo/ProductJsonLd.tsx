import React from 'react';
import { Product } from '@/lib/types';
import { getEligibleDirectOffers } from '@/lib/pricing/unifiedPriceEvaluator';
import { isProductImagePlaceholder } from '@/lib/productImages';

interface ProductJsonLdProps {
  product: Product;
  canonicalUrl?: string;
}

export function ProductJsonLd({ product, canonicalUrl }: ProductJsonLdProps) {
  if (!product) return null;

  const category = (product.category === 'smartphones' ? 'phones' : product.category) || 'phones';
  const slug = product.slug || product.id;
  const url = canonicalUrl || `https://www.aceleetme.tech/${category}/${slug}`;

  const { freshDirectOffers: verifiedFreshOffers } = getEligibleDirectOffers(product.storeOffers);

  const freshPrices = verifiedFreshOffers.map((o) => o.price);

  // No sourced, visible review dataset exists yet. A flag or arbitrary source string
  // is not evidence of reviews, so do not publish aggregateRating from catalog scores.
  const explicitMpn = typeof product.mpn === 'string' ? product.mpn.trim() : '';

  const images = [
    product.image,
    ...(product.images || []),
    ...(product.variants?.map((v) => v.image).filter(Boolean) || []),
  ]
    .filter((img): img is string => typeof img === 'string' && !isProductImagePlaceholder(img))
    .map((img) => (img.startsWith('http') ? img : `https://www.aceleetme.tech${img.startsWith('/') ? '' : '/'}${img}`));

  // Construct Offers schema strictly according to verified fresh data (omit if 0 fresh offers)
  let offersSchema: any = undefined;
  if (verifiedFreshOffers.length === 1) {
    const single = verifiedFreshOffers[0];
    offersSchema = {
      '@type': 'Offer',
      ...(single.variantName ? { itemOffered: { '@type': 'Product', name: single.observationEvidence?.title || `${product.name} - ${single.variantName}`, color: single.variantName, ...(single.observationEvidence?.manufacturerPartNumber ? { mpn: single.observationEvidence.manufacturerPartNumber } : {}) } } : {}),
      priceCurrency: 'TRY',
      price: single.price,
      availability: 'https://schema.org/InStock',
      url: single.url || url,
      seller: {
        '@type': 'Organization',
        name: single.storeName,
      },
    };
  } else if (verifiedFreshOffers.length > 1) {
    offersSchema = {
      '@type': 'AggregateOffer',
      priceCurrency: 'TRY',
      lowPrice: Math.min(...freshPrices),
      highPrice: Math.max(...freshPrices),
      offerCount: verifiedFreshOffers.length,
      offers: verifiedFreshOffers.map((o) => ({
        '@type': 'Offer',
        ...(o.variantName ? { itemOffered: { '@type': 'Product', name: o.observationEvidence?.title || `${product.name} - ${o.variantName}`, color: o.variantName, ...(o.observationEvidence?.manufacturerPartNumber ? { mpn: o.observationEvidence.manufacturerPartNumber } : {}) } } : {}),
        priceCurrency: 'TRY',
        price: o.price,
        availability: 'https://schema.org/InStock',
        url: o.url || url,
        seller: {
          '@type': 'Organization',
          name: o.storeName,
        },
      })),
    };
  }

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'phones':
      case 'smartphones': return 'Telefonlar';
      case 'tvs': return 'Televizyonlar';
      case 'laptops': return 'Laptoplar';
      case 'appliances': return 'Ev Aletleri';
      case 'tablets': return 'Tabletler';
      case 'smartwatches': return 'Akıllı Saatler';
      case 'headphones': return 'Kulaklıklar';
      case 'consoles': return 'Konsollar';
      case 'monitors': return 'Monitörler';
      default: return cat;
    }
  };

  const productSchema: Record<string, any> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images.length > 0 ? images : undefined,
    description: `${product.name} teknik özellikleri ve mağaza fiyat seçenekleri.`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Teknoloji',
    },
    sku: product.id,
    ...(explicitMpn ? { mpn: explicitMpn } : {}),
    ...(offersSchema ? { offers: offersSchema } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://www.aceleetme.tech',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: getCategoryLabel(category),
        item: `https://www.aceleetme.tech/${category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
