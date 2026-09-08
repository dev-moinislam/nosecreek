import {
  SiteSettings,
  Service,
  TeamMember,
  BlogPost,
  Location,
  Condition,
  Testimonial,
  HomePageData
} from "@/types/content";

import settingsData from "@/data/settings.json";
import servicesData from "@/data/services.json";
import teamData from "@/data/team.json";
import locationsData from "@/data/locations.json";
import blogData from "@/data/blog.json";
import conditionsData from "@/data/conditions.json";
import testimonialsData from "@/data/testimonials.json";
import defaultHomeData from "@/data/home.json";
import { supabase, isSupabaseConfigured } from "./supabase/client";

// Local fallbacks
const siteSettingsObj = settingsData as SiteSettings;
const servicesList = servicesData as Service[];
const teamList = teamData as TeamMember[];
const locationsList = locationsData as Location[];
const blogList = blogData as BlogPost[];
const conditionsList = conditionsData as Condition[];
const testimonialsList = testimonialsData as Testimonial[];
const defaultHomeObj = defaultHomeData as HomePageData;

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
function getFreshServicesData(): Service[] {
  try {
    if (typeof window === "undefined") {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.resolve(process.cwd(), "src/data/services.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    }
  } catch (e) {}
  return servicesList;
}

function getFreshConditionsData(): Condition[] {
  try {
    if (typeof window === "undefined") {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.resolve(process.cwd(), "src/data/conditions.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    }
  } catch (e) {}
  return conditionsList;
}

/**
 * Clinic Services
 */
export async function getServices(): Promise<Service[]> {
  const currentList = getFreshServicesData();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data) {
        // Authoritative mapping from Supabase database rows only
        return data.map((d: any) => {
          const localItem = currentList.find((s) => s.slug === d.slug);
          return {
            id: d.id,
            slug: d.slug,
            title: d.title,
            shortDescription: d.short_description || localItem?.shortDescription || "",
            description: d.description || localItem?.description || "",
            heroImage: d.hero_image || localItem?.heroImage,
            sideImage: d.side_image || localItem?.sideImage,
            cardImage: d.card_image || d.cardImage || d.seo?.cardImage || localItem?.cardImage || null,
            iconType: d.icon_type || localItem?.iconType,
            iconBg: d.icon_bg || localItem?.iconBg,
            iconColor: d.icon_color || localItem?.iconColor,
            ctaText: d.cta_text || localItem?.ctaText,
            ctaMuted: d.cta_muted ?? localItem?.ctaMuted,
            benefits: d.benefits || localItem?.benefits || [],
            symptoms: d.symptoms || localItem?.symptoms || [],
            treatmentApproach: d.treatment_approach || localItem?.treatmentApproach || [],
            customSections: d.custom_sections || localItem?.customSections || [],
            sectionsData: d.sections_data || d.seo?.sectionsData || d.sectionsData || localItem?.sectionsData || {},
            faqs: d.faqs || localItem?.faqs || [],
            hiddenSections: d.hidden_sections || localItem?.hiddenSections || [],
            sectionOrder: d.section_order || d.sectionOrder || localItem?.sectionOrder || [],
            relatedServices: d.related_services || localItem?.relatedServices || [],
            relatedConditions: d.related_conditions || localItem?.relatedConditions || [],
            teamMembers: d.team_members || localItem?.teamMembers || [],
            locations: d.locations || localItem?.locations || [],
            testimonials: d.testimonials || localItem?.testimonials || [],
            seo: d.seo || localItem?.seo || {}
          };
        });
      }
    } catch (e) {
      console.warn("Supabase fetch failed for services, using local fallback", e);
    }
  }

  // Client-side fetch from /api/content (useful in incognito or non-admin sessions)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/content?type=services", { cache: "no-store" });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) return list;
      }
    } catch {}
  }

  return currentList;
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
        const localItem = getFreshServicesData().find((s) => s.slug === slug);
        return {
          id: data.id,
          slug: data.slug,
          title: data.title,
          shortDescription: data.short_description || localItem?.shortDescription || "",
          description: data.description || localItem?.description || "",
          heroImage: data.hero_image || localItem?.heroImage,
          sideImage: data.side_image || localItem?.sideImage,
          cardImage: data.card_image || data.cardImage || data.seo?.cardImage || localItem?.cardImage || null,
          iconType: data.icon_type || localItem?.iconType,
          iconBg: data.icon_bg || localItem?.iconBg,
          iconColor: data.icon_color || localItem?.iconColor,
          ctaText: data.cta_text || localItem?.ctaText,
          ctaMuted: data.cta_muted ?? localItem?.ctaMuted,
          benefits: data.benefits || localItem?.benefits || [],
          symptoms: data.symptoms || localItem?.symptoms || [],
          treatmentApproach: data.treatment_approach || localItem?.treatmentApproach || [],
          customSections: data.custom_sections || localItem?.customSections || [],
          sectionsData: data.sections_data || data.seo?.sectionsData || data.sectionsData || localItem?.sectionsData || {},
          faqs: data.faqs || localItem?.faqs || [],
          hiddenSections: data.hidden_sections || localItem?.hiddenSections || [],
          sectionOrder: data.section_order || data.sectionOrder || localItem?.sectionOrder || [],
          relatedServices: data.related_services || localItem?.relatedServices || [],
          relatedConditions: data.related_conditions || localItem?.relatedConditions || [],
          teamMembers: data.team_members || localItem?.teamMembers || [],
          locations: data.locations || localItem?.locations || [],
          testimonials: data.testimonials || localItem?.testimonials || [],
          seo: data.seo || localItem?.seo || {}
        };
      }
      // If Supabase is configured and query returned 0 rows (item deleted or unpublished), it does not exist
      if (error && (error.code === "PGRST116" || error.message?.includes("0 rows") || !data)) {
        return undefined;
      }
    } catch (e) {
      console.warn(`Supabase fetch failed for service ${slug}, using local fallback`, e);
    }
  }

  // Fallback only if Supabase is not configured
  if (!isSupabaseConfigured) {
    return getFreshServicesData().find((s) => s.slug === slug);
  }
  return undefined;
}

