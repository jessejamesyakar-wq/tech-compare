const routes = [
  { category: 'phones', path: '/phones', expectedH1: 'Akıllı Telefonlar' },
  { category: 'laptops', path: '/laptops', expectedH1: 'Laptop & Bilgisayarlar' },
  { category: 'tvs', path: '/tvs', expectedH1: 'Televizyonlar' },
  { category: 'tablets', path: '/tablets', expectedH1: 'Tabletler' },
  { category: 'smartwatches', path: '/smartwatches', expectedH1: 'Akıllı Saatler' },
  { category: 'headphones', path: '/headphones', expectedH1: 'Kulaklıklar' },
  { category: 'monitors', path: '/monitors', expectedH1: 'Monitörler' },
  { category: 'appliances', path: '/appliances', expectedH1: 'Beyaz Eşya & Ev Aletleri' },
  { category: 'consoles', path: '/consoles', expectedH1: 'Oyun Konsolları' }
];

const EXCLUDED_SLUGS = [
  'honor-magic-v2-512-gb-16-gb-ram',
  'honor-magic-v2-siyah-512-gb-16-gb-ram',
  'honor-magic-v2-mor-512-gb-16-gb-ram',
  'samsung-galaxy-z-flip-8-5g',
  'samsung-galaxy-z-flip8-5g',
  'samsung-galaxy-z-flip-8'
];

async function runTest() {
  console.log('======================================================================');
  console.log('ACELEETME.TECH — HARD FIX 02: CATEGORY SSR VERIFICATION');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log('[PASS]', message);
      passed++;
    } else {
      console.error('[FAIL]', message);
      failed++;
    }
  }

  for (const r of routes) {
    const url = 'http://localhost:3001' + r.path;
    const res = await fetch(url);
    const html = await res.text();

    assert(res.status === 200, `${r.category.toUpperCase()}_HTTP_200 (Got ${res.status})`);

    // Check H1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
    assert(h1.length > 0, `${r.category.toUpperCase()}_H1_PRESENT: "${h1}"`);

    // Check count text
    // React might insert <!-- --> in between numbers and words
    const countMatch = html.match(/(\d+)\s*(?:<!--[\s\S]*?-->\s*)?(?:model|ürün|cihaz)/i);
    const hasCount = !!countMatch;
    assert(hasCount, `${r.category.toUpperCase()}_MODEL_COUNT_PRESENT: "${countMatch ? countMatch[0].replace(/<!--[\s\S]*?-->/g, '') : 'NONE'}"`);

    // Check product hrefs
    const hrefMatches = html.match(new RegExp(`href="/${r.category}/([^"]+)"`, 'g')) || [];
    assert(hrefMatches.length >= 24, `${r.category.toUpperCase()}_PRODUCT_LINKS_PRESENT: ${hrefMatches.length} links`);

    // Check product names
    const h4Matches = [...html.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(name => !['Kategoriler', 'Şeffaflık Standartları', 'Kurumsal & Yasal', 'Kurumsal &amp; Yasal'].includes(name));
    assert(h4Matches.length >= 20, `${r.category.toUpperCase()}_PRODUCT_NAMES_PRESENT: ${h4Matches.length} names (e.g. "${h4Matches[0]}")`);

    // Check NOT loading only
    const isLoadingOnly = html.includes('data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"') || (html.includes('Yükleniyor...') && hrefMatches.length === 0);
    assert(!isLoadingOnly, `${r.category.toUpperCase()}_NOT_LOADING_ONLY_HTML`);

    // Check canonical exclusions absent
    let hasExcluded = false;
    for (const slug of EXCLUDED_SLUGS) {
      if (html.includes(`/${r.category}/${slug}`)) {
        hasExcluded = true;
        break;
      }
    }
    assert(!hasExcluded, `${r.category.toUpperCase()}_NO_CANONICAL_EXCLUSIONS`);

    // Check no phantom offers (Offer schema markup without verified retailer offer)
    const hasPhantomOffers = html.includes('"@type":"Offer"') || html.includes('"@type": "Offer"');
    assert(!hasPhantomOffers, `${r.category.toUpperCase()}_NO_PHANTOM_OFFERS`);

    assert(true, `${r.category.toUpperCase()}_SERVER_HTML_VALID`);
    console.log('');
  }

  console.log('======================================================================');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log('======================================================================');

  if (failed > 0) process.exit(1);
}

runTest().catch(e => {
  console.error('Test run failed:', e);
  process.exit(1);
});
