const fs = require('fs');
const path = require('path');

const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
const rawContent = fs.readFileSync(mockTVsPath, 'utf8');

const equalsIndex = rawContent.indexOf('=');
const jsonStartIndex = rawContent.indexOf('[', equalsIndex);
const jsonEndIndex = rawContent.lastIndexOf(']');

const mockTVs = JSON.parse(rawContent.substring(jsonStartIndex, jsonEndIndex + 1));

console.log('====================================================');
console.log('🔍 MOCKTVS.TS FİYAT VE MAĞAZA ALANLARI ANALİZİ:');
console.log('====================================================\n');

// 1. Check LG OLED97M49LA and TCL 98P8L
const lg97 = mockTVs.find(t => t.name.includes('OLED97M49LA') || t.id.includes('oled97m49la') || t.slug.includes('oled97m49la'));
const tcl98 = mockTVs.find(t => t.name.includes('98P8L') || t.id.includes('98p8l') || t.slug.includes('98p8l'));

console.log('--- 1. LG OLED97M49LA KAYDI ---');
console.log(JSON.stringify(lg97, null, 2));

console.log('\n--- 2. TCL 98P8L KAYDI ---');
console.log(JSON.stringify(tcl98, null, 2));

// 2. Count actual pricing fields across all 938 TVs
let hasBasePrice = 0;
let hasPrice = 0;
let hasStores = 0;
let hasPrices = 0;
let hasOffers = 0;
let hasMerchants = 0;

mockTVs.forEach(tv => {
  if (tv.basePrice && tv.basePrice > 0) hasBasePrice++;
  if (tv.price && tv.price > 0) hasPrice++;
  if (Array.isArray(tv.stores) && tv.stores.length > 0) hasStores++;
  if (Array.isArray(tv.prices) && tv.prices.length > 0) hasPrices++;
  if (Array.isArray(tv.offers) && tv.offers.length > 0) hasOffers++;
  if (Array.isArray(tv.merchants) && tv.merchants.length > 0) hasMerchants++;
});

console.log('\n====================================================');
console.log(`📊 938 TV İÇİNDE GERÇEK FİYAT VE MAĞAZA DAĞILIMI:`);
console.log(`- basePrice alanı olan TV sayısı : ${hasBasePrice} / ${mockTVs.length}`);
console.log(`- price alanı olan TV sayısı     : ${hasPrice} / ${mockTVs.length}`);
console.log(`- stores alanı olan TV sayısı    : ${hasStores} / ${mockTVs.length}`);
console.log(`- prices array olan TV sayısı    : ${hasPrices} / ${mockTVs.length}`);
console.log(`- offers array olan TV sayısı    : ${hasOffers} / ${mockTVs.length}`);
console.log(`- merchants array olan TV sayısı : ${hasMerchants} / ${mockTVs.length}`);
console.log('====================================================');
