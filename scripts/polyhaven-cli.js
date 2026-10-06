import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const BASE_URL = 'https://api.polyhaven.com';

async function search(category = 'hdris', query = '') {
  const res = await fetch(`${BASE_URL}/assets?type=${category}`);
  const data = await res.json();
  const matches = Object.entries(data).filter(([id, info]) => {
    if (!query) return true;
    return id.toLowerCase().includes(query.toLowerCase()) || 
           (info.name && info.name.toLowerCase().includes(query.toLowerCase())) ||
           (info.tags && info.tags.some(t => t.toLowerCase().includes(query.toLowerCase())));
  });
  console.log(`Found ${matches.length} assets matching "${query}" in "${category}":`);
  matches.slice(0, 15).forEach(([id, info]) => {
    console.log(` - ${id}: ${info.name || id} (tags: ${(info.tags || []).slice(0, 4).join(', ')})`);
  });
}

async function downloadHdri(assetId, resolution = '1k', outDir = 'public/textures/hdri') {
  console.log(`Fetching files metadata for ${assetId}...`);
  const res = await fetch(`${BASE_URL}/files/${assetId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata for ${assetId}: ${res.statusText}`);
  }
  const files = await res.json();
  const hdriData = files.hdri?.[resolution]?.hdr;
  if (!hdriData?.url) {
    throw new Error(`Resolution ${resolution} (.hdr) not available for ${assetId}. Available resolutions: ${Object.keys(files.hdri || {})}`);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const fileName = `${assetId}_${resolution}.hdr`;
  const targetPath = path.join(outDir, fileName);

  console.log(`Downloading ${hdriData.url} to ${targetPath}...`);
  const fileStream = fs.createWriteStream(targetPath);
  
  await new Promise((resolve, reject) => {
    https.get(hdriData.url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirected) => {
          redirected.pipe(fileStream);
          fileStream.on('finish', resolve);
        }).on('error', reject);
      } else {
        response.pipe(fileStream);
        fileStream.on('finish', resolve);
      }
    }).on('error', reject);
  });

  console.log(`Successfully downloaded: ${targetPath}`);
}

const [action, ...args] = process.argv.slice(2);

if (action === 'search') {
  const category = args[0] || 'hdris';
  const query = args[1] || '';
  search(category, query);
} else if (action === 'download-hdri') {
  const assetId = args[0];
  const resolution = args[1] || '1k';
  if (!assetId) {
    console.log('Usage: node scripts/polyhaven-cli.js download-hdri <asset-id> [1k|2k|4k]');
    process.exit(1);
  }
  downloadHdri(assetId, resolution).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
} else {
  console.log('Poly Haven Asset CLI:');
  console.log('  search [hdris|textures|models] [query]');
  console.log('  download-hdri <asset-id> [1k|2k|4k]');
}
