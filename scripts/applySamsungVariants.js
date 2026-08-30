const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING APPROVED SAMSUNG MULTI-COLOR VARIANTS ===\n');

const proposalPath = path.join(__dirname, '../data/samsung_variants_proposal.json');
if (!fs.existsSync(proposalPath)) {
  console.error('❌ Proposal file not found:', proposalPath);
  process.exit(1);
}

const proposals = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
const map = new Map();
proposals.forEach(p => map.set(p.id, p.variants));

console.log(`Loaded ${map.size} approved Samsung multi-color models.`);

// Load smartphonesData.json
const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

let updatedCount = 0;
phones.forEach(p => {
  if (map.has(p.id)) {
    const variants = map.get(p.id);
    p.variants = variants;
    // Also sync images array to include all variant images
    const variantImages = variants.map(v => v.image).filter(Boolean);
    p.images = Array.from(new Set([p.image, ...variantImages])).filter(Boolean);
    updatedCount++;
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`✅ Successfully updated ${updatedCount} Samsung models with rich multi-color variants in src/lib/smartphonesData.json!`);

// Log to CHANGELOG_DATA.md
logDataChange({
  title: `Applied Multi-Color Variants & Images to ${updatedCount} Samsung Flagship Models`,
  files: ['src/lib/smartphonesData.json'],
  description: `Added structured ProductVariant arrays with distinct manufacturer color photos (Titanium Black, Gray, Violet, Yellow, Cream, Green, Mint, etc.) for ${updatedCount} models (Galaxy S24 Ultra, S24+, S24, S23 Ultra, Z Fold 6, Z Flip 6, A55 5G).`,
  rationale: 'User explicitly approved Samsung multi-color variants proposal.'
});
