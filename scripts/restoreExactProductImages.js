const fs = require('fs');
const path = require('path');

// 1. Restore exact iPhone images in smartphonesData.json
const smartphonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const smartphones = JSON.parse(fs.readFileSync(smartphonesPath, 'utf8'));

let restoredIphones = 0;

function resolveIphoneImage(name) {
  const n = name.toLowerCase();
  
  // 17 Series
  if (n.includes('17 pro max')) return '/images/phones/apple/apple-iphone-17-pro-max.jpg';
  if (n.includes('17 pro')) return '/images/phones/apple/apple-iphone-17-pro.jpg';
  if (n.includes('17 air')) return '/images/phones/apple/apple-iphone-17-air.jpg';
  if (n.includes('17e')) return '/images/phones/apple/apple-iphone-17e.jpg';
  if (n.includes('17')) return '/images/phones/apple/apple-iphone-17.jpg';

  // 16 Series
  if (n.includes('16 pro max')) return '/images/phones/apple/apple-iphone-16-pro-max.jpg';
  if (n.includes('16 pro')) return '/images/phones/apple/apple-iphone-16-pro.jpg';
  if (n.includes('16 plus')) return '/images/phones/apple/apple-iphone-16-plus.jpg';
  if (n.includes('16e')) return '/images/phones/apple/apple-iphone-16e.jpg';
  if (n.includes('16')) return '/images/phones/apple/apple-iphone-16.jpg';

  // 15 Series
  if (n.includes('15 pro max')) return '/images/phones/apple/apple-iphone-15-pro-max.jpg';
  if (n.includes('15 pro')) return '/images/phones/apple/apple-iphone-15-pro.jpg';
  if (n.includes('15 plus')) return '/images/phones/apple/apple-iphone-15-plus.jpg';
  if (n.includes('15')) return '/images/phones/apple/apple-iphone-15.jpg';

  // 14 Series
  if (n.includes('14 pro max')) return '/images/phones/apple/apple-iphone-14-pro-max.jpg';
  if (n.includes('14 pro')) return '/images/phones/apple/apple-iphone-14-pro.jpg';
  if (n.includes('14')) return '/images/phones/apple/apple-iphone-14.jpg';

  // 13 Series
  if (n.includes('13 pro max')) return '/images/phones/apple/apple-iphone-13-pro-max.jpg';
  if (n.includes('13 pro')) return '/images/phones/apple/apple-iphone-13-pro.jpg';
  if (n.includes('13')) return '/images/phones/apple/apple-iphone-13.jpg';

  // 12 Series
  if (n.includes('12 pro max')) return '/images/phones/apple/apple-iphone-12-pro-max.jpg';
  if (n.includes('12 pro')) return '/images/phones/apple/apple-iphone-12-pro.jpg';
  if (n.includes('12')) return '/images/phones/apple/apple-iphone-12.jpg';

  // 11 Series
  if (n.includes('11 pro max')) return '/images/phones/apple/apple-iphone-11-pro-max.jpg';
  if (n.includes('11 pro')) return '/images/phones/apple/apple-iphone-11-pro.jpg';
  if (n.includes('11')) return '/images/phones/apple/apple-iphone-11.jpg';

  // SE Series
  if (n.includes('se 3') || n.includes('se (2022)') || n.includes('se 2022')) return '/images/phones/apple/apple-iphone-se-2022.jpg';
  if (n.includes('se 2') || n.includes('se (2020)') || n.includes('se 2020')) return '/images/phones/apple/apple-iphone-se-2020.jpg';
  if (n.includes('se')) return '/images/phones/apple/apple-iphone-se-2016.jpg';

  // Legacy Series
  if (n.includes('xs max')) return '/images/phones/apple/apple-iphone-xs-max.jpg';
  if (n.includes('xs')) return '/images/phones/apple/apple-iphone-xs.jpg';
  if (n.includes('xr')) return '/images/phones/apple/apple-iphone-xr.jpg';
  if (n.includes('x')) return '/images/phones/apple/apple-iphone-x.jpg';
  if (n.includes('8 plus')) return '/images/phones/apple/apple-iphone-8-plus.jpg';
  if (n.includes('8')) return '/images/phones/apple/apple-iphone-8.jpg';
  if (n.includes('7 plus')) return '/images/phones/apple/apple-iphone-7-plus.jpg';
  if (n.includes('7')) return '/images/phones/apple/apple-iphone-7.jpg';
  if (n.includes('6s plus')) return '/images/phones/apple/apple-iphone-6s-plus.jpg';
  if (n.includes('6s')) return '/images/phones/apple/apple-iphone-6s.jpg';
  if (n.includes('6 plus')) return '/images/phones/apple/apple-iphone-6-plus.jpg';
  if (n.includes('6')) return '/images/phones/apple/apple-iphone-6.jpg';
  if (n.includes('5s')) return '/images/phones/apple/apple-iphone-5s.jpg';
  if (n.includes('5c')) return '/images/phones/apple/apple-iphone-5c.jpg';
  if (n.includes('5')) return '/images/phones/apple/apple-iphone-5.jpg';
  if (n.includes('4s')) return '/images/phones/apple/apple-iphone-4s.jpg';
  if (n.includes('4')) return '/images/phones/apple/apple-iphone-4.jpg';
  if (n.includes('3gs')) return '/images/phones/apple/apple-iphone-3gs.jpg';
  if (n.includes('3g')) return '/images/phones/apple/apple-iphone-3g.jpg';
  if (n.includes('2g')) return '/images/phones/apple/apple-iphone-2g.jpg';

  return '/images/phones/apple/apple-iphone-16.jpg';
}

