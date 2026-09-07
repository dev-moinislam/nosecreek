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

async function syncSettings() {
  const settingsPath = path.join(__dirname, "../src/data/settings.json");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

  console.log("Syncing settings and marketing trackers to Supabase site_settings...");

  const payload = {
    id: "main",
    clinic_name: settings.clinicName,
    logo_text: settings.logoText,
    contact: settings.contact,
    opening_hours: settings.openingHours,
    social_links: settings.socialLinks,
    booking_url: settings.bookingUrl,
    primary_cta: settings.primaryCTA,
    footer_content: settings.footerContent,
    seo: settings.seo,
    marketing: settings.marketing
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Error upserting site_settings:", error.message);
  } else {
    console.log("✓ Successfully synced site_settings to Supabase!");
  }
}

syncSettings().catch(console.error);
