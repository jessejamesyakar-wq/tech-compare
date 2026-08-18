const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/mockData.ts');
const content = fs.readFileSync(filePath, 'utf-8');

const matches = [...content.matchAll(/\{\s*"id":\s*"(apple-[^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"releaseYear":\s*(\d+)/g)];

console.log(`FOUND ${matches.length} APPLE PHONES`);

const phonesByYear = {};

matches.forEach(m => {
  const name = m[2];
  const year = m[3];
  if (!phonesByYear[year]) phonesByYear[year] = [];
  phonesByYear[year].push(name);
});

Object.keys(phonesByYear).sort((a, b) => b - a).forEach(year => {
  console.log(`\n=== ${year} MODEL LİSTESİ (${phonesByYear[year].length} Model) ===`);
  phonesByYear[year].forEach(p => console.log(`- ${p}`));
});
