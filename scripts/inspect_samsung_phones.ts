import { mockSmartphones } from '../src/lib/mockData';

const samsungPhones = mockSmartphones.filter(p => p.brand.toLowerCase() === 'samsung');
console.log('Total Samsung phones:', samsungPhones.length);

const withSpecificModel = samsungPhones.filter(p => {
  return /SM-[A-Z0-9]+|5G|Ultra|Plus|\(\d+ GB\)/i.test(p.name);
});

console.log('Samsung with specific model patterns:', withSpecificModel.length);
withSpecificModel.slice(0, 30).forEach((p, idx) => {
  console.log(`[${idx + 1}] id="${p.id}" | name="${p.name}" | releaseYear=${p.releaseYear}`);
});
