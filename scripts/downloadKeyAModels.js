const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, targetPath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(targetPath);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.epey.com/'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
      } else {
        file.close();
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      resolve(false);
    });
  });
}

(async () => {
  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  
  const pairs = [
    { target: 'samsung-samsung-galaxy-a55-5g-103.png', url: 'https://resim.epey.com/917434/z_samsung-galaxy-a55-1.jpg' },
    { target: 'samsung-samsung-galaxy-a35-5g-102.png', url: 'https://resim.epey.com/917882/z_samsung-galaxy-a35-8.jpg' }
  ];

  for (const p of pairs) {
    const dest = path.join(epeyDir, p.target);
    const ok = await downloadFile(p.url, dest);
    console.log(p.target, '->', ok ? 'SUCCESS' : 'FAILED');
  }
})();
