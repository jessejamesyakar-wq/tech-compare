import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const codesToTest = [
  { model: 'S24+', code: 'SM-S926BZKDEUE' },
  { model: 'S23 FE', code: 'SM-S711BZADEUE' },
  { model: 'A54 5G', code: 'SM-A546BZKDEUE' },
  { model: 'A34 5G', code: 'SM-A346BZKAEUE' },
  { model: 'A24', code: 'SM-A245FZKVEUE' },
  { model: 'A14', code: 'SM-A145FZKUEUE' },
  { model: 'A05s', code: 'SM-A057FZKDEUE' },
  { model: 'A05', code: 'SM-A055FZKDEUE' },
  { model: 'A53 5G', code: 'SM-A536BZKDEUE' },
  { model: 'A33 5G', code: 'SM-A336BZKNEUE' },
  { model: 'A13', code: 'SM-A135FZKUEUE' },
  { model: 'A52s 5G', code: 'SM-A528BZKDEUE' },
  { model: 'A52', code: 'SM-A525FZKDEUE' },
  { model: 'A72', code: 'SM-A725FZKDEUE' },
  { model: 'A32', code: 'SM-A325FZKDEUE' },
  { model: 'A12', code: 'SM-A127FZKDEUE' },
  { model: 'S21 FE', code: 'SM-G990BZADEUE' },
  { model: 'S21 Ultra', code: 'SM-G998BZKDEUE' },
  { model: 'S20 FE', code: 'SM-G780GZKDEUE' },
  { model: 'Z Fold 5', code: 'SM-F946BZKDEUE' },
  { model: 'Z Flip 5', code: 'SM-F731BZADEUE' },
  { model: 'Z Fold 4', code: 'SM-F936BZKDEUE' },
  { model: 'Z Flip 4', code: 'SM-F721BZADEUE' },
  { model: 'Note 20', code: 'SM-N980FZNHEUE' }
];

async function run() {
  for (const item of codesToTest) {
    const url = new URL('https://live.icecat.biz/api/');
    url.searchParams.set('UserName', username);
    url.searchParams.set('Language', 'tr');
    url.searchParams.set('Brand', 'Samsung');
    url.searchParams.set('ProductCode', item.code);
    url.searchParams.set('content', 'all');

    try {
      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json', 'api-token': apiToken }
      });
      const text = await res.text();
      let json: any;
      try { json = JSON.parse(text); } catch {}
      const ok = res.status === 200 && json?.msg === 'OK';
      console.log(`[${ok ? '200 OK' : 'ERR ' + res.status}] ${item.model} (${item.code}): Title="${json?.data?.GeneralInfo?.Title?.slice(0, 45)}" | Groups=${json?.data?.FeaturesGroups?.length || 0}`);
    } catch (e: any) {
      console.log(`[NET ERR] ${item.model}: ${e.message}`);
    }
  }
}

run();
