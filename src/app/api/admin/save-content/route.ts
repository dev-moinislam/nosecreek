import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, deletedSlug } = body; // type: 'services' | 'conditions' | 'team' | 'locations' | 'settings'

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), `src/data/${type}.json`);
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (fsErr: any) {
      // EROFS (Read-only filesystem) is standard on serverless hosts like Vercel/AWS Lambda.
      // We catch this error safely so the request does not fail and database persistence continues!
      console.warn(`[save-content] Local file write skipped on read-only system (${fsErr.code || fsErr.message}). Persisting to database.`);
    }

    // Backend Supabase sync for services data & cleanup
    if (type === "services") {
      if (isSupabaseConfigured && supabase) {
        try {
          if (deletedSlug) {
            await supabase.from("services").delete().eq("slug", deletedSlug);
            await supabase.from("services").delete().eq("id", deletedSlug);
          }
          // Delete any services from Supabase that are not in the current remaining data
          if (Array.isArray(data)) {
            const currentSlugs = data.map((s: any) => s.slug);
            const { data: supaServices } = await supabase.from("services").select("id, slug");
            if (supaServices) {
              const toDelete = supaServices.filter((s: any) => !currentSlugs.includes(s.slug));
              for (const d of toDelete) {
                await supabase.from("services").delete().eq("slug", d.slug);
                await supabase.from("services").delete().eq("id", d.id);
              }
            }

            // Upsert published services to Supabase
            const sRows = data.map((s: any, index: number) => ({
              id: s.id || `srv-${s.slug}`,
              slug: s.slug,
              title: s.title,
              short_description: s.shortDescription || s.short_description || null,
              description: s.description || "",
              hero_image: s.heroImage || s.hero_image || null,
              side_image: s.sideImage || s.side_image || null,
              icon_type: s.iconType || s.icon_type || "stethoscope",
              icon_bg: s.iconBg || s.icon_bg || "#e9f5fb",
              icon_color: s.iconColor || s.icon_color || "#1c9fd8",
              cta_text: s.ctaText || s.cta_text || "Book Online",
              cta_muted: s.ctaMuted ?? s.cta_muted ?? false,
              benefits: s.benefits || [],
              symptoms: s.symptoms || [],
              treatment_approach: s.treatmentApproach || s.treatment_approach || [],
              custom_sections: s.customSections || s.custom_sections || [],
              sections_data: s.sectionsData || s.sections_data || {},
              faqs: s.faqs || [],
              hidden_sections: s.hiddenSections || s.hidden_sections || [],
              section_order: s.sectionOrder || s.section_order || [],
              related_services: s.relatedServices || s.related_services || [],
              related_conditions: s.relatedConditions || s.related_conditions || [],
              team_members: s.teamMembers || s.team_members || [],
              locations: s.locations || s.locations || [],
              testimonials: s.testimonials || s.testimonials || [],
              sort_order: typeof s.sort_order === "number" ? s.sort_order : (typeof s.order === "number" ? s.order : index),
              parent_slug: s.parentSlug || s.parent_slug || null,
              seo: {
                ...(s.seo || {}),
                parentSlug: s.parentSlug || s.parent_slug || null,
                cardImage: s.cardImage || s.card_image || null,
                sectionsData: s.sectionsData || {},
                heroImageAlt: s.heroImageAlt || s.hero_image_alt || s.seo?.heroImageAlt || "",
                sideImageAlt: s.sideImageAlt || s.side_image_alt || s.seo?.sideImageAlt || "",
                cardImageAlt: s.cardImageAlt || s.card_image_alt || s.seo?.cardImageAlt || ""
              },
              is_published: s.is_published !== false,
              updated_at: new Date().toISOString()
            }));
            let { error: sUpsertErr } = await supabase.from("services").upsert(sRows, { onConflict: "slug" });
            if (sUpsertErr && (sUpsertErr.code === "PGRST204" || JSON.stringify(sUpsertErr).includes("parent_slug"))) {
              console.warn("Retrying services upsert without parent_slug column (preserved in seo.parentSlug)...");
              const fallbackRows = sRows.map((r: any) => {
                const copy = { ...r };
                delete copy.parent_slug;
                return copy;
              });
              const { error: retryErr } = await supabase.from("services").upsert(fallbackRows, { onConflict: "slug" });
              if (retryErr) console.error("Services retry upsert error:", retryErr);
            } else if (sUpsertErr) {
              console.error("Backend Supabase services upsert error:", sUpsertErr);
            }
          }
        } catch (supaErr) {
          console.warn("Backend Supabase services sync warning:", supaErr);
        }
      }

      // Clean up deleted service references from team members in team.json & Supabase
      if (deletedSlug) {
        try {
          const teamFilePath = path.resolve(process.cwd(), "src/data/team.json");
          if (fs.existsSync(teamFilePath)) {
            const teamData = JSON.parse(fs.readFileSync(teamFilePath, "utf-8"));
            let teamChanged = false;
            const cleanedTeam = teamData.map((m: any) => {
              if (Array.isArray(m.services) && (m.services.includes(deletedSlug) || m.services.includes(`srv-${deletedSlug}`))) {
                teamChanged = true;
                return {
                  ...m,
                  services: m.services.filter((s: string) => s !== deletedSlug && s !== `srv-${deletedSlug}`)
                };
              }
              return m;
            });
            if (teamChanged) {
              try {
                fs.writeFileSync(teamFilePath, JSON.stringify(cleanedTeam, null, 2), "utf-8");
              } catch (tErr: any) {
                console.warn("[save-content] team.json write skipped on read-only system.");
              }
            }
          }

          if (isSupabaseConfigured && supabase) {
            const { data: supaMembers } = await supabase.from("team_members").select("id, slug, services");
            if (supaMembers) {
              for (const m of supaMembers) {
                if (Array.isArray(m.services) && (m.services.includes(deletedSlug) || m.services.includes(`srv-${deletedSlug}`))) {
                  const cleaned = m.services.filter((s: string) => s !== deletedSlug && s !== `srv-${deletedSlug}`);
                  await supabase.from("team_members").update({ services: cleaned }).eq("slug", m.slug);
                }
              }
            }
          }
        } catch (cleanErr) {
          console.warn("Error cleaning up service references in team:", cleanErr);
        }
      }
    }

    // Backend Supabase sync for conditions data & cleanup
    if (type === "conditions") {
      if (isSupabaseConfigured && supabase) {
        try {
          if (deletedSlug) {
            await supabase.from("conditions").delete().eq("slug", deletedSlug);
            await supabase.from("conditions").delete().eq("id", deletedSlug);
          }
          if (Array.isArray(data)) {
            const currentSlugs = data.map((c: any) => c.slug);
            const { data: supaConditions } = await supabase.from("conditions").select("id, slug");
            if (supaConditions) {
              const toDelete = supaConditions.filter((c: any) => !currentSlugs.includes(c.slug));
              for (const d of toDelete) {
                await supabase.from("conditions").delete().eq("slug", d.slug);
                await supabase.from("conditions").delete().eq("id", d.id);
              }
            }

            const rows = data.map((c: any, index: number) => ({
              id: c.id || `cnd-${c.slug}`,
              slug: c.slug,
              name: c.name,
              short_description: c.shortDescription || c.short_description || null,
              description: c.description || "",
              hero_image: c.heroImage || c.hero_image || null,
              side_image: c.sideImage || c.side_image || null,
              card_image: c.cardImage || c.card_image || null,
              icon_type: c.iconType || c.icon_type || "activity",
              icon_bg: c.iconBg || c.icon_bg || "#f2f8fb",
              icon_color: c.iconColor || c.icon_color || "#0e78a8",
              cta_text: c.ctaText || c.cta_text || "Book Online",
              cta_muted: c.ctaMuted ?? c.cta_muted ?? false,
              benefits: c.benefits || [],
              symptoms: c.symptoms || [],
              treatment_approach: c.treatmentApproach || c.treatment_approach || [],
              custom_sections: c.customSections || c.custom_sections || [],
              sections_data: c.sectionsData || c.sections_data || {},
              faqs: c.faqs || [],
              hidden_sections: c.hiddenSections || c.hidden_sections || [],
              section_order: c.sectionOrder || c.section_order || [],
              related_services: c.relatedServices || c.related_services || [],
              testimonials: c.testimonials || [],
              category: c.category || "general",
              sort_order: typeof c.sort_order === "number" ? c.sort_order : (typeof c.order === "number" ? c.order : index),
              parent_slug: c.parentSlug || c.parent_slug || null,
              seo: {
                ...(c.seo || {}),
                parentSlug: c.parentSlug || c.parent_slug || null,
                cardImage: c.cardImage || c.card_image || null,
                sectionsData: c.sectionsData || {},
                heroImageAlt: c.heroImageAlt || c.hero_image_alt || c.seo?.heroImageAlt || "",
                sideImageAlt: c.sideImageAlt || c.side_image_alt || c.seo?.sideImageAlt || "",
                cardImageAlt: c.cardImageAlt || c.card_image_alt || c.seo?.cardImageAlt || ""
              },
              is_published: c.is_published !== false,
              updated_at: new Date().toISOString()
            }));
            let { error: upsertErr } = await supabase.from("conditions").upsert(rows, { onConflict: "slug" });
            if (upsertErr && (upsertErr.code === "PGRST204" || JSON.stringify(upsertErr).includes("parent_slug"))) {
              console.warn("Retrying conditions upsert without parent_slug column (preserved in seo.parentSlug)...");
              const fallbackRows = rows.map((r: any) => {
                const copy = { ...r };
                delete copy.parent_slug;
                return copy;
              });
              const { error: retryErr } = await supabase.from("conditions").upsert(fallbackRows, { onConflict: "slug" });
              if (retryErr) console.error("Conditions retry upsert error:", retryErr);
            } else if (upsertErr) {
              console.error("Backend Supabase conditions upsert error:", upsertErr);
            }
          }
        } catch (supaErr) {
          console.warn("Backend Supabase conditions sync warning:", supaErr);
        }
      }
    }

    // Clean up deleted service/condition from navigation in settings.json and Supabase site_settings
    if (deletedSlug && (type === "services" || type === "conditions")) {
      try {
        const settingsFilePath = path.resolve(process.cwd(), "src/data/settings.json");
        let settingsData: any = null;
        if (fs.existsSync(settingsFilePath)) {
          settingsData = JSON.parse(fs.readFileSync(settingsFilePath, "utf-8"));
        }

        const filterNavItems = (items: any[]): any[] => {
          if (!Array.isArray(items)) return [];
          return items
            .filter((item) => {
              const idMatches = item.id === `srv-${deletedSlug}` || item.id === `cnd-${deletedSlug}`;
              const hrefMatches = item.href && (item.href === `/${type}/${deletedSlug}` || item.href.endsWith(`/${deletedSlug}`));
              return !idMatches && !hrefMatches;
            })
            .map((item) => ({
              ...item,
              children: item.children ? filterNavItems(item.children) : []
            }));
        };

        let settingsChanged = false;
        if (settingsData?.navigation) {
          if (Array.isArray(settingsData.navigation.header?.menu)) {
            settingsData.navigation.header.menu = filterNavItems(settingsData.navigation.header.menu);
            settingsChanged = true;
          }
          if (Array.isArray(settingsData.navigation.footer?.columns)) {
            settingsData.navigation.footer.columns = settingsData.navigation.footer.columns.map((col: any) => ({
              ...col,
              links: Array.isArray(col.links)
                ? col.links.filter((l: any) => !(l.href && (l.href === `/${type}/${deletedSlug}` || l.href.endsWith(`/${deletedSlug}`))))
                : []
            }));
            settingsChanged = true;
          }
        }

        if (settingsChanged) {
          try {
            fs.writeFileSync(settingsFilePath, JSON.stringify(settingsData, null, 2), "utf-8");
          } catch (sfErr) {
            console.warn("[save-content] settings.json write skipped on read-only system.");
          }

          if (isSupabaseConfigured && supabase) {
            try {
              const { data: cur } = await supabase.from("site_settings").select("marketing").eq("id", "main").maybeSingle();
              const updatedMarketing = {
                ...(cur?.marketing || {}),
                navigation: settingsData.navigation
              };
              await supabase
                .from("site_settings")
                .update({ marketing: updatedMarketing })
                .eq("id", "main");
            } catch (supaNavErr) {
              console.warn("Supabase navigation sync error on delete:", supaNavErr);
            }
          }
        }
      } catch (cleanNavErr) {
        console.warn("Error cleaning up navigation references on delete:", cleanNavErr);
      }
    }

    // Backend Supabase sync for team data
    if (type === "team" && isSupabaseConfigured && supabase && Array.isArray(data)) {
      try {
        const rows = data.map((member: any) => ({
          id: member.slug,
          slug: member.slug,
          name: member.name,
          role: member.role,
          title: member.title || null,
          short_bio: member.shortBio || null,
          full_bio: member.fullBio || null,
          profile_image: member.profileImage || null,
          specialties: member.specialties || [],
          credentials: member.credentials || [],
          education: member.education || [],
          certifications: member.certifications || [],
          experience: member.experience || null,
          locations: member.locations || [],
          services: member.services || [],
          languages: member.languages || [],
          email: member.email || null,
          phone: member.phone || null,
          booking_url: member.bookingUrl || null,
          social_links: {
            ...(member.socialLinks || {}),
            bookingCtaText: member.bookingCtaText || null,
            profileImageAlt: member.profileImageAlt || member.profile_image_alt || member.seo?.profileImageAlt || null
          },
          seo: {
            ...(member.seo || {}),
            profileImageAlt: member.profileImageAlt || member.profile_image_alt || member.seo?.profileImageAlt || ""
          },
          featured: member.featured || false,
          is_director: member.isDirector || false,
          sort_order: member.order || 99,
          is_published: true,
          updated_at: new Date().toISOString()
        }));
        await supabase.from("team_members").upsert(rows, { onConflict: "slug" });
      } catch (sErr) {
        console.warn("Backend Supabase sync warning:", sErr);
      }
    }

    // Backend Supabase sync for settings (including customSchemas & notifications)
    if (type === "settings" && isSupabaseConfigured && supabase) {
      try {
        const { data: curRow } = await supabase
          .from("site_settings")
          .select("*")
          .eq("id", "main")
          .maybeSingle();

        const existingMarketing = curRow?.marketing || {};
        const incomingMarketing = data.marketing || {};
        
        // CRITICAL: Respect deletions! If customSchemas was explicitly provided (even as []),
        // use it so deletion is saved!
        const customSchemas = Array.isArray(data.customSchemas)
          ? data.customSchemas
          : (Array.isArray(incomingMarketing.customSchemas)
              ? incomingMarketing.customSchemas
              : (existingMarketing.customSchemas || []));

        const notifications = data.notifications !== undefined
          ? data.notifications
          : (incomingMarketing.notifications !== undefined
              ? incomingMarketing.notifications
              : existingMarketing.notifications);

        const navigation = data.navigation !== undefined
          ? data.navigation
          : (incomingMarketing.navigation !== undefined
              ? incomingMarketing.navigation
              : existingMarketing.navigation);

        const mergedMarketing = {
          ...existingMarketing,
          ...incomingMarketing,
          customSchemas,
          notifications,
          navigation,
          auth_credentials: incomingMarketing.auth_credentials || existingMarketing.auth_credentials,
          theme_colors: incomingMarketing.theme_colors || existingMarketing.theme_colors
        };

        const upsertPayload: any = {
          id: "main",
          clinic_name: data.clinicName || curRow?.clinic_name || "Nose Creek Physiotherapy",
          logo_text: data.logoText || curRow?.logo_text || "Nose Creek Physiotherapy",
          contact: data.contact || curRow?.contact || {},
          opening_hours: data.openingHours || curRow?.opening_hours || {},
          social_links: data.socialLinks || curRow?.social_links || {},
          booking_url: data.bookingUrl || curRow?.booking_url || "#booking",
          primary_cta: data.primaryCTA || curRow?.primary_cta || "Book Online",
          footer_content: data.footerContent || curRow?.footer_content || "",
          seo: data.seo || curRow?.seo || {},
          marketing: mergedMarketing,
          updated_at: new Date().toISOString()
        };

        await supabase.from("site_settings").upsert(upsertPayload, { onConflict: "id" });
      } catch (sErr) {
        console.warn("Backend Supabase settings sync warning:", sErr);
      }
    }

    // Instant cache purge across all affected routes
    try {
      if (type === "team") {
        revalidatePath("/team");
        revalidatePath("/team/[slug]", "page");
        revalidatePath("/", "layout");
      } else if (type === "services") {
        revalidatePath("/services");
        revalidatePath("/services/[slug]", "page");
        revalidatePath("/services/[...slug]", "page");
        if (deletedSlug) {
          revalidatePath(`/services/${deletedSlug}`);
        }
        revalidatePath("/team");
        revalidatePath("/team/[slug]", "page");
        revalidatePath("/", "layout");
      } else if (type === "conditions") {
        revalidatePath("/conditions");
        revalidatePath("/conditions/[slug]", "page");
        revalidatePath("/conditions/[...slug]", "page");
        if (deletedSlug) {
          revalidatePath(`/conditions/${deletedSlug}`);
        }
        revalidatePath("/", "layout");
      } else if (type === "locations") {
        revalidatePath("/locations");
        revalidatePath("/locations/[slug]", "page");
        revalidatePath("/", "layout");
      } else if (type === "settings") {
        revalidatePath("/", "layout");
        revalidatePath("/");
        revalidatePath("/about");
        revalidatePath("/about/[...slug]", "page");
        revalidatePath("/contact");
        revalidatePath("/services");
        revalidatePath("/conditions");
      } else {
        revalidatePath("/", "layout");
      }
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({ success: true, message: `Updated ${type} successfully` });
  } catch (err: any) {
    console.error("API save-content error:", err);
    return NextResponse.json({ error: err.message || "Failed to save content" }, { status: 500 });
  }
}
