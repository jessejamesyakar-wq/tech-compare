import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function queryIcecat(brand: string, code: string, gtin?: string): Promise<{ ok: boolean; status: number; statusCode?: number; title?: string; groups?: number; msg?: string }> {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  if (brand && code) {
    url.searchParams.set('Brand', brand);
    url.searchParams.set('ProductCode', code);
  } else if (gtin) {
    url.searchParams.set('GTIN', gtin);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'TechCompare-IcecatIntegration/2.0'
  };
  if (apiToken) headers['api-token'] = apiToken;

  try {
    const res = await fetch(url.toString(), { headers });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {}
    const isOk = res.status === 200 && data?.msg === 'OK' && !!data?.data;
    return {
      ok: isOk,
      status: res.status,
      statusCode: data?.StatusCode,
      title: data?.data?.GeneralInfo?.Title,
      groups: data?.data?.FeaturesGroups?.length,
      msg: data?.Message || data?.Error || data?.msg
    };
  } catch (e: any) {
    return { ok: false, status: 0, msg: e.message };
  }
}

async function run() {
  const tests = [
    // Google
    { brand: 'Google', code: 'GA05269-GB', desc: 'Pixel 9 Pro' },
    { brand: 'Google', code: 'GA04833-GB', desc: 'Pixel 8' },
    { brand: 'Google', code: 'GA04853-GB', desc: 'Pixel 8 Pro' },
    { brand: 'Google', code: 'GA03401-GB', desc: 'Pixel 7' },
    // Apple
    { brand: 'Apple', code: 'MYWV3ZD/A', desc: 'iPhone 16 Pro Max' },
    { brand: 'Apple', code: 'MU773ZD/A', desc: 'iPhone 15 Pro Max' },
    { brand: 'Apple', code: 'MPVN3ZD/A', desc: 'iPhone 14' },
    { brand: 'Apple', code: 'MLPK3ZD/A', desc: 'iPhone 13' },
    // OnePlus
    { brand: 'OnePlus', code: 'CPH2581', desc: 'OnePlus 12' },
    { brand: 'OnePlus', code: '5431100511', desc: 'OnePlus 12' },
    { brand: 'OnePlus', code: 'CPH2609', desc: 'OnePlus Nord 4' },
    // Nothing
    { brand: 'Nothing', code: 'AIN065', desc: 'Nothing Phone (2a)' },
    { brand: 'Nothing', code: 'A065', desc: 'Nothing Phone (2a)' },
    { brand: 'Nothing', code: 'A063', desc: 'Nothing Phone (2)' },
    // Honor
    { brand: 'Honor', code: '5109AYUX', desc: 'Honor Magic 6 Pro' },
    { brand: 'Honor', code: '5109BCRF', desc: 'Honor 200 Pro' },
    { brand: 'Honor', code: '5109BCAJ', desc: 'Honor 200' },
    // Vivo
    { brand: 'Vivo', code: 'V2324A', desc: 'Vivo X100 Pro' },
    { brand: 'Vivo', code: 'V2334', desc: 'Vivo V30' },
    // Oppo
    { brand: 'OPPO', code: 'CPH2607', desc: 'Reno 12 Pro' },
    { brand: 'Oppo', code: 'CPH2607', desc: 'Reno 12 Pro' },
    // General Mobile
    { brand: 'General Mobile', code: 'GM 24 Pro', desc: 'GM 24 Pro' },
    { brand: 'General Mobile', code: 'GM24Pro', desc: 'GM 24 Pro' }
  ];

  for (const t of tests) {
    await sleep(350);
    const res = await queryIcecat(t.brand, t.code);
    console.log(`[HTTP ${res.status} | Code ${res.statusCode || '-'}] ${t.brand} "${t.code}" (${t.desc}) -> ok=${res.ok}, msg="${res.msg}", groups=${res.groups || 0}`);
  }
}

run();
