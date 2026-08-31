const fs = require('fs');
const path = require('path');

// 1. Fix mockAppliances.ts
const appPath = path.join(__dirname, '../src/lib/mockAppliances.ts');
let appContent = fs.readFileSync(appPath, 'utf8');
appContent = appContent.replace(/\/images\/products\/appliances\/philips-hd9875-90\.jpg/g, '/images/products/appliances/icecat-philips-5000-hd9339-80.jpg');
appContent = appContent.replace(/\/images\/products\/appliances\/philips-ep5447-90\.jpg/g, '/images/products/appliances/icecat-philips-1200-serisi-ep1220-00.jpg');
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('Fixed mockAppliances paths');

// 2. Fix smartphonesData.json
const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
let phoneContent = fs.readFileSync(phonePath, 'utf8');
phoneContent = phoneContent.replace(/\/images\/phones\/samsung\/samsung-galaxy-s24-ultra\.jpg/g, '/images/phones/samsung/samsung-galaxy-a16-5g.jpg');
fs.writeFileSync(phonePath, phoneContent, 'utf8');
console.log('Fixed smartphonesData paths');
