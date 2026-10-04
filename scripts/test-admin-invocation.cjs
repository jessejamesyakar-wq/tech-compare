const fs = require('fs');

function getToken() {
  const sources = [process.env.TEMP + '/test_dev.env', '.env.local'];
  for (const s of sources) {
    if (fs.existsSync(s)) {
      const content = fs.readFileSync(s, 'utf8');
      const match = content.match(/ADMIN_ANALYTICS_TOKEN=(.+)/);
      if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return process.env.ADMIN_ANALYTICS_TOKEN;
}

const adminToken = getToken();

async function run() {
  const url = 'https://www.aceleetme.tech/api/admin/analytics';
  console.log('Sending authorized request with ADMIN_ANALYTICS_TOKEN to:', url);
  const res = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + adminToken
    }
  });
  console.log('HTTP Status:', res.status);
  const json = await res.json();
  console.log('Response Body:', JSON.stringify(json, null, 2));
}

run().catch(console.error);
