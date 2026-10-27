import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

async function testUrl(urlStr: string) {
  try {
    const res = await fetch(urlStr, {
      headers: {
        'api-token': apiToken,
        Accept: 'application/json',
        'User-Agent': 'TechCompare-IcecatIntegration/2.0'
      }
    });
    console.log(`URL: ${urlStr} -> Status: ${res.status}`);
    const text = await res.text();
    console.log(`  Response (first 200 chars): ${text.slice(0, 200)}`);
  } catch (e: any) {
    console.log(`URL: ${urlStr} -> Fetch Error: ${e.message}`);
  }
}

async function run() {
  // Test search endpoints
  await testUrl(`https://live.icecat.biz/api/?UserName=${username}&Language=tr&search=Galaxy%20S24`);
  await testUrl(`https://live.icecat.biz/api/?UserName=${username}&Language=tr&Query=Galaxy%20S24`);
  await testUrl(`https://live.icecat.biz/api/search?UserName=${username}&Language=tr&query=Galaxy%20S24`);
  await testUrl(`https://live.icecat.biz/api/search?q=Galaxy%20S24`);
  await testUrl(`https://icecat.biz/rest/search?query=Galaxy%20S24`);
}
run();
