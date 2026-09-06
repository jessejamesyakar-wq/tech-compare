const phones = require('../src/lib/smartphonesData.json');
const jsonStr = JSON.stringify(phones);
console.log('Total smartphones count:', phones.length);
console.log('RSC Payload Size for all phones:', (jsonStr.length / 1024 / 1024).toFixed(2), 'MB');
console.log('Gzipped estimate:', (jsonStr.length / 1024 / 1024 / 4).toFixed(2), 'MB');
