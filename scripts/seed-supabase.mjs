import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
let url = "";
let key = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      url = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
    }
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
      key = trimmed.replace("NEXT_PUBLIC_SUPABASE_ANON_KEY=", "").trim();
    }
  }
}

const supabase = createClient(url, key);

async function seed() {
  console.log("Seeding Nose Creek Physiotherapy data to Supabase...");

  // Load JSON files
  const readJson = (rel) => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8"));
  const settingsData = readJson("src/data/settings.json");
  const servicesData = readJson("src/data/services.json");
  const conditionsData = readJson("src/data/conditions.json");
  const teamData = readJson("src/data/team.json");
  const locationsData = readJson("src/data/locations.json");
  const blogData = readJson("src/data/blog.json");
  const testimonialsData = readJson("src/data/testimonials.json");

  // 1. Site Settings
  const { error: settingsErr } = await supabase.from("site_settings").upsert({
    id: "main",
    clinic_name: settingsData.clinicName,
    logo_text: settingsData.logoText,
    contact: settingsData.contact,
    opening_hours: settingsData.openingHours,
    social_links: settingsData.socialLinks,
    booking_url: settingsData.bookingUrl,
    primary_cta: settingsData.primaryCTA,
    footer_content: settingsData.footerContent,
    seo: settingsData.seo,
    marketing: settingsData.marketing || {
      callTracking: { enabled: true, scriptUrl: "" },
      gtm: { enabled: false, containerId: "" }
    }
  });
  if (settingsErr) console.error("Settings error:", settingsErr);
  else console.log("✓ Site Settings populated.");

  // 2. Services
  for (let i = 0; i < servicesData.length; i++) {
    const s = servicesData[i];
    const { error } = await supabase.from("services").upsert({
      id: s.id || `service-${s.slug}`,
      slug: s.slug,
      title: s.title,
      short_description: s.shortDescription,
      description: s.description,
      hero_image: s.heroImage || null,
      side_image: s.sideImage || null,
      icon_type: s.iconType || null,
      icon_bg: s.iconBg || null,
      icon_color: s.iconColor || null,
      cta_text: s.ctaText || "Book Online",
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
    });
    if (error) console.error(`Error in service ${s.slug}:`, error.message);
  }
  console.log(`✓ ${servicesData.length} Services populated.`);

  // 3. Conditions
  for (let i = 0; i < conditionsData.length; i++) {
    const c = conditionsData[i];
    const { error } = await supabase.from("conditions").upsert({
      id: c.id || `cond-${c.slug}`,
      slug: c.slug,
      name: c.name,
      short_description: c.shortDescription || null,
      description: c.description,
      hero_image: c.heroImage || null,
      symptoms: c.symptoms || [],
      treatment_approach: c.treatmentApproach || [],
      related_services: c.relatedServices || [],
      category: c.category || "general",
      seo: c.seo || {},
      sort_order: i,
      is_published: true
    });
    if (error) console.error(`Error in condition ${c.slug}:`, error.message);
  }
  console.log(`✓ ${conditionsData.length} Conditions populated.`);

  // 4. Team Members
  for (let i = 0; i < teamData.length; i++) {
    const t = teamData[i];
    const { error } = await supabase.from("team_members").upsert({
      id: t.id || `team-${t.slug}`,
      slug: t.slug,
      name: t.name,
      role: t.role,
      title: t.title || null,
      short_bio: t.shortBio || null,
      full_bio: t.fullBio || null,
      profile_image: t.profileImage || null,
      specialties: t.specialties || [],
      credentials: t.credentials || [],
      education: t.education || [],
      certifications: t.certifications || [],
      experience: t.experience || null,
      locations: t.locations || [],
      services: t.services || [],
      languages: t.languages || [],
      email: t.email || null,
      phone: t.phone || null,
      booking_url: t.bookingUrl || null,
      social_links: t.socialLinks || {},
      featured: t.featured || false,
      is_director: t.isDirector || false,
      sort_order: t.order ?? i,
      is_published: true
    });
    if (error) console.error(`Error in team member ${t.slug}:`, error.message);
  }
  console.log(`✓ ${teamData.length} Team Members populated.`);

  // 5. Locations
  for (let i = 0; i < locationsData.length; i++) {
    const l = locationsData[i];
    const { error } = await supabase.from("locations").upsert({
      id: l.id || `loc-${l.slug}`,
      name: l.name,
      slug: l.slug,
      address: l.address,
      phone: l.phone,
      email: l.email,
      opening_hours: l.openingHours || {},
      map_embed_url: l.mapEmbedUrl || null,
      services: l.services || [],
      team_members: l.teamMembers || [],
      testimonials: l.testimonials || [],
      description: l.description || null,
      images: l.images || [],
      booking_url: l.bookingUrl || null,
      seo: l.seo || {},
      is_published: true
    });
    if (error) console.error(`Error in location ${l.slug}:`, error.message);
  }
  console.log(`✓ ${locationsData.length} Locations populated.`);

  // 6. Blog
  for (let i = 0; i < blogData.length; i++) {
    const b = blogData[i];
    const { error } = await supabase.from("blog_posts").upsert({
      id: b.id || `blog-${b.slug}`,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt || null,
      content: b.content || "",
      featured_image: b.featuredImage || null,
      author: b.author || "Blair Schachterle",
      category: b.category || "General",
      tags: b.tags || [],
      published_at: b.publishedAt || new Date().toISOString(),
      reading_time: b.readingTime || "4 min",
      related_posts: b.relatedPosts || [],
      seo: b.seo || {},
      is_published: true
    });
    if (error) console.error(`Error in blog post ${b.slug}:`, error.message);
  }
  console.log(`✓ ${blogData.length} Blog Posts populated.`);

  // 7. Testimonials
  for (let i = 0; i < testimonialsData.length; i++) {
    const t = testimonialsData[i];
    const { error } = await supabase.from("testimonials").upsert({
      id: t.id || `testi-${i}`,
      author: t.author,
      text: t.text,
      rating: t.rating || 5,
      platform: t.platform || "Google",
      date: t.date || null,
      avatar: t.avatar || null,
      is_published: true
    });
    if (error) console.error(`Error in testimonial ${t.author}:`, error.message);
  }
  console.log(`✓ ${testimonialsData.length} Testimonials populated.`);

  console.log("\n🎉 ALL NOSE CREEK CONTENT SUCCESSFULLY POPULATED IN SUPABASE!");
}

seed();
