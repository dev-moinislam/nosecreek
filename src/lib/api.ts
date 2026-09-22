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
import { supabase, isSupabaseConfigured } from "./supabase/client";

async function getDeletedSlugsSet(): Promise<Set<string>> {
  const set = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem("adm_deleted_slugs");
      if (local) {
        const arr = JSON.parse(local);
        if (Array.isArray(arr)) arr.forEach((s: string) => set.add(s));
      }
    } catch {}
  }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("marketing")
        .eq("id", "main")
        .maybeSingle();
      const arr = data?.marketing?.deleted_slugs;
      if (Array.isArray(arr)) arr.forEach((s: string) => set.add(s));
    } catch {}
  }
  return set;
}

/**
 * Site-wide settings (Clinic info, business hours, default SEO, schemas)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      if (!error && data) {
        return {
          clinicName: data.clinic_name || "Nose Creek Physiotherapy",
          logoText: data.logo_text || "Nose Creek Physiotherapy",
          contact: data.contact || {},
          openingHours: data.opening_hours || {},
          socialLinks: data.social_links || {},
          bookingUrl: data.booking_url || "https://app.practiceperfectemr.com/onlinebooking/657/#/landing/nosecreekbeddington",
          primaryCTA: data.primary_cta || "Book Online",
          footerContent: data.footer_content || "© 2026 Nose Creek Physiotherapy. All rights reserved.",
          seo: data.seo || {},
          favicon: data.seo?.favicon || (data as any).favicon || "/favicon.ico",
          marketing: data.marketing || {},
          notifications: data.marketing?.notifications || (data as any).notifications || {},
          customSchemas: (data.marketing?.customSchemas && Array.isArray(data.marketing.customSchemas))
            ? data.marketing.customSchemas
            : (Array.isArray((data as any).customSchemas) ? (data as any).customSchemas : []),
          navigation: data.marketing?.navigation || (data as any).navigation || {}
        };
      }
    } catch (e) {
      console.warn("Supabase fetch failed for settings", e);
    }
  }

  // Client-side local override
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("adm_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed as SiteSettings;
      }
    } catch {}
  }

  return {} as SiteSettings;
}

/**
 * Clinic Services — Authoritatively fetched directly from Supabase
 */
export async function getServices(): Promise<Service[]> {
  const deletedSlugs = await getDeletedSlugsSet();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data
          .filter((d: any) => !deletedSlugs.has(d.slug))
          .map((d: any) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            shortDescription: d.short_description || "",
            description: d.description || "",
            heroImage: d.hero_image,
            heroImageAlt: d.hero_image_alt || d.seo?.heroImageAlt || "",
            sideImage: d.side_image,
            sideImageAlt: d.side_image_alt || d.seo?.sideImageAlt || "",
            cardImage: d.card_image || d.cardImage || d.seo?.cardImage || null,
            cardImageAlt: d.card_image_alt || d.seo?.cardImageAlt || "",
            iconType: d.icon_type,
            iconBg: d.icon_bg,
            iconColor: d.icon_color,
            ctaText: d.cta_text,
            ctaMuted: d.cta_muted,
            benefits: d.benefits || [],
            symptoms: d.symptoms || [],
            treatmentApproach: d.treatment_approach || [],
            customSections: d.custom_sections || [],
            sectionsData: d.sections_data || d.seo?.sectionsData || {},
            faqs: d.faqs || [],
            hiddenSections: d.hidden_sections || [],
            sectionOrder: d.section_order || [],
            relatedServices: d.related_services || [],
            relatedConditions: d.related_conditions || [],
            teamMembers: d.team_members || [],
            locations: d.locations || [],
            testimonials: d.testimonials || [],
            parentSlug: d.parent_slug || d.seo?.parentSlug || undefined,
            seo: d.seo || {}
          }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for services", e);
    }
  }

  // Client-side fetch from /api/content
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/content?type=services", { cache: "no-store" });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) return list.filter((s: Service) => !deletedSlugs.has(s.slug));
      }
    } catch {}
  }

  return [];
}

