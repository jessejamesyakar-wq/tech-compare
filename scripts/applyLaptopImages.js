const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING APPROVED GENUINE LAPTOP IMAGES ===\n');

const proposalPath = path.join(__dirname, '../data/laptop_image_proposal.json');
if (!fs.existsSync(proposalPath)) {
  console.error('❌ Proposal file not found:', proposalPath);
  process.exit(1);
}

const proposalData = JSON.parse(fs.readFileSync(proposalPath, 'utf8'));
const proposals = proposalData.proposals || [];

console.log(`Loaded ${proposals.length} approved laptop image updates.`);

// Map proposals by ID
const map = new Map();
proposals.forEach(p => map.set(p.id, p.proposedImage));

// Load mockLaptops.ts
const laptopsPath = path.join(__dirname, '../src/lib/mockLaptops.ts');
const content = fs.readFileSync(laptopsPath, 'utf8');
const match = content.match(/export\s+const\s+mockLaptops\s*:\s*(?:Product\[\]|LaptopProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
if (!match) {
  console.error('❌ Could not find exported mockLaptops array');
  process.exit(1);
}

const laptops = JSON.parse(match[1]);
let updatedCount = 0;

laptops.forEach(p => {
  if (map.has(p.id)) {
    const newImg = map.get(p.id);
    p.image = newImg;
    p.images = [newImg];
    updatedCount++;
  }
});

const newContent = content.replace(match[1], JSON.stringify(laptops, null, 2));
fs.writeFileSync(laptopsPath, newContent, 'utf8');

console.log(`✅ Successfully updated ${updatedCount} laptops with genuine official photos in src/lib/mockLaptops.ts!`);

// Log to CHANGELOG_DATA.md
logDataChange({
  title: `Applied ${updatedCount} Genuine Manufacturer Laptop Images`,
  files: ['src/lib/mockLaptops.ts'],
  description: `Replaced generic fallback image with exact model-specific manufacturer product photos for ${updatedCount} laptops across Apple, ASUS, Dell, Lenovo, HP, MSI, and Casper brands.`,
  rationale: 'User explicitly approved genuine laptop images replacement proposal.'
});
