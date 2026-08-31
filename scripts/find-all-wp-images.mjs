import fs from 'fs';
import path from 'path';

function getAllFiles(dir, all = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.next') && !p.includes('.git') && !p.includes('out')) {
        getAllFiles(p, all);
      }
    } else if (f.endsWith('.json') || f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.mjs')) {
      all.push(p);
    }
  }
  return all;
}

const files = getAllFiles('.');
const urls = new Set();
const regex = /https:\/\/(www\.)?nosecreekphysiotherapy\.com\/wp-content\/uploads\/[^\s"'<>\)]+/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = regex.exec(content)) !== null) {
    // clean any trailing quote or slash
    let u = m[0].replace(/['"]$/, '');
    urls.add(u);
  }
}

const urlList = Array.from(urls);
console.log('Total unique URLs found:', urlList.length);
fs.writeFileSync('scripts/wp-image-urls.json', JSON.stringify(urlList, null, 2));
console.log('Saved to scripts/wp-image-urls.json');
