import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const smartphonesData = JSON.parse(fs.readFileSync('src/lib/smartphonesData.json', 'utf8'));

const priceAndOfferState = smartphonesData.map((p: any) => ({
  id: p.id,
  slug: p.slug,
  basePrice: p.basePrice,
  price: p.price,
  currency: p.currency,
  storeOffers: p.storeOffers,
  priceHistory: p.priceHistory
}));

const currentHash = crypto.createHash('sha256').update(JSON.stringify(priceAndOfferState)).digest('hex');
const snap = JSON.parse(fs.readFileSync('reports/icecat-phones-400/initial_safety_snapshot.json', 'utf8'));
const baselineHash = snap.priceAndOfferHash;

console.log('Current Price Hash :', currentHash);
console.log('Baseline Price Hash:', baselineHash);
console.log('Hash Match         :', currentHash === baselineHash);

if (currentHash !== baselineHash) {
  console.error('[CRITICAL] PRICE HASH MISMATCH! Aborting!');
  process.exit(1);
} else {
  console.log('[SUCCESS] Price immutability 100% verified. 0 price/offer mutations.');
}
