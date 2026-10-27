import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function queryIcecat(brand: string, code: string): Promise<{ ok: boolean; title?: string; groups?: number; error?: string }> {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  url.searchParams.set('Brand', brand);
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
    } else {
      return {
        ok: false,
        error: data?.Message || data?.Error || String(res.status)
      };
    }
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

const probeList: Array<{ brand: string; id: string; name: string; codes: string[] }> = [
  // Philips
  { brand: 'Philips', id: 'philips-s318', name: 'Philips S318', codes: ['CTS318BK/00', 'CTS318', 'S318', 'CTS318BK'] },
  { brand: 'Philips', id: 'philips-xenium-e2125', name: 'Philips E2125', codes: ['CTE2125BK/00', 'CTE2125BK', 'CTE2125', 'E2125'] },
  { brand: 'Philips', id: 'philips-xenium-e227', name: 'Philips E227', codes: ['CTE227BK/00', 'CTE227', 'E227', 'CTE227BK'] },
  { brand: 'Philips', id: 'philips-xenium-x818', name: 'Philips X818', codes: ['CTX818CH/00', 'CTX818', 'X818', 'CTX818CH'] },
  
  // Samsung
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-a10-20', name: 'Galaxy A10', codes: ['SM-A105G/DS', 'SM-A105F', 'SM-A105FN', 'SM-A105M/DS'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-a70-26', name: 'Galaxy A70', codes: ['SM-A705MN/DS', 'SM-A7050', 'SM-A705FN', 'SM-A705F'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-a51-44', name: 'Galaxy A51', codes: ['SM-A515F', 'SM-A515FN/DS', 'SM-A515F/DS'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-a71-45', name: 'Galaxy A71', codes: ['SM-A715F/DS', 'SM-A715FN/DS', 'SM-A715F'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-z-fold-5-85', name: 'Galaxy Z Fold 5', codes: ['SM-F946B/DS', 'SM-F9460', 'SM-F946U'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-a24-87', name: 'Galaxy A24', codes: ['SM-A245F/DS', 'SM-A245M/DS', 'SM-A245N'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-a23-72', name: 'Galaxy A23', codes: ['SM-A235F/DS', 'SM-A235M/DS', 'SM-A236B'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-m14-5g-90', name: 'Galaxy M14 5G', codes: ['SM-M146B/DS', 'SM-M146B'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-m34-5g-91', name: 'Galaxy M34 5G', codes: ['SM-M346B/DS', 'SM-M346B'] },
  { brand: 'Samsung', id: 'samsung-samsung-galaxy-m54-5g-92', name: 'Galaxy M54 5G', codes: ['SM-M546B/DS', 'SM-M546B'] }
];

async function run() {
  for (const item of probeList) {
    for (const code of item.codes) {
      await sleep(350);
      const res = await queryIcecat(item.brand, code);
      if (res.ok) {
        console.log(`[MATCH] ${item.name} (${item.id}) -> "${code}" | Groups: ${res.groups}`);
        break;
      }
    }
  }
}

run();