function getFreshTeamData(): TeamMember[] {
  try {
    if (typeof window === "undefined") {
      const fs = require("fs");
      const path = require("path");
      const filePath = path.resolve(process.cwd(), "src/data/team.json");
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    }
  } catch (e) {
    // fallback
  }
  return teamList;
}

/**
 * Team Members & Practitioners
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const currentList = getFreshTeamData();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => {
          const localItem = currentList.find((l) => l.slug === d.slug);
          return {
            id: d.id,
            slug: d.slug,
            name: d.name,
            role: d.role,
            title: d.title || "",
            shortBio: d.short_bio || "",
            fullBio: d.full_bio || "",
            profileImage: d.profile_image || "/images/team/default.jpg",
            specialties: d.specialties || localItem?.specialties || [],
            credentials: d.credentials || localItem?.credentials || [],
            education: d.education || localItem?.education || [],
            certifications: d.certifications || localItem?.certifications || [],
            experience: d.experience || localItem?.experience || "",
            locations: d.locations || localItem?.locations || [],
            services: d.services || localItem?.services || [],
            languages: d.languages || localItem?.languages || [],
            email: d.email || localItem?.email,
            phone: d.phone || localItem?.phone,
            bookingUrl: d.booking_url || localItem?.bookingUrl,
            bookingCtaText: d.social_links?.bookingCtaText || localItem?.bookingCtaText || null,
            socialLinks: d.social_links || localItem?.socialLinks || {},
            featured: d.featured ?? localItem?.featured,
            isDirector: d.is_director ?? localItem?.isDirector,
            order: d.sort_order ?? localItem?.order,
            seo: d.seo || localItem?.seo || {}
          };
        });
      }
    } catch (e) {
      console.warn("Supabase fetch failed for team members, using local fallback", e);
    }
  }
  return currentList.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
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
          contentBlocks: d.content_blocks || d.contentBlocks || d.seo?.contentBlocks || [],
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
  const currentList = getFreshConditionsData();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("conditions")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data) {
        return data.map((d: any) => {
          const localItem = currentList.find((c) => c.slug === d.slug);
          return {
            id: d.id,
            slug: d.slug,
            name: d.name,
            shortDescription: d.short_description || localItem?.shortDescription || "",
            description: d.description || localItem?.description || "",
            heroImage: d.hero_image || localItem?.heroImage,
            sideImage: d.side_image || localItem?.sideImage,
            cardImage: d.card_image || d.cardImage || d.seo?.cardImage || localItem?.cardImage || null,
            ctaText: d.cta_text || localItem?.ctaText,
            ctaMuted: d.cta_muted ?? localItem?.ctaMuted,
            benefits: d.benefits || localItem?.benefits || [],
            symptoms: d.symptoms || localItem?.symptoms || [],
            treatmentApproach: d.treatment_approach || localItem?.treatmentApproach || [],
            customSections: d.custom_sections || localItem?.customSections || [],
            sectionsData: d.sections_data || d.seo?.sectionsData || d.sectionsData || localItem?.sectionsData || {},
            faqs: d.faqs || localItem?.faqs || [],
            hiddenSections: d.hidden_sections || localItem?.hiddenSections || [],
            sectionOrder: d.section_order || d.sectionOrder || localItem?.sectionOrder || [],
            relatedServices: d.related_services || localItem?.relatedServices || [],
            category: d.category || localItem?.category || "general",
            seo: d.seo || localItem?.seo || {}
          };
        });
      }
    } catch (e) {
      console.warn("Supabase fetch failed for conditions, using local fallback", e);
    }
  }

  // Client-side fetch from /api/content (useful in incognito or non-admin sessions)
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/content?type=conditions", { cache: "no-store" });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) return list;
      }
    } catch {}
  }

  return currentList;
}

export async function getConditionBySlug(slug: string): Promise<Condition | undefined> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("conditions")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (!error && data) {
        const localItem = getFreshConditionsData().find((c) => c.slug === slug);
        return {
          id: data.id,
          slug: data.slug,
          name: data.name,
          shortDescription: data.short_description || localItem?.shortDescription || "",
          description: data.description || localItem?.description || "",
          heroImage: data.hero_image || localItem?.heroImage,
          sideImage: data.side_image || localItem?.sideImage,
          cardImage: data.card_image || data.cardImage || data.seo?.cardImage || localItem?.cardImage || null,
          ctaText: data.cta_text || localItem?.ctaText,
          ctaMuted: data.cta_muted ?? localItem?.ctaMuted,
          benefits: data.benefits || localItem?.benefits || [],
          symptoms: data.symptoms || localItem?.symptoms || [],
          treatmentApproach: data.treatment_approach || localItem?.treatmentApproach || [],
          customSections: data.custom_sections || localItem?.customSections || [],
          sectionsData: data.sections_data || data.seo?.sectionsData || data.sectionsData || localItem?.sectionsData || {},
          faqs: data.faqs || localItem?.faqs || [],
          hiddenSections: data.hidden_sections || localItem?.hiddenSections || [],
          sectionOrder: data.section_order || data.sectionOrder || localItem?.sectionOrder || [],
          relatedServices: data.related_services || localItem?.relatedServices || [],
          category: data.category || localItem?.category || "general",
          seo: data.seo || localItem?.seo || {}
        };
      }
      // If Supabase is configured and query returned 0 rows (item deleted or unpublished), it does not exist
      if (error && (error.code === "PGRST116" || error.message?.includes("0 rows") || !data)) {
        return undefined;
      }
    } catch (e) {
      console.warn(`Supabase fetch failed for condition ${slug}, using local fallback`, e);
    }
  }

  // Fallback only if Supabase is not configured
  if (!isSupabaseConfigured) {
    return getFreshConditionsData().find((c) => c.slug === slug);
  }
  return undefined;
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

/**
 * Homepage Structured Content
 */
export async function getHomeContent(): Promise<HomePageData> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Check if stored in site_settings row 'main' under home_page_content
      const { data: mainData } = await supabase
        .from("site_settings")
        .select("home_page_content")
        .eq("id", "main")
        .single();
      if (mainData && (mainData as any).home_page_content && Object.keys((mainData as any).home_page_content).length > 0) {
        return {
          ...defaultHomeObj,
          ...(mainData as any).home_page_content
        };
      }
    } catch {}

    try {
      // 2. Check if stored as key-value pair in site_settings
      const { data: kvData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "home_page_content")
        .single();
      if (kvData && (kvData as any).value) {
        return {
          ...defaultHomeObj,
          ...(kvData as any).value
        };
      }
    } catch (e) {
      console.warn("Supabase fetch failed for home_page_content, using local fallback", e);
    }
  }

  // Client-side local override
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("adm_home");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            ...defaultHomeObj,
            ...parsed
          };
        }
      }
    } catch {}
  }

  return defaultHomeObj;
}


