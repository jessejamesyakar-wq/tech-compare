const fs = require('fs');
const path = require('path');

// Enhanced realistic SVG generator with glass reflections, authentic bezel, camera lenses, and Samsung styling
function generateRealisticSamsungSvg(config) {
  const { name, bodyColor, frameColor, cameraType, accentColor, isFoldable } = config;

  if (isFoldable === 'flip') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
      <defs>
        <linearGradient id="bodyGrad_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bodyColor}"/>
          <stop offset="50%" stop-color="${frameColor}"/>
          <stop offset="100%" stop-color="${bodyColor}"/>
        </linearGradient>
        <linearGradient id="glassSheen_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
          <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <filter id="dropShadow_${name}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.12"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="110" y="50" width="180" height="400" rx="28" fill="url(#bodyGrad_${name})" stroke="${frameColor}" stroke-width="3" filter="url(#dropShadow_${name})"/>
      <rect x="108" y="248" width="184" height="5" rx="2" fill="${frameColor}" opacity="0.9"/>
      <line x1="110" y1="250" x2="290" y2="250" stroke="#ffffff" stroke-width="1" opacity="0.4"/>
      
      <rect x="122" y="65" width="156" height="165" rx="20" fill="#090d16" stroke="${frameColor}" stroke-width="2"/>
      <circle cx="200" cy="150" r="60" fill="${accentColor}" opacity="0.2"/>
      
      <g transform="translate(132, 75)">
        <circle cx="20" cy="20" r="16" fill="#090d16" stroke="${frameColor}" stroke-width="3"/>
        <circle cx="20" cy="20" r="10" fill="#1e293b"/>
        <circle cx="20" cy="20" r="4" fill="#38bdf8"/>
        <circle cx="18" cy="18" r="1.5" fill="#ffffff" opacity="0.8"/>

        <circle cx="60" cy="20" r="16" fill="#090d16" stroke="${frameColor}" stroke-width="3"/>
        <circle cx="60" cy="20" r="10" fill="#1e293b"/>
        <circle cx="60" cy="20" r="4" fill="#38bdf8"/>
        <circle cx="58" cy="18" r="1.5" fill="#ffffff" opacity="0.8"/>

        <circle cx="96" cy="20" r="6" fill="#fef08a" stroke="#94a3b8" stroke-width="1.5"/>
      </g>
      
      <text x="200" y="165" font-family="sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">12:45</text>
      <text x="200" y="190" font-family="sans-serif" font-size="11" font-weight="800" fill="${accentColor}" text-anchor="middle">Galaxy AI</text>
      
      <text x="200" y="410" font-family="sans-serif" font-size="13" font-weight="900" fill="#ffffff" opacity="0.85" text-anchor="middle" letter-spacing="3">SAMSUNG</text>
      <rect x="110" y="50" width="180" height="400" rx="28" fill="url(#glassSheen_${name})" pointer-events="none"/>
    </svg>`;
  }

  if (cameraType === 'ultra') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
      <defs>
        <linearGradient id="bodyGrad_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bodyColor}"/>
          <stop offset="60%" stop-color="${frameColor}"/>
          <stop offset="100%" stop-color="${bodyColor}"/>
        </linearGradient>
        <linearGradient id="glassSheen_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
          <stop offset="35%" stop-color="#ffffff" stop-opacity="0.05"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <filter id="dropShadow_${name}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#ffffff"/>
      <rect x="95" y="35" width="210" height="440" rx="14" fill="url(#bodyGrad_${name})" stroke="${frameColor}" stroke-width="4" filter="url(#dropShadow_${name})"/>
      <rect x="98" y="38" width="204" height="434" rx="12" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.25"/>

      <g transform="translate(110, 55)">
        <circle cx="28" cy="30" r="20" fill="#090d16" stroke="${frameColor}" stroke-width="3.5"/>
        <circle cx="28" cy="30" r="13" fill="#1e293b"/>
        <circle cx="28" cy="30" r="5" fill="#0284c7"/>
        <circle cx="25" cy="27" r="2" fill="#ffffff" opacity="0.8"/>

        <circle cx="28" cy="85" r="20" fill="#090d16" stroke="${frameColor}" stroke-width="3.5"/>
        <circle cx="28" cy="85" r="13" fill="#1e293b"/>
        <circle cx="28" cy="85" r="5" fill="#0284c7"/>
        <circle cx="25" cy="82" r="2" fill="#ffffff" opacity="0.8"/>

        <circle cx="28" cy="140" r="20" fill="#090d16" stroke="${frameColor}" stroke-width="3.5"/>
        <rect x="18" y="130" width="20" height="20" rx="4" fill="#1e293b"/>
        <circle cx="28" cy="140" r="5" fill="#38bdf8"/>
        <circle cx="25" cy="137" r="2" fill="#ffffff" opacity="0.8"/>

        <circle cx="72" cy="30" r="12" fill="#090d16" stroke="${frameColor}" stroke-width="2.5"/>
        <circle cx="72" cy="30" r="5" fill="#ef4444"/>

        <circle cx="72" cy="65" r="7" fill="#fef08a" stroke="#cbd5e1" stroke-width="2"/>

        <circle cx="72" cy="105" r="15" fill="#090d16" stroke="${frameColor}" stroke-width="3"/>
        <circle cx="72" cy="105" r="9" fill="#1e293b"/>
        <circle cx="72" cy="105" r="3.5" fill="#0284c7"/>
        <circle cx="70" cy="103" r="1.5" fill="#ffffff" opacity="0.8"/>
      </g>

      <rect x="108" y="460" width="18" height="6" rx="2" fill="${frameColor}" stroke="#ffffff" stroke-width="0.8" opacity="0.9"/>
      <text x="200" y="440" font-family="sans-serif" font-size="14" font-weight="900" fill="#ffffff" opacity="0.85" text-anchor="middle" letter-spacing="3.5">SAMSUNG</text>
      <rect x="95" y="35" width="210" height="440" rx="14" fill="url(#glassSheen_${name})" pointer-events="none"/>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
    <defs>
      <linearGradient id="bodyGrad_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bodyColor}"/>
        <stop offset="50%" stop-color="${frameColor}"/>
        <stop offset="100%" stop-color="${bodyColor}"/>
      </linearGradient>
      <linearGradient id="glassSheen_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="35%" stop-color="#ffffff" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <filter id="dropShadow_${name}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="#ffffff"/>
    <rect x="100" y="35" width="200" height="440" rx="30" fill="url(#bodyGrad_${name})" stroke="${frameColor}" stroke-width="4" filter="url(#dropShadow_${name})"/>
    <rect x="103" y="38" width="194" height="434" rx="27" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.35"/>

    <g transform="translate(118, 55)">
      <circle cx="24" cy="28" r="18" fill="#090d16" stroke="${frameColor}" stroke-width="3.5"/>
      <circle cx="24" cy="28" r="11" fill="#1e293b"/>
      <circle cx="24" cy="28" r="4" fill="#38bdf8"/>
      <circle cx="22" cy="26" r="1.5" fill="#ffffff" opacity="0.8"/>

      <circle cx="24" cy="80" r="18" fill="#090d16" stroke="${frameColor}" stroke-width="3.5"/>
      <circle cx="24" cy="80" r="11" fill="#1e293b"/>
      <circle cx="24" cy="80" r="4" fill="#38bdf8"/>
      <circle cx="22" cy="78" r="1.5" fill="#ffffff" opacity="0.8"/>

      <circle cx="24" cy="132" r="18" fill="#090d16" stroke="${frameColor}" stroke-width="3.5"/>
      <circle cx="24" cy="132" r="11" fill="#1e293b"/>
      <circle cx="24" cy="132" r="4" fill="#38bdf8"/>
      <circle cx="22" cy="130" r="1.5" fill="#ffffff" opacity="0.8"/>

      <circle cx="62" cy="54" r="6.5" fill="#fef08a" stroke="#cbd5e1" stroke-width="2"/>
    </g>

    <text x="200" y="440" font-family="sans-serif" font-size="14" font-weight="900" fill="#ffffff" opacity="0.85" text-anchor="middle" letter-spacing="3.5">SAMSUNG</text>
    <rect x="100" y="35" width="200" height="440" rx="30" fill="url(#glassSheen_${name})" pointer-events="none"/>
  </svg>`;
}

