import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function queryIcecat(code: string): Promise<{ ok: boolean; title?: string; groups?: number }> {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  url.searchParams.set('Brand', 'Samsung');
  url.searchParams.set('ProductCode', code);

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
    if (isOk) {
      return {
        ok: true,
        title: data.data?.GeneralInfo?.Title,
        groups: data.data?.FeaturesGroups?.length
      };
    }
    return { ok: false };
  } catch (e: any) {
    return { ok: false };
  }
}

// Generate country variations for top models
const testSpecs: Array<{ id: string; name: string; prefix: string; colors: string[]; regions: string[] }> = [
  // A51: SM-A515F
  { id: 'samsung-samsung-galaxy-a51-44', name: 'Galaxy A51', prefix: 'SM-A515F', colors: ['ZK', 'ZB', 'ZW'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] },
  // A71: SM-A715F
  { id: 'samsung-samsung-galaxy-a71-45', name: 'Galaxy A71', prefix: 'SM-A715F', colors: ['ZK', 'ZB', 'ZS'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] },
  // A70: SM-A705F
  { id: 'samsung-samsung-galaxy-a70-26', name: 'Galaxy A70', prefix: 'SM-A705F', colors: ['ZK', 'ZB', 'ZW'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] },
  // A10: SM-A105F
  { id: 'samsung-samsung-galaxy-a10-20', name: 'Galaxy A10', prefix: 'SM-A105F', colors: ['ZK', 'ZB', 'ZR'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] },
  // Z Fold 5: SM-F946B
  { id: 'samsung-samsung-galaxy-z-fold-5-85', name: 'Galaxy Z Fold 5', prefix: 'SM-F946B', colors: ['ZK', 'ZB', 'ZE'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] },
  // Z Fold 2: SM-F916B
  { id: 'samsung-samsung-galaxy-z-fold-2-39', name: 'Galaxy Z Fold 2', prefix: 'SM-F916B', colors: ['ZK', 'ZN'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] },
  // A90 5G: SM-A908B
  { id: 'samsung-samsung-galaxy-a90-5g-28', name: 'Galaxy A90 5G', prefix: 'SM-A908B', colors: ['ZK', 'ZW'], regions: ['DBT', 'PHE', 'XEF', 'ITV', 'PHN', 'EUE', 'EUB', 'EUR', 'SEB', 'ATO'] }
];

async function run() {
  console.log('Probing country variations...');
  for (const spec of testSpecs) {
    let found = false;
    for (const color of spec.colors) {
      if (found) break;
      for (const reg of spec.regions) {
        const code = `${spec.prefix}${color}D${reg}`;
        await sleep(300);
        const res = await queryIcecat(code);
        if (res.ok) {
          console.log(`[MATCH] ${spec.name} (${spec.id}) -> "${code}" | Groups: ${res.groups}`);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      console.log(`[NOT FOUND] ${spec.name} (${spec.id})`);
    }
  }
}

run();
