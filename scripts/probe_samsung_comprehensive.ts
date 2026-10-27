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

// Candidates to test for each released model
const candidatesToTest: Array<{ id: string; name: string; codes: string[] }> = [
  // 1. A05
  { id: 'samsung-samsung-galaxy-a05-99', name: 'Galaxy A05', codes: ['SM-A055F', 'SM-A055F/DS', 'SM-A055FZKDEUB', 'SM-A055FZKDEUE', 'SM-A055FZKD'] },
  // 2. A14
  { id: 'samsung-samsung-galaxy-a14-86', name: 'Galaxy A14', codes: ['SM-A145R/DSN', 'SM-A145F', 'SM-A145F/DSN', 'SM-A145R', 'SM-A145FZKUEUE', 'SM-A145FZKDEUB'] },
  // 3. A24
  { id: 'samsung-samsung-galaxy-a24-87', name: 'Galaxy A24', codes: ['SM-A245F', 'SM-A245F/DSN', 'SM-A245FZKVEUE', 'SM-A245FZKNEUE'] },
  // 4. M14 5G
  { id: 'samsung-samsung-galaxy-m14-5g-90', name: 'Galaxy M14 5G', codes: ['SM-M146B', 'SM-M146B/DSN', 'SM-M146BZKDEUE', 'SM-M146BZKDEUB'] },
  // 5. M34 5G
  { id: 'samsung-samsung-galaxy-m34-5g-91', name: 'Galaxy M34 5G', codes: ['SM-M346B', 'SM-M346B/DS', 'SM-M346BZKDEUE'] },
  // 6. M54 5G
  { id: 'samsung-samsung-galaxy-m54-5g-92', name: 'Galaxy M54 5G', codes: ['SM-M546B', 'SM-M546B/DS', 'SM-M546BZKDEUE'] },
  // 7. Z Fold 5
  { id: 'samsung-samsung-galaxy-z-fold-5-85', name: 'Galaxy Z Fold 5', codes: ['SM-F946B', 'SM-F946BZKDEUE', 'SM-F946BZAGEUE', 'SM-F946BZEGEUE'] },
  // 8. A23
  { id: 'samsung-samsung-galaxy-a23-72', name: 'Galaxy A23', codes: ['SM-A235F', 'SM-A235F/DSN', 'SM-A235FZKUEUE', 'SM-A235FZKDEUB'] },
  // 9. A73 5G
  { id: 'samsung-samsung-galaxy-a73-5g-75', name: 'Galaxy A73 5G', codes: ['SM-A736B', 'SM-A736B/DS', 'SM-A736BZKDEUE'] },
  // 10. M13
  { id: 'samsung-samsung-galaxy-m13-76', name: 'Galaxy M13', codes: ['SM-M135F', 'SM-M135F/DSN', 'SM-M135FZKUEUE', 'SM-M135FZKDEUB'] },
  // 11. M23 5G
  { id: 'samsung-samsung-galaxy-m23-5g-77', name: 'Galaxy M23 5G', codes: ['SM-M236B', 'SM-M236B/DS', 'SM-M236BZKDEUE'] },
  // 12. M33 5G
  { id: 'samsung-samsung-galaxy-m33-5g-78', name: 'Galaxy M33 5G', codes: ['SM-M336B', 'SM-M336B/DS', 'SM-M336BZKDEUE'] },
  // 13. M53 5G
  { id: 'samsung-samsung-galaxy-m53-5g-79', name: 'Galaxy M53 5G', codes: ['SM-M536B', 'SM-M536B/DS', 'SM-M536BZKDEUE'] },
  // 14. Z Flip 4
  { id: 'samsung-samsung-galaxy-z-flip-4-69', name: 'Galaxy Z Flip 4', codes: ['SM-F721B', 'SM-F721BZADEUE', 'SM-F721BZDDEUE', 'SM-F721BZAGEUE'] },
  // 15. Z Fold 4
  { id: 'samsung-samsung-galaxy-z-fold-4-70', name: 'Galaxy Z Fold 4', codes: ['SM-F936B', 'SM-F936BZKDEUE', 'SM-F936BZEGEUE'] },
  // 16. A02
  { id: 'samsung-samsung-galaxy-a02-56', name: 'Galaxy A02', codes: ['SM-A022G', 'SM-A022G/DS', 'SM-A022GZKDEUE', 'SM-A022GZKDEUB'] },
  // 17. A12
  { id: 'samsung-samsung-galaxy-a12-57', name: 'Galaxy A12', codes: ['SM-A127F', 'SM-A127F/DSN', 'SM-A125F', 'SM-A127FZKEEUB', 'SM-A127FZKDEUE'] },
  // 18. M12
  { id: 'samsung-samsung-galaxy-m12-63', name: 'Galaxy M12', codes: ['SM-M127F', 'SM-M127F/DSN', 'SM-M127FZKDEUE'] },
  // 19. M32
  { id: 'samsung-samsung-galaxy-m32-64', name: 'Galaxy M32', codes: ['SM-M325FV', 'SM-M325FV/DS', 'SM-M325FZKDEUE'] },
  // 20. Z Flip 3
  { id: 'samsung-samsung-galaxy-z-flip-3-54', name: 'Galaxy Z Flip 3', codes: ['SM-F711B', 'SM-F711BZKDEUE', 'SM-F711BZEEEUE'] },
  // 21. A51
  { id: 'samsung-samsung-galaxy-a51-44', name: 'Galaxy A51', codes: ['SM-A515F', 'SM-A515F/DSN', 'SM-A515FZKDEUE', 'SM-A515FZKDEUB'] },
  // 22. A71
  { id: 'samsung-samsung-galaxy-a71-45', name: 'Galaxy A71', codes: ['SM-A715F', 'SM-A715F/DS', 'SM-A715FZKDEUE'] },
  // 23. Note 20
  { id: 'samsung-samsung-galaxy-note-20-36', name: 'Galaxy Note 20', codes: ['SM-N980F', 'SM-N980F/DS', 'SM-N980FZNHEUE', 'SM-N981B'] },
  // 24. A50
  { id: 'samsung-samsung-galaxy-a50-24', name: 'Galaxy A50', codes: ['SM-A505FN/DS', 'SM-A505F', 'SM-A505FN', 'SM-A505FZKDEUE'] },
  // 25. A70
  { id: 'samsung-samsung-galaxy-a70-26', name: 'Galaxy A70', codes: ['SM-A705FN/DS', 'SM-A705F', 'SM-A705FN', 'SM-A705FZKDEUE'] },
  // 26. A80
  { id: 'samsung-samsung-galaxy-a80-27', name: 'Galaxy A80', codes: ['SM-A805F', 'SM-A805F/DS', 'SM-A805FZKDEUE'] },
  // 27. A16 5G
  { id: 'samsung-samsung-galaxy-a16-5g-114', name: 'Galaxy A16 5G', codes: ['SM-A166BZKDEUB', 'SM-A166B'] },
  // 28. A21s
  { id: 'samsung-samsung-galaxy-a21s-41', name: 'Galaxy A21s', codes: ['SM-A217FZKNEUA', 'SM-A217F/DS', 'SM-A217F'] },
  // 29. A31
  { id: 'samsung-samsung-galaxy-a31-42', name: 'Galaxy A31', codes: ['SM-A315G/DS', 'SM-A315F/DS', 'SM-A315G', 'SM-A315F', 'SM-A315FZKDEUE'] },
  // 30. A41
  { id: 'samsung-samsung-galaxy-a41-43', name: 'Galaxy A41', codes: ['SM-A415FZKDEUE', 'SM-A415F/DSN'] },
  // 31. M11
  { id: 'samsung-samsung-galaxy-m11-46', name: 'Galaxy M11', codes: ['SM-M115M/DS', 'SM-M115F/DS', 'SM-M115F'] },
  // 32. M21
  { id: 'samsung-samsung-galaxy-m21-47', name: 'Galaxy M21', codes: ['SM-M215F/DS', 'SM-M215F'] },
  // 33. M31
  { id: 'samsung-samsung-galaxy-m31-48', name: 'Galaxy M31', codes: ['SM-M315F/DS', 'SM-M315F'] },
  // 34. M51
  { id: 'samsung-samsung-galaxy-m51-49', name: 'Galaxy M51', codes: ['SM-M515FZKDEUE', 'SM-M515F/DSN'] },
  // 35. Z Flip (Original)
  { id: 'samsung-samsung-galaxy-z-flip-38', name: 'Galaxy Z Flip', codes: ['SM-F700F/DS', 'SM-F700F', 'SM-F700FZKDITV'] },
  // 36. Z Fold 2
  { id: 'samsung-samsung-galaxy-z-fold-2-39', name: 'Galaxy Z Fold 2', codes: ['SM-F916B', 'SM-F916BZKDEUE', 'SM-F916BZNNEUE'] },
  // 37. A10
  { id: 'samsung-samsung-galaxy-a10-20', name: 'Galaxy A10', codes: ['SM-A105FN/DS', 'SM-A105F/DS', 'SM-A105FN', 'SM-A105FZKDITV'] },
  // 38. A20
  { id: 'samsung-samsung-galaxy-a20-21', name: 'Galaxy A20', codes: ['SM-A205FN/DS', 'SM-A205F/DS', 'SM-A205F'] },
  // 39. A30
  { id: 'samsung-samsung-galaxy-a30-22', name: 'Galaxy A30', codes: ['SM-A305FN/DS', 'SM-A305F/DS', 'SM-A305FN'] },
  // 40. A40
  { id: 'samsung-samsung-galaxy-a40-23', name: 'Galaxy A40', codes: ['SM-A405FN/DS', 'SM-A405FN'] },
  // 41. A90 5G
  { id: 'samsung-samsung-galaxy-a90-5g-28', name: 'Galaxy A90 5G', codes: ['SM-A908B', 'SM-A908B/DS', 'SM-A908BZWDEUE'] },
  // 42. Galaxy Fold (Original)
  { id: 'samsung-samsung-galaxy-fold-19', name: 'Galaxy Fold', codes: ['SM-F900F', 'SM-F907B', 'SM-F900FZKDITV'] },
  // 43. M10
  { id: 'samsung-samsung-galaxy-m10-29', name: 'Galaxy M10', codes: ['SM-M105G/DS', 'SM-M105M/DS', 'SM-M105F'] },
  // 44. M20
  { id: 'samsung-samsung-galaxy-m20-30', name: 'Galaxy M20', codes: ['SM-M205FN/DS', 'SM-M205FN', 'SM-M205F'] },
  // 45. M30
  { id: 'samsung-samsung-galaxy-m30-31', name: 'Galaxy M30', codes: ['SM-M305F/DS', 'SM-M305F'] },
  // 46. M15 5G
  { id: 'samsung-samsung-galaxy-m15-5g-104', name: 'Galaxy M15 5G', codes: ['SM-M156B', 'SM-M156B/DSN', 'SM-M156BZKDEUE', 'SM-M156BDBDEUB'] },
  // 47. M35 5G
  { id: 'samsung-samsung-galaxy-m35-5g-105', name: 'Galaxy M35 5G', codes: ['SM-M356B', 'SM-M356B/DS', 'SM-M356BZKDEUE'] },
  // 48. M55 5G
  { id: 'samsung-samsung-galaxy-m55-5g-106', name: 'Galaxy M55 5G', codes: ['SM-M556B', 'SM-M556B/DS', 'SM-M556BZKDEUE'] },
  // 49. A06
  { id: 'samsung-samsung-galaxy-a06-113', name: 'Galaxy A06', codes: ['SM-A065F', 'SM-A065F/DS', 'SM-A065FZKDEUE'] }
];

