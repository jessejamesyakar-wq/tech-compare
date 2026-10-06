import { mockSmartphones as phoneProducts } from '../src/lib/mockData';
import { mockTVs as tvProducts } from '../src/lib/mockTVs';
import { mockAppliances as whiteGoodsProducts } from '../src/lib/mockAppliances';
import { mockTablets as tabletProducts } from '../src/lib/mockTablets';
import { mockSmartwatches as watchProducts } from '../src/lib/mockSmartwatches';
import { mockHeadphones as headphoneProducts } from '../src/lib/mockHeadphones';
import { mockLaptops as laptopProducts } from '../src/lib/mockLaptops';
import { mockMonitors as monitorProducts } from '../src/lib/mockMonitors';
import { mockConsoles as consoleProducts } from '../src/lib/mockConsoles';
import { filterCanonicalSafeProducts } from '../src/lib/governance/canonicalExclusions';
import { evaluateProductPricing, hasVerifiedCatalogReference } from '../src/lib/pricing/unifiedPriceEvaluator';

const allRawProducts = [
  ...phoneProducts, ...tvProducts, ...whiteGoodsProducts, ...tabletProducts,
  ...watchProducts, ...headphoneProducts, ...laptopProducts, ...monitorProducts, ...consoleProducts
];
const canonical = filterCanonicalSafeProducts(allRawProducts);
const nowMs = Date.now();

let totalWithBasePrice = 0;
let totalWithVerifiedRefEvidence = 0;
let totalWithUnverifiedRefPrice = 0;
let totalWithFreshStoreOffer = 0;
let totalWithStaleStoreOffer = 0;
let totalWithNoVisibleNumericPrice = 0;

for (const p of canonical) {
  const hasBasePrice = typeof p.basePrice === 'number' && Number.isFinite(p.basePrice) && p.basePrice > 0;
  if (hasBasePrice) totalWithBasePrice++;

  const hasVerifiedRef = hasVerifiedCatalogReference(p, nowMs);
  if (hasVerifiedRef) totalWithVerifiedRefEvidence++;

  if (hasBasePrice && !hasVerifiedRef) totalWithUnverifiedRefPrice++;

  const evalPrice = evaluateProductPricing(p, nowMs);
  if (evalPrice.priceStatus === 'fresh') {
    totalWithFreshStoreOffer++;
  } else if (evalPrice.priceStatus === 'stale') {
    totalWithStaleStoreOffer++;
  }

  if (evalPrice.displayPrice === null) {
    totalWithNoVisibleNumericPrice++;
  }
}

console.log('TOTAL_CANONICAL =', canonical.length);
console.log('TOTAL_WITH_BASE_PRICE =', totalWithBasePrice);
console.log('TOTAL_WITH_VERIFIED_REFERENCE_EVIDENCE =', totalWithVerifiedRefEvidence);
console.log('TOTAL_WITH_UNVERIFIED_REFERENCE_PRICE =', totalWithUnverifiedRefPrice);
console.log('TOTAL_WITH_FRESH_STORE_OFFER =', totalWithFreshStoreOffer);
console.log('TOTAL_WITH_STALE_STORE_OFFER =', totalWithStaleStoreOffer);
console.log('TOTAL_WITH_NO_VISIBLE_NUMERIC_PRICE_AFTER_FIX =', totalWithNoVisibleNumericPrice);
