import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

async function testProduct(brand: string, productCode: string, gtin?: string) {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  if (brand && productCode) {
    url.searchParams.set('Brand', brand);
    url.searchParams.set('ProductCode', productCode);
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
    const isOk = res.status === 200 && data?.msg === 'OK';
    const errCode = data?.StatusCode || data?.Code || res.status;
    const errMsg = data?.Message || data?.Error || (isOk ? 'OK' : 'Error');
    const title = data?.data?.GeneralInfo?.Title || 'N/A';
    const numGroups = data?.data?.FeaturesGroups?.length || 0;
    console.log(`[${isOk ? '200 OK' : 'ERR ' + errCode}] Brand="${brand}" Code="${productCode}" -> Title: "${title.slice(0, 45)}" | Groups: ${numGroups} | Msg: ${errMsg}`);
    return { ok: isOk, errCode, errMsg, data };
  } catch (e: any) {
    console.log(`[NET ERR] Brand="${brand}" Code="${productCode}": ${e.message}`);
    return { ok: false, errCode: 'NET_ERR', errMsg: e.message };
  }
}

async function run() {
  console.log('--- TESTING ICECAT ACCESS ACROSS VARIOUS BRANDS ---');
  // Samsung
  await testProduct('Samsung', 'SM-S921BZKDEUE'); // Galaxy S24
  await testProduct('Samsung', 'SM-S928B');
  await testProduct('Samsung', 'SM-A556BZKBEUB'); // Galaxy A55
  await testProduct('Samsung', 'SM-A356BZKBEUB'); // Galaxy A35
  await testProduct('Samsung', 'SM-A155FZKDEUB'); // Galaxy A15
  await testProduct('Samsung', 'SM-A256BZKDEUB'); // Galaxy A25
  await testProduct('Samsung', 'SM-S918BZKDEUE'); // Galaxy S23 Ultra
  await testProduct('Samsung', 'SM-S911BZKDEUE'); // Galaxy S23

  // TCL
  await testProduct('TCL', 'T770H'); // TCL 10 Pro
  await testProduct('TCL', 'T671H'); // TCL 20 SE
  await testProduct('TCL', 'T676H'); // TCL 20 Pro 5G
  await testProduct('TCL', 'T610K'); // TCL 40 SE

  // Huawei
  await testProduct('Huawei', '51097FBU'); // Huawei Pura 70
  await testProduct('Huawei', '51097FBT'); // Huawei Pura 70 Pro
  await testProduct('Huawei', 'HBP-LX9');
  await testProduct('Huawei', '51095RTY'); // Nova 9
  await testProduct('Huawei', '51097CBY'); // P60 Pro

  // Philips
  await testProduct('Philips', 'S327');
  await testProduct('Philips', 'CTE103BK/00');

  // Xiaomi
  await testProduct('Xiaomi', 'MZB0GB6EU');
  await testProduct('Xiaomi', 'MZB0FSNEU');

  // Sony
  await testProduct('Sony', 'XQ-DQ54'); // Xperia 1 V
  await testProduct('Sony', 'XQ-DE54'); // Xperia 5 V
}

run();
