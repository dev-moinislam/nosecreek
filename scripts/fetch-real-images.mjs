import fs from 'fs';
import path from 'path';

const teamMapping = {
  "blair-schachterle": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/blair_schachterle-2.jpg",
  "rizelle-manzano": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Rizelle.webp",
  "samuel-adelugba": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Samuel-Adelugba.webp",
  "janvi-shah": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Janvi.webp",
  "hanna-johnson": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/hanna-johnson-1.webp",
  "madelyne-agius": "https://nosecreek.wpenginepowered.com/wp-content/uploads/Madelyne.webp",
  "dr-alex-toutant": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Alex-Toutant-1.jpg",
  "katie-luu": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/katie-2-1.jpg",
  "shawn-gille": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/shawn-gille-1.jpg",
  "amalia": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Amalia.webp",
  "smita-nagpal": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Smita-Nagpal.webp",
  "jihan-shayya": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/Jihan-Shayya.webp",
  "dr-eileen-wei": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/eileen-1.jpg",
  "lorna-ebron": "https://www.nosecreekphysiotherapy.com/wp-content/uploads/lorna-ebron-1-1.jpg"
};

const outDir = path.resolve('public/images/team');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  for (const [slug, url] of Object.entries(teamMapping)) {
    const ext = path.extname(url.split('?')[0]) || '.jpg';
    const filename = `${slug}${ext}`;
    const dest = path.join(outDir, filename);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site'
        }
      });
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Downloaded ${slug} -> ${filename} (${buffer.length} bytes, type: ${res.headers.get('content-type')})`);
    } catch (e) {
      console.error(`Failed ${slug}:`, e.message);
    }
  }
}

run();
