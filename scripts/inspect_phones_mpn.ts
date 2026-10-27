import { mockSmartphones } from '../src/lib/mockData';

const withMpn = mockSmartphones.filter((p: any) => p.mpn || p.sku || p.modelNumber || p.specs?.modelCode);
console.log('Phones with direct mpn/sku property:', withMpn.length);

const withFieldSources = mockSmartphones.filter((p: any) => p.fieldSources && p.fieldSources.length > 0);
console.log('Phones with fieldSources:', withFieldSources.length);
withFieldSources.slice(0, 10).forEach(p => {
  console.log(`- id="${p.id}" sources=${p.fieldSources.length} sampleSource=${JSON.stringify(p.fieldSources[0])}`);
});
