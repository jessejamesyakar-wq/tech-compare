import fs from 'fs';

// Curated verified European / Turkish / Global product codes for canonical smartphone records
export const KNOWN_PHONE_MPNS: Record<string, { mpn?: string; gtin?: string; icecatId?: number; region?: string }> = {
  // --- Samsung S24 Series ---
  'samsung-samsung-galaxy-s24-93': { mpn: 'SM-S921BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s24-94': { mpn: 'SM-S926BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s24-plus-94': { mpn: 'SM-S926BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s24-ultra-95': { mpn: 'SM-S928BZTHEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s24-fe-96': { mpn: 'SM-S721BZKDEUE', region: 'EU/Global' },

  // --- Samsung S23 Series ---
  'samsung-samsung-galaxy-s23-53': { mpn: 'SM-S911BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s23-80': { mpn: 'SM-S911BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s23-plus-54': { mpn: 'SM-S916BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s23-81': { mpn: 'SM-S916BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s23-ultra-55': { mpn: 'SM-S918BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s23-ultra-82': { mpn: 'SM-S918BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s23-fe-83': { mpn: 'SM-S711BZADEUE', region: 'EU/Global' },

  // --- Samsung S22 Series ---
  'samsung-samsung-galaxy-s22-66': { mpn: 'SM-S901BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s22-67': { mpn: 'SM-S906BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s22-plus-67': { mpn: 'SM-S906BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s22-ultra-68': { mpn: 'SM-S908BZKDEUE', region: 'EU/Global' },

  // --- Samsung S21 Series ---
  'samsung-samsung-galaxy-s21-50': { mpn: 'SM-G991BZADEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s21-51': { mpn: 'SM-G991BZAGEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s21-ultra-52': { mpn: 'SM-G998BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s21-fe-53': { mpn: 'SM-G990BZADEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s21-fe-63': { mpn: 'SM-G990BZADEUE', region: 'EU/Global' },

  // --- Samsung S20 Series ---
  'samsung-samsung-galaxy-s20-32': { mpn: 'SM-G980FZADEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s20-33': { mpn: 'SM-G985FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s20-fe-35': { mpn: 'SM-G781BZBDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-s20-fe-41': { mpn: 'SM-G781BZBDEUE', region: 'EU/Global' },

  // --- Samsung Note Series ---
  'samsung-samsung-galaxy-note-20-ultra-37': { mpn: 'SM-N986BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-note-20-36': { mpn: 'SM-N980FZNHEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-note-10-17': { mpn: 'SM-N970FZKDITV', region: 'EU/Global' },
  'samsung-samsung-galaxy-note-9-3': { mpn: 'SM-N960FZKDITV', region: 'EU/Global' },

  // --- Samsung S10 & S9 Series ---
  'samsung-samsung-galaxy-s10-10': { mpn: 'SM-G973FZKDITV', region: 'EU/Global' },
  'samsung-samsung-galaxy-s10-plus-11': { mpn: 'SM-G975FZKDITV', region: 'EU/Global' },
  'samsung-samsung-galaxy-s10e-9': { mpn: 'SM-G970FZKDITV', region: 'EU/Global' },
  'samsung-samsung-galaxy-s9-1': { mpn: 'SM-G960FZKDITV', region: 'EU/Global' },
  'samsung-samsung-galaxy-s9-2': { mpn: 'SM-G965FZKDITV', region: 'EU/Global' },

  // --- Samsung A Series (2024 - 2021) ---
  'samsung-samsung-galaxy-a55-5g-103': { mpn: 'SM-A556BZKAEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a35-5g-102': { mpn: 'SM-A356BZKBEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a25-5g-101': { mpn: 'SM-A256BZKDEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a15-100': { mpn: 'SM-A155FZKDEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a05-99': { mpn: 'SM-A055FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a54-5g-89': { mpn: 'SM-A546BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a34-5g-88': { mpn: 'SM-A346BZKAEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a24-87': { mpn: 'SM-A245FZKVEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a14-86': { mpn: 'SM-A145FZKUEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a53-5g-74': { mpn: 'SM-A536BZKNEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a33-5g-73': { mpn: 'SM-A336BZKGEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a23-72': { mpn: 'SM-A235FZKUEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a13-71': { mpn: 'SM-A135FZKUEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a73-5g-75': { mpn: 'SM-A736BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a52s-5g-61': { mpn: 'SM-A528BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a52-60': { mpn: 'SM-A525FZKGEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a72-62': { mpn: 'SM-A725FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a32-59': { mpn: 'SM-A325FZKGEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a22-58': { mpn: 'SM-A225FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a12-57': { mpn: 'SM-A127FZKEEUB', region: 'EU/Global' },
  'samsung-samsung-galaxy-a02-56': { mpn: 'SM-A022GZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a51-44': { mpn: 'SM-A515FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a71-45': { mpn: 'SM-A715FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a50-24': { mpn: 'SM-A505FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a70-26': { mpn: 'SM-A705FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-a80-27': { mpn: 'SM-A805FZKDEUE', region: 'EU/Global' },

  // --- Samsung M Series ---
  'samsung-samsung-galaxy-m54-5g-92': { mpn: 'SM-M546BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m34-5g-91': { mpn: 'SM-M346BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m14-5g-90': { mpn: 'SM-M146BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m53-5g-79': { mpn: 'SM-M536BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m33-5g-78': { mpn: 'SM-M336BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m23-5g-77': { mpn: 'SM-M236BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m13-76': { mpn: 'SM-M135FZKUEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m52-5g-65': { mpn: 'SM-M526BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m32-64': { mpn: 'SM-M325FZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-m12-63': { mpn: 'SM-M127FZKDEUE', region: 'EU/Global' },

  // --- Samsung Fold & Flip ---
  'samsung-samsung-galaxy-z-fold-6-98': { mpn: 'SM-F956BZNDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-flip-6-97': { mpn: 'SM-F741BZBDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-fold-5-85': { mpn: 'SM-F946BZAGEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-flip-5-84': { mpn: 'SM-F731BZAGEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-fold-4-70': { mpn: 'SM-F936BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-flip-4-69': { mpn: 'SM-F721BZADEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-fold-3-55': { mpn: 'SM-F926BZKDEUE', region: 'EU/Global' },
  'samsung-samsung-galaxy-z-flip-3-54': { mpn: 'SM-F711BZKDEUE', region: 'EU/Global' },

  // --- Philips ---
  'philips-xenium-e2125': { mpn: 'CTE2125', region: 'Global' },
  'philips-xenium-e227': { mpn: 'CTE227', region: 'Global' },
  'philips-xenium-x818': { mpn: 'CTX818', region: 'Global' },
  'philips-xenium-e103': { mpn: 'CTE103BK/00', region: 'Global' },

  // --- Apple ---
  'apple-apple-iphone-16-pro-max-256-gb-952387': { mpn: 'MYWV3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-16-pro-256-gb-960858': { mpn: 'MYND3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-16-128-gb-959779': { mpn: 'MYEE3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-16-plus-128-gb-959953': { mpn: 'MXVJ3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-15-pro-max-256-gb-895852': { mpn: 'MU773ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-15-pro-128-gb-895855': { mpn: 'MTV03ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-15-128-gb-895865': { mpn: 'MTP03ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-14-128-gb-802356': { mpn: 'MPVN3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-13-128-gb-717135': { mpn: 'MLPK3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-12-128-gb-588145': { mpn: 'MGJA3ZD/A', region: 'EU/Global' },
  'apple-apple-iphone-11-64-gb-223976': { mpn: 'MHDA3ZD/A', region: 'EU/Global' }
};

console.log(`Updated KNOWN_PHONE_MPNS count: ${Object.keys(KNOWN_PHONE_MPNS).length}`);
