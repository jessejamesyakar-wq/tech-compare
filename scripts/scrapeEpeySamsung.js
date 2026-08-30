const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('=== CONNECTING TO EPEY SAMSUNG SMARTPHONE CATALOG ===\n');

const options = {
  hostname: 'www.epey.com',
  path: '/akilli-telefonlar/e/yt:1/marka/samsung/',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
  }
};

https.get(options, res => {
  console.log(`Epey HTTP Response Status: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Received ${data.length} bytes from Epey.`);
    
    // Save raw HTML for analysis
    fs.writeFileSync(path.join(__dirname, '../data/epey_samsung_page.html'), data, 'utf8');

    // Extract product rows: title, link, image, price
    const productRegex = /<li class="[^"]*urun[^"]*"[\s\S]*?<a class="urunadi" href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<img [^>]*src="([^"]+)"[\s\S]*?<span class="fiyat">([^<]+)<\/span>/g;
    
    // Alternative simpler regex for product names and images
    const imgRegex = /<img [^>]*src="(https:\/\/[^"]*epey\.com[^"]*|\/static\/[^"]*|\/\/[^"]*)"[^>]*alt="([^"]+)"/g;
    
    const epeyProducts = [];
    let match;
    
    // Also parse with basic regex
    const nameMatches = [...data.matchAll(/<a class="urunadi" href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
    const priceMatches = [...data.matchAll(/<span class="fiyat">([^<]+)<\/span>/g)];
    const imageMatches = [...data.matchAll(/<div class="resim">[\s\S]*?<img [^>]*src="([^"]+)"/g)];

    console.log(`Found on Epey page 1:`);
    console.log(`- Product names: ${nameMatches.length}`);
    console.log(`- Product prices: ${priceMatches.length}`);
    console.log(`- Product images: ${imageMatches.length}`);

    nameMatches.forEach((nm, idx) => {
      const link = nm[1];
      const name = nm[2].trim();
      const price = priceMatches[idx] ? priceMatches[idx][1].trim() : '';
      const img = imageMatches[idx] ? imageMatches[idx][1] : '';
      epeyProducts.push({ name, link, price, img });
    });

    console.log('\nTop 15 Epey Samsung Products:');
    epeyProducts.slice(0, 15).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} | Fiyat: ${p.price} | Fotoğraf: ${p.img}`);
    });

    fs.writeFileSync(
      path.join(__dirname, '../data/epey_samsung_products.json'),
      JSON.stringify(epeyProducts, null, 2),
      'utf8'
    );
  });
}).on('error', err => {
  console.error('Error contacting Epey:', err.message);
});
