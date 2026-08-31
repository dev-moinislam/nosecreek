import fs from 'fs';
import path from 'path';

const allImages = [
  { dest: 'public/images/nose-creek-logo.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/nose-creek-logo.webp' },
  { dest: 'public/images/reception-desktop.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/reception-desktop.jpg' },
  { dest: 'public/images/reception-three.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/reception-three.jpg' },
  { dest: 'public/images/reception-four.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/reception-four.jpg' },
  { dest: 'public/images/clinic-mobile.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/clinic-mobile.jpg' },
  { dest: 'public/images/mark.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/mark.jpg' },
  { dest: 'public/images/jayne.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/jayne.jpg' },
  { dest: 'public/images/orthotics-webinar.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/orthotics-webinar.webp' },
  { dest: 'public/images/sport-physiotherapy-canada.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Sport-Physiotherapy-canada-1.png' },
  { dest: 'public/images/campt.gif', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/CAMPT-1.gif' },
  { dest: 'public/images/canadian-physiotherapy-association.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Canadian-Physiotherapy-Association.png' },
  { dest: 'public/images/physiotherapy-alberta.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/physiotherapy-alberta.png' },
  { dest: 'public/images/fitterfirst.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/fitterfirst.png' },
  { dest: 'public/images/alberta-health-services.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/alberta-health-services.png' },
  { dest: 'public/images/the-running-clinic.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/the-running-clinic.png' },
  { dest: 'public/images/complete-concussion-management.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Complete-Concussion-Management.png' },
  { dest: 'public/images/the-hip-knee-clinic.png', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/The-Hip-Knee-Clinic.png' },
  // Blog images
  { dest: 'public/images/blog-shoulder-strain.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/navigating-shoulder-muscle-strain-recovery.jpg' },
  { dest: 'public/images/blog-neck-whiplash.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/neck-whiplash-persistent-headaches-daily-focus-motor-vehicle-collision.jpg' },
  { dest: 'public/images/blog-tmj-posture.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/neck-upper-back-posture-jaw-function-tmj-discomfort.jpg' },
  // Team images
  { dest: 'public/images/team/blair-schachterle.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/blair_schachterle-2.jpg' },
  { dest: 'public/images/team/rizelle-manzano.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Rizelle-Physiotherapist.webp' },
  { dest: 'public/images/team/samuel-adelugba.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Samuel-Adelugba.webp' },
  { dest: 'public/images/team/janvi-shah.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Janvi.webp' },
  { dest: 'public/images/team/hanna-johnson.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/hanna-johnson-1.webp' },
  { dest: 'public/images/team/madelyne-agius.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Madelyne.webp' },
  { dest: 'public/images/team/dr-alex-toutant.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Alex-Toutant-1.jpg' },
  { dest: 'public/images/team/katie-luu.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/katie-2-1.jpg' },
  { dest: 'public/images/team/shawn-gille.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/shawn-gille-1.jpg' },
  { dest: 'public/images/team/amalia.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Amalia.webp' },
  { dest: 'public/images/team/smita-nagpal.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Smita-Nagpal.webp' },
  { dest: 'public/images/team/jihan-shayya.webp', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/Jihan-Shayya.webp' },
  { dest: 'public/images/team/dr-eileen-wei.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/eileen-1.jpg' },
  { dest: 'public/images/team/lorna-ebron.jpg', url: 'https://www.nosecreekphysiotherapy.com/wp-content/uploads/lorna-ebron-1-1.jpg' }
];

async function run() {
  for (const item of allImages) {
    const dir = path.dirname(item.dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.nosecreekphysiotherapy.com/'
        }
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.length > 2000) {
          fs.writeFileSync(item.dest, buffer);
          console.log(`✓ Saved ${item.dest} (${(buffer.length / 1024).toFixed(1)} KB)`);
          continue;
        }
      }
      console.log(`! Failed to fetch ${item.url} (status: ${res.status})`);
    } catch (e) {
      console.log(`! Error ${item.url}: ${e.message}`);
    }
  }
}

run();
