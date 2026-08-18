const fs = require('fs');
const path = require('path');

const publicTvDir = path.join(__dirname, '../public/images/tvs');
if (!fs.existsSync(publicTvDir)) {
  fs.mkdirSync(publicTvDir, { recursive: true });
}

const brainDir = 'C:/Users/Alpdeniz/.gemini/antigravity/brain/83f6f4a1-14e8-4df5-9406-dd8db58e32ee';

const imagesToCopy = [
  { src: 'qd_oled_tv_mockup_1786733391805.jpg', dest: 'qd_oled.jpg' },
  { src: 'neo_qled_tv_mockup_1786733407589.jpg', dest: 'neo_qled.jpg' },
  { src: 'lg_oled_tv_mockup_1786733421839.jpg', dest: 'lg_oled.jpg' },
  { src: 'micro_rgb_tv_mockup_1786733439446.jpg', dest: 'micro_rgb.jpg' }
];

imagesToCopy.forEach(item => {
  const srcPath = path.join(brainDir, item.src);
  const destPath = path.join(publicTvDir, item.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${item.src} -> public/images/tvs/${item.dest}`);
  } else {
    console.error(`Source not found: ${srcPath}`);
  }
});