smartphones.forEach(p => {
  if (p.brand === 'Apple' || p.name.includes('iPhone')) {
    const resolved = resolveIphoneImage(p.name);
    p.image = resolved;
    p.images = [resolved];
    restoredIphones++;
  }
});

fs.writeFileSync(smartphonesPath, JSON.stringify(smartphones, null, 2), 'utf8');
console.log(`Restored ${restoredIphones} exact iPhone product images in smartphonesData.json`);

// 2. Restore Laptop Images
const laptopsPath = path.join(__dirname, '../src/lib/mockLaptops.ts');
if (fs.existsSync(laptopsPath)) {
  let content = fs.readFileSync(laptopsPath, 'utf8');
  const match = content.match(/export\s+const\s+mockLaptops\s*:\s*(?:Product\[\]|LaptopProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    const laptops = JSON.parse(match[1]);
    const laptopFiles = fs.readdirSync(path.join(__dirname, '../public/images/laptops'));
    let restoredLaptops = 0;

    laptops.forEach(p => {
      // Check if exact ID has a file in public/images/laptops
      const exactMatch = laptopFiles.find(f => f.toLowerCase().includes(p.id.toLowerCase()));
      if (exactMatch) {
        p.image = `/images/laptops/${exactMatch}`;
        p.images = [`/images/laptops/${exactMatch}`];
        restoredLaptops++;
      } else {
        // Match by brand/slug
        const brandMatch = laptopFiles.find(f => f.toLowerCase().startsWith(p.brand.toLowerCase()));
        if (brandMatch) {
          p.image = `/images/laptops/${brandMatch}`;
          p.images = [`/images/laptops/${brandMatch}`];
          restoredLaptops++;
        }
      }
    });

    const newContent = content.replace(match[1], JSON.stringify(laptops, null, 2));
    fs.writeFileSync(laptopsPath, newContent, 'utf8');
    console.log(`Restored ${restoredLaptops} brand/model images in mockLaptops.ts`);
  }
}

// 3. Restore TV Images
const tvsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
if (fs.existsSync(tvsPath)) {
  let content = fs.readFileSync(tvsPath, 'utf8');
  const match = content.match(/export\s+const\s+mockTVs\s*:\s*(?:Product\[\]|TVProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    const tvs = JSON.parse(match[1]);
    const tvFiles = fs.readdirSync(path.join(__dirname, '../public/images/tvs'));
    const prodTvFiles = fs.readdirSync(path.join(__dirname, '../public/images/products/tvs'));
    let restoredTVs = 0;

    tvs.forEach(p => {
      // Check if prodTvFiles has exact match
      const exactProd = prodTvFiles.find(f => f.toLowerCase() === `${p.id.toLowerCase()}.jpg`);
      if (exactProd) {
        p.image = `/images/products/tvs/${exactProd}`;
        p.images = [`/images/products/tvs/${exactProd}`];
        restoredTVs++;
      } else {
        const tvMatch = tvFiles.find(f => f.toLowerCase().includes(p.slug.toLowerCase()) || f.toLowerCase().includes(p.id.toLowerCase()));
        if (tvMatch) {
          p.image = `/images/tvs/${tvMatch}`;
          p.images = [`/images/tvs/${tvMatch}`];
          restoredTVs++;
        }
      }
    });

    const newContent = content.replace(match[1], JSON.stringify(tvs, null, 2));
    fs.writeFileSync(tvsPath, newContent, 'utf8');
    console.log(`Restored ${restoredTVs} brand/model images in mockTVs.ts`);
  }
}