export async function getServiceBySlug(slugInput: string | string[]): Promise<Service | undefined> {
  const fullSlug = Array.isArray(slugInput) ? slugInput.join("/") : slugInput;
  const leafSlug = Array.isArray(slugInput) ? slugInput[slugInput.length - 1] : slugInput;
  const deletedSlugs = await getDeletedSlugsSet();
  if (deletedSlugs.has(fullSlug) || deletedSlugs.has(leafSlug)) return undefined;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = await supabase
        .from("services")
        .select("*")
        .eq("slug", fullSlug)
        .eq("is_published", true)
        .maybeSingle();

      if (!query.data && fullSlug !== leafSlug) {
        query = await supabase
          .from("services")
          .select("*")
          .eq("slug", leafSlug)
          .eq("is_published", true)
          .maybeSingle();
      }

      const { data, error } = query;
      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug,
          parentSlug: data.parent_slug || data.seo?.parentSlug || undefined,
          title: data.title,
          shortDescription: data.short_description || "",
          description: data.description || "",
          heroImage: data.hero_image,
          heroImageAlt: data.hero_image_alt || data.seo?.heroImageAlt || "",
          sideImage: data.side_image,
          sideImageAlt: data.side_image_alt || data.seo?.sideImageAlt || "",
          cardImage: data.card_image || data.cardImage || data.seo?.cardImage || null,
          cardImageAlt: data.card_image_alt || data.seo?.cardImageAlt || "",
          iconType: data.icon_type,
          iconBg: data.icon_bg,
          iconColor: data.icon_color,
          ctaText: data.cta_text,
          ctaMuted: data.cta_muted ?? false,
          benefits: data.benefits || [],
          symptoms: data.symptoms || [],
          treatmentApproach: data.treatment_approach || [],
          customSections: data.custom_sections || [],
          sectionsData: data.sections_data || data.seo?.sectionsData || {},
          faqs: data.faqs || [],
          hiddenSections: data.hidden_sections || [],
          sectionOrder: data.section_order || [],
          relatedServices: data.related_services || [],
          relatedConditions: data.related_conditions || [],
          teamMembers: data.team_members || [],
          locations: data.locations || [],
          testimonials: data.testimonials || [],
          seo: data.seo || {}
        };
      }
    } catch (e) {
      console.warn(`Supabase fetch failed for service ${fullSlug}`, e);
    }
  }

  return undefined;
}

export async function getSubServices(parentSlug: string): Promise<Service[]> {
  const all = await getServices();
  return all.filter((s) => s.parentSlug === parentSlug);
}

/**
 * Conditions We Treat — Authoritatively fetched directly from Supabase
 */
export async function getConditions(): Promise<Condition[]> {
  const deletedSlugs = await getDeletedSlugsSet();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("conditions")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (!error && data && data.length > 0) {
        return data
          .filter((d: any) => !deletedSlugs.has(d.slug))
          .map((d: any) => ({
            id: d.id,
            slug: d.slug,
            name: d.name,
            shortDescription: d.short_description || "",
            description: d.description || "",
            heroImage: d.hero_image,
            heroImageAlt: d.hero_image_alt || d.seo?.heroImageAlt || "",
            sideImage: d.side_image,
            sideImageAlt: d.side_image_alt || d.seo?.sideImageAlt || "",
            cardImage: d.card_image || d.cardImage || d.seo?.cardImage || null,
            cardImageAlt: d.card_image_alt || d.seo?.cardImageAlt || "",
            ctaText: d.cta_text,
            ctaMuted: d.cta_muted,
            benefits: d.benefits || [],
            symptoms: d.symptoms || [],
            treatmentApproach: d.treatment_approach || [],
            customSections: d.custom_sections || [],
            sectionsData: d.sections_data || d.seo?.sectionsData || {},
            faqs: d.faqs || [],
            hiddenSections: d.hidden_sections || [],
            sectionOrder: d.section_order || [],
            relatedServices: d.related_services || [],
            category: d.category || "general",
            iconType: d.icon_type,
            iconBg: d.icon_bg,
            iconColor: d.icon_color,
            parentSlug: d.parent_slug || d.seo?.parentSlug || undefined,
            seo: d.seo || {}
          }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for conditions", e);
    }
  }

  // Client-side fetch from /api/content
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/content?type=conditions", { cache: "no-store" });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) return list.filter((c: Condition) => !deletedSlugs.has(c.slug));
      }
    } catch {}
  }

  return [];
}

