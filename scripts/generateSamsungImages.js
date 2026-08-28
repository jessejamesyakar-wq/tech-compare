const fs = require('fs');
const path = require('path');

function generatePhoneSvg(modelName, colorHex, frameColorHex, cameraType, isFoldable) {
  if (isFoldable === 'flip') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorHex}"/>
          <stop offset="100%" stop-color="${frameColorHex}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <rect x="115" y="65" width="170" height="370" rx="28" fill="#000000" opacity="0.08"/>
      <rect x="110" y="60" width="180" height="380" rx="26" fill="url(#bodyGrad)" stroke="${frameColorHex}" stroke-width="4"/>
      <line x1="110" y1="250" x2="290" y2="250" stroke="#334155" stroke-width="2" opacity="0.4"/>
      <rect x="125" y="75" width="150" height="155" rx="16" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <circle cx="155" cy="105" r="14" fill="#0f172a" stroke="#64748b" stroke-width="2.5"/>
      <circle cx="155" cy="105" r="8" fill="#1e293b"/>
      <circle cx="155" cy="105" r="3" fill="#38bdf8"/>
      <circle cx="195" cy="105" r="14" fill="#0f172a" stroke="#64748b" stroke-width="2.5"/>
      <circle cx="195" cy="105" r="8" fill="#1e293b"/>
      <circle cx="195" cy="105" r="3" fill="#38bdf8"/>
      <circle cx="235" cy="105" r="5" fill="#fef08a"/>
      <text x="200" y="180" font-family="sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle">12:45</text>
      <text x="200" y="202" font-family="sans-serif" font-size="10" font-weight="700" fill="#94a3b8" text-anchor="middle">Galaxy AI</text>
      <text x="200" y="410" font-family="sans-serif" font-size="12" font-weight="900" fill="#ffffff" opacity="0.7" text-anchor="middle" letter-spacing="2">SAMSUNG</text>
    </svg>`;
  }

  if (cameraType === 'ultra') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorHex}"/>
          <stop offset="100%" stop-color="${frameColorHex}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="#f8fafc"/>
      <rect x="105" y="45" width="190" height="410" rx="14" fill="#000000" opacity="0.08"/>
      <rect x="100" y="40" width="200" height="420" rx="12" fill="url(#bodyGrad)" stroke="${frameColorHex}" stroke-width="4"/>
      <rect x="102" y="42" width="196" height="416" rx="10" fill="none" stroke="#cbd5e1" stroke-width="1.5" opacity="0.6"/>
      <circle cx="140" cy="95" r="18" fill="#0f172a" stroke="#94a3b8" stroke-width="3"/>
      <circle cx="140" cy="95" r="11" fill="#1e293b"/>
      <circle cx="140" cy="95" r="4" fill="#38bdf8"/>
      <circle cx="140" cy="150" r="18" fill="#0f172a" stroke="#94a3b8" stroke-width="3"/>
      <circle cx="140" cy="150" r="11" fill="#1e293b"/>
      <circle cx="140" cy="150" r="4" fill="#38bdf8"/>
      <circle cx="140" cy="205" r="18" fill="#0f172a" stroke="#94a3b8" stroke-width="3"/>
      <circle cx="140" cy="205" r="11" fill="#1e293b"/>
      <circle cx="140" cy="205" r="4" fill="#38bdf8"/>
      <circle cx="180" cy="95" r="10" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="180" cy="95" r="4" fill="#ef4444"/>
      <circle cx="180" cy="130" r="6" fill="#fef08a" stroke="#e2e8f0" stroke-width="1.5"/>
      <circle cx="180" cy="170" r="14" fill="#0f172a" stroke="#94a3b8" stroke-width="2.5"/>
      <circle cx="180" cy="170" r="8" fill="#1e293b"/>
      <text x="200" y="425" font-family="sans-serif" font-size="13" font-weight="900" fill="#ffffff" opacity="0.8" text-anchor="middle" letter-spacing="3">SAMSUNG</text>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorHex}"/>
        <stop offset="100%" stop-color="${frameColorHex}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#f8fafc"/>
    <rect x="110" y="45" width="180" height="410" rx="28" fill="#000000" opacity="0.08"/>
    <rect x="105" y="40" width="190" height="420" rx="26" fill="url(#bodyGrad)" stroke="${frameColorHex}" stroke-width="4"/>
    <circle cx="145" cy="95" r="17" fill="#0f172a" stroke="${frameColorHex}" stroke-width="3"/>
    <circle cx="145" cy="95" r="10" fill="#1e293b"/>
    <circle cx="145" cy="95" r="3.5" fill="#38bdf8"/>
    <circle cx="145" cy="145" r="17" fill="#0f172a" stroke="${frameColorHex}" stroke-width="3"/>
    <circle cx="145" cy="145" r="10" fill="#1e293b"/>
    <circle cx="145" cy="145" r="3.5" fill="#38bdf8"/>
    <circle cx="145" cy="195" r="17" fill="#0f172a" stroke="${frameColorHex}" stroke-width="3"/>
    <circle cx="145" cy="195" r="10" fill="#1e293b"/>
    <circle cx="145" cy="195" r="3.5" fill="#38bdf8"/>
    <circle cx="180" cy="120" r="6" fill="#fef08a" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="200" y="425" font-family="sans-serif" font-size="13" font-weight="900" fill="#ffffff" opacity="0.8" text-anchor="middle" letter-spacing="3">SAMSUNG</text>
  </svg>`;
}

