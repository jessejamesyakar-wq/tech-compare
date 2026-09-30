import React from 'react';

export function GlobalJsonLd() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'aceleEtme',
    url: 'https://www.aceleetme.tech',
    description: 'Akıllı Telefon, TV ve Teknoloji Karşılaştırma ve Fiyat Takip Platformu',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.aceleetme.tech/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'aceleEtme',
    url: 'https://www.aceleetme.tech',
    logo: 'https://www.aceleetme.tech/icon.png',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
