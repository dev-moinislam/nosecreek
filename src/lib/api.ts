import {
  SiteSettings,
  Service,
  TeamMember,
  BlogPost,
  Location,
  Condition,
  Testimonial
} from "@/types/content";

import settingsData from "@/data/settings.json";
import servicesData from "@/data/services.json";
import teamData from "@/data/team.json";
import locationsData from "@/data/locations.json";
import blogData from "@/data/blog.json";
import conditionsData from "@/data/conditions.json";
import testimonialsData from "@/data/testimonials.json";
import { supabase, isSupabaseConfigured } from "./supabase/client";

// Local fallbacks
const siteSettingsObj = settingsData as SiteSettings;
const servicesList = servicesData as Service[];
const teamList = teamData as TeamMember[];
const locationsList = locationsData as Location[];
const blogList = blogData as BlogPost[];
const conditionsList = conditionsData as Condition[];
const testimonialsList = testimonialsData as Testimonial[];

/**
 * Site-wide settings (Clinic info, business hours, default SEO)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .single();
      if (!error && data) {
        return {
          clinicName: data.clinic_name || siteSettingsObj.clinicName,
          logoText: data.logo_text || siteSettingsObj.logoText,
          contact: data.contact || siteSettingsObj.contact,
          openingHours: data.opening_hours || siteSettingsObj.openingHours,
          socialLinks: data.social_links || siteSettingsObj.socialLinks,
          bookingUrl: data.booking_url || siteSettingsObj.bookingUrl,
          primaryCTA: data.primary_cta || siteSettingsObj.primaryCTA,
          footerContent: data.footer_content || siteSettingsObj.footerContent,
          seo: data.seo || siteSettingsObj.seo,
          ...(data.marketing ? { marketing: data.marketing } : {})
        };
      }
    } catch (e) {
      console.warn("Supabase fetch failed for settings, using local fallback", e);
    }
  }
  return siteSettingsObj;
}

/**
 * Clinic Services
 */
export async function getServices(): Promise<Service[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          shortDescription: d.short_description || "",
          description: d.description || "",
          heroImage: d.hero_image,
          sideImage: d.side_image,
          iconType: d.icon_type,
          iconBg: d.icon_bg,
          iconColor: d.icon_color,
          ctaText: d.cta_text,
          ctaMuted: d.cta_muted,
          benefits: d.benefits || [],
          symptoms: d.symptoms || [],
          treatmentApproach: d.treatment_approach || [],
          customSections: d.custom_sections || [],
          faqs: d.faqs || [],
          relatedServices: d.related_services || [],
          relatedConditions: d.related_conditions || [],
          teamMembers: d.team_members || [],
          locations: d.locations || [],
          testimonials: d.testimonials || [],
          seo: d.seo || {}
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for services, using local fallback", e);
    }
  }
  return servicesList;
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug,
          title: data.title,
          shortDescription: data.short_description || "",
          description: data.description || "",
          heroImage: data.hero_image,
          sideImage: data.side_image,
          iconType: data.icon_type,
          iconBg: data.icon_bg,
          iconColor: data.icon_color,
          ctaText: data.cta_text,
          ctaMuted: data.cta_muted,
          benefits: data.benefits || [],
          symptoms: data.symptoms || [],
          treatmentApproach: data.treatment_approach || [],
          customSections: data.custom_sections || [],
          faqs: data.faqs || [],
          relatedServices: data.related_services || [],
          relatedConditions: data.related_conditions || [],
          teamMembers: data.team_members || [],
          locations: data.locations || [],
          testimonials: data.testimonials || [],
          seo: data.seo || {}
        };
      }
    } catch (e) {
      console.warn(`Supabase fetch failed for service ${slug}, using local fallback`, e);
    }
  }
  return servicesList.find((s) => s.slug === slug);
}

/**
 * Team Members & Practitioners
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          role: d.role,
          title: d.title || "",
          shortBio: d.short_bio || "",
          fullBio: d.full_bio || "",
          profileImage: d.profile_image || "/images/team/default.jpg",
          specialties: d.specialties || [],
          credentials: d.credentials || [],
          education: d.education || [],
          certifications: d.certifications || [],
          experience: d.experience || "",
          locations: d.locations || [],
          services: d.services || [],
          languages: d.languages || [],
          email: d.email,
          phone: d.phone,
          bookingUrl: d.booking_url,
          socialLinks: d.social_links || {},
          featured: d.featured,
          isDirector: d.is_director,
          order: d.sort_order,
          seo: d.seo || {}
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for team members, using local fallback", e);
    }
  }
  return teamList.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | undefined> {
  const members = await getTeamMembers();
  return members.find((t) => t.slug === slug);
}

/**
 * Blog Posts
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          title: d.title,
          excerpt: d.excerpt || "",
          content: d.content || "",
          featuredImage: d.featured_image || "/images/blog/default.jpg",
          author: d.author || "Blair Schachterle",
          category: d.category || "General",
          tags: d.tags || [],
          publishedAt: d.published_at || new Date().toISOString(),
          readingTime: d.reading_time || "4 min",
          relatedPosts: d.related_posts || [],
          seo: d.seo || {}
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for blog posts, using local fallback", e);
    }
  }
  return blogList.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((b) => b.slug === slug);
}

/**
 * Clinic Locations
 */
export async function getLocations(): Promise<Location[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("is_published", true);
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          slug: d.slug,
          address: d.address,
          phone: d.phone,
          email: d.email,
          openingHours: d.opening_hours || {},
          mapEmbedUrl: d.map_embed_url,
          services: d.services || [],
          teamMembers: d.team_members || [],
          testimonials: d.testimonials || [],
          description: d.description || "",
          images: d.images || [],
          bookingUrl: d.booking_url || "",
          seo: d.seo || {}
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for locations, using local fallback", e);
    }
  }
  return locationsList;
}

export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  const locs = await getLocations();
  return locs.find((l) => l.slug === slug);
}

/**
 * Treatable Conditions
 */
export async function getConditions(): Promise<Condition[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("conditions")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          slug: d.slug,
          name: d.name,
          shortDescription: d.short_description || "",
          description: d.description || "",
          heroImage: d.hero_image,
          symptoms: d.symptoms || [],
          treatmentApproach: d.treatment_approach || [],
          relatedServices: d.related_services || [],
          category: d.category || "general",
          seo: d.seo || {}
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for conditions, using local fallback", e);
    }
  }
  return conditionsList;
}

export async function getConditionBySlug(slug: string): Promise<Condition | undefined> {
  const conditions = await getConditions();
  return conditions.find((c) => c.slug === slug);
}

/**
 * Reviews & Testimonials
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_published", true);
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          author: d.author,
          text: d.text,
          rating: Number(d.rating) || 5,
          platform: d.platform || "Google",
          date: d.date,
          avatar: d.avatar
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for testimonials, using local fallback", e);
    }
  }
  return testimonialsList;
}

export async function getTestimonialById(id: string): Promise<Testimonial | undefined> {
  const testimonials = await getTestimonials();
  return testimonials.find((t) => t.id === id);
}

