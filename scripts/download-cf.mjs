import https from 'https';
import http from 'http';
import fs from 'fs';
import { chmod } from 'fs/promises';

const url = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64';
const outPath = '/home/z/cloudflared';

function download(downloadUrl) {
  console.log('Downloading from:', downloadUrl);
  
  const client = downloadUrl.startsWith('https') ? https : http;
  
  client.get(downloadUrl, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Location:', res.headers.location);
    
    if (res.statusCode === 302 || res.statusCode === 301) {
      download(res.headers.location);
      return;
    }
    
    if (res.statusCode !== 200) {
      console.error('Failed:', res.statusCode);
      process.exit(1);
    }
    
    const file = fs.createWriteStream(outPath);
    let downloaded = 0;
    
    res.on('data', (chunk) => {
      downloaded += chunk.length;
      if (downloaded % 5000000 < chunk.length) {
        console.log('Progress:', Math.round(downloaded / 1024 / 1024), 'MB');
      }
    });
    
    res.pipe(file);
    
    file.on('finish', async () => {
      file.close();
      await chmod(outPath, 0o755);
      const size = fs.statSync(outPath).size;
      console.log('Done! Size:', Math.round(size / 1024 / 1024), 'MB');
    });
  }).on('error', (e) => {
    console.error('Error:', e.message);
  });
}

download(url);
