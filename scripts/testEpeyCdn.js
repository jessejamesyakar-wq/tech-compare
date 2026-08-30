const https = require('https');

const testUrl = 'https://resim.epey.com/917434/z_samsung-galaxy-a55-1.jpg';

https.get(testUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.epey.com/'
  }
}, res => {
  console.log('CDN status code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
}).on('error', err => console.error(err));
