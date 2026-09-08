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
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

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
                seo: {
                  ...(s.seo || {}),
                  cardImage: s.cardImage || s.card_image || null,
                  sectionsData: s.sectionsData || {},
                  heroImageAlt: s.heroImageAlt || s.hero_image_alt || s.seo?.heroImageAlt || "",
                  sideImageAlt: s.sideImageAlt || s.side_image_alt || s.seo?.sideImageAlt || "",
                  cardImageAlt: s.cardImageAlt || s.card_image_alt || s.seo?.cardImageAlt || ""
                },
                is_published: s.is_published !== false,
                updated_at: new Date().toISOString()
              }));
              await supabase.from("services").upsert(sRows, { onConflict: "slug" });
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
                fs.writeFileSync(teamFilePath, JSON.stringify(cleanedTeam, null, 2), "utf-8");
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
            console.warn("Team cleanup warning for deleted service:", cleanErr);
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
              // Delete any conditions from Supabase that are not in current data
              const { data: supaConditions } = await supabase.from("conditions").select("id, slug");
              if (supaConditions) {
                const toDelete = supaConditions.filter((c: any) => !currentSlugs.includes(c.slug));
                for (const d of toDelete) {
                  await supabase.from("conditions").delete().eq("slug", d.slug);
                  await supabase.from("conditions").delete().eq("id", d.id);
                }
              }

              // Upsert published condition records to Supabase
              const rows = data.map((c: any, index: number) => ({
                id: c.id || `cond-${c.slug}`,
                slug: c.slug,
                name: c.name,
                category: c.category || "general",
                short_description: c.shortDescription || c.short_description || null,
                description: c.description || "",
                benefits: c.benefits || [],
                symptoms: c.symptoms || [],
                treatment_approach: c.treatmentApproach || c.treatment_approach || [],
                custom_sections: c.customSections || c.custom_sections || [],
                faqs: c.faqs || [],
                hidden_sections: c.hiddenSections || c.hidden_sections || [],
                section_order: c.sectionOrder || c.section_order || [],
                related_services: c.relatedServices || c.related_services || [],
                hero_image: c.heroImage || c.hero_image || null,
                side_image: c.sideImage || c.side_image || null,
                cta_text: c.ctaText || c.cta_text || "Book Assessment Online",
                cta_muted: c.ctaMuted ?? c.cta_muted ?? false,
                sort_order: typeof c.sort_order === "number" ? c.sort_order : (typeof c.order === "number" ? c.order : index),
                seo: {
                  ...(c.seo || {}),
                  cardImage: c.cardImage || c.card_image || null,
                  sectionsData: c.sectionsData || {},
                  heroImageAlt: c.heroImageAlt || c.hero_image_alt || c.seo?.heroImageAlt || "",
                  sideImageAlt: c.sideImageAlt || c.side_image_alt || c.seo?.sideImageAlt || "",
                  cardImageAlt: c.cardImageAlt || c.card_image_alt || c.seo?.cardImageAlt || ""
                },
                is_published: c.is_published !== false,
                updated_at: new Date().toISOString()
              }));
              const { error: upsertErr } = await supabase.from("conditions").upsert(rows, { onConflict: "slug" });
              if (upsertErr) {
                console.error("Backend Supabase conditions upsert error:", upsertErr);
              }
            }
          } catch (supaErr) {
            console.warn("Backend Supabase conditions sync warning:", supaErr);
          }
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

      // Instant cache purge across all affected routes
      try {
        if (type === "team") {
          revalidatePath("/team");
          revalidatePath("/team/[slug]", "page");
          revalidatePath("/", "layout");
        } else if (type === "services") {
          revalidatePath("/services");
          revalidatePath("/services/[slug]", "page");
          if (deletedSlug) {
            revalidatePath(`/services/${deletedSlug}`);
          }
          revalidatePath("/team");
          revalidatePath("/team/[slug]", "page");
          revalidatePath("/", "layout");
        } else if (type === "conditions") {
          revalidatePath("/conditions");
          revalidatePath("/conditions/[slug]", "page");
          if (deletedSlug) {
            revalidatePath(`/conditions/${deletedSlug}`);
          }
          revalidatePath("/", "layout");
        } else if (type === "locations") {
          revalidatePath("/locations");
          revalidatePath("/locations/[slug]", "page");
          revalidatePath("/", "layout");
        } else {
          revalidatePath("/", "layout");
        }
      } catch (e) {
        console.warn("revalidatePath warning:", e);
      }

      return NextResponse.json({ success: true, message: `Updated ${type}.json successfully` });
    }

    return NextResponse.json({ error: `File src/data/${type}.json not found` }, { status: 404 });
  } catch (err: any) {
    console.error("API save-content error:", err);
    return NextResponse.json({ error: err.message || "Failed to save content" }, { status: 500 });
  }
}
