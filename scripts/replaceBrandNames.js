const fs = require('fs');
const path = require('path');

const updates = [
  {
    file: 'src/lib/i18n/translations.ts',
    transform: (c) => c.replace(/appName:\s*'TechKıyas'/g, "appName: 'aceleEtme'")
  },
  {
    file: 'src/components/ai/AIAssistantModal.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/ai/AIReviewSummaryCard.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/PenguinMascot.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/layout/Logo.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/layout/LogoModal.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/layout/Navbar.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/layout/Footer.tsx',
    transform: (c) => c.replace(/AceleEtme/g, 'aceleEtme')
  },
  {
    file: 'src/app/gizlilik-politikasi/page.tsx',
    transform: (c) => c.replace(/AceleEtme/g, 'aceleEtme')
  },
  {
    file: 'src/app/kullanim-kosullari/page.tsx',
    transform: (c) => c.replace(/AceleEtme/g, 'aceleEtme')
  },
  {
    file: 'src/app/yasal-uyari/page.tsx',
    transform: (c) => c.replace(/AceleEtme/g, 'aceleEtme')
  },
  {
    file: 'src/app/page.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/ads/DigitalLedBillboardScreen.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/ads/TechKiyasCornerBillboard.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/components/ads/ThreeBillboardViewer.tsx',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/lib/adminData.ts',
    transform: (c) => c.replace(/TechKiyas_Urun_Yedegi_/g, 'aceleEtme_Urun_Yedegi_')
  },
  {
    file: 'src/lib/databaseSchema.ts',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/lib/validator.ts',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'src/app/api/health/route.ts',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme')
  },
  {
    file: 'README_PRICE_AGGREGATION.md',
    transform: (c) => c.replace(/TechKıyas/g, 'aceleEtme').replace(/techkiyas/g, 'aceleetme')
  }
];

const report = [];

for (const u of updates) {
  const filePath = path.join(process.cwd(), u.file);
  if (fs.existsSync(filePath)) {
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = u.transform(original);
    if (original !== updated) {
      fs.writeFileSync(filePath, updated, 'utf8');
      report.push(u.file);
      console.log('Successfully updated:', u.file);
    } else {
      console.log('No change needed for:', u.file);
    }
  } else {
    console.log('File not found:', u.file);
  }
}

console.log(`\nUpdated ${report.length} files successfully.`);
