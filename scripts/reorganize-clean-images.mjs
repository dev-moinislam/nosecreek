import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('public/images');
const backupSourceDir = 'C:/Users/Zbook/Downloads';
const userUploadDir = 'C:/Users/Zbook/.gemini/antigravity-ide/brain/d87cc8d0-0fc1-470f-b885-e6598f888a91/.user_uploaded';

// 1. Structure definition: category -> files
const categorizedImages = {
  logo: [
    { targetName: 'nose-creek-logo.webp', sources: [path.join(baseDir, 'nose-creek-logo.webp'), path.join(backupSourceDir, 'nose-creek-logo.webp')] }
  ],
  clinic: [
    { targetName: 'reception-desktop.jpg', sources: [path.join(baseDir, 'reception-desktop.jpg'), path.join(backupSourceDir, 'home-hero img.jpg')] },
    { targetName: 'reception-three.jpg', sources: [path.join(baseDir, 'reception-three.jpg'), path.join(backupSourceDir, 'About Nose creek left img.jpg')] },
    { targetName: 'reception-four.jpg', sources: [path.join(baseDir, 'reception-four.jpg'), path.join(backupSourceDir, 'About Nose Creek Physiotherapy right top.jpg')] },
    { targetName: 'clinic-mobile.jpg', sources: [path.join(baseDir, 'clinic-mobile.jpg'), path.join(backupSourceDir, 'About Nose Creek Physiotherapy right bottom.jpg')] }
  ],
  team: [
    { targetName: 'blair-schachterle.jpg', sources: [path.join(baseDir, 'blair_schachterle-2.jpg'), path.join(backupSourceDir, 'Blair Schachterle.jpg')] },
    { targetName: 'rizelle-manzano.webp', sources: [path.join(baseDir, 'Rizelle-Physiotherapist.webp'), path.join(backupSourceDir, 'Rizelle Manzano.webp')] },
    { targetName: 'samuel-adelugba.webp', sources: [path.join(baseDir, 'Samuel-Adelugba.webp'), path.join(backupSourceDir, 'Samuel Adelugba.webp')] },
    { targetName: 'janvi-shah.webp', sources: [path.join(baseDir, 'Janvi.webp'), path.join(backupSourceDir, 'Janvi Shah.webp')] },
    { targetName: 'hanna-johnson.webp', sources: [path.join(baseDir, 'hanna-johnson-1.webp'), path.join(backupSourceDir, 'Hanna Johnson.webp')] },
    { targetName: 'madelyne-agius.webp', sources: [path.join(baseDir, 'Madelyne.webp'), path.join(backupSourceDir, 'Madelyne Agius.webp')] },
    { targetName: 'alex-toutant.jpg', sources: [path.join(baseDir, 'Alex-Toutant-1.jpg'), path.join(backupSourceDir, 'Dr. Alex Toutant.jpg')] },
    { targetName: 'katie-luu.jpg', sources: [path.join(baseDir, 'katie-2-1.jpg'), path.join(backupSourceDir, 'Katie Luu.jpg')] },
    { targetName: 'shawn-gille.jpg', sources: [path.join(baseDir, 'shawn-gille-1.jpg'), path.join(backupSourceDir, 'Shawn Gille.jpg')] },
    { targetName: 'amalia.webp', sources: [path.join(baseDir, 'Amalia.webp'), path.join(backupSourceDir, 'Amalia.webp')] },
    { targetName: 'smita-nagpal.webp', sources: [path.join(baseDir, 'Smita-Nagpal.webp'), path.join(backupSourceDir, 'Smita Nagpal.webp')] },
    { targetName: 'jihan-shayya.webp', sources: [path.join(baseDir, 'Jihan-Shayya.webp'), path.join(backupSourceDir, 'Jihan Shayya.webp')] },
    { targetName: 'eileen-wei.jpg', sources: [path.join(baseDir, 'eileen-1.jpg'), path.join(backupSourceDir, 'Dr. Eileen Wei.jpg'), path.join(userUploadDir, 'media_1787934631949.jpg')] },
    { targetName: 'lorna-ebron.jpg', sources: [path.join(baseDir, 'lorna-ebron-1-1.jpg'), path.join(backupSourceDir, 'Lorna Ebron.jpg'), path.join(userUploadDir, 'media_1787934631941.jpg')] }
  ],
  credentials: [
    { targetName: 'pain-hero.png', sources: [path.join(baseDir, 'pain-hero-2.png'), path.join(userUploadDir, 'media_1787935450299.png')] },
    { targetName: 'cpa.png', sources: [path.join(baseDir, 'CPA-header-logo-en-1.png'), path.join(userUploadDir, 'media_1787935450306.png')] },
    { targetName: 'crmta.png', sources: [path.join(baseDir, 'CRMTA-OPT4FINI_V-site-logo-1.png'), path.join(userUploadDir, 'media_1787935450323.png')] },
    { targetName: 'ortho-division.png', sources: [path.join(baseDir, 'OrthoDivision-1.png'), path.join(userUploadDir, 'media_1787935450344.png')] },
    { targetName: 'sport-physiotherapy-canada.png', sources: [path.join(baseDir, 'Sport-Physiotherapy-canada-1.png'), path.join(userUploadDir, 'media_1787935450373.png')] }
  ],
  blog: [
    { targetName: 'navigating-shoulder-muscle-strain-recovery.jpg', sources: [path.join(baseDir, 'navigating-shoulder-muscle-strain-recovery.jpg'), path.join(backupSourceDir, 'navigating-shoulder-muscle-strain-recovery.jpg')] },
    { targetName: 'neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg', sources: [path.join(baseDir, 'neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg'), path.join(backupSourceDir, 'neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg')] },
    { targetName: 'neck-upper-back-posture-jaw-function-tmj-discomfort.jpg', sources: [path.join(baseDir, 'neck-upper-back-posture-jaw-function-tmj-discomfort.jpg'), path.join(backupSourceDir, 'neck-upper-back-posture-jaw-function-tmj-discomfort.jpg')] }
  ],
  workshops: [
    { targetName: 'orthotics-webinar.jpg', sources: [path.join(baseDir, 'orthotics-webinar.jpg')] }
  ]
};

