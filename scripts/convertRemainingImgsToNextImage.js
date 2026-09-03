const fs = require('fs');
const path = require('path');

console.log('Converting all remaining <img> tags to Next.js <Image> with explicit dimensions...');

// 1. src/app/alerts/page.tsx
const alertsPath = path.join(process.cwd(), 'src/app/alerts/page.tsx');
if (fs.existsSync(alertsPath)) {
  let code = fs.readFileSync(alertsPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{alert\.productImage\}\s+alt=\{alert\.productName\}\s+className="h-full object-contain"\s*\/>/g,
    `<Image src={alert.productImage} alt={alert.productName} width={64} height={64} className="h-full w-auto object-contain" />`
  );
  fs.writeFileSync(alertsPath, code, 'utf8');
}

// 2. src/app/compare/page.tsx
const comparePath = path.join(process.cwd(), 'src/app/compare/page.tsx');
if (fs.existsSync(comparePath)) {
  let code = fs.readFileSync(comparePath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{product\.image\}\s+alt=\{product\.name\}\s+className="h-full object-contain"\s*\/>/g,
    `<Image src={product.image} alt={product.name} width={180} height={180} className="h-full w-auto object-contain" />`
  );
  fs.writeFileSync(comparePath, code, 'utf8');
}

// 3. src/components/compare/CompareMatrix.tsx
const compareMatrixPath = path.join(process.cwd(), 'src/components/compare/CompareMatrix.tsx');
if (fs.existsSync(compareMatrixPath)) {
  let code = fs.readFileSync(compareMatrixPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{product\.image\}\s+alt=\{product\.name\}\s+className="h-full object-contain"\s*\/>/g,
    `<Image src={product.image} alt={product.name} width={160} height={160} className="h-full w-auto object-contain" />`
  );
  fs.writeFileSync(compareMatrixPath, code, 'utf8');
}

// 4. src/components/detail/StickyHeaderBar.tsx
const stickyHeaderPath = path.join(process.cwd(), 'src/components/detail/StickyHeaderBar.tsx');
if (fs.existsSync(stickyHeaderPath)) {
  let code = fs.readFileSync(stickyHeaderPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{phone\.image\}\s+alt=\{phone\.name\}\s+className="h-full object-contain"\s*\/>/g,
    `<Image src={phone.image} alt={phone.name} width={40} height={40} className="h-full w-auto object-contain" />`
  );
  fs.writeFileSync(stickyHeaderPath, code, 'utf8');
}

// 5. src/components/layout/CompareBar.tsx
const compareBarPath = path.join(process.cwd(), 'src/components/layout/CompareBar.tsx');
if (fs.existsSync(compareBarPath)) {
  let code = fs.readFileSync(compareBarPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{phone\.image\}\s+alt=\{phone\.name\}\s+className="w-full h-full object-contain"\s*\/>/g,
    `<Image src={phone.image} alt={phone.name} width={48} height={48} className="w-full h-full object-contain" />`
  );
  fs.writeFileSync(compareBarPath, code, 'utf8');
}

// 6. src/components/layout/Footer.tsx
const footerPath = path.join(process.cwd(), 'src/components/layout/Footer.tsx');
if (fs.existsSync(footerPath)) {
  let code = fs.readFileSync(footerPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src="\/emblem\.png"\s+alt="aceleEtme"\s+className="w-full h-full object-contain"\s*\/>/g,
    `<Image src="/emblem.png" alt="aceleEtme" width={32} height={32} className="w-full h-full object-contain" />`
  );
  fs.writeFileSync(footerPath, code, 'utf8');
}

// 7. src/components/catalog/PhoneCard.tsx
const phoneCardPath = path.join(process.cwd(), 'src/components/catalog/PhoneCard.tsx');
if (fs.existsSync(phoneCardPath)) {
  let code = fs.readFileSync(phoneCardPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+loading="lazy"\s+onError=\{([^}]+)\}\s+className="([^"]*)"\s*\/>/g,
    `<Image src={$1} alt={$2} width={240} height={240} loading="lazy" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px" onError={$3} className="$4" />`
  );
  fs.writeFileSync(phoneCardPath, code, 'utf8');
}

// 8. src/components/promo/HeroCarousel.tsx
const heroCarouselPath = path.join(process.cwd(), 'src/components/promo/HeroCarousel.tsx');
if (fs.existsSync(heroCarouselPath)) {
  let code = fs.readFileSync(heroCarouselPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+className="([^"]*)"\s*\/>/g,
    `<Image src={$1} alt={$2} width={480} height={480} priority={true} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 480px" className="$3" />`
  );
  fs.writeFileSync(heroCarouselPath, code, 'utf8');
}

// 9. src/components/promo/HeroThumbnailStrip.tsx
const heroThumbPath = path.join(process.cwd(), 'src/components/promo/HeroThumbnailStrip.tsx');
if (fs.existsSync(heroThumbPath)) {
  let code = fs.readFileSync(heroThumbPath, 'utf8');
  if (!code.includes("import Image from 'next/image';")) {
    code = "import Image from 'next/image';\n" + code;
  }
  code = code.replace(
    /<img\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+className="([^"]*)"\s*\/>/g,
    `<Image src={$1} alt={$2} width={64} height={64} loading="lazy" className="$3" />`
  );
  fs.writeFileSync(heroThumbPath, code, 'utf8');
}

console.log('✅ Converted remaining <img> tags to optimized Next.js <Image> components!');
