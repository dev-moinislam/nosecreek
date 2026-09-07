const fs = require("fs");
const path = require("path");

const servicesPath = path.join(__dirname, "../src/data/services.json");
const seedPath = path.join(__dirname, "../src/lib/supabase/seed.sql");

const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
let seedSql = fs.readFileSync(seedPath, "utf8");

// Generate SQL statements for all services
const serviceStatements = services.map((s, idx) => {
  const esc = (str) => (str ? str.replace(/'/g, "''") : "");
  const jsonEsc = (obj) => JSON.stringify(obj).replace(/'/g, "''");

  return `INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  '${esc(s.id)}',
  '${esc(s.slug)}',
  '${esc(s.title)}',
  '${esc(s.shortDescription)}',
  '${esc(s.description)}',
  '${esc(s.heroImage || "")}',
  ${s.sideImage ? `'${esc(s.sideImage)}'` : "NULL"},
  '${esc(s.iconType || "heart-pulse")}',
  '${esc(s.iconBg || "#e9f5fb")}',
  '${esc(s.iconColor || "#1c9fd8")}',
  '${esc(s.ctaText || "Book Online →")}',
  ${s.ctaMuted ? "true" : "false"},
  '${jsonEsc(s.benefits || [])}'::jsonb,
  '${jsonEsc(s.symptoms || [])}'::jsonb,
  '${jsonEsc(s.treatmentApproach || [])}'::jsonb,
  '${jsonEsc(s.customSections || [])}'::jsonb,
  '${jsonEsc(s.faqs || [])}'::jsonb,
  '${jsonEsc(s.relatedServices || [])}'::jsonb,
  '${jsonEsc(s.relatedConditions || [])}'::jsonb,
  '${jsonEsc(s.teamMembers || [])}'::jsonb,
  '${jsonEsc(s.locations || [])}'::jsonb,
  '${jsonEsc(s.testimonials || [])}'::jsonb,
  '${jsonEsc(s.seo || {})}'::jsonb,
  ${idx},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  side_image = EXCLUDED.side_image,
  icon_type = EXCLUDED.icon_type,
  icon_bg = EXCLUDED.icon_bg,
  icon_color = EXCLUDED.icon_color,
  cta_text = EXCLUDED.cta_text,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach,
  related_services = EXCLUDED.related_services,
  related_conditions = EXCLUDED.related_conditions,
  team_members = EXCLUDED.team_members,
  seo = EXCLUDED.seo;`;
}).join("\n\n");

// Replace the services block in seed.sql
const servicesMarkerStart = "-- 2. Services";
const conditionsMarkerStart = "-- 3. Conditions";

const startIndex = seedSql.indexOf(servicesMarkerStart);
const endIndex = seedSql.indexOf(conditionsMarkerStart);

if (startIndex !== -1 && endIndex !== -1) {
  seedSql = seedSql.substring(0, startIndex) + servicesMarkerStart + "\n" + serviceStatements + "\n\n" + seedSql.substring(endIndex);
  fs.writeFileSync(seedPath, seedSql, "utf8");
  console.log("Successfully synchronized seed.sql with updated services!");
} else {
  console.error("Could not find markers in seed.sql");
}
