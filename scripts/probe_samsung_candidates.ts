import dotenv from 'dotenv';
import fs from 'fs';
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const candidates = [
  { id: 'samsung-samsung-galaxy-a16-5g-114', model: 'Galaxy A16 5G', codes: ['SM-A166BZKDEUB', 'SM-A166B/DS', 'SM-A166BZKAEUB', 'SM-A166BZKDEUE'] },
  { id: 'samsung-samsung-galaxy-a06-113', model: 'Galaxy A06', codes: ['SM-A065FZKDEUB', 'SM-A065F/DS', 'SM-A065FZKAEUB', 'SM-A065FZKDEUE'] },
  { id: 'samsung-samsung-galaxy-m15-5g-104', model: 'Galaxy M15 5G', codes: ['SM-M156BDBDEUE', 'SM-M156B/DSN', 'SM-M156B'] },
  { id: 'samsung-samsung-galaxy-m35-5g-105', model: 'Galaxy M35 5G', codes: ['SM-M356BDBDEUE', 'SM-M356B/DS', 'SM-M356B'] },
  { id: 'samsung-samsung-galaxy-m55-5g-106', model: 'Galaxy M55 5G', codes: ['SM-M556BZKDEUE', 'SM-M556B/DS', 'SM-M556B'] },
  { id: 'samsung-samsung-galaxy-a11-40', model: 'Galaxy A11', codes: ['SM-A115FZKDEUE', 'SM-A115F/DSN', 'SM-A115FZKDITV', 'SM-A115F'] },
  { id: 'samsung-samsung-galaxy-a21s-41', model: 'Galaxy A21s', codes: ['SM-A217FZKDEUE', 'SM-A217F/DSN', 'SM-A217FZKNEUA', 'SM-A217F'] },
  { id: 'samsung-samsung-galaxy-a31-42', model: 'Galaxy A31', codes: ['SM-A315FZKDEUE', 'SM-A315G/DSL', 'SM-A315FZKNEUA', 'SM-A315F'] },
  { id: 'samsung-samsung-galaxy-a41-43', model: 'Galaxy A41', codes: ['SM-A415FZKDEUE', 'SM-A415F/DSN', 'SM-A415FZKNEUA', 'SM-A415FZKDITV', 'SM-A415F'] },
  { id: 'samsung-samsung-galaxy-m11-46', model: 'Galaxy M11', codes: ['SM-M115FZKDEUE', 'SM-M115M/DS', 'SM-M115FZKDSER', 'SM-M115F'] },
  { id: 'samsung-samsung-galaxy-m21-47', model: 'Galaxy M21', codes: ['SM-M215FZKDEUE', 'SM-M215F/DS', 'SM-M215FZBDITV', 'SM-M215F'] },
  { id: 'samsung-samsung-galaxy-m31-48', model: 'Galaxy M31', codes: ['SM-M315FZKDEUE', 'SM-M315F/DS', 'SM-M315FZKDITV', 'SM-M315F'] },
  { id: 'samsung-samsung-galaxy-m51-49', model: 'Galaxy M51', codes: ['SM-M515FZKDEUE', 'SM-M515F/DSN', 'SM-M515FZKDITV', 'SM-M515F'] },
  { id: 'samsung-samsung-galaxy-a10-20', model: 'Galaxy A10', codes: ['SM-A105FZKDEUE', 'SM-A105FN/DS', 'SM-A105FZKDITV', 'SM-A105F'] },
  { id: 'samsung-samsung-galaxy-a20-21', model: 'Galaxy A20', codes: ['SM-A205FZKDEUE', 'SM-A205FN/DS', 'SM-A205FN', 'SM-A205F'] },
  { id: 'samsung-samsung-galaxy-a30-22', model: 'Galaxy A30', codes: ['SM-A305FZKDEUE', 'SM-A305FN/DS', 'SM-A305FN', 'SM-A305F'] },
  { id: 'samsung-samsung-galaxy-a40-23', model: 'Galaxy A40', codes: ['SM-A405FZKDEUE', 'SM-A405FN/DS', 'SM-A405FZKDITV', 'SM-A405F'] },
  { id: 'samsung-samsung-galaxy-a90-5g-28', model: 'Galaxy A90 5G', codes: ['SM-A908BZAITV', 'SM-A908B', 'SM-A908BZADEUE'] }
];

async function run() {
  for (const item of candidates) {
    let found = false;
    for (const code of item.codes) {
      const url = new URL('https://live.icecat.biz/api/');
      url.searchParams.set('UserName', username);
      url.searchParams.set('Language', 'tr');
      url.searchParams.set('Brand', 'Samsung');
      url.searchParams.set('ProductCode', code);
      url.searchParams.set('content', 'all');

      try {
        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json', 'api-token': apiToken }
        });
        const json = await res.json().catch(() => null);
        if (res.status === 200 && json?.msg === 'OK' && json?.data) {
          console.log(`[FOUND!] ${item.model} (${item.id}) with code=${code} -> Title: "${json.data.GeneralInfo?.Title?.slice(0, 55)}" | Groups=${json.data.FeaturesGroups?.length}`);
          found = true;
          break;
        }
      } catch (e) {}
    }
    if (!found) {
      console.log(`[NOT FOUND] ${item.model} (${item.id})`);
    }
  }
}

run();
