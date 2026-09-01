import fs from "fs";
import path from "path";

const readJson = (rel) => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8"));
const escapeSql = (str) => {
  if (str === null || str === undefined) return "NULL";
  if (typeof str === "number" || typeof str === "boolean") return str;
  return `'${String(str).replace(/'/g, "''")}'`;
};
const jsonSql = (obj) => `'${JSON.stringify(obj || []).replace(/'/g, "''")}'::jsonb`;

const settingsData = readJson("src/data/settings.json");
const servicesData = readJson("src/data/services.json");
const conditionsData = readJson("src/data/conditions.json");
const teamData = readJson("src/data/team.json");
const locationsData = readJson("src/data/locations.json");
const blogData = readJson("src/data/blog.json");
const testimonialsData = readJson("src/data/testimonials.json");

let sql = `-- ==============================================================================
-- NOSE CREEK PHYSIOTHERAPY - INITIAL DATA SEED SCRIPT
-- ==============================================================================
-- Run this in your Supabase SQL Editor to populate all website content instantly.
-- ==============================================================================

-- 1. Site Settings
INSERT INTO site_settings (id, clinic_name, logo_text, contact, opening_hours, social_links, booking_url, primary_cta, footer_content, seo, marketing)
VALUES (
  'main',
  ${escapeSql(settingsData.clinicName)},
  ${escapeSql(settingsData.logoText)},
  ${jsonSql(settingsData.contact)},
  ${jsonSql(settingsData.openingHours)},
  ${jsonSql(settingsData.socialLinks)},
  ${escapeSql(settingsData.bookingUrl)},
  ${escapeSql(settingsData.primaryCTA)},
  ${escapeSql(settingsData.footerContent)},
  ${jsonSql(settingsData.seo)},
  ${jsonSql(settingsData.marketing || { callTracking: { enabled: true, scriptUrl: "" }, gtm: { enabled: false, containerId: "" } })}
)
ON CONFLICT (id) DO UPDATE SET
  clinic_name = EXCLUDED.clinic_name,
  logo_text = EXCLUDED.logo_text,
  contact = EXCLUDED.contact,
  opening_hours = EXCLUDED.opening_hours,
  social_links = EXCLUDED.social_links,
  booking_url = EXCLUDED.booking_url,
  primary_cta = EXCLUDED.primary_cta,
  footer_content = EXCLUDED.footer_content,
  seo = EXCLUDED.seo,
  marketing = EXCLUDED.marketing;

-- 2. Services
`;

for (let i = 0; i < servicesData.length; i++) {
  const s = servicesData[i];
  sql += `INSERT INTO services (id, slug, title, short_description, description, hero_image, side_image, icon_type, icon_bg, icon_color, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, related_conditions, team_members, locations, testimonials, seo, sort_order, is_published)
VALUES (
  ${escapeSql(s.id || `service-${s.slug}`)},
  ${escapeSql(s.slug)},
  ${escapeSql(s.title)},
  ${escapeSql(s.shortDescription)},
  ${escapeSql(s.description)},
  ${escapeSql(s.heroImage)},
  ${escapeSql(s.sideImage)},
  ${escapeSql(s.iconType)},
  ${escapeSql(s.iconBg)},
  ${escapeSql(s.iconColor)},
  ${escapeSql(s.ctaText || "Book Online")},
  ${s.ctaMuted ? "true" : "false"},
  ${jsonSql(s.benefits)},
  ${jsonSql(s.symptoms)},
  ${jsonSql(s.treatmentApproach)},
  ${jsonSql(s.customSections)},
  ${jsonSql(s.faqs)},
  ${jsonSql(s.relatedServices)},
  ${jsonSql(s.relatedConditions)},
  ${jsonSql(s.teamMembers)},
  ${jsonSql(s.locations)},
  ${jsonSql(s.testimonials)},
  ${jsonSql(s.seo)},
  ${i},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach;
`;
}

sql += `\n-- 3. Conditions\n`;
for (let i = 0; i < conditionsData.length; i++) {
  const c = conditionsData[i];
  sql += `INSERT INTO conditions (id, slug, name, short_description, description, hero_image, side_image, cta_text, cta_muted, benefits, symptoms, treatment_approach, custom_sections, faqs, related_services, category, seo, sort_order, is_published)
VALUES (
  ${escapeSql(c.id || `cond-${c.slug}`)},
  ${escapeSql(c.slug)},
  ${escapeSql(c.name)},
  ${escapeSql(c.shortDescription)},
  ${escapeSql(c.description)},
  ${escapeSql(c.heroImage)},
  ${escapeSql(c.sideImage)},
  ${escapeSql(c.ctaText || "Book Assessment Online")},
  ${c.ctaMuted ? "true" : "false"},
  ${jsonSql(c.benefits)},
  ${jsonSql(c.symptoms)},
  ${jsonSql(c.treatmentApproach)},
  ${jsonSql(c.customSections)},
  ${jsonSql(c.faqs)},
  ${jsonSql(c.relatedServices)},
  ${escapeSql(c.category || "general")},
  ${jsonSql(c.seo)},
  ${i},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  hero_image = EXCLUDED.hero_image,
  side_image = EXCLUDED.side_image,
  cta_text = EXCLUDED.cta_text,
  cta_muted = EXCLUDED.cta_muted,
  benefits = EXCLUDED.benefits,
  symptoms = EXCLUDED.symptoms,
  treatment_approach = EXCLUDED.treatment_approach,
  custom_sections = EXCLUDED.custom_sections,
  faqs = EXCLUDED.faqs;
`;
}

