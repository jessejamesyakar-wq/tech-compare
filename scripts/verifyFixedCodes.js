const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/icecat_staging_preview.json', 'utf8'));

console.log('====================================================');
console.log('🍎 MACBOOK PRO PARÇA KODU DOĞRULAMASI:');
console.log('====================================================');
const macs = data.items.filter(it => it.productName.includes('MacBook Pro'));
macs.slice(0, 6).forEach(m => {
  console.log(`Ürün      : ${m.productName}`);
  console.log(`Arama Kodu: ${m.searchKeyUsed}`);
  console.log(`Çıkan Kod : ${m.extractedCode}\n`);
});

console.log('====================================================');
console.log('📺 LG TELEVİZYON MODEL KODU DOĞRULAMASI:');
console.log('====================================================');
const lg55 = data.items.find(it => it.productName.includes('55QNED81B6A'));
const lg65 = data.items.find(it => it.productName.includes('65QNED816QA'));
console.log(`Ürün      : ${lg55?.productName}`);
console.log(`Arama Kodu: ${lg55?.searchKeyUsed}`);
console.log(`Çıkan Kod : ${lg55?.extractedCode}\n`);

console.log(`Ürün      : ${lg65?.productName}`);
console.log(`Arama Kodu: ${lg65?.searchKeyUsed}`);
console.log(`Çıkan Kod : ${lg65?.extractedCode}\n`);
