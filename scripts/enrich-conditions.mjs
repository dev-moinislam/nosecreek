import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "src/data/conditions.json");
const conditions = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const clinicImages = [
  "/images/clinic/treatment-hands-on.jpg",
  "/images/clinic/reception-three.jpg",
  "/images/clinic/reception-desktop.jpg",
  "/images/clinic/staff-team-photo.jpg",
  "/images/clinic/treatment-gym.jpg"
];

const enhanced = conditions.map((c, i) => {
  const img1 = clinicImages[i % clinicImages.length];
  const img2 = clinicImages[(i + 1) % clinicImages.length];
  const pos1 = i % 2 === 0 ? "right" : "left";
  const pos2 = i % 3 === 0 ? "left" : i % 3 === 1 ? "right" : "none";

  const customSections = c.customSections || [
    {
      id: `sec-${c.slug}-1`,
      eyebrow: "Personalized Care Protocol",
      eyebrowColor: "#1c9fd8",
      title: `How We Eliminate ${c.name} at the Mechanical Source`,
      subtitle: "Comprehensive assessment & targeted manual adjustments",
      content: `At Nose Creek Physiotherapy, we don't just treat your symptoms—we identify the underlying biomechanical dysfunction causing your ${c.name.toLowerCase()}. Our registered clinicians evaluate your movement patterns, joint mobility, and muscular balance to build a customized rehabilitation roadmap.`,
      bullets: [
        "In-depth orthopaedic movement assessment",
        "Direct billing to major extended health insurance plans",
        "Targeted joint mobilization & soft tissue myofascial release",
        "Long-term exercise conditioning to prevent re-injury"
      ],
      image: img1,
      imagePosition: pos1,
      background: "white"
    },
    {
      id: `sec-${c.slug}-2`,
      eyebrow: "Evidence-Based Techniques",
      eyebrowColor: "#6faf1c",
      title: `Advanced Modalities for Faster ${c.name} Recovery`,
      subtitle: "Integrated physio, IMS dry needling, and therapeutic exercise",
      content: `Combining hands-on joint manipulation with active retraining allows your body to heal naturally without reliance on pain medication. We help Calgary North residents regain their strength, mobility, and confidence in daily activities.`,
      bullets: [
        "Dry Needling / Intramuscular Stimulation (IMS) for deep spasms",
        "Customized neuromuscular retraining program",
        "Ergonomic & lifestyle guidance tailored to your daily routine"
      ],
      image: img2,
      imagePosition: pos2,
      background: "light"
    }
  ];

  const faqs = c.faqs || [
    {
      question: `Do I need a doctor's referral to receive physiotherapy for ${c.name.toLowerCase()}?`,
      answer: "No, in Alberta you have direct access to physiotherapy. You can book an appointment with our registered clinicians without a doctor's referral."
    },
    {
      question: `Is treatment for ${c.name.toLowerCase()} covered by health insurance?`,
      answer: "Yes, physiotherapy for this condition is covered under most extended health benefit plans. We offer direct billing to Alberta Blue Cross, Sun Life, Manulife, Canada Life, and many other insurers."
    },
    {
      question: `How many sessions will it take to notice improvement in my ${c.name.toLowerCase()}?`,
      answer: "Most patients feel measurable relief and improved mobility within 3 to 6 targeted sessions. During your initial assessment, your physiotherapist will outline a clear step-by-step roadmap."
    }
  ];

  const benefits = c.benefits || [
    "Rapid reduction of acute inflammation and pain",
    "Restoration of natural joint range of motion",
    "Strengthening of stabilizer muscles to protect against relapse",
    "Personalized home exercise routine to maintain long-term recovery"
  ];

  return {
    ...c,
    heroImage: c.heroImage || img1,
    ctaText: c.ctaText || "Book Assessment Online",
    ctaMuted: false,
    benefits,
    customSections,
    faqs
  };
});

fs.writeFileSync(filePath, JSON.stringify(enhanced, null, 2), "utf-8");
console.log("✓ Enriched all conditions in src/data/conditions.json!");