sql += `\n-- 4. Team Members\n`;
for (let i = 0; i < teamData.length; i++) {
  const t = teamData[i];
  sql += `INSERT INTO team_members (id, slug, name, role, title, short_bio, full_bio, profile_image, specialties, credentials, education, certifications, experience, locations, services, languages, email, phone, booking_url, social_links, featured, is_director, sort_order, is_published)
VALUES (
  ${escapeSql(t.id || `team-${t.slug}`)},
  ${escapeSql(t.slug)},
  ${escapeSql(t.name)},
  ${escapeSql(t.role)},
  ${escapeSql(t.title)},
  ${escapeSql(t.shortBio)},
  ${escapeSql(t.fullBio)},
  ${escapeSql(t.profileImage)},
  ${jsonSql(t.specialties)},
  ${jsonSql(t.credentials)},
  ${jsonSql(t.education)},
  ${jsonSql(t.certifications)},
  ${escapeSql(t.experience)},
  ${jsonSql(t.locations)},
  ${jsonSql(t.services)},
  ${jsonSql(t.languages)},
  ${escapeSql(t.email)},
  ${escapeSql(t.phone)},
  ${escapeSql(t.bookingUrl)},
  ${jsonSql(t.socialLinks)},
  ${t.featured ? "true" : "false"},
  ${t.isDirector ? "true" : "false"},
  ${t.order ?? i},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  short_bio = EXCLUDED.short_bio,
  full_bio = EXCLUDED.full_bio,
  specialties = EXCLUDED.specialties,
  credentials = EXCLUDED.credentials;
`;
}

sql += `\n-- 5. Locations\n`;
for (let i = 0; i < locationsData.length; i++) {
  const l = locationsData[i];
  sql += `INSERT INTO locations (id, name, slug, address, phone, email, opening_hours, map_embed_url, services, team_members, testimonials, description, images, booking_url, seo, is_published)
VALUES (
  ${escapeSql(l.id || `loc-${l.slug}`)},
  ${escapeSql(l.name)},
  ${escapeSql(l.slug)},
  ${escapeSql(l.address)},
  ${escapeSql(l.phone)},
  ${escapeSql(l.email)},
  ${jsonSql(l.openingHours)},
  ${escapeSql(l.mapEmbedUrl)},
  ${jsonSql(l.services)},
  ${jsonSql(l.teamMembers)},
  ${jsonSql(l.testimonials)},
  ${escapeSql(l.description)},
  ${jsonSql(l.images)},
  ${escapeSql(l.bookingUrl)},
  ${jsonSql(l.seo)},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;
`;
}

sql += `\n-- 6. Blog Posts\n`;
for (let i = 0; i < blogData.length; i++) {
  const b = blogData[i];
  sql += `INSERT INTO blog_posts (id, slug, title, excerpt, content, featured_image, author, category, tags, published_at, reading_time, related_posts, seo, is_published)
VALUES (
  ${escapeSql(b.id || `blog-${b.slug}`)},
  ${escapeSql(b.slug)},
  ${escapeSql(b.title)},
  ${escapeSql(b.excerpt)},
  ${escapeSql(b.content)},
  ${escapeSql(b.featuredImage)},
  ${escapeSql(b.author || "Blair Schachterle")},
  ${escapeSql(b.category || "General")},
  ${jsonSql(b.tags)},
  ${escapeSql(b.publishedAt || new Date().toISOString())},
  ${escapeSql(b.readingTime || "4 min")},
  ${jsonSql(b.relatedPosts)},
  ${jsonSql(b.seo)},
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content;
`;
}

sql += `\n-- 7. Testimonials\n`;
for (let i = 0; i < testimonialsData.length; i++) {
  const t = testimonialsData[i];
  sql += `INSERT INTO testimonials (id, author, text, rating, platform, date, avatar, is_published)
VALUES (
  ${escapeSql(t.id || `testi-${i}`)},
  ${escapeSql(t.author)},
  ${escapeSql(t.text)},
  ${t.rating || 5},
  ${escapeSql(t.platform || "Google")},
  ${escapeSql(t.date)},
  ${escapeSql(t.avatar)},
  true
)
ON CONFLICT (id) DO UPDATE SET
  author = EXCLUDED.author,
  text = EXCLUDED.text,
  rating = EXCLUDED.rating;
`;
}

fs.writeFileSync(path.resolve(process.cwd(), "src/lib/supabase/seed.sql"), sql, "utf-8");
console.log("✓ Generated src/lib/supabase/seed.sql successfully!");