// 2. Prepare target directories and move files
const tempStorage = {};

for (const [folder, items] of Object.entries(categorizedImages)) {
  const folderPath = path.join(baseDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  for (const item of items) {
    let foundBuffer = null;
    for (const src of item.sources) {
      if (fs.existsSync(src) && fs.statSync(src).size > 1000) {
        foundBuffer = fs.readFileSync(src);
        break;
      }
    }
    if (foundBuffer) {
      tempStorage[`${folder}/${item.targetName}`] = foundBuffer;
    } else {
      console.error(`MISSING IMAGE: ${folder}/${item.targetName}`);
    }
  }
}

// 3. Clean public/images completely of old files
const rootFiles = fs.readdirSync(baseDir);
for (const f of rootFiles) {
  const p = path.join(baseDir, f);
  if (fs.statSync(p).isDirectory()) {
    fs.rmSync(p, { recursive: true, force: true });
  } else {
    fs.unlinkSync(p);
  }
}

// 4. Write all organized files back
for (const [relPath, buffer] of Object.entries(tempStorage)) {
  const fullPath = path.join(baseDir, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, buffer);
  console.log(`Saved: /images/${relPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// 5. Update code references
const pathReplacements = [
  // Logo
  { from: /\/images\/nose-creek-logo\.webp/g, to: '/images/logo/nose-creek-logo.webp' },
  // Clinic
  { from: /\/images\/reception-desktop\.jpg/g, to: '/images/clinic/reception-desktop.jpg' },
  { from: /\/images\/reception-three\.jpg/g, to: '/images/clinic/reception-three.jpg' },
  { from: /\/images\/reception-four\.jpg/g, to: '/images/clinic/reception-four.jpg' },
  { from: /\/images\/clinic-mobile\.jpg/g, to: '/images/clinic/clinic-mobile.jpg' },
  // Team
  { from: /\/images\/(blair_schachterle-2|blair-schachterle)\.jpg/g, to: '/images/team/blair-schachterle.jpg' },
  { from: /\/images\/(Rizelle-Physiotherapist|Rizelle)\.webp/g, to: '/images/team/rizelle-manzano.webp' },
  { from: /\/images\/Samuel-Adelugba\.webp/g, to: '/images/team/samuel-adelugba.webp' },
  { from: /\/images\/Janvi\.webp/g, to: '/images/team/janvi-shah.webp' },
  { from: /\/images\/hanna-johnson-1\.webp/g, to: '/images/team/hanna-johnson.webp' },
  { from: /\/images\/Madelyne\.webp/g, to: '/images/team/madelyne-agius.webp' },
  { from: /\/images\/(Alex-Toutant-1|alex-toutant)\.jpg/g, to: '/images/team/alex-toutant.jpg' },
  { from: /\/images\/(katie-2-1|katie-luu)\.jpg/g, to: '/images/team/katie-luu.jpg' },
  { from: /\/images\/(shawn-gille-1|shawn-gille)\.jpg/g, to: '/images/team/shawn-gille.jpg' },
  { from: /\/images\/Amalia\.webp/g, to: '/images/team/amalia.webp' },
  { from: /\/images\/Smita-Nagpal\.webp/g, to: '/images/team/smita-nagpal.webp' },
  { from: /\/images\/Jihan-Shayya\.webp/g, to: '/images/team/jihan-shayya.webp' },
  { from: /\/images\/(eileen-1|eileen-wei)\.jpg/g, to: '/images/team/eileen-wei.jpg' },
  { from: /\/images\/(lorna-ebron-1-1|lorna-ebron)\.jpg/g, to: '/images/team/lorna-ebron.jpg' },
  // Credentials
  { from: /\/images\/(pain-hero-2|painhero)\.png/g, to: '/images/credentials/pain-hero.png' },
  { from: /\/images\/(CPA-header-logo-en-1|canadian-physiotherapy-association)\.png/g, to: '/images/credentials/cpa.png' },
  { from: /\/images\/(CRMTA-OPT4FINI_V-site-logo-1|crmta)\.png/g, to: '/images/credentials/crmta.png' },
  { from: /\/images\/(OrthoDivision-1|ortho-division)\.png/g, to: '/images/credentials/ortho-division.png' },
  { from: /\/images\/(Sport-Physiotherapy-canada-1|sport-physiotherapy-canada)\.png/g, to: '/images/credentials/sport-physiotherapy-canada.png' },
  // Blog
  { from: /\/images\/navigating-shoulder-muscle-strain-recovery\.jpg/g, to: '/images/blog/navigating-shoulder-muscle-strain-recovery.jpg' },
  { from: /\/images\/neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision\.jpg/g, to: '/images/blog/neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg' },
  { from: /\/images\/neck-upper-back-posture-jaw-function-tmj-discomfort\.jpg/g, to: '/images/blog/neck-upper-back-posture-jaw-function-tmj-discomfort.jpg' },
  // Workshops
  { from: /\/images\/orthotics-webinar\.(jpg|webp)/g, to: '/images/workshops/orthotics-webinar.jpg' }
];

function getAllSrcFiles(dir, all = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      getAllSrcFiles(p, all);
    } else if (f.endsWith('.json') || f.endsWith('.tsx') || f.endsWith('.ts')) {
      all.push(p);
    }
  }
  return all;
}

const srcFiles = getAllSrcFiles('src');
for (const file of srcFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  for (const rep of pathReplacements) {
    content = content.replace(rep.from, rep.to);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated paths in: ${file}`);
  }
}
