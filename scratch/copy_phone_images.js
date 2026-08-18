const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public/images/phones');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const artifactDir = 'C:\\Users\\Alpdeniz\\.gemini\\antigravity\\brain\\83f6f4a1-14e8-4df5-9406-dd8db58e32ee';
const files = fs.readdirSync(artifactDir);

files.forEach((file) => {
  if (file.startsWith('iphone_17_pro_render_') && file.endsWith('.jpg')) {
    const src = path.join(artifactDir, file);
    const dest = path.join(publicDir, 'iphone_17_pro.jpg');
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public/images/phones/iphone_17_pro.jpg`);
  }
  if (file.startsWith('iphone_air_render_') && file.endsWith('.jpg')) {
    const src = path.join(artifactDir, file);
    const dest = path.join(publicDir, 'iphone_air.jpg');
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public/images/phones/iphone_air.jpg`);
  }
});