export async function getConditionBySlug(slugInput: string | string[]): Promise<Condition | undefined> {
  const fullSlug = Array.isArray(slugInput) ? slugInput.join("/") : slugInput;
  const leafSlug = Array.isArray(slugInput) ? slugInput[slugInput.length - 1] : slugInput;
  const deletedSlugs = await getDeletedSlugsSet();
  if (deletedSlugs.has(fullSlug) || deletedSlugs.has(leafSlug)) return undefined;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = await supabase
        .from("conditions")
        .select("*")
        .eq("slug", fullSlug)
        .eq("is_published", true)
        .maybeSingle();

      if (!query.data && fullSlug !== leafSlug) {
        query = await supabase
          .from("conditions")
          .select("*")
          .eq("slug", leafSlug)
          .eq("is_published", true)
          .maybeSingle();
      }

      const { data, error } = query;
      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug,
          parentSlug: data.parent_slug || data.seo?.parentSlug || undefined,
          name: data.name,
          shortDescription: data.short_description || "",
          description: data.description || "",
          heroImage: data.hero_image,
          heroImageAlt: data.hero_image_alt || data.seo?.heroImageAlt || "",
          sideImage: data.side_image,
          sideImageAlt: data.side_image_alt || data.seo?.sideImageAlt || "",
          cardImage: data.card_image || data.cardImage || data.seo?.cardImage || null,
          cardImageAlt: data.card_image_alt || data.seo?.cardImageAlt || "",
          ctaText: data.cta_text,
          ctaMuted: data.cta_muted ?? false,
          benefits: data.benefits || [],
          symptoms: data.symptoms || [],
          treatmentApproach: data.treatment_approach || [],
          customSections: data.custom_sections || [],
          sectionsData: data.sections_data || data.seo?.sectionsData || {},
          faqs: data.faqs || [],
          hiddenSections: data.hidden_sections || [],
          sectionOrder: data.section_order || [],
          relatedServices: data.related_services || [],
          category: data.category || "general",
          iconType: data.icon_type,
          iconBg: data.icon_bg,
          iconColor: data.icon_color,
          seo: data.seo || {}
        };
      }
    } catch (e) {
      console.warn(`Supabase fetch failed for condition ${fullSlug}`, e);
    }
  }

  return undefined;
}

export async function getSubConditions(parentSlug: string): Promise<Condition[]> {
  const all = await getConditions();
  return all.filter((c) => c.parentSlug === parentSlug);
}

/**
 * Reviews & Testimonials — Authoritatively fetched directly from Supabase
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
      console.warn("Supabase fetch failed for testimonials", e);
    }
  }
  return [];
}

export async function getTestimonialById(id: string): Promise<Testimonial | undefined> {
  const testimonials = await getTestimonials();
  return testimonials.find((t) => t.id === id);
}

/**
 * Team Members & Practitioners — Authoritatively fetched directly from Supabase
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
          profileImageAlt: d.profile_image_alt || d.seo?.profileImageAlt || d.social_links?.profileImageAlt || "",
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
          bookingCtaText: d.social_links?.bookingCtaText || null,
          socialLinks: d.social_links || {},
          featured: d.featured,
          isDirector: d.is_director,
          order: d.sort_order,
          seo: d.seo || {}
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch failed for team members", e);
    }
  }
  return [];
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | undefined> {
  const members = await getTeamMembers();
  return members.find((t) => t.slug === slug);
}

/**
 * Blog Posts — Authoritatively fetched directly from Supabase
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
          featuredImageAlt: d.featured_image_alt || d.seo?.featuredImageAlt || "",
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
      console.warn("Supabase fetch failed for blog posts", e);
    }
  }
  return [];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((b) => b.slug === slug);
}

/**
 * Clinic Locations — Authoritatively fetched directly from Supabase
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
      console.warn("Supabase fetch failed for locations", e);
    }
  }
  return [];
}

export async function getLocationBySlug(slug: string): Promise<Location | undefined> {
  const locs = await getLocations();
  return locs.find((l) => l.slug === slug);
}

/**
 * Homepage Structured Content — Loaded authoritatively from Supabase site_settings.marketing.home_page_content
 */
export async function getHomeContent(): Promise<HomePageData> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: stRow, error } = await supabase
        .from("site_settings")
        .select("marketing")
        .eq("id", "main")
        .single();
      if (!error && stRow?.marketing?.home_page_content && Object.keys(stRow.marketing.home_page_content).length > 0) {
        return stRow.marketing.home_page_content as HomePageData;
      }
    } catch (e) {
      console.warn("Supabase fetch failed for home_page_content", e);
    }
  }

  // Client-side local override
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("adm_home");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return parsed as HomePageData;
        }
      }
    } catch {}
  }

  return {} as HomePageData;
}
