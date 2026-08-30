const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load original 357 smartphones from commit eae1add
const oldJsonStr = execSync('git show eae1add:src/lib/smartphonesData.json', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const oldPhones = JSON.parse(oldJsonStr);

console.log('Total original smartphones in eae1add:', oldPhones.length);

// 2. Map of distinct unique slugs and names for the 10 storage variants:
const storageVariantConfig = {
  'samsung-galaxy-s26-ultra': {
    slug: 'samsung-galaxy-s26-ultra-256gb',
    name: 'Samsung Galaxy S26 Ultra (256 GB)'
  },
  'samsung-galaxy-s26-plus': {
    slug: 'samsung-galaxy-s26-plus-256gb',
    name: 'Samsung Galaxy S26+ (256 GB)'
  },
  'samsung-galaxy-s26': {
    slug: 'samsung-galaxy-s26-128gb',
    name: 'Samsung Galaxy S26 (128 GB)'
  },
  'samsung-galaxy-s25-ultra': {
    slug: 'samsung-galaxy-s25-ultra-256gb',
    name: 'Samsung Galaxy S25 Ultra (256 GB)'
  },
  'samsung-galaxy-s25-plus': {
    slug: 'samsung-galaxy-s25-plus-256gb',
    name: 'Samsung Galaxy S25+ (256 GB)'
  },
  'samsung-galaxy-s25': {
    slug: 'samsung-galaxy-s25-128gb',
    name: 'Samsung Galaxy S25 (128 GB)'
  },
  'samsung-galaxy-s25-fe': {
    slug: 'samsung-galaxy-s25-fe-128gb',
    name: 'Samsung Galaxy S25 FE (128 GB)'
  },
  'samsung-galaxy-a57-5g': {
    slug: 'samsung-galaxy-a57-5g-128gb',
    name: 'Samsung Galaxy A57 5G (128 GB)'
  },
  'samsung-galaxy-a37-5g': {
    slug: 'samsung-galaxy-a37-5g-128gb',
    name: 'Samsung Galaxy A37 5G (128 GB)'
  },
  'samsung-galaxy-a17-5g': {
    slug: 'samsung-galaxy-a17-5g-128gb',
    name: 'Samsung Galaxy A17 5G (128 GB)'
  }
};

// Also ensure the Plus models have their distinct plus slugs
const plusSlugsMap = {
  'samsung-samsung-galaxy-s9-2': 'samsung-galaxy-s9-plus',
  'samsung-samsung-galaxy-s10-15': 'samsung-galaxy-s10-plus',
  'samsung-samsung-galaxy-note-10-18': 'samsung-galaxy-note-10-plus',
  'samsung-samsung-galaxy-s20-33': 'samsung-galaxy-s20-plus',
  'samsung-samsung-galaxy-s21-51': 'samsung-galaxy-s21-plus',
  'samsung-samsung-galaxy-s22-67': 'samsung-galaxy-s22-plus',
  'samsung-samsung-galaxy-s23-81': 'samsung-galaxy-s23-plus',
  'samsung-samsung-galaxy-s24-94': 'samsung-galaxy-s24-plus',
  'samsung-samsung-galaxy-s25-108': 'samsung-galaxy-s25-plus',
  'samsung-samsung-galaxy-s26-119': 'samsung-galaxy-s26-plus',
  'samsung-samsung-galaxy-a8-2018-5': 'samsung-galaxy-a8-plus-2018',
  'samsung-samsung-galaxy-a6-2018-8': 'samsung-galaxy-a6-plus-2018'
};

const updatedList = oldPhones.map(p => {
  if (storageVariantConfig[p.id]) {
    p.slug = storageVariantConfig[p.id].slug;
    p.name = storageVariantConfig[p.id].name;
  }
  if (plusSlugsMap[p.id]) {
    p.slug = plusSlugsMap[p.id];
  }
  return p;
});

// Verify slug uniqueness across all 357 products
const slugSet = new Set();
const dups = [];
updatedList.forEach(p => {
  if (slugSet.has(p.slug)) dups.push({ id: p.id, slug: p.slug, name: p.name });
  else slugSet.add(p.slug);
});

console.log(`\nVerified ${updatedList.length} smartphones.`);
console.log(`Duplicate Slugs Count: ${dups.length}`);
if (dups.length > 0) {
  console.log('Duplicates:', dups);
  process.exit(1);
}

const targetPath = path.join(__dirname, '../src/lib/smartphonesData.json');
fs.writeFileSync(targetPath, JSON.stringify(updatedList, null, 2), 'utf8');
console.log(`✅ Successfully restored ALL ${updatedList.length} smartphones into smartphonesData.json!`);