const samsungCatalog = [
  // S25 Series
  { file: 'samsung-galaxy-s25-ultra.svg', name: 's25_ultra', bodyColor: '#4d5d6e', frameColor: '#2b3642', cameraType: 'ultra', accentColor: '#38bdf8', colors: [{ name: 'Titanyum Gümüş Mavi', hex: '#4D5D6E' }, { name: 'Titanyum Siyah', hex: '#1C1C1E' }, { name: 'Titanyum Gri', hex: '#8E8E93' }] },
  { file: 'samsung-galaxy-s25-plus.svg', name: 's25_plus', bodyColor: '#5c7891', frameColor: '#384d61', cameraType: 'triple', accentColor: '#60a5fa', colors: [{ name: 'Parlak Mavi', hex: '#5C7891' }, { name: 'Geceyarısı Siyahı', hex: '#18191B' }, { name: 'Gümüş Gölge', hex: '#B8B9BD' }] },
  { file: 'samsung-galaxy-s25.svg', name: 's25', bodyColor: '#2e7d62', frameColor: '#174737', cameraType: 'triple', accentColor: '#34d399', colors: [{ name: 'Zümrüt Yeşili', hex: '#2E7D62' }, { name: 'Işıltılı Mavi', hex: '#4A6B82' }, { name: 'Ay Işığı Beyazı', hex: '#F0EFF4' }] },
  { file: 'samsung-galaxy-s25-fe.svg', name: 's25_fe', bodyColor: '#2596be', frameColor: '#145c75', cameraType: 'triple', accentColor: '#22d3ee', colors: [{ name: 'Buz Mavisi', hex: '#2596BE' }, { name: 'Nane Yeşili', hex: '#4ADE80' }, { name: 'Grafit', hex: '#334155' }] },

  // S24 Series
  { file: 'samsung-galaxy-s24-ultra.svg', name: 's24_ultra', bodyColor: '#77726b', frameColor: '#47433e', cameraType: 'ultra', accentColor: '#fbbf24', colors: [{ name: 'Titanyum Gri', hex: '#77726B' }, { name: 'Titanyum Siyah', hex: '#2B2A29' }, { name: 'Titanyum Menekşe', hex: '#454256' }, { name: 'Titanyum Sarı', hex: '#E5DDCB' }] },
  { file: 'samsung-galaxy-s24-plus.svg', name: 's24_plus', bodyColor: '#45405e', frameColor: '#2a263d', cameraType: 'triple', accentColor: '#c084fc', colors: [{ name: 'Kobalt Menekşe', hex: '#45405E' }, { name: 'Oniks Siyahı', hex: '#222126' }, { name: 'Mermer Gri', hex: '#D6D5D8' }, { name: 'Amber Sarı', hex: '#F3E2B6' }] },
  { file: 'samsung-galaxy-s24.svg', name: 's24', bodyColor: '#e0caa0', frameColor: '#96815a', cameraType: 'triple', accentColor: '#f59e0b', colors: [{ name: 'Amber Sarısı', hex: '#E0CAA0' }, { name: 'Kobalt Menekşe', hex: '#39354F' }, { name: 'Oniks Siyahı', hex: '#222126' }] },
  { file: 'samsung-galaxy-s24-fe.svg', name: 's24_fe', bodyColor: '#8da8be', frameColor: '#546f85', cameraType: 'triple', accentColor: '#38bdf8', colors: [{ name: 'Mavi', hex: '#8DA8BE' }, { name: 'Nane', hex: '#BEE0D0' }, { name: 'Grafit', hex: '#313338' }, { name: 'Sarı', hex: '#F4E8C1' }] },

  // Foldables
  { file: 'samsung-galaxy-z-fold6.svg', name: 'z_fold6', bodyColor: '#2d3b4e', frameColor: '#192330', cameraType: 'ultra', accentColor: '#60a5fa', colors: [{ name: 'Lacivert', hex: '#2D3B4E' }, { name: 'Gümüş Gölge', hex: '#9FA2A6' }, { name: 'Pembe', hex: '#E8CED0' }] },
  { file: 'samsung-galaxy-z-flip6.svg', name: 'z_flip6', bodyColor: '#88bba4', frameColor: '#4e7e69', isFoldable: 'flip', accentColor: '#a7f3d0', colors: [{ name: 'Nane Yeşili', hex: '#88BBA4' }, { name: 'Mavi', hex: '#7398B3' }, { name: 'Sarı', hex: '#E9DB9A' }, { name: 'Gümüş Gölge', hex: '#9FA2A6' }] },

  // S23 Series
  { file: 'samsung-galaxy-s23-ultra.svg', name: 's23_ultra', bodyColor: '#394d43', frameColor: '#202e27', cameraType: 'ultra', accentColor: '#4ade80', colors: [{ name: 'Botanik Yeşil', hex: '#394D43' }, { name: 'Fantom Siyahı', hex: '#1F2022' }, { name: 'Krem', hex: '#F3EFE0' }, { name: 'Lavanta', hex: '#C8BDD2' }] },
  { file: 'samsung-galaxy-s23-plus.svg', name: 's23_plus', bodyColor: '#d6cbbe', frameColor: '#877c70', cameraType: 'triple', accentColor: '#fbbf24', colors: [{ name: 'Krem', hex: '#D6CBBE' }, { name: 'Fantom Siyahı', hex: '#1F2022' }, { name: 'Yeşil', hex: '#3B4E43' }] },
  { file: 'samsung-galaxy-s23.svg', name: 's23', bodyColor: '#bfa7cc', frameColor: '#735c80', cameraType: 'triple', accentColor: '#e879f9', colors: [{ name: 'Lavanta', hex: '#BFA7CC' }, { name: 'Krem', hex: '#F3EFE0' }, { name: 'Fantom Siyahı', hex: '#1F2022' }] },
  { file: 'samsung-galaxy-s23-fe.svg', name: 's23_fe', bodyColor: '#7ba991', frameColor: '#426854', cameraType: 'triple', accentColor: '#34d399', colors: [{ name: 'Nane', hex: '#7BA991' }, { name: 'Mor', hex: '#6C5B7B' }, { name: 'Grafit', hex: '#303237' }] },

  // S22 Series
  { file: 'samsung-galaxy-s22-ultra.svg', name: 's22_ultra', bodyColor: '#582b35', frameColor: '#33131a', cameraType: 'ultra', accentColor: '#fb7185', colors: [{ name: 'Bordo', hex: '#582B35' }, { name: 'Yeşil', hex: '#283832' }, { name: 'Fantom Siyah', hex: '#1B1C1E' }] },
  { file: 'samsung-galaxy-s21-fe.svg', name: 's21_fe', bodyColor: '#68705c', frameColor: '#3d4434', cameraType: 'triple', accentColor: '#a3e635', colors: [{ name: 'Zeytin Yeşili', hex: '#68705C' }, { name: 'Lavanta', hex: '#B8ADC9' }, { name: 'Grafit', hex: '#313338' }] },

  // A Series
  { file: 'samsung-galaxy-a55-5g.svg', name: 'a55', bodyColor: '#9ec4db', frameColor: '#5c849e', cameraType: 'triple', accentColor: '#38bdf8', colors: [{ name: 'Harika Buz Mavisi', hex: '#9EC4DB' }, { name: 'Harika Lacivert', hex: '#1F2837' }, { name: 'Harika Leylak', hex: '#CDC2DF' }, { name: 'Harika Limon', hex: '#F6E9B2' }] },
  { file: 'samsung-galaxy-a35-5g.svg', name: 'a35', bodyColor: '#e5d38a', frameColor: '#9c8d4f', cameraType: 'triple', accentColor: '#facc15', colors: [{ name: 'Harika Limon Sarısı', hex: '#E5D38A' }, { name: 'Harika Buz Mavisi', hex: '#C2DDF2' }, { name: 'Harika Lacivert', hex: '#202636' }] },
  { file: 'samsung-galaxy-a25-5g.svg', name: 'a25', bodyColor: '#1d2738', frameColor: '#0e141f', cameraType: 'triple', accentColor: '#60a5fa', colors: [{ name: 'Koyu Mavi Siyah', hex: '#1D2738' }, { name: 'Açık Mavi', hex: '#A9CCE3' }, { name: 'Sarı', hex: '#E8DC98' }] },
  { file: 'samsung-galaxy-a15.svg', name: 'a15', bodyColor: '#8fb4cc', frameColor: '#4e748c', cameraType: 'triple', accentColor: '#38bdf8', colors: [{ name: 'Açık Mavi', hex: '#8FB4CC' }, { name: 'Mavi Siyah', hex: '#171B26' }, { name: 'Sarı', hex: '#F0E5A8' }] },
  { file: 'samsung-galaxy-a05s.svg', name: 'a05s', bodyColor: '#282b33', frameColor: '#14161a', cameraType: 'triple', accentColor: '#94a3b8', colors: [{ name: 'Siyah', hex: '#282B33' }, { name: 'Gümüş', hex: '#D6D8DC' }, { name: 'Açık Yeşil', hex: '#A8C5B5' }] },
  { file: 'samsung-galaxy-a54-5g.svg', name: 'a54', bodyColor: '#b3d448', frameColor: '#708a20', cameraType: 'triple', accentColor: '#a3e635', colors: [{ name: 'Harika Limon Yeşili', hex: '#B3D448' }, { name: 'Harika Menekşe', hex: '#B99EE0' }, { name: 'Harika Grafit', hex: '#2B2C30' }] },
  { file: 'samsung-galaxy-a34-5g.svg', name: 'a34', bodyColor: '#b89fe0', frameColor: '#6d5594', cameraType: 'triple', accentColor: '#c084fc', colors: [{ name: 'Harika Menekşe', hex: '#B89FE0' }, { name: 'Harika Gümüş', hex: '#D7DBE2' }, { name: 'Harika Grafit', hex: '#2D2E33' }] },

  // M Series
  { file: 'samsung-galaxy-m55-5g.svg', name: 'm55', bodyColor: '#7ebca0', frameColor: '#41755e', cameraType: 'triple', accentColor: '#34d399', colors: [{ name: 'Açık Yeşil', hex: '#7EBCA0' }, { name: 'Koyu Mavi', hex: '#1E2C44' }] },
  { file: 'samsung-galaxy-m35-5g.svg', name: 'm35', bodyColor: '#1e2c40', frameColor: '#0f1724', cameraType: 'triple', accentColor: '#38bdf8', colors: [{ name: 'Koyu Lacivert', hex: '#1E2C40' }, { name: 'Açık Mavi', hex: '#7E9FB8' }, { name: 'Gri', hex: '#8C9199' }] }
];

const targetDir = path.join(process.cwd(), 'public', 'images', 'phones', 'samsung');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

samsungCatalog.forEach((item) => {
  const content = generateRealisticSamsungSvg(item);
  fs.writeFileSync(path.join(targetDir, item.file), content, 'utf8');
  console.log('Rendered authentic colored SVG:', item.file, 'Primary:', item.bodyColor);
});

// Update smartphonesData.json colorOptions for each Samsung model
const jsonPath = path.join(process.cwd(), 'src', 'lib', 'smartphonesData.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

products.forEach((p) => {
  if (p.brand && p.brand.toLowerCase() === 'samsung') {
    const nameLow = p.name.toLowerCase();
    for (const item of samsungCatalog) {
      if (p.image && p.image.includes(item.file.replace('.svg', ''))) {
        p.colorOptions = item.colors;
        break;
      }
    }
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
console.log('All Samsung models updated with official distinct colorways and multi-color options!');
