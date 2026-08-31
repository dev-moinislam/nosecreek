import fs from 'fs';
import path from 'path';

function getAllFiles(dir, all = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.next') && !p.includes('.git') && !p.includes('out')) {
        getAllFiles(p, all);
      }
    } else if (f.endsWith('.json') || f.endsWith('.tsx') || f.endsWith('.ts')) {
      all.push(p);
    }
  }
  return all;
}

const files = getAllFiles('src');

// Map of replacements
const customMappings = {
  'Sport-Physiotherapy-canada-1.png': 'sport-physiotherapy-canada.png',
  'CAMPT-1.gif': 'campt.gif',
  'Canadian-Physiotherapy-Association.png': 'canadian-physiotherapy-association.png',
  'physiotherapy-alberta.png': 'physiotherapy-alberta.png',
  'fitterfirst.png': 'fitterfirst.png',
  'alberta-health-services.png': 'alberta-health-services.png',
  'the-running-clinic.png': 'the-running-clinic.png',
  'Complete-Concussion-Management.png': 'complete-concussion-management.png',
  'The-Hip-Knee-Clinic.png': 'the-hip-knee-clinic.png',
  'orthotics-webinar.webp': 'orthotics-webinar.jpg'
};

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace any https://www.nosecreekphysiotherapy.com/wp-content/uploads/<filename>
  content = content.replace(/https:\/\/(www\.)?nosecreekphysiotherapy\.com\/wp-content\/uploads\/([a-zA-Z0-9_\-\.]+)/g, (match, p1, filename) => {
    if (customMappings[filename]) {
      return `/images/${customMappings[filename]}`;
    }
    return `/images/${filename}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated: ${file}`);
    modifiedCount++;
  }
}

console.log(`Successfully updated ${modifiedCount} files.`);