async function run() {
  console.log(`Starting probe for ${candidatesToTest.length} released Samsung models...`);
  const resolved: Record<string, { mpn: string; title: string; groups: number }> = {};
  const notFound: string[] = [];

  for (let i = 0; i < candidatesToTest.length; i++) {
    const item = candidatesToTest[i];
    let matched = false;

    for (const code of item.codes) {
      await sleep(350);
      const res = await queryIcecat('Samsung', code);
      if (res.ok) {
        console.log(`[MATCH] ${item.name} (${item.id}) -> MPN: "${code}" | Title: "${res.title?.slice(0, 45)}" | Groups: ${res.groups}`);
        resolved[item.id] = { mpn: code, title: res.title || '', groups: res.groups || 0 };
        matched = true;
        break;
      }
    }

    if (!matched) {
      console.log(`[NOT FOUND] ${item.name} (${item.id})`);
      notFound.push(item.id);
    }
  }

  console.log(`\n=== PROBE COMPLETE ===`);
  console.log(`Successfully resolved in Icecat: ${Object.keys(resolved).length}/${candidatesToTest.length}`);
  console.log(`Not found in Icecat: ${notFound.length}/${candidatesToTest.length}`);
  fs.writeFileSync('reports/icecat-phones-400/samsung_probed_matches.json', JSON.stringify(resolved, null, 2), 'utf8');
}

run();
