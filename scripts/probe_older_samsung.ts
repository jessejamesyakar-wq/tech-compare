import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function queryIcecat(code: string): Promise<{ ok: boolean; title?: string; groups?: number; error?: string }> {
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

const probeList: Array<{ id: string; name: string; codes: string[] }> = [
  { id: 'samsung-samsung-galaxy-a10-20', name: 'Galaxy A10', codes: ['SM-A105FZKDITV', 'SM-A105FZKDEUE', 'SM-A105FZRDITV', 'SM-A105FN'] },
  { id: 'samsung-samsung-galaxy-a20-21', name: 'Galaxy A20', codes: ['SM-A205FZKDITV', 'SM-A202FZKDITV', 'SM-A202FZKDEUE', 'SM-A202F/DS'] },
  { id: 'samsung-samsung-galaxy-a30-22', name: 'Galaxy A30', codes: ['SM-A305FZKDITV', 'SM-A307FN/DS', 'SM-A307FZKDITV', 'SM-A307FZKDEUE'] },
  { id: 'samsung-samsung-galaxy-a50-24', name: 'Galaxy A50', codes: ['SM-A505FZKDITV', 'SM-A505FZWSITV', 'SM-A505FN/DS', 'SM-A505FZKSEUE'] },
  { id: 'samsung-samsung-galaxy-a70-26', name: 'Galaxy A70', codes: ['SM-A705FZKDITV', 'SM-A705FZBDITV', 'SM-A705FN/DS', 'SM-A705FZBDEUE'] },
  { id: 'samsung-samsung-galaxy-a80-27', name: 'Galaxy A80', codes: ['SM-A805FZKDITV', 'SM-A805FZKDEUE', 'SM-A805FZSDITV'] },
  { id: 'samsung-samsung-galaxy-a51-44', name: 'Galaxy A51', codes: ['SM-A515FZKDEUE', 'SM-A515FZKDEUB', 'SM-A515FZKDITV', 'SM-A515F/DSN'] },
  { id: 'samsung-samsung-galaxy-a71-45', name: 'Galaxy A71', codes: ['SM-A715FZKDEUE', 'SM-A715FZKDEUB', 'SM-A715FZKDITV', 'SM-A715F/DS'] },
  { id: 'samsung-samsung-galaxy-note-20-36', name: 'Galaxy Note 20', codes: ['SM-N980FZKDITV', 'SM-N980FZNEITV', 'SM-N981BZAGEUE', 'SM-N981B'] },
  { id: 'samsung-samsung-galaxy-z-fold-4-70', name: 'Galaxy Z Fold 4', codes: ['SM-F936BZKEEUE', 'SM-F936BZEEEUE', 'SM-F936BZKDEUB', 'SM-F936BZABEUB'] },
  { id: 'samsung-samsung-galaxy-z-fold-5-85', name: 'Galaxy Z Fold 5', codes: ['SM-F946BZKEEUE', 'SM-F946BZEEEUE', 'SM-F946BZKDEUB', 'SM-F946BZKAEUB'] },
  { id: 'samsung-samsung-galaxy-a12-57', name: 'Galaxy A12', codes: ['SM-A125FZKKEUB', 'SM-A127FZNUEUB', 'SM-A125FZNKEUB', 'SM-A125FZKDEUE'] },
  { id: 'samsung-samsung-galaxy-a02-56', name: 'Galaxy A02', codes: ['SM-A025GZKDEUB', 'SM-A025GZKDEUE', 'SM-A022GZKDEUB'] },
  { id: 'samsung-samsung-galaxy-a14-86', name: 'Galaxy A14', codes: ['SM-A145RZKDEUB', 'SM-A146PZKDEUB', 'SM-A145R/DSN', 'SM-A146B/DSN'] },
  { id: 'samsung-samsung-galaxy-a24-87', name: 'Galaxy A24', codes: ['SM-A245FZKDEUB', 'SM-A245FZKDEUE', 'SM-A245F/DS'] },
  { id: 'samsung-samsung-galaxy-a23-72', name: 'Galaxy A23', codes: ['SM-A235FZKDEUB', 'SM-A236BZKDEUB', 'SM-A235F/DSN'] },
  { id: 'samsung-samsung-galaxy-a31-42', name: 'Galaxy A31', codes: ['SM-A315FZKDITV', 'SM-A315FZKDEUE', 'SM-A315F/DS'] },
  { id: 'samsung-samsung-galaxy-m12-63', name: 'Galaxy M12', codes: ['SM-M127FZKDEUB', 'SM-M127F/DSN'] },
  { id: 'samsung-samsung-galaxy-m21-47', name: 'Galaxy M21', codes: ['SM-M215FZKDEUB', 'SM-M215FZKDEUE', 'SM-M215F/DSN'] },
  { id: 'samsung-samsung-galaxy-m31-48', name: 'Galaxy M31', codes: ['SM-M315FZKDEUB', 'SM-M315FZKDEUE', 'SM-M315F/DSN'] },
  { id: 'samsung-samsung-galaxy-a90-5g-28', name: 'Galaxy A90 5G', codes: ['SM-A908BZWDITV', 'SM-A908BZWDEUE', 'SM-A908B'] }
];

async function run() {
  console.log('Probing additional European variants...');
  for (const item of probeList) {
    for (const code of item.codes) {
      await sleep(350);
      const res = await queryIcecat(code);
      if (res.ok) {
        console.log(`[MATCH] ${item.name} (${item.id}) -> "${code}" | Groups: ${res.groups}`);
        break;
      }
    }
  }
}

run();
