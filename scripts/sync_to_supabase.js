const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read .env.local
const envPath = path.join(__dirname, "../.env.local");
let env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach(l => {
    const match = l.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseAnonKey = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("Supabase not configured in .env.local, skipping remote sync.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function syncServices() {
  const servicesPath = path.join(__dirname, "../src/data/services.json");
  const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));

  console.log(`Syncing ${services.length} services to Supabase...`);

  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    const row = {
      id: s.id,
      slug: s.slug,
      title: s.title,
      short_description: s.shortDescription,
      description: s.description,
      hero_image: s.heroImage || "",
      side_image: s.sideImage || null,
      icon_type: s.iconType || "heart-pulse",
      icon_bg: s.iconBg || "#e9f5fb",
      icon_color: s.iconColor || "#1c9fd8",
      cta_text: s.ctaText || "Book Online →",
      cta_muted: s.ctaMuted || false,
      benefits: s.benefits || [],
      symptoms: s.symptoms || [],
      treatment_approach: s.treatmentApproach || [],
      custom_sections: s.customSections || [],
      faqs: s.faqs || [],
      related_services: s.relatedServices || [],
      related_conditions: s.relatedConditions || [],
      team_members: s.teamMembers || [],
      locations: s.locations || [],
      testimonials: s.testimonials || [],
      seo: s.seo || {},
      sort_order: i,
      is_published: true
    };

    const { data, error } = await supabase
      .from("services")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`Error syncing service ${s.slug}:`, error.message);
    } else {
      console.log(`✓ Upserted service: ${s.slug}`);
    }
  }

  console.log("Finished syncing services to Supabase!");
}

syncServices().catch(console.error);
