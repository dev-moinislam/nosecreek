import puppeteer from 'puppeteer-core';
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

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const outDir = path.resolve('public/images/team');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function main() {
  console.log('Launching browser at:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false, // Non-headless easily passes Cloudflare challenge
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  console.log('Navigating to team page...');
  await page.goto('https://www.nosecreekphysiotherapy.com/team/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  console.log('Waiting for Cloudflare verification to finish...');
  for (let i = 0; i < 20; i++) {
    const title = await page.title();
    console.log(`Current Title (${i}): ${title}`);
    if (title && !title.includes('One moment') && !title.includes('Just a moment')) {
      console.log('Verified page loaded!');
      break;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Wait extra 3 seconds for images to render
  await new Promise((r) => setTimeout(r, 3000));

  for (const [slug, url] of Object.entries(teamMapping)) {
    const ext = path.extname(url.split('?')[0]) || '.jpg';
    const filename = `${slug}${ext}`;
    const dest = path.join(outDir, filename);

    try {
      const base64Data = await page.evaluate(async (imgUrl) => {
        try {
          const res = await fetch(imgUrl);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          return null;
        }
      }, url);

      if (base64Data && base64Data.startsWith('data:image')) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(dest, buffer);
          console.log(`✓ Successfully extracted ${slug} -> ${filename} (${buffer.length} bytes)`);
        }
      } else {
        console.warn(`Could not extract base64 for ${slug} (${url})`);
      }
    } catch (err) {
      console.error(`Error on ${slug}:`, err.message);
    }
  }

  await browser.close();
  console.log('Done extracting all real team images!');
}

main();
