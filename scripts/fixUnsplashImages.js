const fs = require('fs');
const path = require('path');

// 1. Fix mockHeadphones.ts
let hpContent = fs.readFileSync(path.join(__dirname, '../src/lib/mockHeadphones.ts'), 'utf8');
hpContent = hpContent.replace(
  /"https:\/\/images\.unsplash\.com\/photo-1546435770-a3e426bf472b[^"]*"/g,
  '"/images/headphones/jbl-tune-520bt.jpg"'
);
hpContent = hpContent.replace(
  /"https:\/\/images\.unsplash\.com\/photo-1505740420928-5e560c06d30e[^"]*"/g,
  '"/images/headphones/jbl-tune-520bt.jpg"'
);
hpContent = hpContent.replace(
  /"https:\/\/images\.unsplash\.com\/photo-1590658268037-6bf12165a8df[^"]*"/g,
  '"/images/headphones/jbl-tune-520bt.jpg"'
);
fs.writeFileSync(path.join(__dirname, '../src/lib/mockHeadphones.ts'), hpContent);
console.log('Fixed mockHeadphones.ts unsplash images');

// 2. Fix mockTVs.ts unsplash images
let tvContent = fs.readFileSync(path.join(__dirname, '../src/lib/mockTVs.ts'), 'utf8');
tvContent = tvContent.replace(
  /"https:\/\/images\.unsplash\.com\/[^"]*"/g,
  '"/images/products/tvs/lg-55qned81b6a-1.jpg"'
);
fs.writeFileSync(path.join(__dirname, '../src/lib/mockTVs.ts'), tvContent);
console.log('Fixed mockTVs.ts unsplash images');

// 3. Fix mockAppliances.ts unsplash images
let appContent = fs.readFileSync(path.join(__dirname, '../src/lib/mockAppliances.ts'), 'utf8');
appContent = appContent.replace(
  /"https:\/\/images\.unsplash\.com\/[^"]*"/g,
  '"/images/products/appliances/dyson-v15-detect.jpg"'
);
fs.writeFileSync(path.join(__dirname, '../src/lib/mockAppliances.ts'), appContent);
console.log('Fixed mockAppliances.ts unsplash images');
