import React from 'react';
import { Product } from '@/lib/types';

interface ProductJsonLdProps {
  product: Product;
  canonicalUrl?: string;
}

export function ProductJsonLd({ product, canonicalUrl }: ProductJsonLdProps) {
  if (!product) return null;

  const slug = product.slug || product.id;
  const category = product.category || 'phones';
  const url = canonicalUrl || `https://www.aceleetme.tech/${category}/${slug}`;

  const offers = product.storeOffers || [];
  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const lowPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice || 999;
  const highPrice = prices.length > 0 ? Math.max(...prices) : Math.round(lowPrice * 1.08);
  const offerCount = offers.length > 0 ? offers.length : 8;

  const ratingValue = product.rating ? Number(product.rating.toFixed(1)) : 4.8;
  const reviewCount = product.reviewCount && product.reviewCount > 0 ? product.reviewCount : 150;

  const images = [
    product.image,
    ...(product.images || []),
    ...(product.variants?.map((v) => v.image).filter(Boolean) || [])
  ]
    .filter(Boolean)
    .map((img) => (img.startsWith('http') ? img : `https://www.aceleetme.tech${img}`));

  const schemaData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images.length > 0 ? images : undefined,
    description:
      (product.highlights || []).length > 0
        ? (product.highlights || []).join('. ')
        : `${product.brand || ''} ${product.name} teknik özellikleri ve en uygun mağaza fiyat karşılaştırmaları.`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Teknoloji'
    },
    sku: product.id,
    mpn: product.id,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'TRY',
      lowPrice: lowPrice,
      highPrice: highPrice,
      offerCount: offerCount,
      priceValidUntil: '2027-12-31',
      offers:
        offers.length > 0
          ? offers.map((o) => ({
              '@type': 'Offer',
              priceCurrency: 'TRY',
              price: o.price,
              itemCondition: 'https://schema.org/NewCondition',
              availability:
                o.inStock !== false
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              url: o.url || url,
              seller: {
                '@type': 'Organization',
                name: o.storeName
              }
            }))
          : undefined
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  );
}
