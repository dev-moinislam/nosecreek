import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // e.g. 'services' | 'conditions' | 'team' | 'locations' | 'settings'

    // Fetch deleted slugs
    const deletedSlugs = new Set<string>();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: stRow } = await supabase
          .from("site_settings")
          .select("marketing")
          .eq("id", "main")
          .maybeSingle();
        const delList = stRow?.marketing?.deleted_slugs;
        if (Array.isArray(delList)) {
          delList.forEach((s: string) => deletedSlugs.add(s));
        }
      } catch {}
    }

    if (type === "settings") {
      if (isSupabaseConfigured && supabase) {
        const { data: supaSettings, error } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "main")
          .maybeSingle();

        if (!error && supaSettings) {
          const effectiveNav = supaSettings.marketing?.navigation || supaSettings.navigation || {};

          // SECURITY SANITIZATION: Strip private credentials and secrets before returning public settings
          const safeMarketing = { ...(supaSettings.marketing || {}) };
          delete safeMarketing.auth_credentials;

          const rawNotifs = supaSettings.marketing?.notifications || supaSettings.notifications || {};
          const safeNotifications = {
            enabled: Boolean(rawNotifs.enabled),
            provider: rawNotifs.provider || "smtp",
            receiverEmail: rawNotifs.receiverEmail || "info@nosecreekphysiotherapy.com",
            senderName: rawNotifs.senderName || "Nose Creek Physiotherapy",
            senderEmail: rawNotifs.senderEmail || "",
            subjectPrefix: rawNotifs.subjectPrefix || "[New Website Lead]",
            autoReply: rawNotifs.autoReply || { enabled: false },
            hasSmtpPass: Boolean(rawNotifs.smtpPass),
            hasResendApiKey: Boolean(rawNotifs.resendApiKey)
          };
          safeMarketing.notifications = safeNotifications;

          return NextResponse.json({
            clinicName: supaSettings.clinic_name,
            logoText: supaSettings.logo_text,
            contact: supaSettings.contact || {},
            openingHours: supaSettings.opening_hours || {},
            socialLinks: supaSettings.social_links || {},
            bookingUrl: supaSettings.booking_url,
            primaryCTA: supaSettings.primary_cta,
            footerContent: supaSettings.footer_content,
            seo: supaSettings.seo || {},
            favicon: supaSettings.seo?.favicon || supaSettings.favicon || "/favicon.ico",
            marketing: safeMarketing,
            customSchemas: supaSettings.marketing?.customSchemas || supaSettings.customSchemas || [],
            notifications: safeNotifications,
            navigation: effectiveNav
          });
        }
      }
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    if (type === "services") {
      if (isSupabaseConfigured && supabase) {
        const { data: supaServices, error } = await supabase
          .from("services")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (!error && supaServices) {
          const list = supaServices
            .filter((s: any) => !deletedSlugs.has(s.slug))
            .map((s: any) => ({
              id: s.id,
              slug: s.slug,
              title: s.title,
              shortDescription: s.short_description || "",
              description: s.description || "",
              heroImage: s.hero_image || null,
              heroImageAlt: s.hero_image_alt || s.seo?.heroImageAlt || "",
              sideImage: s.side_image || null,
              sideImageAlt: s.side_image_alt || s.seo?.sideImageAlt || "",
              cardImage: s.card_image || s.cardImage || s.seo?.cardImage || null,
              cardImageAlt: s.card_image_alt || s.seo?.cardImageAlt || "",
              iconType: s.icon_type || "stethoscope",
              iconBg: s.icon_bg || "#e9f5fb",
              iconColor: s.icon_color || "#1c9fd8",
              ctaText: s.cta_text || "Book Online",
              ctaMuted: s.cta_muted ?? false,
              benefits: s.benefits || [],
              symptoms: s.symptoms || [],
              treatmentApproach: s.treatment_approach || [],
              customSections: s.custom_sections || [],
              sectionsData: s.sections_data || s.seo?.sectionsData || {},
              faqs: s.faqs || [],
              hiddenSections: s.hidden_sections || [],
              sectionOrder: s.section_order || [],
              relatedServices: s.related_services || [],
              relatedConditions: s.related_conditions || [],
              teamMembers: s.team_members || [],
              locations: s.locations || [],
              testimonials: s.testimonials || [],
              parentSlug: s.parent_slug || s.seo?.parentSlug || undefined,
              seo: s.seo || {}
            }));
          return NextResponse.json(list);
        }
      }
      return NextResponse.json([]);
    }

    if (type === "conditions") {
      if (isSupabaseConfigured && supabase) {
        const { data: supaConditions, error } = await supabase
          .from("conditions")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (!error && supaConditions) {
          const list = supaConditions
            .filter((c: any) => !deletedSlugs.has(c.slug))
            .map((c: any) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              shortDescription: c.short_description || "",
              description: c.description || "",
              heroImage: c.hero_image || null,
              heroImageAlt: c.hero_image_alt || c.seo?.heroImageAlt || "",
              sideImage: c.side_image || null,
              cardImage: c.card_image || c.cardImage || c.seo?.cardImage || null,
              cardImageAlt: c.card_image_alt || c.seo?.cardImageAlt || "",
              iconType: c.icon_type || "activity",
              iconBg: c.icon_bg || "#f2f8fb",
              iconColor: c.icon_color || "#0e78a8",
              ctaText: c.cta_text || "Book Online",
              ctaMuted: c.cta_muted ?? false,
              benefits: c.benefits || [],
              symptoms: c.symptoms || [],
              treatmentApproach: c.treatment_approach || [],
              customSections: c.custom_sections || [],
              sectionsData: c.sections_data || c.seo?.sectionsData || {},
              faqs: c.faqs || [],
              hiddenSections: c.hidden_sections || [],
              sectionOrder: c.section_order || [],
              relatedServices: c.related_services || [],
              category: c.category || "general",
              parentSlug: c.parent_slug || c.seo?.parentSlug || undefined,
              seo: c.seo || {}
            }));
          return NextResponse.json(list);
        }
      }
      return NextResponse.json([]);
    }

    if (type === "team" && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("team_members").select("*").eq("is_published", true).order("sort_order");
      return NextResponse.json(!error && data ? data : []);
    }

    if (type === "locations" && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("locations").select("*").eq("is_published", true);
      return NextResponse.json(!error && data ? data : []);
    }

    if (type === "blog" && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false });
      return NextResponse.json(!error && data ? data : []);
    }

    return NextResponse.json({ error: `Unknown type ${type}` }, { status: 400 });
  } catch (err: any) {
    console.error("API /api/content error:", err);
    return NextResponse.json({ error: err.message || "Failed to load content" }, { status: 500 });
  }
}
