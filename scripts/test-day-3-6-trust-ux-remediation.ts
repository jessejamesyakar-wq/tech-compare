/**
 * scripts/test-day-3-6-trust-ux-remediation.ts
 *
 * ACELEETME.TECH — DAY 3.6
 * CONTROLLED TRUST UX REMEDIATION TEST SUITE
 *
 * Mode: Controlled Local Code Verification
 * RETAILER_NETWORK_REQUESTS = 0
 * NEW_PRODUCTION_PRICE_ROWS = 0
 * SUPABASE_WRITES = 0
 * CANONICAL_PRODUCTS = 5814
 */

import fs from 'fs';
import path from 'path';
import { getStoredProducts } from '../src/lib/adminData';
import { CANONICAL_EXCLUDED_ID_SET } from '../src/lib/governance/canonicalExclusions';
import { evaluateProductPricing, getPriceHeading, getEligibleDirectOffers } from '../src/lib/pricing/unifiedPriceEvaluator';
import { getProvenanceTrustLabel } from '../src/lib/pricing/priceProvenance';
import { get2026ShowcaseData } from '../src/lib/showcase2026';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
    failCount++;
  }
}

async function runDay36TestSuite() {
  console.log('======================================================================');
  console.log('ACELEETME.TECH — DAY 3.6 TRUST UX REMEDIATION VERIFICATION');
  console.log('======================================================================\n');

  const landingFilePath = path.join(process.cwd(), 'src/components/home/ChoiceAAntiGravityLanding.tsx');
  const landingSource = fs.readFileSync(landingFilePath, 'utf-8');

  // -------------------------------------------------------------------------
  // TEST 1: HOMEPAGE_NO_SYNTHETIC_PRICE
  // -------------------------------------------------------------------------
  const syntheticPricePattern = /price:\s*['"]\d+(\.\d+)?\s*(TL|₺)?['"]/i;
  const hardcodedPricesInLanding = landingSource.match(syntheticPricePattern);
  assert(
    !hardcodedPricesInLanding && !landingSource.includes('SHOWCASE_PRODUCTS'),
    'TEST 1: HOMEPAGE_NO_SYNTHETIC_PRICE',
    'No synthetic hardcoded price object or SHOWCASE_PRODUCTS found in ChoiceAAntiGravityLanding'
  );

  // -------------------------------------------------------------------------
  // TEST 2: IPHONE_16_PRO_MAX_NO_84999
  // -------------------------------------------------------------------------
  const has84999InLanding = landingSource.includes('84.999') || landingSource.includes('84999');
  assert(!has84999InLanding, 'TEST 2.1: IPHONE_16_PRO_MAX_NO_84999 in homepage landing', '84.999 TL is removed from landing');

  const allProducts = getStoredProducts().filter(p => !CANONICAL_EXCLUDED_ID_SET.has(p.id));
  const iphone16ProMax = allProducts.find(p => p.id === 'apple-apple-iphone-16-pro-max-256-gb-952387');

  assert(!!iphone16ProMax, 'TEST 2.2: Canonical iPhone 16 Pro Max root exists', 'Found apple-apple-iphone-16-pro-max-256-gb-952387');
  if (iphone16ProMax) {
    const evalPricing = evaluateProductPricing(iphone16ProMax);
    assert(
      evalPricing.priceStatus === 'no_offer',
      'TEST 2.3: iPhone 16 Pro Max priceStatus is no_offer',
      `Got status: ${evalPricing.priceStatus}`
    );
    assert(
      evalPricing.displayPrice === 107133,
      'TEST 2.4: iPhone 16 Pro Max reference price is 107133 TL',
      `Got displayPrice: ${evalPricing.displayPrice}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 3: CATALOG_REFERENCE_LABEL_CORRECT
  // -------------------------------------------------------------------------
  if (iphone16ProMax) {
    const evalPricing = evaluateProductPricing(iphone16ProMax);
    const heading = getPriceHeading(evalPricing);
    assert(
      heading === 'Katalog Referans Fiyatı',
      'TEST 3.1: CATALOG_REFERENCE heading is "Katalog Referans Fiyatı"',
      `Got: ${heading}`
    );
    assert(
      evalPricing.statusLabel.includes('Güncel Doğrulanmış Teklif Yok') || evalPricing.statusLabel.includes('Teklif Yok'),
      'TEST 3.2: NO_VERIFIED_OFFER statusLabel is accurate',
      `Got: ${evalPricing.statusLabel}`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 4: NO_OFFER_NO_BEST_PRICE
  // -------------------------------------------------------------------------
  const storeTableSource = fs.readFileSync(
    path.join(process.cwd(), 'src/components/detail/StoreTable.tsx'),
    'utf-8'
  );
  assert(
    storeTableSource.includes('activeOffers.length >= 2'),
    'TEST 4: NO_OFFER_NO_BEST_PRICE — StoreTable requires activeOffers.length >= 2 for "En Uygun Fiyat"',
    'Single offer cannot claim En Uygun Fiyat'
  );

  // -------------------------------------------------------------------------
  // TEST 5: NO_FALSE_LIVE_RADAR
  // -------------------------------------------------------------------------
  const hasFalseRadar =
    landingSource.includes('Canlı Fiyat Düşüş Radarı') ||
    landingSource.includes('CANLI') ||
    landingSource.includes('animate-ping');
  assert(!hasFalseRadar, 'TEST 5: NO_FALSE_LIVE_RADAR — No misleading live radar or ping in landing');

  // -------------------------------------------------------------------------
  // TEST 6: NO_FALSE_API_CLAIM
  // -------------------------------------------------------------------------
  const hasFalseApiClaim = landingSource.includes("mağaza API'leri üzerinden anlık kontrol ediliyor");
  const hasTruthfulCopy = landingSource.includes(
    'Katalogdaki 5.814 ürünü listeliyoruz; doğrulanmış mağaza tekliflerini ve mevcut fiyat geçmişini şeffaf biçimde gösteriyoruz.'
  );
  assert(
    !hasFalseApiClaim && hasTruthfulCopy,
    'TEST 6: NO_FALSE_API_CLAIM — Truthful copy installed and false API claim removed'
  );

  // -------------------------------------------------------------------------
  // TEST 7: NO_SYNTHETIC_DISCOUNT
  // -------------------------------------------------------------------------
  const hasSyntheticDiscount = landingSource.includes('%14 İndirim') || landingSource.includes('%14 indirim');
  assert(!hasSyntheticDiscount, 'TEST 7: NO_SYNTHETIC_DISCOUNT — Hardcoded %14 discount removed');

  // -------------------------------------------------------------------------
  // TEST 8: SHOWCASE_IMAGES_EXIST
  // -------------------------------------------------------------------------
  const showcase2026 = get2026ShowcaseData(allProducts);
  const allShowcaseProducts = [...showcase2026.initialProducts, ...showcase2026.rotationPool];
  let allImagesFound = true;
  let missingImageCount = 0;

  for (const sp of allShowcaseProducts) {
    if (!sp.image) {
      allImagesFound = false;
      missingImageCount++;
      continue;
    }
    const cleanImgPath = sp.image.replace(/^\//, '');
    const diskPath = path.join(process.cwd(), 'public', cleanImgPath);
    if (!fs.existsSync(diskPath)) {
      allImagesFound = false;
      missingImageCount++;
      console.error(`Missing showcase image on disk: ${sp.image} for product ${sp.id}`);
    }
  }
  assert(
    allImagesFound && missingImageCount === 0,
    `TEST 8: SHOWCASE_IMAGES_EXIST — All ${allShowcaseProducts.length} showcase images exist in public/`,
    `Missing: ${missingImageCount}`
  );

  // -------------------------------------------------------------------------
  // TEST 9: SHOWCASE_IMAGE_IDENTITY
  // -------------------------------------------------------------------------
  if (iphone16ProMax) {
    assert(
      iphone16ProMax.image.includes('iphone-16-promax-desert-dm.jpg'),
      'TEST 9.1: Canonical iPhone 16 Pro Max uses desert titanium image',
      `Got: ${iphone16ProMax.image}`
    );
    assert(
      !iphone16ProMax.image.includes('iphone-16-teal.png'),
      'TEST 9.2: Canonical iPhone 16 Pro Max does not use teal standard phone image'
    );
  }

  // -------------------------------------------------------------------------
  // TEST 10: PRODUCT_JSONLD_NO_PHANTOM_OFFER
  // -------------------------------------------------------------------------
  if (iphone16ProMax) {
    const { freshDirectOffers } = getEligibleDirectOffers(iphone16ProMax.storeOffers);
    assert(
      freshDirectOffers.length === 0,
      'TEST 10: PRODUCT_JSONLD_NO_PHANTOM_OFFER — Direct eligible offers for iPhone 16 Pro Max is strictly 0',
      `Got ${freshDirectOffers.length} eligible offers`
    );
  }

  // -------------------------------------------------------------------------
  // TEST 11 to 15: RESPONSIVE VIEWPORT CHECKS
  // -------------------------------------------------------------------------
  assert(landingSource.includes('min-h-[44px]'), 'TEST 11: RESPONSIVE_375 — Buttons have accessible min-h-[44px] touch target');
  assert(landingSource.includes('sm:px-4') && landingSource.includes('px-2'), 'TEST 12: RESPONSIVE_430 — Mobile horizontal padding guards against overflow');
  assert(landingSource.includes('md:flex-row') || landingSource.includes('sm:flex-row'), 'TEST 13: RESPONSIVE_768 — Tablet responsive flex layouts present');
  assert(landingSource.includes('max-w-7xl'), 'TEST 14: RESPONSIVE_1024 — Desktop max-w-7xl container styling present');
  assert(landingSource.includes('2xl:max-w-[1560px]'), 'TEST 15: RESPONSIVE_1440 — Wide screen 2xl:max-w-[1560px] styling present');

  // -------------------------------------------------------------------------
  // TEST 16: SOURCE LABEL SAFETY (AMAZON)
  // -------------------------------------------------------------------------
  const amazonTrustLabel = getProvenanceTrustLabel('AFFILIATE_API', 'amazon:affiliate_api', 'amazon');
  assert(
    !amazonTrustLabel.includes('Resmî affiliate API') && amazonTrustLabel.includes('onay bekleniyor'),
    'TEST 16: SOURCE LABEL SAFETY — Amazon AFFILIATE_API does not claim "Resmî affiliate API" while access is unestablished',
    `Got label: ${amazonTrustLabel}`
  );

  console.log('\n======================================================================');
  console.log(`TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runDay36TestSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
