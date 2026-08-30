const fs = require('fs');
const path = require('path');

const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

let fixed = 0;
phones.forEach(p => {
  if (p.images && p.images.length > 0) {
    p.images = p.images.filter(img => {
      if (!img) return false;
      const cleanPath = img.startsWith('/') ? img.substring(1) : img;
      const fullPublic = path.join(__dirname, '../public', cleanPath);
      const exists = fs.existsSync(fullPublic);
      if (!exists) {
        console.log(`Removed non-existent image "${img}" from ${p.name}`);
        fixed++;
        return false;
      }
      return true;
    });
    if (p.images.length === 0 && p.image) {
      p.images = [p.image];
    }
  } else if (p.image) {
    p.images = [p.image];
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`Cleaned up ${fixed} non-existent image paths from smartphonesData.json.`);
