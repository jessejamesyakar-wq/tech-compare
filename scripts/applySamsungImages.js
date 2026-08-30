const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING APPROVED SAMSUNG GENUINE IMAGES ===\n');

const proposalPath = path.join(__dirname, '../data/samsung_image_proposal.json');
if (!fs.existsSync(proposalPath)) {
  console.error('❌ Proposal file not found:', proposalPath);
  process.exit(1);
}

const proposals = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
const map = new Map();
proposals.forEach(p => {
  if (p.proposedImage) {
    map.set(p.id, p.proposedImage);
  }
});

console.log(`Loaded ${map.size} approved Samsung image updates.`);

// Load smartphonesData.json
const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

let updatedCount = 0;
phones.forEach(p => {
  if (map.has(p.id)) {
    const newImg = map.get(p.id);
    p.image = newImg;
    p.images = [newImg];
    updatedCount++;
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`✅ Successfully updated ${updatedCount} Samsung phones with genuine official photos in src/lib/smartphonesData.json!`);

// Log to CHANGELOG_DATA.md
logDataChange({
  title: `Applied ${updatedCount} Genuine Manufacturer Samsung Smartphone Images`,
  files: ['src/lib/smartphonesData.json'],
  description: `Replaced temporary SVG vector illustrations with exact model-specific manufacturer product photos for ${updatedCount} Samsung phones (Galaxy S24/S23/S22 series, Z Fold/Flip 6, A35/A55 5G, etc.).`,
  rationale: 'User explicitly approved genuine Samsung phone images replacement proposal.'
});