const samsungModels = [
  { file: 'samsung-galaxy-s25-ultra.svg', color: '#475569', frame: '#1e293b', type: 'ultra' },
  { file: 'samsung-galaxy-s25-plus.svg', color: '#3b82f6', frame: '#1d4ed8', type: 'triple' },
  { file: 'samsung-galaxy-s25.svg', color: '#10b981', frame: '#047857', type: 'triple' },
  { file: 'samsung-galaxy-s25-fe.svg', color: '#06b6d4', frame: '#0e7490', type: 'triple' },
  { file: 'samsung-galaxy-s24-ultra.svg', color: '#64748b', frame: '#334155', type: 'ultra' },
  { file: 'samsung-galaxy-s24-plus.svg', color: '#8b5cf6', frame: '#6d28d9', type: 'triple' },
  { file: 'samsung-galaxy-s24.svg', color: '#f59e0b', frame: '#b45309', type: 'triple' },
  { file: 'samsung-galaxy-s24-fe.svg', color: '#14b8a6', frame: '#0f766e', type: 'triple' },
  { file: 'samsung-galaxy-z-fold6.svg', color: '#1e293b', frame: '#0f172a', type: 'ultra' },
  { file: 'samsung-galaxy-z-flip6.svg', color: '#ec4899', frame: '#be185d', isFoldable: 'flip' },
  { file: 'samsung-galaxy-s23-ultra.svg', color: '#0f766e', frame: '#115e59', type: 'ultra' },
  { file: 'samsung-galaxy-s23-plus.svg', color: '#e2e8f0', frame: '#94a3b8', type: 'triple' },
  { file: 'samsung-galaxy-s23.svg', color: '#fef08a', frame: '#ca8a04', type: 'triple' },
  { file: 'samsung-galaxy-s23-fe.svg', color: '#84cc16', frame: '#4d7c0f', type: 'triple' },
  { file: 'samsung-galaxy-a55-5g.svg', color: '#a855f7', frame: '#7e22ce', type: 'triple' },
  { file: 'samsung-galaxy-a35-5g.svg', color: '#38bdf8', frame: '#0284c7', type: 'triple' },
  { file: 'samsung-galaxy-a25-5g.svg', color: '#0284c7', frame: '#0369a1', type: 'triple' },
  { file: 'samsung-galaxy-a15.svg', color: '#334155', frame: '#1e293b', type: 'triple' },
  { file: 'samsung-galaxy-a05s.svg', color: '#22c55e', frame: '#15803d', type: 'triple' },
  { file: 'samsung-galaxy-a54-5g.svg', color: '#a3e635', frame: '#65a30d', type: 'triple' },
  { file: 'samsung-galaxy-a34-5g.svg', color: '#e879f9', frame: '#c026d3', type: 'triple' },
  { file: 'samsung-galaxy-s22-ultra.svg', color: '#881337', frame: '#4c0519', type: 'ultra' },
  { file: 'samsung-galaxy-s21-fe.svg', color: '#cbd5e1', frame: '#64748b', type: 'triple' },
  { file: 'samsung-galaxy-m55-5g.svg', color: '#059669', frame: '#065f46', type: 'triple' },
  { file: 'samsung-galaxy-m35-5g.svg', color: '#0284c7', frame: '#075985', type: 'triple' }
];

