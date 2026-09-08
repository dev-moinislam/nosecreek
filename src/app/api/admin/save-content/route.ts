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
            }
          } catch (supaErr) {
            console.warn("Backend Supabase services delete sync warning:", supaErr);
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
              bookingCtaText: member.bookingCtaText || null
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
