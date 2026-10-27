import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

async function testIcecat(brand: string, prodCode: string, gtin?: string) {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  if (brand && prodCode) {
    url.searchParams.set('Brand', brand);
    url.searchParams.set('ProductCode', prodCode);
  } else if (gtin) {
    url.searchParams.set('GTIN', gtin);
  }
  if (apiToken) {
    url.searchParams.set('app_key', apiToken);
  }

  console.log(`\nQuerying Icecat for Brand=${brand}, ProductCode=${prodCode}, GTIN=${gtin || 'none'}`);
  console.log('Endpoint URL (redacted):', url.origin + url.pathname + '?Brand=' + brand + '&ProductCode=' + prodCode + '&UserName=' + username);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'TechCompare-IcecatIntegration/2.0'
    };
    if (apiToken) {
      headers['api-token'] = apiToken;
    }

    const res = await fetch(url.toString(), { method: 'GET', headers });
    console.log(`Response HTTP Status: ${res.status} ${res.statusText}`);

    const bodyText = await res.text();
    console.log('Body length:', bodyText.length);
    try {
      const data = JSON.parse(bodyText);
      console.log('Response keys:', Object.keys(data));
      if (data.statusCode) console.log('Icecat statusCode:', data.statusCode);
      if (data.message) console.log('Icecat message:', data.message);
      if (data.data) {
        console.log('Data keys:', Object.keys(data.data));
        console.log('GeneralInfo:', JSON.stringify(data.data.GeneralInfo, null, 2));
        if (data.data.FeaturesGroups) {
          console.log(`FeaturesGroups count: ${data.data.FeaturesGroups.length}`);
          const groupNames = data.data.FeaturesGroups.map((g: any) => g.FeatureGroup?.Name?.Value || g.FeatureGroup?.Name);
          console.log('Feature Groups:', groupNames);
        }
      }
    } catch {
      console.log('Body preview (raw):', bodyText.slice(0, 300));
    }
  } catch (err: any) {
    console.error('Fetch error:', err.message);
  }
}

async function run() {
  // Test 1: Samsung S24
  await testIcecat('Samsung', 'SM-S921BZKDEUE');
  // Test 2: Samsung S24 TR code
  await testIcecat('Samsung', 'SM-S921BZKDTUR');
  // Test 3: Apple iPhone 15 or 16
  await testIcecat('Apple', 'MYND3TU/A');
}

run();
