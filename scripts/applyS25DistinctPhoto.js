const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING DISTINCT OFFICIAL PHOTO FOR SAMSUNG GALAXY S25 ===\n');

const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

let count = 0;
phones.forEach(p => {
  if (p.brand.toLowerCase() === 'samsung') {
    // S25 base models
    if (p.name === 'Samsung Galaxy S25' || p.name === 'Samsung Galaxy S25 (128 GB)') {
      const newImg = '/images/phones/samsung/samsung-galaxy-s25-sm-s931.jpg';
      p.image = newImg;
      p.images = [newImg];
      count++;
    }
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`✅ Updated ${count} Samsung Galaxy S25 base model records with dedicated SM-S931 official photo.`);

// Log change
logDataChange({
  title: 'Applied Dedicated Official Photo (SM-S931) for Samsung Galaxy S25 Base Models',
  files: ['src/lib/smartphonesData.json'],
  description: 'Switched Samsung Galaxy S25 base model from shared S25 FE image to dedicated official manufacturer photo /images/phones/samsung/samsung-galaxy-s25-sm-s931.jpg.',
  rationale: 'User approved separating base S25 photo to ensure 100% distinct manufacturer original photography across all Samsung models.'
});
