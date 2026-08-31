import fs from 'fs';
import path from 'path';
import https from 'https';

const outDir = path.resolve('public/images/team');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const teamFile = path.resolve('src/data/team.json');
const teamData = JSON.parse(fs.readFileSync(teamFile, 'utf8'));

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(true));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading team images...');
  for (const member of teamData) {
    if (member.profileImage && member.profileImage.startsWith('http')) {
      const ext = path.extname(member.profileImage.split('?')[0]) || '.jpg';
      const filename = `${member.slug}${ext}`;
      const dest = path.join(outDir, filename);
      
      console.log(`Downloading ${member.name} image from ${member.profileImage}...`);
      try {
        await downloadFile(member.profileImage, dest);
        console.log(`Saved to ${dest}`);
        member.profileImage = `/images/team/${filename}`;
      } catch (err) {
        console.error(`Error downloading for ${member.name}:`, err.message);
      }
    }
  }

  fs.writeFileSync(teamFile, JSON.stringify(teamData, null, 2), 'utf8');
  console.log('Updated team.json with local images successfully!');
}

run();
