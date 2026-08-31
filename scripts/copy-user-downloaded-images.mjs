import fs from 'fs';
import path from 'path';

const downloadsDir = 'C:/Users/Zbook/Downloads';
const targetDir = path.resolve('public/images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Map files from Downloads into public/images with exact target filenames
const mapping = [
  { from: 'nose-creek-logo.webp', to: ['nose-creek-logo.webp'] },
  { from: 'home-hero img.jpg', to: ['reception-desktop.jpg', 'home-hero.jpg'] },
  { from: 'About Nose creek left img.jpg', to: ['reception-three.jpg', 'about-left.jpg'] },
  { from: 'About Nose Creek Physiotherapy right top.jpg', to: ['reception-four.jpg', 'about-right-top.jpg'] },
  { from: 'About Nose Creek Physiotherapy right bottom.jpg', to: ['clinic-mobile.jpg', 'about-right-bottom.jpg'] },
  { from: 'Blair Schachterle.jpg', to: ['blair_schachterle-2.jpg', 'blair-schachterle.jpg'] },
  { from: 'Rizelle Manzano.webp', to: ['Rizelle-Physiotherapist.webp', 'Rizelle.webp'] },
  { from: 'Samuel Adelugba.webp', to: ['Samuel-Adelugba.webp', 'samuel-adelugba.webp'] },
  { from: 'Janvi Shah.webp', to: ['Janvi.webp', 'janvi.webp'] },
  { from: 'Hanna Johnson.webp', to: ['hanna-johnson-1.webp', 'hanna-johnson.webp'] },
  { from: 'Madelyne Agius.webp', to: ['Madelyne.webp', 'madelyne.webp'] },
  { from: 'Dr. Alex Toutant.jpg', to: ['Alex-Toutant-1.jpg', 'alex-toutant.jpg'] },
  { from: 'Katie Luu.jpg', to: ['katie-2-1.jpg', 'katie-luu.jpg'] },
  { from: 'Shawn Gille.jpg', to: ['shawn-gille-1.jpg', 'shawn-gille.jpg'] },
  { from: 'Amalia.webp', to: ['Amalia.webp', 'amalia.webp'] },
  { from: 'Smita Nagpal.webp', to: ['Smita-Nagpal.webp', 'smita-nagpal.webp'] },
  { from: 'Jihan Shayya.webp', to: ['Jihan-Shayya.webp', 'jihan-shayya.webp'] },
  { from: 'Dr. Eileen Wei.jpg', to: ['eileen-1.jpg', 'eileen-wei.jpg'] },
  { from: 'Lorna Ebron.jpg', to: ['lorna-ebron-1-1.jpg', 'lorna-ebron.jpg'] },
  { from: 'navigating-shoulder-muscle-strain-recovery.jpg', to: ['navigating-shoulder-muscle-strain-recovery.jpg'] },
  { from: 'neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg', to: ['neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg'] },
  { from: 'neck-upper-back-posture-jaw-function-tmj-discomfort.jpg', to: ['neck-upper-back-posture-jaw-function-tmj-discomfort.jpg'] },
];

for (const item of mapping) {
  const src = path.join(downloadsDir, item.from);
  if (fs.existsSync(src)) {
    const data = fs.readFileSync(src);
    for (const destName of item.to) {
      const dest = path.join(targetDir, destName);
      fs.writeFileSync(dest, data);
      console.log(`Copied ${item.from} -> ${destName} (${(data.length / 1024).toFixed(1)} KB)`);
    }
  } else {
    console.warn(`Source not found: ${src}`);
  }
}