const targetDir = path.join(process.cwd(), 'public', 'images', 'phones', 'samsung');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

samsungModels.forEach((m) => {
  const content = generatePhoneSvg(m.file, m.color, m.frame, m.type, m.isFoldable);
  fs.writeFileSync(path.join(targetDir, m.file), content, 'utf8');
  console.log('Created distinct Samsung SVG image:', m.file);
});

// Also update smartphonesData.json to map all Samsung phones to their unique image paths
const jsonPath = path.join(process.cwd(), 'src', 'lib', 'smartphonesData.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const modelToImageMap = {
  's25 ultra': '/images/phones/samsung/samsung-galaxy-s25-ultra.svg',
  's25+': '/images/phones/samsung/samsung-galaxy-s25-plus.svg',
  's25 plus': '/images/phones/samsung/samsung-galaxy-s25-plus.svg',
  's25 fe': '/images/phones/samsung/samsung-galaxy-s25-fe.svg',
  's25': '/images/phones/samsung/samsung-galaxy-s25.svg',

  's24 ultra': '/images/phones/samsung/samsung-galaxy-s24-ultra.svg',
  's24+': '/images/phones/samsung/samsung-galaxy-s24-plus.svg',
  's24 plus': '/images/phones/samsung/samsung-galaxy-s24-plus.svg',
  's24 fe': '/images/phones/samsung/samsung-galaxy-s24-fe.svg',
  's24': '/images/phones/samsung/samsung-galaxy-s24.svg',

  'z fold 6': '/images/phones/samsung/samsung-galaxy-z-fold6.svg',
  'z fold6': '/images/phones/samsung/samsung-galaxy-z-fold6.svg',
  'z flip 6': '/images/phones/samsung/samsung-galaxy-z-flip6.svg',
  'z flip6': '/images/phones/samsung/samsung-galaxy-z-flip6.svg',

  's23 ultra': '/images/phones/samsung/samsung-galaxy-s23-ultra.svg',
  's23+': '/images/phones/samsung/samsung-galaxy-s23-plus.svg',
  's23 plus': '/images/phones/samsung/samsung-galaxy-s23-plus.svg',
  's23 fe': '/images/phones/samsung/samsung-galaxy-s23-fe.svg',
  's23': '/images/phones/samsung/samsung-galaxy-s23.svg',

  's22 ultra': '/images/phones/samsung/samsung-galaxy-s22-ultra.svg',
  's21 fe': '/images/phones/samsung/samsung-galaxy-s21-fe.svg',

  'a55': '/images/phones/samsung/samsung-galaxy-a55-5g.svg',
  'a35': '/images/phones/samsung/samsung-galaxy-a35-5g.svg',
  'a25': '/images/phones/samsung/samsung-galaxy-a25-5g.svg',
  'a15': '/images/phones/samsung/samsung-galaxy-a15.svg',
  'a05': '/images/phones/samsung/samsung-galaxy-a05s.svg',
  'a54': '/images/phones/samsung/samsung-galaxy-a54-5g.svg',
  'a34': '/images/phones/samsung/samsung-galaxy-a34-5g.svg',
  'm55': '/images/phones/samsung/samsung-galaxy-m55-5g.svg',
  'm35': '/images/phones/samsung/samsung-galaxy-m35-5g.svg'
};

let updatedCount = 0;
products.forEach((p) => {
  if (p.brand && p.brand.toLowerCase() === 'samsung') {
    const nameLow = p.name.toLowerCase();
    for (const [key, imgPath] of Object.entries(modelToImageMap)) {
      if (nameLow.includes(key)) {
        p.image = imgPath;
        p.images = [imgPath];
        updatedCount++;
        break;
      }
    }
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`Successfully mapped ${updatedCount} Samsung phones to unique distinct SVG assets.`);
