import { createClient } from "@supabase/supabase-js";
import settingsData from "@/data/settings.json";
import servicesData from "@/data/services.json";
import conditionsData from "@/data/conditions.json";
import locationsData from "@/data/locations.json";
import teamData from "@/data/team.json";
import blogData from "@/data/blog.json";
import testimonialsData from "@/data/testimonials.json";

export async function seedSupabaseDatabase(supabaseUrl: string, supabaseServiceRoleKey: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  console.log("Seeding Nose Creek Physiotherapy data to Supabase...");

  // 1. Site Settings
  const { error: settingsError } = await supabase.from("site_settings").upsert({
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
    marketing: (settingsData as any).marketing || {
      callTracking: { enabled: true, scriptUrl: "" },
      gtm: { enabled: false, containerId: "" }
    }
  });
  if (settingsError) console.error("Error seeding settings:", settingsError);
  else console.log("✓ Site Settings seeded.");

  // 2. Services
  for (let i = 0; i < servicesData.length; i++) {
    const s: any = servicesData[i];
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
    if (error) console.error(`Error seeding service ${s.slug}:`, error);
  }
  console.log(`✓ ${servicesData.length} Services seeded.`);

  // 3. Conditions
  for (let i = 0; i < conditionsData.length; i++) {
    const c: any = conditionsData[i];
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
    if (error) console.error(`Error seeding condition ${c.slug}:`, error);
  }
  console.log(`✓ ${conditionsData.length} Conditions seeded.`);

  // 4. Team Members
  for (let i = 0; i < teamData.length; i++) {
    const t: any = teamData[i];
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
    if (error) console.error(`Error seeding team member ${t.slug}:`, error);
  }
  console.log(`✓ ${teamData.length} Team Members seeded.`);

  // 5. Locations
  for (let i = 0; i < locationsData.length; i++) {
    const l: any = locationsData[i];
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
    if (error) console.error(`Error seeding location ${l.slug}:`, error);
  }
  console.log(`✓ ${locationsData.length} Locations seeded.`);

  // 6. Blog Posts
  for (let i = 0; i < blogData.length; i++) {
    const b: any = blogData[i];
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
    if (error) console.error(`Error seeding blog post ${b.slug}:`, error);
  }
  console.log(`✓ ${blogData.length} Blog Posts seeded.`);

  // 7. Testimonials
  for (let i = 0; i < testimonialsData.length; i++) {
    const t: any = testimonialsData[i];
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
    if (error) console.error(`Error seeding testimonial ${t.author}:`, error);
  }
  console.log(`✓ ${testimonialsData.length} Testimonials seeded.`);

  console.log("All data seeding complete!");
}
