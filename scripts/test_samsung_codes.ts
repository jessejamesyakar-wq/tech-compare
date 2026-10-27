import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

async function queryIcecat(params: { brand?: string; code?: string; gtin?: string; icecatId?: number }) {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  if (params.icecatId) url.searchParams.set('IcecatId', String(params.icecatId));
  if (params.brand && params.code) {
    url.searchParams.set('Brand', params.brand);
    url.searchParams.set('ProductCode', params.code);
  }
  if (params.gtin) url.searchParams.set('GTIN', params.gtin);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'TechCompare-Test/1.0'
  };
  if (apiToken) headers['api-token'] = apiToken;

  const res = await fetch(url.toString(), { headers });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, msg: json?.msg, code: json?.StatusCode, data: json?.data };
}

async function run() {
  // Test S24 Ultra EAN: 8806095304670 (SM-S928B 256GB Black)
  const r1 = await queryIcecat({ gtin: '8806095304670' });
  console.log('S24 Ultra GTIN 8806095304670:', r1.status, r1.msg, r1.data?.GeneralInfo?.Title);

  // Test S24 Ultra code: SM-S928BZKDEUE
  const r2 = await queryIcecat({ brand: 'Samsung', code: 'SM-S928BZKDEUE' });
  console.log('S24 Ultra Code SM-S928BZKDEUE:', r2.status, r2.msg, r2.data?.GeneralInfo?.Title);

  // Test S24+ code: SM-S926BZKDEUE
  const r3 = await queryIcecat({ brand: 'Samsung', code: 'SM-S926BZKDEUE' });
  console.log('S24+ Code SM-S926BZKDEUE:', r3.status, r3.msg, r3.data?.GeneralInfo?.Title);

  // Test S23 Ultra code: SM-S918BZKDEUE
  const r4 = await queryIcecat({ brand: 'Samsung', code: 'SM-S918BZKDEUE' });
  console.log('S23 Ultra Code SM-S918BZKDEUE:', r4.status, r4.msg, r4.data?.GeneralInfo?.Title);

  // Test S23 code: SM-S911BZKDEUE
  const r5 = await queryIcecat({ brand: 'Samsung', code: 'SM-S911BZKDEUE' });
  console.log('S23 Code SM-S911BZKDEUE:', r5.status, r5.msg, r5.data?.GeneralInfo?.Title);

  // Test A55 code: SM-A556BZKAEUB
  const r6 = await queryIcecat({ brand: 'Samsung', code: 'SM-A556BZKAEUB' });
  console.log('A55 Code SM-A556BZKAEUB:', r6.status, r6.msg, r6.data?.GeneralInfo?.Title);

  // Test A35 code: SM-A356BZKBEUB
  const r7 = await queryIcecat({ brand: 'Samsung', code: 'SM-A356BZKBEUB' });
  console.log('A35 Code SM-A356BZKBEUB:', r7.status, r7.msg, r7.data?.GeneralInfo?.Title);

  // Test A15 code: SM-A155FZKDEUB
  const r8 = await queryIcecat({ brand: 'Samsung', code: 'SM-A155FZKDEUB' });
  console.log('A15 Code SM-A155FZKDEUB:', r8.status, r8.msg, r8.data?.GeneralInfo?.Title);

  // Test A25 code: SM-A256BZKDEUB
  const r9 = await queryIcecat({ brand: 'Samsung', code: 'SM-A256BZKDEUB' });
  console.log('A25 Code SM-A256BZKDEUB:', r9.status, r9.msg, r9.data?.GeneralInfo?.Title);
}

run();
