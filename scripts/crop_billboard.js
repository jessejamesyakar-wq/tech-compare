const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const imgBase64 = fs.readFileSync('C:/Users/Alpdeniz/.gemini/antigravity/brain/d69e9d07-5e8b-4923-abb4-95cea53766b5/.user_uploaded/media_1787785415098.png').toString('base64');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:transparent;">
      <img id="srcImg" src="data:image/png;base64,${imgBase64}" />
      <canvas id="c"></canvas>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  
  const cropData = await page.evaluate(() => {
    const img = document.getElementById('srcImg');
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    
    // In media_1787785415098.png:
    // Crop only the 3D billboard (left ~76.5% width)
    const cropW = Math.round(img.naturalWidth * 0.765);
    const cropH = img.naturalHeight;
    
    canvas.width = cropW;
    canvas.height = cropH;
    
    ctx.drawImage(img, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      cropW,
      cropH,
      dataUrl: canvas.toDataURL('image/png')
    };
  });
  
  console.log('Original size:', cropData.width, cropData.height, 'Cropped:', cropData.cropW, cropData.cropH);
  
  const base64Data = cropData.dataUrl.replace(/^data:image\/png;base64,/, '');
  fs.mkdirSync('public/images/ads', { recursive: true });
  fs.writeFileSync('public/images/ads/spotify-corner-billboard-only.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved to public/images/ads/spotify-corner-billboard-only.png successfully!');
  
  await browser.close();
})();
