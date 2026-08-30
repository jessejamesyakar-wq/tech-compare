const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

// Popular flagship models to enrich with multi-color variant images
const enrichedModels = [
  {
    id: 'samsung-samsung-galaxy-s24-ultra-95',
    name: 'Samsung Galaxy S24 Ultra',
    variants: [
      { id: 's24u-grey', name: 'Titanyum Gri', colorName: 'Titanyum Gri', colorHex: '#77726B', image: '/images/phones/samsung/variants/s24-ultra-grey.jpg' },
      { id: 's24u-black', name: 'Titanyum Siyah', colorName: 'Titanyum Siyah', colorHex: '#2B2A29', image: '/images/phones/samsung/variants/s24-ultra-black.jpg' },
      { id: 's24u-violet', name: 'Titanyum Menekşe', colorName: 'Titanyum Menekşe', colorHex: '#454256', image: '/images/phones/samsung/variants/s24-ultra-violet.jpg' },
      { id: 's24u-yellow', name: 'Titanyum Sarı', colorName: 'Titanyum Sarı', colorHex: '#E5DDCB', image: '/images/phones/samsung/variants/s24-ultra-yellow.jpg' }
    ]
  },
  {
    id: 'samsung-samsung-galaxy-s24-plus-94',
    name: 'Samsung Galaxy S24+',
    variants: [
      { id: 's24p-black', name: 'Oniks Siyah', colorName: 'Oniks Siyah', colorHex: '#2B2A29', image: '/images/phones/samsung/variants/s24-black.jpg' },
      { id: 's24p-grey', name: 'Mermer Gri', colorName: 'Mermer Gri', colorHex: '#D1D5DB', image: '/images/phones/samsung/variants/s24-grey.jpg' },
      { id: 's24p-violet', name: 'Kobalt Menekşe', colorName: 'Kobalt Menekşe', colorHex: '#4A4560', image: '/images/phones/samsung/variants/s24-violet.jpg' },
      { id: 's24p-yellow', name: 'Kehribar Sarı', colorName: 'Kehribar Sarı', colorHex: '#FDE047', image: '/images/phones/samsung/variants/s24-yellow.jpg' }
    ]
  },
  {
    id: 'samsung-samsung-galaxy-s24-93',
    name: 'Samsung Galaxy S24',
    variants: [
      { id: 's24-black', name: 'Oniks Siyah', colorName: 'Oniks Siyah', colorHex: '#2B2A29', image: '/images/phones/samsung/variants/s24-black.jpg' },
      { id: 's24-grey', name: 'Mermer Gri', colorName: 'Mermer Gri', colorHex: '#D1D5DB', image: '/images/phones/samsung/variants/s24-grey.jpg' },
      { id: 's24-violet', name: 'Kobalt Menekşe', colorName: 'Kobalt Menekşe', colorHex: '#4A4560', image: '/images/phones/samsung/variants/s24-violet.jpg' },
      { id: 's24-yellow', name: 'Kehribar Sarı', colorName: 'Kehribar Sarı', colorHex: '#FDE047', image: '/images/phones/samsung/variants/s24-yellow.jpg' }
    ]
  },
  {
    id: 'samsung-samsung-galaxy-s23-ultra-82',
    name: 'Samsung Galaxy S23 Ultra',
    variants: [
      { id: 's23u-black', name: 'Fantom Siyah', colorName: 'Fantom Siyah', colorHex: '#1E293B', image: '/images/phones/samsung/variants/s23-ultra-black.jpg' },
      { id: 's23u-cream', name: 'Krem', colorName: 'Krem', colorHex: '#F5F5DC', image: '/images/phones/samsung/variants/s23-ultra-cream.jpg' },
      { id: 's23u-green', name: 'Yeşil', colorName: 'Yeşil', colorHex: '#3B5342', image: '/images/phones/samsung/variants/s23-ultra-green.jpg' },
      { id: 's23u-lavender', name: 'Lavanta', colorName: 'Lavanta', colorHex: '#E6E6FA', image: '/images/phones/samsung/variants/s23-ultra-lavender.jpg' }
    ]
  },
  {
    id: 'samsung-samsung-galaxy-z-fold-6-98',
    name: 'Samsung Galaxy Z Fold 6',
    variants: [
      { id: 'zfold6-silver', name: 'Gümüş Gölge', colorName: 'Gümüş Gölge', colorHex: '#A0AAB2', image: '/images/phones/samsung/variants/z-fold6-silver.jpg' },
      { id: 'zfold6-navy', name: 'Donanma Lacivert', colorName: 'Donanma Lacivert', colorHex: '#1F2937', image: '/images/phones/samsung/variants/z-fold6-navy.jpg' },
      { id: 'zfold6-pink', name: 'Pembe', colorName: 'Pembe', colorHex: '#FBCFE8', image: '/images/phones/samsung/variants/z-fold6-pink.jpg' }
    ]
  },
  {
    id: 'samsung-samsung-galaxy-z-flip-6-97',
    name: 'Samsung Galaxy Z Flip 6',
    variants: [
      { id: 'zflip6-silver', name: 'Gölge Gümüş', colorName: 'Gölge Gümüş', colorHex: '#94A3B8', image: '/images/phones/samsung/variants/z-flip6-silver.jpg' },
      { id: 'zflip6-mint', name: 'Nane Yeşili', colorName: 'Nane Yeşili', colorHex: '#A7F3D0', image: '/images/phones/samsung/variants/z-flip6-mint.jpg' },
      { id: 'zflip6-yellow', name: 'Sarı', colorName: 'Sarı', colorHex: '#FEF08A', image: '/images/phones/samsung/variants/z-flip6-yellow.jpg' },
      { id: 'zflip6-blue', name: 'Mavi', colorName: 'Mavi', colorHex: '#BFDBFE', image: '/images/phones/samsung/variants/z-flip6-blue.jpg' }
    ]
  },
  {
    id: 'samsung-samsung-galaxy-a55-5g-103',
    name: 'Samsung Galaxy A55 5G',
    variants: [
      { id: 'a55-iceblue', name: 'Müthiş Buz Mavisi', colorName: 'Müthiş Buz Mavisi', colorHex: '#BAE6FD', image: '/images/phones/samsung/variants/a55-iceblue.jpg' },
      { id: 'a55-navy', name: 'Müthiş Lacivert', colorName: 'Müthiş Lacivert', colorHex: '#0F172A', image: '/images/phones/samsung/variants/a55-navy.jpg' },
      { id: 'a55-lilac', name: 'Müthiş Leylak', colorName: 'Müthiş Leylak', colorHex: '#DDD6FE', image: '/images/phones/samsung/variants/a55-lilac.jpg' },
      { id: 'a55-lemon', name: 'Müthiş Limon', colorName: 'Müthiş Limon', colorHex: '#FEF08A', image: '/images/phones/samsung/variants/a55-lemon.jpg' }
    ]
  }
];

fs.writeFileSync(
  path.join(__dirname, '../data/samsung_variants_proposal.json'),
  JSON.stringify(enrichedModels, null, 2),
  'utf8'
);

console.log(`Generated samsung_variants_proposal.json with ${enrichedModels.length} models.`);
